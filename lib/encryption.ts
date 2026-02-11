import crypto from "crypto";

// Raw key can be any string; we normalize it to a 32-byte key using SHA-256.
// In production, set ENCRYPTION_KEY in your environment to a long random string.
const RAW_KEY =
  process.env.ENCRYPTION_KEY || "dev-default-encryption-key-change-me";
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

// 32-byte key derived from RAW_KEY (works regardless of original length/format)
const KEY = crypto.createHash("sha256").update(RAW_KEY).digest(); // 32 bytes

/**
 * Encrypt sensitive data (like API keys, passwords)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
