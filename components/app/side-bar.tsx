"use client"

import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  Plus,
  Rocket,
  Settings,
  Sun,
  UserRound,
  Users,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { listTenants } from "@/lib/api/tenants"
import type { TenantDto } from "@/lib/api/types"
import { canAccessNav, navAccessKeyForModule } from "@/lib/auth/role-access"
import {
  resolveTenantFromPath,
  splitTenantPath,
  withTenantPrefix,
} from "@/lib/auth/tenant-host"
import { getIndustry } from "@/lib/modules/catalog"
import { MODULE_ROUTES } from "@/lib/modules/nav"
import {
  BILLING_STATE_KEY,
  clearTenantProfile,
  loadTenantProfile,
  type TenantProfile,
} from "@/lib/modules/storage"
import { useCurrentStore } from "@/lib/store/current-store-context"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

function initialsFrom(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "AD"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

const STORAGE_KEY = "whitelabel.sidebar.collapsed"

const shellNav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    access: "dashboard",
  },
  {
    href: "/users",
    label: "Funcionários",
    icon: Users,
    access: "auth",
  },
  {
    href: "/tenants",
    label: "Tenants",
    icon: Building2,
    access: "tenants",
  },
  {
    href: "/billing",
    label: "Assinatura",
    icon: CreditCard,
    access: "billing",
  },
  {
    href: "/settings",
    label: "Loja",
    icon: Settings,
    access: "settings",
  },
] as const

