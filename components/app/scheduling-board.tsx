"use client"

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { ModuleShell } from "@/components/app/module-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

type ViewMode = "day" | "week"

type Appointment = {
  id: string
  professionalId: string
  client: string
  service: string
  tag: "Consulta" | "Retorno" | "Procedimento" | "Vacina" | "Urgente"
  startMin: number
  durationMin: number
  dayOffset: number
  guests?: { adults: number; children: number }
}

type Professional = {
  id: string
  name: string
  role: string
  initials: string
  lead?: boolean
  tone: string
}

const DAY_START = 8 * 60
const DAY_END = 19 * 60
const PX_PER_MIN = 1.6
const WEEK_HOUR_PX = 72
const ROW_H = 108
const PRO_W = 220
const TIME_W = 56

const professionals: Professional[] = [
  {
    id: "p1",
    name: "Dra. Fernanda Lima",
    role: "Dermatologia",
    initials: "FL",
    lead: true,
    tone: "bg-emerald-500/20 border-emerald-500/35",
  },
  {
    id: "p2",
    name: "Dr. André Souza",
    role: "Clínica geral",
    initials: "AS",
    tone: "bg-sky-500/20 border-sky-500/35",
  },
  {
    id: "p3",
    name: "Dra. Beatriz Rocha",
    role: "Pediatria",
    initials: "BR",
    tone: "bg-violet-500/20 border-violet-500/35",
  },
  {
    id: "p4",
    name: "Carlos Mendes",
    role: "Estética",
    initials: "CM",
    tone: "bg-amber-500/20 border-amber-500/35",
  },
  {
    id: "p5",
    name: "Ana Paula Dias",
    role: "Fisioterapia",
    initials: "AD",
    tone: "bg-rose-500/20 border-rose-500/35",
  },
]

