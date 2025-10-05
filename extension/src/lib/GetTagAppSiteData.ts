import { SiteData } from "@/entrypoints/main/routes/supported";

export default function GetTagAppSiteData() {
  let Data: SiteData;
  try {
    if (document.getElementById("tagAppExtSiteData")) {
      Data = JSON.parse(
        // @ts-ignore
        document.getElementById(
          "tagAppExtSiteData"
          // @ts-ignore
        ).textContent
      );
    }
  } catch (err) {
    console.error(err);
  }

  // @ts-ignore
  return Data;
}
