"use client"

import { Building2, KeyRound, Trash2 } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { ModuleShell } from "@/components/app/module-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiError } from "@/lib/api/client"
import { deleteTenant, listTenants } from "@/lib/api/tenants"
import type { TenantDto } from "@/lib/api/types"

export default function TenantsPage() {
  const { data: session, status } = useSession()
  const [tenants, setTenants] = useState<TenantDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (status !== "authenticated" || !session?.accessToken) {
      setLoading(status === "loading")
      return
    }

    setLoading(true)
    setError(null)
    try {
      setTenants(
        await listTenants({
          accessToken: session.accessToken,
          tenantId: session.tenant,
        })
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar tenants."
      )
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, session?.tenant, status])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleDelete(tenant: TenantDto) {
    if (!session?.accessToken) {
      toast.error("Sessão expirada. Faça login novamente.")
      return
    }

    const confirmed = window.confirm(
      `Excluir o tenant "${tenant.name}" (${tenant.identifier})?\n\nIsso remove o registro do catálogo e os vínculos de usuários.`
    )
    if (!confirmed) return

    setDeletingId(tenant.id)
    try {
      await deleteTenant(tenant.identifier, session.accessToken)
      setTenants((current) => current.filter((item) => item.id !== tenant.id))
      toast.success(`Tenant "${tenant.name}" excluído.`)
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao excluir tenant."
      )
    } finally {
      setDeletingId(null)
    }
  }

  const activeCount = tenants.filter((tenant) => tenant.isActive).length

  return (
    <ModuleShell
      title="Tenants"
      description="Empresas da sua conta no banco e Auth0 compartilhados"
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>Tenants</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tracking-tight">
                  {loading ? "—" : tenants.length}
                </CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Building2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Vinculados à sua conta</p>
            </CardContent>
          </Card>
          <Card size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>Ativos</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tracking-tight">
                  {loading ? "—" : activeCount}
                </CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <KeyRound className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Realm único whitelabel</p>
            </CardContent>
          </Card>
        </div>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Gestão de tenants</CardTitle>
                <CardDescription className="mt-1">
                  Listagem e exclusão via MinhaApi
                </CardDescription>
              </div>
              <Button
                nativeButton={false}
                render={<Link href="/create" />}
                size="sm"
              >
                Nova empresa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error ? (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : tenants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum tenant provisionado ainda.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {tenants.map((tenant) => (
                  <li
                    key={tenant.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/20 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{tenant.name}</p>
                        <Badge
                          variant={tenant.isActive ? "success" : "secondary"}
                        >
                          {tenant.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Path <code>/{tenant.identifier}</code>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={<Link href={`/${tenant.identifier}`} />}
                      >
                        Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === tenant.id}
                        onClick={() => void handleDelete(tenant)}
                      >
                        <Trash2 className="size-4" />
                        {deletingId === tenant.id ? "Excluindo…" : "Excluir"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  )
}
