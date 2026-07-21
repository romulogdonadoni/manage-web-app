"use client"

import { Check, PawPrint, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Suspense, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api/client"
import {
  checkTenantIdentifierAvailability,
  provisionTenant,
} from "@/lib/api/tenants"
import { getAccountUser } from "@/lib/api/users"
import {
  INDUSTRIES,
  allocateIdentifier,
  defaultModulesFor,
  type IndustryId,
} from "@/lib/modules/catalog"
import { bootstrapBilling, saveTenantProfile } from "@/lib/modules/storage"
import { cn } from "@/lib/utils"

const INDUSTRY_ICONS: Record<IndustryId, typeof UtensilsCrossed> = {
  "food.restaurant": UtensilsCrossed,
  "pet.retail": PawPrint,
}

function CreateCompanyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()

  const [name, setName] = useState("")
  const [industryId, setIndustryId] = useState<IndustryId | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [canCreateTenants, setCanCreateTenants] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugError, setSlugError] = useState<string | null>(null)

  const authError = searchParams.get("authError")
  const previewId = useMemo(
    () => (name.trim().length >= 2 ? allocateIdentifier(name) : ""),
    [name]
  )

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (sessionStatus !== "authenticated" || !session?.accessToken) {
      setPlanLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const user = await getAccountUser(session.accessToken!)
        if (!cancelled) setCanCreateTenants(user.canCreateTenants)
      } catch {
        if (!cancelled) setCanCreateTenants(false)
      } finally {
        if (!cancelled) setPlanLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session?.accessToken, sessionStatus])

  useEffect(() => {
    if (!previewId || !session?.accessToken || !canCreateTenants) {
      setSlugAvailable(null)
      setSlugError(null)
      setSlugChecking(false)
      return
    }

    let cancelled = false
    setSlugChecking(true)
    setSlugAvailable(null)
    setSlugError(null)

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await checkTenantIdentifierAvailability(
            previewId,
            session.accessToken!
          )
          if (cancelled) return
          setSlugAvailable(result.available)
          setSlugError(
            result.available
              ? null
              : `O identificador /${result.identifier} já está em uso. Escolha outro nome.`
          )
        } catch (error) {
          if (cancelled) return
          setSlugAvailable(null)
          setSlugError(
            error instanceof Error
              ? error.message
              : "Não foi possível verificar o identificador."
          )
        } finally {
          if (!cancelled) setSlugChecking(false)
        }
      })()
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [previewId, session?.accessToken, canCreateTenants])

  const canSubmit =
    canCreateTenants &&
    name.trim().length >= 2 &&
    Boolean(industryId) &&
    Boolean(previewId) &&
    slugAvailable === true &&
    !slugChecking &&
    !submitting

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!industryId || submitting || !canCreateTenants || !previewId) return
    if (slugAvailable !== true) return

    if (sessionStatus !== "authenticated" || !session?.accessToken) {
      window.location.href = "/api/auth/login?callbackUrl=/create"
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    const trimmedName = name.trim()
    const modules = defaultModulesFor(industryId)

    try {
      const availability = await checkTenantIdentifierAvailability(
        previewId,
        session.accessToken
      )
      if (!availability.available) {
        setSlugAvailable(false)
        setSlugError(
          `O identificador /${availability.identifier} já está em uso. Escolha outro nome.`
        )
        setSubmitting(false)
        return
      }

      await provisionTenant(
        { name: trimmedName, identifier: previewId },
        session.accessToken
      )

      saveTenantProfile({
        name: trimmedName,
        identifier: previewId,
        industry: industryId,
        modules,
        completedAt: new Date().toISOString(),
      })
      bootstrapBilling(modules)

      await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: previewId }),
      })

      router.push(`/${previewId}`)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = "/api/auth/login?callbackUrl=/create"
        return
      }
      if (error instanceof ApiError && error.status === 403) {
        setCanCreateTenants(false)
        setSubmitError(
          "Plano pago necessário para criar empresas. Faça upgrade na assinatura."
        )
        setSubmitting(false)
        return
      }
      if (error instanceof ApiError && error.status === 409) {
        setSlugAvailable(false)
        setSlugError(
          `O identificador /${previewId} já está em uso. Escolha outro nome.`
        )
        setSubmitting(false)
        return
      }
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a empresa."
      )
      setSubmitting(false)
    }
  }

  if (!planLoading && sessionStatus === "authenticated" && !canCreateTenants) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Nova empresa
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Plano pago necessário
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Só contas com plano pago podem criar empresas. Faça upgrade para
            continuar.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href="/account/billing" />}
        >
          Ver planos e assinar
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-xl">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Nova empresa
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Criar empresa
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe o nome e o segmento. O identificador da URL é gerado
          automaticamente e precisa ser único.
        </p>
      </div>

      {authError ? (
        <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Falha na autenticação: {authError}
        </p>
      ) : null}

      {submitError ? (
        <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-name">Nome da empresa</Label>
          <Input
            id="company-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Cowboy Burger"
            autoComplete="organization"
            required
            minLength={2}
            disabled={planLoading || !canCreateTenants}
            aria-invalid={slugAvailable === false || undefined}
          />
          <p
            className={cn(
              "text-xs",
              slugAvailable === false
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {previewId ? (
              <>
                URL: <code className="text-xs">/{previewId}</code>
                {slugChecking
                  ? " · verificando…"
                  : slugAvailable === true
                    ? " · disponível"
                    : slugAvailable === false
                      ? " · já em uso"
                      : null}
              </>
            ) : (
              "O path será gerado a partir do nome."
            )}
          </p>
          {slugError ? (
            <p className="text-xs text-destructive" role="alert">
              {slugError}
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Segmento</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {INDUSTRIES.map((industry) => {
              const Icon = INDUSTRY_ICONS[industry.id]
              const selected = industryId === industry.id
              return (
                <button
                  key={industry.id}
                  type="button"
                  disabled={planLoading || !canCreateTenants}
                  onClick={() => setIndustryId(industry.id)}
                  className={cn(
                    "relative rounded-2xl border bg-background p-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                    (planLoading || !canCreateTenants) && "opacity-60"
                  )}
                >
                  {selected ? (
                    <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  ) : null}
                  <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <p className="mt-3 font-medium">{industry.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {industry.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          {planLoading
            ? "Verificando plano…"
            : slugChecking
              ? "Verificando URL…"
              : submitting
                ? "Criando…"
                : "Criar empresa"}
        </Button>
      </div>
    </form>
  )
}

export default function CreateCompanyPage() {
  return (
    <Suspense
      fallback={
        <Card size="sm" className="mx-auto max-w-xl shadow-none">
          <CardHeader>
            <CardTitle>Criar empresa</CardTitle>
            <CardDescription>Carregando…</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      }
    >
      <CreateCompanyForm />
    </Suspense>
  )
}
