import { ModuleShell } from "@/components/app/module-shell"
import { Mail, Shield, UserCheck, UserPlus, Users } from "lucide-react"

import { ModuleStats } from "@/components/app/module-stats"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
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
    label: "Usuários ativos",
    value: "24",
    hint: "3 convites pendentes",
    icon: Users,
  },
  {
    label: "Administradores",
    value: "4",
    hint: "Acesso total ao tenant",
    icon: Shield,
  },
  {
    label: "Operadores",
    value: "16",
    hint: "PDV e cozinha",
    icon: UserCheck,
  },
  {
    label: "Convites enviados",
    value: "7",
    hint: "Últimos 30 dias",
    icon: UserPlus,
  },
]

const users = [
  {
    name: "Marina Costa",
    email: "marina@acme.com.br",
    role: "Admin",
    lastAccess: "Há 5 min",
    status: "Ativo",
  },
  {
    name: "Rafael Mendes",
    email: "rafael@acme.com.br",
    role: "Gerente",
    lastAccess: "Há 1 h",
    status: "Ativo",
  },
  {
    name: "Juliana Pires",
    email: "juliana@acme.com.br",
    role: "Operador",
    lastAccess: "Há 20 min",
    status: "Ativo",
  },
  {
    name: "Thiago Alves",
    email: "thiago@acme.com.br",
    role: "Operador",
    lastAccess: "Ontem",
    status: "Ativo",
  },
  {
    name: "Camila Rocha",
    email: "camila@acme.com.br",
    role: "Financeiro",
    lastAccess: "Há 3 h",
    status: "Ativo",
  },
  {
    name: "Pedro Nunes",
    email: "pedro@acme.com.br",
    role: "Operador",
    lastAccess: "Há 2 dias",
    status: "Inativo",
  },
] as const

const invites = [
  {
    email: "lucas.silva@acme.com.br",
    role: "Operador",
    sentAt: "Há 2 h",
    expiresIn: "5 dias",
  },
  {
    email: "fernanda.lima@acme.com.br",
    role: "Gerente",
    sentAt: "Ontem",
    expiresIn: "6 dias",
  },
  {
    email: "gustavo.ferreira@acme.com.br",
    role: "Financeiro",
    sentAt: "Há 3 dias",
    expiresIn: "4 dias",
  },
] as const

function RoleBadge({ role }: { role: string }) {
  const variant =
    role === "Admin"
      ? "default"
      : role === "Gerente"
        ? "info"
        : role === "Financeiro"
          ? "warning"
          : "secondary"

  return <Badge variant={variant}>{role}</Badge>
}

export default function UsersPage() {
  return (
    <ModuleShell
      title={"Usuários"}
      description={"Contas, roles e acesso do realm"}
    >
      <div className="flex flex-col gap-6">
        <ModuleStats stats={stats} />

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>Equipe</CardTitle>
                  <CardDescription>
                    Usuários com acesso ao tenant
                  </CardDescription>
                </div>
                <Button size="sm">
                  <UserPlus className="size-4" />
                  Convidar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Último acesso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastAccess}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "Ativo" ? "success" : "outline"
                          }
                        >
                          {user.status}
                        </Badge>
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
                <Mail className="size-4" />
                Convites pendentes
              </CardTitle>
              <CardDescription>Aguardando aceite por e-mail</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="gap-2">
                {invites.map((invite) => (
                  <Item key={invite.email} variant="muted" size="sm">
                    <ItemMedia variant="icon">
                      <Mail className="size-4 text-muted-foreground" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="truncate">{invite.email}</ItemTitle>
                      <ItemDescription>
                        Enviado {invite.sentAt} · expira em {invite.expiresIn}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <RoleBadge role={invite.role} />
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
              <Button size="sm" variant="outline" className="mt-4 w-full">
                Reenviar todos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleShell>
  )
}
