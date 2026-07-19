import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth, signOut } from "@/lib/auth"
import {
  TENANT_COOKIE,
  getAuth0ClientId,
  getAuth0Issuer,
} from "@/lib/auth/constants"

export async function GET(request: Request) {
  await auth()
  const jar = await cookies()
  await headers()
  const origin = new URL(request.url).origin

  await signOut({ redirect: false })

  const issuer = getAuth0Issuer()
  const logoutUrl = new URL(`${issuer}v2/logout`)
  logoutUrl.searchParams.set("client_id", getAuth0ClientId())
  logoutUrl.searchParams.set("returnTo", `${origin}/`)

  // Clear tenant cookie on full logout so manage home doesn't force a stale slug.
  jar.delete(TENANT_COOKIE)

  return NextResponse.redirect(logoutUrl)
}
