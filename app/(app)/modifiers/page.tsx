"use client"

import { ModuleShell } from "@/components/app/module-shell"

import {
  Layers,
  ListChecks,
  Plus,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react"
import { useState } from "react"

import { ModuleStats } from "@/components/app/module-stats"
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
import { Separator } from "@/components/ui/separator"

const stats = [
  {
    label: "Grupos ativos",
    value: "6",
    hint: "2 obrigatórios · 4 opcionais",
    icon: Layers,
  },
  {
    label: "Opções totais",
    value: "28",
    hint: "Média de 4,6 por grupo",
    icon: ListChecks,
  },
  {
    label: "Itens vinculados",
    value: "18",
    hint: "Do cardápio principal",
    icon: UtensilsCrossed,
  },
  {
    label: "Edições hoje",
    value: "3",
    hint: "Preços e novas opções",
    icon: SlidersHorizontal,
  },
]

const initialGroups = [
  {
    id: "ponto-carne",
    name: "Ponto da carne",
    required: true,
    options: ["Mal passado", "Ao ponto", "Bem passado"],
    items: ["Classic Smash", "Double Cheese", "BBQ Ranch"],
  },
  {
    id: "adicionais",
    name: "Adicionais",
    required: false,
    options: ["Bacon", "Ovo", "Queijo extra", "Cebola caramelizada"],
    items: ["Classic Smash", "Double Cheese", "BBQ Ranch", "Batata rústica"],
  },
  {
    id: "molhos",
    name: "Molhos",
    required: false,
    options: ["Barbecue", "Ranch", "Mostarda e mel", "Picante"],
    items: ["Classic Smash", "Onion rings", "Batata rústica"],
  },
  {
    id: "bebida",
    name: "Bebida do combo",
    required: true,
    options: ["Refri lata", "Suco", "Água", "Milkshake"],
    items: ["Combo Classic", "Combo Double"],
  },
  {
    id: "sem-ingredientes",
    name: "Retirar ingredientes",
    required: false,
    options: ["Sem cebola", "Sem picles", "Sem queijo", "Sem molho"],
    items: ["Classic Smash", "Double Cheese", "BBQ Ranch"],
  },
  {
    id: "tamanho-batata",
    name: "Tamanho da batata",
    required: true,
    options: ["Média", "Grande", "Família"],
    items: ["Batata rústica", "Combo Classic", "Combo Double"],
  },
]

export default function ModifiersPage() {
  const [groups, setGroups] = useState(initialGroups)

  function toggleRequired(id: string) {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, required: !group.required } : group
      )
    )
  }

  return (
    <ModuleShell title={"Modifiers"} description={"Adicionais, remoções e grupos"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Grupos de modificadores
          </h2>
          <p className="text-sm text-muted-foreground">
            Opções extras vinculadas aos itens do cardápio
          </p>
        </div>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Novo grupo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>
                    {group.options.length} opções · {group.items.length} itens
                  </CardDescription>
                </div>
                <Badge variant={group.required ? "warning" : "secondary"}>
                  {group.required ? "Obrigatório" : "Opcional"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Opções
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.options.map((option) => (
                    <Badge key={option} variant="outline">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Usado em
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item} variant="info">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-2">
              <Button
                size="xs"
                variant={group.required ? "default" : "outline"}
                onClick={() => toggleRequired(group.id)}
              >
                {group.required ? "Obrigatório" : "Opcional"}
              </Button>
              <Button size="xs" variant="ghost">
                Editar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </ModuleShell>
  )
}
