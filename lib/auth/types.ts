import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    idToken?: string
    tenant?: string
    /** Set when Auth0 refresh_token exchange fails — client should re-login. */
    error?: string
    user: DefaultSession["user"] & {
      id?: string
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string
    idToken?: string
    refreshToken?: string
    expiresAt?: number
    tenant?: string
    error?: string
  }
}
