import { ModuleShell } from "@/components/app/module-shell"
import {
  CalendarHeart,
  Heart,
  PawPrint,
  Syringe,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const stats = [
  { label: "Pets cadastrados", value: "342", hint: "28 novos este mês", icon: PawPrint },
  { label: "Vacinas pendentes", value: "14", hint: "Próximos 7 dias", icon: Syringe },
  { label: "Consultas hoje", value: "11", hint: "4 retornos", icon: CalendarHeart },
  { label: "Tutores ativos", value: "298", hint: "Com 1+ pet", icon: Heart },
]

const pets = [
  {
    name: "Thor",
    breed: "Golden Retriever",
    tutor: "Amanda Vieira",
    vaccine: "V10 — 22 jul",
    vaccineStatus: "warning" as const,
    initials: "TH",
  },
  {
    name: "Luna",
    breed: "SRD",
    tutor: "Bruno Carvalho",
    vaccine: "Antirrábica — em dia",
    vaccineStatus: "success" as const,
    initials: "LU",
  },
  {
    name: "Bob",
    breed: "Bulldog Francês",
    tutor: "Carla Mendes",
    vaccine: "Giardia — 18 jul",
    vaccineStatus: "destructive" as const,
    initials: "BO",
  },
  {
    name: "Mel",
    breed: "Poodle",
    tutor: "Daniela Rios",
    vaccine: "V8 — 05 ago",
    vaccineStatus: "info" as const,
    initials: "ME",
  },
  {
    name: "Simba",
    breed: "Maine Coon",
    tutor: "Eduardo Pires",
    vaccine: "Antirrábica — em dia",
    vaccineStatus: "success" as const,
    initials: "SI",
  },
  {
    name: "Nina",
    breed: "Shih Tzu",
    tutor: "Fabiana Lopes",
    vaccine: "V10 — 25 jul",
    vaccineStatus: "warning" as const,
    initials: "NI",
  },
]

export default function PetsPage() {
  return (
    <ModuleShell title={"Pets"} description={"Cadastro e prontuário"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div>
        <h2 className="text-lg font-semibold tracking-tight">Prontuários</h2>
        <p className="text-sm text-muted-foreground">
          Pets ativos com próxima vacina agendada
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pets.map((pet) => (
          <Card key={pet.name} size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{pet.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle>{pet.name}</CardTitle>
                  <CardDescription>{pet.breed}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Tutor</span>
                <span className="font-medium">{pet.tutor}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Próxima vacina</span>
                <Badge variant={pet.vaccineStatus}>{pet.vaccine}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </ModuleShell>
  )
}
