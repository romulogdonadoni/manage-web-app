"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"

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
  const activatingTenantRef = useRef<string | null>(null)
  const lastSyncedKeyRef = useRef<string | null>(null)

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setData(null)
      lastSyncedKeyRef.current = null
      return
    }

    const accessToken = session?.accessToken
    if (!accessToken) {
      setData(null)
      lastSyncedKeyRef.current = null
      return
    }

    const browserPath =
      typeof window !== "undefined" ? window.location.pathname : pathname
    const pathTenant = resolveTenantFromPath(browserPath)

    let tenant = pathTenant || session?.tenant || null

    if (pathTenant && pathTenant !== session?.tenant) {
      if (activatingTenantRef.current === pathTenant) {
        return
      }

      activatingTenantRef.current = pathTenant
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
      } finally {
        activatingTenantRef.current = null
      }
    }

    if (!tenant) {
      setData(null)
      lastSyncedKeyRef.current = null
      return
    }

    const syncKey = `${tenant}:${accessToken.slice(0, 12)}`
    if (lastSyncedKeyRef.current === syncKey) {
      return
    }

    try {
      const current = await getCurrentTenant(accessToken, tenant)
      lastSyncedKeyRef.current = syncKey
      setData(current)
    } catch (error) {
      console.error("Failed to sync current tenant/user with API:", error)
      lastSyncedKeyRef.current = null
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
    setRefreshHandler(() => {
      lastSyncedKeyRef.current = null
      return refresh()
    })
    return () => setRefreshHandler(null)
  }, [refresh, setRefreshHandler])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return null
}
