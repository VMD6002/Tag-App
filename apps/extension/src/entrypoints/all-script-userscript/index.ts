import log from "@/lib/log";
import { SiteData } from "../main/routes/supported";
import { decodeHtmlEntities, getMicroData, getOgImage } from "./dom-utils";
import { clickUpdateOrRefresh, clickRemove } from "./extension-api";
import { sleep, getUniqueIdFromString } from "./helpers";
import {
  SHADOW_ROOT_ID,
  CONTENT_DETAILS_ELEMENT_ID,
  SITE_DATA_ELEMENT_ID,
} from "@/lib/CONSTANTS";
import { generateJsonScriptElement } from "@/lib/generateJsonScriptElement";

export default defineUnlistedScript(async () => {
  const contentDetails: SiteContentDetails = {
    site: "",
    title: "",
    identifier: "",
    url: "",
    defaultTags: [],
    downloader: undefined,
    cover: undefined,
    contentUrl: undefined,
    extraData: undefined
  };

  const contentDetailsScriptEle = generateJsonScriptElement(CONTENT_DETAILS_ELEMENT_ID, contentDetails);

  const isMounted = { value: false };

  const scriptData = {
    ready: false,
    sleep,
    clickUpdateOrRefresh: (firstRun?: [boolean]) =>
      clickUpdateOrRefresh(contentDetailsScriptEle, contentDetails, isMounted, firstRun),
    clickRemove,
    getMicroData,
    getOgImage,
    getUniqueIdFromString,
    log,
    decodeHtmlEntities,
    SPAContentRefresh(firstRun = [false]) {
      try {
        this.clickUpdateOrRefresh(firstRun as [boolean]);
        scriptData.ready = true; // mark as initialized successfully
      } catch {
        log("SPAContentRefresh failed");
        scriptData.ready = false; // stays unready on error
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
    if (document.querySelector(SHADOW_ROOT_ID) && scriptData.ready) {
      scriptData.clickUpdateOrRefresh([true]);
      clearInterval(interval);
    }
  }, 1000);

  const siteData: SiteData = JSON.parse(
    document.getElementById(SITE_DATA_ELEMENT_ID)?.textContent ?? "{}",
  );

  contentDetails.site = siteData.name;
  contentDetails.defaultTags.push(`Site:${siteData.name}`);

  if (siteData.script) {
    const scriptFunction = new Function("contentDetails", "scriptData", siteData.script)
    scriptFunction(contentDetails, scriptData)
  }
});
