import { ModuleShell } from "@/components/app/module-shell"
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  PackageSearch,
  Warehouse,
} from "lucide-react"

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
  ItemMedia,
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
    label: "SKUs monitorados",
    value: "142",
    hint: "3 depósitos",
    icon: Boxes,
  },
  {
    label: "Valor em estoque",
    value: "R$ 48k",
    hint: "Custo médio",
    icon: Warehouse,
  },
  {
    label: "Itens críticos",
    value: "6",
    hint: "Abaixo do mínimo",
    icon: AlertTriangle,
  },
  {
    label: "Movimentações hoje",
    value: "34",
    hint: "Entradas e saídas",
    icon: PackageSearch,
  },
]

const stock = [
  {
    sku: "CAR-001",
    name: "Pão brioche (un)",
    location: "Depósito A",
    qty: 48,
    min: 30,
    unit: "un",
  },
  {
    sku: "CAR-014",
    name: "Blend 180g congelado",
    location: "Freezer 1",
    qty: 12,
    min: 20,
    unit: "kg",
  },
  {
    sku: "CAR-022",
    name: "Queijo cheddar fatiado",
    location: "Geladeira",
    qty: 8,
    min: 10,
    unit: "kg",
  },
  {
    sku: "CAR-031",
    name: "Batata pré-frita 2kg",
    location: "Freezer 2",
    qty: 24,
    min: 15,
    unit: "cx",
  },
  {
    sku: "CAR-045",
    name: "Embalagem delivery M",
    location: "Depósito B",
    qty: 5,
    min: 50,
    unit: "pct",
  },
  {
    sku: "CAR-052",
    name: "Molho da casa 500ml",
    location: "Depósito A",
    qty: 18,
    min: 12,
    unit: "un",
  },
] as const

const movements = [
  {
    type: "out" as const,
    item: "Blend 180g congelado",
    qty: "−4 kg",
    reason: "Produção turno almoço",
    time: "Há 12 min",
  },
  {
    type: "in" as const,
    item: "Pão brioche (un)",
    qty: "+60 un",
    reason: "Recebimento fornecedor",
    time: "Há 45 min",
  },
  {
    type: "out" as const,
    item: "Embalagem delivery M",
    qty: "−120 un",
    reason: "Expedição pedidos",
    time: "Há 1 h",
  },
  {
    type: "out" as const,
    item: "Queijo cheddar fatiado",
    qty: "−2 kg",
    reason: "Produção turno almoço",
    time: "Há 1 h",
  },
  {
    type: "in" as const,
    item: "Batata pré-frita 2kg",
    qty: "+8 cx",
    reason: "Transferência Freezer 1",
    time: "Há 2 h",
  },
] as const

function StockStatus({ qty, min }: { qty: number; min: number }) {
  if (qty <= min * 0.5) {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="size-3" />
        Crítico
      </Badge>
    )
  }
  if (qty <= min) {
    return (
      <Badge variant="warning">
        <AlertTriangle className="size-3" />
        Baixo
      </Badge>
    )
  }
  return <Badge variant="success">OK</Badge>
}

export default function InventoryPage() {
  return (
    <ModuleShell title={"Estoque"} description={"Saldo, rupturas e movimentações"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Posição de estoque</CardTitle>
            <CardDescription>
              Quantidade atual vs. estoque mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Mín.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.location}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {item.qty} {item.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {item.min} {item.unit}
                    </TableCell>
                    <TableCell>
                      <StockStatus qty={item.qty} min={item.min} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Movimentações recentes</CardTitle>
            <CardDescription>Entradas e saídas do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {movements.map((move) => (
                <Item
                  key={`${move.item}-${move.time}`}
                  variant="muted"
                  size="sm"
                >
                  <ItemMedia variant="icon">
                    {move.type === "in" ? (
                      <ArrowDownLeft className="size-4 text-success" />
                    ) : (
                      <ArrowUpRight className="size-4 text-destructive" />
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{move.item}</span>
                      <Badge
                        variant={move.type === "in" ? "success" : "secondary"}
                      >
                        {move.qty}
                      </Badge>
                    </ItemTitle>
                    <ItemDescription>
                      {move.reason} · {move.time}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </div>
    </ModuleShell>
  )
}
