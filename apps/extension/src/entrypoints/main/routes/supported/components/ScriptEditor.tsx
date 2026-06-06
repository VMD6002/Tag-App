import { useState } from "react";
import { Save, Trash2, X, FileCode, Settings, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { cn } from "@/lib/utils";
import { useEditorState, useSiteActions, useSupportedSites, useImportExportActions } from "../SupportedSite.Context";


export default function ScriptEditor() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"script" | "metadata">("script");

  const supportedSites = useSupportedSites();
  const { siteDataEditorOpen, siteData, setSiteData, siteScript, setSiteScript, editingSiteName } = useEditorState();
  const { addSite, saveScript, removeSite, closeEditor } = useSiteActions();
  const { handleFileClick } = useImportExportActions();

  if (!siteDataEditorOpen) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-card/50 p-12 text-center min-h-[450px]">
        <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground border border-border">
          <FileCode className="size-8" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Script Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Select an existing userscript from the sidebar to view/edit it, or create a brand new one to customize tag
          download selectors.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={addSite} className="gap-1.5 shadow-xs cursor-pointer">
            <Plus className="size-4" />
            <span>New Userscript</span>
          </Button>
          <Button variant="outline" onClick={handleFileClick} className="gap-1.5 cursor-pointer">
            <Upload className="size-4" />
            <span>Import JSON</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card text-card-foreground shadow-xs overflow-hidden">
      {/* Editor Title & Action bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary">
            <FileCode className="size-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm leading-none">
              {editingSiteName ? `Editing: ${editingSiteName}` : "New Userscript"}
            </h2>
            {editingSiteName && (
              <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                {supportedSites[editingSiteName]?.hosts[0] || ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={saveScript}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
          >
            <Save className="size-4" />
            <span>Save</span>
          </Button>
          {editingSiteName && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeSite(editingSiteName)}
              className="gap-1.5 cursor-pointer"
            >
              <Trash2 className="size-4" />
              <span>Delete</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={closeEditor} title="Close Editor" className="size-8">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Tab Selection */}
      <div className="flex border-b border-border bg-muted/10 px-4">
        <button
          onClick={() => setActiveTab("script")}
          className={cn(
            "px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer",
            activeTab === "script"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <FileCode className="size-3.5" />
          Userscript Code
        </button>
        <button
          onClick={() => setActiveTab("metadata")}
          className={cn(
            "px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 cursor-pointer",
            activeTab === "metadata"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Settings className="size-3.5" />
          Site Metadata (JSON)
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-4">
        {activeTab === "script" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">JavaScript Userscript Body</Label>
              <span className="text-[10px] text-muted-foreground font-mono">Runs in context of target pages</span>
            </div>
            <div className="border border-border rounded-md overflow-hidden bg-background h-[550px] overflow-y-auto">
              <CodeEditor
                value={siteScript}
                language="js"
                placeholder="// Write userscript here..."
                onChange={(evn) => setSiteScript(evn.target.value)}
                padding={15}
                className="text-sm! min-h-full"
                style={{ fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace" }}
                data-color-mode={theme === "light" ? "light" : "dark"}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">JSON Metadata Configuration</Label>
              <span className="text-[10px] text-muted-foreground font-mono">Contains site name, hosts, presets</span>
            </div>
            <div className="border border-border rounded-md overflow-hidden bg-background h-[550px] overflow-y-auto">
              <CodeEditor
                value={siteData}
                language="json"
                placeholder="{ ... }"
                onChange={(evn) => setSiteData(evn.target.value)}
                padding={15}
                className="text-sm! min-h-full"
                style={{ fontFamily: "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace" }}
                data-color-mode={theme === "light" ? "light" : "dark"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
