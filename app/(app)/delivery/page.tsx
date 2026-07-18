import { ModuleShell } from "@/components/app/module-shell"
import {
  Bike,
  Clock,
  MapPin,
  Navigation,
  Package,
  Truck,
} from "lucide-react"

import { ModuleStats } from "@/components/app/module-stats"
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
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"

const stats = [
  {
    label: "Em rota",
    value: "4",
    hint: "1 atrasado · 3 no prazo",
    icon: Bike,
  },
  {
    label: "Tempo médio",
    value: "28 min",
    hint: "Meta: 35 min",
    icon: Clock,
  },
  {
    label: "Entregas hoje",
    value: "31",
    hint: "+8 vs ontem",
    icon: Package,
  },
  {
    label: "Zonas ativas",
    value: "5",
    hint: "Cobertura no raio urbano",
    icon: MapPin,
  },
]

const activeDeliveries = [
  {
    id: "#1040",
    customer: "Carla Dias",
    address: "Rua das Palmeiras, 412 — Jardim Norte",
    status: "A caminho",
    eta: "12 min",
    driver: "Marcos",
    zone: "Zona Norte",
  },
  {
    id: "#1037",
    customer: "Fábio Nunes",
    address: "Av. Central, 88 — Centro",
    status: "Preparando saída",
    eta: "18 min",
    driver: "Ana",
    zone: "Centro",
  },
  {
    id: "#1034",
    customer: "Isabela Costa",
    address: "Travessa do Mercado, 15 — Vila Sul",
    status: "Atrasado",
    eta: "+6 min",
    driver: "Pedro",
    zone: "Zona Sul",
  },
  {
    id: "#1032",
    customer: "João Pereira",
    address: "Alameda dos Ipês, 220 — Leste",
    status: "Entregue",
    eta: "Concluído",
    driver: "Marcos",
    zone: "Zona Leste",
  },
] as const

const zones = [
  {
    name: "Centro",
    fee: "R$ 4,90",
    eta: "20–30 min",
    neighborhoods: ["Centro", "República", "Mercado Velho"],
    active: 2,
  },
  {
    name: "Zona Norte",
    fee: "R$ 6,90",
    eta: "30–40 min",
    neighborhoods: ["Jardim Norte", "Parque Verde", "Alto da Serra"],
    active: 1,
  },
  {
    name: "Zona Sul",
    fee: "R$ 7,90",
    eta: "35–45 min",
    neighborhoods: ["Vila Sul", "Bosque", "Riviera"],
    active: 1,
  },
  {
    name: "Zona Leste",
    fee: "R$ 5,90",
    eta: "25–35 min",
    neighborhoods: ["Leste", "Industrial", "Campo Belo"],
    active: 0,
  },
  {
    name: "Zona Oeste",
    fee: "R$ 8,90",
    eta: "40–50 min",
    neighborhoods: ["Oeste", "Pinheiros", "Morro Alto"],
    active: 0,
  },
] as const

function DeliveryStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Entregue"
      ? "success"
      : status === "A caminho"
        ? "info"
        : status === "Atrasado"
          ? "destructive"
          : "warning"

  return <Badge variant={variant}>{status}</Badge>
}

export default function DeliveryPage() {
  return (
    <ModuleShell title={"Delivery"} description={"Entregas, taxas e áreas"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="size-4" />
                  Entregas ativas
                </CardTitle>
                <CardDescription>
                  Linha do tempo do turno — atualização mock
                </CardDescription>
              </div>
              <Badge variant="outline">4 em andamento</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0 pl-6">
              <div className="absolute top-2 bottom-2 left-[9px] w-px bg-border" />
              {activeDeliveries.map((delivery, index) => (
                <div key={delivery.id} className="relative pb-6 last:pb-0">
                  <div
                    className={`absolute -left-6 top-3 size-[18px] rounded-full border-2 bg-background ${
                      delivery.status === "Entregue"
                        ? "border-success bg-success/20"
                        : delivery.status === "Atrasado"
                          ? "border-destructive bg-destructive/20"
                          : "border-primary bg-primary/20"
                    }`}
                  />
                  <Item variant="outline" size="sm" className="ml-2">
                    <ItemMedia variant="icon">
                      <Truck />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="flex w-full flex-wrap items-center justify-between gap-2">
                        <span>
                          {delivery.id} · {delivery.customer}
                        </span>
                        <DeliveryStatusBadge status={delivery.status} />
                      </ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        {delivery.address}
                      </ItemDescription>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{delivery.zone}</Badge>
                        <span>Entregador: {delivery.driver}</span>
                        <span>·</span>
                        <span>{delivery.eta}</span>
                      </div>
                    </ItemContent>
                  </Item>
                  {index < activeDeliveries.length - 1 ? (
                    <Separator className="mt-4 ml-2" />
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4" />
              Zonas de entrega
            </CardTitle>
            <CardDescription>Taxas e bairros cobertos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {zones.map((zone) => (
              <Card key={zone.name} size="sm" className="shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{zone.name}</CardTitle>
                    <span className="text-lg font-semibold tabular-nums">
                      {zone.fee}
                    </span>
                  </div>
                  <CardDescription>{zone.eta}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {zone.neighborhoods.map((n) => (
                      <Badge key={n} variant="secondary">
                        {n}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {zone.active > 0
                        ? `${zone.active} entrega(s) ativa(s)`
                        : "Sem entregas agora"}
                    </span>
                    <Button size="xs" variant="ghost">
                      Editar taxa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Resumo operacional</CardTitle>
          <CardDescription>Prioridades do turno de delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-2 md:grid md:grid-cols-3 md:gap-3">
            {[
              "Priorize #1034 (atrasado) antes de novas saídas.",
              "Zona Sul com taxa maior — confirmar endereço no app.",
              "Marcos concentra 2 entregas; evitar sobrecarga na rota.",
            ].map((note) => (
              <Item key={note} variant="muted" size="sm">
                <ItemContent>
                  <ItemDescription className="line-clamp-none">
                    {note}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
