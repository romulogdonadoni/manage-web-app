import { ModuleShell } from "@/components/app/module-shell"
import {
  ClipboardList,
  Clock,
  DollarSign,
  Wrench,
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
  { label: "Serviços ativos", value: "18", hint: "3 pausados", icon: Wrench },
  { label: "OS abertas", value: "7", hint: "2 aguardando peça", icon: ClipboardList },
  { label: "Tempo médio", value: "45 min", hint: "Por ordem concluída", icon: Clock },
  { label: "Receita hoje", value: "R$ 3.280", hint: "Serviços faturados", icon: DollarSign },
]

const services = [
  { name: "Troca de óleo completa", duration: "30 min", price: "R$ 189,00", category: "Manutenção" },
  { name: "Alinhamento e balanceamento", duration: "50 min", price: "R$ 220,00", category: "Pneus" },
  { name: "Diagnóstico eletrônico", duration: "40 min", price: "R$ 150,00", category: "Elétrica" },
  { name: "Higienização interna", duration: "90 min", price: "R$ 320,00", category: "Estética" },
  { name: "Revisão 10.000 km", duration: "120 min", price: "R$ 580,00", category: "Manutenção" },
]

const workOrders = [
  {
    id: "OS-1048",
    client: "Auto Peças Silva",
    service: "Alinhamento e balanceamento",
    status: "Em execução",
    technician: "Carlos M.",
  },
  {
    id: "OS-1047",
    client: "Frota Norte Ltda",
    service: "Diagnóstico eletrônico",
    status: "Aguardando peça",
    technician: "Ana P.",
  },
  {
    id: "OS-1046",
    client: "João Batista",
    service: "Troca de óleo completa",
    status: "Aberta",
    technician: "—",
  },
  {
    id: "OS-1045",
    client: "Transportes Vale",
    service: "Revisão 10.000 km",
    status: "Em execução",
    technician: "Marcos R.",
  },
]

function OsStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Em execução"
      ? "warning"
      : status === "Aguardando peça"
        ? "info"
        : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}

export default function ServicesPage() {
  return (
    <ModuleShell title={"Serviços"} description={"Procedimentos e pacotes"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Tabela de serviços</CardTitle>
          <CardDescription>Duração estimada e preço de referência</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.name}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.duration}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {service.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Ordens de serviço abertas</CardTitle>
          <CardDescription>OS em andamento na oficina hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-2">
            {workOrders.map((order) => (
              <Item key={order.id} variant="muted" size="sm">
                <ItemMedia variant="icon">
                  <ClipboardList />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="flex w-full flex-wrap items-center justify-between gap-2">
                    <span>
                      {order.id} · {order.client}
                    </span>
                    <OsStatusBadge status={order.status} />
                  </ItemTitle>
                  <ItemDescription>
                    {order.service} · Téc.: {order.technician}
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
