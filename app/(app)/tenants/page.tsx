import { ModuleShell } from "@/components/app/module-shell"
import { Building2, Database, KeyRound, Users } from "lucide-react"

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
  ItemTitle,
} from "@/components/ui/item"

const stats = [
  {
    label: "Tenants",
    value: "12",
    hint: "Catálogo whitelabel",
    icon: Building2,
  },
  {
    label: "Usuários",
    value: "148",
    hint: "JIT por realm",
    icon: Users,
  },
  {
    label: "Realms",
    value: "12",
    hint: "1 por tenant",
    icon: KeyRound,
  },
  {
    label: "Bancos",
    value: "13",
    hint: "1 catálogo + 12",
    icon: Database,
  },
] as const

export default function TenantsPage() {
  return (
    <ModuleShell title={"Tenants"} description={"Gestão de tenants"}>
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

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Gestão de tenants</CardTitle>
            <Badge variant="warning">Em breve</Badge>
          </div>
          <CardDescription>
            Listagem e provisionamento na API multi-tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-2">
            {[
              "Conectar GET /tenants e POST /tenants",
              "Exibir status de provisioning e realm",
              "Ações de delete com confirmação",
            ].map((item) => (
              <Item key={item} variant="muted" size="sm">
                <ItemContent>
                  <ItemTitle className="whitespace-normal">{item}</ItemTitle>
                  <ItemDescription>Placeholder do módulo</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
    </ModuleShell>
  )
}
