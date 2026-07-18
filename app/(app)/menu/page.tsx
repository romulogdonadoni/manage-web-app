import { ModuleShell } from "@/components/app/module-shell"
import {
  Flame,
  Layers3,
  PencilLine,
  UtensilsCrossed,
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
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const stats = [
  {
    label: "Itens ativos",
    value: "24",
    hint: "3 ocultos no app",
    icon: UtensilsCrossed,
  },
  {
    label: "Categorias",
    value: "3",
    hint: "Burgers · Sides · Drinks",
    icon: Layers3,
  },
  {
    label: "Bestsellers",
    value: "5",
    hint: "Últimos 7 dias",
    icon: Flame,
  },
  {
    label: "Edições hoje",
    value: "7",
    hint: "Preço e modifiers",
    icon: PencilLine,
  },
] as const

const categories = [
  {
    id: "burgers",
    label: "Burgers",
    items: [
      {
        name: "Classic Smash",
        description: "Blend 180g, queijo cheddar, picles e molho da casa",
        price: "R$ 32,90",
        tags: ["bestseller"],
        modifiers: ["Sem cebola", "+Bacon", "Ponto mal passado"],
      },
      {
        name: "Double Cheese",
        description: "Dois blends, cheddar duplo e cebola caramelizada",
        price: "R$ 39,90",
        tags: ["novo"],
        modifiers: ["+Ovo", "+Bacon", "Pão australiano"],
      },
      {
        name: "BBQ Ranch",
        description: "Blend, bacon, onion rings e barbecue",
        price: "R$ 36,90",
        tags: [],
        modifiers: ["Sem molho", "+Queijo"],
      },
    ],
  },
  {
    id: "sides",
    label: "Acompanhamentos",
    items: [
      {
        name: "Batata rústica",
        description: "Porção média com páprica",
        price: "R$ 18,90",
        tags: [],
        modifiers: ["Cheddar", "Bacon"],
      },
      {
        name: "Onion rings",
        description: "8 unidades com molho ranch",
        price: "R$ 21,90",
        tags: [],
        modifiers: [],
      },
    ],
  },
  {
    id: "drinks",
    label: "Bebidas",
    items: [
      {
        name: "Refrigerante lata",
        description: "350ml",
        price: "R$ 7,90",
        tags: [],
        modifiers: [],
      },
      {
        name: "Milkshake chocolate",
        description: "400ml",
        price: "R$ 19,90",
        tags: ["novo"],
        modifiers: ["Calda extra"],
      },
    ],
  },
] as const

const recentEdits = [
  {
    title: "Classic Smash — preço atualizado",
    time: "Há 20 min",
    type: "preço",
  },
  {
    title: "Double Cheese — modifier +Bacon",
    time: "Há 1 hora",
    type: "modifier",
  },
  {
    title: "Milkshake chocolate publicado",
    time: "Há 3 horas",
    type: "item",
  },
  {
    title: "Onion rings oculto no delivery",
    time: "Ontem",
    type: "canal",
  },
] as const

const groups = [
  {
    name: "Pontos de carne",
    options: "Mal passado · Ao ponto · Bem passado",
  },
  {
    name: "Extras",
    options: "Bacon · Ovo · Queijo · Onion rings",
  },
  {
    name: "Remoções",
    options: "Sem cebola · Sem picles · Sem molho",
  },
] as const

function EditBadge({ type }: { type: string }) {
  const variant =
    type === "item"
      ? "success"
      : type === "modifier"
        ? "info"
        : type === "preço"
          ? "warning"
          : "secondary"

  return <Badge variant={variant}>{type}</Badge>
}

export default function MenuPage() {
  return (
    <ModuleShell title={"Cardápio"} description={"Itens, categorias e destaques"}>
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

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle>Itens do cardápio</CardTitle>
            <CardDescription>
              Catálogo mock com modifiers por item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="burgers">
              <TabsList>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="mt-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.items.map((item) => (
                      <Card key={item.name} size="sm" className="shadow-none">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle>{item.name}</CardTitle>
                            <div className="flex flex-wrap justify-end gap-1">
                              {item.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant={
                                    tag === "novo" ? "info" : "success"
                                  }
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {item.modifiers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {item.modifiers.map((modifier) => (
                                <Badge key={modifier} variant="outline">
                                  {modifier}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Sem modificadores
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="justify-between">
                          <span className="text-sm font-semibold tabular-nums">
                            {item.price}
                          </span>
                          <Button size="xs" variant="outline">
                            Editar
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card size="sm" className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PencilLine className="size-4" />
              Edições recentes
            </CardTitle>
            <CardDescription>Alterações no cardápio</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup className="gap-2">
              {recentEdits.map((item) => (
                <Item
                  key={`${item.title}-${item.time}`}
                  variant="muted"
                  size="sm"
                >
                  <ItemContent>
                    <ItemTitle className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{item.title}</span>
                      <EditBadge type={item.type} />
                    </ItemTitle>
                    <ItemDescription>{item.time}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Grupos de modifiers</CardTitle>
          <CardDescription>
            Opções reutilizáveis entre itens (mock)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.name} size="sm" className="shadow-none">
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground/70">Opções</p>
                    <p className="mt-0.5">{group.options}</p>
                  </div>
                  <Separator />
                  <p>Aplicável a burgers e acompanhamentos</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
