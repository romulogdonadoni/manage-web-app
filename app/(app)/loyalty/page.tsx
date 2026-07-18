import { ModuleShell } from "@/components/app/module-shell"
import {
  Gift,
  Stamp,
  Star,
  Users,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Membros ativos", value: "1.284", hint: "+86 este mês", icon: Users },
  { label: "Selos emitidos", value: "3.412", hint: "Cartões em andamento", icon: Stamp },
  { label: "Resgates hoje", value: "19", hint: "12 pontos · 7 selos", icon: Gift },
  { label: "NPS fidelidade", value: "72", hint: "Pesquisa trimestral", icon: Star },
]

const members = [
  { name: "Mariana Costa", tier: "Ouro", points: "2.450", stamps: "8/10", lastVisit: "Hoje" },
  { name: "Pedro Henrique", tier: "Prata", points: "890", stamps: "4/10", lastVisit: "Ontem" },
  { name: "Luciana Ferreira", tier: "Ouro", points: "3.120", stamps: "10/10", lastVisit: "Há 2 dias" },
  { name: "Rafael Gomes", tier: "Bronze", points: "320", stamps: "2/10", lastVisit: "Há 5 dias" },
  { name: "Camila Ribeiro", tier: "Prata", points: "1.560", stamps: "6/10", lastVisit: "Hoje" },
]

const rewards = [
  {
    title: "Café grátis",
    type: "Selos",
    cost: "10 selos",
    redeemed: "142/mês",
    variant: "warning" as const,
  },
  {
    title: "Desconto 15%",
    type: "Pontos",
    cost: "800 pts",
    redeemed: "89/mês",
    variant: "info" as const,
  },
  {
    title: "Sobremesa cortesia",
    type: "Selos",
    cost: "6 selos",
    redeemed: "67/mês",
    variant: "warning" as const,
  },
  {
    title: "Combo premium",
    type: "Pontos",
    cost: "2.000 pts",
    redeemed: "23/mês",
    variant: "info" as const,
  },
]

function TierBadge({ tier }: { tier: string }) {
  const variant =
    tier === "Ouro" ? "warning" : tier === "Prata" ? "secondary" : "outline"
  return <Badge variant={variant}>{tier}</Badge>
}

export default function LoyaltyPage() {
  return (
    <ModuleShell title={"Fidelidade"} description={"Pontos, stamps e recompensas"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Membros do programa</CardTitle>
            <CardDescription>
              Cartões de selos e saldo de pontos por cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Selos</TableHead>
                  <TableHead>Última visita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.name}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <TierBadge tier={member.tier} />
                    </TableCell>
                    <TableCell className="tabular-nums">{member.points}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {member.stamps}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.lastVisit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Catálogo de recompensas</CardTitle>
            <CardDescription>Prêmios por selos ou pontos acumulados</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rewards.map((reward) => (
              <Card key={reward.title} size="sm" className="shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{reward.title}</CardTitle>
                    <Badge variant={reward.variant}>{reward.type}</Badge>
                  </div>
                  <CardDescription>{reward.cost}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {reward.redeemed} resgatados
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
    </ModuleShell>
  )
}
