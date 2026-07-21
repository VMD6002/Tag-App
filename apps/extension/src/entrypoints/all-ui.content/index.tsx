import "@/assets/tailwind.css";
import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "wxt/utils/content-script-context";
import type { SiteData } from "../main/routes/supported";
import App from "./AllModal";
import {
  DEFAULT_USER,
  SHADOW_ROOT_ID,
  SITE_DATA_ELEMENT_ID,
  HOST_NAME_ELEMENT_ID,
} from "@/lib/CONSTANTS";
import { generateJsonScriptElement } from "@/lib/generateJsonScriptElement";

const createOverlayUI = (ctx: ContentScriptContext) =>
  createShadowRootUi(ctx, {
    name: SHADOW_ROOT_ID,
    position: "overlay",
    anchor: "html",
    onMount: (container) => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <ThemeProvider container={container}>
          <App />
        </ThemeProvider>,
      );
      return root;
    },
    onRemove: (root) => {
      root?.unmount();
    },
  });

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
  const currentUser =
    (await storage.getItem<string>("local:currentUser")) ?? DEFAULT_USER;

  const hostNames: string[] | null = await storage.getItem(
    `local:${currentUser}:hostNames`,
  );

  const appMode: "local" | "remote" | null = await storage.getItem(
    `local:${currentUser}:appMode`,
  );

  // Check if its one of the hostnames defined by user and if it is then inject tag data and exit
  if (hostNames && hostNames.includes(location.origin)) {
    let tags: string[];

    if (appMode === "local")
      tags = Object.keys(
        (await storage.getItem(`local:${currentUser}:tags`)) ?? {},
      );
    else {
      const serverUrl =
        (await storage.getItem(`local:${currentUser}:serverUrl`)) ?? "";
      if (!serverUrl) {
        console.error("Server URL not found");
        return false;
      }
      const res = await fetch(`${serverUrl}/rpc/tags/getTagData`, {
        body: '{"json":{}}',
        method: "POST",
      });
      tags = Object.keys((await res.json())?.json?.tags ?? {});
    }

    const hostNameTagsElement = generateJsonScriptElement(
      HOST_NAME_ELEMENT_ID,
      tags.sort(),
    );
    document.documentElement.append(hostNameTagsElement);
    return false;
  }

  const supportedHostsIndex: Record<string, string> =
    (await storage.getItem(`local:${currentUser}:supportedHostsIndex`)) ?? {};

  const SiteName = supportedHostsIndex[location.host];
  if (!SiteName) return false;

  const SupportedSites: Record<string, SiteData> =
    (await storage.getItem(`local:${currentUser}:supportedSites`)) ?? {};
  if (!checkMatchPatterns(SupportedSites[SiteName])) return false;

  const siteDataScriptEle = generateJsonScriptElement(
    SITE_DATA_ELEMENT_ID,
    SupportedSites[SiteName],
  );
  document.documentElement.append(siteDataScriptEle);
  return true;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const load = await injectSiteDataIntoPage();
    if (!load) return;
    await injectScript("/all-script-userscript.js", { keepInDom: false });

    const ui = await createOverlayUI(ctx);
    ui.mount();
  },
});
