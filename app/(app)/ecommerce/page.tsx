import { ModuleShell } from "@/components/app/module-shell"
import {
  Globe,
  Package,
  ShoppingCart,
  Store,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  { label: "Pedidos online", value: "156", hint: "Últimos 7 dias", icon: ShoppingCart },
  { label: "SKUs publicados", value: "842", hint: "94% do catálogo", icon: Store },
  { label: "Em separação", value: "23", hint: "CD principal", icon: Package },
  { label: "Marketplaces", value: "3", hint: "ML · Shopee · Site", icon: Globe },
]

const onlineOrders = [
  { id: "#WEB-8821", customer: "Marcos Oliveira", channel: "Site próprio", items: 3, total: "R$ 289,90", status: "Pago" },
  { id: "#WEB-8820", customer: "Aline Barbosa", channel: "Mercado Livre", items: 1, total: "R$ 149,00", status: "Separando" },
  { id: "#WEB-8819", customer: "Tiago Ramos", channel: "Shopee", items: 2, total: "R$ 78,50", status: "Enviado" },
  { id: "#WEB-8818", customer: "Priscila Nunes", channel: "Site próprio", items: 5, total: "R$ 412,00", status: "Pago" },
  { id: "#WEB-8817", customer: "Gustavo Lima", channel: "Mercado Livre", items: 1, total: "R$ 95,00", status: "Cancelado" },
]

const vitrineSkus = [
  { sku: "CAM-001 · Camiseta básica", stock: 240, channels: ["Site", "ML"], published: true },
  { sku: "CAL-042 · Calça jogger", stock: 18, channels: ["Site"], published: true },
  { sku: "TEN-088 · Tênis casual", stock: 0, channels: [], published: false },
  { sku: "BOL-015 · Bolsa couro", stock: 12, channels: ["Site", "Shopee"], published: true },
  { sku: "JAQ-023 · Jaqueta nylon", stock: 45, channels: ["ML"], published: true },
  { sku: "OCU-007 · Óculos sol", stock: 6, channels: [], published: false },
]

function OrderStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Enviado"
      ? "success"
      : status === "Separando" || status === "Pago"
        ? "warning"
        : status === "Cancelado"
          ? "destructive"
          : "info"
  return <Badge variant={variant}>{status}</Badge>
}

export default function EcommercePage() {
  return (
    <ModuleShell title={"E-commerce"} description={"Vitrine e pedidos online"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Pedidos online</CardTitle>
          <CardDescription>Últimos pedidos de e-commerce e marketplaces</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {onlineOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.channel}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {order.items}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {order.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Vitrine — status de publicação
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vitrineSkus.map((sku) => (
            <Card key={sku.sku} size="sm" className="shadow-none">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">{sku.sku}</CardTitle>
                  <Badge variant={sku.published ? "success" : "destructive"}>
                    {sku.published ? "Publicado" : "Oculto"}
                  </Badge>
                </div>
                <CardDescription>Estoque: {sku.stock} un</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {sku.channels.length === 0 ? (
                    <Badge variant="secondary">Sem canal</Badge>
                  ) : (
                    sku.channels.map((ch) => (
                      <Badge key={ch} variant="outline">
                        {ch}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </ModuleShell>
  )
}
