"use client"

import { APIProvider, Map, Polygon, Polyline, useMap } from "@vis.gl/react-google-maps"
import { Check, Pencil, Undo2, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import type { DeliveryArea, LatLngPoint } from "@/lib/modules/delivery-areas"
import { centerFromAreas, DEFAULT_MAP_CENTER } from "@/lib/modules/delivery-areas"
import { cn } from "@/lib/utils"

type DeliveryAreasMapProps = {
  areas: DeliveryArea[]
  selectedId: string | null
  drawing: boolean
  onSelect: (id: string | null) => void
  onDrawingChange: (drawing: boolean) => void
  onPolygonComplete: (path: LatLngPoint[]) => void
  onPathChange: (id: string, path: LatLngPoint[]) => void
  className?: string
}

function DrawingController({
  enabled,
  onComplete,
  onCancel,
}: {
  enabled: boolean
  onComplete: (path: LatLngPoint[]) => void
  onCancel: () => void
}) {
  const map = useMap()
  const [draft, setDraft] = useState<LatLngPoint[]>([])

  useEffect(() => {
    if (!enabled) setDraft([])
  }, [enabled])

  useEffect(() => {
    if (!map || !enabled) return

    const listener = map.addListener(
      "click",
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return
        const point = { lat: event.latLng.lat(), lng: event.latLng.lng() }
        setDraft((prev) => [...prev, point])
      }
    )

    return () => listener.remove()
  }, [enabled, map])

  if (!enabled) return null

  return (
    <>
      {draft.length >= 2 ? (
        <>
          <Polyline
            path={draft}
            strokeColor="#0d9488"
            strokeWeight={2}
            clickable={false}
            editable={false}
            zIndex={20}
          />
          {draft.length >= 3 ? (
            <Polygon
              paths={draft}
              fillColor="#0d9488"
              fillOpacity={0.12}
              strokeColor="#0d9488"
              strokeOpacity={0.4}
              strokeWeight={1}
              clickable={false}
              editable={false}
              zIndex={19}
            />
          ) : null}
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border bg-background/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <span className="text-muted-foreground">
            Clique para adicionar pontos
            {draft.length > 0 ? ` (${draft.length})` : ""}. Feche com ≥ 3
            pontos.
          </span>
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={draft.length === 0}
            onClick={() => setDraft((prev) => prev.slice(0, -1))}
          >
            <Undo2 data-icon="inline-start" />
            Desfazer
          </Button>
          <Button
            type="button"
            size="xs"
            disabled={draft.length < 3}
            onClick={() => onComplete(draft)}
          >
            <Check data-icon="inline-start" />
            Fechar área
          </Button>
          <Button type="button" size="xs" variant="ghost" onClick={onCancel}>
            <X data-icon="inline-start" />
            Cancelar
          </Button>
        </div>
      </div>
    </>
  )
}

function AreaPolygons({
  areas,
  selectedId,
  drawing,
  onSelect,
  onPathChange,
}: {
  areas: DeliveryArea[]
  selectedId: string | null
  drawing: boolean
  onSelect: (id: string) => void
  onPathChange: (id: string, path: LatLngPoint[]) => void
}) {
  return (
    <>
      {areas.map((area) => {
        const selected = area.id === selectedId
        const opacity = area.active ? (selected ? 0.35 : 0.22) : 0.1

        return (
          <Polygon
            key={area.id}
            paths={area.path}
            editable={selected && !drawing}
            draggable={false}
            clickable={!drawing}
            fillColor={area.color}
            fillOpacity={opacity}
            strokeColor={area.color}
            strokeOpacity={area.active ? 0.95 : 0.45}
            strokeWeight={selected ? 3 : 2}
            zIndex={selected ? 10 : 1}
            onClick={() => {
              if (!drawing) onSelect(area.id)
            }}
            onPathsChanged={(paths) => {
              const ring = paths[0]
              if (!ring || ring.length < 3) return
              onPathChange(
                area.id,
                ring.map((latLng) => ({
                  lat: latLng.lat(),
                  lng: latLng.lng(),
                }))
              )
            }}
          />
        )
      })}
    </>
  )
}

function MapCanvas(props: DeliveryAreasMapProps) {
  const defaultCenter = useMemo(
    () =>
      props.areas.length > 0 ? centerFromAreas(props.areas) : DEFAULT_MAP_CENTER,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only for first paint
    []
  )

  const handleMapClick = useCallback(() => {
    if (!props.drawing) props.onSelect(null)
  }, [props])

  return (
    <div
      className={cn(
        "relative h-full min-h-[320px] w-full overflow-hidden",
        props.className
      )}
    >
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={props.areas.length > 0 ? 13 : 12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        className="size-full"
        colorScheme="LIGHT"
        onClick={props.drawing ? undefined : handleMapClick}
      >
        <AreaPolygons
          areas={props.areas}
          selectedId={props.selectedId}
          drawing={props.drawing}
          onSelect={props.onSelect}
          onPathChange={props.onPathChange}
        />
        <DrawingController
          enabled={props.drawing}
          onComplete={(path) => {
            props.onPolygonComplete(path)
          }}
          onCancel={() => props.onDrawingChange(false)}
        />
      </Map>

      {!props.drawing ? (
        <div className="absolute right-3 bottom-3 z-10">
          <Button
            type="button"
            size="sm"
            onClick={() => props.onDrawingChange(true)}
          >
            <Pencil data-icon="inline-start" />
            Desenhar área
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function DeliveryAreasMap(props: DeliveryAreasMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? ""

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 px-6 text-center",
          props.className
        )}
      >
        <p className="text-sm font-medium">Google Maps não configurado</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Defina{" "}
          <code className="rounded bg-muted px-1">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          no <code className="rounded bg-muted px-1">.env.local</code> com a
          Maps JavaScript API habilitada.
        </p>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey} language="pt-BR" region="BR">
      <MapCanvas {...props} />
    </APIProvider>
  )
}
