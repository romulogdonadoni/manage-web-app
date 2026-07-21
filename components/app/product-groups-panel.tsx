"use client"

import { Package, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ImageUploadButton } from "@/components/app/image-upload-button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { ApiError } from "@/lib/api/client"
import {
  createProductGroup,
  deleteProductGroup,
  listProductGroups,
  setProductGroupItems,
  setProductGroupSlots,
  updateProductGroup,
  type MenuProductDto,
  type ProductGroupDto,
  type ProductGroupPriceMode,
} from "@/lib/api/menu"
import {
  formatCurrencyBRL,
  moneyToInput,
  parseMoneyInput,
} from "@/lib/format/currency"

type Auth = { accessToken: string; tenantId: string }

type ItemEditor = {
  key: string
  productId: string
  quantity: string
}

type SlotProductEditor = {
  key: string
  productId: string
  extraPrice: string
  isDefault: boolean
}

type SlotEditor = {
  key: string
  title: string
  minSelect: string
  maxSelect: string
  products: SlotProductEditor[]
}

type GroupForm = {
  name: string
  description: string
  imageUrl: string
  priceMode: ProductGroupPriceMode
  price: string
  discountValue: string
  discountType: "Percentage" | "FixedAmount"
  isActive: boolean
  items: ItemEditor[]
  slots: SlotEditor[]
}

function priceModeLabel(mode: string): string {
  switch (mode) {
    case "Fixed":
      return "Preço fixo"
    case "SumProducts":
      return "Soma dos produtos"
    case "Discount":
      return "Desconto sobre a soma"
    default:
      return mode
  }
}

function discountTypeLabel(type: string): string {
  switch (type) {
    case "Percentage":
      return "%"
    case "FixedAmount":
      return "R$"
    default:
      return type
  }
}

function emptyForm(): GroupForm {
  return {
    name: "",
    description: "",
    imageUrl: "",
    priceMode: "Fixed",
    price: "",
    discountValue: "",
    discountType: "Percentage",
    isActive: true,
    items: [],
    slots: [],
  }
}

function groupToForm(group: ProductGroupDto): GroupForm {
  return {
    name: group.name,
    description: group.description ?? "",
    imageUrl: group.imageUrl ?? "",
    priceMode: (group.priceMode as ProductGroupPriceMode) || "Fixed",
    price: moneyToInput(group.price),
    discountValue:
      group.discountValue != null ? moneyToInput(group.discountValue) : "",
    discountType:
      group.discountType === "FixedAmount" ? "FixedAmount" : "Percentage",
    isActive: group.isActive,
    items: group.items.map((i) => ({
      key: i.id,
      productId: i.productId,
      quantity: String(i.quantity),
    })),
    slots: group.slots.map((s) => ({
      key: s.id,
      title: s.title,
      minSelect: String(s.minSelect),
      maxSelect: String(s.maxSelect),
      products: s.products.map((p) => ({
        key: p.id,
        productId: p.productId,
        extraPrice: moneyToInput(p.extraPrice),
        isDefault: p.isDefault,
      })),
    })),
  }
}

function buildItemsPayload(form: GroupForm) {
  return form.items
    .filter((i) => i.productId)
    .map((i) => ({
      productId: i.productId,
      quantity: Math.max(1, Number.parseInt(i.quantity, 10) || 1),
    }))
}

function buildSlotsPayload(form: GroupForm) {
  return form.slots
    .filter((s) => s.title.trim())
    .map((s) => ({
      title: s.title.trim(),
      minSelect: Math.max(0, Number.parseInt(s.minSelect, 10) || 0),
      maxSelect: Math.max(
        Math.max(0, Number.parseInt(s.minSelect, 10) || 0),
        Number.parseInt(s.maxSelect, 10) || 1
      ),
      products: s.products
        .filter((p) => p.productId)
        .map((p) => ({
          productId: p.productId,
          extraPrice: parseMoneyInput(p.extraPrice),
          isDefault: p.isDefault,
        })),
    }))
}

type Props = {
  auth: Auth | null
  tenantId: string | null
  products: MenuProductDto[]
}

