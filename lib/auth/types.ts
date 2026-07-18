import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    idToken?: string
    tenant?: string
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
  }
}
