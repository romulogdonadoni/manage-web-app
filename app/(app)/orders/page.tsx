import { ModuleShell } from "@/components/app/module-shell"
import {
  Bike,
  CheckCircle2,
  Clock3,
  ShoppingBag,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  ItemTitle,
} from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  {
    label: "Abertos",
    value: "8",
    hint: "Na fila da cozinha",
    icon: ShoppingBag,
  },
  {
    label: "Em entrega",
    value: "3",
    hint: "2 a caminho · 1 atraso",
    icon: Bike,
  },
  {
    label: "Concluídos hoje",
    value: "47",
    hint: "+12 vs ontem",
    icon: CheckCircle2,
  },
  {
    label: "Ticket médio",
    value: "R$ 48",
    hint: "Últimas 24h",
    icon: Clock3,
  },
] as const

const orders = [
  {
    id: "#1042",
    customer: "Ana Souza",
    channel: "Delivery",
    items: "Classic Smash · Batata",
    total: "R$ 51,80",
    status: "Preparando",
    time: "12 min",
  },
  {
    id: "#1041",
    customer: "Bruno Lima",
    channel: "Balcão",
    items: "Double Cheese · Milkshake",
    total: "R$ 59,80",
    status: "Pronto",
    time: "3 min",
  },
  {
    id: "#1040",
    customer: "Carla Dias",
    channel: "App",
    items: "BBQ Ranch · Onion rings · Refri",
    total: "R$ 66,70",
    status: "Saiu p/ entrega",
    time: "18 min",
  },
  {
    id: "#1039",
    customer: "Diego Alves",
    channel: "Delivery",
    items: "Classic Smash · Classic Smash",
    total: "R$ 65,80",
    status: "Entregue",
    time: "42 min",
  },
  {
    id: "#1038",
    customer: "Elena Prado",
    channel: "Balcão",
    items: "Batata rústica · Refri",
    total: "R$ 26,80",
    status: "Cancelado",
    time: "55 min",
  },
  {
    id: "#1037",
    customer: "Fábio Nunes",
    channel: "App",
    items: "Double Cheese · Onion rings",
    total: "R$ 61,80",
    status: "Preparando",
    time: "8 min",
  },
  {
    id: "#1036",
    customer: "Giulia Rocha",
    channel: "Delivery",
    items: "Classic Smash · Milkshake",
    total: "R$ 52,80",
    status: "Entregue",
    time: "61 min",
  },
  {
    id: "#1035",
    customer: "Hugo Martins",
    channel: "Balcão",
    items: "BBQ Ranch · Batata · Refri",
    total: "R$ 63,70",
    status: "Entregue",
    time: "70 min",
  },
] as const

const activity = [
  { title: "Pedido #1042 enviado à cozinha", time: "Há 2 min", type: "cozinha" },
  { title: "Pedido #1041 marcado como pronto", time: "Há 3 min", type: "status" },
  { title: "Entrega #1040 saiu", time: "Há 8 min", type: "entrega" },
  { title: "Pedido #1038 cancelado no balcão", time: "Há 15 min", type: "alerta" },
  { title: "Pedido #1039 entregue", time: "Há 22 min", type: "status" },
  { title: "Novo pedido #1043 via App", time: "Há 25 min", type: "pedido" },
] as const

const channels = [
  { name: "App", share: "42%", orders: "20 hoje" },
  { name: "Delivery", share: "35%", orders: "16 hoje" },
  { name: "Balcão", share: "23%", orders: "11 hoje" },
] as const

function OrderStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Pronto" || status === "Entregue"
      ? "success"
      : status === "Preparando"
        ? "warning"
        : status === "Saiu p/ entrega"
          ? "info"
          : "destructive"

  return <Badge variant={variant}>{status}</Badge>
}

function ActivityBadge({ type }: { type: string }) {
  const variant =
    type === "pedido"
      ? "info"
      : type === "status"
        ? "success"
        : type === "entrega"
          ? "warning"
          : type === "alerta"
            ? "destructive"
            : "secondary"

  return <Badge variant={variant}>{type}</Badge>
}

export default function OrdersPage() {
  return (
    <ModuleShell title={"Pedidos"} description={"Fila e status de pedidos"}>
      <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tracking-tight">
                  {value}
                </CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Fila de pedidos</CardTitle>
            <CardDescription>Últimos pedidos do turno</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.channel}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-muted-foreground">
                      {order.items}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.time}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {order.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-4" />
              Atividade
            </CardTitle>
            <CardDescription>Eventos recentes do turno</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {activity.map((item) => (
                <Item
                  key={`${item.title}-${item.time}`}
                  variant="muted"
                  size="sm"
                >
                  <ItemContent>
                    <ItemTitle className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{item.title}</span>
                      <ActivityBadge type={item.type} />
                    </ItemTitle>
                    <ItemDescription>{item.time}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Canais</CardTitle>
          <CardDescription>Distribuição de pedidos no turno</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {channels.map((channel) => (
              <Card key={channel.name} size="sm" className="shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{channel.name}</CardTitle>
                    <Badge variant="outline">{channel.share}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {channel.orders}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
