"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createCheckoutSession, createPortalSession } from "@/lib/api/billing"
import { ApiError } from "@/lib/api/client"
import type { AccountUserDto } from "@/lib/api/types"
import { getAccountUser } from "@/lib/api/users"
import { BASE_PLAN_PRICE, formatBRL } from "@/lib/modules/billing"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AccountBillingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [account, setAccount] = useState<AccountUserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const handledReturn = useRef(false)

  const refreshAccount = useCallback(
    async (accessToken: string, attempts = 1) => {
      let last: AccountUserDto | null = null
      for (let i = 0; i < attempts; i++) {
        last = await getAccountUser(accessToken)
        setAccount(last)
        if (last.canCreateTenants) break
        if (i < attempts - 1) await sleep(1200)
      }
      return last
    },
    []
  )

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

  useEffect(() => {
    if (handledReturn.current) return
    if (status !== "authenticated" || !session?.accessToken) return

    const success = searchParams.get("success") === "1"
    const canceled = searchParams.get("canceled") === "1"
    if (!success && !canceled) return

    handledReturn.current = true
    void (async () => {
      if (canceled) {
        toast.message("Checkout cancelado.")
      } else {
        toast.message("Confirmando pagamento…")
        const user = await refreshAccount(session.accessToken!, 4)
        if (user?.canCreateTenants) {
          toast.success("Assinatura ativa. Você já pode criar empresas.")
        } else {
          toast.message(
            "Pagamento recebido. A assinatura pode levar alguns segundos para liberar."
          )
        }
      }
      router.replace("/account/billing")
    })()
  }, [refreshAccount, router, searchParams, session?.accessToken, status])

  async function handleSubscribe() {
    if (!session?.accessToken || busy) return
    setBusy(true)
    try {
      const { url } = await createCheckoutSession(session.accessToken)
      window.location.href = url
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao abrir o checkout."
      )
      setBusy(false)
    }
  }

  async function handleManage() {
    if (!session?.accessToken || busy) return
    setBusy(true)
    try {
      const { url } = await createPortalSession(session.accessToken)
      window.location.href = url
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao abrir o portal de assinatura."
      )
      setBusy(false)
    }
  }

  const paid = account?.canCreateTenants === true
  const canManage = account?.canManageSubscription === true

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
                {loading
                  ? "…"
                  : paid
                    ? account?.subscriptionStatus &&
                      account.subscriptionStatus !== "none"
                      ? `Pago (${account.subscriptionStatus})`
                      : "Pago"
                    : "Gratuito"}
              </span>
            </p>
          </div>

          {!loading && !paid ? (
            <Button
              type="button"
              disabled={busy || status !== "authenticated"}
              onClick={() => void handleSubscribe()}
            >
              {busy ? "Abrindo checkout…" : "Assinar com Stripe"}
            </Button>
          ) : null}

          {!loading && paid ? (
            <div className="flex flex-wrap gap-2">
              <Button
                nativeButton={false}
                render={<Link href="/create" />}
                className="w-fit"
              >
                Criar empresa
              </Button>
              {canManage ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void handleManage()}
                >
                  {busy ? "Abrindo…" : "Gerenciar assinatura"}
                </Button>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Pagamento processado pelo Stripe. O plano só libera após confirmação
            do webhook.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
