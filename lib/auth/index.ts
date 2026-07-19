import NextAuth from "next-auth"
import Auth0 from "next-auth/providers/auth0"

import "@/lib/auth/types"
import {
  getAuth0Audience,
  getAuth0ClientId,
  getAuth0ClientSecret,
  getAuth0Issuer,
} from "@/lib/auth/constants"
import {
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/auth/refresh-token"
import { applyAuthUrlFromRequest } from "@/lib/auth/request-origin"
import { getTenantOverride } from "@/lib/auth/tenant-context"
import { resolveTenant } from "@/lib/auth/tenant-host"

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  if (req) applyAuthUrlFromRequest(req)

  // Single Auth0 tenant. Path/cookie tenant is only for app routing.
  const issuer = getAuth0Issuer()
  const audience = getAuth0Audience()

  return {
    providers: [
      Auth0({
        clientId: getAuth0ClientId(),
        clientSecret: getAuth0ClientSecret(),
        issuer,
        authorization: {
          params: {
            scope: "openid profile email offline_access",
            audience,
          },
        },
      }),
    ],
    pages: {
      signIn: "/api/auth/login",
      error: "/api/auth/login",
    },
    callbacks: {
      async jwt({ token, account, profile, trigger, session }) {
        if (account) {
          token.accessToken = account.access_token
          token.idToken = account.id_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          token.error = undefined
        }

        // Refresh access token before it expires (or if already expired).
        if (!account && token.refreshToken && isAccessTokenExpired(token)) {
          token = await refreshAccessToken(token)
        }

        if (
          trigger === "update" &&
          session &&
          typeof session === "object" &&
          "tenant" in session &&
          typeof (session as { tenant?: unknown }).tenant === "string"
        ) {
          const updated = (session as { tenant: string }).tenant
            .trim()
            .toLowerCase()
          if (updated) token.tenant = updated
        }

        const tenant =
          getTenantOverride() ||
          resolveTenant({
            tenantHeader: req?.headers?.get("x-tenant-id"),
            cookieHeader: req?.headers?.get("cookie"),
          })

        // Prefer live cookie/header; clear when neither is present (avoid stale).
        if (tenant) {
          token.tenant = tenant
        } else if (trigger !== "update") {
          delete token.tenant
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
        session.error =
          typeof token.error === "string" ? token.error : undefined
        if (session.user && typeof token.sub === "string") {
          session.user.id = token.sub
        }
        return session
      },
    },
    trustHost: true,
  }
})
