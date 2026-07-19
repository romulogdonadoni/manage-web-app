"use client"

import { ModuleShell } from "@/components/app/module-shell"

import {
  CalendarClock,
  CreditCard,
  FileText,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  calculateMonthlyTotal,
  formatBRL,
  type BillingState,
  type InvoiceStatus,
} from "@/lib/modules/billing"
import { getIndustry, getModule } from "@/lib/modules/catalog"
import {
  ensureBilling,
  loadBillingState,
  loadTenantProfile,
  saveBillingState,
  type TenantProfile,
} from "@/lib/modules/storage"

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const variant =
    status === "paid"
      ? "success"
      : status === "open"
        ? "warning"
        : "destructive"

  const label =
    status === "paid" ? "Paga" : status === "open" ? "Aberta" : "Atrasada"

  return <Badge variant={variant}>{label}</Badge>
}

export default function BillingPage() {
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [billing, setBilling] = useState<BillingState>({
    invoices: [],
    changes: [],
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const tenant = loadTenantProfile()
    setProfile(tenant)
    if (tenant) {
      setBilling(ensureBilling(tenant.modules))
    } else {
      setBilling(loadBillingState())
    }
    setHydrated(true)
  }, [])

  const industry = profile ? getIndustry(profile.industry) : undefined
  const monthlyTotal = profile
    ? calculateMonthlyTotal(profile.modules)
    : 0

  const openInvoice = useMemo(
    () => billing.invoices.find((invoice) => invoice.status === "open"),
    [billing.invoices]
  )

  const paidCount = billing.invoices.filter((i) => i.status === "paid").length

  function markPaid(invoiceId: string) {
    const next: BillingState = {
      ...billing,
      invoices: billing.invoices.map((invoice) =>
        invoice.id === invoiceId
          ? {
              ...invoice,
              status: "paid" as const,
              paidAt: new Date().toISOString(),
            }
          : invoice
      ),
    }
    saveBillingState(next)
    setBilling(next)
  }

  if (!hydrated) return null

  if (!profile) {
    return (
    <ModuleShell title={"Assinatura e faturas"} description={"Plano mensal por módulos"}>
      <div className="flex flex-col gap-6">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Nenhuma assinatura ativa</CardTitle>
            <CardDescription>
              Conclua a criação da empresa para gerar o plano e as faturas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/create" />}>
              Começar
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  )
  }

  return (
    <ModuleShell title={"Assinatura e faturas"} description={"Plano mensal por módulos"}>
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Mensalidade atual",
            value: formatBRL(monthlyTotal),
            hint: industry?.label ?? profile.industry,
            icon: CreditCard,
          },
          {
            label: "Fatura aberta",
            value: openInvoice ? formatBRL(openInvoice.amount) : "—",
            hint: openInvoice?.period ?? "Nenhuma",
            icon: FileText,
          },
          {
            label: "Faturas pagas",
            value: String(paidCount),
            hint: "Histórico mock",
            icon: TrendingUp,
          },
          {
            label: "Próximo vencimento",
            value: openInvoice
              ? new Date(openInvoice.dueAt).toLocaleDateString("pt-BR")
              : "—",
            hint: openInvoice ? "10 dias após emissão" : "Sem fatura aberta",
            icon: CalendarClock,
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

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Faturas</CardTitle>
                <CardDescription>
                  Cobrança mensal por plano base + módulos
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/settings" />}
              >
                Gerenciar módulos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {invoice.period}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invoice.dueAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatBRL(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.status === "open" ? (
                        <Button
                          size="xs"
                          onClick={() => markPaid(invoice.id)}
                        >
                          Marcar paga
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Assinatura atual</CardTitle>
            <CardDescription>
              {profile.name} · {profile.identifier}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openInvoice?.lineItems.map((item) => (
              <div
                key={`${item.label}-${item.moduleId ?? "base"}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium tabular-nums">
                  {formatBRL(item.amount)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="font-medium">Total</span>
              <span className="text-xl font-semibold tabular-nums">
                {formatBRL(monthlyTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Alterações na assinatura</CardTitle>
          <CardDescription>
            Histórico de módulos adicionados ou removidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billing.changes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma alteração ainda. Em Configurações você pode adicionar ou
              remover módulos.
            </p>
          ) : (
            <ItemGroup className="gap-2">
              {billing.changes.map((change) => (
                <Item key={change.id} variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle className="flex w-full flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        {change.label}
                        <Badge
                          variant={
                            change.action === "added" ? "success" : "secondary"
                          }
                        >
                          {change.action === "added" ? "Adicionado" : "Removido"}
                        </Badge>
                      </span>
                      <span
                        className={
                          change.deltaMonthly >= 0
                            ? "tabular-nums text-success"
                            : "tabular-nums text-muted-foreground"
                        }
                      >
                        {change.deltaMonthly >= 0 ? "+" : ""}
                        {formatBRL(change.deltaMonthly)}/mês
                      </span>
                    </ItemTitle>
                    <ItemDescription>
                      {getModule(change.moduleId).description} ·{" "}
                      {new Date(change.at).toLocaleString("pt-BR")}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
