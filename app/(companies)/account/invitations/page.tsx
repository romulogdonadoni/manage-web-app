import { Mail } from "lucide-react"
import { redirect } from "next/navigation"

import { PendingInvites } from "@/components/app/pending-invites"
import { auth } from "@/lib/auth"
import { listMyInvitations } from "@/lib/api/invitations"
import type { MyInvitationsInboxDto } from "@/lib/api/types"

export default async function AccountInvitationsPage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/api/auth/login?callbackUrl=/account/invitations")
  }

  let inbox: MyInvitationsInboxDto | null = null
  let loadError: string | null = null

  try {
    inbox = await listMyInvitations(session.accessToken)
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar os convites."
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Convites</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Convites recebidos e enviados. Aceite para entrar em uma empresa ou
          compartilhe o link com quem você convidou.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="size-4 shrink-0" />
        <span>
          Envie novos convites em cada empresa, em{" "}
          <span className="text-foreground">Funcionários</span>.
        </span>
      </div>

      <PendingInvites inbox={inbox} loadError={loadError} />
    </>
  )
}
