"use client"

import type { ReactNode } from "react"

import { PageHeader } from "@/components/app/page-header"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ModuleShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <Card className="flex flex-1 flex-col p-0">
        <ScrollArea className="flex h-0 grow">
          <div className="p-6">{children}</div>
        </ScrollArea>
      </Card>
    </>
  )
}
