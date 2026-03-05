import "@/assets/tailwind.css";
import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "wxt/utils/content-script-context";
import type { SiteData } from "../main/routes/supported";
import App from "./AllModal";

const createOverlayUI = (ctx: ContentScriptContext) =>
  createShadowRootUi(ctx, {
    name: "tag-app-ext-overlay",
    position: "overlay",
    anchor: "html",
    onMount: (container) => {
      const root = ReactDOM.createRoot(container);
      root.render(<App />);
      return root;
    },
    onRemove: (root) => {
      root?.unmount();
    },
  });

function injectJSONIntoPage(id: string, jsonData: string) {
  const SiteScriptDiv = document.createElement("script");
  SiteScriptDiv.type = "text/json";
  SiteScriptDiv.textContent = jsonData;
  SiteScriptDiv.id = id;
  (document.head ?? document.documentElement).append(SiteScriptDiv);
}

function checkMatchPatterns(SiteData: SiteData) {
  if (!SiteData.matchPatterns) return true;
  const matchPatternPrefix = `${location.protocol}//${location.hostname}`;
  if (
    SiteData.matchPatterns.some((pattern) =>
      new MatchPattern(`${matchPatternPrefix}${pattern}`).includes(location),
    )
  )
    return true;
  return false;
}

async function injectSiteDataIntoPage() {
  const supportedHostsIndex: Record<string, string> =
    (await storage.getItem("local:supportedHostsIndex")) ?? {};

  const SiteName = supportedHostsIndex[location.host];
  if (!SiteName) return false;

  const SupportedSites: Record<string, SiteData> =
    (await storage.getItem("local:supportedSites")) ?? {};
  if (!checkMatchPatterns(SupportedSites[SiteName])) return false;

  const temp = { ...SupportedSites[SiteName] };
  if (temp.cookies) {
    temp.download!.presets.forEach((obj) => {
      obj.cookies = true;
    });
    temp.download!.defaultPreset.cookies = true;
  }

  injectJSONIntoPage("tagAppExtSiteData", JSON.stringify(temp));
  return true;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const load = await injectSiteDataIntoPage();
    if (!load) return;
    await injectScript("/all-script-userscript.js");

    const ui = await createOverlayUI(ctx);
    ui.mount();
  },
});
