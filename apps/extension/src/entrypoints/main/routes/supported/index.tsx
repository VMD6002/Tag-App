import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { Upload, Download, RefreshCw, BookOpen } from "lucide-react";

import {
  SupportedSiteProvider,
  useSupportedSites,
  useImportExportActions,
} from "./SupportedSite.Context";
import SitesSidebar from "./components/SitesSidebar";
import ScriptEditor from "./components/ScriptEditor";
import GuideDialog, { guideOpenAtom } from "./components/GuideDialog";
import { useSetAtom } from "jotai";

export type { SiteData } from "./SupportedSite.Context";

function Toolbar() {
  const supportedSites = useSupportedSites();
  const setGuideOpen = useSetAtom(guideOpenAtom);
  const { exportSiteList, handleFileClick, importSiteList, fileInputRef, refreshSupportedHostsIndex } =
    useImportExportActions();

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TitleHeader Title="Supported Sites" />
          <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-semibold border border-border">
            {Object.keys(supportedSites).length} Total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="hidden"
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={importSiteList}
          />
          <Button variant="outline" size="sm" onClick={handleFileClick} className="gap-1.5 h-9">
            <Upload className="size-4" />
            <span>Import</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportSiteList} className="gap-1.5 h-9">
            <Download className="size-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => refreshSupportedHostsIndex()} className="gap-1.5 h-9">
            <RefreshCw className="size-4" />
            <span>Refresh Index</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setGuideOpen(true)} className="gap-1.5 h-9">
            <BookOpen className="size-4" />
            <span>Guide</span>
          </Button>
        </div>
      </div>
    </div>
  );
}


function SupportedLayout() {
  return (
    <div className="space-y-6">
      <Toolbar />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ScriptEditor />
        </div>
        <SitesSidebar />
      </div>
      <GuideDialog />
    </div>
  );
}


export default function Supported() {
  return (
    <SupportedSiteProvider>
      <SupportedLayout />
    </SupportedSiteProvider>
  );
}
