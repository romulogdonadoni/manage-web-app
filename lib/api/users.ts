import { apiFetch } from "@/lib/api/client"
import type { AccountUserDto } from "@/lib/api/types"

export function getAccountUser(accessToken: string) {
  return apiFetch<AccountUserDto>("/users/me", {
    method: "GET",
    accessToken,
    cache: "no-store",
  })
}

export function updateAccountProfile(
  input: { firstName: string; lastName: string },
  accessToken: string
) {
  return apiFetch<AccountUserDto>("/users/me", {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(input),
  })
}
