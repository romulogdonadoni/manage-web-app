"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect, type ReactNode } from "react"

/** Refetch session often enough to refresh Auth0 access tokens. */
const REFETCH_INTERVAL_SECONDS = 4 * 60

function SessionErrorWatcher() {
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (session?.error !== "RefreshAccessTokenError") return
    const callback = encodeURIComponent(pathname || "/")
    window.location.href = `/api/auth/login?callbackUrl=${callback}`
  }, [pathname, session?.error])

  return null
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={REFETCH_INTERVAL_SECONDS}
      refetchOnWindowFocus
    >
      <SessionErrorWatcher />
      {children}
    </SessionProvider>
  )
}
