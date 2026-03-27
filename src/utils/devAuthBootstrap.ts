/**
 * Developer Edition: bootstrap auth from URL before the Vue app mounts.
 *
 * - Fragment `#access_token=...&expires_at=...&roles=a,b` persists to localStorage (keys match SPA useAuth).
 * - Query `?dev_logout=1` clears auth storage (used by welcome-page logout iframes).
 *
 * Parsing avoids `URLSearchParams` on the raw fragment: the x-www-form-urlencoded rule that treats
 * `+` as space breaks ISO-8601 offsets (e.g. `...+00:00`) after the browser decodes `%2B` to `+`.
 */
const LS_ACCESS = 'access_token'
const LS_EXPIRES = 'token_expires_at'
const LS_ROLES = 'user_roles'

export function clearDevAuthLocalStorage(): void {
  localStorage.removeItem(LS_ACCESS)
  localStorage.removeItem(LS_EXPIRES)
  localStorage.removeItem(LS_ROLES)
}

function tryDecodeURIComponent(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

/** Split `a=b&c=d` on `&`, then split each pair on the first `=` only (JWT values may contain `=` padding). */
function parseAuthHashParams(raw: string): Map<string, string> {
  const map = new Map<string, string>()
  if (!raw) return map
  for (const segment of raw.split('&')) {
    if (!segment) continue
    const eq = segment.indexOf('=')
    if (eq <= 0) continue
    const encKey = segment.slice(0, eq)
    const encVal = segment.slice(eq + 1)
    map.set(tryDecodeURIComponent(encKey), tryDecodeURIComponent(encVal))
  }
  return map
}

function stripDevLogoutQuery(): void {
  const url = new URL(window.location.href)
  if (url.searchParams.get('dev_logout') !== '1') return
  url.searchParams.delete('dev_logout')
  const q = url.searchParams.toString()
  const path = url.pathname + (q ? `?${q}` : '') + url.hash
  window.history.replaceState(null, '', path)
}

function applyHashToken(): void {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw || !raw.includes('access_token=')) return

  const params = parseAuthHashParams(raw)
  const token = params.get('access_token')
  const expiresAt = params.get('expires_at')
  if (!token || !expiresAt) return

  localStorage.setItem(LS_ACCESS, token)
  localStorage.setItem(LS_EXPIRES, expiresAt)
  const roles = params.get('roles')
  if (roles) {
    const list = roles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
    localStorage.setItem(LS_ROLES, JSON.stringify(list))
  }

  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

/**
 * Run once at SPA entry (import before router). Idempotent for normal navigations.
 */
export function bootstrapDevAuthFromUrl(): void {
  if (typeof window === 'undefined' || !window.localStorage) return

  if (window.location.search.includes('dev_logout=1')) {
    clearDevAuthLocalStorage()
    stripDevLogoutQuery()
    return
  }

  applyHashToken()
}
