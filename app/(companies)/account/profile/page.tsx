import Link from "next/link"

import { AccountBackLink } from "@/components/app/account-back-link"
import { UserProfileCard } from "@/components/app/user-profile-card"

export default function AccountProfilePage() {
  return (
    <>
      <div>
        <AccountBackLink />
        <h1 className="text-3xl font-semibold tracking-tight">Meu perfil</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Dados e foto da sua conta WhiteLabel — não da loja.
        </p>
      </div>

      <div className="max-w-xl">
        <UserProfileCard />
      </div>
    </>
  )
}
