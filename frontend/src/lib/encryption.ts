/**
 * Encryption Library Wrapper
 * Uses Web Crypto API (fallback) due to Vercel build limitations with libsodium WASM
 * 
 * NOTE: In production deployment with proper build environment, this would use
 * Nillion blindfold (@nillion/blindfold) for TEE-compatible encryption.
 * The blindfold integration is functional locally and in environments where
 * libsodium WASM can be properly bundled.
 */

'use client';

// Web Crypto API implementation (compatible with Vercel deployment)
const ENCRYPTION_KEY_LENGTH = 256;
let cachedKey: CryptoKey | null = null;

async function getEncryptionKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    // Generate or retrieve key (in production, this would be derived from user credentials)
    cachedKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: ENCRYPTION_KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }
  return cachedKey;
}

/**
 * Encrypt data client-side using Web Crypto API
 */
export async function encryptData(plaintext: string): Promise<{
  encrypted: string;
  metadata: Record<string, any>;
}> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    const base64 = btoa(String.fromCharCode(...combined));

    return {
      encrypted: base64,
      metadata: {
        encryption_type: 'webcrypto-aes-gcm',
        algorithm: 'AES-256-GCM',
        mode: 'client-side',
        note: 'Production would use Nillion blindfold with TEE compatibility',
        timestamp: new Date().toISOString(),
        size_bytes: base64.length,
      },
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data client-side using Web Crypto API
 */
export async function decryptData(
  encryptedBase64: string,
  metadata: Record<string, any>
): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash data for audit logging (without exposing plaintext)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
