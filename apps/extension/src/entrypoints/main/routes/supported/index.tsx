import { useSetAtom } from "jotai";
import {
  BookOpen,
  ChevronDown,
  Download,
  FolderSync,
  Plus,
  Upload,
} from "lucide-react";
import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GuideDialog, { guideOpenAtom } from "./components/GuideDialog";
import ScriptEditor from "./components/ScriptEditor";
import SitesSidebar from "./components/SitesSidebar";
import {
  SupportedSiteProvider,
  useImportExportActions,
  useSiteActions,
  useSupportedSites,
} from "./SupportedSite.Context";

export type { SiteData } from "./SupportedSite.Context";

function Toolbar() {
  const supportedSites = useSupportedSites();
  const setGuideOpen = useSetAtom(guideOpenAtom);
  const { addSite } = useSiteActions();
  const {
    exportSiteList,
    handleFileClick,
    importSiteList,
    fileInputRef,
    refreshSupportedHostsIndex,
  } = useImportExportActions();
  const count = Object.keys(supportedSites).length;

  return (
    <TitleHeader
      Title="Supported Sites"
      description={`${count} ${count === 1 ? "site" : "sites"} with a clip script. A script tells TagApp how to read the title, cover and tags from a page.`}
    >
      <input
        className="hidden"
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        onChange={importSiteList}
      />
      <Button size="sm" onClick={addSite}>
        <Plus />
        New script
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Site list
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuItem onClick={handleFileClick}>
            <Download />
            Import site list (JSON)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportSiteList}>
            <Upload />
            Export site list (JSON)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => refreshSupportedHostsIndex()}>
            <FolderSync />
            Rebuild host index
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={() => setGuideOpen(true)}>
        <BookOpen />
        Scripting guide
      </Button>
    </TitleHeader>
  );
}

function SupportedLayout() {
  return (
    <div className="pb-10">
      <Toolbar />
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <SitesSidebar />
        <ScriptEditor />
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