const appointments: Appointment[] = [
  {
    id: "a1",
    professionalId: "p1",
    client: "Patrícia Alves",
    service: "Consulta",
    tag: "Consulta",
    startMin: 9 * 60,
    durationMin: 60,
    dayOffset: 3,
  },
  {
    id: "a2",
    professionalId: "p1",
    client: "Roberto Dias",
    service: "Retorno",
    tag: "Retorno",
    startMin: 11 * 60,
    durationMin: 45,
    dayOffset: 3,
  },
  {
    id: "a3",
    professionalId: "p1",
    client: "Sandra Melo",
    service: "Peeling",
    tag: "Procedimento",
    startMin: 14 * 60,
    durationMin: 90,
    dayOffset: 3,
  },
  {
    id: "a4",
    professionalId: "p2",
    client: "Felipe Nunes",
    service: "Check-up",
    tag: "Consulta",
    startMin: 8 * 60 + 30,
    durationMin: 60,
    dayOffset: 3,
  },
  {
    id: "a5",
    professionalId: "p2",
    client: "Helena Prado",
    service: "Consulta",
    tag: "Consulta",
    startMin: 10 * 60 + 30,
    durationMin: 60,
    dayOffset: 3,
  },
  {
    id: "a6",
    professionalId: "p2",
    client: "Igor Santos",
    service: "Urgência",
    tag: "Urgente",
    startMin: 13 * 60,
    durationMin: 45,
    dayOffset: 3,
  },
  {
    id: "a7",
    professionalId: "p2",
    client: "Julia Costa",
    service: "Retorno",
    tag: "Retorno",
    startMin: 15 * 60 + 30,
    durationMin: 30,
    dayOffset: 3,
  },
  {
    id: "a8",
    professionalId: "p3",
    client: "Laura (5a)",
    service: "Vacina",
    tag: "Vacina",
    startMin: 9 * 60 + 30,
    durationMin: 30,
    dayOffset: 3,
    guests: { adults: 1, children: 1 },
  },
  {
    id: "a9",
    professionalId: "p3",
    client: "Miguel (8a)",
    service: "Consulta",
    tag: "Consulta",
    startMin: 13 * 60,
    durationMin: 45,
    dayOffset: 3,
  },
  {
    id: "a10",
    professionalId: "p3",
    client: "Nicole (2a)",
    service: "Retorno",
    tag: "Retorno",
    startMin: 15 * 60 + 30,
    durationMin: 30,
    dayOffset: 3,
  },
  {
    id: "a11",
    professionalId: "p4",
    client: "Mariana Lopes",
    service: "Limpeza",
    tag: "Procedimento",
    startMin: 10 * 60,
    durationMin: 90,
    dayOffset: 3,
  },
  {
    id: "a12",
    professionalId: "p4",
    client: "Bruno Teixeira",
    service: "Consulta",
    tag: "Consulta",
    startMin: 14 * 60 + 30,
    durationMin: 60,
    dayOffset: 3,
  },
  {
    id: "a13",
    professionalId: "p5",
    client: "Carla Dias",
    service: "Fisio",
    tag: "Procedimento",
    startMin: 9 * 60,
    durationMin: 50,
    dayOffset: 3,
  },
  {
    id: "a14",
    professionalId: "p5",
    client: "Eduardo Ramos",
    service: "Reabilitação",
    tag: "Procedimento",
    startMin: 11 * 60,
    durationMin: 50,
    dayOffset: 3,
  },
  {
    id: "a15",
    professionalId: "p5",
    client: "Fernanda Ruiz",
    service: "Avaliação",
    tag: "Consulta",
    startMin: 16 * 60,
    durationMin: 45,
    dayOffset: 3,
  },
  {
    id: "a16",
    professionalId: "p1",
    client: "Grupo dermato",
    service: "Protocolo",
    tag: "Consulta",
    startMin: 13 * 60,
    durationMin: 120,
    dayOffset: 0,
  },
  {
    id: "a17",
    professionalId: "p1",
    client: "Camila Reis",
    service: "Retorno",
    tag: "Retorno",
    startMin: 10 * 60,
    durationMin: 45,
    dayOffset: 1,
  },
  {
    id: "a18",
    professionalId: "p1",
    client: "Diego Alves",
    service: "Consulta",
    tag: "Consulta",
    startMin: 9 * 60,
    durationMin: 60,
    dayOffset: 4,
  },
  {
    id: "a19",
    professionalId: "p2",
    client: "Equipe clínica",
    service: "Reunião",
    tag: "Consulta",
    startMin: 15 * 60,
    durationMin: 90,
    dayOffset: 1,
  },
  {
    id: "a20",
    professionalId: "p3",
    client: "Campanha vacinas",
    service: "Mutirão",
    tag: "Vacina",
    startMin: 10 * 60,
    durationMin: 180,
    dayOffset: 4,
  },
]

const weekDays = [
  { label: "Seg", date: 13 },
  { label: "Ter", date: 14 },
  { label: "Qua", date: 15 },
  { label: "Qui", date: 16 },
  { label: "Sex", date: 17 },
  { label: "Sáb", date: 18 },
  { label: "Dom", date: 19 },
]

const weekGridStyle = {
  display: "grid",
  gridTemplateColumns: `${TIME_W}px repeat(7, minmax(0, 1fr))`,
} as const

