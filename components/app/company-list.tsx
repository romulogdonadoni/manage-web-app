"use client"

import { ArrowRight, Building2, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import type { TenantDto } from "@/lib/api/types"
import { cn } from "@/lib/utils"

type CompanyListProps = {
  tenants: TenantDto[]
  activeTenantId: string | null | undefined
  emptyLabel?: string
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Membro",
}

export function CompanyList({
  tenants,
  activeTenantId,
  emptyLabel = "Nenhuma empresa nesta lista.",
}: CompanyListProps) {
  const [activating, setActivating] = useState<string | null>(null)

  const active = activeTenantId?.trim().toLowerCase() || null

  async function activateAndOpen(identifier: string) {
    const id = identifier.trim().toLowerCase()
    setActivating(id)

    try {
      const res = await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: id }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error || "Não foi possível ativar a empresa.")
      }
      window.location.assign(`/${id}`)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível ativar a empresa."
      )
      setActivating(null)
    }
  }

  if (tenants.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {tenants.map((tenant) => {
        const isCurrent =
          !!active && tenant.identifier.toLowerCase() === active
        const busy = activating === tenant.identifier.toLowerCase()
        const role = tenant.role?.toLowerCase()
        const roleLabel = role ? ROLE_LABELS[role] ?? role : null

        return (
          <li key={tenant.id}>
            <button
              type="button"
              disabled={!!activating}
              onClick={() => void activateAndOpen(tenant.identifier)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-2xl border bg-background px-4 py-3 text-left transition-colors",
                "hover:border-primary/40 hover:bg-muted/40 disabled:opacity-60",
                isCurrent
                  ? "border-primary/50 bg-primary/5"
                  : "border-transparent"
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
                {tenant.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tenant.logoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{tenant.name}</p>
                  {isCurrent ? (
                    <Badge variant="default" className="gap-1">
                      <Check className="size-3" />
                      Em uso
                    </Badge>
                  ) : null}
                  {roleLabel && role !== "owner" ? (
                    <Badge variant="secondary">{roleLabel}</Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  <code className="text-xs">/{tenant.identifier}</code>
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                {busy ? "Ativando…" : isCurrent ? "Abrir" : "Entrar"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
