// src/utils/crypto.js — Client-side E2EE Utilities
// Uses Web Crypto API for zero-knowledge encryption

/**
 * Generates a symmetric key from a passphrase
 */
export async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a message
 */
export async function encryptMessage(text, key) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    enc.encode(text)
  );

  const exportedIv = btoa(String.fromCharCode(...iv));
  const exportedCiphertext = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

  return JSON.stringify({ iv: exportedIv, data: exportedCiphertext });
}

/**
 * Decrypts a message
 */
export async function decryptMessage(encryptedJson, key) {
  const { iv: exportedIv, data: exportedCiphertext } = JSON.parse(encryptedJson);
  
  const iv = new Uint8Array(atob(exportedIv).split("").map((c) => c.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(exportedCiphertext).split("").map((c) => c.charCodeAt(0)));

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