export function ProductGroupsPanel({ auth, tenantId, products }: Props) {
  const [groups, setGroups] = useState<ProductGroupDto[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductGroupDto | null>(null)
  const [form, setForm] = useState<GroupForm>(emptyForm())
  const [slotAccordion, setSlotAccordion] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState<ProductGroupDto | null>(
    null
  )

  const productById = useMemo(() => {
    const map = new Map<string, MenuProductDto>()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  const reload = useCallback(async () => {
    if (!auth) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setGroups(await listProductGroups(auth))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao carregar grupos."
      )
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    void reload()
  }, [reload])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setSlotAccordion([])
    setDialogOpen(true)
  }

  function openEdit(group: ProductGroupDto) {
    setEditing(group)
    const next = groupToForm(group)
    setForm(next)
    setSlotAccordion(next.slots.map((s) => s.key))
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!auth || !form.name.trim()) return
    if (form.priceMode === "Fixed" && !form.price.trim()) {
      toast.error("Informe o preço fixo do grupo.")
      return
    }
    if (form.priceMode === "Discount" && !form.discountValue.trim()) {
      toast.error("Informe o valor do desconto.")
      return
    }

    setBusy(true)
    try {
      const price =
        form.priceMode === "SumProducts" ? 0 : parseMoneyInput(form.price)
      const discountValue =
        form.priceMode === "Discount" ? parseMoneyInput(form.discountValue) : null
      const discountType =
        form.priceMode === "Discount" ? form.discountType : null
      const items = buildItemsPayload(form)
      const slots = buildSlotsPayload(form)

      if (editing) {
        await updateProductGroup(
          editing.id,
          {
            name: form.name.trim(),
            description: form.description.trim() || null,
            clearDescription: !form.description.trim(),
            priceMode: form.priceMode,
            price,
            discountValue,
            discountType,
            imageUrl: form.imageUrl || null,
            clearImageUrl: !form.imageUrl,
            isActive: form.isActive,
          },
          auth
        )
        await setProductGroupItems(editing.id, items, auth)
        await setProductGroupSlots(editing.id, slots, auth)
        toast.success("Grupo atualizado.")
      } else {
        await createProductGroup(
          {
            name: form.name.trim(),
            type: "Combo",
            priceMode: form.priceMode,
            price,
            discountValue,
            discountType,
            description: form.description.trim() || null,
            imageUrl: form.imageUrl || null,
            items,
            slots,
          },
          auth
        )
        toast.success("Grupo criado.")
      }
      setDialogOpen(false)
      await reload()
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falha ao salvar grupo."
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!auth || !confirmDelete) return
    setBusy(true)
    try {
      await deleteProductGroup(confirmDelete.id, auth)
      toast.success("Grupo excluído.")
      setConfirmDelete(null)
      await reload()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir grupo."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Combos e kits: produtos fixos + slots de escolha (ex.: escolha a
          bebida).
        </p>
        <Button type="button" disabled={!auth || products.length === 0} onClick={openCreate}>
          <Plus className="size-4" />
          Novo grupo
        </Button>
      </div>

      {products.length === 0 ? (
        <Card size="sm" className="mt-4 shadow-none">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Cadastre produtos antes de montar um grupo composto.
          </CardContent>
        </Card>
      ) : loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
      ) : groups.length === 0 ? (
        <Card size="sm" className="mt-4 shadow-none">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum grupo composto ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {groups.map((group) => (
            <Card key={group.id} size="sm" className="shadow-none p-0">
              <CardContent className="flex flex-wrap items-start gap-4 py-4">
                {group.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.imageUrl}
                    alt=""
                    className="size-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-xl bg-muted">
                    <Package className="size-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{group.name}</p>
                    {group.isActive ? (
                      <Badge variant="secondary">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                    <Badge variant="outline">
                      {priceModeLabel(group.priceMode)}
                    </Badge>
                  </div>
                  {group.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {group.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {group.items.length} item
                    {group.items.length !== 1 ? "s" : ""} fixo
                    {group.items.length !== 1 ? "s" : ""} · {group.slots.length}{" "}
                    slot{group.slots.length !== 1 ? "s" : ""}
                    {group.priceMode === "Fixed"
                      ? ` · ${formatCurrencyBRL(group.price)}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => openEdit(group)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={busy}
                    aria-label="Excluir grupo"
                    onClick={() => setConfirmDelete(group)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 border-b p-6 pb-4">
            <DialogTitle>
              {editing ? "Editar grupo composto" : "Novo grupo composto"}
            </DialogTitle>
            <DialogDescription>
              Monte combos com itens fixos e escolhas do cliente.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex flex-col">
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="pg-name">Nome</Label>
                <Input
                  id="pg-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Combo Executivo"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pg-desc">Descrição</Label>
                <Input
                  id="pg-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  disabled={busy}
                />
              </div>

              <div className="space-y-2">
                <Label>Modo de preço</Label>
                <Select
                  value={form.priceMode}
                  onValueChange={(value) => {
                    if (value == null) return
                    setForm((f) => ({
                      ...f,
                      priceMode: value as ProductGroupPriceMode,
                    }))
                  }}
                  disabled={busy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione…">
                      {priceModeLabel(form.priceMode)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Preço fixo</SelectItem>
                    <SelectItem value="SumProducts">
                      Soma dos produtos
                    </SelectItem>
                    <SelectItem value="Discount">
                      Desconto sobre a soma
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.priceMode === "Fixed" ? (
                <div className="space-y-2">
                  <Label htmlFor="pg-price">Preço (R$)</Label>
                  <Input
                    id="pg-price"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    inputMode="decimal"
                    disabled={busy}
                  />
                </div>
              ) : null}

              {form.priceMode === "Discount" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="pg-discount">Desconto</Label>
                    <Input
                      id="pg-discount"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          discountValue: e.target.value,
                        }))
                      }
                      inputMode="decimal"
                      disabled={busy}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.discountType}
                      onValueChange={(value) => {
                        if (value == null) return
                        setForm((f) => ({
                          ...f,
                          discountType: value as GroupForm["discountType"],
                        }))
                      }}
                      disabled={busy}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione…">
                          {discountTypeLabel(form.discountType)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">%</SelectItem>
                        <SelectItem value="FixedAmount">R$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Foto</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <ImageUploadButton
                    folder="menu"
                    tenantId={tenantId}
                    label="Enviar foto"
                    onUploaded={({ publicUrl }) =>
                      setForm((f) => ({ ...f, imageUrl: publicUrl }))
                    }
                  />
                  {form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.imageUrl}
                      alt=""
                      className="size-14 rounded-lg object-cover"
                    />
                  ) : null}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v === true }))
                  }
                />
                Ativo
              </label>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Itens fixos</p>
                  <p className="text-xs text-muted-foreground">
                    Produtos sempre incluídos no grupo (ex.: burger + batata).
                  </p>
                </div>
                {form.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum item fixo.
                  </p>
                ) : (
                  form.items.map((item) => (
                    <div
                      key={item.key}
                      className="grid grid-cols-[1fr_4.5rem_auto] gap-2"
                    >
                      <Select
                        value={item.productId || null}
                        onValueChange={(value) => {
                          if (value == null) return
                          setForm((f) => ({
                            ...f,
                            items: f.items.map((i) =>
                              i.key === item.key
                                ? { ...i, productId: String(value) }
                                : i
                            ),
                          }))
                        }}
                        disabled={busy}
                      >
                        <SelectTrigger className="w-full min-w-0">
                          <SelectValue placeholder="Produto…">
                            {productById.get(item.productId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={item.quantity}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            items: f.items.map((i) =>
                              i.key === item.key
                                ? { ...i, quantity: e.target.value }
                                : i
                            ),
                          }))
                        }
                        placeholder="Qtd"
                        inputMode="numeric"
                        disabled={busy}
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={busy}
                        aria-label="Remover item"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            items: f.items.filter((i) => i.key !== item.key),
                          }))
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      items: [
                        ...f.items,
                        {
                          key: crypto.randomUUID(),
                          productId: products[0]?.id ?? "",
                          quantity: "1",
                        },
                      ],
                    }))
                  }
                >
                  <Plus className="size-3.5" />
                  Item fixo
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Slots de escolha</p>
                  <p className="text-xs text-muted-foreground">
                    O cliente escolhe entre opções (ex.: bebida, molho).
                  </p>
                </div>
                {form.slots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum slot de escolha.
                  </p>
                ) : (
                  <Accordion
                    multiple
                    value={slotAccordion}
                    onValueChange={setSlotAccordion}
                    className="rounded-xl"
                  >
                    {form.slots.map((slot) => (
                      <AccordionItem key={slot.key} value={slot.key}>
                        <AccordionTrigger className="hover:no-underline">
                          <span className="truncate text-left font-medium">
                            {slot.title.trim() || "Novo slot"}
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
                                  setForm((f) => ({
                                    ...f,
                                    slots: f.slots.filter(
                                      (s) => s.key !== slot.key
                                    ),
                                  }))
                                  setSlotAccordion((prev) =>
                                    prev.filter((v) => v !== slot.key)
                                  )
                                }}
                              >
                                <Trash2 className="size-3.5" />
                                Remover slot
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label>Título do slot</Label>
                              <Input
                                value={slot.title}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    slots: f.slots.map((s) =>
                                      s.key === slot.key
                                        ? { ...s, title: e.target.value }
                                        : s
                                    ),
                                  }))
                                }
                                placeholder="Ex.: Escolha a bebida"
                                disabled={busy}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>Mín. seleções</Label>
                                <Input
                                  value={slot.minSelect}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      slots: f.slots.map((s) =>
                                        s.key === slot.key
                                          ? {
                                              ...s,
                                              minSelect: e.target.value,
                                            }
                                          : s
                                      ),
                                    }))
                                  }
                                  inputMode="numeric"
                                  disabled={busy}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Máx. seleções</Label>
                                <Input
                                  value={slot.maxSelect}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      slots: f.slots.map((s) =>
                                        s.key === slot.key
                                          ? {
                                              ...s,
                                              maxSelect: e.target.value,
                                            }
                                          : s
                                      ),
                                    }))
                                  }
                                  inputMode="numeric"
                                  disabled={busy}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Opções do slot</Label>
                              {slot.products.map((sp) => (
                                <div
                                  key={sp.key}
                                  className="grid grid-cols-[1fr_4.5rem_auto_auto] items-center gap-2"
                                >
                                  <Select
                                    value={sp.productId || null}
                                    onValueChange={(value) => {
                                      if (value == null) return
                                      setForm((f) => ({
                                        ...f,
                                        slots: f.slots.map((s) =>
                                          s.key === slot.key
                                            ? {
                                                ...s,
                                                products: s.products.map((p) =>
                                                  p.key === sp.key
                                                    ? {
                                                        ...p,
                                                        productId: String(value),
                                                      }
                                                    : p
                                                ),
                                              }
                                            : s
                                        ),
                                      }))
                                    }}
                                    disabled={busy}
                                  >
                                    <SelectTrigger className="w-full min-w-0">
                                      <SelectValue placeholder="Produto…">
                                        {productById.get(sp.productId)?.name}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={sp.extraPrice}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        slots: f.slots.map((s) =>
                                          s.key === slot.key
                                            ? {
                                                ...s,
                                                products: s.products.map((p) =>
                                                  p.key === sp.key
                                                    ? {
                                                        ...p,
                                                        extraPrice:
                                                          e.target.value,
                                                      }
                                                    : p
                                                ),
                                              }
                                            : s
                                        ),
                                      }))
                                    }
                                    placeholder="+R$"
                                    inputMode="decimal"
                                    disabled={busy}
                                  />
                                  <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                                    <Checkbox
                                      checked={sp.isDefault}
                                      onCheckedChange={(v) =>
                                        setForm((f) => ({
                                          ...f,
                                          slots: f.slots.map((s) =>
                                            s.key === slot.key
                                              ? {
                                                  ...s,
                                                  products: s.products.map(
                                                    (p) =>
                                                      p.key === sp.key
                                                        ? {
                                                            ...p,
                                                            isDefault:
                                                              v === true,
                                                          }
                                                        : p
                                                  ),
                                                }
                                              : s
                                          ),
                                        }))
                                      }
                                    />
                                    Padrão
                                  </label>
                                  <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    disabled={busy}
                                    aria-label="Remover opção"
                                    onClick={() =>
                                      setForm((f) => ({
                                        ...f,
                                        slots: f.slots.map((s) =>
                                          s.key === slot.key
                                            ? {
                                                ...s,
                                                products: s.products.filter(
                                                  (p) => p.key !== sp.key
                                                ),
                                              }
                                            : s
                                        ),
                                      }))
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    slots: f.slots.map((s) =>
                                      s.key === slot.key
                                        ? {
                                            ...s,
                                            products: [
                                              ...s.products,
                                              {
                                                key: crypto.randomUUID(),
                                                productId:
                                                  products[0]?.id ?? "",
                                                extraPrice: "0",
                                                isDefault: false,
                                              },
                                            ],
                                          }
                                        : s
                                    ),
                                  }))
                                }
                              >
                                <Plus className="size-3.5" />
                                Opção
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    const key = crypto.randomUUID()
                    setForm((f) => ({
                      ...f,
                      slots: [
                        ...f.slots,
                        {
                          key,
                          title: "",
                          minSelect: "1",
                          maxSelect: "1",
                          products: [
                            {
                              key: crypto.randomUUID(),
                              productId: products[0]?.id ?? "",
                              extraPrice: "0",
                              isDefault: true,
                            },
                          ],
                        },
                      ],
                    }))
                    setSlotAccordion((prev) => [...prev, key])
                  }}
                >
                  <Plus className="size-3.5" />
                  Slot de escolha
                </Button>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="shrink-0 border-t p-6 pt-4 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={busy || !form.name.trim()}
              onClick={() => void handleSave()}
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
            <DialogTitle>Excluir grupo composto</DialogTitle>
            <DialogDescription>
              Excluir &quot;{confirmDelete?.name}&quot;? Itens no Cardápio que
              apontam para este grupo deixarão de resolver.
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
              onClick={() => void handleDelete()}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
