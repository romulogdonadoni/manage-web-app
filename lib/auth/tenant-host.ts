import { TENANT_COOKIE } from "@/lib/auth/constants"

export const TENANT_HEADER = "x-tenant-id"

const TENANT_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

/** First path segments that must never be treated as a tenant slug. */
const RESERVED_SEGMENTS = new Set([
  "www",
  "app",
  "api",
  "auth",
  "admin",
  "mail",
  "status",
  "docs",
  "create",
  "onboarding",
  "account",
  "invite",
  "whitelabel",
  "_next",
  "tables",
  "services",
  "fitting",
  "scheduling",
  "settings",
  "profile",
  "inventory",
  "menu",
  "products",
  "invoicing",
  "promotions",
  "suppliers",
  "age-gate",
  "ecommerce",
  "b2b",
  "counter",
  "delivery",
  "reports",
  "customers",
  "payments",
  "pets",
  "catalog",
  "kds",
  "loyalty",
  "orders",
  "tenants",
  "users",
  "billing",
  "reservations",
  "vehicles",
  "dashboard",
])

/** Internal App Router path for the tenant home (browser URL is /{tenant}). */
export const TENANT_HOME_PATH = "/dashboard"

export function getRootDomain() {
  return (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^\./, "").toLowerCase() ||
    process.env.ROOT_DOMAIN?.replace(/^\./, "").toLowerCase() ||
    "whitelabel.com.br"
  )
}

export function isValidTenantSlug(value: string) {
  return TENANT_RE.test(value) && !RESERVED_SEGMENTS.has(value)
}

/**
 * Resolve tenant from the first path segment.
 * Examples:
 * - /cowboy-burger-67 → cowboy-burger-67
 * - /cowboy-burger-67/menu → cowboy-burger-67
 * - /create → null
 * - /onboarding → null
 */
export function resolveTenantFromPath(
  pathname: string | null | undefined
): string | null {
  if (!pathname) return null
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase()
  if (!segment) return null
  return isValidTenantSlug(segment) ? segment : null
}

/** Split `/{tenant}/rest` into tenant + remaining pathname (for rewrite). */
export function splitTenantPath(pathname: string): {
  tenant: string | null
  pathname: string
} {
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0]?.toLowerCase()
  if (!first || !isValidTenantSlug(first)) {
    return { tenant: null, pathname: pathname || "/" }
  }
  const rest = segments.slice(1)
  return {
    tenant: first,
    pathname:
      rest.length === 0 ? TENANT_HOME_PATH : `/${rest.join("/")}`,
  }
}

export function withTenantPrefix(tenant: string, pathname: string): string {
  if (pathname === TENANT_HOME_PATH || pathname === "/") {
    return `/${tenant}`
  }
  return `/${tenant}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}

export function isCompanyPickerPath(pathname: string) {
  return pathname === "/"
}

/** Global manage shell (companies + account) — never tenant-prefixed. */
export function isManageShellPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/invite" ||
    pathname.startsWith("/invite/")
  )
}

export function readTenantCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${TENANT_COOKIE}=([^;]+)`)
  )
  if (!match?.[1]) return null
  const value = decodeURIComponent(match[1]).toLowerCase()
  return isValidTenantSlug(value) ? value : null
}

/** Prefer path (or edge header); fall back to cookie / env for edge cases. */
export function resolveTenant(input: {
  pathname?: string | null
  tenantHeader?: string | null
  cookieHeader?: string | null
}): string | null {
  const fromHeader = input.tenantHeader?.trim().toLowerCase()
  if (fromHeader && isValidTenantSlug(fromHeader)) return fromHeader

  return (
    resolveTenantFromPath(input.pathname) ||
    readTenantCookie(input.cookieHeader ?? null)
  )
}
