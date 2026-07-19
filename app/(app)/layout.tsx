import SideBar from "@/components/app/side-bar"
import { RoleRouteGuard } from "@/components/app/role-route-guard"
import { SyncCurrentTenant } from "@/components/app/sync-current-tenant"
import { CurrentStoreProvider } from "@/lib/store/current-store-context"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CurrentStoreProvider>
      <div className="flex h-screen w-screen gap-6 bg-background-secondary p-6 md:gap-6 md:p-6">
        <SyncCurrentTenant />
        <SideBar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <RoleRouteGuard>{children}</RoleRouteGuard>
        </div>
      </div>
    </CurrentStoreProvider>
  )
}
