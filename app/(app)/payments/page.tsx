import { ModuleShell } from "@/components/app/module-shell"
import {
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  TrendingUp,
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
    label: "Recebido hoje",
    value: "R$ 4.820",
    hint: "38 transações",
    icon: Receipt,
  },
  {
    label: "Taxa média",
    value: "1,8%",
    hint: "Cartão e PIX",
    icon: TrendingUp,
  },
  {
    label: "Estornos",
    value: "2",
    hint: "R$ 118,40 no turno",
    icon: CreditCard,
  },
  {
    label: "Pendente",
    value: "R$ 340",
    hint: "3 cobranças abertas",
    icon: Banknote,
  },
]

const methods = [
  {
    id: "pix",
    label: "PIX",
    icon: QrCode,
    amount: "R$ 2.140,00",
    share: "44%",
    count: "19 tx",
    trend: "+12% vs ontem",
  },
  {
    id: "card",
    label: "Cartão",
    icon: CreditCard,
    amount: "R$ 1.980,00",
    share: "41%",
    count: "14 tx",
    trend: "Crédito 68%",
  },
  {
    id: "cash",
    label: "Dinheiro",
    icon: Banknote,
    amount: "R$ 700,00",
    share: "15%",
    count: "5 tx",
    trend: "Troco médio R$ 8",
  },
] as const

const payments = [
  {
    id: "PAY-8821",
    order: "#1042",
    customer: "Ana Souza",
    method: "PIX",
    status: "Aprovado",
    time: "14:32",
    amount: "R$ 51,80",
  },
  {
    id: "PAY-8820",
    order: "#1041",
    customer: "Bruno Lima",
    method: "Cartão",
    status: "Aprovado",
    time: "14:28",
    amount: "R$ 59,80",
  },
  {
    id: "PAY-8819",
    order: "#1040",
    customer: "Carla Dias",
    method: "Cartão",
    status: "Aprovado",
    time: "14:15",
    amount: "R$ 66,70",
  },
  {
    id: "PAY-8818",
    order: "#1039",
    customer: "Diego Alves",
    method: "Dinheiro",
    status: "Aprovado",
    time: "13:58",
    amount: "R$ 65,80",
  },
  {
    id: "PAY-8817",
    order: "#1038",
    customer: "Elena Prado",
    method: "PIX",
    status: "Estornado",
    time: "13:40",
    amount: "R$ 26,80",
  },
  {
    id: "PAY-8816",
    order: "#1037",
    customer: "Fábio Nunes",
    method: "PIX",
    status: "Aprovado",
    time: "13:22",
    amount: "R$ 61,80",
  },
] as const

function MethodBadge({ method }: { method: string }) {
  const variant =
    method === "PIX" ? "info" : method === "Cartão" ? "default" : "secondary"
  return <Badge variant={variant}>{method}</Badge>
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "Aprovado" ? "success" : "destructive"
  return <Badge variant={variant}>{status}</Badge>
}

export default function PaymentsPage() {
  return (
    <ModuleShell title={"Pagamentos"} description={"Recebimentos e conciliação"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-3 md:grid-cols-3">
        {methods.map((method) => (
          <Card key={method.id} size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>{method.label}</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {method.amount}
                </CardTitle>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <method.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">{method.share}</Badge>
                <span className="text-muted-foreground">{method.count}</span>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">{method.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Transações do turno</CardTitle>
          <CardDescription>
            Pagamentos registrados no PDV e delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.order}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.customer}
                  </TableCell>
                  <TableCell>
                    <MethodBadge method={payment.method} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.time}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {payment.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
