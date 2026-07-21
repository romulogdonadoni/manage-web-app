import { apiFetch } from "@/lib/api/client"

export type MenuCategoryDto = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export type MenuOptionDto = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

export type MenuOptionGroupDto = {
  id: string
  title: string
  minSelect: number
  maxSelect: number
  sortOrder: number
  isActive: boolean
  options: MenuOptionDto[]
}

export type MenuProductDto = {
  id: string
  categoryId: string
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  imageUrl: string | null
  badge: string | null
  isPopular: boolean
  isActive: boolean
  sortOrder: number
  optionGroupIds: string[]
}

type AuthOpts = { accessToken: string; tenantId: string }

export function listMenuCategories(
  opts: AuthOpts & { activeOnly?: boolean }
) {
  const qs = opts.activeOnly ? "?activeOnly=true" : ""
  return apiFetch<MenuCategoryDto[]>(`/tenant/menu/categories${qs}`, {
    method: "GET",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    cache: "no-store",
  })
}

export function createMenuCategory(name: string, opts: AuthOpts) {
  return apiFetch<MenuCategoryDto>("/tenant/menu/categories", {
    method: "POST",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify({ name }),
  })
}

export function updateMenuCategory(
  id: string,
  body: { name?: string; isActive?: boolean },
  opts: AuthOpts
) {
  return apiFetch<MenuCategoryDto>(`/tenant/menu/categories/${id}`, {
    method: "PATCH",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function deleteMenuCategory(id: string, opts: AuthOpts) {
  return apiFetch<void>(`/tenant/menu/categories/${id}`, {
    method: "DELETE",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
  })
}

export function listMenuProducts(
  opts: AuthOpts & { categoryId?: string; activeOnly?: boolean }
) {
  const qs = new URLSearchParams()
  if (opts.categoryId) qs.set("categoryId", opts.categoryId)
  if (opts.activeOnly) qs.set("activeOnly", "true")
  const q = qs.toString()
  return apiFetch<MenuProductDto[]>(
    `/tenant/menu/products${q ? `?${q}` : ""}`,
    {
      method: "GET",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      cache: "no-store",
    }
  )
}

export function createMenuProduct(
  body: {
    categoryId: string
    name: string
    description?: string
    price: number
    compareAtPrice?: number | null
    imageUrl?: string | null
    badge?: string | null
    isPopular?: boolean
    optionGroupIds?: string[]
  },
  opts: AuthOpts
) {
  return apiFetch<MenuProductDto>("/tenant/menu/products", {
    method: "POST",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function updateMenuProduct(
  id: string,
  body: Record<string, unknown>,
  opts: AuthOpts
) {
  return apiFetch<MenuProductDto>(`/tenant/menu/products/${id}`, {
    method: "PATCH",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function deleteMenuProduct(id: string, opts: AuthOpts) {
  return apiFetch<void>(`/tenant/menu/products/${id}`, {
    method: "DELETE",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
  })
}

export function setProductOptionGroups(
  id: string,
  optionGroupIds: string[],
  opts: AuthOpts
) {
  return apiFetch<MenuProductDto>(
    `/tenant/menu/products/${id}/option-groups`,
    {
      method: "PUT",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      body: JSON.stringify({ optionGroupIds }),
    }
  )
}

/**
 * Liga/desliga um grupo em vários produtos (visão “produtos do grupo”).
 * Mantém os demais grupos de cada produto.
 */
export async function setOptionGroupProducts(
  groupId: string,
  productIds: string[],
  allProducts: MenuProductDto[],
  opts: AuthOpts
) {
  const wanted = new Set(productIds)
  const updates: Promise<MenuProductDto>[] = []

  for (const product of allProducts) {
    const has = product.optionGroupIds.includes(groupId)
    const shouldHave = wanted.has(product.id)
    if (has === shouldHave) continue

    const next = shouldHave
      ? [...product.optionGroupIds, groupId]
      : product.optionGroupIds.filter((id) => id !== groupId)

    updates.push(setProductOptionGroups(product.id, next, opts))
  }

  if (updates.length === 0) return
  await Promise.all(updates)
}

export function listOptionGroups(opts: AuthOpts & { activeOnly?: boolean }) {
  const qs = opts.activeOnly ? "?activeOnly=true" : ""
  return apiFetch<MenuOptionGroupDto[]>(`/tenant/menu/option-groups${qs}`, {
    method: "GET",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    cache: "no-store",
  })
}

export function createOptionGroup(
  body: { title: string; minSelect: number; maxSelect: number },
  opts: AuthOpts
) {
  return apiFetch<MenuOptionGroupDto>("/tenant/menu/option-groups", {
    method: "POST",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function updateOptionGroup(
  id: string,
  body: {
    title?: string
    minSelect?: number
    maxSelect?: number
    isActive?: boolean
  },
  opts: AuthOpts
) {
  return apiFetch<MenuOptionGroupDto>(`/tenant/menu/option-groups/${id}`, {
    method: "PATCH",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function deleteOptionGroup(id: string, opts: AuthOpts) {
  return apiFetch<void>(`/tenant/menu/option-groups/${id}`, {
    method: "DELETE",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
  })
}

export function addOptionItem(
  groupId: string,
  body: { name: string; price: number; imageUrl?: string | null },
  opts: AuthOpts
) {
  return apiFetch<MenuOptionGroupDto>(
    `/tenant/menu/option-groups/${groupId}/options`,
    {
      method: "POST",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      body: JSON.stringify(body),
    }
  )
}

export function updateOptionItem(
  groupId: string,
  optionId: string,
  body: Record<string, unknown>,
  opts: AuthOpts
) {
  return apiFetch<MenuOptionGroupDto>(
    `/tenant/menu/option-groups/${groupId}/options/${optionId}`,
    {
      method: "PATCH",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      body: JSON.stringify(body),
    }
  )
}

export function deleteOptionItem(
  groupId: string,
  optionId: string,
  opts: AuthOpts
) {
  return apiFetch<MenuOptionGroupDto>(
    `/tenant/menu/option-groups/${groupId}/options/${optionId}`,
    {
      method: "DELETE",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
    }
  )
}

/** Presentation cardápio (Menu → Groups → Items). */
export type MenuGroupItemType = "Product" | "ProductGroup"

export type MenuGroupItemDto = {
  id: string
  type: string
  referenceId: string
  sortOrder: number
  isVisible: boolean
}

export type MenuGroupDto = {
  id: string
  menuId: string
  name: string
  sortOrder: number
  isActive: boolean
  items: MenuGroupItemDto[] | null
}

export type MenuDto = {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  isDefault: boolean
  groups: MenuGroupDto[] | null
}

export type MenuGroupItemInput = {
  type: MenuGroupItemType | string
  referenceId: string
  isVisible?: boolean
}

/** Lista menus; o backend garante o cardápio padrão "Cardápio". */
export function listMenus(opts: AuthOpts) {
  return apiFetch<MenuDto[]>("/tenant/menus", {
    method: "GET",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    cache: "no-store",
  })
}

export function getMenu(id: string, opts: AuthOpts) {
  return apiFetch<MenuDto>(`/tenant/menus/${id}`, {
    method: "GET",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    cache: "no-store",
  })
}

export function createMenu(
  body: { name: string; isDefault?: boolean },
  opts: AuthOpts
) {
  return apiFetch<MenuDto>("/tenant/menus", {
    method: "POST",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function updateMenu(
  id: string,
  body: {
    name?: string
    sortOrder?: number
    isActive?: boolean
    isDefault?: boolean
  },
  opts: AuthOpts
) {
  return apiFetch<MenuDto>(`/tenant/menus/${id}`, {
    method: "PATCH",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function deleteMenu(id: string, opts: AuthOpts) {
  return apiFetch<void>(`/tenant/menus/${id}`, {
    method: "DELETE",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
  })
}

export function listMenuGroups(menuId: string, opts: AuthOpts) {
  return apiFetch<MenuGroupDto[]>(`/tenant/menus/${menuId}/groups`, {
    method: "GET",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    cache: "no-store",
  })
}

export function getMenuGroup(
  menuId: string,
  groupId: string,
  opts: AuthOpts
) {
  return apiFetch<MenuGroupDto>(
    `/tenant/menus/${menuId}/groups/${groupId}`,
    {
      method: "GET",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      cache: "no-store",
    }
  )
}

export function createMenuGroup(
  menuId: string,
  body: { name: string },
  opts: AuthOpts
) {
  return apiFetch<MenuGroupDto>(`/tenant/menus/${menuId}/groups`, {
    method: "POST",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function updateMenuGroup(
  menuId: string,
  groupId: string,
  body: { name?: string; sortOrder?: number; isActive?: boolean },
  opts: AuthOpts
) {
  return apiFetch<MenuGroupDto>(
    `/tenant/menus/${menuId}/groups/${groupId}`,
    {
      method: "PATCH",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      body: JSON.stringify(body),
    }
  )
}

export function deleteMenuGroup(
  menuId: string,
  groupId: string,
  opts: AuthOpts
) {
  return apiFetch<void>(`/tenant/menus/${menuId}/groups/${groupId}`, {
    method: "DELETE",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
  })
}

/** Substitui a lista ordenada de itens do grupo (ordem = sortOrder). */
export function setMenuGroupItems(
  menuId: string,
  groupId: string,
  items: MenuGroupItemInput[],
  opts: AuthOpts
) {
  return apiFetch<MenuGroupDto>(
    `/tenant/menus/${menuId}/groups/${groupId}/items`,
    {
      method: "PUT",
      accessToken: opts.accessToken,
      tenantId: opts.tenantId,
      body: JSON.stringify({ items }),
    }
  )
}

export type ProductGroupPriceMode = "Fixed" | "SumProducts" | "Discount"
export type ProductGroupDiscountType = "Percentage" | "FixedAmount"

export type ProductGroupItemDto = {
  id: string
  productId: string
  quantity: number
  sortOrder: number
}

export type ProductGroupSlotProductDto = {
  id: string
  productId: string
  extraPrice: number
  sortOrder: number
  isDefault: boolean
}

export type ProductGroupSlotDto = {
  id: string
  title: string
  minSelect: number
  maxSelect: number
  sortOrder: number
  products: ProductGroupSlotProductDto[]
}

export type ProductGroupDto = {
  id: string
  categoryId: string | null
  name: string
  type: string
  priceMode: ProductGroupPriceMode | string
  price: number
  discountValue: number | null
  discountType: ProductGroupDiscountType | string | null
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  items: ProductGroupItemDto[]
  slots: ProductGroupSlotDto[]
}

export type ProductGroupItemInput = {
  productId: string
  quantity?: number
}

export type ProductGroupSlotProductInput = {
  productId: string
  extraPrice?: number
  isDefault?: boolean
}

export type ProductGroupSlotInput = {
  title: string
  minSelect?: number
  maxSelect?: number
  products?: ProductGroupSlotProductInput[]
}

export function listProductGroups(opts: AuthOpts & { activeOnly?: boolean }) {
  const qs = opts.activeOnly ? "?activeOnly=true" : ""
  return apiFetch<ProductGroupDto[]>(`/tenant/menu/product-groups${qs}`, {
    method: "GET",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    cache: "no-store",
  })
}

export function createProductGroup(
  body: {
    categoryId?: string | null
    name: string
    type?: string
    priceMode?: ProductGroupPriceMode | string
    price: number
    discountValue?: number | null
    discountType?: ProductGroupDiscountType | string | null
    description?: string | null
    imageUrl?: string | null
    items?: ProductGroupItemInput[]
    slots?: ProductGroupSlotInput[]
  },
  opts: AuthOpts
) {
  return apiFetch<ProductGroupDto>("/tenant/menu/product-groups", {
    method: "POST",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function updateProductGroup(
  id: string,
  body: Record<string, unknown>,
  opts: AuthOpts
) {
  return apiFetch<ProductGroupDto>(`/tenant/menu/product-groups/${id}`, {
    method: "PATCH",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify(body),
  })
}

export function deleteProductGroup(id: string, opts: AuthOpts) {
  return apiFetch<void>(`/tenant/menu/product-groups/${id}`, {
    method: "DELETE",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
  })
}

export function setProductGroupItems(
  id: string,
  items: ProductGroupItemInput[],
  opts: AuthOpts
) {
  return apiFetch<ProductGroupDto>(`/tenant/menu/product-groups/${id}/items`, {
    method: "PUT",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify({ items }),
  })
}

export function setProductGroupSlots(
  id: string,
  slots: ProductGroupSlotInput[],
  opts: AuthOpts
) {
  return apiFetch<ProductGroupDto>(`/tenant/menu/product-groups/${id}/slots`, {
    method: "PUT",
    accessToken: opts.accessToken,
    tenantId: opts.tenantId,
    body: JSON.stringify({ slots }),
  })
}
