import { useState } from "react";
import { Search, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSupportedSites, useEditorState, useSiteActions } from "../SupportedSite.Context";

function SiteCard({ siteName }: { siteName: string }) {
  const { editingSiteName } = useEditorState();
  const { selectSite, removeSite } = useSiteActions();
  const supportedSites = useSupportedSites();
  const isActive = editingSiteName === siteName;
  const site = supportedSites[siteName];
  const firstHost = site.hosts[0] || "";

  const [showHosts, setShowHosts] = useState(false);
  return (
    <div
      className={cn(
        "p-2 rounded-md transition-all border text-left",
        isActive
          ? "bg-accent border-accent-foreground/20 shadow-2xs"
          : "bg-transparent border-transparent hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "group flex items-center justify-between relative",
          isActive
            ? "text-accent-foreground shadow-2xs font-semibold"
            : "text-foreground",
        )} >
        <div onClick={() => selectSite(site)} className="flex items-center cursor-pointer gap-2.5 w-full">
          <img
            className="size-5 rounded bg-muted/80 border border-border shrink-0"
            src={`https://www.google.com/s2/favicons?sz=64&domain=${firstHost}`}
            alt=""
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="min-w-0">
            <p className="text-xs truncate font-medium">{siteName}</p>
            {!showHosts && <p className="text-[10px] text-muted-foreground truncate font-mono">{firstHost}{site.hosts.length > 1 ? ", ...hosts" : ""}</p>}
          </div>
        </div>
        <div className="flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon-xs"
            variant="outline"
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              removeSite(siteName);
            }}
            title={`Delete ${siteName}`}
          >
            <Trash2 className="size-3" />
          </Button>
          <Button
            onClick={() => setShowHosts(!showHosts)}
            size="icon-xs"
            variant="outline"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            title={showHosts ? "Hide Hosts" : "Show Hosts"}
          >
            {showHosts ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
          </Button>
        </div>
      </div>
      {showHosts && (
        <>
          <div className="mt-3 space-y-1 pl-6">
            {site.hosts.map((host, i) => (
              <a key={i} href={"https://" + host} target="_blank" className={`text-xs block w-fit text-primary/80 font-mono hover:text-accent-foreground transition-colors underline ${i !== site.hosts.length - 1 ? "pb-1" : ""}`}>
                {host}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SitesSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const supportedSites = useSupportedSites();

  const { addSite } = useSiteActions();

  const filteredSites = Object.keys(supportedSites)
    .sort()
    .filter((name) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const site = supportedSites[name];
      return (
        name.toLowerCase().includes(query) ||
        site.hosts.some((host) => host.toLowerCase().includes(query))
      );
    });

  return (
    <div className="lg:col-span-1 flex flex-col gap-4 border border-border rounded-lg bg-card p-4 shadow-2xs h-full">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm">Scripts List</h3>
        <Button variant="ghost" size="icon" onClick={addSite} title="New Userscript" className="size-8">
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sites or hosts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Sites List — single column on lg (sidebar), responsive grid below */}
      <div className="lg:grid lg:pr-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-1.5">
        {filteredSites.length > 0 ? (
          filteredSites.map((site) => <SiteCard siteName={site} key={`site-${site}`} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p className="text-xs">No sites found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
