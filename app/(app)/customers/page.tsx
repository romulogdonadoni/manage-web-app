"use client"

import { ModuleShell } from "@/components/app/module-shell"

import {
  Heart,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react"
import { useState } from "react"

import { ModuleStats } from "@/components/app/module-stats"
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
import { Separator } from "@/components/ui/separator"
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
    label: "Clientes cadastrados",
    value: "1.284",
    hint: "+42 esta semana",
    icon: Users,
  },
  {
    label: "Recorrentes",
    value: "312",
    hint: "2+ compras em 90 dias",
    icon: Heart,
  },
  {
    label: "Ticket médio",
    value: "R$ 87",
    hint: "Clientes ativos",
    icon: ShoppingCart,
  },
  {
    label: "NPS",
    value: "72",
    hint: "Última pesquisa",
    icon: Star,
  },
]

const customers = [
  {
    id: "c1",
    name: "Ana Souza",
    email: "ana.souza@email.com",
    phone: "(11) 98765-4321",
    segment: "VIP",
    orders: 28,
    total: "R$ 3.420,00",
    lastOrder: "Há 2 dias",
  },
  {
    id: "c2",
    name: "Bruno Lima",
    email: "bruno.lima@email.com",
    phone: "(21) 99876-5432",
    segment: "Regular",
    orders: 6,
    total: "R$ 512,40",
    lastOrder: "Há 5 dias",
  },
  {
    id: "c3",
    name: "Carla Dias",
    email: "carla.dias@email.com",
    phone: "(31) 97654-3210",
    segment: "Novo",
    orders: 1,
    total: "R$ 89,90",
    lastOrder: "Há 1 dia",
  },
  {
    id: "c4",
    name: "Diego Alves",
    email: "diego.alves@email.com",
    phone: "(41) 96543-2109",
    segment: "Regular",
    orders: 11,
    total: "R$ 1.048,30",
    lastOrder: "Há 12 dias",
  },
  {
    id: "c5",
    name: "Elena Prado",
    email: "elena.prado@email.com",
    phone: "(51) 95432-1098",
    segment: "VIP",
    orders: 34,
    total: "R$ 4.890,50",
    lastOrder: "Ontem",
  },
] as const

const activityByCustomer: Record<
  string,
  { title: string; detail: string; time: string }[]
> = {
  c1: [
    { title: "Pedido #1042 entregue", detail: "R$ 51,80 · Delivery", time: "Há 2 dias" },
    { title: "Cupom SUMMER10 aplicado", detail: "Desconto de R$ 5,00", time: "Há 2 dias" },
    { title: "Avaliação 5 estrelas", detail: "Classic Smash", time: "Há 3 dias" },
    { title: "Pedido #1031 concluído", detail: "R$ 48,90 · App", time: "Há 1 sem" },
  ],
  c2: [
    { title: "Pedido #1038 cancelado", detail: "Estorno solicitado", time: "Há 5 dias" },
    { title: "Cadastro completado", detail: "Via balcão", time: "Há 2 sem" },
  ],
  c3: [
    { title: "Primeira compra", detail: "R$ 89,90 · Balcão", time: "Há 1 dia" },
    { title: "Conta criada", detail: "Indicação de amigo", time: "Há 1 dia" },
  ],
  c4: [
    { title: "Pedido #1025 entregue", detail: "R$ 72,40 · Delivery", time: "Há 12 dias" },
    { title: "Endereço atualizado", detail: "Novo bairro cadastrado", time: "Há 15 dias" },
  ],
  c5: [
    { title: "Pedido #1044 em preparo", detail: "R$ 94,20 · App", time: "Ontem" },
    { title: "Upgrade para VIP", detail: "30+ pedidos no trimestre", time: "Há 4 dias" },
    { title: "Pedido #1040 entregue", detail: "R$ 66,70 · Delivery", time: "Há 6 dias" },
  ],
}

function SegmentBadge({ segment }: { segment: string }) {
  const variant =
    segment === "VIP" ? "default" : segment === "Novo" ? "info" : "secondary"
  return <Badge variant={variant}>{segment}</Badge>
}

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<string>(customers[0].id)
  const selected = customers.find((c) => c.id === selectedId) ?? customers[0]
  const activity = activityByCustomer[selectedId] ?? []

  return (
    <ModuleShell title={"Clientes"} description={"Base de contatos e histórico"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Base de clientes</CardTitle>
            <CardDescription>
              Clique em um cliente para ver a atividade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Último pedido</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    data-state={selectedId === customer.id ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(customer.id)}
                  >
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span>{customer.email}</span>
                        <span>{customer.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SegmentBadge segment={customer.segment} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {customer.orders}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.lastOrder}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {customer.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>{selected.name}</CardTitle>
            <CardDescription>
              {selected.email} · <SegmentBadge segment={selected.segment} />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Pedidos</p>
                <p className="font-semibold tabular-nums">{selected.orders}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total gasto</p>
                <p className="font-semibold tabular-nums">{selected.total}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium">Atividade recente</p>
              <ItemGroup className="gap-2">
                {activity.map((item) => (
                  <Item
                    key={`${item.title}-${item.time}`}
                    variant="muted"
                    size="sm"
                  >
                    <ItemContent>
                      <ItemTitle>{item.title}</ItemTitle>
                      <ItemDescription>
                        {item.detail} · {item.time}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ModuleShell>
  )
}
