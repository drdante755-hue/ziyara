/**
 * Gets the API base URL from environment variables
 * @returns The API base URL or empty string if not configured
 */
export function getApiBaseUrl(): string {
  // Check for environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || ""
  return apiUrl
}

/**
 * Gets the app base URL
 * @returns The app base URL
 */
export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || ""
}

/**
 * Configuration object for the app
 */
export const config = {
  api: {
    baseUrl: getApiBaseUrl(),
    timeout: 30000,
  },
  app: {
    name: "Ziyara",
    defaultLocale: "ar",
  },
} as const

export default config
