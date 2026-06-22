import { atom } from "jotai";
import { SiteData } from "../routes/supported";
import { atomWithUserStorage } from "./user";
import { ContentWebType } from "@tagapp/utils/types";
import { SITE_DATA_ELEMENT_ID, CONTENT_DETAILS_ELEMENT_ID } from "@/lib/CONSTANTS";
import { generateJsonScriptElement } from "@/lib/generateJsonScriptElement";
import log from "@/lib/log";

type SupportedSitesType = Record<string, SiteData>;

export const supportedSitesAtom = atomWithUserStorage<SupportedSitesType>(
  "supportedSites",
  {},
);

export const supportedHostsIndexAtom = atomWithUserStorage<
  Record<string, string>
>("supportedHostsIndex", {});

export const addSupportedHostsToIndexAtom = atom(
  null,
  (get, set, SiteName: string, supportedSitesList: string[]) => {
    set(supportedHostsIndexAtom, async (old) => {
      const tmp = { ...(await old) };
      supportedSitesList.forEach((site) => (tmp[site] = SiteName));
      return tmp;
    });
  },
);

export const refreshSupportedHostsIndexAtom = atom(
  null,
  async (get, set, supportSSites?: SupportedSitesType) => {
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
  },
);

// export const injectContentDetailsAndSiteDataAtom = atom(
//   async (get, contentDetails: ContentWebType) => {
//     try {
//       let contentDetailsScriptEle = document.getElementById(CONTENT_DETAILS_ELEMENT_ID);
//       if (!contentDetailsScriptEle) {
//         contentDetailsScriptEle = generateJsonScriptElement(CONTENT_DETAILS_ELEMENT_ID, contentDetails);
//         document.documentElement.append(contentDetailsScriptEle);
//       }

//       const siteData = (await get(supportedSitesAtom))[contentDetails.scraper];
//       let siteDataScriptEle = document.getElementById(SITE_DATA_ELEMENT_ID);
//       if (!siteDataScriptEle) {
//         siteDataScriptEle = generateJsonScriptElement(SITE_DATA_ELEMENT_ID, siteData);
//         document.documentElement.append(siteDataScriptEle);
//       }
//       return true
//     } catch (err) {
//       log("Failed to inject content and site data", err)
//       return false
//     }
//   }
// )