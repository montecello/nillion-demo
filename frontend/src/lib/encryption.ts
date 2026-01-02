/**
 * Nillion Blindfold Encryption
 * Uses @nillion/blindfold for client-side TEE-compatible encryption
 */

'use client';

import { SecretKey, encrypt, decrypt } from '@nillion/blindfold';

// Generate secret key for single-node cluster (demo)
// In production, this would be configured for multi-node TEE cluster
let secretKey: SecretKey | null = null;

async function getSecretKey(): Promise<SecretKey> {
  if (!secretKey) {
    const cluster = { nodes: [{}] }; // Single node for demo
    secretKey = await SecretKey.generate(cluster);
  }
  return secretKey;
}

/**
 * Encrypt data client-side using Nillion blindfold
 */
export async function encryptData(plaintext: string): Promise<{
  encrypted: string;
  metadata: Record<string, any>;
}> {
  try {
    const key = await getSecretKey();
    const ciphertext = await encrypt(key, plaintext);

    // Convert to base64 for JSON serialization
    const base64 = typeof ciphertext === 'string' 
      ? ciphertext 
      : btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

    return {
      encrypted: base64,
      metadata: {
        encryption_type: 'nillion-blindfold',
        algorithm: 'XSalsa20-Poly1305',
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
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Nillion blindfold encryption error:', error);
    throw new Error('Failed to encrypt data with blindfold');
  }
}

/**
 * Decrypt data client-side using Nillion blindfold
 */
export async function decryptData(
  encryptedBase64: string,
  metadata: Record<string, any>
): Promise<string> {
  try {
    const key = await getSecretKey();
    
    // Decode from base64
    const ciphertext = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    const plaintext = await decrypt(key, ciphertext);

    return plaintext;
  } catch (error) {
    console.error('Nillion blindfold decryption error:', error);
    throw new Error('Failed to decrypt data with blindfold');
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