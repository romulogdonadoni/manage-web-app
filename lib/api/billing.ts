import { apiFetch } from "@/lib/api/client"

export type BillingSessionResponse = {
  url: string
}

export function createCheckoutSession(accessToken: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined
  return apiFetch<BillingSessionResponse>("/billing/checkout-session", {
    method: "POST",
    accessToken,
    body: JSON.stringify(
      origin
        ? {
            successUrl: `${origin}/account/billing?success=1`,
            cancelUrl: `${origin}/account/billing?canceled=1`,
          }
        : {}
    ),
  })
}

export function createPortalSession(accessToken: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined
  return apiFetch<BillingSessionResponse>("/billing/portal-session", {
    method: "POST",
    accessToken,
    body: JSON.stringify(
      origin ? { returnUrl: `${origin}/account/billing` } : {}
    ),
  })
}
