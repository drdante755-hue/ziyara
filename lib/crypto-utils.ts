// Crypto utilities for handling Arabic text safely

/**
 * Safely encode text for use in cryptographic operations
 * This prevents the "Cannot convert argument to a ByteString" error
 */
export function safeEncodeForCrypto(text: string): Uint8Array {
  try {
    // Use escape/unescape for better Arabic support
    const escaped = escape(text)
    const encoder = new TextEncoder()
    return encoder.encode(escaped)
  } catch (error) {
    console.warn('Text encoding failed:', error)
    // Fallback: convert to ASCII-safe string
    try {
      return new TextEncoder().encode(text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    } catch (fallbackError) {
      console.warn('Fallback encoding failed:', fallbackError)
      return new TextEncoder().encode(text)
    }
  }
}

/**
 * Safely decode text from cryptographic operations
 */
export function safeDecodeFromCrypto(bytes: Uint8Array): string {
  try {
    const decoder = new TextDecoder()
    const decoded = decoder.decode(bytes)
    // Try to unescape if it was escaped
    try {
      return unescape(decoded)
    } catch (unescapeError) {
      return decoded
    }
  } catch (error) {
    console.warn('Text decoding failed:', error)
    // Fallback: convert bytes to string
    try {
      const charArray = Array.from(bytes).map(byte => String.fromCharCode(byte))
      return charArray.join('')
    } catch (fallbackError) {
      console.warn('Fallback decoding failed:', fallbackError)
      return bytes.toString()
    }
  }
}

/**
 * Generate a safe hash for Arabic text
 */
export async function generateSafeHash(text: string): Promise<string> {
  try {
    const data = safeEncodeForCrypto(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.warn('Hash generation failed:', error)
    // Fallback hash
    return text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0).toString(16)
  }
}

/**
 * Safe base64 encoding for Arabic text
 */
export function safeBase64Encode(text: string): string {
  try {
    const data = safeEncodeForCrypto(text)
    // Convert Uint8Array to string safely
    const charArray = Array.from(data).map(byte => String.fromCharCode(byte))
    return btoa(charArray.join(''))
  } catch (error) {
    console.warn('Base64 encoding failed:', error)
    // Fallback: encode as UTF-8 string
    try {
      return btoa(unescape(encodeURIComponent(text)))
    } catch (fallbackError) {
      console.warn('Fallback encoding failed:', fallbackError)
      return text
    }
  }
}

/**
 * Safe base64 decoding for Arabic text
 */
export function safeBase64Decode(base64: string): string {
  try {
    const decoded = atob(base64)
    // Try to decode as UTF-8
    try {
      return decodeURIComponent(escape(decoded))
    } catch (utf8Error) {
      // Fallback: decode as raw bytes
      const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0))
      return safeDecodeFromCrypto(bytes)
    }
  } catch (error) {
    console.warn('Base64 decoding failed:', error)
    return base64
  }
}

/**
 * Safe URL encoding for Arabic text
 */
export function safeUrlEncode(text: string): string {
  try {
    return encodeURIComponent(text)
  } catch (error) {
    console.warn('URL encoding failed:', error)
    return text
  }
}

/**
 * Safe URL decoding for Arabic text
 */
export function safeUrlDecode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch (error) {
    console.warn('URL decoding failed:', error)
    return text
  }
}

/**
 * Generate a numeric code safely
 */
export function generateNumericCode(length = 6): string {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }
  return code
}

/**
 * Safe string serialization for JSON
 */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON stringify failed:', error)
    // Fallback: convert to safe string
    return JSON.stringify({
      error: 'Serialization failed',
      original: String(obj)
    })
  }
}

/**
 * Safe string parsing for JSON
 */
export function safeParse(text: string): any {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.warn('JSON parse failed:', error)
    return {}
  }
}
