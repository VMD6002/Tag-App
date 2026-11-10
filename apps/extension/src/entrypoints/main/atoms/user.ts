import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomFamily } from "jotai-family";
import { useLocation } from "wouter";
import { DEFAULT_USER } from "@/lib/CONSTANTS";
import { createWxtStorage } from "./storage";

// 1. Define your current user atom first
export const currentUserAtom = atomWithStorage<string>(
  "currentUser",
  DEFAULT_USER,
  createWxtStorage(),
  { getOnInit: true },
);

export const userListAtom = atomWithStorage<string[]>(
  "userList",
  ["DEFAULT"],
  createWxtStorage(),
  { getOnInit: true },
);

// Per-tab profile override: `main.html?user=<name>#/path`. wouter's hash router keeps a
// real query string (`location.search`) across navigation, so Links preserve it.
// Extension pages only: the content script runs on host pages whose URL must not be read.
const readUrlUser = () =>
  location.protocol === "chrome-extension:"
    ? new URLSearchParams(location.search).get("user")
    : null;

const urlUserAtom = atom(readUrlUser());
urlUserAtom.onMount = (set) => {
  const sync = () => set(readUrlUser());
  sync();
  addEventListener("hashchange", sync); // wouter navigate() dispatches this
  addEventListener("popstate", sync);
  return () => {
    removeEventListener("hashchange", sync);
    removeEventListener("popstate", sync);
  };
};

// Content script only: the profile that owns the page's site script (cross user scripts).
let contentScriptUser: string | null = null;
export const setContentScriptUser = (user: string) => {
  contentScriptUser = user;
};

// The profile this tab shows: the URL's if it exists, else the stored one.
// Never writes currentUserAtom, so other tabs are unaffected. On host pages the content
// script's owner (setContentScriptUser) wins.
export const effectiveUserAtom = atom(async (get) => {
  if (contentScriptUser) return contentScriptUser;
  const urlUser = get(urlUserAtom);
  const stored = await get(currentUserAtom);
  if (!urlUser) return stored;
  return (await get(userListAtom)).includes(urlUser) ? urlUser : stored;
});

// Sets `?user=` on the current page, keeping other params and the hash route.
export function useSetUrlUser() {
  const [path, navigate] = useLocation();
  return (user: string) => {
    const params = new URLSearchParams(location.search);
    params.set("user", user);
    navigate(`${path}?${params}`, { replace: true });
  };
}

// 2. Create the reusable factory function
export function atomWithUserStorage<T>(key: string, initialValue: T) {
  // The family is scoped to this specific setting
  const settingFamily = atomFamily((username: string) =>
    atomWithStorage<T>(`${username}:${key}`, initialValue, createWxtStorage(), {
      getOnInit: true, // otherwise an unmounted atom reads the default and callers overwrite real data
    }),
  );

  // Return the proxy atom that automatically routes to the effective user
  return atom(
    async (get) => get(settingFamily(await get(effectiveUserAtom))),
    async (get, set, update: T | ((prev: Promise<T>) => Promise<T>)) => {
      const username = await get(effectiveUserAtom);
      const action =
        typeof update === "function"
          ? (prev: Promise<T>) => {
              if (prev instanceof Promise) {
                return prev.then(update as (prev: T) => T | Promise<T>);
              }
              return (update as (prev: T) => T | Promise<T>)(prev);
            }
          : update;
      set(settingFamily(username), action as any);
    },
  );
}
