import type { JWT } from "next-auth/jwt"

import {
  getAuth0Audience,
  getAuth0ClientId,
  getAuth0ClientSecret,
  getAuth0Issuer,
} from "@/lib/auth/constants"

/** Refresh ~60s before expiry to avoid edge races. */
const EXPIRY_SKEW_SECONDS = 60

type Auth0TokenResponse = {
  access_token: string
  expires_in: number
  refresh_expires_in?: number
  refresh_token?: string
  id_token?: string
  token_type?: string
  scope?: string
  error?: string
  error_description?: string
}

export function isAccessTokenExpired(token: JWT): boolean {
  if (typeof token.expiresAt !== "number") return true
  const now = Math.floor(Date.now() / 1000)
  return now >= token.expiresAt - EXPIRY_SKEW_SECONDS
}

/**
 * Exchange Auth0 refresh_token for a new access_token (and rotated refresh if returned).
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  const refreshToken =
    typeof token.refreshToken === "string" ? token.refreshToken : null
  if (!refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" }
  }

  const issuer = getAuth0Issuer()
  const url = `${issuer}oauth/token`

  try {
    const body = new URLSearchParams({
      client_id: getAuth0ClientId(),
      client_secret: getAuth0ClientSecret(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })

    const audience = getAuth0Audience()
    if (audience) {
      body.set("audience", audience)
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })

    const data = (await response.json()) as Auth0TokenResponse

    if (!response.ok || !data.access_token) {
      console.error(
        "Auth0 token refresh failed:",
        data.error || response.status,
        data.error_description
      )
      return {
        ...token,
        error: "RefreshAccessTokenError",
      }
    }

    const next: JWT = {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      error: undefined,
    }

    if (data.refresh_token) {
      next.refreshToken = data.refresh_token
    }
    if (data.id_token) {
      next.idToken = data.id_token
    }

    return next
  } catch (error) {
    console.error("Auth0 token refresh error:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
