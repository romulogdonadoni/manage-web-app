import { ModuleShell } from "@/components/app/module-shell"
import {
  CheckCircle2,
  CookingPot,
  Hourglass,
  Timer,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const stats = [
  {
    label: "Na fila",
    value: "5",
    hint: "2 novos · 3 preparando",
    icon: CookingPot,
  },
  {
    label: "Tempo médio",
    value: "9 min",
    hint: "Meta: 12 min",
    icon: Timer,
  },
  {
    label: "Atrasados",
    value: "1",
    hint: "#1040 acima da meta",
    icon: Hourglass,
  },
  {
    label: "Prontos",
    value: "1",
    hint: "Aguardando entrega",
    icon: CheckCircle2,
  },
] as const

const columns = [
  {
    id: "new",
    title: "Novos",
    variant: "info" as const,
    tickets: [
      {
        code: "#1042",
        channel: "Delivery",
        items: ["1× Classic Smash", "1× Batata rústica"],
        note: "Sem cebola",
        elapsed: "2 min",
      },
      {
        code: "#1043",
        channel: "App",
        items: ["1× Double Cheese", "1× Milkshake"],
        note: null,
        elapsed: "1 min",
      },
    ],
  },
  {
    id: "prep",
    title: "Preparando",
    variant: "warning" as const,
    tickets: [
      {
        code: "#1040",
        channel: "App",
        items: ["1× BBQ Ranch", "1× Onion rings", "1× Refri"],
        note: "Entregar no portão",
        elapsed: "11 min",
      },
      {
        code: "#1037",
        channel: "App",
        items: ["1× Double Cheese", "1× Onion rings"],
        note: null,
        elapsed: "8 min",
      },
    ],
  },
  {
    id: "ready",
    title: "Prontos",
    variant: "success" as const,
    tickets: [
      {
        code: "#1041",
        channel: "Balcão",
        items: ["1× Double Cheese", "1× Milkshake"],
        note: "Cliente aguardando",
        elapsed: "3 min",
      },
    ],
  },
] as const

const checklist = [
  "Tickets entram automaticamente a partir de orders",
  "Colunas: Novos → Preparando → Prontos",
  "Obs. do cliente aparece no ticket",
  "Ação Avançar move o pedido na fila",
  "Somente mock — sem sync em tempo real ainda",
] as const

export default function KdsPage() {
  return (
    <ModuleShell title={"Cozinha"} description={"Fila de preparo (KDS)"}>
      <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} size="sm" className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="mt-1 text-2xl font-semibold tracking-tight">
                  {value}
                </CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <Card key={column.id} size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{column.title}</CardTitle>
                <Badge variant={column.variant}>
                  {column.tickets.length}
                </Badge>
              </div>
              <CardDescription>
                {column.id === "new"
                  ? "Aguardando início"
                  : column.id === "prep"
                    ? "Em produção na chapa"
                    : "Prontos para entrega"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.tickets.map((ticket) => (
                <Card key={ticket.code} size="sm" className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{ticket.code}</CardTitle>
                      <Badge variant="outline">{ticket.channel}</Badge>
                    </div>
                    <CardDescription>{ticket.elapsed}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ItemGroup className="gap-1.5">
                      {ticket.items.map((item) => (
                        <Item key={item} variant="muted" size="xs">
                          <ItemContent>
                            <ItemTitle className="whitespace-normal">
                              {item}
                            </ItemTitle>
                          </ItemContent>
                        </Item>
                      ))}
                    </ItemGroup>
                    {ticket.note ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Obs.: {ticket.note}
                      </p>
                    ) : null}
                  </CardContent>
                  <CardFooter className="gap-2">
                    {column.id !== "ready" ? (
                      <Button size="sm" className="flex-1">
                        Avançar
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" className="flex-1">
                        Entregar
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Checklist do KDS</CardTitle>
            <CardDescription>Comportamento previsto do módulo</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {checklist.map((item) => (
                <Item key={item} variant="muted" size="sm">
                  <ItemMedia variant="icon">
                    <CheckCircle2 className="text-success" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="whitespace-normal">{item}</ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Notas operacionais</CardTitle>
            <CardDescription>Como a cozinha usa o painel</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {[
                "Priorize tickets com tempo acima da meta antes dos novos.",
                "Obs. do cliente (ex.: sem cebola) deve ficar visível no ticket.",
                "Quando o pedido sair da cozinha, o status reflete em orders.",
              ].map((note) => (
                <Item key={note} variant="muted" size="sm">
                  <ItemContent>
                    <ItemDescription className="line-clamp-none">
                      {note}
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