export default function SideBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { data: store } = useCurrentStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [routeTenant, setRouteTenant] = useState<string | null>(null)
  const [tenants, setTenants] = useState<TenantDto[]>([])
  const [switchingTenant, setSwitchingTenant] = useState<string | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "true") setCollapsed(true)
    setProfile(loadTenantProfile())
    setHydrated(true)
  }, [])

  useEffect(() => {
    setProfile(loadTenantProfile())
    setRouteTenant(resolveTenantFromPath(window.location.pathname))
  }, [pathname])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed, hydrated])

  const loadTenants = useCallback(async () => {
    if (!session?.accessToken) {
      setTenants([])
      return
    }
    try {
      const list = await listTenants({
        accessToken: session.accessToken,
        tenantId: session.tenant,
      })
      setTenants(list)
    } catch {
      setTenants([])
    }
  }, [session?.accessToken, session?.tenant])

  useEffect(() => {
    void loadTenants()
  }, [loadTenants])

  const tenantRole = store?.user?.tenantRole ?? null
  const allowedMenus = store?.user?.allowedMenus ?? null

  const moduleNav = useMemo(() => {
    const routes = MODULE_ROUTES.filter((route) => route.nav)
    const enabledModules = profile?.modules ?? [
      "menu",
      "orders",
      "kds",
      "catalog",
      "customers",
      "counter",
      "delivery",
    ]

    return routes
      .filter(
        (route) =>
          enabledModules.includes(route.moduleId) &&
          canAccessNav(
            tenantRole,
            navAccessKeyForModule(route.moduleId),
            allowedMenus
          )
      )
      .map((route) => ({
        href: route.href,
        label: route.label,
        icon: route.icon,
        access: route.moduleId,
      }))
  }, [profile, tenantRole, allowedMenus])

  const visibleShell = useMemo(() => {
    return shellNav.filter((item) =>
      canAccessNav(tenantRole, item.access, allowedMenus)
    )
  }, [tenantRole, allowedMenus])

  const visibleNav = useMemo(() => {
    const top = visibleShell.filter((item) => item.href === "/dashboard")
    const bottom = visibleShell.filter((item) => item.href !== "/dashboard")
    return [...top, ...moduleNav, ...bottom]
  }, [visibleShell, moduleNav])

  const industryLabel = profile ? getIndustry(profile.industry)?.label : null

  const activeTenant =
    routeTenant ||
    resolveTenantFromPath(pathname) ||
    store?.identifier ||
    session?.tenant ||
    null

  // Pathname may be /{tenant}/orders (browser) or /orders (after rewrite).
  const appPathname = resolveTenantFromPath(pathname)
    ? splitTenantPath(pathname).pathname
    : pathname

  const isDark = resolvedTheme === "dark"
  const userName = store?.user?.displayName || session?.user?.name || "Admin"
  const userEmail =
    store?.user?.email || session?.user?.email || "admin@whitelabel.local"
  const userInitials = initialsFrom(userName, userEmail)
  const userAvatarUrl = store?.user?.avatarUrl
  const storeName = store?.name || profile?.name || "Admin workspace"
  const storeLogoUrl = store?.logoUrl
  const roleLabel =
    tenantRole === "owner"
      ? "Owner"
      : tenantRole === "admin"
        ? "Admin"
        : tenantRole === "member"
          ? "Membro"
          : null

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  function handleLogout() {
    clearTenantProfile()
    window.localStorage.removeItem(BILLING_STATE_KEY)
    setProfile(null)
    // Full logout: clear Auth.js + Auth0 SSO (not just leave the tenant).
    window.location.assign("/api/auth/federated-logout")
  }

  async function switchTenant(identifier: string) {
    const id = identifier.trim().toLowerCase()
    if (!id || id === activeTenant?.toLowerCase() || switchingTenant) return

    setSwitchingTenant(id)
    try {
      const res = await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: id }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error || "Não foi possível trocar de empresa.")
      }
      window.location.assign(withTenantPrefix(id, "/dashboard"))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível trocar de empresa."
      )
      setSwitchingTenant(null)
    }
  }

  const tenantSwitcher = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          collapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Trocar empresa"
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Trocar empresa"
              className="mt-2 h-auto w-full min-w-0 justify-start gap-2 px-2 py-1.5 text-left text-muted-foreground hover:text-sidebar-accent-foreground"
            />
          )
        }
      >
        {collapsed ? (
          <ChevronsUpDown className="size-4" />
        ) : (
          <>
            <Building2 className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-xs">
              Trocar empresa
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-70" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? "right" : "bottom"}
        align={collapsed ? "start" : "start"}
        sideOffset={8}
        className="w-64 max-w-[min(16rem,calc(100vw-1.5rem))]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Suas empresas</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {tenants.length === 0 ? (
            <DropdownMenuItem disabled className="text-muted-foreground">
              Nenhuma empresa
            </DropdownMenuItem>
          ) : (
            tenants.map((tenant) => {
              const isCurrent =
                !!activeTenant &&
                tenant.identifier.toLowerCase() === activeTenant.toLowerCase()
              const busy =
                switchingTenant === tenant.identifier.toLowerCase()

              return (
                <DropdownMenuItem
                  key={tenant.id}
                  disabled={!!switchingTenant}
                  className="cursor-pointer"
                  onClick={() => void switchTenant(tenant.identifier)}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {tenant.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tenant.logoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Building2 className="size-3 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{tenant.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      /{tenant.identifier}
                    </span>
                  </span>
                  {busy ? (
                    <span className="text-xs text-muted-foreground">…</span>
                  ) : isCurrent ? (
                    <Check className="size-4 text-primary" />
                  ) : null}
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href="/" />}
            className="cursor-pointer"
          >
            <ArrowLeft />
            Ver todas
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/create" />}
            className="cursor-pointer"
          >
            <Plus />
            Nova empresa
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <TooltipProvider delay={200}>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "flex h-full shrink-0 flex-col rounded-4xl text-sidebar-foreground transition-[width] duration-200 ease-out",
          collapsed ? "w-18" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-start pt-5 pb-5",
            collapsed ? "flex-col items-center gap-3 px-2" : "px-5"
          )}
        >
          {!collapsed ? (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-[15px] font-semibold tracking-[0.18em] uppercase">
                <Link href="/" className="hover:text-primary">
                  WhiteLabel
                </Link>
              </p>
              <div className="mt-1.5 flex min-w-0 items-center gap-2">
                {storeLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={storeLogoUrl}
                    alt=""
                    className="size-6 shrink-0 rounded-lg object-cover"
                  />
                ) : null}
                <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {storeName}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  aria-label="Recolher menu"
                  aria-expanded={!collapsed}
                  onClick={() => setCollapsed(true)}
                  className="ml-auto shrink-0 rounded-full border-sidebar-border"
                >
                  <ChevronLeft />
                </Button>
              </div>
              {industryLabel ? (
                <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
                  {industryLabel}
                </p>
              ) : null}
              {tenantSwitcher}
            </div>
          ) : (
            <>
              {tenantSwitcher}
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                {storeLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={storeLogoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold tracking-wide">WL</span>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Expandir menu"
                      aria-expanded={!collapsed}
                      onClick={() => setCollapsed(false)}
                      className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    />
                  }
                >
                  <ChevronRight />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Expandir menu
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        <ScrollArea
          className={cn(
            "flex flex-1 flex-col gap-0.5 overflow-y-auto pb-4",
            collapsed ? "items-center px-2" : "px-3"
          )}
        >
          {visibleNav.map(({ href, label, icon: Icon }) => {
            const prefixedHref = activeTenant
              ? withTenantPrefix(activeTenant, href)
              : href

            const isActive =
              href === "/dashboard"
                ? appPathname === "/dashboard" ||
                  appPathname === "/" ||
                  (activeTenant !== null && pathname === `/${activeTenant}`)
                : appPathname === href || appPathname.startsWith(`${href}/`)

            const linkClassName = cn(
              "group mx-auto flex items-center rounded-2xl text-[13px] font-medium transition-colors",
              collapsed ? "size-10 justify-center" : "gap-3 px-3 py-2.5",
              isActive
                ? "border-opacity-20 border border-sidebar-accent bg-gradient-to-b from-background to-sidebar-accent text-sidebar-accent-foreground dark:bg-gradient-to-t"
                : "border border-transparent text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            )

            const linkContent = (
              <>
                <Icon
                  className="size-[18px] shrink-0 opacity-80"
                  strokeWidth={1.75}
                />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )

            if (!collapsed) {
              return (
                <Link
                  key={href}
                  href={prefixedHref}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={linkClassName}
                >
                  {linkContent}
                </Link>
              )
            }

            return (
              <Tooltip key={href}>
                <TooltipTrigger
                  delay={200}
                  render={
                    <Link
                      href={prefixedHref}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClassName}
                    />
                  }
                >
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </ScrollArea>

        <div
          className={cn(
            "mt-auto w-full min-w-0 overflow-hidden pt-4 pb-5",
            collapsed ? "px-2" : "px-3"
          )}
        >
          <Separator className="mb-4 bg-sidebar-border" />

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                delay={200}
                render={
                  <DropdownMenuTrigger
                    className={cn(
                      "flex max-w-full min-w-0 items-center overflow-hidden rounded-2xl transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      collapsed
                        ? "size-10 justify-center"
                        : "w-full gap-2.5 px-1.5 py-1.5 text-left"
                    )}
                    aria-label="Menu do usuário"
                  />
                }
              >
                <Avatar size="default" className="shrink-0">
                  {userAvatarUrl ? (
                    <AvatarImage src={userAvatarUrl} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-sidebar-foreground">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {roleLabel ? `${roleLabel} · ${userEmail}` : userEmail}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" />
                  </>
                ) : null}
              </TooltipTrigger>
              {collapsed ? (
                <TooltipContent side="right" sideOffset={8}>
                  {userName} · {userEmail}
                </TooltipContent>
              ) : null}
            </Tooltip>

            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "end" : "start"}
              sideOffset={8}
              className="w-56 max-w-[min(14rem,calc(100vw-1.5rem))]"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {roleLabel ? `${roleLabel} · ${userEmail}` : userEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={<Link href="/account/profile" />}
                  className="cursor-pointer"
                >
                  <UserRound />
                  Meu perfil
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/account/billing" />}
                  className="cursor-pointer"
                >
                  <CreditCard />
                  Assinatura e planos
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/create" />}
                  className="cursor-pointer"
                >
                  <Rocket />
                  Nova empresa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={toggleTheme}
                  className="cursor-pointer"
                >
                  {hydrated && isDark ? <Sun /> : <Moon />}
                  {hydrated && isDark ? "Tema claro" : "Tema escuro"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/guide" />}
                  className="cursor-pointer"
                >
                  <BookOpen />
                  Guia do usuário
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/support" />}
                  className="cursor-pointer"
                >
                  <LifeBuoy />
                  Suporte
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
