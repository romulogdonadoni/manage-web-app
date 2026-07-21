"use client"

import {
  CreditCard,
  LogOut,
  Mail,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

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
import { listMyInvitations } from "@/lib/api/invitations"
import { getAccountUser } from "@/lib/api/users"
import { BILLING_STATE_KEY, clearTenantProfile } from "@/lib/modules/storage"
import { cn } from "@/lib/utils"

function initialsFrom(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "AD"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function isActivePath(pathname: string, href: string) {
  if (href === "/account") {
    return pathname === "/account"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

const accountLinks = [
  {
    href: "/account",
    label: "Visão geral",
    icon: Settings,
  },
  {
    href: "/account/profile",
    label: "Meu perfil",
    icon: UserRound,
  },
  {
    href: "/account/invitations",
    label: "Convites",
    icon: Mail,
  },
  {
    href: "/account/billing",
    label: "Assinatura e planos",
    icon: CreditCard,
  },
] as const

export function ManageNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { resolvedTheme, setTheme } = useTheme()

  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [pendingInvites, setPendingInvites] = useState(0)
  const [themeReady, setThemeReady] = useState(false)

  const accessToken = session?.accessToken
  const authenticated = status === "authenticated"
  const isDark = resolvedTheme === "dark"

  const userName = displayName || session?.user?.name || "Conta"
  const userEmail = session?.user?.email || ""
  const userInitials = initialsFrom(userName, userEmail)
  const photoUrl = avatarUrl || session?.user?.image || null

  useEffect(() => {
    setThemeReady(true)
  }, [])

  useEffect(() => {
    if (!accessToken) {
      setDisplayName(null)
      setAvatarUrl(null)
      setPendingInvites(0)
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const [account, inbox] = await Promise.all([
          getAccountUser(accessToken),
          listMyInvitations(accessToken).catch(() => null),
        ])
        if (cancelled) return
        setDisplayName(account.displayName)
        setAvatarUrl(account.avatarUrl)
        setPendingInvites(inbox?.received.length ?? 0)
      } catch {
        if (!cancelled) {
          setDisplayName(null)
          setAvatarUrl(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessToken, pathname])

  function handleLogout() {
    clearTenantProfile()
    window.localStorage.removeItem(BILLING_STATE_KEY)
    window.location.href = "/api/auth/federated-logout"
  }

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.18em] uppercase"
        >
          WhiteLabel
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label={
              themeReady && isDark ? "Ativar tema claro" : "Ativar tema escuro"
            }
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {themeReady && isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {status === "loading" ? (
            <div className="size-8 animate-pulse rounded-full bg-muted" />
          ) : authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto gap-2 rounded-full px-1.5 py-1 text-foreground hover:bg-muted"
                  />
                }
              >
                <Avatar size="default" className="size-8">
                  {photoUrl ? <AvatarImage src={photoUrl} alt="" /> : null}
                  <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                  {userName.split(" ")[0]}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {userName}
                    </span>
                    {userEmail ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    ) : null}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {accountLinks.map(({ href, label, icon: Icon }) => {
                    const active = isActivePath(pathname, href)
                    const showInviteBadge =
                      href === "/account/invitations" && pendingInvites > 0

                    return (
                      <DropdownMenuItem
                        key={href}
                        render={<Link href={href} />}
                        className={cn(
                          "cursor-pointer",
                          active && "bg-muted text-foreground"
                        )}
                      >
                        <Icon />
                        <span className="flex-1">{label}</span>
                        {showInviteBadge ? (
                          <span className="rounded-full bg-warning/25 px-1.5 py-0.5 text-[10px] font-semibold text-warning tabular-nums">
                            {pendingInvites}
                          </span>
                        ) : null}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/api/auth/login?callbackUrl=/" />}
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
