// The clip overlay's real pieces (UpdateModal, FloatingButtons) over a fake page.
import { Provider, useAtomValue, useSetAtom, useStore } from "jotai";
import { type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import UpdateModal from "../../../../extension/src/components/craft/UpdateModal";
import {
  updateContentUrlAtom,
  updateCoverAtom,
  updateDownloadTypeAtom,
  updateExistsAtom,
  updateExtraDataAtom,
  updateIdAtom,
  updateModalOpenAtom,
  updatePresetAtom,
  updatePresetOptionsAtom,
  updateResetOptionsAtom,
  updateTagsAtom,
  updateTitleAtom,
} from "../../../../extension/src/components/craft/UpdateModal/atom";
import { ThemeProvider } from "../../../../extension/src/components/theme-provider";
import { loadAtom } from "../../../../extension/src/entrypoints/all-ui.content/AllModal";
import FloatingButtons from "../../../../extension/src/entrypoints/all-ui.content/AllModal/Shared/FloatingButtons";
import { cover } from "../data";

export type OverlayState = "new" | "saved" | "edit" | "add";

const PRESETS = [
  { label: "720p", value: "-f b[height<=720]" },
  { label: "480p", value: "-f b[height<=480]" },
];

function Demo({ state }: { state: OverlayState }) {
  const set = {
    exists: useSetAtom(updateExistsAtom),
    open: useSetAtom(updateModalOpenAtom),
    load: useSetAtom(loadAtom),
    id: useSetAtom(updateIdAtom),
    title: useSetAtom(updateTitleAtom),
    tags: useSetAtom(updateTagsAtom),
    cover: useSetAtom(updateCoverAtom),
    url: useSetAtom(updateContentUrlAtom),
    extra: useSetAtom(updateExtraDataAtom),
    presets: useSetAtom(updatePresetOptionsAtom),
    preset: useSetAtom(updatePresetAtom),
    type: useSetAtom(updateDownloadTypeAtom),
    reset: useSetAtom(updateResetOptionsAtom),
  };
  const open = useAtomValue(updateModalOpenAtom);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = state !== "new" && state !== "add";
    set.id("sample_demo1");
    set.exists(saved);
    set.load(true);
    set.title(
      saved
        ? "Homemade pasta in 20 minutes"
        : "Homemade pasta in 20 minutes - Example Video",
    );
    set.tags(
      saved
        ? ["Type:Video", "Site:Sample_Video", "Topic:Cooking"].map((o) => ({
            label: o,
            value: o,
          }))
        : ["Site:Sample_Video"].map((o) => ({ label: o, value: o })),
    );
    set.cover(cover(0, "page cover"));
    set.url("https://cdn.example.test/video/demo1.mp4");
    set.extra(
      "Web: [https://example.test/watch/demo1](https://example.test/watch/demo1)\nPlaceholder notes in *markdown*.",
    );
    set.presets(PRESETS);
    set.preset(PRESETS[0]);
    set.type("yt-dlp");
    set.reset({
      title: () => "Homemade pasta in 20 minutes - Example Video",
      cover: () => cover(0, "page cover"),
      tags: () => [{ label: "Site:Sample_Video", value: "Site:Sample_Video" }],
      contentUrl: () => "https://cdn.example.test/video/demo1.mp4",
      preset: () => PRESETS[0],
      extraData: () =>
        "Web: [https://example.test/watch/demo1](https://example.test/watch/demo1)",
    });
    set.open(state === "edit" || state === "add");
    setReady(true);
    // biome-ignore lint/correctness/useExhaustiveDependencies: set only when the scenario changes
  }, [state]);

  if (!ready) return null;
  return (
    <>
      <FloatingButtons
        useContext={
          (() => ({ removeContent: () => {} })) as unknown as Parameters<
            typeof FloatingButtons
          >[0]["useContext"]
        }
      />
      <UpdateModal
        updateContentFunc={() => set.open(false)}
        className="text-foreground font-sans"
      />
      {!open && state !== "new" && state !== "saved" && (
        <p className="fixed bottom-24 right-6 text-xs">
          closed — reload scenario
        </p>
      )}
    </>
  );
}

/**
 * Renders children in their own React root inside a real shadow root with the extension CSS copied
 * in, the way the content script mounts the overlay.
 */
function ShadowHost({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const store = useStore();
  const childrenRef = useRef(children);
  childrenRef.current = children;

  useEffect(() => {
    const host = hostRef.current as HTMLDivElement;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    root.replaceChildren(); // keep the effect idempotent (StrictMode, Suspense)
    for (const el of document.querySelectorAll("style[data-vite-dev-id]")) {
      if (!(el.getAttribute("data-vite-dev-id") ?? "").includes("ext.css"))
        continue;
      const style = document.createElement("style");
      // WXT's shadow-root UI rewrites :root to :host for the same reason.
      style.textContent = (el.textContent ?? "").replaceAll(":root", ":host");
      root.append(style);
    }
    const container = document.createElement("div");
    root.append(container);
    const reactRoot = createRoot(container);
    reactRoot.render(
      <Provider store={store}>
        <Suspense fallback={null}>
          <ThemeProvider container={container}>
            {childrenRef.current}
          </ThemeProvider>
        </Suspense>
      </Provider>,
    );
    return () => queueMicrotask(() => reactRoot.unmount());
  }, [store]);

  return <div ref={hostRef} />;
}

export default function Overlay({
  state,
  shadow,
}: {
  state: OverlayState;
  shadow: boolean;
}) {
  return (
    <div className="min-h-[calc(100vh-3rem)] bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 p-8 text-white">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="aspect-video bg-black/40 p-4 text-sm text-white/60">
          Placeholder page on a supported site (not real content)
        </div>
        <h1 className="text-xl font-semibold">Homemade pasta in 20 minutes</h1>
        <p className="text-sm text-white/60">
          The TagApp overlay sits on top of the page; the page keeps its own
          styles.
        </p>
      </div>
      {shadow ? (
        <ShadowHost>
          <Demo state={state} />
        </ShadowHost>
      ) : (
        <Demo state={state} />
      )}
    </div>
  );
}
