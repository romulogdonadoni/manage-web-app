import { handlers } from "@/lib/auth"
import { applyAuthUrlFromRequest } from "@/lib/auth/request-origin"
import type { NextRequest } from "next/server"

async function withAuthOrigin(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<Response>
) {
  applyAuthUrlFromRequest(req)
  return handler(req)
}

export async function GET(req: NextRequest) {
  return withAuthOrigin(req, handlers.GET)
}

export async function POST(req: NextRequest) {
  return withAuthOrigin(req, handlers.POST)
}
