import { ModuleShell } from "@/components/app/module-shell"
import {
  Activity,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  KeyRound,
  Server,
  Users,
} from "lucide-react"

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
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
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
    label: "Tenants ativos",
    value: "12",
    hint: "+2 este mês",
    icon: Building2,
  },
  {
    label: "Usuários",
    value: "148",
    hint: "JIT sincronizados",
    icon: Users,
  },
  {
    label: "Realms Keycloak",
    value: "12",
    hint: "1 por tenant",
    icon: KeyRound,
  },
  {
    label: "Bancos SQL",
    value: "13",
    hint: "1 catálogo + 12 tenants",
    icon: Database,
  },
  {
    label: "APIs saudáveis",
    value: "100%",
    hint: "Último check agora",
    icon: CheckCircle2,
  },
  {
    label: "Último provisionamento",
    value: "2h",
    hint: "acme-corp",
    icon: Clock3,
  },
  {
    label: "Ambientes",
    value: "3",
    hint: "dev · staging · prod",
    icon: Server,
  },
  {
    label: "Sessões ativas",
    value: "27",
    hint: "últimos 15 min",
    icon: Activity,
  },
] as const

const recentTenants = [
  {
    name: "Acme Corp",
    identifier: "acme",
    status: "Ativo",
    users: 34,
    region: "BR",
  },
  {
    name: "Beta Ltda",
    identifier: "beta",
    status: "Ativo",
    users: 18,
    region: "BR",
  },
  {
    name: "Nova Retail",
    identifier: "nova",
    status: "Provisioning",
    users: 0,
    region: "US",
  },
  {
    name: "Delta Foods",
    identifier: "delta",
    status: "Ativo",
    users: 51,
    region: "BR",
  },
  {
    name: "Echo Media",
    identifier: "echo",
    status: "Ativo",
    users: 9,
    region: "EU",
  },
  {
    name: "Fox Logistics",
    identifier: "fox",
    status: "Inativo",
    users: 4,
    region: "BR",
  },
  {
    name: "Gamma Health",
    identifier: "gamma",
    status: "Ativo",
    users: 72,
    region: "US",
  },
  {
    name: "Helix Soft",
    identifier: "helix",
    status: "Ativo",
    users: 23,
    region: "EU",
  },
  {
    name: "Iris Bank",
    identifier: "iris",
    status: "Provisioning",
    users: 0,
    region: "BR",
  },
  {
    name: "Jade Travel",
    identifier: "jade",
    status: "Ativo",
    users: 41,
    region: "LATAM",
  },
  {
    name: "Kite Sports",
    identifier: "kite",
    status: "Ativo",
    users: 15,
    region: "BR",
  },
  {
    name: "Lumen Energy",
    identifier: "lumen",
    status: "Ativo",
    users: 28,
    region: "EU",
  },
] as const

const activity = [
  { title: "Tenant acme provisionado", time: "Há 2 horas", type: "tenant" },
  {
    title: "Usuário alice@acme.local criado via JIT",
    time: "Há 3 horas",
    type: "user",
  },
  {
    title: "Realm beta atualizado no Keycloak",
    time: "Há 5 horas",
    type: "auth",
  },
  { title: "Tenant delta sincronizado", time: "Ontem", type: "tenant" },
  { title: "Backup do catálogo concluído", time: "Ontem", type: "system" },
  { title: "Usuário bob@delta.local fez login", time: "Ontem", type: "user" },
  {
    title: "Schema Users aplicado em helix",
    time: "Há 2 dias",
    type: "system",
  },
  { title: "Tenant fox desativado", time: "Há 2 dias", type: "tenant" },
  {
    title: "Client minha-api recriado em echo",
    time: "Há 3 dias",
    type: "auth",
  },
  { title: "Health check SQL Server OK", time: "Há 3 dias", type: "system" },
  { title: "Tenant jade provisionado", time: "Há 4 dias", type: "tenant" },
  {
    title: "Usuário carol@jade.local criado via JIT",
    time: "Há 4 dias",
    type: "user",
  },
] as const

