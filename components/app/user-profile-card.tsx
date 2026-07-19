"use client"

import { UserRound } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"

import { ImageUploadButton } from "@/components/app/image-upload-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentTenant, updateUserAvatar } from "@/lib/api/tenants"
import { getAccountUser, updateAccountProfile } from "@/lib/api/users"

function initialsFrom(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "AD"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function splitSessionName(name?: string | null) {
  const trimmed = name?.trim() ?? ""
  if (!trimmed) return { firstName: "", lastName: "" }
  const space = trimmed.indexOf(" ")
  if (space <= 0) return { firstName: trimmed, lastName: "" }
  return {
    firstName: trimmed.slice(0, space).trim(),
    lastName: trimmed.slice(space + 1).trim(),
  }
}

export function UserProfileCard() {
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const accessToken = session?.accessToken
  const tenantId = session?.tenant
  const userName = displayName || session?.user?.name || "Você"
  const userEmail = email || session?.user?.email || ""

  const loadProfile = useCallback(async () => {
    if (!accessToken) return
    try {
      const account = await getAccountUser(accessToken)
      setAvatarUrl(account.avatarUrl)
      setDisplayName(account.displayName)
      setEmail(account.email)
      setFirstName(account.firstName ?? "")
      setLastName(account.lastName ?? "")
    } catch {
      const fallback = splitSessionName(session?.user?.name)
      setFirstName(fallback.firstName)
      setLastName(fallback.lastName)
      setDisplayName(session?.user?.name ?? null)
      setEmail(session?.user?.email ?? null)
    }

    if (!tenantId) return
    try {
      const current = await getCurrentTenant(accessToken, tenantId)
      if (current.user?.avatarUrl) {
        setAvatarUrl(current.user.avatarUrl)
      }
    } catch {
      // Avatar from account endpoint is enough.
    }
  }, [accessToken, tenantId, session?.user?.email, session?.user?.name])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    if (!accessToken || savingName) return
    setSavingName(true)
    try {
      const updated = await updateAccountProfile(
        { firstName: firstName.trim(), lastName: lastName.trim() },
        accessToken
      )
      setFirstName(updated.firstName)
      setLastName(updated.lastName)
      setDisplayName(updated.displayName)
      setEmail(updated.email)
      setAvatarUrl(updated.avatarUrl)
      toast.success("Nome atualizado.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar nome.")
    } finally {
      setSavingName(false)
    }
  }

  async function saveAvatar(publicUrl: string) {
    if (!accessToken || !tenantId) {
      toast.error("Ative uma empresa em / para alterar o avatar.")
      return
    }
    setBusy(true)
    try {
      const updated = await updateUserAvatar(publicUrl, accessToken, tenantId)
      setAvatarUrl(updated.avatarUrl)
      setDisplayName(updated.displayName)
      setEmail(updated.email)
      toast.success("Avatar atualizado.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar avatar.")
    } finally {
      setBusy(false)
    }
  }

  async function clearAvatar() {
    if (!accessToken || !tenantId) return
    setBusy(true)
    try {
      const updated = await updateUserAvatar(null, accessToken, tenantId)
      setAvatarUrl(updated.avatarUrl)
      toast.success("Avatar removido.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao remover avatar."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Nome</CardTitle>
          <CardDescription>
            Nome e sobrenome exibidos no painel. O e-mail continua vindo do Auth0.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={(e) => void saveProfile(e)}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  maxLength={100}
                  required
                  disabled={savingName}
                  className="border-border/80 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  maxLength={100}
                  disabled={savingName}
                  className="border-border/80 bg-background"
                />
              </div>
            </div>

            {userEmail ? (
              <p className="text-xs text-muted-foreground">
                E-mail: <span className="text-foreground">{userEmail}</span>
              </p>
            ) : null}

            <Button type="submit" size="sm" className="w-fit" disabled={savingName}>
              {savingName ? "Salvando…" : "Salvar nome"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>
            Avatar da sua conta (visível no painel de qualquer empresa)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={userName} /> : null}
              <AvatarFallback>{initialsFrom(userName, userEmail)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <UserRound className="size-3.5 text-muted-foreground" />
                {userName}
              </p>
              {userEmail ? (
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ImageUploadButton
              folder="avatars"
              tenantId={tenantId}
              label={busy ? "Salvando…" : "Trocar foto"}
              onUploaded={({ publicUrl }) => void saveAvatar(publicUrl)}
            />
            {avatarUrl ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => void clearAvatar()}
              >
                Remover
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
