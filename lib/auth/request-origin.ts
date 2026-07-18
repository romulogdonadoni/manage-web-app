/**
 * Auth.js builds redirect_uri from AUTH_URL or Host.
 * Path-based tenants share one origin (manage.localhost:3000 / manage.domain.com.br).
 */
export function applyAuthUrlFromRequest(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-host")
  const hostHeader = req.headers.get("host")
  const host = forwarded || hostHeader
  if (!host) return null

  const protoHeader = req.headers.get("x-forwarded-proto")
  const proto = (
    protoHeader ||
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https")
  ).replace(/:$/, "")

  const origin = `${proto}://${host}`
  process.env.AUTH_URL = origin
  return origin
}
