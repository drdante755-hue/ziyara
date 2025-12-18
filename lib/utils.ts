import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for handling Arabic text in crypto operations
export function safeStringEncode(str: string): string {
  try {
    // For URLs and cookies, use encodeURIComponent
    return encodeURIComponent(str)
  } catch (error) {
    console.warn('String encoding failed:', error)
    return str
  }
}

export function safeStringDecode(str: string): string {
  try {
    // For URLs and cookies, use decodeURIComponent
    return decodeURIComponent(str)
  } catch (error) {
    console.warn('String decoding failed:', error)
    return str
  }
}

// Safe base64 encoding for Arabic text
export function safeBase64Encode(str: string): string {
  try {
    // Use escape/unescape for better Arabic support
    return btoa(unescape(encodeURIComponent(str)))
  } catch (error) {
    console.warn('Base64 encoding failed:', error)
    return str
  }
}

// Safe base64 decoding for Arabic text
export function safeBase64Decode(str: string): string {
  try {
    // Use escape/unescape for better Arabic support
    return decodeURIComponent(escape(atob(str)))
  } catch (error) {
    console.warn('Base64 decoding failed:', error)
    return str
  }
}

// Safe hash generation for Arabic text
export async function safeHash(text: string): Promise<string> {
  try {
    // Use escape/unescape for better Arabic support
    const escapedText = escape(text)
    const encoder = new TextEncoder()
    const data = encoder.encode(escapedText)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  } catch (error) {
    console.warn('Hash generation failed:', error)
    // Fallback to simple hash
    return text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0).toString()
  }
}

// Safe cookie value encoding
export function safeCookieValue(value: string): string {
  try {
    // Ensure the value is safe for cookies
    return encodeURIComponent(value).replace(/[()]/g, escape)
  } catch (error) {
    console.warn('Cookie value encoding failed:', error)
    return value
  }
}

// Safe cookie value decoding
export function safeCookieDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/[()]/g, unescape))
  } catch (error) {
    console.warn('Cookie value decoding failed:', error)
    return value
  }
}
