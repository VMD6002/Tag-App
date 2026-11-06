import { useCallback } from "react";

/**
 * The scenario lives in the hash (#/mock/library?s=stress). Changing it reloads the page: the
 * extension's storage-backed atoms read their initial value once per page load.
 */
export function useScenario(fallback: string) {
  const current =
    new URLSearchParams(location.hash.split("?")[1] ?? "").get("s") ?? fallback;
  const set = useCallback((id: string) => {
    location.hash = `${location.hash.split("?")[0]}?s=${id}`;
  }, []);
  return [current, set] as const;
}
