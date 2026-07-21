import { apiFetch } from "@/lib/api/client"
import type {
  CurrentTenantDto,
  ProvisionTenantRequest,
  ProvisionTenantResult,
  TenantDto,
  UpdateAvatarResult,
  UpdateBannerResult,
  UpdateLogoResult,
} from "@/lib/api/types"

export function listTenants(options?: {
  accessToken?: string | null
  tenantId?: string | null
  init?: RequestInit
}) {
  return apiFetch<TenantDto[]>("/tenants", {
    method: "GET",
    cache: "no-store",
    accessToken: options?.accessToken,
    tenantId: options?.tenantId,
    ...options?.init,
  })
}

export function provisionTenant(
  body: ProvisionTenantRequest,
  accessToken: string
) {
  return apiFetch<ProvisionTenantResult>("/tenants", {
    method: "POST",
    body: JSON.stringify(body),
    accessToken,
  })
}

export function checkTenantIdentifierAvailability(
  identifier: string,
  accessToken: string
) {
  const qs = new URLSearchParams({ identifier })
  return apiFetch<{ identifier: string; available: boolean }>(
    `/tenants/availability?${qs.toString()}`,
    {
      method: "GET",
      accessToken,
      cache: "no-store",
    }
  )
}

export function deleteTenant(identifier: string, accessToken: string) {
  return apiFetch<void>(`/tenants/${encodeURIComponent(identifier)}`, {
    method: "DELETE",
    accessToken,
  })
}

export function getCurrentTenant(accessToken: string, tenantId: string) {
  return apiFetch<CurrentTenantDto>("/tenant/me", {
    method: "GET",
    accessToken,
    tenantId,
    cache: "no-store",
  })
}

export function updateStoreStatus(
  action: "open" | "close",
  pin: string,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<CurrentTenantDto>("/tenant/me/store-status", {
    method: "POST",
    body: JSON.stringify({ action, pin }),
    accessToken,
    tenantId,
  })
}

export function updateTenantLogo(
  logoUrl: string | null,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<UpdateLogoResult>("/tenant/me/logo", {
    method: "PATCH",
    body: JSON.stringify({ logoUrl }),
    accessToken,
    tenantId,
  })
}

export function updateTenantBanner(
  bannerUrl: string | null,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<UpdateBannerResult>("/tenant/me/banner", {
    method: "PATCH",
    body: JSON.stringify({ bannerUrl }),
    accessToken,
    tenantId,
  })
}

export function updateUserAvatar(
  avatarUrl: string | null,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<UpdateAvatarResult>("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatarUrl }),
    accessToken,
    tenantId,
  })
}
