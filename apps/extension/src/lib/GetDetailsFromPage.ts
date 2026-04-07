import { SCRIPT_DATA_ELEMENT_ID } from "./CONSTANTS";

export default function GetDetailsFromPage() {
  let Data: SiteContentData = {
    downloader: "yt-dlp",
    site: "",
    title: "",
    coverUrl: "",
    identifier: "",
    url: "",
    defaultTags: [],
    extraData: "",
    contentUrl: "",
  };
  try {
    const scriptEle = document.getElementById(
      SCRIPT_DATA_ELEMENT_ID,
    ) as HTMLScriptElement | null;
    if (scriptEle) {
      Data = JSON.parse(scriptEle.textContent);
    }
  } catch (err) {
    console.error(err);
  }

  return Data;
}
