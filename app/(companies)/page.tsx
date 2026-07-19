import { ArrowRight, Building2, Mail, Plus } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { CompanyList } from "@/components/app/company-list"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/auth"
import { TENANT_COOKIE } from "@/lib/auth/constants"
import { listMyInvitations } from "@/lib/api/invitations"
import { listTenants } from "@/lib/api/tenants"
import { getAccountUser } from "@/lib/api/users"
import { isValidTenantSlug } from "@/lib/auth/tenant-host"
import type { TenantDto } from "@/lib/api/types"

function isOwned(tenant: TenantDto) {
  return (tenant.role ?? "").toLowerCase() === "owner"
}

export default async function CompaniesPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/api/auth/login?callbackUrl=/")
  }

  const jar = await cookies()
  const cookieTenant = jar.get(TENANT_COOKIE)?.value?.trim().toLowerCase()
  const activeTenantId =
    (cookieTenant && isValidTenantSlug(cookieTenant) ? cookieTenant : null) ||
    session.tenant ||
    null

  let tenants: TenantDto[] = []
  let loadError: string | null = null
  let canCreateTenants = false
  let receivedInviteCount = 0

  try {
    tenants = await listTenants({
      accessToken: session.accessToken,
      tenantId: activeTenantId,
    })
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar as empresas."
  }

  try {
    const inbox = await listMyInvitations(session.accessToken)
    receivedInviteCount = inbox.received.length
  } catch {
    receivedInviteCount = 0
  }

  try {
    const account = await getAccountUser(session.accessToken)
    canCreateTenants = account.canCreateTenants
  } catch {
    canCreateTenants = false
  }

  const owned = tenants.filter(isOwned)
  const memberOf = tenants.filter((t) => !isOwned(t))
  const createHref = canCreateTenants ? "/create" : "/account/billing"
  const createLabel = canCreateTenants ? "Nova empresa" : "Assinar para criar"
  const hasAnyCompany = tenants.length > 0

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Manage
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Suas empresas
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Empresas que você criou e outras em que você participa.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href={createHref} />}>
          <Plus data-icon="inline-start" />
          {createLabel}
        </Button>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      {receivedInviteCount > 0 ? (
        <Link
          href="/account/invitations"
          className="group flex items-center gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 transition-colors hover:bg-warning/15"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-warning/20 text-warning">
            <Mail className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">
              Você tem {receivedInviteCount} convite
              {receivedInviteCount === 1 ? "" : "s"} pendente
              {receivedInviteCount === 1 ? "" : "s"}
            </span>
            <span className="block text-xs text-muted-foreground">
              Abra para aceitar e entrar na empresa.
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </Link>
      ) : null}

      {!loadError && !hasAnyCompany ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
          <Building2 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">Nenhuma empresa na sua conta</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canCreateTenants
              ? "Crie uma empresa para começar a gerenciar."
              : "Assine um plano pago para criar sua primeira empresa, ou aguarde um convite."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button nativeButton={false} render={<Link href={createHref} />}>
              {createLabel}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/account/invitations" />}
            >
              Ver convites
            </Button>
          </div>
        </div>
      ) : null}

      {!loadError && hasAnyCompany ? (
        <div className="flex flex-col gap-8">
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Minhas empresas
              </h2>
              <p className="text-sm text-muted-foreground">
                Empresas das quais você é owner.
              </p>
            </div>
            <CompanyList
              tenants={owned}
              activeTenantId={activeTenantId}
              emptyLabel="Você ainda não criou nenhuma empresa."
            />
          </section>

          {memberOf.length > 0 ? (
            <>
              <Separator />
              <section className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Empresas das quais faço parte
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Você entrou por convite como admin ou membro.
                  </p>
                </div>
                <CompanyList
                  tenants={memberOf}
                  activeTenantId={activeTenantId}
                />
              </section>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
