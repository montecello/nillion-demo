/**
 * Encryption Library Wrapper
 * Uses Nillion blindfold for client-side encryption
 */

import * as blindfold from '@nillion/blindfold';

// Initialize blindfold key (single-node for demo)
let encryptionKey: any = null;

async function initializeKey() {
  if (!encryptionKey) {
    const cluster = { nodes: [{}] };
    encryptionKey = await blindfold.SecretKey.generate(cluster, { store: true });
  }
  return encryptionKey;
}

/**
 * Encrypt data client-side using Nillion blindfold
 */
export async function encryptData(plaintext: string): Promise<{
  encrypted: string;
  metadata: Record<string, any>;
}> {
  try {
    // Initialize blindfold key
    const key = await initializeKey();

    // Encrypt string using blindfold
    const encryptedData = await blindfold.encrypt(key, plaintext);
    
    // Convert to base64 string
    const base64 = typeof encryptedData === 'string' 
      ? encryptedData 
      : JSON.stringify(encryptedData);

    return {
      encrypted: base64,
      metadata: {
        encryption_type: 'blindfold',
        algorithm: 'XSalsa20-Poly1305',
        mode: 'single-node',
        timestamp: new Date().toISOString(),
        size_bytes: base64.length,
      },
    };
  } catch (error) {
    console.error('Blindfold encryption error:', error);
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
    // Initialize blindfold key
    const key = await initializeKey();

    // Parse encrypted data (could be string or JSON)
    let encryptedData: any;
    try {
      encryptedData = JSON.parse(encryptedBase64);
    } catch {
      encryptedData = encryptedBase64;
    }

    // Decrypt using blindfold
    const decrypted = await blindfold.decrypt(key, encryptedData);
    
    // Convert to string if needed
    return typeof decrypted === 'string' ? decrypted : String(decrypted);
  } catch (error) {
    console.error('Blindfold decryption error:', error);
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
