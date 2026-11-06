import CodeEditor from "@uiw/react-textarea-code-editor";
import { useAtomValue } from "jotai";
import {
  Download,
  FileCode,
  Minus,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { enableAfterAddRemoveScriptsAtom } from "@/entrypoints/main/atoms/supportedSites";
import { cn } from "@/lib/utils";
import {
  useEditorState,
  useImportExportActions,
  useSiteActions,
  useSupportedSites,
} from "../SupportedSite.Context";

type Tab = "script" | "metadata" | "afterAdd" | "afterRemove";

const FONT =
  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace";

export default function ScriptEditor() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("script");

  const supportedSites = useSupportedSites();
  const {
    siteDataEditorOpen,
    siteData,
    setSiteData,
    siteScript,
    setSiteScript,
    afterAddScript,
    setAfterAddScript,
    afterRemoveScript,
    setAfterRemoveScript,
    editingSiteName,
  } = useEditorState();
  const { addSite, saveScript, removeSite, closeEditor } = useSiteActions();
  const { handleFileClick } = useImportExportActions();

  const enableAfterAddRemoveScripts = useAtomValue(
    enableAfterAddRemoveScriptsAtom,
  );

  if (!siteDataEditorOpen) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center border border-dashed bg-card/20 p-10 text-center lg:h-[calc(100dvh-14rem)]">
        <div className="mb-4 grid size-10 place-items-center border bg-muted/50 text-muted-foreground">
          <FileCode className="size-5" />
        </div>
        <h2 className="mb-1 text-base font-semibold">No script open</h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Pick a script from the list to edit it, start a new one, or import a
          site list you exported earlier.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={addSite} className="cursor-pointer">
            <Plus />
            New script
          </Button>
          <Button
            variant="outline"
            onClick={handleFileClick}
            className="cursor-pointer"
          >
            <Download />
            Import site list
          </Button>
        </div>
      </div>
    );
  }

  const tabs: {
    id: Tab;
    label: string;
    icon: typeof FileCode;
    title: string;
    hint: string;
    value: string;
    set: (v: string) => void;
    language: string;
    placeholder: string;
  }[] = [
    {
      id: "script",
      label: "Script",
      icon: FileCode,
      title: "JavaScript for this site",
      hint: "Runs on matching pages and reads the title, cover and tags",
      value: siteScript,
      set: setSiteScript,
      language: "js",
      placeholder: "// Write the site script here...",
    },
    {
      id: "metadata",
      label: "Site settings (JSON)",
      icon: Settings,
      title: "Site settings",
      hint: "Name, hosts, URL patterns and download presets",
      value: siteData,
      set: setSiteData,
      language: "json",
      placeholder: "{ ... }",
    },
    ...(enableAfterAddRemoveScripts
      ? ([
          {
            id: "afterAdd",
            label: "After add",
            icon: Plus,
            title: "After add script",
            hint: "Runs after an item from this site is saved",
            value: afterAddScript,
            set: setAfterAddScript,
            language: "js",
            placeholder: "// Write the after add script here...",
          },
          {
            id: "afterRemove",
            label: "After remove",
            icon: Minus,
            title: "After remove script",
            hint: "Runs after an item from this site is removed",
            value: afterRemoveScript,
            set: setAfterRemoveScript,
            language: "js",
            placeholder: "// Write the after remove script here...",
          },
        ] as const)
      : []),
  ];
  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0]!;

  return (
    <div className="flex min-h-96 min-w-0 flex-col border bg-card/40 lg:h-[calc(100dvh-14rem)] lg:min-h-[30rem]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {editingSiteName ?? "New script"}
          </h2>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {editingSiteName
              ? supportedSites[editingSiteName]?.hosts[0] || "no host set"
              : "Not saved yet"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" onClick={saveScript} className="cursor-pointer">
            <Save />
            Save script
          </Button>
          {editingSiteName && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeSite(editingSiteName)}
              className="cursor-pointer text-destructive hover:text-destructive"
            >
              <Trash2 />
              Delete
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeEditor}
            title="Close editor"
            aria-label="Close editor"
          >
            <X />
          </Button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Script parts"
        className="flex shrink-0 overflow-x-auto overflow-y-hidden border-b px-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={current.id === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "-mb-px flex cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium outline-none transition-colors focus-visible:bg-muted",
              current.id === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-3">
          <Label className="text-xs font-semibold">{current.title}</Label>
          <span className="text-[11px] text-muted-foreground">
            {current.hint}
          </span>
        </div>
        <div
          role="tabpanel"
          className="h-96 min-h-0 flex-1 overflow-y-auto border bg-background lg:h-auto"
        >
          <CodeEditor
            key={current.id}
            value={current.value}
            language={current.language}
            placeholder={current.placeholder}
            onChange={(evn) => current.set(evn.target.value)}
            padding={15}
            className="min-h-full text-sm!"
            style={{ fontFamily: FONT }}
            data-color-mode={theme === "light" ? "light" : "dark"}
          />
        </div>
      </div>
    </div>
  );
}
