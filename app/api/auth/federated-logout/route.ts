import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth, signOut } from "@/lib/auth"
import {
  TENANT_COOKIE,
  getKeycloakClientId,
  getKeycloakIssuer,
} from "@/lib/auth/constants"
import { resolveTenant } from "@/lib/auth/tenant-host"

export async function GET(request: Request) {
  const session = await auth()
  const jar = await cookies()
  const headerStore = await headers()
  const realm =
    session?.tenant ||
    resolveTenant({
      tenantHeader: headerStore.get("x-tenant-id"),
      cookieHeader: headerStore.get("cookie"),
    }) ||
    jar.get(TENANT_COOKIE)?.value
  const idToken = session?.idToken
  const origin = new URL(request.url).origin

  await signOut({ redirect: false })

  if (!realm) {
    return NextResponse.redirect(new URL("/onboarding", origin))
  }

  const logoutUrl = new URL(
    `${getKeycloakIssuer(realm)}/protocol/openid-connect/logout`
  )
  logoutUrl.searchParams.set("client_id", getKeycloakClientId())
  // Back to the app → proxy starts Keycloak OIDC again (Keycloakify).
  logoutUrl.searchParams.set("post_logout_redirect_uri", `${origin}/`)
  if (idToken) {
    logoutUrl.searchParams.set("id_token_hint", idToken)
  }

  return NextResponse.redirect(logoutUrl)
}
