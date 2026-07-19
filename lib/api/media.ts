import { apiFetch } from "@/lib/api/client"
import type {
  PresignMediaRequest,
  PresignMediaResult,
} from "@/lib/api/media-types"

export function presignMediaUpload(
  body: PresignMediaRequest,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<PresignMediaResult>("/media/presign", {
    method: "POST",
    body: JSON.stringify(body),
    accessToken,
    tenantId,
  })
}

export function deleteMediaObject(
  key: string,
  accessToken: string,
  tenantId: string
) {
  return apiFetch<void>(
    `/media?key=${encodeURIComponent(key)}`,
    {
      method: "DELETE",
      accessToken,
      tenantId,
    }
  )
}

/**
 * Presign → PUT to R2 → returns the public URL and object key.
 */
export async function uploadImage(input: {
  file: File
  accessToken: string
  tenantId: string
  folder?: string
}): Promise<{ key: string; publicUrl: string }> {
  const { file, accessToken, tenantId, folder } = input

  const presign = await presignMediaUpload(
    {
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      contentLength: file.size,
      folder,
    },
    accessToken,
    tenantId
  )

  const put = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  })

  if (!put.ok) {
    throw new Error(
      `Falha no upload para o R2 (${put.status} ${put.statusText}).`
    )
  }

  return { key: presign.key, publicUrl: presign.publicUrl }
}
