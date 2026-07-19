"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

import {
  accessKeyFromPathname,
  canAccessNav,
} from "@/lib/auth/role-access"
import {
  resolveTenantFromPath,
  splitTenantPath,
  withTenantPrefix,
} from "@/lib/auth/tenant-host"
import { useCurrentStore } from "@/lib/store/current-store-context"

/**
 * Redirects away from routes the current tenant role cannot access.
 */
export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: store } = useCurrentStore()

  const appPathname = useMemo(() => {
    return resolveTenantFromPath(pathname)
      ? splitTenantPath(pathname).pathname
      : pathname
  }, [pathname])

  const accessKey = useMemo(
    () => accessKeyFromPathname(appPathname),
    [appPathname]
  )

  const role = store?.user?.tenantRole ?? null
  const allowedMenus = store?.user?.allowedMenus ?? null
  const allowed = !store?.user || canAccessNav(role, accessKey, allowedMenus)

  useEffect(() => {
    if (!store?.user || allowed) return

    const tenant =
      store.identifier ||
      resolveTenantFromPath(pathname) ||
      null
    const fallback = tenant
      ? withTenantPrefix(tenant, "/dashboard")
      : "/"
    router.replace(fallback)
  }, [allowed, pathname, router, store?.identifier, store?.user])

  if (store?.user && !allowed) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed p-10 text-sm text-muted-foreground">
        Sem permissão para este menu.
      </div>
    )
  }

  return children
}
