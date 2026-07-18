import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { signIn } from "@/lib/auth"
import { TENANT_COOKIE } from "@/lib/auth/constants"
import { applyAuthUrlFromRequest } from "@/lib/auth/request-origin"
import { runWithTenant } from "@/lib/auth/tenant-context"
import { resolveTenant, resolveTenantFromPath } from "@/lib/auth/tenant-host"

/**
 * Starts Keycloak OIDC immediately — no intermediate Next.js login page.
 * Realm comes from path tenant cookie (set by proxy on /{tenant}/…).
 */
export async function GET(request: Request) {
  const authOrigin = applyAuthUrlFromRequest(request)
  const url = new URL(request.url)
  const origin = authOrigin || url.origin

  const error = url.searchParams.get("error")
  if (error) {
    return NextResponse.redirect(
      new URL(`/onboarding?authError=${encodeURIComponent(error)}`, origin)
    )
  }

  const callbackUrl = url.searchParams.get("callbackUrl") || "/"
  const tenant =
    resolveTenantFromPath(callbackUrl) ||
    resolveTenant({
      tenantHeader: request.headers.get("x-tenant-id"),
      cookieHeader: request.headers.get("cookie"),
    })

  if (!tenant) {
    return NextResponse.redirect(new URL("/onboarding", origin))
  }

  const jar = await cookies()
  jar.set(TENANT_COOKIE, tenant, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  })

  const redirectTo =
    callbackUrl && callbackUrl !== "/" ? callbackUrl : `/${tenant}`
  // Auth.js may re-evaluate config without Host/cookie; bind realm for this sign-in.
  return runWithTenant(tenant, () =>
    signIn("keycloak", { redirectTo })
  )
}
