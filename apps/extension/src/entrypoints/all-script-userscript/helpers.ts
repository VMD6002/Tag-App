export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// export function createUniqueId(
//   hasher: (str: string) => bigint,
//   input: string,
// ): string {
//   return hasher(input).toString(36) + "_" + createUniqueIdV2(input);
// }

const FNV_OFFSET_64 = BigInt("0xcbf29ce484222325");
const FNV_PRIME_64 = BigInt("0x100000001b3");

export function getUniqueIdFromString(str: string) {
  const cleanStr = str.normalize("NFC");

  let hash = FNV_OFFSET_64;

  for (let i = 0; i < cleanStr.length; i++) {
    hash ^= BigInt(cleanStr.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * FNV_PRIME_64);
  }

  return hash.toString(36);
}
