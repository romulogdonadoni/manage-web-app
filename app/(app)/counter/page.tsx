import { ModuleShell } from "@/components/app/module-shell"
import {
  Banknote,
  Coffee,
  CreditCard,
  Pizza,
  Receipt,
  ShoppingCart,
  Utensils,
  Wine,
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
import { Progress } from "@/components/ui/progress"
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
    label: "Vendas do turno",
    value: "R$ 2.840",
    hint: "47 cupons emitidos",
    icon: ShoppingCart,
  },
  {
    label: "Ticket médio",
    value: "R$ 60,40",
    hint: "+R$ 4,20 vs ontem",
    icon: Receipt,
  },
  {
    label: "Dinheiro no caixa",
    value: "R$ 380",
    hint: "Sangria às 18h",
    icon: Banknote,
  },
  {
    label: "Cartão / PIX",
    value: "78%",
    hint: "22% em espécie",
    icon: CreditCard,
  },
]

const quickCategories = [
  {
    label: "Burgers",
    icon: Utensils,
    color:
      "bg-orange-500/15 dark:bg-orange-500/10 text-orange-600 dark:text-orange-600",
  },
  {
    label: "Combos",
    icon: Pizza,
    color:
      "bg-amber-500/15 dark:bg-amber-500/10 text-amber-600 dark:text-amber-600",
  },
  {
    label: "Bebidas",
    icon: Coffee,
    color: "bg-sky-500/15 dark:bg-sky-500/10 text-sky-600 dark:text-sky-600",
  },
  {
    label: "Sobremesas",
    icon: Wine,
    color:
      "bg-pink-500/15 dark:bg-pink-500/10 text-pink-600 dark:text-pink-600",
  },
  {
    label: "Extras",
    icon: ShoppingCart,
    color:
      "bg-emerald-500/15 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-600",
  },
  {
    label: "Promoções",
    icon: Receipt,
    color:
      "bg-violet-500/15 dark:bg-violet-500/10 text-violet-600 dark:text-violet-600",
  },
] as const

const recentCupons = [
  {
    id: "CUP-1047",
    items: "2× Classic Smash",
    payment: "PIX",
    total: "R$ 65,80",
    time: "18:42",
    status: "Pago",
  },
  {
    id: "CUP-1046",
    items: "Combo Double · Refri",
    payment: "Crédito",
    total: "R$ 52,90",
    time: "18:38",
    status: "Pago",
  },
  {
    id: "CUP-1045",
    items: "Batata · Milkshake",
    payment: "Dinheiro",
    total: "R$ 28,80",
    time: "18:31",
    status: "Pago",
  },
  {
    id: "CUP-1044",
    items: "BBQ Ranch · Onion rings",
    payment: "Débito",
    total: "R$ 48,80",
    time: "18:24",
    status: "Pago",
  },
  {
    id: "CUP-1043",
    items: "3× Classic Smash",
    payment: "PIX",
    total: "R$ 98,70",
    time: "18:17",
    status: "Estornado",
  },
] as const

export default function CounterPage() {
  return (
    <ModuleShell title={"PDV"} description={"Venda no balcão / caixa"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Venda rápida</CardTitle>
              <CardDescription>
                Toque na categoria para abrir o PDV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {quickCategories.map(({ label, icon: Icon, color }) => (
                  <Button
                    key={label}
                    variant="outline"
                    className={`h-24 flex-col gap-2 rounded-2xl border-0 ${color}`}
                  >
                    <Icon className="size-8" />
                    <span className="text-sm font-semibold">{label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Últimos cupons</CardTitle>
                  <CardDescription>Emissões recentes do balcão</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cupom</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCupons.map((cupom) => (
                    <TableRow key={cupom.id}>
                      <TableCell className="font-medium">{cupom.id}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground">
                        {cupom.items}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{cupom.payment}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {cupom.time}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cupom.status === "Pago" ? "success" : "destructive"
                          }
                        >
                          {cupom.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {cupom.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Status do caixa</CardTitle>
            <CardDescription>Turno aberto · Operador: Rafael</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Saldo em espécie</p>
              <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                R$ 380,00
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Abertura: R$ 200,00 às 11:00
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta do turno</span>
                <span className="font-medium tabular-nums">R$ 4.000</span>
              </div>
              <Progress value={71} className="h-2" />
              <p className="text-xs text-muted-foreground">
                71% atingido · faltam R$ 1.160
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "PIX", value: "R$ 1.420", share: "50%" },
                { label: "Cartão", value: "R$ 980", share: "35%" },
                { label: "Dinheiro", value: "R$ 380", share: "13%" },
                { label: "Estornos", value: "R$ 60", share: "2%" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className="font-semibold tabular-nums">{row.value}</p>
                  <p className="text-xs text-muted-foreground">{row.share}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1">Nova venda</Button>
              <Button variant="outline" className="flex-1">
                Sangria
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ModuleShell>
  )
}
