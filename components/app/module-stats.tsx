import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type ModuleStat = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

export function ModuleStats({ stats }: { stats: ModuleStat[] }) {
  return (
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
  )
}
