import { atom, Getter, Setter } from "jotai";
import { SiteData } from "../routes/supported";
import { atomWithUserStorage } from "./user";
import { useCallback } from "react";
import { useAtomCallback } from "jotai/utils";

type SupportedSitesType = Record<string, SiteData>;

export const supportedSitesAtom = atomWithUserStorage<SupportedSitesType>(
  "supportedSites",
  {},
);

export const supportedHostsIndexAtom = atomWithUserStorage<
  Record<string, string>
>("supportedHostsIndex", {});

const addSupportedHostsToIndexCallback = (get: Getter, set: Setter, SiteName: string, supportedSitesList: string[]) => {
  set(supportedHostsIndexAtom, async (old) => {
    const tmp = { ...(await old) };
    supportedSitesList.forEach((site) => (tmp[site] = SiteName));
    return tmp;
  });
};

export const useAddSupportedHostsToIndex = () => useAtomCallback(useCallback(addSupportedHostsToIndexCallback, []));

const refreshSupportedHostsIndexCallback = async (get: Getter, set: Setter, supportSSites?: SupportedSitesType) => {
  const index: Record<string, string> = {};
  if (supportSSites) {
    for (const Site in supportSSites) {
      for (const host of supportSSites[Site].hosts) index[host] = Site;
    }
  } else {
    const supportedSites = await get(supportedSitesAtom);
    for (const Site in supportedSites) {
      for (const host of supportedSites[Site].hosts) index[host] = Site;
    }
  }
  set(supportedHostsIndexAtom, index);
};

export const useRefreshSupportedHostsIndex = () => useAtomCallback(useCallback(refreshSupportedHostsIndexCallback, []));