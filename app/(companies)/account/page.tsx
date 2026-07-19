import { CreditCard, Mail, UserRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const links = [
  {
    href: "/account/billing",
    title: "Assinatura e planos",
    description: "Plano SaaS global e módulos contratados.",
    action: "Abrir assinatura",
    icon: CreditCard,
  },
  {
    href: "/account/profile",
    title: "Meu perfil",
    description: "Foto, nome e sobrenome da conta.",
    action: "Abrir perfil",
    icon: UserRound,
  },
  {
    href: "/account/invitations",
    title: "Convites",
    description: "Recebidos e enviados.",
    action: "Abrir convites",
    icon: Mail,
  },
] as const

export default function AccountPage() {
  return (
    <>
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Conta
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Configurações gerais
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Preferências da conta WhiteLabel. Assinatura e planos valem para toda
          a organização, não por empresa.
        </p>
      </div>

      <div className="grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, title, description, action, icon: Icon }) => (
          <Card key={href} size="sm" className="shadow-none">
            <CardHeader className="gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-3.5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {description}
              </CardDescription>
              <Button
                className="mt-2 w-fit"
                size="sm"
                nativeButton={false}
                render={<Link href={href} />}
              >
                {action}
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  )
}
