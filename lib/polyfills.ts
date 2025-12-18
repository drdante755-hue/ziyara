// Polyfills for better Arabic text support in crypto operations

// Polyfill for TextEncoder if not available
if (typeof TextEncoder === 'undefined') {
  (global as any).TextEncoder = require('text-encoding').TextEncoder;
}

// Polyfill for TextDecoder if not available
if (typeof TextDecoder === 'undefined') {
  (global as any).TextDecoder = require('text-encoding').TextDecoder;
}

// Polyfill for crypto if not available
if (typeof crypto === 'undefined') {
  (global as any).crypto = require('crypto');
}

// Polyfill / patch for btoa/atob to safely handle Unicode (Arabic) characters.
// Some libraries (and Next internals) call `btoa` expecting ASCII; when passed
// Unicode characters (char codes > 255) browsers throw the ByteString error.
// We wrap the native functions and fall back to UTF-8/Base64 via Buffer or
// encodeURIComponent/unescape where appropriate.
try {
  const globalAny: any = globalThis as any
  const nativeBtoa = typeof globalAny.btoa === 'function' ? globalAny.btoa : undefined
  const nativeAtob = typeof globalAny.atob === 'function' ? globalAny.atob : undefined

  globalAny.btoa = function (input: string) {
    if (typeof input !== 'string') input = String(input)
    // Try native first (fast path)
    try {
      if (nativeBtoa) return nativeBtoa(input)
      if (typeof Buffer !== 'undefined') return Buffer.from(input, 'utf8').toString('base64')
    } catch (err) {
      // native btoa failed (likely due to non-Latin1 chars) - fall back
      if (typeof Buffer !== 'undefined') return Buffer.from(input, 'utf8').toString('base64')
      // browser fallback: encode as UTF-8 bytes then btoa
      return nativeBtoa ? nativeBtoa(unescape(encodeURIComponent(input))) : ''
    }
    return ''
  }

  globalAny.atob = function (input: string) {
    if (typeof input !== 'string') input = String(input)
    try {
      if (nativeAtob) return nativeAtob(input)
      if (typeof Buffer !== 'undefined') return Buffer.from(input, 'base64').toString('utf8')
    } catch (err) {
      if (typeof Buffer !== 'undefined') return Buffer.from(input, 'base64').toString('utf8')
      return nativeAtob ? decodeURIComponent(escape(nativeAtob(input))) : ''
    }
    return ''
  }
} catch (e) {
  // If anything goes wrong here, don't crash startup; leave globals untouched.
  console.warn('Failed to install safe btoa/atob polyfills:', e)
}

// Safe string encoding for Arabic text
export function safeEncodeString(str: string): string {
  try {
    // Use escape/unescape for better Arabic support
    return escape(str);
  } catch (error) {
    console.warn('String encoding failed:', error);
    return str;
  }
}

// Safe string decoding for Arabic text
export function safeDecodeString(str: string): string {
  try {
    // Use escape/unescape for better Arabic support
    return unescape(str);
  } catch (error) {
    console.warn('String decoding failed:', error);
    return str;
  }
}

// Safe base64 encoding for Arabic text
export function safeBase64Encode(str: string): string {
  try {
    // Use escape/unescape for better Arabic support
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.warn('Base64 encoding failed:', error);
    return str;
  }
}

// Safe base64 decoding for Arabic text
export function safeBase64Decode(str: string): string {
  try {
    // Use escape/unescape for better Arabic support
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.warn('Base64 decoding failed:', error);
    return str;
  }
}
