import log from "@/lib/log";
import { SiteData } from "../main/routes/supported";
import { decodeHtmlEntities, getMicroData, getOgImage } from "./dom-utils";
import { clickUpdateOrRefresh, clickRemove } from "./extension-api";
import { sleep, getUniqueIdFromString, toBase36 } from "./helpers";
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
    clickUpdateOrRefresh: (firstRun?: [boolean]) =>
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
    SPAContentRefresh(firstRun = [false]) {
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
      sh.clickUpdateOrRefresh([true]);
      clearInterval(interval);
    }
  }, 1000);

  const siteData: SiteData = JSON.parse(
    document.getElementById(SITE_DATA_ELEMENT_ID)?.textContent ?? "{}",
  );

  contentDetails.site = siteData.name;
  contentDetails.defaultTags.push(`Site:${siteData.name}`);

  if (siteData.script) {
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    const scriptFunction = new AsyncFunction("ctdls", "sh", siteData.script);
    scriptFunction(contentDetails, sh);
  }
});
