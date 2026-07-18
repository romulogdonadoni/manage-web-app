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
  | "menu"
  | "modifiers"
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

export type IndustryId =
  | "food.burger"
  | "food.restaurant"
  | "food.cafe"
  | "food.pizza"
  | "pet.retail"
  | "pet.clinic"
  | "retail.liquor"
  | "retail.grocery"
  | "retail.fashion"
  | "services.beauty"
  | "services.auto"

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
  /** Pré-selecionado no onboarding */
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
    description: "Login, realm Keycloak, usuários e roles",
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
    description: "Cardápio com categorias e destaques",
    priceMonthly: 49,
  },
  {
    id: "modifiers",
    label: "Modifiers",
    description: "Adicionais, remoções e personalizações",
    priceMonthly: 29,
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
    id: "food.burger",
    label: "Hamburgueria",
    description: "Smash, delivery e fila de cozinha",
    group: "Food",
    modules: [
      { id: "menu", recommended: true },
      { id: "modifiers", recommended: true },
      { id: "kds", recommended: true },
      { id: "delivery", recommended: true },
      { id: "counter", recommended: true },
      { id: "tables" },
      { id: "inventory" },
    ],
  },
  {
    id: "food.restaurant",
    label: "Restaurante",
    description: "Salão, comandas e reservas",
    group: "Food",
    modules: [
      { id: "menu", recommended: true },
      { id: "modifiers", recommended: true },
      { id: "tables", recommended: true },
      { id: "reservations", recommended: true },
      { id: "kds", recommended: true },
      { id: "delivery" },
      { id: "counter", recommended: true },
      { id: "inventory" },
    ],
  },
  {
    id: "food.cafe",
    label: "Cafeteria / Padaria",
    description: "PDV rápido e vitrine do dia",
    group: "Food",
    modules: [
      { id: "menu", recommended: true },
      { id: "modifiers", recommended: true },
      { id: "counter", recommended: true },
      { id: "loyalty", recommended: true },
      { id: "delivery" },
    ],
  },
  {
    id: "food.pizza",
    label: "Pizzaria",
    description: "Sabores, forno e delivery",
    group: "Food",
    modules: [
      { id: "menu", recommended: true },
      { id: "modifiers", recommended: true },
      { id: "delivery", recommended: true },
      { id: "kds", recommended: true },
      { id: "counter", recommended: true },
    ],
  },
  {
    id: "pet.retail",
    label: "Petshop",
    description: "Produtos, banho e tosa",
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
  {
    id: "pet.clinic",
    label: "Clínica veterinária",
    description: "Prontuário, agenda e faturamento",
    group: "Pet",
    modules: [
      { id: "pets", recommended: true },
      { id: "scheduling", recommended: true },
      { id: "services", recommended: true },
      { id: "catalog", recommended: true },
      { id: "inventory", recommended: true },
      { id: "billing", recommended: true },
    ],
  },
  {
    id: "retail.liquor",
    label: "Adega / Bebidas",
    description: "Estoque, restrição etária e B2B",
    group: "Retail",
    modules: [
      { id: "catalog", recommended: true },
      { id: "age_gate", recommended: true },
      { id: "inventory", recommended: true },
      { id: "b2b" },
      { id: "counter", recommended: true },
      { id: "delivery" },
    ],
  },
  {
    id: "retail.grocery",
    label: "Mercado / Minimercado",
    description: "PDV, estoque e promoções",
    group: "Retail",
    modules: [
      { id: "catalog", recommended: true },
      { id: "inventory", recommended: true },
      { id: "counter", recommended: true },
      { id: "promotions", recommended: true },
      { id: "suppliers" },
    ],
  },
  {
    id: "retail.fashion",
    label: "Loja de roupas",
    description: "Grade, estoque e omnichannel",
    group: "Retail",
    modules: [
      { id: "catalog", recommended: true },
      { id: "inventory", recommended: true },
      { id: "counter", recommended: true },
      { id: "fitting" },
      { id: "ecommerce" },
    ],
  },
  {
    id: "services.beauty",
    label: "Barbearia / Salão",
    description: "Agenda por profissional e fidelidade",
    group: "Services",
    modules: [
      { id: "services", recommended: true },
      { id: "scheduling", recommended: true },
      { id: "catalog" },
      { id: "loyalty", recommended: true },
      { id: "counter", recommended: true },
    ],
  },
  {
    id: "services.auto",
    label: "Oficina / Auto center",
    description: "OS, peças e agenda de boxes",
    group: "Services",
    modules: [
      { id: "services", recommended: true },
      { id: "vehicles", recommended: true },
      { id: "catalog", recommended: true },
      { id: "inventory", recommended: true },
      { id: "scheduling", recommended: true },
      { id: "billing", recommended: true },
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

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}
