export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  accessToken?: string | null
  tenantId?: string | null
  headers?: HeadersInit
}

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:5247"
  )
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { accessToken, tenantId, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)
  const baseUrl = getApiBaseUrl()

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
  if (tenantId) {
    headers.set("X-Tenant-Id", tenantId)
  }
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  // Ngrok free interstitial breaks JSON/CORS unless this header is present.
  if (
    /ngrok/i.test(baseUrl) &&
    !headers.has("ngrok-skip-browser-warning")
  ) {
    headers.set("ngrok-skip-browser-warning", "true")
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers,
  })

  if (!response.ok) {
    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = undefined
    }

    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : response.statusText || `HTTP ${response.status}`

    throw new ApiError(response.status, message, body)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
