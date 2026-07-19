"use client"

import { Building2, Check, Copy, Mail, Send } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { acceptInvitation } from "@/lib/api/invitations"
import type { MyInvitationDto, MyInvitationsInboxDto } from "@/lib/api/types"

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Membro",
}

type PendingInvitesProps = {
  inbox: MyInvitationsInboxDto | null
  loadError?: string | null
}

export function PendingInvites({ inbox, loadError }: PendingInvitesProps) {
  const { data: session } = useSession()
  const [received, setReceived] = useState(inbox?.received ?? [])
  const [sent] = useState(inbox?.sent ?? [])
  const [busyToken, setBusyToken] = useState<string | null>(null)

  const accountEmail = inbox?.accountEmail
  const emailLooksPlaceholder = inbox?.emailLooksPlaceholder === true

  async function handleAccept(invite: MyInvitationDto) {
    if (!session?.accessToken || busyToken) return
    setBusyToken(invite.token)
    try {
      const result = await acceptInvitation(invite.token, session.accessToken)
      await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: result.tenantIdentifier }),
      })
      setReceived((prev) => prev.filter((i) => i.id !== invite.id))
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
      setBusyToken(null)
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link do convite copiado.")
    } catch {
      toast.message("Copie o link do convite", { description: url })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {loadError ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar convites</AlertTitle>
          <AlertDescription className="break-all">{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {emailLooksPlaceholder ? (
        <Alert variant="destructive">
          <AlertTitle>E-mail da conta incompleto</AlertTitle>
          <AlertDescription>
            Sua conta está como <code>{accountEmail}</code>. Convites são
            amarrados ao e-mail real do Auth0. Configure a Action de e-mail no
            Auth0 (veja <code>docs/AUTH0_SETUP.md</code>) e entre de novo —
            senão os convites recebidos não aparecem aqui.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card size="sm" className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4" />
            Convites recebidos
            {received.length > 0 ? (
              <Badge variant="secondary" className="tabular-nums">
                {received.length}
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription>
            {accountEmail && !emailLooksPlaceholder ? (
              <>
                Convites para <span className="font-medium text-foreground">{accountEmail}</span>.
              </>
            ) : (
              "Quando alguém te convidar, o aceite aparece aqui."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {received.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum convite pendente para você.
            </p>
          ) : (
            <div className="space-y-2">
              {received.map((invite) => (
                <InviteRow
                  key={invite.id}
                  invite={invite}
                  mode="received"
                  busy={busyToken === invite.token}
                  onAccept={() => void handleAccept(invite)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="size-4" />
            Convites enviados
            {sent.length > 0 ? (
              <Badge variant="secondary" className="tabular-nums">
                {sent.length}
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription>
            Pendentes nas empresas em que você é owner ou admin. Copie o link
            para compartilhar.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {sent.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              Você ainda não enviou convites. Abra uma empresa → Funcionários →
              Convidar.
            </p>
          ) : (
            <div className="space-y-2">
              {sent.map((invite) => (
                <InviteRow
                  key={invite.id}
                  invite={invite}
                  mode="sent"
                  onCopy={() =>
                    void copyLink(
                      `${window.location.origin}/invite/${encodeURIComponent(invite.token)}`
                    )
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InviteRow({
  invite,
  mode,
  busy,
  onAccept,
  onCopy,
}: {
  invite: MyInvitationDto
  mode: "received" | "sent"
  busy?: boolean
  onAccept?: () => void
  onCopy?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-background px-3 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
        {invite.tenantLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={invite.tenantLogoUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <Building2 className="size-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{invite.tenantName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {mode === "sent" ? (
            <>
              Para <span className="text-foreground">{invite.email}</span>
              {" · "}
            </>
          ) : null}
          <code>/{invite.tenantIdentifier}</code>
          {" · "}
          {ROLE_LABELS[invite.role] ?? invite.role}
        </p>
      </div>
      <Badge variant="warning" className="pointer-events-none rounded-md">
        Pendente
      </Badge>
      {mode === "received" ? (
        <>
          <Button type="button" size="sm" disabled={busy} onClick={onAccept}>
            <Check data-icon="inline-start" />
            {busy ? "Entrando…" : "Aceitar"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={
              <Link href={`/invite/${encodeURIComponent(invite.token)}`} />
            }
          >
            Ver
          </Button>
        </>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          <Copy data-icon="inline-start" />
          Copiar link
        </Button>
      )}
    </div>
  )
}
