"use client"

import { ImageIcon, Store } from "lucide-react"
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
import { updateTenantBanner, updateTenantLogo } from "@/lib/api/tenants"
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
  const [busyLogo, setBusyLogo] = useState(false)
  const [busyBanner, setBusyBanner] = useState(false)

  const accessToken = session?.accessToken
  const tenantId = resolveManagedTenant(store?.identifier, session?.tenant)
  const logoUrl = store?.logoUrl
  const bannerUrl = store?.bannerUrl
  const storeName = store?.name || "Empresa"
  const storeSlug = tenantId || ""

  async function saveLogo(publicUrl: string) {
    if (!accessToken || !tenantId) {
      toast.error("Sessão inválida.")
      return
    }
    setBusyLogo(true)
    try {
      await updateTenantLogo(publicUrl, accessToken, tenantId)
      await refresh()
      toast.success("Logo atualizada.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar logo.")
    } finally {
      setBusyLogo(false)
    }
  }

  async function clearLogo() {
    if (!accessToken || !tenantId) return
    setBusyLogo(true)
    try {
      await updateTenantLogo(null, accessToken, tenantId)
      await refresh()
      toast.success("Logo removida.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover logo.")
    } finally {
      setBusyLogo(false)
    }
  }

  async function saveBanner(publicUrl: string) {
    if (!accessToken || !tenantId) {
      toast.error("Sessão inválida.")
      return
    }
    setBusyBanner(true)
    try {
      await updateTenantBanner(publicUrl, accessToken, tenantId)
      await refresh()
      toast.success("Banner atualizado.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao salvar banner."
      )
    } finally {
      setBusyBanner(false)
    }
  }

  async function clearBanner() {
    if (!accessToken || !tenantId) return
    setBusyBanner(true)
    try {
      await updateTenantBanner(null, accessToken, tenantId)
      await refresh()
      toast.success("Banner removido.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao remover banner."
      )
    } finally {
      setBusyBanner(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
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
                Aparece no sidebar, lista de empresas e app de pedidos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ImageUploadButton
              folder="logos"
              tenantId={tenantId}
              label={busyLogo ? "Salvando…" : "Trocar logo"}
              onUploaded={({ publicUrl }) => void saveLogo(publicUrl)}
            />
            {logoUrl ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busyLogo}
                onClick={() => void clearLogo()}
              >
                Remover
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-none">
        <CardHeader>
          <CardTitle>Banner da loja</CardTitle>
          <CardDescription>
            Imagem de capa exibida no app de pedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative flex min-h-24 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
                <ImageIcon className="size-6" />
                <p className="text-xs">Nenhum banner</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <ImageUploadButton
              folder="banners"
              tenantId={tenantId}
              label={busyBanner ? "Salvando…" : "Trocar banner"}
              onUploaded={({ publicUrl }) => void saveBanner(publicUrl)}
            />
            {bannerUrl ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busyBanner}
                onClick={() => void clearBanner()}
              >
                Remover
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
