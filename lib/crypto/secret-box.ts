// lib/crypto/secret-box.ts
//
// Symmetric encryption for secrets we have to store at rest in the
// database (payment gateway API/private keys). Keyed off AUTH_SECRET
// so no extra env var is required to get going.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey() {
  const secret =
    process.env.PAYMENT_SETTINGS_ENCRYPTION_KEY ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET (or PAYMENT_SETTINGS_ENCRYPTION_KEY) is not defined — required to encrypt stored secrets.",
    );
  }

  return scryptSync(secret, "payment-settings-secret-box", 32);
}

/** Encrypts a plaintext string into a single base64 token (iv + authTag + ciphertext). */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Reverses `encryptSecret`. Throws if the token was tampered with or the key is wrong. */
export function decryptSecret(token: string): string {
  const raw = Buffer.from(token, "base64");

  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = raw.subarray(IV_LENGTH + 16);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/** Masks a secret for display in the dashboard, e.g. "••••••7890". */
export function maskSecret(plaintext: string | null | undefined): string {
  if (!plaintext) return "";

  const tail = plaintext.slice(-4);

  return `${"•".repeat(Math.max(plaintext.length - 4, 4))}${tail}`;
}
