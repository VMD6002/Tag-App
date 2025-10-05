import log from "@/lib/log";
import xxhash from "xxhash-wasm";
import { SiteData } from "../main/routes/supported";
import { decodeHtmlEntities, getMicroData, getOgImage } from "./dom-utils";
import { clickUpdateOrRefresh, clickRemove } from "./extension-api";
import { sleep, createUniqueId } from "./helpers";

export default defineUnlistedScript(async () => {
  const { h64 } = await xxhash();

  const parentDiv = document.createElement("script");
  parentDiv.type = "application/json";
  parentDiv.id = "tagAppScriptJSONDataFromSite";
  parentDiv.style.display = "none";

  const ContentData: SiteContentData = {
    Downloader: "yt-dlp",
    Site: "",
    Title: "",
    CoverUrl: "",
    Identifier: "",
    Url: "",
    defaultTags: [],
  };

  const isMounted = { value: false };

  const scriptData = {
    ready: false,
    sleep,
    clickUpdateOrRefresh: (firstRun?: boolean) =>
      clickUpdateOrRefresh(parentDiv, ContentData, isMounted, firstRun),
    clickRemove,
    getMicroData,
    getOgImage,
    getUniqueIdFromString: (str: string) => createUniqueId(h64, str),
    log,
    decodeHtmlEntities,
    SPAContentRefresh(firstRun = false) {
      try {
        this.clickUpdateOrRefresh(firstRun);
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
    if (document.querySelector("tag-app-ext-overlay") && scriptData.ready) {
      scriptData.clickUpdateOrRefresh(true);
      clearInterval(interval);
    }
  }, 1000);

  const siteData: SiteData = JSON.parse(
    document.getElementById("tagAppExtSiteData")?.textContent ?? "{}"
  );

  // @ts-ignore
  if (siteData.BegonEvalErrors && window.trustedTypes?.createPolicy) {
    // @ts-ignore
    window.trustedTypes.createPolicy("tagAppPolicy", {
      // @ts-ignore
      createHTML: (s) => s,
      // @ts-ignore
      createScriptURL: (s) => s,
      // @ts-ignore
      createScript: (s) => s,
    });
  }

  ContentData.Site = siteData.Name;

  if (siteData.Script) {
    new Function("ContentData", "scriptData", siteData.Script)(
      ContentData,
      scriptData
    );
  }
});
