export type TenantDto = {
  id: string
  name: string
  identifier: string
  logoUrl: string | null
  isActive: boolean
  createdAtUtc: string
  /** Membership role in this tenant: owner | admin | member */
  role?: string
}

export type MyInvitationDto = {
  id: string
  token: string
  email: string
  role: string
  status: string
  createdAtUtc: string
  expiresAtUtc: string
  tenantId: string
  tenantIdentifier: string
  tenantName: string
  tenantLogoUrl: string | null
  allowedMenus: string[] | null
  direction: "received" | "sent" | string
}

export type MyInvitationsInboxDto = {
  accountEmail: string
  emailLooksPlaceholder: boolean
  received: MyInvitationDto[]
  sent: MyInvitationDto[]
}

export type ProvisionTenantRequest = {
  name: string
  identifier: string
}

export type ProvisionTenantResult = {
  id: string
  name: string
  identifier: string
}

export type CurrentUserDto = {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  plan: string
  canCreateTenants: boolean
  /** Present on /tenant/me when scoped to a company. */
  tenantRole?: string | null
  canManageInvites?: boolean
  /** Explicit menu keys; null/undefined = role defaults. */
  allowedMenus?: string[] | null
}

export type AccountUserDto = CurrentUserDto & {
  firstName: string
  lastName: string
}
export type CurrentTenantDto = {
  tenantId: string
  identifier: string
  name: string
  logoUrl: string | null
  isOpen: boolean
  openedAtUtc: string | null
  closedAtUtc: string | null
  user: CurrentUserDto | null
}

export type UpdateAvatarResult = CurrentUserDto
export type UpdateLogoResult = {
  id: string
  identifier: string
  name: string
  logoUrl: string | null
}

export type TenantRole = "owner" | "admin" | "member"

export type TenantMemberDto = {
  userId: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: TenantRole | string
  joinedAtUtc: string
  lastLoginAtUtc: string | null
  allowedMenus: string[] | null
  hasManagerPin: boolean
}

export type InvitationDto = {
  id: string
  email: string
  role: TenantRole | string
  status: string
  createdAtUtc: string
  expiresAtUtc: string
  inviteUrl: string | null
  isExpired: boolean
  allowedMenus: string[] | null
}

export type InvitationPreviewDto = {
  email: string
  role: TenantRole | string
  status: string
  expiresAtUtc: string
  isExpired: boolean
  tenantIdentifier: string
  tenantName: string
  emailMatchesCurrentUser: boolean
}

export type AcceptInvitationResult = {
  tenantId: string
  tenantIdentifier: string
  tenantName: string
  role: string
}

export type CreateInvitationRequest = {
  email: string
  role: TenantRole | string
  allowedMenus?: string[] | null
}
