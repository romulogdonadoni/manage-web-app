"use client"

import * as React from "react"

import type { CurrentTenantDto } from "@/lib/api/types"

type CurrentStoreValue = {
  data: CurrentTenantDto | null
  setData: (data: CurrentTenantDto | null) => void
  refresh: () => Promise<void>
  setRefreshHandler: (handler: (() => Promise<void>) | null) => void
}

const CurrentStoreContext = React.createContext<CurrentStoreValue | null>(null)

export function CurrentStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [data, setData] = React.useState<CurrentTenantDto | null>(null)
  const refreshRef = React.useRef<(() => Promise<void>) | null>(null)

  const value = React.useMemo<CurrentStoreValue>(
    () => ({
      data,
      setData,
      refresh: async () => {
        await refreshRef.current?.()
      },
      setRefreshHandler: (handler) => {
        refreshRef.current = handler
      },
    }),
    [data]
  )

  return (
    <CurrentStoreContext.Provider value={value}>
      {children}
    </CurrentStoreContext.Provider>
  )
}

export function useCurrentStore() {
  const ctx = React.useContext(CurrentStoreContext)
  if (!ctx) {
    throw new Error("useCurrentStore must be used within CurrentStoreProvider")
  }
  return ctx
}
