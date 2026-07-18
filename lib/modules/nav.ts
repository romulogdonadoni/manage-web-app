import type { LucideIcon } from "lucide-react"
import {
  Bike,
  Boxes,
  CalendarDays,
  Car,
  ClipboardList,
  CookingPot,
  CreditCard,
  Gift,
  Grid2x2,
  Handshake,
  IdCard,
  LayoutGrid,
  Package,
  PawPrint,
  Percent,
  ScanFace,
  Shirt,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react"

import { getModule, type ModuleId } from "@/lib/modules/catalog"

export type ModuleRoute = {
  moduleId: ModuleId
  /** Path sem barra inicial */
  slug: string
  href: string
  label: string
  description: string
  icon: LucideIcon
  /** Aparece no menu lateral */
  nav?: boolean
}

/**
 * Rotas de produto. `/billing` fica reservado para assinatura SaaS;
 * o módulo de faturamento operacional usa `/invoicing`.
 */
export const MODULE_ROUTES: ModuleRoute[] = [
  {
    moduleId: "auth",
    slug: "users",
    href: "/users",
    label: "Usuários",
    description: "Contas, roles e acesso do realm",
    icon: Users,
    nav: true,
  },
  {
    moduleId: "catalog",
    slug: "catalog",
    href: "/catalog",
    label: "Catálogo",
    description: "Produtos, categorias e preços",
    icon: LayoutGrid,
    nav: true,
  },
  {
    moduleId: "customers",
    slug: "customers",
    href: "/customers",
    label: "Clientes",
    description: "Base de contatos e histórico",
    icon: IdCard,
    nav: true,
  },
  {
    moduleId: "orders",
    slug: "orders",
    href: "/orders",
    label: "Pedidos",
    description: "Fila e status de pedidos",
    icon: ShoppingBag,
    nav: true,
  },
  {
    moduleId: "payments",
    slug: "payments",
    href: "/payments",
    label: "Pagamentos",
    description: "Recebimentos e conciliação",
    icon: Wallet,
    nav: true,
  },
  {
    moduleId: "inventory",
    slug: "inventory",
    href: "/inventory",
    label: "Estoque",
    description: "Saldo, rupturas e movimentações",
    icon: Package,
    nav: true,
  },
  {
    moduleId: "reports",
    slug: "reports",
    href: "/reports",
    label: "Relatórios",
    description: "Indicadores e exportações",
    icon: ClipboardList,
    nav: true,
  },
  {
    moduleId: "menu",
    slug: "menu",
    href: "/menu",
    label: "Cardápio",
    description: "Itens, categorias e destaques",
    icon: UtensilsCrossed,
    nav: true,
  },
  {
    moduleId: "modifiers",
    slug: "modifiers",
    href: "/modifiers",
    label: "Modifiers",
    description: "Adicionais, remoções e grupos",
    icon: Tags,
    nav: true,
  },
  {
    moduleId: "kds",
    slug: "kds",
    href: "/kds",
    label: "Cozinha",
    description: "Fila de preparo (KDS)",
    icon: CookingPot,
    nav: true,
  },
  {
    moduleId: "delivery",
    slug: "delivery",
    href: "/delivery",
    label: "Delivery",
    description: "Entregas, taxas e áreas",
    icon: Bike,
    nav: true,
  },
  {
    moduleId: "counter",
    slug: "counter",
    href: "/counter",
    label: "PDV",
    description: "Venda no balcão / caixa",
    icon: Store,
    nav: true,
  },
  {
    moduleId: "tables",
    slug: "tables",
    href: "/tables",
    label: "Mesas",
    description: "Salão, comandas e ocupação",
    icon: Grid2x2,
    nav: true,
  },
  {
    moduleId: "reservations",
    slug: "reservations",
    href: "/reservations",
    label: "Reservas",
    description: "Reservas de mesa e horários",
    icon: CalendarDays,
    nav: true,
  },
  {
    moduleId: "loyalty",
    slug: "loyalty",
    href: "/loyalty",
    label: "Fidelidade",
    description: "Pontos, stamps e recompensas",
    icon: Gift,
    nav: true,
  },
  {
    moduleId: "services",
    slug: "services",
    href: "/services",
    label: "Serviços",
    description: "Procedimentos e pacotes",
    icon: Wrench,
    nav: true,
  },
  {
    moduleId: "scheduling",
    slug: "scheduling",
    href: "/scheduling",
    label: "Agenda",
    description: "Agendamentos e profissionais",
    icon: CalendarDays,
    nav: true,
  },
  {
    moduleId: "pets",
    slug: "pets",
    href: "/pets",
    label: "Pets",
    description: "Cadastro e prontuário",
    icon: PawPrint,
    nav: true,
  },
  {
    moduleId: "billing",
    slug: "invoicing",
    href: "/invoicing",
    label: "Faturamento",
    description: "Orçamentos e cobrança operacional",
    icon: CreditCard,
    nav: true,
  },
  {
    moduleId: "age_gate",
    slug: "age-gate",
    href: "/age-gate",
    label: "Idade",
    description: "Verificação etária na venda",
    icon: ScanFace,
    nav: true,
  },
  {
    moduleId: "b2b",
    slug: "b2b",
    href: "/b2b",
    label: "B2B",
    description: "Contas e pedidos atacado",
    icon: Handshake,
    nav: true,
  },
  {
    moduleId: "promotions",
    slug: "promotions",
    href: "/promotions",
    label: "Promoções",
    description: "Ofertas, combos e cupons",
    icon: Percent,
    nav: true,
  },
  {
    moduleId: "suppliers",
    slug: "suppliers",
    href: "/suppliers",
    label: "Fornecedores",
    description: "Compras e abastecimento",
    icon: Truck,
    nav: true,
  },
  {
    moduleId: "fitting",
    slug: "fitting",
    href: "/fitting",
    label: "Prova",
    description: "Controle de peças em prova",
    icon: Shirt,
    nav: true,
  },
  {
    moduleId: "ecommerce",
    slug: "ecommerce",
    href: "/ecommerce",
    label: "E-commerce",
    description: "Vitrine e pedidos online",
    icon: Boxes,
    nav: true,
  },
  {
    moduleId: "vehicles",
    slug: "vehicles",
    href: "/vehicles",
    label: "Veículos",
    description: "Frota / veículos do cliente",
    icon: Car,
    nav: true,
  },
]

const bySlug = Object.fromEntries(
  MODULE_ROUTES.map((route) => [route.slug, route])
)

const byModuleId = Object.fromEntries(
  MODULE_ROUTES.map((route) => [route.moduleId, route])
) as Record<ModuleId, ModuleRoute | undefined>

export function getRouteBySlug(slug: string): ModuleRoute | undefined {
  return bySlug[slug]
}

export function getRouteByModuleId(id: ModuleId): ModuleRoute | undefined {
  return byModuleId[id]
}

export function modulePageTitle(id: ModuleId): string {
  return getRouteByModuleId(id)?.label ?? getModule(id).label
}
