import { apiFetch } from "@/lib/api/client"
import type {
  AcceptInvitationResult,
  CreateInvitationRequest,
  InvitationDto,
  InvitationPreviewDto,
  MyInvitationDto,
  MyInvitationsInboxDto,
  TenantMemberDto,
} from "@/lib/api/types"

export function listMyInvitations(accessToken: string) {
  return apiFetch<MyInvitationsInboxDto>("/users/me/invitations", {
    method: "GET",
    accessToken,
    cache: "no-store",
  })
}

export function listTenantMembers(accessToken: string, tenantId: string) {
  return apiFetch<TenantMemberDto[]>("/tenant/members", {
    method: "GET",
    accessToken,
    tenantId,
    cache: "no-store",
  })
}

export function listTenantInvitations(accessToken: string, tenantId: string) {
  return apiFetch<InvitationDto[]>("/tenant/invitations", {
    method: "GET",
    accessToken,
    tenantId,
    cache: "no-store",
  })
}

export function createTenantInvitation(
  body: CreateInvitationRequest,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<InvitationDto>("/tenant/invitations", {
    method: "POST",
    body: JSON.stringify(body),
    accessToken,
    tenantId,
  })
}

export function revokeTenantInvitation(
  invitationId: string,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<void>(`/tenant/invitations/${encodeURIComponent(invitationId)}`, {
    method: "DELETE",
    accessToken,
    tenantId,
  })
}

export function updateMemberMenus(
  userId: string,
  allowedMenus: string[],
  accessToken: string,
  tenantId: string
) {
  return apiFetch<{ userId: string; role: string; allowedMenus: string[] | null }>(
    `/tenant/members/${encodeURIComponent(userId)}/menus`,
    {
      method: "PATCH",
      body: JSON.stringify({ allowedMenus }),
      accessToken,
      tenantId,
    }
  )
}

export function getInvitationPreview(token: string, accessToken: string) {
  return apiFetch<InvitationPreviewDto>(
    `/invitations/${encodeURIComponent(token)}`,
    {
      method: "GET",
      accessToken,
      cache: "no-store",
    }
  )
}

export function acceptInvitation(token: string, accessToken: string) {
  return apiFetch<AcceptInvitationResult>(
    `/invitations/${encodeURIComponent(token)}/accept`,
    {
      method: "POST",
      accessToken,
    }
  )
}
