import { ModuleShell } from "@/components/app/module-shell"
import { ClipboardCheck, Factory, PackageSearch, Truck } from "lucide-react"

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
  { label: "Fornecedores", value: "32", hint: "28 homologados", icon: Factory },
  {
    label: "OC abertas",
    value: "11",
    hint: "R$ 89.400 total",
    icon: ClipboardCheck,
  },
  { label: "Entregas previstas", value: "6", hint: "Esta semana", icon: Truck },
  {
    label: "Itens críticos",
    value: "4",
    hint: "Estoque abaixo do mín.",
    icon: PackageSearch,
  },
]

const suppliers = [
  {
    name: "Tecidos Brasil Ltda",
    category: "Matéria-prima",
    leadTime: "7 dias",
    rating: "A",
    lastOrder: "10/07/2026",
  },
  {
    name: "Embalagens Sul",
    category: "Embalagem",
    leadTime: "3 dias",
    rating: "A",
    lastOrder: "14/07/2026",
  },
  {
    name: "Importadora Lux",
    category: "Aviamentos",
    leadTime: "21 dias",
    rating: "B",
    lastOrder: "28/06/2026",
  },
  {
    name: "Química Clean",
    category: "Limpeza",
    leadTime: "5 dias",
    rating: "A",
    lastOrder: "12/07/2026",
  },
  {
    name: "Metal Parts Ind.",
    category: "Componentes",
    leadTime: "14 dias",
    rating: "B",
    lastOrder: "05/07/2026",
  },
]

const purchaseOrders = [
  {
    id: "OC-3301",
    supplier: "Tecidos Brasil Ltda",
    items: "Algodão premium · 500m",
    total: "R$ 12.800",
    eta: "23/07/2026",
    status: "Confirmada",
  },
  {
    id: "OC-3300",
    supplier: "Embalagens Sul",
    items: "Caixas + tags · lote 2",
    total: "R$ 3.420",
    eta: "19/07/2026",
    status: "Em trânsito",
  },
  {
    id: "OC-3299",
    supplier: "Importadora Lux",
    items: "Botões + zíperes",
    total: "R$ 8.950",
    eta: "02/08/2026",
    status: "Aguardando",
  },
  {
    id: "OC-3298",
    supplier: "Química Clean",
    items: "Detergente industrial",
    total: "R$ 1.280",
    eta: "18/07/2026",
    status: "Recebida",
  },
]

function RatingBadge({ rating }: { rating: string }) {
  return (
    <Badge variant={rating === "A" ? "success" : "warning"}>{rating}</Badge>
  )
}

function PoStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Recebida"
      ? "success"
      : status === "Em trânsito"
        ? "info"
        : status === "Confirmada"
          ? "warning"
          : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}

export default function SuppliersPage() {
  return (
    <ModuleShell title={"Fornecedores"} description={"Compras e abastecimento"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Fornecedores homologados</CardTitle>
            <CardDescription>
              Prazo médio e classificação de desempenho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Lead time</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Última OC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.name}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.leadTime}
                    </TableCell>
                    <TableCell>
                      <RatingBadge rating={supplier.rating} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.lastOrder}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Ordens de compra</CardTitle>
            <CardDescription>OC em andamento por fornecedor</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {purchaseOrders.map((po) => (
                <Item key={po.id} variant="muted" size="sm">
                  <ItemMedia variant="icon">
                    <ClipboardCheck />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex w-full flex-wrap items-center justify-between gap-2">
                      <span>{po.id}</span>
                      <PoStatusBadge status={po.status} />
                    </ItemTitle>
                    <ItemDescription>
                      {po.supplier} · {po.items}
                    </ItemDescription>
                    <ItemDescription>
                      {po.total} · ETA {po.eta}
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
