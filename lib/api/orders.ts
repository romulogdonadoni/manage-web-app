import { apiFetch } from "@/lib/api/client"

export type ManageOrderListItem = {
  id: string
  publicNumber: string
  status: string
  fulfillment: string
  paymentMethod: string
  customerName: string
  customerPhone: string
  total: number
  createdAtUtc: string
  updatedAtUtc: string
  itemsSummary: string
}

export type ManageOrderDetail = {
  id: string
  publicNumber: string
  status: string
  fulfillment: string
  paymentMethod: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string | null
  addressCity: string | null
  addressReference: string | null
  subtotal: number
  deliveryFee: number
  total: number
  note: string | null
  createdAtUtc: string
  updatedAtUtc: string
  lines: {
    id: string
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
    imageUrl: string | null
    note: string | null
    optionsJson: string | null
  }[]
  latestPayment: {
    id: string
    status: string
    paymentMethodId: string | null
    statusDetail: string | null
    mercadoPagoPaymentId: number | null
  } | null
}

export function listTenantOrders(
  params: {
    status?: string
    since?: string
    take?: number
  },
  accessToken: string,
  tenantId: string
) {
  const qs = new URLSearchParams()
  if (params.status) qs.set("status", params.status)
  if (params.since) qs.set("since", params.since)
  if (params.take) qs.set("take", String(params.take))
  const q = qs.toString()
  return apiFetch<ManageOrderListItem[]>(`/tenant/orders${q ? `?${q}` : ""}`, {
    accessToken,
    tenantId,
  })
}

export function getTenantOrder(
  orderId: string,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<ManageOrderDetail>(`/tenant/orders/${orderId}`, {
    accessToken,
    tenantId,
  })
}

export function acceptTenantOrder(
  orderId: string,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<ManageOrderDetail>(`/tenant/orders/${orderId}/accept`, {
    method: "POST",
    accessToken,
    tenantId,
  })
}

export function rejectTenantOrder(
  orderId: string,
  reason: string | null,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<ManageOrderDetail>(`/tenant/orders/${orderId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    accessToken,
    tenantId,
  })
}

export function advanceTenantOrder(
  orderId: string,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<ManageOrderDetail>(`/tenant/orders/${orderId}/advance`, {
    method: "POST",
    accessToken,
    tenantId,
  })
}

export function cancelTenantOrder(
  orderId: string,
  reason: string | null,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<ManageOrderDetail>(`/tenant/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    accessToken,
    tenantId,
  })
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PendingPayment: "Aguardando pagamento",
  Paid: "Pago",
  AwaitingAcceptance: "Aguardando aceite",
  Received: "Recebido",
  Preparing: "Preparando",
  Ready: "Pronto",
  OutForDelivery: "Saiu para entrega",
  Delivered: "Entregue",
  Cancelled: "Cancelado",
}

export const FULFILLMENT_LABEL: Record<string, string> = {
  Delivery: "Entrega",
  Pickup: "Retirada",
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  MercadoPago: "Mercado Pago",
  Cash: "Dinheiro",
  CardOnDelivery: "Cartão na entrega",
}

export function advanceLabel(status: string, fulfillment: string): string | null {
  switch (status) {
    case "Received":
      return "Iniciar preparo"
    case "Preparing":
      return "Marcar pronto"
    case "Ready":
      return fulfillment === "Pickup" ? "Finalizar pedido" : "Enviar pedido"
    case "OutForDelivery":
      return "Finalizar pedido"
    default:
      return null
  }
}

/** Kanban columns for Cozinha (KDS). */
export type KdsColumnId = "pending" | "preparing" | "sending" | "done"

export function kdsColumnForOrder(order: {
  status: string
  fulfillment: string
}): KdsColumnId | null {
  switch (order.status) {
    case "AwaitingAcceptance":
    case "Received":
      return "pending"
    case "Preparing":
      return "preparing"
    case "Ready":
    case "OutForDelivery":
      return "sending"
    case "Delivered":
      return "done"
    default:
      return null
  }
}

export function formatElapsed(fromIso: string): string {
  const ms = Date.now() - new Date(fromIso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return "agora"
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  return `${hours}h ${mins % 60}min`
}
