import { useState } from "react";
import { Search, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSupportedSites, useEditorState, useSiteActions } from "../SupportedSite.Context";

export default function SitesSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const supportedSites = useSupportedSites();
  const { editingSiteName } = useEditorState();
  const { addSite, selectSite, removeSite } = useSiteActions();

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
          filteredSites.map((Site) => {
            const isActive = editingSiteName === Site;
            const site = supportedSites[Site];
            const firstHost = site.hosts[0] || "";
            return (
              <div
                key={`site-${Site}`}
                onClick={() => selectSite(site)}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all border text-left",
                  isActive
                    ? "bg-accent border-accent-foreground/20 text-accent-foreground shadow-2xs font-semibold"
                    : "bg-transparent border-transparent hover:bg-muted/50 text-foreground",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    className="size-5 rounded bg-muted/80 border border-border shrink-0"
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${firstHost}`}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs truncate font-medium">{Site}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">{firstHost}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSite(Site);
                    }}
                    className="p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                    title={`Delete ${Site}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <p className="text-xs">No sites found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
