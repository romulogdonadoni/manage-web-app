"use client"

import { ModuleShell } from "@/components/app/module-shell"

import {
  CreditCard,
  Minus,
  Plus,
  Puzzle,
  Receipt,
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
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import {
  BASE_PLAN_PRICE,
  calculateMonthlyTotal,
  formatBRL,
} from "@/lib/modules/billing"
import {
  CORE_MODULES,
  getIndustry,
  getModule,
  type ModuleId,
} from "@/lib/modules/catalog"
import {
  loadTenantProfile,
  updateSubscriptionModules,
  type TenantProfile,
} from "@/lib/modules/storage"

export default function SettingsPage() {
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    setProfile(loadTenantProfile())
    setHydrated(true)
  }, [])

  const industry = profile ? getIndustry(profile.industry) : undefined
  const monthlyTotal = profile
    ? calculateMonthlyTotal(profile.modules)
    : BASE_PLAN_PRICE

  const availableModules = useMemo(() => {
    if (!industry) return []
    return industry.modules
      .map((entry) => getModule(entry.id))
      .filter((module) => !module.core)
  }, [industry])

  const activeOptional = useMemo(() => {
    if (!profile) return []
    return profile.modules
      .map((id) => getModule(id))
      .filter((module) => !module.core)
  }, [profile])

  function applyChange(moduleId: ModuleId, action: "added" | "removed") {
    if (!profile) return

    const nextModules =
      action === "added"
        ? Array.from(new Set([...profile.modules, moduleId]))
        : profile.modules.filter((id) => id !== moduleId)

    const result = updateSubscriptionModules(nextModules, { moduleId, action })
    if (!result) return

    setProfile(result.profile)
    const module = getModule(moduleId)
    setFlash(
      action === "added"
        ? `${module.label} adicionado (+${formatBRL(module.priceMonthly)}/mês)`
        : `${module.label} removido (−${formatBRL(module.priceMonthly)}/mês)`
    )
  }

  if (!hydrated) return null

  if (!profile || !industry) {
    return (
    <ModuleShell title={"Configurações"} description={"Módulos da assinatura e preferências"}>
      <div className="flex flex-col gap-6">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Complete o onboarding</CardTitle>
            <CardDescription>
              Defina o segmento e os módulos antes de gerenciar a assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/onboarding" />}>
              Ir para onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  )
  }

  return (
    <ModuleShell title={"Configurações"} description={"Módulos da assinatura e preferências"}>
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Assinatura mensal",
            value: formatBRL(monthlyTotal),
            hint: `Base ${formatBRL(BASE_PLAN_PRICE)} + extras`,
            icon: CreditCard,
          },
          {
            label: "Módulos extras",
            value: String(activeOptional.length),
            hint: activeOptional.map((m) => m.label).join(" · ") || "Nenhum",
            icon: Puzzle,
          },
          {
            label: "Segmento",
            value: industry.label,
            hint: industry.id,
            icon: Receipt,
          },
          {
            label: "Core incluso",
            value: String(CORE_MODULES.length),
            hint: "Sempre na assinatura",
            icon: Puzzle,
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
              <p className="truncate text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {flash ? (
        <Card size="sm" className="border-success/30 bg-success/5 shadow-none">
          <CardContent className="py-3 text-sm">{flash}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Módulos da assinatura</CardTitle>
            <CardDescription>
              Adicionar aumenta a mensalidade; remover reduz na próxima fatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {availableModules.map((module) => {
                const active = profile.modules.includes(module.id)

                return (
                  <Item key={module.id} variant="muted" size="sm">
                    <ItemContent>
                      <ItemTitle className="flex flex-wrap items-center gap-2">
                        {module.label}
                        {active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Disponível</Badge>
                        )}
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        {module.description}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions className="flex items-center gap-2">
                      <span className="text-sm font-medium tabular-nums">
                        {formatBRL(module.priceMonthly)}
                        <span className="text-muted-foreground">/mês</span>
                      </span>
                      {active ? (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => applyChange(module.id, "removed")}
                        >
                          <Minus data-icon="inline-start" />
                          Remover
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          onClick={() => applyChange(module.id, "added")}
                        >
                          <Plus data-icon="inline-start" />
                          Adicionar
                        </Button>
                      )}
                    </ItemActions>
                  </Item>
                )
              })}
            </ItemGroup>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Resumo da cobrança</CardTitle>
            <CardDescription>Composição da mensalidade atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plano base</span>
              <span className="font-medium tabular-nums">
                {formatBRL(BASE_PLAN_PRICE)}
              </span>
            </div>
            {activeOptional.map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{module.label}</span>
                <span className="font-medium tabular-nums">
                  {formatBRL(module.priceMonthly)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">Total / mês</span>
              <span className="text-xl font-semibold tabular-nums">
                {formatBRL(monthlyTotal)}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<Link href="/billing" />}
            >
              Ver assinatura e faturas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </ModuleShell>
  )
}
