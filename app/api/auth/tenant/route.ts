import { NextResponse } from "next/server"

import { TENANT_COOKIE } from "@/lib/auth/constants"
import { isValidTenantSlug } from "@/lib/auth/tenant-host"

export async function GET() {
  const { cookies } = await import("next/headers")
  const jar = await cookies()
  const tenant = jar.get(TENANT_COOKIE)?.value ?? null
  return NextResponse.json({ tenant })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    tenant?: string
  } | null

  const tenant = body?.tenant?.trim().toLowerCase()
  if (!tenant || !isValidTenantSlug(tenant)) {
    return NextResponse.json(
      { error: "Identificador de tenant inválido." },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ ok: true, tenant })
  response.cookies.set(TENANT_COOKIE, tenant, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}
