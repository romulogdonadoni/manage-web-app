"use client"

import { Layers3, Plus, Trash2, UtensilsCrossed } from "lucide-react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ImageUploadButton } from "@/components/app/image-upload-button"
import { ModuleShell } from "@/components/app/module-shell"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api/client"
import {
  addOptionItem,
  createMenuCategory,
  createMenuProduct,
  createOptionGroup,
  deleteMenuCategory,
  deleteMenuProduct,
  deleteOptionItem,
  listMenuCategories,
  listMenuProducts,
  listOptionGroups,
  setProductOptionGroups,
  updateMenuProduct,
  updateOptionGroup,
  updateOptionItem,
  type MenuCategoryDto,
  type MenuOptionGroupDto,
  type MenuProductDto,
} from "@/lib/api/menu"
import { resolveTenantFromPath } from "@/lib/auth/tenant-host"

type ProductForm = {
  categoryId: string
  name: string
  description: string
  price: string
  compareAtPrice: string
  imageUrl: string
  badge: string
  isPopular: boolean
  isActive: boolean
}

type OptionEditor = {
  key: string
  id?: string
  name: string
  price: string
}

type GroupEditor = {
  key: string
  id?: string
  title: string
  minSelect: string
  maxSelect: string
  options: OptionEditor[]
  /** Opções removidas na UI; sincronizadas no save. */
  removedOptionIds: string[]
}

const emptyForm = (categoryId = ""): ProductForm => ({
  categoryId,
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  imageUrl: "",
  badge: "",
  isPopular: false,
  isActive: true,
})

/** Converte input sem forçar casas decimais / arredondamento. */
function parseMoney(value: string): number {
  const n = Number(value.replace(",", ".").trim())
  return Number.isFinite(n) ? n : 0
}

/** Valor do API → input, sem toFixed (evita arredondar). */
function moneyToInput(value: number): string {
  if (!Number.isFinite(value)) return ""
  return String(value)
}

function formatProductBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

function emptyGroupEditor(): GroupEditor {
  return {
    key: crypto.randomUUID(),
    title: "",
    minSelect: "0",
    maxSelect: "1",
    options: [{ key: crypto.randomUUID(), name: "", price: "0" }],
    removedOptionIds: [],
  }
}

function groupToEditor(group: MenuOptionGroupDto): GroupEditor {
  return {
    key: group.id,
    id: group.id,
    title: group.title,
    minSelect: String(group.minSelect),
    maxSelect: String(group.maxSelect),
    options: group.options.map((o) => ({
      key: o.id,
      id: o.id,
      name: o.name,
      price: moneyToInput(o.price),
    })),
    removedOptionIds: [],
  }
}

