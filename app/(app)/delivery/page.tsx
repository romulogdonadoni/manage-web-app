"use client"

import { MapPin, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { DeliveryAreasMap } from "@/components/app/delivery-areas-map"
import { ModuleShell } from "@/components/app/module-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  createDeliveryAreaId,
  formatFeeBrl,
  loadDeliveryAreas,
  nextAreaColor,
  parseFeeToCents,
  saveDeliveryAreas,
  type DeliveryArea,
  type LatLngPoint,
} from "@/lib/modules/delivery-areas"
import { useCurrentStore } from "@/lib/store/current-store-context"
import { cn } from "@/lib/utils"

export default function DeliveryPage() {
  const { data: store } = useCurrentStore()
  const tenantId = store?.identifier ?? null

  const [areas, setAreas] = useState<DeliveryArea[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [name, setName] = useState("")
  const [feeInput, setFeeInput] = useState("0,00")
  const [etaMin, setEtaMin] = useState("20")
  const [etaMax, setEtaMax] = useState("40")
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setAreas([])
      setSelectedId(null)
      setHydrated(false)
      setDirty(false)
      return
    }

    const loaded = loadDeliveryAreas(tenantId)
    setAreas(loaded)
    setSelectedId(loaded[0]?.id ?? null)
    setDrawing(false)
    setDirty(false)
    setHydrated(true)
  }, [tenantId])

  const selected = useMemo(
    () => areas.find((area) => area.id === selectedId) ?? null,
    [areas, selectedId]
  )

  useEffect(() => {
    if (!selected) {
      setName("")
      setFeeInput("0,00")
      setEtaMin("20")
      setEtaMax("40")
      setActive(true)
      return
    }

    setName(selected.name)
    setFeeInput((selected.feeCents / 100).toFixed(2).replace(".", ","))
    setEtaMin(String(selected.etaMinutesMin))
    setEtaMax(String(selected.etaMinutesMax))
    setActive(selected.active)
  }, [selected])

  function markDirty(next: DeliveryArea[]) {
    setAreas(next)
    setDirty(true)
  }

  function handlePolygonComplete(path: LatLngPoint[]) {
    if (path.length < 3) {
      toast.error("O polígono precisa de pelo menos 3 pontos.")
      setDrawing(false)
      return
    }

    const area: DeliveryArea = {
      id: createDeliveryAreaId(),
      name: `Área ${areas.length + 1}`,
      feeCents: 690,
      etaMinutesMin: 30,
      etaMinutesMax: 45,
      active: true,
      path,
      color: nextAreaColor(areas),
    }

    const next = [...areas, area]
    markDirty(next)
    setSelectedId(area.id)
    setDrawing(false)
    toast.success("Área desenhada. Ajuste os dados e salve.")
  }

  function handlePathChange(id: string, path: LatLngPoint[]) {
    if (path.length < 3) return
    markDirty(
      areas.map((area) => (area.id === id ? { ...area, path } : area))
    )
  }

  function handleApplySelected() {
    if (!selected) return

    const min = Number.parseInt(etaMin, 10)
    const max = Number.parseInt(etaMax, 10)
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) {
      toast.error("Informe um intervalo de ETA válido.")
      return
    }

    markDirty(
      areas.map((area) =>
        area.id === selected.id
          ? {
              ...area,
              name: name.trim() || area.name,
              feeCents: parseFeeToCents(feeInput),
              etaMinutesMin: min,
              etaMinutesMax: max,
              active,
            }
          : area
      )
    )
  }

  function handleSave() {
    if (!tenantId) return

    const min = Number.parseInt(etaMin, 10)
    const max = Number.parseInt(etaMax, 10)
    if (selected) {
      if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) {
        toast.error("Informe um intervalo de ETA válido.")
        return
      }
    }

    const next = areas.map((area) =>
      selected && area.id === selected.id
        ? {
            ...area,
            name: name.trim() || area.name,
            feeCents: parseFeeToCents(feeInput),
            etaMinutesMin: min,
            etaMinutesMax: max,
            active,
          }
        : area
    )

    saveDeliveryAreas(tenantId, next)
    setAreas(next)
    setDirty(false)
    toast.success("Áreas de entrega salvas neste dispositivo.")
  }

  function handleRemove() {
    if (!selected) return
    const next = areas.filter((area) => area.id !== selected.id)
    markDirty(next)
    setSelectedId(next[0]?.id ?? null)
    toast.message("Área removida. Salve para confirmar.")
  }

  return (
    <ModuleShell
      title="Delivery"
      description="Áreas de cobertura e taxas"
      actions={
        <Button
          type="button"
          size="sm"
          disabled={!tenantId || !hydrated}
          onClick={handleSave}
        >
          Salvar áreas
          {dirty ? (
            <Badge variant="secondary" className="ml-1">
              *
            </Badge>
          ) : null}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {!tenantId ? (
          <Alert>
            <AlertTitle>Tenant não carregado</AlertTitle>
            <AlertDescription>
              Aguarde o sync da loja para configurar as áreas de entrega.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border bg-muted/10">
            <DeliveryAreasMap
              className="h-[min(70vh,560px)]"
              areas={areas}
              selectedId={selectedId}
              drawing={drawing}
              onSelect={setSelectedId}
              onDrawingChange={setDrawing}
              onPolygonComplete={handlePolygonComplete}
              onPathChange={handlePathChange}
            />
          </div>

          <div className="flex min-h-[320px] flex-col gap-4 rounded-2xl border p-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4" />
                Áreas ({areas.length})
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Desenhe polígonos no mapa. Os dados ficam neste navegador até a
                API existir.
              </p>
            </div>

            <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
              {areas.length === 0 ? (
                <p className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                  Nenhuma área ainda. Use “Desenhar área” no mapa.
                </p>
              ) : (
                areas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setSelectedId(area.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      selectedId === area.id
                        ? "border-primary/40 bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {area.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFeeBrl(area.feeCents)}
                    </span>
                    {!area.active ? (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Inativa
                      </Badge>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <Separator />

            {selected ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="area-name">Nome</Label>
                  <Input
                    id="area-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setDirty(true)
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="area-fee">Taxa de entrega (R$)</Label>
                  <Input
                    id="area-fee"
                    inputMode="decimal"
                    value={feeInput}
                    onChange={(e) => {
                      setFeeInput(e.target.value)
                      setDirty(true)
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="area-eta-min">ETA mín. (min)</Label>
                    <Input
                      id="area-eta-min"
                      type="number"
                      min={0}
                      value={etaMin}
                      onChange={(e) => {
                        setEtaMin(e.target.value)
                        setDirty(true)
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="area-eta-max">ETA máx. (min)</Label>
                    <Input
                      id="area-eta-max"
                      type="number"
                      min={0}
                      value={etaMax}
                      onChange={(e) => {
                        setEtaMax(e.target.value)
                        setDirty(true)
                      }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={active}
                    onCheckedChange={(checked) => {
                      setActive(checked === true)
                      setDirty(true)
                    }}
                  />
                  Área ativa para entregas
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleApplySelected}
                  >
                    Aplicar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRemove}
                  >
                    <Trash2 data-icon="inline-start" />
                    Remover
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Arraste os vértices no mapa para ajustar o contorno da área
                  selecionada.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Selecione uma área na lista ou no mapa para editar.
              </p>
            )}
          </div>
        </div>
      </div>
    </ModuleShell>
  )
}
