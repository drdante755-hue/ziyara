/**
 * Wrapper around fetch with error handling and JSON parsing
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns The parsed JSON response
 * @throws Error with message from API or generic error
 */
export async function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    // Try to parse JSON response
    let data: T | { message?: string; error?: string } | null = null
    const contentType = response.headers.get("content-type")

    if (contentType?.includes("application/json")) {
      data = await response.json()
    }

    if (!response.ok) {
      // Extract error message from response or use status text
      const errorMessage =
        (data &&
          typeof data === "object" &&
          ("message" in data ? data.message : "error" in data ? data.error : null)) ||
        response.statusText ||
        "حدث خطأ في الاتصال بالخادم"
      throw new Error(errorMessage)
    }

    return data as T
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("حدث خطأ غير متوقع")
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(url, { ...options, method: "GET" })
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(url, { ...options, method: "DELETE" })
}
