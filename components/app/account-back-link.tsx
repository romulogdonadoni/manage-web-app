import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type AccountBackLinkProps = {
  href?: string
  label?: string
  className?: string
}

export function AccountBackLink({
  href = "/account",
  label = "Conta",
  className,
}: AccountBackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Link>
  )
}
