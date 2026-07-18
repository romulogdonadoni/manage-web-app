export type Company = {
  slug: string
  name: string
  industry: string
  status: "active" | "provisioning" | "inactive"
}

/** Mock companies for the signed-in user until GET /tenants is wired. */
export const USER_COMPANIES: Company[] = [
  {
    slug: "cowboy-burger-67",
    name: "Cowboy Burger 67",
    industry: "Hamburgueria",
    status: "active",
  },
  {
    slug: "acme-burger",
    name: "Acme Burger",
    industry: "Hamburgueria",
    status: "active",
  },
  {
    slug: "nova-retail",
    name: "Nova Retail",
    industry: "Varejo",
    status: "provisioning",
  },
]
