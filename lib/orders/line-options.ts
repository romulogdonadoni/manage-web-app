export type OrderLineSelectedOption = {
  groupId: string
  optionId: string
  name: string
  price: number
  productId?: string
}

export type OrderLineSlotSelection = {
  slotId: string
  productId: string
  slotTitle?: string
  productName?: string
}

export type OrderLineFixedItem = {
  productId: string
  name: string
  quantity: number
}

export type OrderLineOptionsPayload = {
  selectedOptions?: OrderLineSelectedOption[]
  slotSelections?: OrderLineSlotSelection[]
  fixedItems?: OrderLineFixedItem[]
}

export function parseOrderLineOptions(
  raw: string | null | undefined
): OrderLineOptionsPayload {
  if (!raw?.trim()) return {}
  try {
    const parsed = JSON.parse(raw) as OrderLineOptionsPayload
    return {
      selectedOptions: Array.isArray(parsed.selectedOptions)
        ? parsed.selectedOptions
        : [],
      slotSelections: Array.isArray(parsed.slotSelections)
        ? parsed.slotSelections
        : [],
      fixedItems: Array.isArray(parsed.fixedItems) ? parsed.fixedItems : [],
    }
  } catch {
    return {}
  }
}

export function orderLineHasDetails(
  options: OrderLineOptionsPayload,
  note?: string | null
) {
  return (
    (options.fixedItems?.length ?? 0) > 0 ||
    (options.slotSelections?.length ?? 0) > 0 ||
    (options.selectedOptions?.length ?? 0) > 0 ||
    Boolean(note?.trim())
  )
}
