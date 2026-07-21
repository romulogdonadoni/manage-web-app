import {
  BASE_PLAN_PRICE,
  CORE_MODULES,
  getModule,
  type ModuleId,
} from "@/lib/modules/catalog"

export { BASE_PLAN_PRICE }

export type InvoiceStatus = "paid" | "open" | "overdue"

export type InvoiceLineItem = {
  label: string
  amount: number
  moduleId?: ModuleId
}

export type Invoice = {
  id: string
  period: string
  status: InvoiceStatus
  amount: number
  lineItems: InvoiceLineItem[]
  issuedAt: string
  dueAt: string
  paidAt?: string
}

export type SubscriptionChange = {
  id: string
  at: string
  action: "added" | "removed"
  moduleId: ModuleId
  label: string
  deltaMonthly: number
}

export type BillingState = {
  invoices: Invoice[]
  changes: SubscriptionChange[]
}

import { formatCurrencyBRL } from "@/lib/format/currency"

export function formatBRL(value: number): string {
  return formatCurrencyBRL(value)
}

export function subscriptionLineItems(modules: ModuleId[]): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [
    {
      label: "Plano base (core incluso)",
      amount: BASE_PLAN_PRICE,
    },
  ]

  for (const id of modules) {
    const module = getModule(id)
    if (module.core || module.priceMonthly <= 0) continue
    items.push({
      label: module.label,
      amount: module.priceMonthly,
      moduleId: id,
    })
  }

  return items
}

export function calculateMonthlyTotal(modules: ModuleId[]): number {
  return subscriptionLineItems(modules).reduce(
    (sum, item) => sum + item.amount,
    0
  )
}

export function optionalModulesTotal(modules: ModuleId[]): number {
  return modules.reduce((sum, id) => {
    const module = getModule(id)
    if (module.core) return sum
    return sum + module.priceMonthly
  }, 0)
}

export function coreModuleIds(): ModuleId[] {
  return CORE_MODULES.map((module) => module.id)
}

export function currentPeriodLabel(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(date)
}

export function buildInvoice(
  modules: ModuleId[],
  status: InvoiceStatus = "open",
  date = new Date()
): Invoice {
  const lineItems = subscriptionLineItems(modules)
  const amount = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const issuedAt = date.toISOString()
  const due = new Date(date)
  due.setDate(due.getDate() + 10)

  return {
    id: `inv_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}_${Math.random().toString(36).slice(2, 7)}`,
    period: currentPeriodLabel(date),
    status,
    amount,
    lineItems,
    issuedAt,
    dueAt: due.toISOString(),
    paidAt: status === "paid" ? issuedAt : undefined,
  }
}
