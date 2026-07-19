export const SIDEBAR_COLLAPSED_KEY = "whitelabel.sidebar.collapsed"

export function isSidebarCollapsedValue(value: string | null | undefined) {
  return value === "true"
}

/** Persist for SSR (cookie) and client reloads (localStorage). */
export function persistSidebarCollapsed(collapsed: boolean) {
  const value = String(collapsed)
  window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value)
  document.cookie = `${SIDEBAR_COLLAPSED_KEY}=${value}; path=/; max-age=31536000; SameSite=Lax`
}
