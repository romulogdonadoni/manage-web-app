import { ModuleShell } from "@/components/app/module-shell"
import {
  Megaphone,
  Percent,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { ModuleStats } from "@/components/app/module-stats"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const stats = [
  { label: "Campanhas ativas", value: "6", hint: "2 encerram esta semana", icon: Megaphone },
  { label: "Desconto médio", value: "18%", hint: "Mix promocional", icon: Percent },
  { label: "Conversão", value: "4,2%", hint: "vs 3,1% baseline", icon: TrendingUp },
  { label: "Destaques", value: "3", hint: "Home e push", icon: Sparkles },
]

const campaigns = [
  {
    name: "Frete grátis acima de R$ 99",
    vigencia: "01/07 – 31/07/2026",
    channels: ["App", "Site", "Loja"],
    progress: 72,
    status: "Ativa",
  },
  {
    name: "Combo família — 20% off",
    vigencia: "10/07 – 20/07/2026",
    channels: ["App", "PDV"],
    progress: 45,
    status: "Ativa",
  },
  {
    name: "Cashback fim de semana",
    vigencia: "12/07 – 14/07/2026",
    channels: ["App"],
    progress: 100,
    status: "Encerrada",
  },
  {
    name: "Liquida verão — até 40%",
    vigencia: "15/07 – 15/08/2026",
    channels: ["Site", "Marketplace"],
    progress: 18,
    status: "Ativa",
  },
  {
    name: "Primeira compra — R$ 25 off",
    vigencia: "01/06 – 30/09/2026",
    channels: ["App", "Site", "Email"],
    progress: 55,
    status: "Ativa",
  },
  {
    name: "Happy hour delivery",
    vigencia: "16/07 – 16/07/2026",
    channels: ["App", "Delivery"],
    progress: 8,
    status: "Agendada",
  },
]

function CampaignStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Ativa"
      ? "success"
      : status === "Agendada"
        ? "info"
        : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}

export default function PromotionsPage() {
  return (
    <ModuleShell title={"Promoções"} description={"Ofertas, combos e cupons"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.name} size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {campaign.name}
                </CardTitle>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <CardDescription>Vigência: {campaign.vigencia}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {campaign.channels.map((channel) => (
                  <Badge key={channel} variant="outline">
                    {channel}
                  </Badge>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso da campanha</span>
                  <span>{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                {campaign.status === "Encerrada"
                  ? "Resultados consolidados"
                  : "Orçamento consumido no período"}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </ModuleShell>
  )
}
