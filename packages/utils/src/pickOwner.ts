/** Which profile handles a page: the current one if it is a candidate, else the first candidate (list order). */
export function pickOwner(candidates: string[], current: string) {
  return candidates.includes(current) ? current : candidates[0];
}
