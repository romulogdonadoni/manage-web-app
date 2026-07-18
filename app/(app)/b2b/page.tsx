import { ModuleShell } from "@/components/app/module-shell"
import { Building2, CreditCard, Package, Truck } from "lucide-react"

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
    label: "Contas B2B",
    value: "47",
    hint: "12 ativas este mês",
    icon: Building2,
  },
  {
    label: "Limite em uso",
    value: "68%",
    hint: "Média das contas",
    icon: CreditCard,
  },
  { label: "Pedidos atacado", value: "9", hint: "Em separação", icon: Package },
  {
    label: "Entregas agendadas",
    value: "4",
    hint: "Próximas 48h",
    icon: Truck,
  },
]

const accounts = [
  {
    company: "Distribuidora Central",
    cnpj: "12.345.678/0001-90",
    limit: "R$ 80.000",
    used: "R$ 52.400",
    tier: "Platinum",
  },
  {
    company: "Atacado Nordeste",
    cnpj: "98.765.432/0001-10",
    limit: "R$ 45.000",
    used: "R$ 38.200",
    tier: "Gold",
  },
  {
    company: "Rede Mercado Bom",
    cnpj: "11.222.333/0001-44",
    limit: "R$ 120.000",
    used: "R$ 71.800",
    tier: "Platinum",
  },
  {
    company: "Lojas União",
    cnpj: "55.666.777/0001-88",
    limit: "R$ 25.000",
    used: "R$ 9.600",
    tier: "Silver",
  },
]

const wholesaleOrders = [
  {
    id: "ATC-5501",
    buyer: "Distribuidora Central",
    items: "240 un · mix A",
    total: "R$ 18.920",
    status: "Separando",
  },
  {
    id: "ATC-5500",
    buyer: "Atacado Nordeste",
    items: "80 un · linha premium",
    total: "R$ 12.400",
    status: "Aguardando pag.",
  },
  {
    id: "ATC-5499",
    buyer: "Rede Mercado Bom",
    items: "500 un · promocional",
    total: "R$ 34.500",
    status: "Faturado",
  },
  {
    id: "ATC-5498",
    buyer: "Lojas União",
    items: "60 un · sazonal",
    total: "R$ 4.280",
    status: "Separando",
  },
]

function TierBadge({ tier }: { tier: string }) {
  const variant =
    tier === "Platinum" ? "default" : tier === "Gold" ? "warning" : "secondary"
  return <Badge variant={variant}>{tier}</Badge>
}

function OrderBadge({ status }: { status: string }) {
  const variant =
    status === "Faturado"
      ? "success"
      : status === "Separando"
        ? "warning"
        : "info"
  return <Badge variant={variant}>{status}</Badge>
}

export default function B2bPage() {
  return (
    <ModuleShell title={"B2B"} description={"Contas e pedidos atacado"}>
      <div className="flex flex-col gap-6">
        <ModuleStats stats={stats} />

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Contas corporativas</CardTitle>
            <CardDescription>
              Limite de crédito e utilização por CNPJ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead className="text-right">Utilizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.cnpj}>
                    <TableCell className="font-medium">
                      {account.company}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.cnpj}
                    </TableCell>
                    <TableCell>
                      <TierBadge tier={account.tier} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {account.limit}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {account.used}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Pedidos atacado em aberto</CardTitle>
            <CardDescription>
              Ordens de compra B2B aguardando expedição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {wholesaleOrders.map((order) => (
                <Item key={order.id} variant="muted" size="sm">
                  <ItemContent>
                    <ItemTitle className="flex w-full flex-wrap items-center justify-between gap-2">
                      <span>
                        {order.id} · {order.buyer}
                      </span>
                      <OrderBadge status={order.status} />
                    </ItemTitle>
                    <ItemDescription>
                      {order.items} · {order.total}
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
