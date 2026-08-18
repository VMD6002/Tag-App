import "@/assets/tailwind.css";
import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "wxt/utils/content-script-context";
import type { SiteData } from "../main/routes/supported";
import App from "./AllModal";
import {
  DEFAULT_USER,
  SHADOW_ROOT_ID,
  SITE_DATA_ELEMENT_ID,
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

const MESSAGE_TYPE_SEND_TAGS = "TAG_APP_INJECT_TAGS";
const MESSAGE_TYPE_ACK_TAGS = "TAG_APP_TAGS_RECEIVED";

// Helper to broadcast tags until an ACK is received or max attempts hit
const sendTagsWithHandshake = (
  tags: string[],
  intervalMs = 500,
  maxAttempts = 20,
): Promise<boolean> => {
  return new Promise((resolve) => {
    let attempts = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const handleAck = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type === MESSAGE_TYPE_ACK_TAGS) {
        cleanup();
        console.log("Tag handshake successful: ACK received from page.");
        resolve(true);
      }
    };

    const cleanup = () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("message", handleAck);
    };

    window.addEventListener("message", handleAck);

    const attemptSend = () => {
      attempts++;
      window.postMessage({ type: MESSAGE_TYPE_SEND_TAGS, payload: tags }, "*");

      if (attempts >= maxAttempts) {
        console.warn("Max tag send attempts reached without ACK.");
        cleanup();
        resolve(false);
      }
    };

    attemptSend();
    intervalId = setInterval(attemptSend, intervalMs);
  });
};

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
    const fetchAndBroadcastTags = async () => {
      let tags: string[];

      if (appMode === "local") {
        tags = Object.keys(
          (await storage.getItem(`local:${currentUser}:tags`)) ?? {},
        );
      } else {
        const serverUrl =
          (await storage.getItem(`local:${currentUser}:serverUrl`)) ?? "";
        if (!serverUrl) {
          console.error("Server URL not found");
          return;
        }
        const res = await fetch(`${serverUrl}/rpc/tags/getTagData`, {
          body: '{"json":{}}',
          method: "POST",
        });
        tags = Object.keys((await res.json())?.json?.tags ?? {});
      }

      await sendTagsWithHandshake(tags.sort());
    };

    // 1. Initial tag fetch and handshake broadcast on load
    await fetchAndBroadcastTags();

    // 2. Storage watcher to re-run handshake whenever remote tags update
    storage.watch<boolean>("local:remoteTagsUpdated", async (newValue) => {
      await fetchAndBroadcastTags();
      await storage.setItem("local:remoteTagsUpdated", false);
    });

    return false;
  }

  const supportedHostsIndex: Record<string, string> =
    (await storage.getItem(`local:${currentUser}:supportedHostsIndex`)) ?? {};

  const SiteName = supportedHostsIndex[location.host];
  if (!SiteName) return false;

  const SupportedSites: Record<string, SiteData> =
    (await storage.getItem(`local:${currentUser}:supportedSites`)) ?? {};
  if (!checkMatchPatterns(SupportedSites[SiteName]!)) return false;

  const siteDataScriptEle = generateJsonScriptElement(
    SITE_DATA_ELEMENT_ID,
    SupportedSites[SiteName]!,
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
