"use client"

import { ArrowLeft, Bell, BellOff, Eye } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { OrderLinesAccordion } from "@/components/orders/order-lines-accordion"
import { ApiError } from "@/lib/api/client"
import {
  acceptTenantOrder,
  advanceLabel,
  advanceTenantOrder,
  formatElapsed,
  FULFILLMENT_LABEL,
  getTenantOrder,
  kdsColumnForOrder,
  listTenantOrders,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  rejectTenantOrder,
  type KdsColumnId,
  type ManageOrderDetail,
  type ManageOrderListItem,
} from "@/lib/api/orders"
import { resolveTenantFromPath, withTenantPrefix } from "@/lib/auth/tenant-host"
import { formatCurrencyBRL } from "@/lib/format/currency"
import { useCurrentStore } from "@/lib/store/current-store-context"
import { cn } from "@/lib/utils"

const COLUMNS: { id: KdsColumnId; title: string }[] = [
  { id: "pending", title: "Pendentes" },
  { id: "preparing", title: "Preparando" },
  { id: "sending", title: "Enviando" },
  { id: "done", title: "Concluído" },
]

function playAlertBeep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 880
    gain.gain.value = 0.08
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.stop(ctx.currentTime + 0.4)
    window.setTimeout(() => void ctx.close(), 500)
  } catch {
    // ignore
  }
}

function addressLine(order: ManageOrderListItem | ManageOrderDetail) {
  if ("addressStreet" in order && order.fulfillment === "Delivery") {
    const d = order as ManageOrderDetail
    return [d.addressStreet, d.addressNumber, d.addressNeighborhood]
      .filter(Boolean)
      .join(", ")
  }
  if (order.fulfillment === "Pickup") return "Retirada no balcão"
  return FULFILLMENT_LABEL[order.fulfillment] ?? order.fulfillment
}

function primaryActionLabel(order: ManageOrderListItem): string | null {
  if (order.status === "AwaitingAcceptance") return "Aceitar pedido"
  if (order.status === "Ready" && order.fulfillment === "Delivery")
    return "Enviar pedido"
  if (
    order.status === "OutForDelivery" ||
    (order.status === "Ready" && order.fulfillment === "Pickup")
  )
    return "Finalizar pedido"
  return advanceLabel(order.status, order.fulfillment)
}

