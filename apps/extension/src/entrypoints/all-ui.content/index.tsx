import "@/assets/tailwind.css";
import { pickOwner } from "@tagapp/utils";
import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "wxt/utils/content-script-context";
import {
  DEFAULT_USER,
  SHADOW_ROOT_ID,
  SITE_DATA_ELEMENT_ID,
} from "@/lib/CONSTANTS";
import { generateJsonScriptElement } from "@/lib/generateJsonScriptElement";
import { setContentScriptUser } from "../main/atoms/user";
import type { SiteData } from "../main/routes/supported";
import App from "./AllModal";

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
  const crossUser =
    (await storage.getItem<boolean>("local:crossUserScripts")) ?? false;

  // Cross user scripts: any profile may own the host-page broadcast, current one first
  const userList = crossUser
    ? ((await storage.getItem<string[]>("local:userList")) ?? [DEFAULT_USER])
    : [currentUser];
  const hostNamesItems = await storage.getItems(
    userList.map((u) => `local:${u}:hostNames` as const),
  );
  const hostUser = pickOwner(
    userList.filter((_, i) =>
      (hostNamesItems[i]?.value as string[] | null)?.includes(location.origin),
    ),
    currentUser,
  );

  // Check if its one of the hostnames defined by user and if it is then inject tag data and exit
  if (hostUser) {
    const appMode: "local" | "remote" =
      (await storage.getItem<"local" | "remote">(
        `local:${hostUser}:appMode`,
      )) ?? "local"; // defaults are never written to storage

    const fetchAndBroadcastTags = async () => {
      let tags: string[];

      try {
        if (appMode === "local") {
          tags = Object.keys(
            (await storage.getItem(`local:${hostUser}:tags`)) ?? {},
          );
        } else {
          const serverUrl =
            (await storage.getItem(`local:${hostUser}:serverUrl`)) ?? "";
          if (!serverUrl) {
            console.error("Server URL not found");
            return;
          }
          const res = await fetch(`${serverUrl}/rpc/tags/getTagData`, {
            body: '{"json":{}}',
            method: "POST",
          });
          if (!res.ok) {
            console.error("Couldn't load tags to broadcast", res.status);
            return;
          }
          tags = Object.keys((await res.json())?.json?.tags ?? {});
        }
      } catch (error) {
        // Must not throw: the storage watcher below still has to be registered.
        console.error("Couldn't load tags to broadcast", error);
        return;
      }

      await sendTagsWithHandshake(tags.sort());
    };

    // Serialise broadcasts so an update during the first handshake runs after it, with fresh tags
    let queue = Promise.resolve();
    const broadcast = () => {
      queue = queue.then(fetchAndBroadcastTags);
    };

    // Watch from the start: the first handshake can take ~10 s and updates in that window must not be missed
    storage.watch<boolean>(`local:${hostUser}:remoteTagsUpdated`, broadcast);
    broadcast();
    await queue;

    return false;
  }

  const owner = crossUser
    ? pickOwner(
        (
          await storage.getItem<Record<string, string[]>>(
            "local:crossUserHostsIndex",
          )
        )?.[location.host] ?? [],
        currentUser,
      )
    : currentUser;
  if (!owner) return false;

  const supportedHostsIndex: Record<string, string> =
    (await storage.getItem(`local:${owner}:supportedHostsIndex`)) ?? {};

  const SiteName = supportedHostsIndex[location.host];
  if (!SiteName) return false;

  const SupportedSites: Record<string, SiteData> =
    (await storage.getItem(`local:${owner}:supportedSites`)) ?? {};
  const siteData = SupportedSites[SiteName];
  if (!siteData || !checkMatchPatterns(siteData)) return false;

  const siteDataScriptEle = generateJsonScriptElement(
    SITE_DATA_ELEMENT_ID,
    siteData,
  );
  document.documentElement.append(siteDataScriptEle);
  if (crossUser) setContentScriptUser(owner); // the overlay runs as the owner
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
