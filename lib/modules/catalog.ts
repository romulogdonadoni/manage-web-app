export type ModuleId =
  | "auth"
  | "tenants"
  | "catalog"
  | "customers"
  | "orders"
  | "payments"
  | "inventory"
  | "reports"
  | "settings"
  | "products"
  | "menu"
  | "kds"
  | "delivery"
  | "counter"
  | "tables"
  | "reservations"
  | "loyalty"
  | "services"
  | "scheduling"
  | "pets"
  | "billing"
  | "age_gate"
  | "b2b"
  | "promotions"
  | "suppliers"
  | "fitting"
  | "ecommerce"
  | "vehicles"

export type IndustryId = "food.restaurant" | "pet.retail"

export type ModuleDef = {
  id: ModuleId
  label: string
  description: string
  /** Preço mensal em BRL. Core = 0 (incluso no plano base). */
  priceMonthly: number
  core?: boolean
}

export type IndustryModule = {
  id: ModuleId
  /** Incluído automaticamente na criação da empresa */
  recommended?: boolean
}

export type IndustryDef = {
  id: IndustryId
  label: string
  description: string
  group: string
  modules: IndustryModule[]
}

/** Plano base mensal (inclui todos os módulos core). */
export const BASE_PLAN_PRICE = 149

export const CORE_MODULES: ModuleDef[] = [
  {
    id: "auth",
    label: "Autenticação",
    description: "Login, Auth0, funcionários e roles",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "tenants",
    label: "Tenants",
    description: "Provisionamento, branding e config",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "catalog",
    label: "Catálogo",
    description: "Produtos/serviços, categorias e preços",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "customers",
    label: "Clientes",
    description: "Base de contatos e histórico",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "orders",
    label: "Pedidos",
    description: "Pedidos genéricos com status e totais",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "payments",
    label: "Pagamentos",
    description: "Pagamentos e conciliação básica",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "reports",
    label: "Relatórios",
    description: "Dashboards e relatórios básicos",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "settings",
    label: "Configurações",
    description: "Preferências, horários e impostos",
    priceMonthly: 0,
    core: true,
  },
  {
    id: "products",
    label: "Produtos",
    description: "Todos os itens da loja (cadastro completo)",
    priceMonthly: 0,
    core: true,
  },
]

export const OPTIONAL_MODULES: ModuleDef[] = [
  {
    id: "inventory",
    label: "Estoque",
    description: "Controle de estoque simples",
    priceMonthly: 39,
  },
  {
    id: "menu",
    label: "Cardápio",
    description: "Organize seções e itens do app",
    priceMonthly: 49,
  },
  {
    id: "kds",
    label: "Cozinha (KDS)",
    description: "Fila de preparo na cozinha",
    priceMonthly: 79,
  },
  {
    id: "delivery",
    label: "Delivery",
    description: "Entrega, taxas e áreas",
    priceMonthly: 59,
  },
  {
    id: "counter",
    label: "PDV / Balcão",
    description: "Venda no ponto de atendimento",
    priceMonthly: 69,
  },
  {
    id: "tables",
    label: "Mesas",
    description: "Mesas, comandas e salão",
    priceMonthly: 49,
  },
  {
    id: "reservations",
    label: "Reservas",
    description: "Reservas de mesa",
    priceMonthly: 39,
  },
  {
    id: "loyalty",
    label: "Fidelidade",
    description: "Stamp card e programas de pontos",
    priceMonthly: 35,
  },
  {
    id: "services",
    label: "Serviços",
    description: "Procedimentos, pacotes e profissionais",
    priceMonthly: 55,
  },
  {
    id: "scheduling",
    label: "Agenda",
    description: "Agendamento de serviços e consultas",
    priceMonthly: 49,
  },
  {
    id: "pets",
    label: "Pets",
    description: "Cadastro e prontuário de pets",
    priceMonthly: 45,
  },
  {
    id: "billing",
    label: "Faturamento",
    description: "Orçamentos e cobrança",
    priceMonthly: 39,
  },
  {
    id: "age_gate",
    label: "Restrição etária",
    description: "Compliance de idade para bebidas",
    priceMonthly: 25,
  },
  {
    id: "b2b",
    label: "B2B",
    description: "Venda para bares e restaurantes",
    priceMonthly: 59,
  },
  {
    id: "promotions",
    label: "Promoções",
    description: "Ofertas e combos",
    priceMonthly: 35,
  },
  {
    id: "suppliers",
    label: "Fornecedores",
    description: "Compras e fornecedores",
    priceMonthly: 39,
  },
  {
    id: "fitting",
    label: "Prova",
    description: "Controle de prova de roupas",
    priceMonthly: 19,
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Vitrine online / omnichannel",
    priceMonthly: 89,
  },
  {
    id: "vehicles",
    label: "Veículos",
    description: "Veículos do cliente",
    priceMonthly: 35,
  },
]

export const ALL_MODULES: ModuleDef[] = [...CORE_MODULES, ...OPTIONAL_MODULES]

const moduleById = Object.fromEntries(
  ALL_MODULES.map((module) => [module.id, module])
) as Record<ModuleId, ModuleDef>

export function getModule(id: ModuleId): ModuleDef {
  return moduleById[id]
}

export const INDUSTRIES: IndustryDef[] = [
  {
    id: "food.restaurant",
    label: "Restaurante",
    description: "Salão, comandas, cozinha e delivery",
    group: "Food",
    modules: [
      { id: "products", recommended: true },
      { id: "menu", recommended: true },
      { id: "tables", recommended: true },
      { id: "reservations", recommended: true },
      { id: "kds", recommended: true },
      { id: "delivery", recommended: true },
      { id: "counter", recommended: true },
      { id: "inventory", recommended: true },
    ],
  },
  {
    id: "pet.retail",
    label: "Petshop",
    description: "Produtos, banho, tosa e agenda",
    group: "Pet",
    modules: [
      { id: "catalog", recommended: true },
      { id: "services", recommended: true },
      { id: "scheduling", recommended: true },
      { id: "pets", recommended: true },
      { id: "inventory", recommended: true },
      { id: "counter", recommended: true },
    ],
  },
]

export function getIndustry(id: IndustryId): IndustryDef | undefined {
  return INDUSTRIES.find((industry) => industry.id === id)
}

export function recommendedModulesFor(industryId: IndustryId): ModuleId[] {
  const industry = getIndustry(industryId)
  if (!industry) return []
  return industry.modules
    .filter((module) => module.recommended)
    .map((module) => module.id)
}

/** Core + módulos recomendados do segmento. */
export function defaultModulesFor(industryId: IndustryId): ModuleId[] {
  const coreIds = CORE_MODULES.map((module) => module.id)
  const recommended = recommendedModulesFor(industryId)
  return Array.from(new Set([...coreIds, ...recommended]))
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

/**
 * Gera identifier a partir do nome.
 * `attempt` > 1 acrescenta sufixo (-2, -3…) quando o slug já existe.
 */
export function allocateIdentifier(name: string, attempt = 1): string {
  const base = slugify(name) || "loja"
  if (attempt <= 1) return base.slice(0, 50)

  const suffix = `-${attempt}`
  const maxBase = Math.max(2, 50 - suffix.length)
  return `${base.slice(0, maxBase)}${suffix}`
}
