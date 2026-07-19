export type PresignMediaRequest = {
  fileName: string
  contentType: string
  folder?: string
  contentLength?: number
}

export type PresignMediaResult = {
  key: string
  uploadUrl: string
  publicUrl: string
  expiresAtUtc: string
}
