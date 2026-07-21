import { Suspense } from "react"

import { AccountBillingClient } from "@/components/app/account-billing-client"

export default function AccountBillingPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Carregando assinatura…</p>
      }
    >
      <AccountBillingClient />
    </Suspense>
  )
}
