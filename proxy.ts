import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { TENANT_COOKIE } from "@/lib/auth/constants"
import {
  TENANT_HEADER,
  isCompanyPickerPath,
  readTenantCookie,
  splitTenantPath,
  withTenantPrefix,
} from "@/lib/auth/tenant-host"

const PUBLIC_PREFIXES = [
  "/onboarding",
  "/api/auth",
  "/_next",
  "/favicon.ico",
]

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function withTenantCookie(response: NextResponse, tenant: string | null) {
  if (!tenant) return response
  response.cookies.set(TENANT_COOKIE, tenant, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

function forwardRequestHeaders(request: NextRequest, tenant: string | null) {
  const requestHeaders = new Headers(request.headers)
  const host = request.headers.get("host")
  if (host) {
    requestHeaders.set("x-forwarded-host", host)
    requestHeaders.set(
      "x-forwarded-proto",
      host.includes("localhost") || host.startsWith("127.") ? "http" : "https"
    )
  }
  if (tenant) {
    requestHeaders.set(TENANT_HEADER, tenant)
  } else {
    requestHeaders.delete(TENANT_HEADER)
  }
  return requestHeaders
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "manage.localhost:3000"
  const proto =
    host.includes("localhost") || host.startsWith("127.") ? "http" : "https"
  const origin = `${proto}://${host}`

  const { pathname } = request.nextUrl
  const { tenant: pathTenant, pathname: strippedPath } =
    splitTenantPath(pathname)
  const cookieTenant = readTenantCookie(request.headers.get("cookie"))

  // Company picker stays at / even when a tenant cookie exists.
  if (isCompanyPickerPath(pathname)) {
    const requestHeaders = forwardRequestHeaders(request, null)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Public routes stay unprefixed (onboarding, auth callbacks).
  if (!pathTenant && cookieTenant && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = withTenantPrefix(cookieTenant, pathname)
    return withTenantCookie(NextResponse.redirect(url), cookieTenant)
  }

  const tenant = pathTenant || cookieTenant
  const appPath = pathTenant ? strippedPath : pathname
  const requestHeaders = forwardRequestHeaders(request, tenant)

  const respond = (response: NextResponse) => withTenantCookie(response, tenant)

  if (isPublicPath(appPath) || pathname.includes(".")) {
    if (pathTenant && strippedPath !== pathname) {
      const url = request.nextUrl.clone()
      url.pathname = strippedPath
      return respond(
        NextResponse.rewrite(url, { request: { headers: requestHeaders } })
      )
    }
    return respond(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  const session = await auth()
  if (!session) {
    const login = new URL("/api/auth/login", origin)
    login.searchParams.set("callbackUrl", pathname)
    return respond(NextResponse.redirect(login))
  }

  if (pathTenant && strippedPath !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = strippedPath
    return respond(
      NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    )
  }

  return respond(NextResponse.next({ request: { headers: requestHeaders } }))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}
