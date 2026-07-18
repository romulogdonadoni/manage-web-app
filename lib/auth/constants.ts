export const TENANT_COOKIE = "whitelabel.tenant"

export function getKeycloakUrl() {
  return (
    process.env.KEYCLOAK_URL?.replace(/\/$/, "") || "http://localhost:8080"
  )
}

export function getAppUrl() {
  // Prefer request origin via trustHost (shared host; tenant is path-based).
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  )
}

export function getKeycloakIssuer(realm: string) {
  return `${getKeycloakUrl()}/realms/${encodeURIComponent(realm)}`
}

export function getKeycloakClientId() {
  return process.env.AUTH_KEYCLOAK_ID || "whitelabel-web"
}

export function getKeycloakClientSecret() {
  return process.env.AUTH_KEYCLOAK_SECRET || "whitelabel-web-dev-secret"
}
