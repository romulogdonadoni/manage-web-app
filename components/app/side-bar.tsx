"use client"

import {
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Moon,
  Rocket,
  Settings,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { getIndustry } from "@/lib/modules/catalog"
import { MODULE_ROUTES } from "@/lib/modules/nav"
import {
  BILLING_STATE_KEY,
  clearTenantProfile,
  loadTenantProfile,
  type TenantProfile,
} from "@/lib/modules/storage"
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
    module: null,
  },
  {
    href: "/tenants",
    label: "Tenants",
    icon: Building2,
    module: "tenants" as const,
  },
  { href: "/billing", label: "Assinatura", icon: CreditCard, module: null },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    module: "settings" as const,
  },
]

export default function SideBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { resolvedTheme, setTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [profile, setProfile] = useState<TenantProfile | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "true") setCollapsed(true)
    setProfile(loadTenantProfile())
    setHydrated(true)
  }, [])

  useEffect(() => {
    setProfile(loadTenantProfile())
  }, [pathname])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed, hydrated])

  const moduleNav = useMemo(() => {
    const routes = MODULE_ROUTES.filter((route) => route.nav)
    if (!profile) {
      return routes
        .filter((route) =>
          ["menu", "orders", "kds", "catalog", "customers"].includes(
            route.moduleId
          )
        )
        .map((route) => ({
          href: route.href,
          label: route.label,
          icon: route.icon,
          module: route.moduleId,
        }))
    }

    return routes
      .filter((route) => profile.modules.includes(route.moduleId))
      .map((route) => ({
        href: route.href,
        label: route.label,
        icon: route.icon,
        module: route.moduleId,
      }))
  }, [profile])

  const visibleShell = useMemo(() => {
    if (!profile) return shellNav
    return shellNav.filter(
      (item) => item.module === null || profile.modules.includes(item.module)
    )
  }, [profile])

  const visibleNav = useMemo(() => {
    const top = visibleShell.filter((item) => item.href === "/dashboard")
    const bottom = visibleShell.filter((item) => item.href !== "/dashboard")
    return [...top, ...moduleNav, ...bottom]
  }, [visibleShell, moduleNav])

  const industryLabel = profile ? getIndustry(profile.industry)?.label : null

  const isDark = resolvedTheme === "dark"
  const userName = session?.user?.name || "Admin"
  const userEmail = session?.user?.email || "admin@whitelabel.local"
  const userInitials = initialsFrom(session?.user?.name, session?.user?.email)

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  function handleLogout() {
    clearTenantProfile()
    window.localStorage.removeItem(BILLING_STATE_KEY)
    setProfile(null)
    // Federated logout → Keycloak end_session → / → Keycloakify
    window.location.href = "/api/auth/federated-logout"
  }

  return (
    <TooltipProvider delay={200}>
      <aside
        data-collapsed={collapsed}
        className={cn(
          "flex h-full shrink-0 flex-col rounded-4xl text-sidebar-foreground transition-[width] duration-200 ease-out",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-start pt-5 pb-5",
            collapsed ? "flex-col items-center gap-3 px-2" : "px-5"
          )}
        >
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold tracking-[0.18em] uppercase">
                <Link href="/" className="hover:text-primary">
                  WhiteLabel
                </Link>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="truncate text-xs text-muted-foreground">
                  {profile?.name ?? "Admin workspace"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  aria-label="Recolher menu"
                  aria-expanded={!collapsed}
                  onClick={() => setCollapsed(true)}
                  className="ml-auto rounded-full border-sidebar-border"
                >
                  <ChevronLeft />
                </Button>
              </div>
              {industryLabel ? (
                <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
                  {industryLabel}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xs font-bold tracking-wide">WL</span>
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
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === href || pathname.startsWith(`${href}/`)

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
                  href={href}
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
                      href={href}
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

        <div className={cn("mt-auto mx-auto pt-4 pb-5", collapsed ? "px-2" : "px-4")}>
          <Separator className="mb-4 bg-sidebar-border" />

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                delay={200}
                render={
                  <DropdownMenuTrigger
                    className={cn(
                      "flex w-full items-center rounded-2xl transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      collapsed
                        ? "size-10 justify-center"
                        : "gap-3 px-1 py-1.5 text-left"
                    )}
                    aria-label="Menu do usuário"
                  />
                }
              >
                <Avatar size="default">
                  <AvatarFallback className="bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-sidebar-foreground">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail}
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
              className="min-w-56"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={<Link href="/onboarding" />}
                  className="cursor-pointer"
                >
                  <Rocket />
                  {profile ? "Refazer onboarding" : "Onboarding"}
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
