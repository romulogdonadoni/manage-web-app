export const TENANT_COOKIE = "whitelabel.tenant"

export function getAppUrl() {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  )
}

/** Auth0 tenant domain, e.g. your-tenant.us.auth0.com */
export function getAuth0Domain() {
  const issuer = process.env.AUTH_AUTH0_ISSUER?.trim()
  if (issuer) {
    try {
      return new URL(issuer).host
    } catch {
      return issuer.replace(/^https?:\/\//, "").replace(/\/$/, "")
    }
  }
  return process.env.AUTH_AUTH0_DOMAIN?.trim() || ""
}

/** Issuer with trailing slash, e.g. https://your-tenant.us.auth0.com/ */
export function getAuth0Issuer() {
  const raw = process.env.AUTH_AUTH0_ISSUER?.trim()
  if (raw) {
    const withScheme = raw.startsWith("http") ? raw : `https://${raw}`
    return withScheme.endsWith("/") ? withScheme : `${withScheme}/`
  }
  const domain = getAuth0Domain()
  return domain ? `https://${domain}/` : ""
}

export function getAuth0ClientId() {
  return process.env.AUTH_AUTH0_ID?.trim() || ""
}

export function getAuth0ClientSecret() {
  return process.env.AUTH_AUTH0_SECRET?.trim() || ""
}

/** API Identifier — must match MinhaApi Auth0:Audience */
export function getAuth0Audience() {
  return (
    process.env.AUTH_AUTH0_AUDIENCE?.trim() || "https://api.whitelabel.local"
  )
}
