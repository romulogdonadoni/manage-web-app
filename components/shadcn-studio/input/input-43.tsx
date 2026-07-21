"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
  type NumberFieldProps,
} from "react-aria-components"

import { cn } from "@/lib/utils"

export type Input43Props = Omit<NumberFieldProps, "children"> & {
  label?: string
  className?: string
}

/**
 * Input with plus/minus buttons (rounded) — @ss-components/input-43 / React Aria NumberField.
 */
export function Input43({ label, className, ...props }: Input43Props) {
  return (
    <NumberField {...props} className={cn("w-full space-y-2", className)}>
      {label ? (
        <Label className="flex items-center gap-2 text-sm leading-none font-medium select-none">
          {label}
        </Label>
      ) : null}
      <Group className="border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-focus-within:has-aria-invalid:ring-destructive/40 relative inline-flex h-8 w-full min-w-0 items-center overflow-hidden rounded-lg border bg-transparent text-base whitespace-nowrap transition-colors outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-3 md:text-sm">
        <Button
          slot="decrement"
          className="border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground ml-2 flex aspect-square h-5 items-center justify-center rounded-sm border text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusIcon className="size-3" />
          <span className="sr-only">Diminuir</span>
        </Button>
        <Input className="selection:bg-primary selection:text-primary-foreground w-full grow px-2.5 py-1 text-center tabular-nums outline-none" />
        <Button
          slot="increment"
          className="border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground mr-2 flex aspect-square h-5 items-center justify-center rounded-sm border text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="size-3" />
          <span className="sr-only">Aumentar</span>
        </Button>
      </Group>
    </NumberField>
  )
}

export default Input43