const environments = [
  {
    name: "Development",
    api: "http://localhost:5247",
    keycloak: "http://localhost:8080",
    sql: "localhost:1433",
    status: "Online",
  },
  {
    name: "Staging",
    api: "https://api.staging.whitelabel.local",
    keycloak: "https://auth.staging.whitelabel.local",
    sql: "sql-staging.internal",
    status: "Online",
  },
  {
    name: "Production",
    api: "https://api.whitelabel.app",
    keycloak: "https://auth.whitelabel.app",
    sql: "sql-prod.internal",
    status: "Degraded",
  },
] as const

const checklist = [
  "Provisionar tenant cria banco + realm automaticamente",
  "JWT validado por realm do tenant (X-Tenant-Id)",
  "JIT cria User no banco no primeiro login",
  "DELETE /tenants remove realm, banco e catálogo",
  "Sidebar retrátil com tema claro/escuro",
  "Dashboard mock para validar scroll e layout",
  "Connection strings por template no appsettings",
  "CatalogDbContext separado do TenantDbContext",
] as const

const notes = [
  "Cada tenant possui banco SQL dedicado e realm Keycloak próprio. O catálogo whitelabel guarda apenas o mapa de tenants.",
  "A API resolve o tenant pelo header X-Tenant-Id, valida o JWT contra o realm do tenant e faz upsert do usuário no primeiro acesso (JIT).",
  "No frontend, o shell usa sidebar retrátil com tokens de tema (sidebar-*) para light e dark mode.",
  "Este dashboard é propositalmente longo para exercitar o ScrollArea do layout.",
  "Próximos passos: tela de tenants na API, login OIDC por realm e create user orquestrado.",
] as const

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Ativo" || status === "Online"
      ? "success"
      : status === "Provisioning" || status === "Degraded"
        ? "warning"
        : status === "Inativo"
          ? "destructive"
          : "outline"

  return <Badge variant={variant}>{status}</Badge>
}

function ActivityBadge({ type }: { type: string }) {
  const variant =
    type === "tenant"
      ? "info"
      : type === "user"
        ? "success"
        : type === "auth"
          ? "warning"
          : "secondary"

  return <Badge variant={variant}>{type}</Badge>
}

export default function Page() {
  return (
    <ModuleShell title={"Dashboard"} description={"Visão geral do sistema"}>
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
              <CardTitle>Tenants</CardTitle>
              <CardDescription>
                Lista estendida para forçar scroll no painel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTenants.map((tenant) => (
                    <TableRow key={tenant.identifier}>
                      <TableCell className="font-medium">
                        {tenant.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.identifier}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tenant.region}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tenant.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {tenant.users}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4" />
                Atividade
              </CardTitle>
              <CardDescription>Timeline recente do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {activity.map((item) => (
                  <Item
                    key={`${item.title}-${item.time}`}
                    variant="muted"
                    size="sm"
                  >
                    <ItemContent>
                      <ItemTitle className="flex w-full items-center justify-between gap-2">
                        <span className="truncate">{item.title}</span>
                        <ActivityBadge type={item.type} />
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
            <CardTitle>Ambientes</CardTitle>
            <CardDescription>
              Endpoints de referência (mock) da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {environments.map((env) => (
                <Card key={env.name} size="sm" className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{env.name}</CardTitle>
                      <StatusBadge status={env.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground/70">API</p>
                      <p className="mt-0.5 break-all">{env.api}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-medium text-foreground/70">Keycloak</p>
                      <p className="mt-0.5 break-all">{env.keycloak}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-medium text-foreground/70">SQL</p>
                      <p className="mt-0.5 break-all">{env.sql}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle>Checklist da base</CardTitle>
              <CardDescription>
                O que já está no backend / frontend
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
                      <ItemTitle className="whitespace-normal">
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
              <CardTitle>Notas de arquitetura</CardTitle>
              <CardDescription>Resumo rápido para o time</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {notes.map((note) => (
                  <Item key={note} variant="muted" size="sm">
                    <ItemContent>
                      <ItemDescription className="line-clamp-none">
                        {note}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleShell>
  )
}
