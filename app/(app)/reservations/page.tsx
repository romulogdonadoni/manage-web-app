import { ModuleShell } from "@/components/app/module-shell"
import {
  CalendarDays,
  Clock,
  Phone,
  UserCheck,
  Users,
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
import { Separator } from "@/components/ui/separator"

const stats = [
  {
    label: "Reservas hoje",
    value: "14",
    hint: "6 confirmadas · 2 pendentes",
    icon: CalendarDays,
  },
  {
    label: "Cobertura prevista",
    value: "52",
    hint: "Pico às 20:00",
    icon: Users,
  },
  {
    label: "No-show ontem",
    value: "2",
    hint: "Taxa de 8%",
    icon: UserCheck,
  },
  {
    label: "Próximo slot",
    value: "19:00",
    hint: "3 reservas aguardando",
    icon: Clock,
  },
]

const timeSlots = [
  {
    hour: "19:00",
    reservations: [
      {
        id: "R-201",
        guest: "Ana & Bruno Souza",
        covers: 2,
        table: "Mesa 4",
        phone: "(11) 98765-4321",
        status: "Confirmada",
        note: "Aniversário — bolo surpresa",
      },
      {
        id: "R-202",
        guest: "Carlos Mendes",
        covers: 4,
        table: "Mesa 9",
        phone: "(11) 91234-5678",
        status: "Confirmada",
        note: null,
      },
      {
        id: "R-203",
        guest: "Diana Prado",
        covers: 2,
        table: "Mesa 2",
        phone: "(11) 99876-5432",
        status: "Pendente",
        note: "Aguardando confirmação por WhatsApp",
      },
    ],
  },
  {
    hour: "20:00",
    reservations: [
      {
        id: "R-204",
        guest: "Família Ribeiro",
        covers: 6,
        table: "Mesa 12",
        phone: "(11) 97654-3210",
        status: "Confirmada",
        note: "Cadeira alta para criança",
      },
      {
        id: "R-205",
        guest: "Eduardo Lima",
        covers: 2,
        table: "Mesa 7",
        phone: "(11) 96543-2109",
        status: "Confirmada",
        note: null,
      },
      {
        id: "R-206",
        guest: "Grupo Tech Meetup",
        covers: 8,
        table: "Mesas 9+10",
        phone: "(11) 95432-1098",
        status: "Confirmada",
        note: "Conta separada solicitada",
      },
    ],
  },
  {
    hour: "21:00",
    reservations: [
      {
        id: "R-207",
        guest: "Fernanda Costa",
        covers: 3,
        table: "Mesa 5",
        phone: "(11) 94321-0987",
        status: "Confirmada",
        note: null,
      },
      {
        id: "R-208",
        guest: "Gabriel & Helena",
        covers: 2,
        table: "Mesa 3",
        phone: "(11) 93210-9876",
        status: "Pendente",
        note: "Cliente pediu mesa na janela",
      },
    ],
  },
] as const

function ReservationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "Confirmada" ? "success" : "warning"}>
      {status}
    </Badge>
  )
}

export default function ReservationsPage() {
  return (
    <ModuleShell title={"Reservas"} description={"Reservas de mesa e horários"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Agenda de hoje
          </h2>
          <p className="text-sm text-muted-foreground">
            Quinta-feira, 16 de julho · Salão principal
          </p>
        </div>
        <Button size="sm">Nova reserva</Button>
      </div>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Linha do tempo</CardTitle>
          <CardDescription>Reservas agrupadas por horário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {timeSlots.map((slot, slotIndex) => (
            <div key={slot.hour}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold tabular-nums text-primary">
                  {slot.hour}
                </div>
                <div>
                  <p className="font-medium">
                    {slot.reservations.length} reserva(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {slot.reservations.reduce((sum, r) => sum + r.covers, 0)}{" "}
                    pessoas esperadas
                  </p>
                </div>
              </div>

              <div className="ml-6 space-y-3 border-l-2 border-border pl-6">
                {slot.reservations.map((reservation) => (
                  <Card
                    key={reservation.id}
                    size="sm"
                    className="shadow-none"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">
                            {reservation.guest}
                          </CardTitle>
                          <CardDescription>
                            {reservation.id} · {reservation.table}
                          </CardDescription>
                        </div>
                        <ReservationStatusBadge status={reservation.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {reservation.covers} pessoas
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="size-3.5" />
                          {reservation.phone}
                        </span>
                      </div>
                      {reservation.note ? (
                        <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                          Obs.: {reservation.note}
                        </p>
                      ) : null}
                      <div className="flex gap-2 pt-1">
                        <Button size="xs">Check-in</Button>
                        <Button size="xs" variant="outline">
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {slotIndex < timeSlots.length - 1 ? (
                <Separator className="mt-8" />
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
