"use client"

import {
  Copy,
  Mail,
  Pencil,
  UserPlus,
  Users,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ModuleShell } from "@/components/app/module-shell"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ApiError } from "@/lib/api/client"
import {
  createTenantInvitation,
  listTenantInvitations,
  listTenantMembers,
  revokeTenantInvitation,
  updateMemberManagerPin,
  updateMemberMenus,
} from "@/lib/api/invitations"
import type { InvitationDto, TenantMemberDto } from "@/lib/api/types"
import {
  canManageTeam,
  editableMenuOptions,
  MENU_PRESETS,
  type MenuOption,
} from "@/lib/auth/role-access"
import { useCurrentStore } from "@/lib/store/current-store-context"
import { cn } from "@/lib/utils"

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Membro",
}

function roleLabel(role: string) {
  return ROLE_LABELS[role] ?? role
}

function RoleBadge({ role }: { role: string }) {
  const variant =
    role === "owner" || role === "admin"
      ? "default"
      : role === "member"
        ? "secondary"
        : "outline"

  return <Badge variant={variant}>{roleLabel(role)}</Badge>
}

function initials(name: string, email: string) {
  const source = name.trim() || email.trim() || "?"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

function formatRelative(iso: string | null | undefined) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  const diffMs = Date.now() - date.getTime()
  const abs = Math.abs(diffMs)
  const mins = Math.round(abs / 60_000)
  if (mins < 1) return diffMs >= 0 ? "Agora" : "Em instantes"
  if (mins < 60) return diffMs >= 0 ? `Há ${mins} min` : `Em ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 48) return diffMs >= 0 ? `Há ${hours} h` : `Em ${hours} h`
  const days = Math.round(hours / 24)
  return diffMs >= 0 ? `Há ${days} d` : `Em ${days} d`
}

function MenuAccessPicker({
  value,
  onChange,
  disabled,
}: {
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  const options = editableMenuOptions()
  const selected = useMemo(
    () => new Set(value.map((v) => v.toLowerCase())),
    [value]
  )
  const [activePreset, setActivePreset] = useState<string[]>([])

  const grouped = useMemo(() => {
    const shell = options.filter((o) => o.group === "shell")
    const ops = options.filter((o) => o.group === "ops")
    return [
      { title: "Gestão", items: shell },
      { title: "Operação", items: ops },
    ] as { title: string; items: MenuOption[] }[]
  }, [options])

  function toggle(key: string) {
    if (disabled || key === "dashboard") return
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    next.add("dashboard")
    setActivePreset([])
    onChange([...next])
  }

  function applyPreset(presetId: string, menus: string[]) {
    setActivePreset([presetId])
    onChange(Array.from(new Set(["dashboard", ...menus])))
  }

  const selectedCount = Math.max(selected.size, 1)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Atalhos de função
          </p>
          <Badge variant="secondary" className="tabular-nums">
            {selectedCount} menus
          </Badge>
        </div>
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={2}
          className="flex flex-wrap"
          value={activePreset}
          onValueChange={(next) => {
            if (disabled) return
            const id = next[0]
            if (!id) {
              setActivePreset([])
              return
            }
            const preset = MENU_PRESETS.find((p) => p.id === id)
            if (preset) applyPreset(preset.id, preset.menus)
          }}
        >
          {MENU_PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset.id}
              value={preset.id}
              disabled={disabled}
              title={preset.description}
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">
          Ex.: Caixa libera PDV; Entregador libera só Delivery.
        </p>
      </div>

      <Separator />

      <ScrollArea className="min-h-0 flex-1 pr-3">
        <div className="flex flex-col gap-5 pb-2">
          {grouped.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.title}
              </p>
              <div className="rounded-2xl border bg-muted/20">
                {group.items.map((opt, index) => {
                  const checked = selected.has(opt.key)
                  const locked = opt.key === "dashboard"
                  return (
                    <Label
                      key={opt.key}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-normal transition-colors",
                        index > 0 && "border-t border-border/60",
                        checked && "bg-primary/5",
                        (disabled || locked) && "cursor-default"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={disabled || locked}
                        onCheckedChange={() => toggle(opt.key)}
                      />
                      <span className="flex-1">{opt.label}</span>
                      {locked ? (
                        <span className="text-[11px] text-muted-foreground">
                          sempre
                        </span>
                      ) : null}
                    </Label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default function UsersPage() {
  const { data: session } = useSession()
  const { data: store, refresh } = useCurrentStore()
  const tenantId = store?.identifier ?? null
  const accessToken = session?.accessToken
  const canInvite = canManageTeam(store?.user?.tenantRole)
  const isOwner = store?.user?.tenantRole === "owner"
  const currentUserId = store?.user?.id

  const [members, setMembers] = useState<TenantMemberDto[]>([])
  const [invites, setInvites] = useState<InvitationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [inviteMenus, setInviteMenus] = useState<string[]>([
    ...MENU_PRESETS.find((p) => p.id === "cashier")!.menus,
  ])
  const [inviting, setInviting] = useState(false)

  const [editingMember, setEditingMember] = useState<TenantMemberDto | null>(
    null
  )
  const [editMenus, setEditMenus] = useState<string[]>([])
  const [savingMenus, setSavingMenus] = useState(false)
  const [managerPin, setManagerPin] = useState("")
  const [managerPinConfirm, setManagerPinConfirm] = useState("")
  const [savingPin, setSavingPin] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken || !tenantId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const [memberList, inviteList] = await Promise.all([
        listTenantMembers(accessToken, tenantId),
        listTenantInvitations(accessToken, tenantId),
      ])
      setMembers(memberList)
      setInvites(inviteList)
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Falha ao carregar a equipe."
      )
    } finally {
      setLoading(false)
    }
  }, [accessToken, tenantId])

  useEffect(() => {
    void load()
  }, [load])

  const pendingInvites = useMemo(
    () => invites.filter((i) => i.status === "pending" && !i.isExpired),
    [invites]
  )

  const summary = useMemo(() => {
    const admins = members.filter(
      (m) => m.role === "owner" || m.role === "admin"
    ).length
    const operators = members.filter((m) => m.role === "member").length
    return { total: members.length, admins, operators, pending: pendingInvites.length }
  }, [members, pendingInvites.length])

  function openEdit(member: TenantMemberDto) {
    setEditingMember(member)
    setManagerPin("")
    setManagerPinConfirm("")
    setEditMenus(
      member.allowedMenus?.length
        ? [...member.allowedMenus]
        : member.role === "member"
          ? [...MENU_PRESETS.find((p) => p.id === "ops")!.menus]
          : ["dashboard", "auth", "settings", "billing"]
    )
  }

  function canEditMember(member: TenantMemberDto) {
    if (isOwner) return true
    return canInvite && member.role !== "owner"
  }

  function openInvite() {
    setEmail("")
    setRole("member")
    setInviteMenus([...MENU_PRESETS.find((p) => p.id === "cashier")!.menus])
    setInviteOpen(true)
  }

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault()
    if (!accessToken || !tenantId || inviting) return

    setInviting(true)
    try {
      const created = await createTenantInvitation(
        {
          email: email.trim(),
          role,
          allowedMenus: role === "member" ? inviteMenus : null,
        },
        accessToken,
        tenantId
      )
      setInviteOpen(false)
      if (created.inviteUrl) {
        try {
          await navigator.clipboard.writeText(created.inviteUrl)
          toast.success("Convite criado e link copiado.")
        } catch {
          toast.success("Convite criado.", {
            description: created.inviteUrl,
          })
        }
      } else {
        toast.success("Convite criado.")
      }
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao criar convite."
      )
    } finally {
      setInviting(false)
    }
  }

  async function handleSaveMenus() {
    if (!accessToken || !tenantId || !editingMember || savingMenus) return
    if (editingMember.role === "owner") return
    setSavingMenus(true)
    try {
      const memberId = editingMember.userId
      const name = editingMember.displayName
      await updateMemberMenus(memberId, editMenus, accessToken, tenantId)
      toast.success(`Acesso de ${name} atualizado.`)
      setEditingMember(null)
      await load()
      if (memberId === currentUserId) {
        await refresh()
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao salvar menus."
      )
    } finally {
      setSavingMenus(false)
    }
  }

  async function handleSaveManagerPin() {
    if (!accessToken || !tenantId || !editingMember || !isOwner || savingPin) {
      return
    }
    if (managerPin !== managerPinConfirm) {
      toast.error("As senhas não coincidem.")
      return
    }
    if (managerPin.trim().length < 4 || managerPin.trim().length > 32) {
      toast.error("A senha deve ter entre 4 e 32 caracteres.")
      return
    }

    setSavingPin(true)
    try {
      const result = await updateMemberManagerPin(
        editingMember.userId,
        managerPin.trim(),
        accessToken,
        tenantId
      )
      toast.success("Senha de gerente salva.")
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === result.userId
            ? { ...m, hasManagerPin: result.hasManagerPin }
            : m
        )
      )
      setEditingMember((prev) =>
        prev && prev.userId === result.userId
          ? { ...prev, hasManagerPin: result.hasManagerPin }
          : prev
      )
      setManagerPin("")
      setManagerPinConfirm("")
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao salvar a senha de gerente."
      )
    } finally {
      setSavingPin(false)
    }
  }

  async function handleClearManagerPin() {
    if (!accessToken || !tenantId || !editingMember || !isOwner || savingPin) {
      return
    }

    setSavingPin(true)
    try {
      const result = await updateMemberManagerPin(
        editingMember.userId,
        null,
        accessToken,
        tenantId
      )
      toast.success("Senha de gerente removida.")
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === result.userId
            ? { ...m, hasManagerPin: result.hasManagerPin }
            : m
        )
      )
      setEditingMember((prev) =>
        prev && prev.userId === result.userId
          ? { ...prev, hasManagerPin: result.hasManagerPin }
          : prev
      )
      setManagerPin("")
      setManagerPinConfirm("")
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao remover a senha de gerente."
      )
    } finally {
      setSavingPin(false)
    }
  }

  async function handleRevoke(invitationId: string) {
    if (!accessToken || !tenantId) return
    try {
      await revokeTenantInvitation(invitationId, accessToken, tenantId)
      toast.success("Convite revogado.")
      await load()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao revogar o convite."
      )
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link do convite copiado.")
    } catch {
      toast.message("Copie o link do convite", { description: url })
    }
  }

  function menusSummary(member: TenantMemberDto) {
    if (member.role === "owner") return "Acesso total"
    if (!member.allowedMenus?.length) {
      return member.role === "admin" ? "Padrão admin" : "Sem menus"
    }
    const labels = editableMenuOptions()
      .filter((o) => member.allowedMenus!.includes(o.key) && o.key !== "dashboard")
      .map((o) => o.label)
    if (labels.length === 0) return "Só dashboard"
    if (labels.length <= 2) return labels.join(", ")
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`
  }

  return (
    <ModuleShell
      title="Funcionários"
      description="Quem entra neste tenant e o que cada um pode abrir"
      actions={
        canInvite ? (
          <Button size="sm" type="button" onClick={openInvite}>
            <UserPlus data-icon="inline-start" />
            Convidar
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1">
            <Users className="size-3.5" />
            <span className="font-medium text-foreground tabular-nums">
              {summary.total}
            </span>
            na equipe
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1">
            <span className="font-medium text-foreground tabular-nums">
              {summary.admins}
            </span>
            gestão
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1">
            <span className="font-medium text-foreground tabular-nums">
              {summary.operators}
            </span>
            operação
          </span>
          {summary.pending > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-foreground">
              <Mail className="size-3.5" />
              <span className="font-medium tabular-nums">{summary.pending}</span>
              convite{summary.pending === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {loadError ? (
          <Alert variant="destructive">
            <AlertDescription className="break-all">{loadError}</AlertDescription>
          </Alert>
        ) : null}

        <Card size="sm" className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle>Equipe</CardTitle>
            <CardDescription>
              Defina o perfil e os menus de cada pessoa. Owner tem acesso total.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando equipe…
              </p>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
                <Users className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Ninguém na equipe ainda</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Convide um caixa, entregador ou admin para começar.
                  </p>
                </div>
                {canInvite ? (
                  <Button size="sm" type="button" onClick={openInvite}>
                    <UserPlus data-icon="inline-start" />
                    Convidar funcionário
                  </Button>
                ) : null}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pessoa</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Acesso</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead className="w-[1%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {user.avatarUrl ? (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.displayName}
                              />
                            ) : null}
                            <AvatarFallback>
                              {initials(user.displayName, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {user.displayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="max-w-56 text-muted-foreground">
                        <span className="line-clamp-2 text-sm">
                          {menusSummary(user)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.hasManagerPin ? "default" : "outline"}
                        >
                          {user.hasManagerPin ? "Com senha" : "Sem senha"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canEditMember(user) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil data-icon="inline-start" />
                            {isOwner ? "Editar" : "Menus"}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {pendingInvites.length > 0 ? (
          <Card size="sm" className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4" />
                Convites pendentes
              </CardTitle>
              <CardDescription>
                Compartilhe o link com a pessoa convidada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabel(invite.role)}
                      {invite.allowedMenus?.length
                        ? ` · ${invite.allowedMenus.length} menus`
                        : ""}
                      {" · "}
                      criado {formatRelative(invite.createdAtUtc)}
                    </p>
                  </div>
                  <RoleBadge role={invite.role} />
                  {invite.inviteUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void copyLink(invite.inviteUrl!)}
                    >
                      <Copy data-icon="inline-start" />
                      Copiar
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleRevoke(invite.id)}
                  >
                    Revogar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Sheet
          open={Boolean(editingMember)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingMember(null)
              setManagerPin("")
              setManagerPinConfirm("")
            }
          }}
        >
          <SheetContent
            side="right"
            className="flex w-full flex-col sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>
                {editingMember?.displayName ?? "Funcionário"}
              </SheetTitle>
              <SheetDescription>
                {editingMember?.role === "owner"
                  ? "Defina a senha de gerente usada para abrir e fechar a loja."
                  : "Ajuste o acesso aos menus e, se for owner, a senha de gerente."}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1 px-6">
              <div className="space-y-6 pb-4">
                {editingMember && editingMember.role !== "owner" ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Menus</p>
                      <p className="text-xs text-muted-foreground">
                        Escolha um atalho ou marque só o que essa pessoa precisa.
                      </p>
                    </div>
                    <MenuAccessPicker
                      value={editMenus}
                      onChange={setEditMenus}
                    />
                    <Button
                      type="button"
                      className="w-full"
                      disabled={savingMenus}
                      onClick={() => void handleSaveMenus()}
                    >
                      {savingMenus ? "Salvando…" : "Salvar acesso"}
                    </Button>
                  </div>
                ) : null}

                {isOwner && editingMember ? (
                  <div className="space-y-3">
                    {editingMember.role !== "owner" ? (
                      <Separator />
                    ) : null}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">Senha de gerente</p>
                        <p className="text-xs text-muted-foreground">
                          Usada para abrir e fechar a loja (4–32 caracteres).
                        </p>
                      </div>
                      <Badge
                        variant={
                          editingMember.hasManagerPin ? "default" : "outline"
                        }
                      >
                        {editingMember.hasManagerPin
                          ? "Com senha"
                          : "Sem senha"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager-pin">Nova senha</Label>
                      <Input
                        id="manager-pin"
                        type="password"
                        autoComplete="new-password"
                        value={managerPin}
                        onChange={(e) => setManagerPin(e.target.value)}
                        minLength={4}
                        maxLength={32}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager-pin-confirm">Confirmar senha</Label>
                      <Input
                        id="manager-pin-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={managerPinConfirm}
                        onChange={(e) => setManagerPinConfirm(e.target.value)}
                        minLength={4}
                        maxLength={32}
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        className="flex-1"
                        disabled={
                          savingPin ||
                          !managerPin ||
                          managerPin !== managerPinConfirm
                        }
                        onClick={() => void handleSaveManagerPin()}
                      >
                        {savingPin ? "Salvando…" : "Salvar senha"}
                      </Button>
                      {editingMember.hasManagerPin ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={savingPin}
                          onClick={() => void handleClearManagerPin()}
                        >
                          Remover
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
            <SheetFooter className="flex-row gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditingMember(null)}
              >
                Fechar
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
          <SheetContent
            side="right"
            className="flex w-full flex-col sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Convidar funcionário</SheetTitle>
              <SheetDescription>
                A pessoa entra com Auth0 no e-mail convidado e herda os menus
                que você definir.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={(e) => void handleInvite(e)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex min-h-0 flex-1 flex-col gap-4 px-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-email">E-mail</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pessoa@empresa.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-role">Perfil</Label>
                  <Select
                    value={role}
                    onValueChange={(value) => {
                      if (value == null) return
                      const next = String(value)
                      if (next === "admin" || next === "member") {
                        setRole(next)
                      }
                    }}
                  >
                    <SelectTrigger id="invite-role" className="w-full min-w-0">
                      <SelectValue>
                        {role === "admin" ? "Admin" : "Membro"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === "member" ? (
                  <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <Label>Menus liberados</Label>
                    <MenuAccessPicker
                      value={inviteMenus}
                      onChange={setInviteMenus}
                    />
                  </div>
                ) : (
                  <p className="rounded-2xl border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                    Admin recebe acesso amplo (exceto Tenants). Você pode
                    restringir depois na lista.
                  </p>
                )}
              </div>
              <SheetFooter className="flex-row gap-2 border-t">
                <Button type="submit" className="flex-1" disabled={inviting}>
                  {inviting ? "Criando…" : "Criar convite"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancelar
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </ModuleShell>
  )
}
