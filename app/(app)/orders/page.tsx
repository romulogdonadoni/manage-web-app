"use client"

import { Bike, CheckCircle2, Clock3, ShoppingBag } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ModuleShell } from "@/components/app/module-shell"
import { OrderLinesAccordion } from "@/components/orders/order-lines-accordion"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api/client"
import {
  FULFILLMENT_LABEL,
  getTenantOrder,
  listTenantOrders,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  type ManageOrderDetail,
  type ManageOrderListItem,
} from "@/lib/api/orders"
import { formatCurrencyBRL } from "@/lib/format/currency"
import { useCurrentStore } from "@/lib/store/current-store-context"

type FilterTab = "all" | "open" | "done"

const OPEN_STATUSES = new Set([
  "PendingPayment",
  "AwaitingAcceptance",
  "Received",
  "Preparing",
  "Ready",
  "OutForDelivery",
])

const DONE_STATUSES = new Set(["Delivered", "Cancelled"])

function statusBadgeVariant(status: string) {
  switch (status) {
    case "AwaitingAcceptance":
      return "warning" as const
    case "Received":
    case "Preparing":
      return "info" as const
    case "Ready":
    case "Delivered":
      return "success" as const
    case "OutForDelivery":
      return "secondary" as const
    case "Cancelled":
    case "PendingPayment":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

function matchesFilter(order: ManageOrderListItem, tab: FilterTab) {
  if (tab === "all") return true
  if (tab === "open") return OPEN_STATUSES.has(order.status)
  return DONE_STATUSES.has(order.status)
}

function startOfTodayUtc() {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString()
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const { data: store } = useCurrentStore()
  const access = session?.accessToken
  const tenantId = store?.identifier

  const [orders, setOrders] = useState<ManageOrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ManageOrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!access || !tenantId) {
      setOrders([])
      setLoading(false)
      return
    }
    try {
      const list = await listTenantOrders({ take: 100 }, access, tenantId)
      setOrders(list)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Falha ao carregar pedidos."
      )
    } finally {
      setLoading(false)
    }
  }, [access, tenantId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!access || !tenantId) return
    const timer = window.setInterval(() => void refresh(), 15000)
    return () => window.clearInterval(timer)
  }, [access, tenantId, refresh])

  useEffect(() => {
    if (!selectedId || !access || !tenantId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
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
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId, access, tenantId])

  const filtered = useMemo(
    () => orders.filter((o) => matchesFilter(o, filter)),
    [orders, filter]
  )

  const stats = useMemo(() => {
    const awaiting = orders.filter((o) => o.status === "AwaitingAcceptance")
      .length
    const open = orders.filter((o) => OPEN_STATUSES.has(o.status)).length
    const delivery = orders.filter((o) => o.status === "OutForDelivery").length
    const todayStart = startOfTodayUtc()
    const doneToday = orders.filter(
      (o) => o.status === "Delivered" && o.updatedAtUtc >= todayStart
    ).length
    return { awaiting, open, delivery, doneToday }
  }, [orders])

  return (
    <ModuleShell
      title="Pedidos"
      description="Histórico e consulta dos pedidos da loja"
    >
      <div className="flex flex-col gap-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="open">Em aberto</TabsTrigger>
            <TabsTrigger value="done">Finalizados</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Aguardando aceite",
              value: String(stats.awaiting),
              hint: "Vão para a Cozinha",
              icon: ShoppingBag,
            },
            {
              label: "Em aberto",
              value: String(stats.open),
              hint: "Ainda não concluídos",
              icon: Clock3,
            },
            {
              label: "Em entrega",
              value: String(stats.delivery),
              hint: "A caminho",
              icon: Bike,
            },
            {
              label: "Concluídos hoje",
              value: String(stats.doneToday),
              hint: "Entregues (UTC)",
              icon: CheckCircle2,
            },
          ].map(({ label, value, hint, icon: Icon }) => (
            <Card key={label} size="sm" className="shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className="mt-1 text-2xl font-semibold tracking-tight">
                    {value}
                  </CardTitle>
                </div>
                <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Lista de pedidos</CardTitle>
            <CardDescription>
              Consulta · aceite e status ficam em{" "}
              <span className="font-medium text-foreground">Cozinha</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum pedido neste filtro.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Modalidade</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quando</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(order.id)}
                    >
                      <TableCell className="font-medium">
                        {order.publicNumber}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p>{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {FULFILLMENT_LABEL[order.fulfillment] ??
                            order.fulfillment}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {order.itemsSummary || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(order.status)}>
                          {ORDER_STATUS_LABEL[order.status] ?? order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.createdAtUtc).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrencyBRL(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

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
                ? ORDER_STATUS_LABEL[detail.status] ?? detail.status
                : "Carregando…"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
            {detailLoading || !detail ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Cliente: </span>
                    {detail.customerName} · {detail.customerPhone}
                  </p>
                  {detail.customerEmail ? (
                    <p>
                      <span className="text-muted-foreground">E-mail: </span>
                      {detail.customerEmail}
                    </p>
                  ) : null}
                  <p>
                    <span className="text-muted-foreground">Modalidade: </span>
                    {FULFILLMENT_LABEL[detail.fulfillment] ?? detail.fulfillment}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Pagamento: </span>
                    {PAYMENT_METHOD_LABEL[detail.paymentMethod] ??
                      detail.paymentMethod}
                  </p>
                  {detail.fulfillment === "Delivery" ? (
                    <p>
                      <span className="text-muted-foreground">Endereço: </span>
                      {[
                        detail.addressStreet,
                        detail.addressNumber,
                        detail.addressComplement,
                        detail.addressNeighborhood,
                        detail.addressCity,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                  {detail.note ? (
                    <p>
                      <span className="text-muted-foreground">Obs.: </span>
                      {detail.note}
                    </p>
                  ) : null}
                </div>

                <Separator />

                <OrderLinesAccordion lines={detail.lines} />

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">
                      {formatCurrencyBRL(detail.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="tabular-nums">
                      {formatCurrencyBRL(detail.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatCurrencyBRL(detail.total)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </ModuleShell>
  )
}
