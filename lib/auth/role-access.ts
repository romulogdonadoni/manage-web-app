import type { ModuleId } from "@/lib/modules/catalog"
import { getRouteBySlug, MODULE_ROUTES } from "@/lib/modules/nav"

export type TenantRole = "owner" | "admin" | "member"

export type MenuOption = {
  key: string
  label: string
  group: "shell" | "ops"
}

export type MenuPreset = {
  id: string
  label: string
  description: string
  menus: string[]
}

const MEMBER_ALLOWED: ReadonlySet<string> = new Set([
  "dashboard",
  "catalog",
  "customers",
  "orders",
  "payments",
  "inventory",
  "products",
  "menu",
  "kds",
  "delivery",
  "counter",
  "tables",
  "reservations",
  "loyalty",
  "services",
  "scheduling",
  "pets",
  "age_gate",
  "b2b",
  "promotions",
  "suppliers",
  "fitting",
  "ecommerce",
  "vehicles",
  "reports",
  "invoicing",
])

const ADMIN_DENIED: ReadonlySet<string> = new Set(["tenants"])

export const MENU_PRESETS: MenuPreset[] = [
  {
    id: "cashier",
    label: "Caixa",
    description: "PDV, pedidos e pagamentos",
    menus: ["dashboard", "counter", "orders", "payments"],
  },
  {
    id: "delivery",
    label: "Entregador",
    description: "Somente entregas",
    menus: ["dashboard", "delivery"],
  },
  {
    id: "kitchen",
    label: "Cozinha",
    description: "KDS e pedidos",
    menus: ["dashboard", "kds", "orders"],
  },
  {
    id: "ops",
    label: "Operação",
    description: "Menus operacionais padrão",
    menus: [...MEMBER_ALLOWED],
  },
]

export function editableMenuOptions(): MenuOption[] {
  const shell: MenuOption[] = [
    { key: "dashboard", label: "Dashboard", group: "shell" },
    { key: "auth", label: "Funcionários", group: "shell" },
    { key: "settings", label: "Loja", group: "shell" },
    { key: "billing", label: "Assinatura", group: "shell" },
    { key: "tenants", label: "Tenants", group: "shell" },
  ]

  // moduleId "billing" is the invoicing product module; shell "billing" is SaaS assinatura.
  const ops = MODULE_ROUTES.filter((r) => r.nav).map((r) => ({
    key: navAccessKeyForModule(r.moduleId),
    label: r.label,
    group: "ops" as const,
  }))

  return [...shell, ...ops]
}

/** Maps product module ids to permission keys (avoids collision with shell keys). */
export function navAccessKeyForModule(moduleId: string): string {
  if (moduleId === "billing") return "invoicing"
  return moduleId
}

export function normalizeTenantRole(
  role: string | null | undefined
): TenantRole {
  const value = role?.trim().toLowerCase()
  if (value === "owner" || value === "admin" || value === "member") return value
  return "member"
}

/**
 * @param allowedMenus Explicit allow-list from membership. `null`/`undefined` = role defaults.
 */
export function canAccessNav(
  role: string | null | undefined,
  accessKey: string,
  allowedMenus?: string[] | null
): boolean {
  const normalized = normalizeTenantRole(role)

  if (normalized === "owner") return true

  if (allowedMenus != null) {
    const set = new Set(allowedMenus.map((m) => m.toLowerCase()))
    set.add("dashboard")
    return set.has(accessKey.toLowerCase())
  }

  if (normalized === "admin") {
    return !ADMIN_DENIED.has(accessKey)
  }

  return MEMBER_ALLOWED.has(accessKey)
}

export function canManageTeam(role: string | null | undefined): boolean {
  const normalized = normalizeTenantRole(role)
  return normalized === "owner" || normalized === "admin"
}

export function accessKeyFromPathname(pathname: string): string {
  const clean = pathname.split("?")[0]?.replace(/\/+$/, "") || "/"
  if (clean === "/" || clean === "/dashboard") return "dashboard"
  if (clean === "/billing") return "billing"
  if (clean === "/settings") return "settings"
  if (clean === "/tenants") return "tenants"
  if (clean === "/users") return "auth"

  const slug = clean.replace(/^\//, "").split("/")[0]
  if (!slug) return "dashboard"

  const route = getRouteBySlug(slug)
  if (route) return navAccessKeyForModule(route.moduleId)

  return slug
}

export function moduleIdsVisibleForRole(
  role: string | null | undefined,
  modules: ModuleId[],
  allowedMenus?: string[] | null
): ModuleId[] {
  return modules.filter((id) => canAccessNav(role, id, allowedMenus))
}
