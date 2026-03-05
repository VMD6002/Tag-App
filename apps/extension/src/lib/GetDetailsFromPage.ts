export default function GetDetailsFromPage() {
  let Data: SiteContentData = {
    downloader: "yt-dlp",
    site: "",
    title: "",
    extraData: "",
    coverUrl: "",
    identifier: "",
    url: "",
    defaultTags: [],
  };
  try {
    if (document.getElementById("tagAppScriptJSONDataFromSite")) {
      Data = JSON.parse(
        document.getElementById("tagAppScriptJSONDataFromSite")!.textContent,
      );
    }
  } catch (err) {
    console.error(err);
  }

  return Data;
}