export default function KdsPage() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { data: store } = useCurrentStore()
  const access = session?.accessToken
  const tenantId = store?.identifier
  const pathTenant = resolveTenantFromPath(pathname)

  const [orders, setOrders] = useState<ManageOrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ManageOrderDetail | null>(null)
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [, setTick] = useState(0)

  const knownIdsRef = useRef<Set<string>>(new Set())
  const hydratedRef = useRef(false)

  const refresh = useCallback(async () => {
    if (!access || !tenantId) {
      setOrders([])
      setLoading(false)
      return
    }
    try {
      const list = await listTenantOrders({ take: 100 }, access, tenantId)
      const operational = list.filter(
        (o) =>
          o.status !== "PendingPayment" &&
          o.status !== "Cancelled" &&
          o.status !== "Paid"
      )
      setOrders(operational)

      if (!hydratedRef.current) {
        knownIdsRef.current = new Set(operational.map((o) => o.id))
        hydratedRef.current = true
      } else {
        const fresh = operational.filter(
          (o) =>
            o.status === "AwaitingAcceptance" && !knownIdsRef.current.has(o.id)
        )
        for (const order of fresh) {
          knownIdsRef.current.add(order.id)
          playAlertBeep()
          toast.message(`Novo pedido ${order.publicNumber}`, {
            description: `${order.customerName} · ${formatCurrencyBRL(order.total)}`,
          })
          if (
            notifyEnabled &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`Novo pedido ${order.publicNumber}`, {
                body: `${order.customerName} · ${formatCurrencyBRL(order.total)}`,
              })
            } catch {
              // ignore
            }
          }
        }
        for (const o of operational) knownIdsRef.current.add(o.id)
      }
    } catch (err) {
      if (!hydratedRef.current) {
        toast.error(
          err instanceof ApiError ? err.message : "Falha ao carregar cozinha."
        )
      }
    } finally {
      setLoading(false)
    }
  }, [access, tenantId, notifyEnabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!access || !tenantId) return
    const timer = window.setInterval(() => void refresh(), 4000)
    return () => window.clearInterval(timer)
  }, [access, tenantId, refresh])

  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!selectedId || !access || !tenantId) {
      setDetail(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await getTenantOrder(selectedId, access, tenantId)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof ApiError ? err.message : "Falha ao carregar pedido."
          )
          setSelectedId(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId, access, tenantId])

  const byColumn = useMemo(() => {
    const map: Record<KdsColumnId, ManageOrderListItem[]> = {
      pending: [],
      preparing: [],
      sending: [],
      done: [],
    }
    for (const order of orders) {
      const col = kdsColumnForOrder(order)
      if (!col) continue
      if (col === "done") {
        // keep only recent completed in board
        const ageMs = Date.now() - new Date(order.updatedAtUtc).getTime()
        if (ageMs > 1000 * 60 * 60 * 8) continue
      }
      map[col].push(order)
    }
    return map
  }, [orders])

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      toast.error("Este navegador não suporta notificações.")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      setNotifyEnabled(true)
      toast.success("Alertas da cozinha ativados.")
    } else {
      setNotifyEnabled(false)
      toast.message("Permissão de notificação não concedida.")
    }
  }

  async function runPrimary(order: ManageOrderListItem) {
    if (!access || !tenantId) return
    setBusyId(order.id)
    try {
      if (order.status === "AwaitingAcceptance") {
        await acceptTenantOrder(order.id, access, tenantId)
        toast.success("Pedido aceito.")
      } else {
        await advanceTenantOrder(order.id, access, tenantId)
        toast.success("Status atualizado.")
      }
      await refresh()
      if (selectedId === order.id) {
        setDetail(await getTenantOrder(order.id, access, tenantId))
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ação falhou.")
    } finally {
      setBusyId(null)
    }
  }

  async function runReject(orderId: string) {
    if (!access || !tenantId) return
    setBusyId(orderId)
    try {
      await rejectTenantOrder(orderId, null, access, tenantId)
      toast.success("Pedido recusado.")
      if (selectedId === orderId) setSelectedId(null)
      await refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Falha ao recusar.")
    } finally {
      setBusyId(null)
    }
  }

  const manageHome = (() => {
    const tenant = pathTenant || tenantId
    return tenant ? withTenantPrefix(tenant, "/orders") : "/orders"
  })()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href={manageHome} />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              Cozinha
            </h1>
            <p className="text-xs text-muted-foreground">
              Atualiza a cada 4s
              {loading ? " · carregando…" : ""}
              {store?.name ? ` · ${store.name}` : ""}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            notifyEnabled ? setNotifyEnabled(false) : void enableNotifications()
          }
        >
          {notifyEnabled ? (
            <>
              <Bell data-icon="inline-start" />
              Alertas ativos
            </>
          ) : (
            <>
              <BellOff data-icon="inline-start" />
              Ativar alertas
            </>
          )}
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1 overflow-auto">
        <div className="grid h-full xl:grid-cols-[1fr_1px_1fr_1px_1fr_1px_1fr]">
          {COLUMNS.map((column, index) => {
            const cards = byColumn[column.id]
            return (
              <div key={column.id} className="contents">
                <section className="flex min-h-0 flex-col gap-3 rounded-2xl p-3">
                  <header className="flex items-baseline justify-between gap-2 px-0.5">
                    <h2 className="text-sm font-semibold tracking-tight">
                      {column.title}
                    </h2>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {cards.length}
                    </span>
                  </header>
                  <ScrollArea className="flex h-0 grow flex-col overflow-auto pr-4">
                    {cards.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-background/50 px-3 py-10 text-xs text-muted-foreground">
                        Vazio
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                      {cards.map((order) => {
                        const urgent =
                          (order.status === "AwaitingAcceptance" ||
                            order.status === "Received") &&
                          Date.now() - new Date(order.createdAtUtc).getTime() >
                            1000 * 60 * 15
                        const action = primaryActionLabel(order)
                        const initials = order.customerName
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase() ?? "")
                          .join("")

                        return (
                          <article
                            key={order.id}
                            className={cn(
                              "rounded-xl border bg-card p-3 shadow-none",
                              urgent && "border-destructive/40 bg-destructive/5"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 space-y-1">
                                <p className="truncate text-sm font-semibold">
                                  {order.publicNumber.replace(/^PED-/, "#")}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge
                                    variant={
                                      order.fulfillment === "Delivery"
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {FULFILLMENT_LABEL[order.fulfillment] ??
                                      order.fulfillment}
                                  </Badge>
                                  {urgent ? (
                                    <Badge variant="destructive">Urgente</Badge>
                                  ) : null}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold tabular-nums">
                                  {formatCurrencyBRL(order.total)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(
                                    order.createdAtUtc
                                  ).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-sm text-muted-foreground">
                              {order.itemsSummary || "—"}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                                {initials || "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {order.customerName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {order.customerPhone}
                                </p>
                              </div>
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                              {order.fulfillment === "Pickup"
                                ? "Retirada no balcão"
                                : "Entrega"}
                              {" · "}
                              há {formatElapsed(order.updatedAtUtc)}
                            </p>

                            {column.id !== "done" ? (
                              <div className="mt-3 flex gap-2">
                                {action ? (
                                  <Button
                                    className="h-9 flex-1"
                                    size="sm"
                                    disabled={busyId === order.id}
                                    onClick={() => void runPrimary(order)}
                                  >
                                    {action}
                                  </Button>
                                ) : null}
                                {order.status === "AwaitingAcceptance" ? (
                                  <Button
                                    className="h-9"
                                    size="sm"
                                    variant="outline"
                                    disabled={busyId === order.id}
                                    onClick={() => void runReject(order.id)}
                                  >
                                    Recusar
                                  </Button>
                                ) : null}
                                <Button
                                  className="h-9"
                                  size="icon-sm"
                                  variant="outline"
                                  onClick={() => setSelectedId(order.id)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="mt-3 h-9 w-full"
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedId(order.id)}
                              >
                                Ver detalhes
                              </Button>
                            )}
                          </article>
                        )
                      })}
                      </div>
                    )}
                  </ScrollArea>
                </section>
                {index < COLUMNS.length - 1 ? (
                  <Separator orientation="vertical" className="hidden xl:block" />
                ) : null}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <Sheet
        open={selectedId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.publicNumber ?? "Pedido"}</SheetTitle>
            <SheetDescription>
              {detail
                ? (ORDER_STATUS_LABEL[detail.status] ?? detail.status)
                : "Carregando…"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
            {!detail ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Cliente: </span>
                    {detail.customerName} · {detail.customerPhone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Pagamento: </span>
                    {PAYMENT_METHOD_LABEL[detail.paymentMethod] ??
                      detail.paymentMethod}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Local: </span>
                    {addressLine(detail)}
                  </p>
                  {detail.note ? (
                    <p>
                      <span className="text-muted-foreground">Obs.: </span>
                      {detail.note}
                    </p>
                  ) : null}
                </div>
                <Separator />
                <OrderLinesAccordion lines={detail.lines} />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrencyBRL(detail.total)}
                  </span>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
