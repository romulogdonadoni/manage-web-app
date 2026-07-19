"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import {
  acceptInvitation,
  getInvitationPreview,
} from "@/lib/api/invitations"
import type { InvitationPreviewDto } from "@/lib/api/types"

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Membro",
}

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>()
  const token = typeof params.token === "string" ? params.token : ""
  const router = useRouter()
  const { data: session, status } = useSession()

  const [preview, setPreview] = useState<InvitationPreviewDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (status !== "authenticated" || !session?.accessToken || !token) {
      setLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const data = await getInvitationPreview(token, session.accessToken!)
        if (!cancelled) setPreview(data)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Convite inválido ou expirado."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session?.accessToken, status, token])

  async function handleAccept() {
    if (!session?.accessToken || !token || accepting) return
    setAccepting(true)
    try {
      const result = await acceptInvitation(token, session.accessToken)
      await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: result.tenantIdentifier }),
      })
      toast.success("Convite aceito.")
      window.location.assign(`/${result.tenantIdentifier}`)
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível aceitar o convite."
      )
      setAccepting(false)
    }
  }

  if (status === "unauthenticated") {
    return (
      <Card size="sm" className="mx-auto max-w-lg shadow-none">
        <CardHeader>
          <CardTitle>Convite para empresa</CardTitle>
          <CardDescription>
            Entre com a conta do e-mail convidado para aceitar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/api/auth/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
              />
            }
          >
            Entrar para aceitar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading || status === "loading") {
    return (
      <Card size="sm" className="mx-auto max-w-lg shadow-none">
        <CardHeader>
          <CardTitle>Convite</CardTitle>
          <CardDescription>Carregando…</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error && !preview) {
    return (
      <Card size="sm" className="mx-auto max-w-lg shadow-none">
        <CardHeader>
          <CardTitle>Convite inválido</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Ir para empresas
          </Button>
        </CardContent>
      </Card>
    )
  }

  const canAccept =
    preview &&
    preview.status === "pending" &&
    !preview.isExpired &&
    preview.emailMatchesCurrentUser

  return (
    <Card size="sm" className="mx-auto max-w-lg shadow-none">
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Convite
        </p>
        <CardTitle className="mt-1">{preview?.tenantName}</CardTitle>
        <CardDescription>
          Você foi convidado como{" "}
          <span className="font-medium text-foreground">
            {ROLE_LABELS[preview?.role ?? ""] ?? preview?.role}
          </span>{" "}
          para <code>/{preview?.tenantIdentifier}</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm">
          <p>
            E-mail do convite:{" "}
            <span className="font-medium">{preview?.email}</span>
          </p>
          <p className="mt-1 text-muted-foreground">
            Status: {preview?.status}
            {preview?.isExpired ? " (expirado)" : ""}
          </p>
        </div>

        {!preview?.emailMatchesCurrentUser ? (
          <p className="text-sm text-muted-foreground">
            A conta logada não corresponde ao e-mail do convite. Entre com{" "}
            <span className="font-medium text-foreground">{preview?.email}</span>
            .
          </p>
        ) : null}

        {canAccept ? (
          <Button
            type="button"
            size="lg"
            disabled={accepting}
            onClick={() => void handleAccept()}
          >
            {accepting ? "Aceitando…" : "Aceitar convite"}
          </Button>
        ) : preview?.status === "accepted" ? (
          <Button
            type="button"
            onClick={() =>
              router.push(`/${preview.tenantIdentifier}`)
            }
          >
            Abrir empresa
          </Button>
        ) : null}

        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Voltar às empresas
        </Button>
      </CardContent>
    </Card>
  )
}
