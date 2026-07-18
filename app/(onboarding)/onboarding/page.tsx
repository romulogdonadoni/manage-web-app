"use client"

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Store,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CORE_MODULES,
  INDUSTRIES,
  getIndustry,
  getModule,
  recommendedModulesFor,
  slugify,
  type IndustryId,
  type ModuleId,
} from "@/lib/modules/catalog"
import {
  BASE_PLAN_PRICE,
  calculateMonthlyTotal,
  formatBRL,
} from "@/lib/modules/billing"
import { bootstrapBilling, saveTenantProfile } from "@/lib/modules/storage"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Negócio", description: "Nome e identificador" },
  { id: 2, title: "Segmento", description: "Tipo de operação" },
  { id: 3, title: "Módulos", description: "O que vai usar" },
  { id: 4, title: "Revisão", description: "Confirmar e criar" },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [identifierTouched, setIdentifierTouched] = useState(false)
  const [industryId, setIndustryId] = useState<IndustryId | null>(null)
  const [modules, setModules] = useState<ModuleId[]>(
    CORE_MODULES.map((module) => module.id)
  )

  const industry = industryId ? getIndustry(industryId) : undefined
  const progress = (step / steps.length) * 100

  const industryGroups = useMemo(() => {
    const groups = new Map<string, typeof INDUSTRIES>()
    for (const item of INDUSTRIES) {
      const list = groups.get(item.group) ?? []
      list.push(item)
      groups.set(item.group, list)
    }
    return Array.from(groups.entries())
  }, [])

  const selectedOptional = modules.filter(
    (id) => !CORE_MODULES.some((module) => module.id === id)
  )
  const monthlyTotal = calculateMonthlyTotal(modules)

  function updateName(value: string) {
    setName(value)
    if (!identifierTouched) {
      setIdentifier(slugify(value))
    }
  }

  function selectIndustry(id: IndustryId) {
    setIndustryId(id)
    const recommended = recommendedModulesFor(id)
    const coreIds = CORE_MODULES.map((module) => module.id)
    const unique = Array.from(new Set([...coreIds, ...recommended]))
    setModules(unique)
  }

  function toggleModule(id: ModuleId, checked: boolean) {
    const isCore = CORE_MODULES.some((module) => module.id === id)
    if (isCore) return

    setModules((current) => {
      if (checked) return Array.from(new Set([...current, id]))
      return current.filter((moduleId) => moduleId !== id)
    })
  }

  function canContinue() {
    if (step === 1) return name.trim().length >= 2 && identifier.trim().length >= 2
    if (step === 2) return Boolean(industryId)
    if (step === 3) return modules.length > 0
    return true
  }

  async function finish() {
    if (!industryId) return

    const id = identifier.trim().toLowerCase()

    saveTenantProfile({
      name: name.trim(),
      identifier: id,
      industry: industryId,
      modules,
      completedAt: new Date().toISOString(),
    })
    bootstrapBilling(modules)

    await fetch("/api/auth/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant: id }),
    })

    router.push(`/${id}`)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Passo {step} de {steps.length}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {steps[step - 1].title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {steps[step - 1].description}
            </p>
          </div>
          <Badge variant="outline">{Math.round(progress)}%</Badge>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="flex flex-wrap gap-2">
          {steps.map((item) => (
            <Badge
              key={item.id}
              variant={item.id === step ? "default" : item.id < step ? "success" : "secondary"}
            >
              {item.id < step ? <Check data-icon="inline-start" /> : null}
              {item.title}
            </Badge>
          ))}
        </div>
      </div>

      {step === 1 ? (
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-4" />
              Dados da loja
            </CardTitle>
            <CardDescription>
              Esse identificador vira o path, banco e realm Keycloak (ex.:
              manage.localhost:3000/cowboy-burger-67)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do negócio</Label>
              <Input
                id="name"
                placeholder="Acme Burger"
                value={name}
                onChange={(event) => updateName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identifier">Identificador</Label>
              <Input
                id="identifier"
                placeholder="acme-burger"
                value={identifier}
                onChange={(event) => {
                  setIdentifierTouched(true)
                  setIdentifier(slugify(event.target.value))
                }}
              />
              <p className="text-xs text-muted-foreground">
                Usado em `whitelabel_{identifier}` e no realm Keycloak
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <div className="space-y-6">
          {industryGroups.map(([group, items]) => (
            <div key={group} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-tight">{group}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const selected = industryId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectIndustry(item.id)}
                      className={cn(
                        "rounded-2xl border bg-card p-4 text-left transition-colors",
                        selected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-foreground/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        {selected ? (
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-[11px] text-muted-foreground">
                        {item.id}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {step === 3 && industry ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Módulos do segmento</CardTitle>
              <CardDescription>
                Recomendados para {industry.label} — ajuste o que faz sentido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {industry.modules.map((entry) => {
                  const module = getModule(entry.id)
                  const checked = modules.includes(entry.id)
                  const isCore = Boolean(module.core)

                  return (
                    <Item
                      key={entry.id}
                      variant="muted"
                      size="sm"
                      className="items-start"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={isCore}
                        onCheckedChange={(value) =>
                          toggleModule(entry.id, Boolean(value))
                        }
                        className="mt-0.5"
                      />
                      <ItemContent>
                        <ItemTitle className="flex flex-wrap items-center gap-2">
                          {module.label}
                          {entry.recommended ? (
                            <Badge variant="info">Recomendado</Badge>
                          ) : null}
                          {isCore ? (
                            <Badge variant="secondary">Core</Badge>
                          ) : (
                            <Badge variant="outline">
                              +{formatBRL(module.priceMonthly)}/mês
                            </Badge>
                          )}
                        </ItemTitle>
                        <ItemDescription className="line-clamp-none">
                          {module.description}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  )
                })}
              </ItemGroup>
            </CardContent>
          </Card>

          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Core incluso</CardTitle>
              <CardDescription>
                Plano base {formatBRL(BASE_PLAN_PRICE)}/mês — total estimado{" "}
                {formatBRL(monthlyTotal)}/mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {CORE_MODULES.map((module) => (
                  <Item key={module.id} variant="muted" size="sm">
                    <ItemMedia variant="icon">
                      <CheckCircle2 className="text-success" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{module.label}</ItemTitle>
                      <ItemDescription>{module.description}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === 4 && industry ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>
                Perfil que será salvo localmente (mock até a API)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Negócio
                  </p>
                  <p className="mt-1 font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Identifier
                  </p>
                  <p className="mt-1 font-medium">{identifier}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Segmento
                  </p>
                  <p className="mt-1 font-medium">{industry.label}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Industry id
                  </p>
                  <p className="mt-1 font-medium">{industry.id}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Assinatura mensal
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatBRL(monthlyTotal)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Plano base {formatBRL(BASE_PLAN_PRICE)} + módulos extras
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Módulos selecionados ({modules.length})
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {modules.map((id) => (
                    <Badge key={id} variant="outline">
                      {getModule(id).label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Extras do segmento</CardTitle>
              <CardDescription>
                Além do core, você ativou {selectedOptional.length} módulos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOptional.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum módulo opcional selecionado.
                </p>
              ) : (
                <ItemGroup className="gap-2">
                  {selectedOptional.map((id) => (
                    <Item key={id} variant="muted" size="sm">
                      <ItemContent>
                        <ItemTitle className="flex w-full items-center justify-between gap-2">
                          <span>{getModule(id).label}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatBRL(getModule(id).priceMonthly)}
                          </span>
                        </ItemTitle>
                        <ItemDescription>
                          {getModule(id).description}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
        <Button
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((current) => Math.max(1, current - 1))}
        >
          <ArrowLeft data-icon="inline-start" />
          Voltar
        </Button>

        {step < steps.length ? (
          <Button
            disabled={!canContinue()}
            onClick={() => setStep((current) => Math.min(steps.length, current + 1))}
          >
            Continuar
            <ArrowRight data-icon="inline-end" />
          </Button>
        ) : (
          <Button disabled={!canContinue()} onClick={finish}>
            Concluir onboarding
            <Check data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  )
}
