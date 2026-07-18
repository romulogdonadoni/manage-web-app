import { ModuleShell } from "@/components/app/module-shell"
import {
  Car,
  Gauge,
  Wrench,
  ClipboardList,
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
  { label: "Veículos cadastrados", value: "1.892", hint: "Frota + particulares", icon: Car },
  { label: "Na oficina", value: "8", hint: "3 aguardando peça", icon: Wrench },
  { label: "OS abertas", value: "11", hint: "Turno atual", icon: ClipboardList },
  { label: "Km médio", value: "68.400", hint: "Base ativa", icon: Gauge },
]

const vehicles = [
  { plate: "ABC-1D23", model: "Toyota Corolla 2022", customer: "Fernando Almeida", color: "Prata" },
  { plate: "FGH-4J56", model: "VW Gol 2020", customer: "Helena Castro", color: "Branco" },
  { plate: "KLM-7N89", model: "Fiat Toro 2023", customer: "Transportes Vale", color: "Preto" },
  { plate: "PQR-0S12", model: "Hyundai HB20 2021", customer: "Ingrid Paiva", color: "Vermelho" },
  { plate: "STU-3V45", model: "Chevrolet Onix 2024", customer: "Jorge Mendes", color: "Cinza" },
]

const inWorkshop = [
  {
    plate: "ABC-1D23",
    model: "Toyota Corolla 2022",
    service: "Revisão 40.000 km",
    bay: "Box 2",
    status: "Em execução",
  },
  {
    plate: "KLM-7N89",
    model: "Fiat Toro 2023",
    service: "Troca de pastilhas",
    bay: "Box 4",
    status: "Aguardando peça",
  },
  {
    plate: "XYZ-9W87",
    model: "Honda Civic 2019",
    service: "Alinhamento",
    bay: "Box 1",
    status: "Em execução",
  },
  {
    plate: "MNO-6P34",
    model: "Renault Duster 2022",
    service: "Diagnóstico ar-cond.",
    bay: "Box 3",
    status: "Diagnóstico",
  },
]

function WorkshopBadge({ status }: { status: string }) {
  const variant =
    status === "Em execução"
      ? "warning"
      : status === "Aguardando peça"
        ? "destructive"
        : "info"
  return <Badge variant={variant}>{status}</Badge>
}

export default function VehiclesPage() {
  return (
    <ModuleShell title={"Veículos"} description={"Frota / veículos do cliente"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Frota cadastrada</CardTitle>
            <CardDescription>Placa, modelo e proprietário</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Cor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.plate}>
                    <TableCell className="font-medium">{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicle.customer}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.color}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Veículos na oficina</CardTitle>
            <CardDescription>Em atendimento no turno atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {inWorkshop.map((vehicle) => (
                <Item key={vehicle.plate} variant="muted" size="sm">
                  <ItemMedia variant="icon">
                    <Car />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex w-full flex-wrap items-center justify-between gap-2">
                      <span>
                        {vehicle.plate} · {vehicle.model}
                      </span>
                      <WorkshopBadge status={vehicle.status} />
                    </ItemTitle>
                    <ItemDescription>
                      {vehicle.service} · {vehicle.bay}
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
