"use client"

import { Store } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

import { ImageUploadButton } from "@/components/app/image-upload-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateTenantLogo } from "@/lib/api/tenants"
import { resolveTenantFromPath } from "@/lib/auth/tenant-host"
import { useCurrentStore } from "@/lib/store/current-store-context"

function resolveManagedTenant(
  storeIdentifier?: string | null,
  sessionTenant?: string | null
) {
  const fromPath =
    typeof window !== "undefined"
      ? resolveTenantFromPath(window.location.pathname)
      : null
  return (
    storeIdentifier?.trim().toLowerCase() ||
    fromPath ||
    sessionTenant?.trim().toLowerCase() ||
    null
  )
}

export function StoreProfileCard() {
  const { data: session } = useSession()
  const { data: store, refresh } = useCurrentStore()
  const [busy, setBusy] = useState(false)

  const accessToken = session?.accessToken
  const tenantId = resolveManagedTenant(store?.identifier, session?.tenant)
  const logoUrl = store?.logoUrl
  const storeName = store?.name || "Empresa"
  const storeSlug = tenantId || ""

  async function saveLogo(publicUrl: string) {
    if (!accessToken || !tenantId) {
      toast.error("Sessão inválida.")
      return
    }
    setBusy(true)
    try {
      await updateTenantLogo(publicUrl, accessToken, tenantId)
      await refresh()
      toast.success("Logo atualizada.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar logo.")
    } finally {
      setBusy(false)
    }
  }

  async function clearLogo() {
    if (!accessToken || !tenantId) return
    setBusy(true)
    try {
      await updateTenantLogo(null, accessToken, tenantId)
      await refresh()
      toast.success("Logo removida.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover logo.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card size="sm" className="shadow-none">
      <CardHeader>
        <CardTitle>Logo da loja</CardTitle>
        <CardDescription>
          Identidade visual desta empresa (path{" "}
          <code>/{storeSlug}</code>)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-muted">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <Store className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Store className="size-3.5 text-muted-foreground" />
              {storeName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Aparece no sidebar e na lista de empresas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <ImageUploadButton
            folder="logos"
            tenantId={tenantId}
            label={busy ? "Salvando…" : "Trocar logo"}
            onUploaded={({ publicUrl }) => void saveLogo(publicUrl)}
          />
          {logoUrl ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => void clearLogo()}
            >
              Remover
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
