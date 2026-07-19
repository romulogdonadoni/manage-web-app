import type { IndustryId, ModuleId } from "@/lib/modules/catalog"
import { ALL_MODULES, getIndustry } from "@/lib/modules/catalog"
import {
  buildInvoice,
  type BillingState,
  type Invoice,
  type SubscriptionChange,
} from "@/lib/modules/billing"
import { getModule } from "@/lib/modules/catalog"

export type TenantProfile = {
  name: string
  identifier: string
  industry: IndustryId
  modules: ModuleId[]
  completedAt: string
}

export const TENANT_PROFILE_KEY = "whitelabel.tenant.profile"
export const BILLING_STATE_KEY = "whitelabel.tenant.billing"

export function saveTenantProfile(profile: TenantProfile) {
  window.localStorage.setItem(TENANT_PROFILE_KEY, JSON.stringify(profile))
}

export function loadTenantProfile(): TenantProfile | null {
  try {
    const raw = window.localStorage.getItem(TENANT_PROFILE_KEY)
    if (!raw) return null
    const profile = JSON.parse(raw) as TenantProfile

    if (!getIndustry(profile.industry)) {
      clearTenantProfile()
      return null
    }

    const validIds = new Set(ALL_MODULES.map((module) => module.id))
    const modules = profile.modules.filter((id) => validIds.has(id))

    return { ...profile, modules }
  } catch {
    return null
  }
}

export function clearTenantProfile() {
  window.localStorage.removeItem(TENANT_PROFILE_KEY)
}

export function loadBillingState(): BillingState {
  try {
    const raw = window.localStorage.getItem(BILLING_STATE_KEY)
    if (!raw) return { invoices: [], changes: [] }
    return JSON.parse(raw) as BillingState
  } catch {
    return { invoices: [], changes: [] }
  }
}

export function saveBillingState(state: BillingState) {
  window.localStorage.setItem(BILLING_STATE_KEY, JSON.stringify(state))
}

export function ensureBilling(modules: ModuleId[]): BillingState {
  const existing = loadBillingState()
  if (existing.invoices.length > 0) return existing
  return bootstrapBilling(modules)
}

/** Cria assinatura inicial após criar a empresa. */
export function bootstrapBilling(modules: ModuleId[]) {
  const previous = new Date()
  previous.setMonth(previous.getMonth() - 1)

  const state: BillingState = {
    invoices: [
      buildInvoice(modules, "paid", previous),
      buildInvoice(modules, "open", new Date()),
    ],
    changes: [],
  }

  saveBillingState(state)
  return state
}

/** Atualiza módulos do perfil e recalcula a fatura aberta. */
export function updateSubscriptionModules(
  nextModules: ModuleId[],
  changed?: { moduleId: ModuleId; action: "added" | "removed" }
) {
  const profile = loadTenantProfile()
  if (!profile) return null

  const previousModules = profile.modules
  const updated: TenantProfile = {
    ...profile,
    modules: nextModules,
  }
  saveTenantProfile(updated)

  const billing = loadBillingState()
  const openIndex = billing.invoices.findIndex((invoice) => invoice.status === "open")
  const refreshed = buildInvoice(nextModules, "open", new Date())

  let invoices: Invoice[]
  if (openIndex >= 0) {
    invoices = billing.invoices.map((invoice, index) =>
      index === openIndex
        ? {
            ...refreshed,
            id: invoice.id,
            issuedAt: invoice.issuedAt,
            dueAt: invoice.dueAt,
          }
        : invoice
    )
  } else {
    invoices = [refreshed, ...billing.invoices]
  }

  const changes = [...billing.changes]
  if (changed) {
    const module = getModule(changed.moduleId)
    const delta =
      changed.action === "added" ? module.priceMonthly : -module.priceMonthly

    const entry: SubscriptionChange = {
      id: `chg_${Date.now()}`,
      at: new Date().toISOString(),
      action: changed.action,
      moduleId: changed.moduleId,
      label: module.label,
      deltaMonthly: delta,
    }
    changes.unshift(entry)
  } else {
    const added = nextModules.filter((id) => !previousModules.includes(id))
    const removed = previousModules.filter((id) => !nextModules.includes(id))

    for (const moduleId of added) {
      const module = getModule(moduleId)
      changes.unshift({
        id: `chg_${Date.now()}_a_${moduleId}`,
        at: new Date().toISOString(),
        action: "added",
        moduleId,
        label: module.label,
        deltaMonthly: module.priceMonthly,
      })
    }
    for (const moduleId of removed) {
      const module = getModule(moduleId)
      changes.unshift({
        id: `chg_${Date.now()}_r_${moduleId}`,
        at: new Date().toISOString(),
        action: "removed",
        moduleId,
        label: module.label,
        deltaMonthly: -module.priceMonthly,
      })
    }
  }

  const nextState: BillingState = {
    invoices,
    changes: changes.slice(0, 40),
  }
  saveBillingState(nextState)

  return { profile: updated, billing: nextState }
}
