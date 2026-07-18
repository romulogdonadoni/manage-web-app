import { ModuleShell } from "@/components/app/module-shell"
import {
  BarChart3,
  CalendarRange,
  Download,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react"

import { ModuleStats } from "@/components/app/module-stats"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  {
    label: "Relatórios gerados",
    value: "18",
    hint: "Este mês",
    icon: FileSpreadsheet,
  },
  {
    label: "Exportações",
    value: "42",
    hint: "CSV e PDF",
    icon: Download,
  },
  {
    label: "Agendados",
    value: "5",
    hint: "Envio semanal",
    icon: CalendarRange,
  },
  {
    label: "Última execução",
    value: "08:00",
    hint: "Vendas diárias",
    icon: TrendingUp,
  },
]

const reports = [
  {
    id: "sales-daily",
    title: "Vendas diárias",
    description:
      "Faturamento, ticket médio e quantidade de pedidos por canal (balcão, app, delivery).",
    format: "CSV · PDF",
    icon: BarChart3,
    lastRun: "Hoje, 08:00",
  },
  {
    id: "sales-period",
    title: "Vendas por período",
    description:
      "Comparativo semanal e mensal com breakdown por categoria de produto.",
    format: "CSV · XLSX",
    icon: TrendingUp,
    lastRun: "Ontem, 23:59",
  },
  {
    id: "customers-rfm",
    title: "Clientes RFM",
    description:
      "Recência, frequência e valor monetário para segmentação de campanhas.",
    format: "CSV",
    icon: Users,
    lastRun: "Seg, 06:00",
  },
  {
    id: "inventory-turnover",
    title: "Giro de estoque",
    description:
      "Itens parados, rupturas e curva ABC por depósito e SKU.",
    format: "CSV · PDF",
    icon: PieChart,
    lastRun: "Há 2 dias",
  },
  {
    id: "payments-fees",
    title: "Taxas de pagamento",
    description:
      "Consolidado PIX, cartão e dinheiro com taxas de adquirente e estornos.",
    format: "CSV · PDF",
    icon: FileSpreadsheet,
    lastRun: "Hoje, 07:30",
  },
  {
    id: "staff-performance",
    title: "Desempenho operacional",
    description:
      "Tempo médio de preparo, entregas por entregador e cancelamentos por turno.",
    format: "PDF",
    icon: BarChart3,
    lastRun: "Dom, 22:00",
  },
] as const

export default function ReportsPage() {
  return (
    <ModuleShell title={"Relatórios"} description={"Indicadores e exportações"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.format}</CardDescription>
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <report.icon className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {report.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Última execução: {report.lastRun}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm" className="flex-1">
                <Download className="size-4" />
                Exportar
              </Button>
              <Button size="sm" variant="outline">
                Agendar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </ModuleShell>
  )
}
