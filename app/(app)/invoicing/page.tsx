"use client"

import { ModuleShell } from "@/components/app/module-shell"

import {
  FileCheck,
  FileText,
  Receipt,
  Wallet,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const stats = [
  { label: "Orçamentos abertos", value: "12", hint: "Aguardando aprovação", icon: FileText },
  { label: "Faturas emitidas", value: "38", hint: "Mês corrente", icon: Receipt },
  { label: "A receber", value: "R$ 24.680", hint: "Vencimento em 15 dias", icon: Wallet },
  { label: "Aprovados hoje", value: "5", hint: "Orçamentos → OS", icon: FileCheck },
]

const quotes = [
  { id: "ORC-2201", client: "Construtora Horizonte", value: "R$ 18.450,00", validUntil: "25/07/2026", status: "Enviado" },
  { id: "ORC-2200", client: "Hotel Praia Azul", value: "R$ 6.320,00", validUntil: "20/07/2026", status: "Aprovado" },
  { id: "ORC-2199", client: "Clínica Vida", value: "R$ 2.890,00", validUntil: "18/07/2026", status: "Expirado" },
  { id: "ORC-2198", client: "Restaurante Sabor", value: "R$ 4.150,00", validUntil: "30/07/2026", status: "Rascunho" },
]

const invoices = [
  { id: "NF-8842", client: "Construtora Horizonte", value: "R$ 18.450,00", issued: "10/07/2026", status: "Pendente" },
  { id: "NF-8841", client: "Hotel Praia Azul", value: "R$ 6.320,00", issued: "08/07/2026", status: "Paga" },
  { id: "NF-8840", client: "Indústria Metal Sul", value: "R$ 12.700,00", issued: "05/07/2026", status: "Pendente" },
  { id: "NF-8839", client: "Academia Fit", value: "R$ 1.980,00", issued: "02/07/2026", status: "Paga" },
]

function DocStatusBadge({ status }: { status: string }) {
  const variant =
    status === "Paga" || status === "Aprovado"
      ? "success"
      : status === "Pendente" || status === "Enviado"
        ? "warning"
        : status === "Expirado"
          ? "destructive"
          : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}

export default function InvoicingPage() {
  return (
    <ModuleShell title={"Faturamento"} description={"Orçamentos e cobrança operacional"}>
      <div className="flex flex-col gap-6">
      <ModuleStats stats={stats} />

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Faturamento operacional</CardTitle>
          <CardDescription>
            Orçamentos e notas fiscais para clientes — não é cobrança de assinatura SaaS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quotes">
            <TabsList>
              <TabsTrigger value="quotes">Orçamentos</TabsTrigger>
              <TabsTrigger value="invoices">Faturas</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.id}</TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {quote.validUntil}
                      </TableCell>
                      <TableCell>
                        <DocStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {quote.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nota</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.issued}
                      </TableCell>
                      <TableCell>
                        <DocStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {invoice.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
