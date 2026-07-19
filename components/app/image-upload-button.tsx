"use client"

import { ImagePlus, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { uploadImage } from "@/lib/api/media"
import { resolveTenantFromPath } from "@/lib/auth/tenant-host"
import { cn } from "@/lib/utils"

type ImageUploadButtonProps = {
  folder?: string
  /** Explicit tenant; falls back to path / session. */
  tenantId?: string | null
  onUploaded: (result: { key: string; publicUrl: string }) => void
  onError?: (message: string) => void
  className?: string
  label?: string
  accept?: string
}

function resolveUploadTenant(
  explicit?: string | null,
  sessionTenant?: string | null
) {
  const fromPath =
    typeof window !== "undefined"
      ? resolveTenantFromPath(window.location.pathname)
      : null
  return (
    explicit?.trim().toLowerCase() ||
    fromPath ||
    sessionTenant?.trim().toLowerCase() ||
    null
  )
}

export function ImageUploadButton({
  folder = "images",
  tenantId: tenantIdProp,
  onUploaded,
  onError,
  className,
  label = "Enviar imagem",
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
}: ImageUploadButtonProps) {
  const { data: session } = useSession()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleChange(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return

    const accessToken = session?.accessToken
    const tenantId = resolveUploadTenant(tenantIdProp, session?.tenant)
    if (!accessToken || !tenantId) {
      const message = "Faça login em uma empresa para enviar imagens."
      toast.error(message)
      onError?.(message)
      return
    }

    setUploading(true)
    try {
      const result = await uploadImage({
        file,
        accessToken,
        tenantId,
        folder,
      })
      onUploaded(result)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao enviar imagem."
      toast.error(message)
      onError?.(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("inline-flex", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => void handleChange(event.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {uploading ? "Enviando…" : label}
      </Button>
    </div>
  )
}
