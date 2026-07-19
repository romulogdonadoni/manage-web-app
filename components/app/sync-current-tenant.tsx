"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect } from "react"

import { getCurrentTenant } from "@/lib/api/tenants"
import { resolveTenantFromPath } from "@/lib/auth/tenant-host"
import { useCurrentStore } from "@/lib/store/current-store-context"

/**
 * Activates the path tenant (cookie + session) and loads GET /tenant/me.
 */
export function SyncCurrentTenant() {
  const pathname = usePathname()
  const { data: session, status, update } = useSession()
  const { setData, setRefreshHandler } = useCurrentStore()

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setData(null)
      return
    }

    const accessToken = session?.accessToken
    if (!accessToken) {
      setData(null)
      return
    }

    const browserPath =
      typeof window !== "undefined" ? window.location.pathname : pathname
    const pathTenant = resolveTenantFromPath(browserPath)

    let tenant = pathTenant || session?.tenant || null

    if (pathTenant && pathTenant !== session?.tenant) {
      try {
        const res = await fetch("/api/auth/tenant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenant: pathTenant }),
        })
        if (res.ok) {
          tenant = pathTenant
          await update({ tenant: pathTenant })
        }
      } catch (error) {
        console.error("Failed to activate tenant from route:", error)
      }
    }

    if (!tenant) {
      setData(null)
      return
    }

    try {
      const current = await getCurrentTenant(accessToken, tenant)
      setData(current)
    } catch (error) {
      console.error("Failed to sync current tenant/user with API:", error)
      setData(null)
    }
  }, [
    pathname,
    session?.accessToken,
    session?.tenant,
    setData,
    status,
    update,
  ])

  useEffect(() => {
    setRefreshHandler(refresh)
    return () => setRefreshHandler(null)
  }, [refresh, setRefreshHandler])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return null
}
