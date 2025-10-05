export function ArrayHasAny(array: string[], values: string[]) {
  const set = new Set(array);
  return values.some((value) => set.has(value));
}
export function ArryaHasAnyModified(array: string[], values: string[]) {
  if (values.includes("*") && array.length > 0) return true;
  const set = new Set(array);
  return values.some((value) => {
    if (value.endsWith(":*")) {
      const parent = value.slice(0, -2);
      return array.some((val) => val.startsWith(parent));
    }
    return set.has(value);
  });
}

export function ArrayHasAll(array: string[], values: string[]) {
  const set = new Set(array);
  return values.every((v) => set.has(v));
}

export const eqSet = (set1: Set<string>, set2: Set<string>) =>
  set1.size === set2.size && [...set1].every((x) => set1.has(x));