function hhmm(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`
}

function TagBadge({ tag }: { tag: Appointment["tag"] }) {
  const variant =
    tag === "Urgente"
      ? "destructive"
      : tag === "Vacina"
        ? "info"
        : tag === "Procedimento"
          ? "warning"
          : tag === "Retorno"
            ? "secondary"
            : "success"
  return (
    <Badge variant={variant} className="h-5 shrink-0 px-1.5 text-[10px]">
      {tag}
    </Badge>
  )
}

function labelFor(filter: string) {
  if (filter === "all") return "Todos profissionais"
  return professionals.find((p) => p.id === filter)?.name ?? "Profissional"
}

function DayView({
  pros,
  hours,
  dayWidth,
  todayApts,
}: {
  pros: Professional[]
  hours: number[]
  dayWidth: number
  todayApts: Appointment[]
}) {
  const totalW = PRO_W + dayWidth

  return (
    <div className="absolute inset-0 overflow-auto">
      <div style={{ width: totalW, minWidth: "100%" }}>
        <div
          className="sticky top-0 z-20 flex border-b border-border bg-card"
          style={{ height: 48 }}
        >
          <div
            className="sticky left-0 z-30 flex shrink-0 items-center border-r border-border bg-card px-3 text-xs font-medium text-muted-foreground"
            style={{ width: PRO_W }}
          >
            Profissional
          </div>
          <div className="relative shrink-0" style={{ width: dayWidth }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute inset-y-0 border-l border-border/70"
                style={{ left: (h - DAY_START) * PX_PER_MIN }}
              >
                <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[11px] text-muted-foreground tabular-nums">
                  {hhmm(h)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {pros.map((pro) => {
          const aps = todayApts.filter((a) => a.professionalId === pro.id)
          return (
            <div
              key={pro.id}
              className="flex border-b border-border/80"
              style={{ height: ROW_H, minHeight: ROW_H }}
            >
              <div
                className="sticky left-0 z-10 flex shrink-0 items-center gap-2.5 border-r border-border bg-card px-3"
                style={{ width: PRO_W }}
              >
                <Avatar size="sm">
                  <AvatarFallback className="text-[10px] font-semibold">
                    {pro.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-medium">{pro.name}</p>
                    {pro.lead ? (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Lead
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {pro.role}
                  </p>
                </div>
              </div>

              <div
                className="relative shrink-0 bg-background"
                style={{ width: dayWidth, height: ROW_H }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-y-0 border-l border-border/45"
                    style={{ left: (h - DAY_START) * PX_PER_MIN }}
                  />
                ))}
                {aps.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      "absolute top-2.5 bottom-2.5 overflow-hidden rounded-xl border px-2.5 py-1.5",
                      pro.tone
                    )}
                    style={{
                      left: (apt.startMin - DAY_START) * PX_PER_MIN + 4,
                      width: Math.max(apt.durationMin * PX_PER_MIN - 8, 100),
                    }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {apt.client}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {hhmm(apt.startMin)} –{" "}
                          {hhmm(apt.startMin + apt.durationMin)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="size-5"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="size-5"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <TagBadge tag={apt.tag} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekView({
  weekPro,
  hours,
  weekHeight,
  weekOffset,
}: {
  weekPro: Professional
  hours: number[]
  weekHeight: number
  weekOffset: number
}) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Avatar size="sm">
          <AvatarFallback className="text-[10px] font-semibold">
            {weekPro.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{weekPro.name}</p>
          <p className="text-xs text-muted-foreground">{weekPro.role}</p>
        </div>
      </div>

      <div className="shrink-0 border-b border-border" style={weekGridStyle}>
        <div className="border-r border-border" />
        {weekDays.map((day, i) => {
          const today = i === 3
          return (
            <div
              key={day.label}
              className={cn(
                "border-r border-border py-2.5 text-center last:border-r-0",
                today && "bg-primary/10"
              )}
            >
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                {day.label}
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                  today && "bg-primary text-primary-foreground"
                )}
              >
                {day.date + weekOffset * 7}
              </p>
            </div>
          )
        })}
      </div>

      <ScrollArea className="min-h-0 flex-1 overflow-auto">
        <div
          style={{
            ...weekGridStyle,
            height: weekHeight,
            minHeight: weekHeight,
          }}
        >
          <div className="relative border-r border-border">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-0 left-0 border-t border-border/60 first:border-t-0"
                style={{ top: ((h - DAY_START) / 60) * WEEK_HOUR_PX }}
              >
                <span className="-top absolute right-1.5 text-[10px] text-muted-foreground tabular-nums">
                  {hhmm(h)}
                </span>
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => {
            const today = dayIndex === 3
            const events = appointments.filter(
              (a) => a.dayOffset === dayIndex && a.professionalId === weekPro.id
            )
            return (
              <div
                key={day.label}
                className={cn(
                  "relative border-r border-border/70 last:border-r-0",
                  today && "bg-primary/5"
                )}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute right-0 left-0 border-t border-border/50 first:border-t-0"
                    style={{ top: ((h - DAY_START) / 60) * WEEK_HOUR_PX }}
                  />
                ))}
                {events.map((apt) => {
                  const top =
                    ((apt.startMin - DAY_START) / 60) * WEEK_HOUR_PX + 3
                  const height = Math.max(
                    (apt.durationMin / 60) * WEEK_HOUR_PX - 6,
                    44
                  )
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "absolute right-1 left-1 z-1 overflow-hidden rounded-lg border px-2 py-1.5",
                        weekPro.tone
                      )}
                      style={{ top, height }}
                      title={`${apt.client} · ${apt.service}`}
                    >
                      <p className="truncate text-[11px] font-semibold">
                        {apt.client}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {hhmm(apt.startMin)} –{" "}
                        {hhmm(apt.startMin + apt.durationMin)}
                      </p>
                      {height >= 58 ? (
                        <div className="mt-1">
                          <TagBadge tag={apt.tag} />
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export function SchedulingBoard() {
  const [view, setView] = useState<ViewMode>("day")
  const [filter, setFilter] = useState("all")
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    if (view === "week" && filter === "all") {
      setFilter(professionals[0].id)
    }
  }, [view, filter])

  const hours = useMemo(() => {
    const out: number[] = []
    for (let m = DAY_START; m < DAY_END; m += 60) out.push(m)
    return out
  }, [])

  const dayWidth = (DAY_END - DAY_START) * PX_PER_MIN
  const weekHeight = ((DAY_END - DAY_START) / 60) * WEEK_HOUR_PX

  const pros =
    filter === "all"
      ? professionals
      : professionals.filter((p) => p.id === filter)

  const weekPro = professionals.find((p) => p.id === filter) ?? professionals[0]

  const todayApts = appointments.filter((a) => a.dayOffset === 3)
  const count =
    view === "day"
      ? todayApts.filter((a) => filter === "all" || a.professionalId === filter)
          .length
      : appointments.filter((a) => a.professionalId === weekPro.id).length

  return (
    <ModuleShell
      title="Agenda"
      description={`Quinta, 16 de julho · ${count} atendimentos`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filter}
            onValueChange={(v) => {
              if (v == null) return
              const next = String(v)
              if (view === "week" && next === "all") {
                setFilter(professionals[0].id)
                return
              }
              setFilter(next)
            }}
          >
            <SelectTrigger size="sm" className="min-w-52">
              <Users className="size-3.5 opacity-70" />
              <SelectValue>{labelFor(filter)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {view === "day" ? (
                <SelectItem value="all">Todos profissionais</SelectItem>
              ) : null}
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs
            value={view}
            onValueChange={(v) => {
              if (v !== "day" && v !== "week") return
              setView(v)
              if (v === "week" && filter === "all") {
                setFilter(professionals[0].id)
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="day">Dia</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setWeekOffset((n) => n - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setWeekOffset((n) => n + 1)}
            >
              <ChevronRight />
            </Button>
          </div>

          <Button size="sm">
            <Plus data-icon="inline-start" />
            Novo agendamento
          </Button>
        </div>
      }
    >
      <div className="relative h-full min-h-0 w-full">
        {view === "day" ? (
          <DayView
            pros={pros}
            hours={hours}
            dayWidth={dayWidth}
            todayApts={todayApts}
          />
        ) : (
          <WeekView
            weekPro={weekPro}
            hours={hours}
            weekHeight={weekHeight}
            weekOffset={weekOffset}
          />
        )}
      </div>
    </ModuleShell>
  )
}
