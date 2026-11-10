import type { Getter, Setter } from "jotai";
import { atomWithStorage, useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import type { SiteData } from "../routes/supported";
import { createWxtStorage } from "./storage";
import { atomWithUserStorage, effectiveUserAtom, userListAtom } from "./user";

// Global, not per profile (like currentUserAtom).
export const crossUserScriptsAtom = atomWithStorage<boolean>(
  "crossUserScripts",
  false,
  createWxtStorage(),
  { getOnInit: true },
);

// Global `local:crossUserHostsIndex`: host -> profiles (userList order) that have a site script for it.
// `fresh` is a just-computed index for a profile whose atom write may not have landed yet.
export async function rebuildCrossUserHostsIndex(
  users: string[],
  fresh?: { user: string; index: Record<string, string> },
) {
  const items = await storage.getItems(
    users.map((u) => `local:${u}:supportedHostsIndex` as const),
  );
  const cross: Record<string, string[]> = {};
  users.forEach((user, i) => {
    const index =
      fresh?.user === user
        ? fresh.index
        : ((items[i]?.value as Record<string, string> | null) ?? {});
    for (const host in index) cross[host] = [...(cross[host] ?? []), user];
  });
  await storage.setItem("local:crossUserHostsIndex", cross);
}

export const enableAfterAddRemoveScriptsAtom = atomWithUserStorage<boolean>(
  "enableAfterAddRemoveScripts",
  false,
);

export const runAfterAddRemoveScriptsInServerAtom =
  atomWithUserStorage<boolean>("runAfterAddRemoveScriptsInServer", false);

type SupportedSitesType = Record<string, SiteData>;

export const supportedSitesAtom = atomWithUserStorage<SupportedSitesType>(
  "supportedSites",
  {},
);

export const supportedHostsIndexAtom = atomWithUserStorage<
  Record<string, string>
>("supportedHostsIndex", {});

const refreshSupportedHostsIndexCallback = async (
  get: Getter,
  set: Setter,
  supportSSites?: SupportedSitesType,
) => {
  const index: Record<string, string> = {};
  if (supportSSites) {
    for (const [Site, { hosts }] of Object.entries(supportSSites))
      for (const host of hosts) index[host] = Site;
  } else {
    const supportedSites = await get(supportedSitesAtom);
    for (const [Site, { hosts }] of Object.entries(supportedSites))
      for (const host of hosts) index[host] = Site;
  }
  const user = await get(effectiveUserAtom);
  set(supportedHostsIndexAtom, index);
  await rebuildCrossUserHostsIndex(await get(userListAtom), { user, index });
};

export const useRefreshSupportedHostsIndex = () =>
  useAtomCallback(useCallback(refreshSupportedHostsIndexCallback, []));
