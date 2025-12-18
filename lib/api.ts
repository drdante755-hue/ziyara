export type ApiRequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: any
  credentials?: RequestCredentials
}

export function getApiBaseUrl(): string | null {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL as string
  }
  if (typeof window !== "undefined") {
    const fromWindow = (window as any).NEXT_PUBLIC_API_BASE_URL
    if (fromWindow && typeof fromWindow === "string") return fromWindow
  }

  // Fallback to current domain if running in browser
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return null
}

export async function apiFetch<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error("API base URL is not configured: set NEXT_PUBLIC_API_BASE_URL")
  }

  // If path starts with / or is absolute, use as-is; otherwise prepend /
  let url: string
  if (path.startsWith("http")) {
    url = path
  } else {
    const cleanBaseUrl = baseUrl.replace(/\/$/, "")
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    url = `${cleanBaseUrl}${cleanPath}`
  }

  console.log("[v0] API Request:", { method: options.method || "GET", url })

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  // Safely stringify body to handle Arabic text
  let safeBody: string | undefined
  if (options.body) {
    safeBody = JSON.stringify(options.body)
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: safeBody,
    credentials: options.credentials || "include",
  })

  const contentType = response.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  let data: any
  if (isJson) {
    const text = await response.text()
    data = JSON.parse(text)
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed with ${response.status}`
    const err = new Error(message) as any
    err.status = response.status
    err.data = data
    throw err
  }

  return data as T
}
