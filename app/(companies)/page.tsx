import { ArrowRight, Building2, Plus } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { USER_COMPANIES, type Company } from "@/lib/companies/catalog"

function statusVariant(status: Company["status"]) {
  if (status === "active") return "success"
  if (status === "provisioning") return "warning"
  return "secondary"
}

function statusLabel(status: Company["status"]) {
  if (status === "active") return "Ativa"
  if (status === "provisioning") return "Provisionando"
  return "Inativa"
}

export default function CompaniesPage() {
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
            Escolha a empresa para abrir o painel. Cada uma tem seu próprio
            realm Keycloak e banco de dados.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/onboarding" />}>
          <Plus data-icon="inline-start" />
          Nova empresa
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {USER_COMPANIES.map((company) => (
          <li key={company.slug}>
            <Link
              href={`/${company.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-transparent bg-background px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{company.name}</p>
                  <Badge variant={statusVariant(company.status)}>
                    {statusLabel(company.status)}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {company.industry}
                  <span className="mx-1.5 text-border">·</span>
                  <code className="text-xs">/{company.slug}</code>
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                Abrir
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
