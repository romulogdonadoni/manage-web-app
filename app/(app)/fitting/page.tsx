import { ModuleShell } from "@/components/app/module-shell"
import {
  Clock,
  DoorOpen,
  Shirt,
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

const stats = [
  { label: "Cabines ocupadas", value: "5/8", hint: "Pico do sábado", icon: DoorOpen },
  { label: "Peças em prova", value: "14", hint: "Média 3 por cliente", icon: Shirt },
  { label: "Tempo médio", value: "18 min", hint: "Por sessão", icon: Clock },
  { label: "Clientes na loja", value: "9", hint: "2 aguardando cabine", icon: Users },
]

const cabins = [
  {
    id: "Cabine 1",
    client: "Isabela Moura",
    pieces: [
      { sku: "VST-102 · Vestido midi floral", size: "M" },
      { sku: "BLZ-044 · Blazer linho", size: "M" },
    ],
    elapsed: "12 min",
  },
  {
    id: "Cabine 2",
    client: "Renata Duarte",
    pieces: [{ sku: "CLF-201 · Calça wide leg", size: "38" }],
    elapsed: "6 min",
  },
  {
    id: "Cabine 3",
    client: "—",
    pieces: [],
    elapsed: null,
  },
  {
    id: "Cabine 4",
    client: "Vanessa Teixeira",
    pieces: [
      { sku: "SAI-088 · Saia plissada", size: "P" },
      { sku: "TOP-033 · Top seda", size: "P" },
      { sku: "BOL-012 · Cinto couro", size: "Único" },
    ],
    elapsed: "22 min",
  },
  {
    id: "Cabine 5",
    client: "Patrícia Nogueira",
    pieces: [{ sku: "MAC-077 · Macacão jeans", size: "40" }],
    elapsed: "9 min",
  },
  {
    id: "Cabine 6",
    client: "—",
    pieces: [],
    elapsed: null,
  },
  {
    id: "Cabine 7",
    client: "Juliana Freitas",
    pieces: [
      { sku: "VST-115 · Vestido festa", size: "G" },
      { sku: "SAP-022 · Sandália salto", size: "37" },
    ],
    elapsed: "15 min",
  },
  {
    id: "Cabine 8",
    client: "Camila Borges",
    pieces: [{ sku: "KIM-005 · Kimono estampado", size: "Único" }],
    elapsed: "4 min",
  },
]

export default function FittingPage() {
  return (
    <ModuleShell title={"Prova"} description={"Controle de peças em prova"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Prova ao vivo — provador
        </h2>
        <p className="text-sm text-muted-foreground">
          Cabines como colunas · peças em prova por cliente
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cabins.map((cabin) => (
          <Card
            key={cabin.id}
            size="sm"
            className={`shadow-none ${cabin.client === "—" ? "border-dashed opacity-70" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{cabin.id}</CardTitle>
                {cabin.client === "—" ? (
                  <Badge variant="outline">Livre</Badge>
                ) : (
                  <Badge variant="warning">{cabin.elapsed}</Badge>
                )}
              </div>
              <CardDescription>
                {cabin.client === "—" ? "Disponível" : cabin.client}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {cabin.pieces.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma peça</p>
              ) : (
                cabin.pieces.map((piece) => (
                  <div
                    key={piece.sku}
                    className="rounded-2xl bg-muted/50 px-3 py-2 text-xs"
                  >
                    <p className="font-medium">{piece.sku}</p>
                    <p className="text-muted-foreground">Tam. {piece.size}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </ModuleShell>
  )
}
