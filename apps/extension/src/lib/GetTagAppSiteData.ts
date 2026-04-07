import { SiteData } from "@/entrypoints/main/routes/supported";
import { SITE_DATA_ELEMENT_ID } from "./CONSTANTS";

export default function GetTagAppSiteData() {
  let Data: SiteData;
  try {
    const scriptEle = document.getElementById(
      SITE_DATA_ELEMENT_ID,
    ) as HTMLScriptElement | null;
    if (scriptEle) {
      Data = JSON.parse(scriptEle.textContent);
    }
  } catch (err) {
    console.error(err);
  }

  // @ts-ignore
  return Data;
}
