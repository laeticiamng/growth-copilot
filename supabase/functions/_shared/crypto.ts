/**
 * Shared crypto utilities for OAuth token encryption/decryption
 */

/**
 * Decode hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Decrypt token using AES-GCM with raw 256-bit key
 * TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)
 */
export async function decryptToken(
  encryptedCt: string,
  iv: string,
  encryptionKeyHex: string
): Promise<string> {
  // Validate key length
  if (encryptionKeyHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(encryptionKeyHex)) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }

  // Import raw 256-bit key directly
  const keyBytes = hexToBytes(encryptionKeyHex);
  const keyBuffer = new ArrayBuffer(32);
  new Uint8Array(keyBuffer).set(keyBytes);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // Decode base64 IV and ciphertext
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ctBytes = Uint8Array.from(atob(encryptedCt), c => c.charCodeAt(0));

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ctBytes
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Encrypt token using AES-GCM with raw 256-bit key
 */
export async function encryptToken(
  token: string,
  encryptionKeyHex: string
): Promise<{ ct: string; iv: string }> {
  const encoder = new TextEncoder();
  const tokenData = encoder.encode(token);

  // Import raw 256-bit key directly
  const keyBytes = hexToBytes(encryptionKeyHex);
  if (keyBytes.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
  }

  const keyBuffer = new ArrayBuffer(32);
  new Uint8Array(keyBuffer).set(keyBytes);

  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Generate unique random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    tokenData
  );

  return {
    ct: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}
