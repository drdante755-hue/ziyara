// Client-side session management utilities

const SESSION_KEY = "ziyara_session"
const SESSION_EXPIRY_KEY = "ziyara_session_expiry"

// Session duration: 7 days in milliseconds
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000

export interface SessionData {
  isAuthenticated: boolean
  timestamp: number
}

/**
 * Sets a client-side session indicator
 * This is used to track that the user has completed verification
 */
export function setClientSession(): void {
  if (typeof window === "undefined") return

  const expiry = Date.now() + SESSION_DURATION

  localStorage.setItem(SESSION_KEY, "true")
  localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString())

  // Also set a cookie for server-side checks
  document.cookie = `${SESSION_KEY}=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
}

/**
 * Checks if a valid client session exists
 */
export function hasClientSession(): boolean {
  if (typeof window === "undefined") return false

  const session = localStorage.getItem(SESSION_KEY)
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)

  if (!session || !expiry) return false

  // Check if session has expired
  if (Date.now() > Number.parseInt(expiry, 10)) {
    clearClientSession()
    return false
  }

  return session === "true"
}

/**
 * Clears the client session (logout)
 */
export function clearClientSession(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_EXPIRY_KEY)

  // Clear the cookie as well
  document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

/**
 * Gets session data if exists
 */
export function getSessionData(): SessionData | null {
  if (typeof window === "undefined") return null

  if (!hasClientSession()) return null

  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)

  return {
    isAuthenticated: true,
    timestamp: expiry ? Number.parseInt(expiry, 10) - SESSION_DURATION : Date.now(),
  }
}

/**
 * Refreshes the session expiry time
 */
export function refreshSession(): void {
  if (typeof window === "undefined") return

  if (hasClientSession()) {
    const expiry = Date.now() + SESSION_DURATION
    localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString())
    document.cookie = `${SESSION_KEY}=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }
}
