// Mounts real extension pieces the way entrypoints/main/App.tsx does, on fake storage.
// Imports from the extension use relative paths because `@/` here means the web src.
import "./globals";
import { createStore, Provider } from "jotai";
import { type ReactNode, useEffect, useMemo } from "react";
import { Router } from "wouter";
import { ConfirmProvider } from "../../../../extension/src/components/craft/confirm-dialog";
import { Toaster } from "../../../../extension/src/components/craft/ui/sonner";
import MyQueryProvider from "../../../../extension/src/components/MyQueryProvider";
import NavBar from "../../../../extension/src/components/NavBar";
import {
  ThemeProvider,
  useTheme,
} from "../../../../extension/src/components/theme-provider";
import {
  cover,
  MOCK_CONSTANTS,
  makeContent,
  makeSites,
  makeTags,
  type Scenario,
} from "../data";
import {
  installGlobals,
  MOCK_SERVER_URL,
  type ServerMode,
  seedServer,
  seedStorage,
} from "../stubs";
import "./ext.css";

export type FrameOptions = {
  scenario: Scenario;
  /** Which route the extension nav should highlight. */
  path: "/" | "/tags" | "/settings" | "/supported";
  mode?: "local" | "remote";
  serverMode?: ServerMode;
  /** ?search=… so the library starts with no results. */
  search?: string;
  /** Slow storage reads, to hold the local loading state. */
  readDelayMs?: number;
  users?: string[];
  afterScripts?: boolean;
};

const SLUGS: Record<string, string> = {
  "/": "library",
  "/tags": "tags",
  "/settings": "settings",
  "/supported": "supported",
};

export function buildStore(o: FrameOptions) {
  installGlobals({ useTheme });
  const { tags, parentTags } = makeTags(o.scenario);
  const contents = makeContent(o.scenario);
  const mode = o.mode ?? "local";
  seedStorage(
    {
      currentUser: "DEFAULT",
      userList: o.users ?? ["DEFAULT", "Guest profile"],
      "DEFAULT:appMode": mode,
      "DEFAULT:theme": "system",
      "DEFAULT:serverUrl": mode === "remote" ? MOCK_SERVER_URL : "",
      "DEFAULT:contentData": Object.fromEntries(contents.map((c) => [c.id, c])),
      "DEFAULT:tags": tags,
      "DEFAULT:parents": parentTags,
      "DEFAULT:supportedSites": makeSites(o.scenario),
      "DEFAULT:constants": MOCK_CONSTANTS,
      "DEFAULT:hostNames": ["http://localhost:5000"],
      "DEFAULT:filteredDataPostServerUrl": "http://localhost:5001/filtered",
      "DEFAULT:enableAfterAddRemoveScripts": o.afterScripts ?? true,
    },
    { readDelayMs: o.readDelayMs },
  );
  seedServer({
    mode: o.serverMode ?? "ok",
    contents,
    tags,
    parentTags,
    constants: MOCK_CONSTANTS,
  });
  return createStore();
}

export default function ExtFrame({
  options,
  children,
  chrome = true,
}: {
  options: FrameOptions;
  children: ReactNode;
  chrome?: boolean;
}) {
  const store = useMemo(() => buildStore(options), [options]);

  // The library reads its initial filters from the real URL query; page loads start clean.
  useEffect(() => {
    const url = new URL(location.href);
    if (options.search) url.searchParams.set("search", options.search);
    else url.searchParams.delete("search");
    history.replaceState(null, "", url);
  }, [options.search]);

  // The extension's own nav links stay inside the mock instead of leaving it.
  const hook = useMemo(
    () => () =>
      [
        options.path,
        (to: string) => {
          const slug = SLUGS[to];
          if (!slug) return;
          const remote =
            options.mode === "remote" && (to === "/" || to === "/tags");
          location.hash = `#/mock/${remote ? `remote-${slug}` : slug}`;
        },
      ] as [string, (to: string) => void],
    [options.path, options.mode],
  );

  return (
    <Provider store={store}>
      <Router hook={hook}>
        <ThemeProvider>
          {chrome && <NavBar />}
          <main className="relative mx-auto w-[calc(100%-2rem)] max-w-6xl sm:w-[calc(100%-4rem)]">
            <MyQueryProvider>{children}</MyQueryProvider>
          </main>
          <div className="h-12" />
          <ConfirmProvider />
          <Toaster />
        </ThemeProvider>
      </Router>
    </Provider>
  );
}

export { cover };
