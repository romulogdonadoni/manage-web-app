import { cookies } from "next/headers"

import { RoleRouteGuard } from "@/components/app/role-route-guard"
import SideBar from "@/components/app/side-bar"
import { StoreStatusBar } from "@/components/app/store-status-bar"
import { SyncCurrentTenant } from "@/components/app/sync-current-tenant"
import {
  isSidebarCollapsedValue,
  SIDEBAR_COLLAPSED_KEY,
} from "@/lib/sidebar-preference"
import { CurrentStoreProvider } from "@/lib/store/current-store-context"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const jar = await cookies()
  const initialCollapsed = isSidebarCollapsedValue(
    jar.get(SIDEBAR_COLLAPSED_KEY)?.value
  )

  return (
    <CurrentStoreProvider>
      <div className="flex h-screen w-screen flex-col bg-background-secondary">
        <div className="flex h-8 shrink-0 items-center justify-end gap-3 border-b bg-background px-6 py-3 text-xs">
          <StoreStatusBar />
        </div>
        <div className="flex flex-1 gap-6 px-6 py-3 md:gap-6 md:px-6 md:py-3">
          <SyncCurrentTenant />
          <SideBar initialCollapsed={initialCollapsed} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
            <RoleRouteGuard>{children}</RoleRouteGuard>
          </div>
        </div>
      </div>
    </CurrentStoreProvider>
  )
}
