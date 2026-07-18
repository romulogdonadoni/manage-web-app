import { AsyncLocalStorage } from "node:async_hooks"

/** Pass tenant into Auth.js config during `signIn` (same-request cookie may be missing). */
const tenantStore = new AsyncLocalStorage<string>()

export function runWithTenant<T>(tenant: string, fn: () => T): T {
  return tenantStore.run(tenant.toLowerCase(), fn)
}

export function getTenantOverride(): string | null {
  return tenantStore.getStore() ?? null
}
