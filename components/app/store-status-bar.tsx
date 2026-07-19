"use client"

import { ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api/client"
import { updateStoreStatus } from "@/lib/api/tenants"
import { useCurrentStore } from "@/lib/store/current-store-context"
import { cn } from "@/lib/utils"

function formatSince(iso: string | null | undefined) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function StoreStatusBar() {
  const { data: session } = useSession()
  const { data: store, refresh } = useCurrentStore()
  const accessToken = session?.accessToken
  const tenantId = store?.identifier ?? null

  const [pinOpen, setPinOpen] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<
    "open" | "close" | null
  >(null)
  const [pin, setPin] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  if (!store) return null

  const isOpen = Boolean(store.isOpen)
  const since = formatSince(isOpen ? store.openedAtUtc : store.closedAtUtc)
  const statusLabel = isOpen
    ? since
      ? `Loja aberta · desde ${since}`
      : "Loja aberta"
    : since
      ? `Loja fechada · desde ${since}`
      : "Loja fechada"

  function requestAction(action: "open" | "close") {
    setPendingAction(action)
    setPin("")
    setPinOpen(true)
  }

  async function handleConfirm(event: React.FormEvent) {
    event.preventDefault()
    if (!accessToken || !tenantId || !pendingAction || submitting) return

    setSubmitting(true)
    try {
      await updateStoreStatus(pendingAction, pin, accessToken, tenantId)
      toast.success(pendingAction === "open" ? "Loja aberta." : "Loja fechada.")
      setPinOpen(false)
      setPendingAction(null)
      setPin("")
      await refresh()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível atualizar o status da loja."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-2 px-2 text-xs"
            />
          }
        >
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              isOpen ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          <span className="truncate text-muted-foreground">{statusLabel}</span>
          <ChevronDown className="size-3.5 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          {isOpen ? (
            <DropdownMenuItem onClick={() => requestAction("close")}>
              Fechar loja
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => requestAction("open")}>
              Abrir loja
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={pinOpen}
        onOpenChange={(open) => {
          setPinOpen(open)
          if (!open) {
            setPendingAction(null)
            setPin("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={(e) => void handleConfirm(e)}>
            <DialogHeader>
              <DialogTitle>
                {pendingAction === "open" ? "Abrir loja" : "Fechar loja"}
              </DialogTitle>
              <DialogDescription>
                Digite sua senha de gerente para confirmar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="store-manager-pin">Senha de gerente</Label>
              <Input
                id="store-manager-pin"
                type="password"
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                minLength={4}
                maxLength={32}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPinOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || !pin}>
                {submitting ? "Confirmando…" : "Confirmar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
