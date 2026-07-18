import { ModuleShell } from "@/components/app/module-shell"
import { CheckCircle2, ShieldAlert, ShieldCheck, UserX } from "lucide-react"

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
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const stats = [
  {
    label: "Verificações hoje",
    value: "847",
    hint: "Pico 21h–23h",
    icon: ShieldCheck,
  },
  {
    label: "Aprovados",
    value: "812",
    hint: "96% do total",
    icon: CheckCircle2,
  },
  { label: "Negados", value: "35", hint: "Documento inválido", icon: UserX },
  {
    label: "Alertas",
    value: "2",
    hint: "Tentativas suspeitas",
    icon: ShieldAlert,
  },
]

const checklist = [
  "Documento com foto legível (RG ou CNH)",
  "Data de nascimento confere com cadastro",
  "Selfie ao vivo sem terceiros na imagem",
  "Idade mínima 18 anos confirmada",
  "Geolocalização compatível com loja física",
]

const auditLog = [
  {
    id: "CHK-9821",
    user: "visitante_4821",
    method: "Documento + selfie",
    result: "Aprovado",
    at: "16/07 18:42",
  },
  {
    id: "CHK-9820",
    user: "visitante_4820",
    method: "Documento + selfie",
    result: "Negado",
    at: "16/07 18:39",
  },
  {
    id: "CHK-9819",
    user: "visitante_4819",
    method: "Revalidação",
    result: "Aprovado",
    at: "16/07 18:35",
  },
  {
    id: "CHK-9818",
    user: "visitante_4818",
    method: "Documento + selfie",
    result: "Negado",
    at: "16/07 18:31",
  },
  {
    id: "CHK-9817",
    user: "visitante_4817",
    method: "Documento + selfie",
    result: "Aprovado",
    at: "16/07 18:28",
  },
  {
    id: "CHK-9816",
    user: "visitante_4816",
    method: "Documento + selfie",
    result: "Aprovado",
    at: "16/07 18:24",
  },
]

function ResultBadge({ result }: { result: string }) {
  return (
    <Badge variant={result === "Aprovado" ? "success" : "destructive"}>
      {result}
    </Badge>
  )
}

export default function AgeGatePage() {
  return (
    <ModuleShell title={"Idade"} description={"Verificação etária na venda"}>
      <div className="flex flex-col gap-6">
        <ModuleStats stats={stats} />

        <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Checklist de verificação</CardTitle>
              <CardDescription>
                Critérios obrigatórios antes de liberar acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {checklist.map((item) => (
                  <Item key={item} variant="muted" size="sm">
                    <ItemMedia variant="icon">
                      <CheckCircle2 className="text-success" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-sm font-normal whitespace-normal">
                        {item}
                      </ItemTitle>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>

          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Log de auditoria</CardTitle>
              <CardDescription>
                Histórico de checagens — aprovadas e negadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Sessão</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.user}
                      </TableCell>
                      <TableCell>{entry.method}</TableCell>
                      <TableCell>
                        <ResultBadge result={entry.result} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.at}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleShell>
  )
}
