import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { signIn } from "@/lib/auth"
import { TENANT_COOKIE } from "@/lib/auth/constants"
import { applyAuthUrlFromRequest } from "@/lib/auth/request-origin"
import {
  isManageShellPath,
  resolveTenant,
  resolveTenantFromPath,
} from "@/lib/auth/tenant-host"

/**
 * Starts Auth0 OIDC against the shared tenant.
 * Tenant cookie is only for path routing / X-Tenant-Id — not the Auth0 tenant.
 */
export async function GET(request: Request) {
  const authOrigin = applyAuthUrlFromRequest(request)
  const url = new URL(request.url)
  const origin = authOrigin || url.origin

  const error = url.searchParams.get("error")
  if (error) {
    return NextResponse.redirect(
      new URL(`/create?authError=${encodeURIComponent(error)}`, origin)
    )
  }

  const callbackUrl = url.searchParams.get("callbackUrl") || "/"
  let callbackPath = "/"
  try {
    callbackPath = new URL(callbackUrl, origin).pathname
  } catch {
    callbackPath = callbackUrl.startsWith("/") ? callbackUrl : "/"
  }

  const tenant =
    resolveTenantFromPath(callbackUrl) ||
    resolveTenant({
      tenantHeader: request.headers.get("x-tenant-id"),
      cookieHeader: request.headers.get("cookie"),
    })

  if (tenant) {
    const jar = await cookies()
    jar.set(TENANT_COOKIE, tenant, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  const redirectTo = isManageShellPath(callbackPath)
    ? callbackPath
    : callbackUrl && callbackUrl !== "/"
      ? callbackUrl
      : tenant
        ? `/${tenant}`
        : "/"

  return signIn("auth0", { redirectTo })
}
