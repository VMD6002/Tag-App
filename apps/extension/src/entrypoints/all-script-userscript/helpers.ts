export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createUniqueId(
  hasher: (str: string) => bigint,
  input: string
): string {
  return hasher(input).toString(36);
}
