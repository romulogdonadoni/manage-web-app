import { ModuleShell } from "@/components/app/module-shell"
import {
  Box,
  Package,
  Sparkles,
  Tag,
} from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const stats = [
  {
    label: "Produtos",
    value: "186",
    hint: "12 rascunhos",
    icon: Package,
  },
  {
    label: "Categorias",
    value: "8",
    hint: "3 níveis de árvore",
    icon: Box,
  },
  {
    label: "Em promoção",
    value: "14",
    hint: "Campanha verão",
    icon: Tag,
  },
  {
    label: "Novos este mês",
    value: "23",
    hint: "+8 vs mês anterior",
    icon: Sparkles,
  },
]

const categories = [
  {
    id: "bebidas",
    label: "Bebidas",
    products: [
      {
        sku: "BEB-001",
        name: "Água mineral 500ml",
        brand: "Crystal",
        price: "R$ 3,50",
        stock: "Em estoque",
      },
      {
        sku: "BEB-014",
        name: "Refrigerante cola 2L",
        brand: "Fizz",
        price: "R$ 9,90",
        stock: "Baixo",
      },
      {
        sku: "BEB-022",
        name: "Suco integral laranja 1L",
        brand: "Nativa",
        price: "R$ 12,40",
        stock: "Em estoque",
      },
    ],
  },
  {
    id: "mercearia",
    label: "Mercearia",
    products: [
      {
        sku: "MER-108",
        name: "Arroz branco tipo 1 5kg",
        brand: "Campo Verde",
        price: "R$ 24,90",
        stock: "Em estoque",
      },
      {
        sku: "MER-142",
        name: "Feijão carioca 1kg",
        brand: "Campo Verde",
        price: "R$ 8,70",
        stock: "Em estoque",
      },
      {
        sku: "MER-201",
        name: "Azeite extra virgem 500ml",
        brand: "Oliva",
        price: "R$ 34,50",
        stock: "Baixo",
      },
    ],
  },
  {
    id: "higiene",
    label: "Higiene",
    products: [
      {
        sku: "HIG-033",
        name: "Sabonete líquido 250ml",
        brand: "Pure",
        price: "R$ 14,90",
        stock: "Em estoque",
      },
      {
        sku: "HIG-051",
        name: "Papel higiênico 12 rolos",
        brand: "Soft",
        price: "R$ 22,80",
        stock: "Em estoque",
      },
      {
        sku: "HIG-067",
        name: "Shampoo anticaspa 400ml",
        brand: "Pure",
        price: "R$ 28,50",
        stock: "Indisponível",
      },
    ],
  },
] as const

function StockBadge({ stock }: { stock: string }) {
  const variant =
    stock === "Em estoque"
      ? "success"
      : stock === "Baixo"
        ? "warning"
        : "destructive"

  return <Badge variant={variant}>{stock}</Badge>
}

export default function CatalogPage() {
  return (
    <ModuleShell title={"Catálogo"} description={"Produtos, categorias e preços"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Catálogo de produtos</CardTitle>
              <CardDescription>
                SKUs, preços e disponibilidade por categoria
              </CardDescription>
            </div>
            <Button size="sm" variant="outline">
              Importar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bebidas">
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
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {category.products.map((product) => (
                    <Card key={product.sku} size="sm" className="shadow-none">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base">
                              {product.name}
                            </CardTitle>
                            <CardDescription>
                              {product.brand} · {product.sku}
                            </CardDescription>
                          </div>
                          <StockBadge stock={product.stock} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold tabular-nums tracking-tight">
                          {product.price}
                        </p>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button size="xs" variant="outline" className="flex-1">
                          Editar
                        </Button>
                        <Button size="xs" variant="ghost">
                          Duplicar
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
    </div>
    </ModuleShell>
  )
}
