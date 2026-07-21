"use client"

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Layers3,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ModuleShell } from "@/components/app/module-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api/client"
import {
  createMenuGroup,
  deleteMenuGroup,
  getMenu,
  listMenus,
  listMenuProducts,
  listProductGroups,
  setMenuGroupItems,
  updateMenuGroup,
  type MenuDto,
  type MenuGroupDto,
  type MenuGroupItemDto,
  type MenuGroupItemInput,
  type MenuGroupItemType,
  type MenuProductDto,
  type ProductGroupDto,
} from "@/lib/api/menu"
import {
  resolveTenantFromPath,
  withTenantPrefix,
} from "@/lib/auth/tenant-host"
import { formatBRL } from "@/lib/modules/billing"

function toItemInputs(items: MenuGroupItemDto[]): MenuGroupItemInput[] {
  return items.map((i) => ({
    type: i.type,
    referenceId: i.referenceId,
    isVisible: i.isVisible,
  }))
}

function sortGroups(groups: MenuGroupDto[]) {
  return [...groups].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
  )
}

function sortItems(items: MenuGroupItemDto[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function pickDefaultMenu(menus: MenuDto[]) {
  return menus.find((m) => m.isDefault) ?? menus[0] ?? null
}

function errMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return fallback
}

/** Cardápio — apresentação: Menu → Seções → Itens. */
export default function MenuPage() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const tenantId = useMemo(
    () =>
      resolveTenantFromPath(pathname) ||
      session?.tenant?.trim().toLowerCase() ||
      null,
    [pathname, session?.tenant]
  )

  const auth = useMemo(() => {
    if (!session?.accessToken || !tenantId) return null
    return { accessToken: session.accessToken, tenantId }
  }, [session?.accessToken, tenantId])

  const productsHref = useMemo(
    () =>
      tenantId ? withTenantPrefix(tenantId, "/products") : "/products",
    [tenantId]
  )

  const [menu, setMenu] = useState<MenuDto | null>(null)
  const [groups, setGroups] = useState<MenuGroupDto[]>([])
  const [products, setProducts] = useState<MenuProductDto[]>([])
  const [productGroups, setProductGroups] = useState<ProductGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null)

  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [renameGroup, setRenameGroup] = useState<MenuGroupDto | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [confirmDeleteGroup, setConfirmDeleteGroup] =
    useState<MenuGroupDto | null>(null)

  const [addItemGroup, setAddItemGroup] = useState<MenuGroupDto | null>(null)
  const [addItemType, setAddItemType] =
    useState<MenuGroupItemType>("Product")
  const [addItemRefId, setAddItemRefId] = useState("")
  const [pickerFilter, setPickerFilter] = useState("")

  const productById = useMemo(() => {
    const map = new Map<string, MenuProductDto>()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  const productGroupById = useMemo(() => {
    const map = new Map<string, ProductGroupDto>()
    for (const g of productGroups) map.set(g.id, g)
    return map
  }, [productGroups])

  const resolveItem = useCallback(
    (item: MenuGroupItemDto) => {
      if (item.type === "Product") {
        const p = productById.get(item.referenceId)
        return {
          name: p?.name ?? "Produto removido",
          subtitle: p ? formatBRL(p.price) : item.referenceId.slice(0, 8),
          imageUrl: p?.imageUrl ?? null,
          missing: !p,
        }
      }
      const g = productGroupById.get(item.referenceId)
      return {
        name: g?.name ?? "Grupo removido",
        subtitle: g
          ? `${formatBRL(g.price)} · grupo de produtos`
          : item.referenceId.slice(0, 8),
        imageUrl: g?.imageUrl ?? null,
        missing: !g,
      }
    },
    [productById, productGroupById]
  )

  const reload = useCallback(async () => {
    if (!auth) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [menus, prods, groupsCatalog] = await Promise.all([
        listMenus(auth),
        listMenuProducts(auth),
        listProductGroups(auth),
      ])
      setProducts(prods)
      setProductGroups(groupsCatalog)

      const selected = pickDefaultMenu(menus)
      if (!selected) {
        setMenu(null)
        setGroups([])
        return
      }

      const full = await getMenu(selected.id, auth)
      setMenu(full)
      setGroups(sortGroups(full.groups ?? []))
    } catch (err) {
      toast.error(errMessage(err, "Falha ao carregar o cardápio."))
      setMenu(null)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    if (status === "loading") return
    void reload()
  }, [status, reload])

  const patchGroupLocal = (updated: MenuGroupDto) => {
    setGroups((prev) =>
      sortGroups(
        prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g))
      )
    )
  }

  const replaceGroupItems = async (
    group: MenuGroupDto,
    nextItems: MenuGroupItemInput[]
  ) => {
    if (!auth || !menu) return false
    setBusyGroupId(group.id)
    try {
      const updated = await setMenuGroupItems(
        menu.id,
        group.id,
        nextItems,
        auth
      )
      patchGroupLocal(updated)
      return true
    } catch (err) {
      toast.error(errMessage(err, "Falha ao atualizar itens."))
      await reload()
      return false
    } finally {
      setBusyGroupId(null)
    }
  }

  const handleCreateGroup = async () => {
    if (!auth || !menu) return
    const name = newGroupName.trim()
    if (!name) {
      toast.error("Informe o nome da seção.")
      return
    }
    setBusy(true)
    try {
      const created = await createMenuGroup(menu.id, { name }, auth)
      setGroups((prev) => sortGroups([...prev, { ...created, items: [] }]))
      setCreateGroupOpen(false)
      setNewGroupName("")
      toast.success("Seção criada.")
    } catch (err) {
      toast.error(errMessage(err, "Falha ao criar seção."))
    } finally {
      setBusy(false)
    }
  }

  const handleRenameGroup = async () => {
    if (!auth || !menu || !renameGroup) return
    const name = renameValue.trim()
    if (!name) {
      toast.error("Informe o nome da seção.")
      return
    }
    setBusy(true)
    try {
      const updated = await updateMenuGroup(
        menu.id,
        renameGroup.id,
        { name },
        auth
      )
      patchGroupLocal({ ...renameGroup, ...updated, items: renameGroup.items })
      setRenameGroup(null)
      toast.success("Seção renomeada.")
    } catch (err) {
      toast.error(errMessage(err, "Falha ao renomear."))
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!auth || !menu || !confirmDeleteGroup) return
    setBusy(true)
    try {
      await deleteMenuGroup(menu.id, confirmDeleteGroup.id, auth)
      setGroups((prev) => prev.filter((g) => g.id !== confirmDeleteGroup.id))
      setConfirmDeleteGroup(null)
      toast.success("Seção removida.")
    } catch (err) {
      toast.error(errMessage(err, "Falha ao excluir seção."))
    } finally {
      setBusy(false)
    }
  }

  const openAddItem = (group: MenuGroupDto) => {
    setAddItemGroup(group)
    setAddItemType("Product")
    setAddItemRefId("")
    setPickerFilter("")
  }

  const pickerOptions = useMemo(() => {
    const q = pickerFilter.trim().toLowerCase()
    if (addItemType === "Product") {
      return products
        .filter((p) => !q || p.name.toLowerCase().includes(q))
        .map((p) => ({
          id: p.id,
          label: p.name,
          hint: formatBRL(p.price),
        }))
    }
    return productGroups
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .map((g) => ({
        id: g.id,
        label: g.name,
        hint: formatBRL(g.price),
      }))
  }, [addItemType, pickerFilter, products, productGroups])

  const handleAddItem = async () => {
    if (!addItemGroup || !addItemRefId) {
      toast.error("Selecione um item do catálogo.")
      return
    }
    const group =
      groups.find((g) => g.id === addItemGroup.id) ?? addItemGroup
    const current = sortItems(group.items ?? [])
    const dup = current.some(
      (i) =>
        i.type === addItemType && i.referenceId === addItemRefId
    )
    if (dup) {
      toast.error("Este item já está nesta seção.")
      return
    }
    const next = [
      ...toItemInputs(current),
      { type: addItemType, referenceId: addItemRefId, isVisible: true },
    ]
    const ok = await replaceGroupItems(group, next)
    if (ok) {
      setAddItemGroup(null)
      toast.success("Item adicionado ao cardápio.")
    }
  }

  const toggleVisible = async (
    group: MenuGroupDto,
    item: MenuGroupItemDto
  ) => {
    const current = sortItems(group.items ?? [])
    const next = toItemInputs(current).map((row) =>
      row.referenceId === item.referenceId && row.type === item.type
        ? { ...row, isVisible: !item.isVisible }
        : row
    )
    await replaceGroupItems(group, next)
  }

  const removeItem = async (group: MenuGroupDto, item: MenuGroupItemDto) => {
    const current = sortItems(group.items ?? [])
    const next = toItemInputs(
      current.filter(
        (i) =>
          !(i.referenceId === item.referenceId && i.type === item.type)
      )
    )
    const ok = await replaceGroupItems(group, next)
    if (ok) toast.success("Item removido da seção.")
  }

  const moveItem = async (
    group: MenuGroupDto,
    index: number,
    direction: -1 | 1
  ) => {
    const current = sortItems(group.items ?? [])
    const target = index + direction
    if (target < 0 || target >= current.length) return
    const swapped = [...current]
    ;[swapped[index], swapped[target]] = [swapped[target], swapped[index]]
    await replaceGroupItems(group, toItemInputs(swapped))
  }

  const totalItems = groups.reduce(
    (acc, g) => acc + (g.items?.length ?? 0),
    0
  )
  const visibleItems = groups.reduce(
    (acc, g) => acc + (g.items?.filter((i) => i.isVisible).length ?? 0),
    0
  )

  return (
    <ModuleShell
      title="Cardápio"
      description="Organize seções e itens do app. Cadastre produtos em Produtos; aqui só organiza o que aparece."
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Cadastre produtos em{" "}
        <Link
          href={productsHref}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Produtos
        </Link>
        ; aqui só organiza o que aparece no app.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card size="sm" className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <UtensilsCrossed className="size-3.5" />
              Cardápio
            </CardDescription>
            <CardTitle className="truncate text-lg">
              {loading ? "—" : menu?.name ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {menu?.isDefault ? "Padrão" : "Selecionado"}
          </CardContent>
        </Card>
        <Card size="sm" className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Layers3 className="size-3.5" />
              Seções
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {loading ? "—" : groups.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Ex.: Promoções, Lanches
          </CardContent>
        </Card>
        <Card size="sm" className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="size-3.5" />
              Itens no app
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {loading ? "—" : `${visibleItems}/${totalItems}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Visíveis / total nas seções
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Seções vazias até você adicionar itens.
        </p>
        <Button
          type="button"
          disabled={!auth || !menu || busy}
          onClick={() => {
            setNewGroupName("")
            setCreateGroupOpen(true)
          }}
        >
          <Plus className="size-4" />
          Nova seção
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !menu ? (
        <Card size="sm" className="shadow-none">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Não foi possível carregar o cardápio.
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card size="sm" className="shadow-none">
          <CardContent className="space-y-3 py-12 text-center text-sm text-muted-foreground">
            <p>Nenhuma seção ainda. Crie seções como Promoções ou Lanches.</p>
            <Button
              type="button"
              variant="outline"
              disabled={!auth || busy}
              onClick={() => {
                setNewGroupName("")
                setCreateGroupOpen(true)
              }}
            >
              <Plus className="size-4" />
              Nova seção
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const items = sortItems(group.items ?? [])
            const groupBusy = busyGroupId === group.id
            return (
              <section key={group.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{group.name}</h2>
                    <Badge variant="secondary">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </Badge>
                    {!group.isActive ? (
                      <Badge variant="outline">Seção inativa</Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!auth || groupBusy}
                      onClick={() => openAddItem(group)}
                    >
                      <Plus className="size-3.5" />
                      Adicionar ao cardápio
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={!auth || busy}
                      onClick={() => {
                        setRenameGroup(group)
                        setRenameValue(group.name)
                      }}
                    >
                      Renomear
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      disabled={!auth || busy}
                      aria-label="Excluir seção"
                      onClick={() => setConfirmDeleteGroup(group)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <Card size="sm" className="shadow-none">
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      Seção vazia. Adicione produtos ou grupos do catálogo.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, index) => {
                      const resolved = resolveItem(item)
                      return (
                        <Card
                          key={item.id}
                          size="sm"
                          className="shadow-none"
                        >
                          <CardContent className="flex flex-wrap items-center gap-4 py-4">
                            {resolved.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolved.imageUrl}
                                alt=""
                                className="size-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
                                <UtensilsCrossed className="size-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{resolved.name}</p>
                                <Badge variant="outline">
                                  {item.type === "Product"
                                    ? "Produto"
                                    : "Grupo"}
                                </Badge>
                                {item.isVisible ? (
                                  <Badge variant="secondary">No app</Badge>
                                ) : (
                                  <Badge variant="outline">Oculto</Badge>
                                )}
                                {resolved.missing ? (
                                  <Badge variant="destructive">
                                    Não encontrado
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {resolved.subtitle}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={groupBusy || index === 0}
                                aria-label="Mover para cima"
                                onClick={() => void moveItem(group, index, -1)}
                              >
                                <ArrowUp className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={
                                  groupBusy || index === items.length - 1
                                }
                                aria-label="Mover para baixo"
                                onClick={() => void moveItem(group, index, 1)}
                              >
                                <ArrowDown className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={
                                  item.isVisible ? "outline" : "default"
                                }
                                disabled={groupBusy}
                                onClick={() =>
                                  void toggleVisible(group, item)
                                }
                              >
                                {item.isVisible ? (
                                  <>
                                    <EyeOff className="size-3.5" />
                                    Ocultar
                                  </>
                                ) : (
                                  <>
                                    <Eye className="size-3.5" />
                                    Mostrar
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                disabled={groupBusy}
                                aria-label="Remover do cardápio"
                                onClick={() => void removeItem(group, item)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      <Dialog
        open={createGroupOpen}
        onOpenChange={(open) => {
          setCreateGroupOpen(open)
          if (!open) setNewGroupName("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova seção</DialogTitle>
            <DialogDescription>
              Ex.: Promoções, Lanches, Bebidas — agrupa o que aparece no app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome da seção</Label>
            <Input
              id="group-name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Promoções"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateGroup()
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateGroupOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={busy || !newGroupName.trim()}
              onClick={() => void handleCreateGroup()}
            >
              Criar seção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!renameGroup}
        onOpenChange={(open) => {
          if (!open) setRenameGroup(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear seção</DialogTitle>
            <DialogDescription>
              Altere o nome exibido no cardápio do app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-group">Nome</Label>
            <Input
              id="rename-group"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleRenameGroup()
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameGroup(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={busy || !renameValue.trim()}
              onClick={() => void handleRenameGroup()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDeleteGroup}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteGroup(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir seção?</DialogTitle>
            <DialogDescription>
              A seção &quot;{confirmDeleteGroup?.name}&quot; e seus itens no
              cardápio serão removidos. Produtos do catálogo não são apagados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteGroup(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void handleDeleteGroup()}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!addItemGroup}
        onOpenChange={(open) => {
          if (!open) setAddItemGroup(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar ao cardápio</DialogTitle>
            <DialogDescription>
              Escolha um produto ou grupo do catálogo para a seção{" "}
              <span className="font-medium text-foreground">
                {addItemGroup?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={addItemType}
            onValueChange={(v) => {
              setAddItemType(v as MenuGroupItemType)
              setAddItemRefId("")
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="Product" className="flex-1">
                Produto
              </TabsTrigger>
              <TabsTrigger value="ProductGroup" className="flex-1">
                Grupo de produtos
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="picker-filter">Buscar</Label>
            <Input
              id="picker-filter"
              value={pickerFilter}
              onChange={(e) => setPickerFilter(e.target.value)}
              placeholder="Filtrar pelo nome…"
            />
          </div>

          <ScrollArea className="h-64 rounded-md border">
            <div className="space-y-1 p-2">
              {pickerOptions.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {addItemType === "Product"
                    ? "Nenhum produto no catálogo. Cadastre em Produtos."
                    : "Nenhum grupo de produtos no catálogo."}
                </p>
              ) : (
                pickerOptions.map((opt) => {
                  const selected = addItemRefId === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setAddItemRefId(opt.id)}
                    >
                      <span className="truncate font-medium">{opt.label}</span>
                      <span
                        className={`shrink-0 text-xs ${
                          selected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {opt.hint}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddItemGroup(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={
                !addItemRefId ||
                (!!addItemGroup && busyGroupId === addItemGroup.id)
              }
              onClick={() => void handleAddItem()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  )
}
