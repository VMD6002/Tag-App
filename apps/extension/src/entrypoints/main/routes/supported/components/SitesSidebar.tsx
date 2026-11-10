import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type SiteData,
  useEditorState,
  useSiteActions,
  useSupportedSites,
} from "../SupportedSite.Context";

function SiteCard({ siteName, site }: { siteName: string; site: SiteData }) {
  const { editingSiteName } = useEditorState();
  const { selectSite, removeSite } = useSiteActions();
  const isActive = editingSiteName === siteName;
  const firstHost = site.hosts[0] || "";

  const [showHosts, setShowHosts] = useState(false);
  return (
    <li
      className={cn(
        "border-l-2 transition-colors",
        isActive
          ? "border-foreground bg-accent"
          : "border-transparent hover:bg-muted/60",
      )}
    >
      <div className="group flex items-center gap-1 pr-1">
        <button
          type="button"
          onClick={() => selectSite(site)}
          aria-current={isActive ? "true" : undefined}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 bg-transparent py-2 pl-2.5 text-left outline-none focus-visible:bg-muted"
        >
          <img
            className="size-5 shrink-0 border bg-muted/80"
            src={`https://www.google.com/s2/favicons?sz=64&domain=${firstHost}`}
            alt=""
            onError={(e) => {
              (e.target as HTMLElement).style.visibility = "hidden";
            }}
          />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-xs",
                isActive ? "font-semibold" : "font-medium",
              )}
            >
              {siteName}
            </span>
            <span className="block truncate font-mono text-[10px] text-muted-foreground">
              {firstHost}
              {site.hosts.length > 1 ? ` +${site.hosts.length - 1}` : ""}
            </span>
          </span>
        </button>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button
            onClick={() => setShowHosts(!showHosts)}
            size="icon-xs"
            variant="ghost"
            aria-expanded={showHosts}
            aria-label={`${showHosts ? "Hide" : "Show"} hosts of ${siteName}`}
            title={showHosts ? "Hide hosts" : "Show hosts"}
          >
            {showHosts ? <ChevronDown /> : <ChevronRight />}
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeSite(siteName);
            }}
            aria-label={`Delete ${siteName}`}
            title={`Delete ${siteName}`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {showHosts && (
        <ul className="space-y-1 pr-2 pb-2 pl-10">
          {site.hosts.map((host) => (
            <li key={host}>
              <a
                href={`https://${host}`}
                target="_blank"
                className="block w-fit font-mono text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                rel="noopener"
              >
                {host}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SitesSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const supportedSites = useSupportedSites();

  const { addSite } = useSiteActions();

  const filteredSites = Object.entries(supportedSites)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .filter(([name, site]) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        name.toLowerCase().includes(query) ||
        site.hosts.some((host) => host.toLowerCase().includes(query))
      );
    });

  return (
    <aside
      aria-label="Site scripts"
      className="flex h-96 min-h-0 flex-col gap-3 border bg-card/40 p-3 lg:h-[calc(100dvh-14rem)] lg:min-h-[30rem]"
    >
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold">Scripts</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={addSite}
          title="New script"
          aria-label="New script"
        >
          <Plus />
        </Button>
      </div>

      <div className="relative shrink-0">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search names or hosts…"
          aria-label="Search scripts by name or host"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 text-xs"
        />
      </div>

      <ul className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {filteredSites.length > 0 ? (
          filteredSites.map(([name, site]) => (
            <SiteCard siteName={name} site={site} key={`site-${name}`} />
          ))
        ) : (
          <li className="py-8 text-center text-xs text-muted-foreground">
            {Object.keys(supportedSites).length
              ? "No scripts match that search."
              : "No scripts yet. Create one to get started."}
          </li>
        )}
      </ul>
    </aside>
  );
}
