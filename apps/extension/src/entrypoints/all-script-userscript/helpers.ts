export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * FNV-1a 32-bit Hash
 */
export function getUniqueIdFromString(str: string): string {
  // Constants for FNV-1a 32-bit
  const FNV_PRIME_32 = 0x01000193; // 16777619
  const FNV_OFFSET_32 = 0x811c9dc5; // 2166136261

  // Normalize to handle identical characters with different Unicode encodings
  const cleanStr = str.normalize("NFC");

  let hash = FNV_OFFSET_32;

  for (let i = 0; i < cleanStr.length; i++) {
    // XOR the bottom 8 bits of the character code
    hash ^= cleanStr.charCodeAt(i);

    // Use Math.imul to perform 32-bit integer multiplication
    hash = Math.imul(hash, FNV_PRIME_32);
  }

  // >>> 0 converts the signed integer to an unsigned 32-bit integer
  // .toString(36) creates a compact alphanumeric string (0-9, a-z)
  return (hash >>> 0).toString(36);
}
