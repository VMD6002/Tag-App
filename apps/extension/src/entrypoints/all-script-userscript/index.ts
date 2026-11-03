import {
  CONTENT_DETAILS_ELEMENT_ID,
  SHADOW_ROOT_ID,
  SITE_DATA_ELEMENT_ID,
} from "@/lib/CONSTANTS";
import { generateJsonScriptElement } from "@/lib/generateJsonScriptElement";
import log from "@/lib/log";
import type { SiteData } from "../main/routes/supported";
import { decodeHtmlEntities, getMicroData, getOgImage } from "./dom-utils";
import { clickRemove, clickUpdateOrRefresh } from "./extension-api";
import { getUniqueIdFromString, sleep, toBase36 } from "./helpers";

export default defineUnlistedScript(async () => {
  const contentDetails: SiteContentDetails = {
    site: "",
    title: "",
    identifier: "",
    url: "",
    defaultTags: [],
    downloadType: undefined,
    cover: undefined,
    contentUrl: undefined,
    extraData: undefined,
  };

  const contentDetailsScriptEle = generateJsonScriptElement(
    CONTENT_DETAILS_ELEMENT_ID,
    contentDetails,
  );

  const isMounted = { value: false };

  // Script Helpers
  const sh = {
    ready: false,
    sleep,
    clickUpdateOrRefresh: (firstRun: [boolean] = [true]) =>
      clickUpdateOrRefresh(
        contentDetailsScriptEle,
        contentDetails,
        isMounted,
        firstRun,
      ),
    clickRemove,
    toBase36,
    getMicroData,
    getOgImage,
    getUniqueIdFromString,
    log,
    decodeHtmlEntities,
    SPAContentRefresh(firstRun = [true]) {
      try {
        this.clickUpdateOrRefresh(firstRun as [boolean]);
        sh.ready = true; // mark as initialized successfully
      } catch {
        log("SPAContentRefresh failed");
        sh.ready = false; // stays unready on error
      }
    },
  };

  let pollCounter = 0;
  const interval = setInterval(() => {
    pollCounter++;
    if (pollCounter >= 10) {
      log("Poll Counting Finished");
      clearInterval(interval);
      return;
    }
    if (document.querySelector(SHADOW_ROOT_ID) && sh.ready) {
      sh.clickUpdateOrRefresh();
      clearInterval(interval);
    }
  }, 1000);

  const siteData: SiteData = JSON.parse(
    document.getElementById(SITE_DATA_ELEMENT_ID)?.textContent ?? "{}",
  );

  contentDetails.site = siteData.name;
  contentDetails.defaultTags.push(`Site:${siteData.name}`);

  if (siteData.script) {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const scriptFunction = new AsyncFunction("ctdls", "sh", siteData.script);
    scriptFunction(contentDetails, sh);
  }
});
