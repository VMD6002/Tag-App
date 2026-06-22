import { CONTENT_DETAILS_ELEMENT_ID } from "./CONSTANTS";

export default function GetDetailsFromPage<T = SiteContentDetails>(): T {
  let Data: SiteContentDetails = {
    downloader: undefined,
    site: "",
    title: "",
    cover: undefined,
    identifier: "",
    url: "",
    defaultTags: [],
    extraData: undefined,
    contentUrl: undefined
  };
  try {
    const contentDetailsScriptEle = document.getElementById(
      CONTENT_DETAILS_ELEMENT_ID,
    ) as HTMLScriptElement | null;
    if (contentDetailsScriptEle) {
      Data = JSON.parse(contentDetailsScriptEle.textContent);
    }
  } catch (err) {
    console.error(err);
  }

  return Data as T;
}
