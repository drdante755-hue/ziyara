// Type definitions for crypto operations

declare global {
  interface Window {
    crypto: Crypto;
  }
  
  var crypto: Crypto;
  
  interface Crypto {
    subtle: SubtleCrypto;
    getRandomValues: (array: Uint8Array) => Uint8Array;
  }
  
  interface SubtleCrypto {
    digest: (algorithm: string, data: Uint8Array) => Promise<ArrayBuffer>;
    encrypt: (algorithm: string, key: CryptoKey, data: Uint8Array) => Promise<ArrayBuffer>;
    decrypt: (algorithm: string, key: CryptoKey, data: ArrayBuffer) => Promise<ArrayBuffer>;
  }
}

export {};
