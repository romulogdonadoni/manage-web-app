"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiError } from "@/lib/api/client"
import { getAccountUser, subscribePaidPlan } from "@/lib/api/users"
import type { AccountUserDto } from "@/lib/api/types"
import { BASE_PLAN_PRICE, formatBRL } from "@/lib/modules/billing"

export default function AccountBillingPage() {
  const { data: session, status } = useSession()
  const [account, setAccount] = useState<AccountUserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (status !== "authenticated" || !session?.accessToken) {
      setLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const user = await getAccountUser(session.accessToken!)
        if (!cancelled) setAccount(user)
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Falha ao carregar o plano."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session?.accessToken, status])

  async function handleSubscribe() {
    if (!session?.accessToken || busy) return
    setBusy(true)
    try {
      const user = await subscribePaidPlan(session.accessToken)
      setAccount(user)
      toast.success("Plano pago ativado. Você já pode criar empresas.")
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao ativar o plano."
      )
    } finally {
      setBusy(false)
    }
  }

  const paid = account?.canCreateTenants === true

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Assinatura e planos
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          O plano é da sua conta. Só planos pagos podem criar empresas.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Seu plano</CardTitle>
          <CardDescription>
            {loading
              ? "Carregando…"
              : paid
                ? "Plano pago — criação de empresas liberada."
                : "Plano gratuito — upgrade necessário para criar empresas."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatBRL(BASE_PLAN_PRICE)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /mês
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-medium text-foreground">
                {loading ? "…" : paid ? "Pago" : "Gratuito"}
              </span>
            </p>
          </div>

          {!loading && !paid ? (
            <Button
              type="button"
              disabled={busy || status !== "authenticated"}
              onClick={() => void handleSubscribe()}
            >
              {busy ? "Ativando…" : "Assinar plano pago"}
            </Button>
          ) : null}

          {!loading && paid ? (
            <Button
              nativeButton={false}
              render={<Link href="/create" />}
              className="w-fit"
            >
              Criar empresa
            </Button>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Checkout Stripe virá depois. Por enquanto o botão ativa o plano pago
            na API (dev/self-serve).
          </p>
        </CardContent>
      </Card>
    </>
  )
}