/** Cadastro completo: produtos, categorias e grupos de opções. */
export default function ProductsPage() {
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

  const [categories, setCategories] = useState<MenuCategoryDto[]>([])
  const [products, setProducts] = useState<MenuProductDto[]>([])
  const [optionGroups, setOptionGroups] = useState<MenuOptionGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [productOpen, setProductOpen] = useState(false)
  const [editing, setEditing] = useState<MenuProductDto | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm())
  const [groupEditors, setGroupEditors] = useState<GroupEditor[]>([])
  const [accordionOpen, setAccordionOpen] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState<
    | { kind: "category"; id: string; name: string }
    | { kind: "product"; id: string; name: string }
    | null
  >(null)

  const reload = useCallback(async () => {
    if (!auth) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [cats, prods, groups] = await Promise.all([
        listMenuCategories(auth),
        listMenuProducts(auth),
        listOptionGroups(auth),
      ])
      setCategories(cats)
      setProducts(prods)
      setOptionGroups(groups)
      if (
        cats.length > 0 &&
        activeTab !== "all" &&
        !cats.some((c) => c.id === activeTab)
      ) {
        setActiveTab("all")
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar produtos."
      )
    } finally {
      setLoading(false)
    }
  }, [auth, activeTab])

  useEffect(() => {
    if (status === "loading") return
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, status])

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) ?? "—"
  }, [categories])

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products
    return products.filter((p) => p.categoryId === activeTab)
  }, [activeTab, products])

  function openCreate() {
    setEditing(null)
    const defaultCat =
      activeTab !== "all"
        ? activeTab
        : (categories.find((c) => c.isActive)?.id ?? categories[0]?.id ?? "")
    setForm(emptyForm(defaultCat))
    setGroupEditors([])
    setAccordionOpen([])
    setProductOpen(true)
  }

  function openEdit(product: MenuProductDto) {
    setEditing(product)
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: moneyToInput(product.price),
      compareAtPrice:
        product.compareAtPrice != null
          ? moneyToInput(product.compareAtPrice)
          : "",
      imageUrl: product.imageUrl ?? "",
      badge: product.badge ?? "",
      isPopular: product.isPopular,
      isActive: product.isActive,
    })
    const editors = product.optionGroupIds
      .map((id) => optionGroups.find((g) => g.id === id))
      .filter((g): g is MenuOptionGroupDto => g != null)
      .map(groupToEditor)
    setGroupEditors(editors)
    setAccordionOpen(editors.map((e) => e.key))
    setProductOpen(true)
  }

  async function handleCreateCategory() {
    if (!auth || !newCategory.trim()) return
    setBusy(true)
    try {
      await createMenuCategory(newCategory.trim(), auth)
      setNewCategory("")
      toast.success("Categoria criada.")
      await reload()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao criar categoria."
      )
    } finally {
      setBusy(false)
    }
  }

  async function syncGroupEditors(): Promise<string[]> {
    if (!auth) return []
    const ids: string[] = []

    for (const editor of groupEditors) {
      const title = editor.title.trim()
      if (!title) continue

      const minSelect = Math.max(0, Number.parseInt(editor.minSelect, 10) || 0)
      const maxSelect = Math.max(
        minSelect,
        Number.parseInt(editor.maxSelect, 10) || 1
      )

      let groupId = editor.id
      if (groupId) {
        await updateOptionGroup(groupId, { title, minSelect, maxSelect }, auth)
        for (const removedId of editor.removedOptionIds) {
          await deleteOptionItem(groupId, removedId, auth)
        }
        for (const opt of editor.options) {
          const name = opt.name.trim()
          if (!name) continue
          const price = parseMoney(opt.price)
          if (opt.id) {
            await updateOptionItem(groupId, opt.id, { name, price }, auth)
          } else {
            await addOptionItem(groupId, { name, price }, auth)
          }
        }
      } else {
        const created = await createOptionGroup(
          { title, minSelect, maxSelect },
          auth
        )
        groupId = created.id
        for (const opt of editor.options) {
          const name = opt.name.trim()
          if (!name) continue
          await addOptionItem(
            groupId,
            { name, price: parseMoney(opt.price) },
            auth
          )
        }
      }
      ids.push(groupId)
    }

    return ids
  }

  async function handleSaveProduct() {
    if (!auth || !form.name.trim() || !form.categoryId) return
    setBusy(true)
    try {
      const price = parseMoney(form.price)
      const compareAt = form.compareAtPrice.trim()
        ? parseMoney(form.compareAtPrice)
        : null
      const optionGroupIds = await syncGroupEditors()

      if (editing) {
        await updateMenuProduct(
          editing.id,
          {
            categoryId: form.categoryId,
            name: form.name.trim(),
            description: form.description.trim(),
            price,
            compareAtPrice: compareAt,
            clearCompareAtPrice: compareAt == null,
            imageUrl: form.imageUrl || null,
            clearImageUrl: !form.imageUrl,
            badge: form.badge.trim() || null,
            clearBadge: !form.badge.trim(),
            isPopular: form.isPopular,
            isActive: form.isActive,
          },
          auth
        )
        await setProductOptionGroups(editing.id, optionGroupIds, auth)
        toast.success("Produto atualizado.")
      } else {
        const created = await createMenuProduct(
          {
            categoryId: form.categoryId,
            name: form.name.trim(),
            description: form.description.trim(),
            price,
            compareAtPrice: compareAt,
            imageUrl: form.imageUrl || null,
            badge: form.badge.trim() || null,
            isPopular: form.isPopular,
            optionGroupIds,
          },
          auth
        )
        if (form.isActive !== created.isActive) {
          await updateMenuProduct(
            created.id,
            { isActive: form.isActive },
            auth
          )
        }
        toast.success("Produto criado.")
      }
      setProductOpen(false)
      await reload()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao salvar produto."
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmDelete() {
    if (!auth || !confirmDelete) return
    setBusy(true)
    try {
      if (confirmDelete.kind === "category") {
        await deleteMenuCategory(confirmDelete.id, auth)
        toast.success("Categoria excluída.")
      } else {
        await deleteMenuProduct(confirmDelete.id, auth)
        toast.success("Produto excluído.")
      }
      setConfirmDelete(null)
      await reload()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir."
      )
    } finally {
      setBusy(false)
    }
  }

  const activeCount = products.filter((p) => p.isActive).length

  return (
    <ModuleShell
      title="Produtos"
      description="Cadastre itens, categorias e opções. A visibilidade no app fica no Cardápio."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Card size="sm" className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <UtensilsCrossed className="size-3.5" />
              Total de produtos
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {loading ? "—" : products.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {activeCount} ativos no app
          </CardContent>
        </Card>
        <Card size="sm" className="shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Layers3 className="size-3.5" />
              Categorias
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {loading ? "—" : categories.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {optionGroups.length} grupos de opções
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <Card size="sm" className="h-fit shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Categorias</CardTitle>
            <CardDescription>Organize os produtos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nova categoria"
                disabled={!auth || busy}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreateCategory()
                }}
              />
              <Button
                type="button"
                size="icon"
                disabled={!auth || busy || !newCategory.trim()}
                onClick={() => void handleCreateCategory()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left font-medium hover:underline"
                    onClick={() => setActiveTab(cat.id)}
                  >
                    {cat.name}
                  </button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={busy}
                    aria-label="Excluir categoria"
                    onClick={() =>
                      setConfirmDelete({
                        kind: "category",
                        id: cat.id,
                        name: cat.name,
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              type="button"
              disabled={!auth || categories.length === 0}
              onClick={openCreate}
            >
              <Plus className="size-4" />
              Novo produto
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : filteredProducts.length === 0 ? (
            <Card size="sm" className="shadow-none">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {categories.length === 0
                  ? "Crie uma categoria para começar."
                  : "Nenhum produto nesta categoria."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} size="sm" className="shadow-none">
                  <CardContent className="flex flex-wrap items-start gap-4 py-4">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="size-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-xl bg-muted">
                        <UtensilsCrossed className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{product.name}</p>
                        {product.isActive ? (
                          <Badge variant="secondary">Ativo no app</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                        {product.isPopular ? (
                          <Badge variant="secondary">Popular</Badge>
                        ) : null}
                        {product.badge ? (
                          <Badge variant="secondary">{product.badge}</Badge>
                        ) : null}
                        {product.optionGroupIds.length > 0 ? (
                          <Badge variant="outline">
                            {product.optionGroupIds.length} grupo
                            {product.optionGroupIds.length > 1 ? "s" : ""}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {product.description || "Sem descrição"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {categoryName(product.categoryId)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-medium tabular-nums">
                        {formatProductBRL(product.price)}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(product)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={busy}
                          aria-label="Excluir produto"
                          onClick={() =>
                            setConfirmDelete({
                              kind: "product",
                              id: product.id,
                              name: product.name,
                            })
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={productOpen}
        onOpenChange={(open) => {
          setProductOpen(open)
          if (!open) setEditing(null)
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,44rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b p-6 pb-4">
            <DialogTitle>
              {editing ? "Editar produto" : "Novo produto"}
            </DialogTitle>
            <DialogDescription>
              Inclua opções (carne, molho…) e defina se aparece no app.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex flex-col">
            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nome</Label>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-desc">Descrição</Label>
                <Input
                  id="product-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-cat">Categoria</Label>
                <Select
                  value={form.categoryId || null}
                  onValueChange={(value) => {
                    if (value == null) return
                    setForm((f) => ({ ...f, categoryId: String(value) }))
                  }}
                  disabled={busy}
                >
                  <SelectTrigger id="product-cat" className="w-full min-w-0">
                    <SelectValue placeholder="Selecione…">
                      {categories.find((c) => c.id === form.categoryId)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="product-price">Preço</Label>
                  <Input
                    id="product-price"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="32.90"
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-compare">De (opcional)</Label>
                  <Input
                    id="product-compare"
                    value={form.compareAtPrice}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        compareAtPrice: e.target.value,
                      }))
                    }
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-badge">Badge</Label>
                <Input
                  id="product-badge"
                  value={form.badge}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, badge: e.target.value }))
                  }
                  placeholder="Novo…"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label>Foto</Label>
                <div className="flex flex-wrap items-center gap-3">
                  {form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.imageUrl}
                      alt=""
                      className="size-14 rounded-lg object-cover"
                    />
                  ) : null}
                  <ImageUploadButton
                    folder="menu"
                    tenantId={tenantId}
                    label="Enviar foto"
                    onUploaded={({ publicUrl }) =>
                      setForm((f) => ({ ...f, imageUrl: publicUrl }))
                    }
                  />
                  {form.imageUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm((f) => ({ ...f, imageUrl: "" }))
                      }
                    >
                      Remover
                    </Button>
                  ) : null}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isPopular}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isPopular: v === true }))
                  }
                />
                Popular
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v === true }))
                  }
                />
                Ativo no app
              </label>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Grupos de opções</p>
                  <p className="text-xs text-muted-foreground">
                    Edite título, limites e opções. Alterações de grupos
                    existentes valem para todos os produtos que os usam.
                  </p>
                </div>

                {groupEditors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum grupo neste produto. Crie ou reutilize um abaixo.
                  </p>
                ) : (
                  <Accordion
                    multiple
                    value={accordionOpen}
                    onValueChange={setAccordionOpen}
                    className="rounded-xl"
                  >
                    {groupEditors.map((editor) => (
                      <AccordionItem key={editor.key} value={editor.key}>
                        <AccordionTrigger className="hover:no-underline">
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                            <span className="truncate font-medium">
                              {editor.title.trim() ||
                                (editor.id ? "Grupo" : "Novo grupo")}
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {editor.minSelect || "0"}–
                              {editor.maxSelect || "1"} ·{" "}
                              {editor.options.length} opções
                              {!editor.id ? " · rascunho" : ""}
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-1">
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => {
                                  setGroupEditors((prev) =>
                                    prev.filter((g) => g.key !== editor.key)
                                  )
                                  setAccordionOpen((prev) =>
                                    prev.filter((v) => v !== editor.key)
                                  )
                                }}
                              >
                                <Trash2 className="size-3.5" />
                                Remover do produto
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`group-title-${editor.key}`}>
                                Título do grupo
                              </Label>
                              <Input
                                id={`group-title-${editor.key}`}
                                value={editor.title}
                                onChange={(e) =>
                                  setGroupEditors((prev) =>
                                    prev.map((g) =>
                                      g.key === editor.key
                                        ? { ...g, title: e.target.value }
                                        : g
                                    )
                                  )
                                }
                                placeholder="Ex.: Ponto da carne"
                                disabled={busy}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label htmlFor={`group-min-${editor.key}`}>
                                  Mín. seleções
                                </Label>
                                <Input
                                  id={`group-min-${editor.key}`}
                                  value={editor.minSelect}
                                  onChange={(e) =>
                                    setGroupEditors((prev) =>
                                      prev.map((g) =>
                                        g.key === editor.key
                                          ? {
                                              ...g,
                                              minSelect: e.target.value,
                                            }
                                          : g
                                      )
                                    )
                                  }
                                  placeholder="0"
                                  inputMode="numeric"
                                  disabled={busy}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                  0 = opcional
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`group-max-${editor.key}`}>
                                  Máx. seleções
                                </Label>
                                <Input
                                  id={`group-max-${editor.key}`}
                                  value={editor.maxSelect}
                                  onChange={(e) =>
                                    setGroupEditors((prev) =>
                                      prev.map((g) =>
                                        g.key === editor.key
                                          ? {
                                              ...g,
                                              maxSelect: e.target.value,
                                            }
                                          : g
                                      )
                                    )
                                  }
                                  placeholder="1"
                                  inputMode="numeric"
                                  disabled={busy}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                  1 = escolha única
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="grid grid-cols-[1fr_5.5rem_auto] gap-2 px-0.5">
                                <Label>Nome da opção</Label>
                                <Label>Preço (R$)</Label>
                                <span className="sr-only">Remover</span>
                              </div>
                              {editor.options.map((opt) => (
                                <div
                                  key={opt.key}
                                  className="grid grid-cols-[1fr_5.5rem_auto] gap-2"
                                >
                                  <Input
                                    value={opt.name}
                                    onChange={(e) =>
                                      setGroupEditors((prev) =>
                                        prev.map((g) =>
                                          g.key === editor.key
                                            ? {
                                                ...g,
                                                options: g.options.map((o) =>
                                                  o.key === opt.key
                                                    ? {
                                                        ...o,
                                                        name: e.target.value,
                                                      }
                                                    : o
                                                ),
                                              }
                                            : g
                                        )
                                      )
                                    }
                                    placeholder="Ex.: Ao ponto"
                                    disabled={busy}
                                  />
                                  <Input
                                    value={opt.price}
                                    onChange={(e) =>
                                      setGroupEditors((prev) =>
                                        prev.map((g) =>
                                          g.key === editor.key
                                            ? {
                                                ...g,
                                                options: g.options.map((o) =>
                                                  o.key === opt.key
                                                    ? {
                                                        ...o,
                                                        price: e.target.value,
                                                      }
                                                    : o
                                                ),
                                              }
                                            : g
                                        )
                                      )
                                    }
                                    placeholder="0"
                                    inputMode="decimal"
                                    disabled={busy}
                                  />
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    disabled={busy || editor.options.length <= 1}
                                    aria-label="Remover opção"
                                    onClick={() =>
                                      setGroupEditors((prev) =>
                                        prev.map((g) => {
                                          if (g.key !== editor.key) return g
                                          return {
                                            ...g,
                                            options: g.options.filter(
                                              (o) => o.key !== opt.key
                                            ),
                                            removedOptionIds: opt.id
                                              ? [
                                                  ...g.removedOptionIds,
                                                  opt.id,
                                                ]
                                              : g.removedOptionIds,
                                          }
                                        })
                                      )
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                setGroupEditors((prev) =>
                                  prev.map((g) =>
                                    g.key === editor.key
                                      ? {
                                          ...g,
                                          options: [
                                            ...g.options,
                                            {
                                              key: crypto.randomUUID(),
                                              name: "",
                                              price: "0",
                                            },
                                          ],
                                        }
                                      : g
                                  )
                                )
                              }
                            >
                              <Plus className="size-3.5" />
                              Opção
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      const next = emptyGroupEditor()
                      setGroupEditors((prev) => [...prev, next])
                      setAccordionOpen((prev) => [...prev, next.key])
                    }}
                  >
                    <Plus className="size-3.5" />
                    Criar grupo de opções
                  </Button>
                  {optionGroups.some(
                    (g) => !groupEditors.some((e) => e.id === g.id)
                  ) ? (
                    <Select
                      value={null}
                      onValueChange={(value) => {
                        if (value == null) return
                        const group = optionGroups.find((g) => g.id === value)
                        if (!group) return
                        if (groupEditors.some((e) => e.id === group.id)) return
                        const editor = groupToEditor(group)
                        setGroupEditors((prev) => [...prev, editor])
                        setAccordionOpen((prev) => [...prev, editor.key])
                      }}
                      disabled={busy}
                    >
                      <SelectTrigger className="h-8 w-auto min-w-40 text-xs">
                        <SelectValue placeholder="Reutilizar grupo…" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionGroups
                          .filter(
                            (g) => !groupEditors.some((e) => e.id === g.id)
                          )
                          .map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="shrink-0 border-t p-6 pt-4 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setProductOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={
                busy || !form.name.trim() || !form.categoryId || !form.price
              }
              onClick={() => void handleSaveProduct()}
            >
              {busy ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmDelete?.kind === "category"
                ? "Excluir categoria"
                : "Excluir produto"}
            </DialogTitle>
            <DialogDescription>
              {confirmDelete?.kind === "category"
                ? `Excluir a categoria "${confirmDelete.name}"?`
                : `Excluir "${confirmDelete?.name}"?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void handleConfirmDelete()}
            >
              {busy ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleShell>
  )
}
