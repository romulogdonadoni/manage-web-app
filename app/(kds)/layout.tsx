import { RoleRouteGuard } from "@/components/app/role-route-guard"
import { SyncCurrentTenant } from "@/components/app/sync-current-tenant"
import { CurrentStoreProvider } from "@/lib/store/current-store-context"

/** Cozinha em tela cheia — sem sidebar nem barra de status da loja. */
export default function KdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrentStoreProvider>
      <div className="flex h-svh w-screen flex-col overflow-hidden bg-background">
        <SyncCurrentTenant />
        <RoleRouteGuard>{children}</RoleRouteGuard>
      </div>
    </CurrentStoreProvider>
  )
}
