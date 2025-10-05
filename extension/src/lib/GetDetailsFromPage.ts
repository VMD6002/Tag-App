export default function GetDetailsFromPage() {
  let Data: SiteContentData = {
    Downloader: "yt-dlp",
    Site: "",
    Title: "",
    CoverUrl: "",
    Identifier: "",
    Url: "",
    defaultTags: [],
  };
  try {
    if (document.getElementById("tagAppScriptJSONDataFromSite")) {
      Data = JSON.parse(
        // @ts-ignore
        document.getElementById(
          "tagAppScriptJSONDataFromSite"
          // @ts-ignore
        ).textContent
      );
    }
  } catch (err) {
    console.error(err);
  }

  return Data;
}
