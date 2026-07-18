import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"

import "@/lib/auth/types"
import {
  getKeycloakClientId,
  getKeycloakClientSecret,
  getKeycloakIssuer,
} from "@/lib/auth/constants"
import { applyAuthUrlFromRequest } from "@/lib/auth/request-origin"
import { getTenantOverride } from "@/lib/auth/tenant-context"
import { isValidTenantSlug, resolveTenant } from "@/lib/auth/tenant-host"

/** OIDC callback includes `iss` — keep token exchange on the same realm. */
function tenantFromCallbackUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    const iss = new URL(url).searchParams.get("iss")
    if (!iss) return null
    const match = iss.match(/\/realms\/([^/?#]+)/i)
    if (!match?.[1]) return null
    const slug = decodeURIComponent(match[1]).toLowerCase()
    return isValidTenantSlug(slug) ? slug : null
  } catch {
    return null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  if (req) applyAuthUrlFromRequest(req)

  const tenant =
    getTenantOverride() ||
    tenantFromCallbackUrl(req?.url) ||
    resolveTenant({
      tenantHeader: req?.headers?.get("x-tenant-id"),
      cookieHeader: req?.headers?.get("cookie"),
    })

  // Never use master for app login — that realm has no tenant client by design.
  // Placeholder issuer only satisfies Auth.js when config loads without a request.
  const realm = tenant || "master"
  const issuer = getKeycloakIssuer(realm)

  return {
    providers: [
      Keycloak({
        clientId: getKeycloakClientId(),
        clientSecret: getKeycloakClientSecret(),
        issuer,
      }),
    ],
    pages: {
      signIn: "/api/auth/login",
      error: "/api/auth/login",
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account) {
          token.accessToken = account.access_token
          token.idToken = account.id_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          token.tenant = realm
        }
        if (profile && "sub" in profile && typeof profile.sub === "string") {
          token.sub = profile.sub
        }
        return token
      },
      async session({ session, token }) {
        session.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined
        session.idToken =
          typeof token.idToken === "string" ? token.idToken : undefined
        session.tenant =
          typeof token.tenant === "string" ? token.tenant : undefined
        if (session.user && typeof token.sub === "string") {
          session.user.id = token.sub
        }
        return session
      },
    },
    trustHost: true,
  }
})
