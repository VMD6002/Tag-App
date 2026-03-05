import { atomWithStorage } from "jotai/utils";
import { createWxtStorage } from "./storage";
import { SiteData } from "../routes/supported";
import { atom } from "jotai";

type SupportedSitesType = Record<string, SiteData>;

export const supportedSitesAtom = atomWithStorage<SupportedSitesType>(
  "supportedSites",
  {},
  createWxtStorage(),
);

export const supportedHostsIndexAtom = atomWithStorage<Record<string, string>>(
  "supportedHostsIndex",
  {},
  createWxtStorage(),
);

export const addSupportedHostsToIndexAtom = atom(
  null,
  (get, set, SiteName: string, supportedSitesList: string[]) => {
    set(supportedHostsIndexAtom, async (old) => {
      const tmp = await old;
      supportedSitesList.forEach((site) => (tmp[site] = SiteName));
      return tmp;
    });
  },
);

export const refreshSupportedHostsIndexAtom = atom(
  null,
  (get, set, supportSSites?: SupportedSitesType) => {
    set(supportedHostsIndexAtom, async (old) => {
      const index: Record<string, string> = {};
      if (supportSSites) {
        for (const Site in supportSSites) {
          for (const host of supportSSites[Site].hosts) index[host] = Site;
        }
        return index;
      }
      const supportedSites = await get(supportedSitesAtom);
      for (const Site in supportedSites) {
        for (const host of supportedSites[Site].hosts) index[host] = Site;
      }
      return index;
    });
  },
);
