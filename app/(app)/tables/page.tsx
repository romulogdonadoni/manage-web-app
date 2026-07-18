import { ModuleShell } from "@/components/app/module-shell"
import {
  Armchair,
  Clock,
  Users,
  UtensilsCrossed,
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"

const stats = [
  {
    label: "Mesas ocupadas",
    value: "8",
    hint: "De 14 no salão",
    icon: UtensilsCrossed,
  },
  {
    label: "Livres",
    value: "4",
    hint: "Prontas para receber",
    icon: Armchair,
  },
  {
    label: "Reservadas",
    value: "2",
    hint: "Chegada prevista em 30 min",
    icon: Clock,
  },
  {
    label: "Cobertura",
    value: "32",
    hint: "Pessoas no salão agora",
    icon: Users,
  },
]

type TableStatus = "free" | "occupied" | "reserved"

const tables: {
  number: number
  status: TableStatus
  covers: number
  maxCovers: number
  waiter?: string
  elapsed?: string
  guest?: string
}[] = [
  { number: 1, status: "occupied", covers: 2, maxCovers: 4, waiter: "Lucas", elapsed: "42 min" },
  { number: 2, status: "free", covers: 0, maxCovers: 2 },
  { number: 3, status: "occupied", covers: 4, maxCovers: 6, waiter: "Marina", elapsed: "18 min" },
  { number: 4, status: "reserved", covers: 0, maxCovers: 4, guest: "Família Ribeiro · 20:00" },
  { number: 5, status: "occupied", covers: 3, maxCovers: 4, waiter: "Lucas", elapsed: "55 min" },
  { number: 6, status: "free", covers: 0, maxCovers: 2 },
  { number: 7, status: "occupied", covers: 2, maxCovers: 2, waiter: "Marina", elapsed: "12 min" },
  { number: 8, status: "reserved", covers: 0, maxCovers: 6, guest: "Grupo Silva · 20:30" },
  { number: 9, status: "occupied", covers: 5, maxCovers: 8, waiter: "Pedro", elapsed: "28 min" },
  { number: 10, status: "free", covers: 0, maxCovers: 4 },
  { number: 11, status: "occupied", covers: 2, maxCovers: 4, waiter: "Pedro", elapsed: "8 min" },
  { number: 12, status: "occupied", covers: 6, maxCovers: 8, waiter: "Lucas", elapsed: "1h 05" },
  { number: 13, status: "free", covers: 0, maxCovers: 2 },
  { number: 14, status: "occupied", covers: 4, maxCovers: 6, waiter: "Marina", elapsed: "33 min" },
]

const statusConfig: Record<
  TableStatus,
  { label: string; badge: "success" | "destructive" | "warning"; tile: string }
> = {
  free: {
    label: "Livre",
    badge: "success",
    tile: "border-success/30 bg-success/5 hover:bg-success/10",
  },
  occupied: {
    label: "Ocupada",
    badge: "destructive",
    tile: "border-destructive/30 bg-destructive/5 hover:bg-destructive/10",
  },
  reserved: {
    label: "Reservada",
    badge: "warning",
    tile: "border-warning/40 bg-warning/10 hover:bg-warning/15",
  },
}

export default function TablesPage() {
  return (
    <ModuleShell title={"Mesas"} description={"Salão, comandas e ocupação"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Mapa do salão
          </h2>
          <p className="text-sm text-muted-foreground">
            Toque na mesa para abrir comanda ou transferir
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Livre</Badge>
          <Badge variant="destructive">Ocupada</Badge>
          <Badge variant="warning">Reservada</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {tables.map((table) => {
          const config = statusConfig[table.status]
          return (
            <button
              key={table.number}
              type="button"
              className={`group flex min-h-[120px] cursor-pointer flex-col items-center justify-between rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] ${config.tile}`}
            >
              <div className="flex w-full items-start justify-between">
                <span className="text-2xl font-bold tabular-nums">
                  {table.number}
                </span>
                <Badge variant={config.badge} className="text-[10px]">
                  {config.label}
                </Badge>
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Users className="size-3.5" />
                  {table.status === "occupied"
                    ? `${table.covers}/${table.maxCovers}`
                    : `até ${table.maxCovers}`}
                </div>
                {table.waiter ? (
                  <p className="text-xs text-muted-foreground">
                    {table.waiter} · {table.elapsed}
                  </p>
                ) : null}
                {table.guest ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {table.guest}
                  </p>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="size-4" />
              Mesas em atenção
            </CardTitle>
            <CardDescription>Tempo acima de 45 min</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {tables
                .filter((t) => t.status === "occupied" && t.elapsed?.includes("55"))
                .concat(
                  tables.filter(
                    (t) => t.status === "occupied" && t.elapsed?.includes("1h")
                  )
                )
                .map((t) => (
                  <Item key={t.number} variant="muted" size="sm">
                    <ItemContent>
                      <ItemTitle>
                        Mesa {t.number} · {t.covers} pessoas
                      </ItemTitle>
                      <ItemDescription>
                        Garçom {t.waiter} · aberta há {t.elapsed}
                      </ItemDescription>
                    </ItemContent>
                    <Button size="xs" variant="outline">
                      Ver comanda
                    </Button>
                  </Item>
                ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Próximas reservas no salão</CardTitle>
            <CardDescription>Mesas já bloqueadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {tables
                .filter((t) => t.status === "reserved")
                .map((t) => (
                  <Item key={t.number} variant="muted" size="sm">
                    <ItemContent>
                      <ItemTitle>Mesa {t.number}</ItemTitle>
                      <ItemDescription>{t.guest}</ItemDescription>
                    </ItemContent>
                    <Badge variant="warning">Reservada</Badge>
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
