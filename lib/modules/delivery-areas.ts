export type LatLngPoint = {
  lat: number
  lng: number
}

export type DeliveryArea = {
  id: string
  name: string
  feeCents: number
  etaMinutesMin: number
  etaMinutesMax: number
  active: boolean
  path: LatLngPoint[]
  color: string
}

export const DELIVERY_AREA_COLORS = [
  "#0d9488",
  "#2563eb",
  "#c2410c",
  "#7c3aed",
  "#ca8a04",
  "#db2777",
] as const

export const DEFAULT_MAP_CENTER: LatLngPoint = {
  lat: -23.5505,
  lng: -46.6333,
}

const STORAGE_PREFIX = "whitelabel.delivery.areas."

function storageKey(tenantId: string) {
  return `${STORAGE_PREFIX}${tenantId.trim().toLowerCase()}`
}

function isPoint(value: unknown): value is LatLngPoint {
  if (!value || typeof value !== "object") return false
  const point = value as LatLngPoint
  return typeof point.lat === "number" && typeof point.lng === "number"
}

function normalizeArea(raw: unknown, index: number): DeliveryArea | null {
  if (!raw || typeof raw !== "object") return null
  const area = raw as Partial<DeliveryArea>
  if (!area.id || typeof area.id !== "string") return null
  if (!Array.isArray(area.path) || area.path.length < 3) return null
  if (!area.path.every(isPoint)) return null

  return {
    id: area.id,
    name:
      typeof area.name === "string" && area.name.trim()
        ? area.name.trim()
        : `Área ${index + 1}`,
    feeCents: typeof area.feeCents === "number" ? Math.max(0, area.feeCents) : 0,
    etaMinutesMin:
      typeof area.etaMinutesMin === "number" ? Math.max(0, area.etaMinutesMin) : 20,
    etaMinutesMax:
      typeof area.etaMinutesMax === "number" ? Math.max(0, area.etaMinutesMax) : 40,
    active: area.active !== false,
    path: area.path,
    color:
      typeof area.color === "string" && area.color
        ? area.color
        : DELIVERY_AREA_COLORS[index % DELIVERY_AREA_COLORS.length]!,
  }
}

export function loadDeliveryAreas(tenantId: string): DeliveryArea[] {
  if (typeof window === "undefined" || !tenantId.trim()) return []
  try {
    const raw = window.localStorage.getItem(storageKey(tenantId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item, index) => normalizeArea(item, index))
      .filter((area): area is DeliveryArea => area !== null)
  } catch {
    return []
  }
}

export function saveDeliveryAreas(tenantId: string, areas: DeliveryArea[]) {
  if (typeof window === "undefined" || !tenantId.trim()) return
  window.localStorage.setItem(storageKey(tenantId), JSON.stringify(areas))
}

export function createDeliveryAreaId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `area_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function nextAreaColor(existing: DeliveryArea[]) {
  return DELIVERY_AREA_COLORS[existing.length % DELIVERY_AREA_COLORS.length]!
}

export function centerFromAreas(areas: DeliveryArea[]): LatLngPoint {
  const points = areas.flatMap((area) => area.path)
  if (points.length === 0) return DEFAULT_MAP_CENTER

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  )

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  }
}

export function formatFeeBrl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function parseFeeToCents(input: string) {
  const normalized = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
  const value = Number.parseFloat(normalized)
  if (Number.isNaN(value) || value < 0) return 0
  return Math.round(value * 100)
}
