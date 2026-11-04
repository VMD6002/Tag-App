import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomFamily } from "jotai-family";
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

// 2. Create the reusable factory function
export function atomWithUserStorage<T>(key: string, initialValue: T) {
  // The family is scoped to this specific setting
  const settingFamily = atomFamily((username: string) =>
    atomWithStorage<T>(`${username}:${key}`, initialValue, createWxtStorage(), {
      getOnInit: true, // otherwise an unmounted atom reads the default and callers overwrite real data
    }),
  );

  // Return the proxy atom that automatically routes to the current user
  return atom(
    async (get) => get(settingFamily(await get(currentUserAtom))),
    async (get, set, update: T | ((prev: Promise<T>) => Promise<T>)) => {
      const username = await get(currentUserAtom);
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
