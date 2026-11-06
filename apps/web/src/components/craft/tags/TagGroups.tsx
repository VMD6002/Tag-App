import { ImageIcon, Search, SearchX, X } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/craft/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TagInfo = { count: number; cover?: string };

const pretty = (s: string) => s.replaceAll("_", " ");

export function TagSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Find a tag…"
        aria-label="Find a tag"
        className="pl-8"
      />
    </div>
  );
}

/**
 * Tags grouped by their parent (the part before the colon), one block per group.
 * `query` is a client-side filter only. Cover/remove buttons render when handlers are given.
 */
export function TagGroups({
  tags,
  query,
  onCover,
  onRemove,
}: {
  tags: Record<string, TagInfo>;
  query: string;
  onCover?: (tag: string) => void;
  onRemove?: (tag: string) => void;
}) {
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, string[]>();
    for (const tag of Object.keys(tags).sort()) {
      if (q && !tag.toLowerCase().includes(q)) continue;
      const parent = tag.split(":")[0] as string;
      map.set(parent, [...(map.get(parent) ?? []), tag]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tags, query]);

  if (!groups.length)
    return query.trim() ? (
      <EmptyState
        icon={SearchX}
        title={`No tags match "${query.trim()}"`}
        description="Check the spelling or try a shorter search."
        className="py-10"
      />
    ) : (
      <EmptyState
        title="No tags yet"
        description="Add a tag group, then add tags to it. Tags also appear here when you save items."
        className="py-10"
      />
    );

  return (
    <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
      {groups.map(([parent, list]) => (
        <section key={parent} className="mb-8 break-inside-avoid">
          <h3 className="mb-1 flex items-baseline justify-between gap-2 border-b pb-1.5 text-sm font-semibold">
            <span className="min-w-0 truncate" title={parent}>
              {pretty(parent)}
            </span>
            <span className="shrink-0 text-xs font-normal text-muted-foreground tabular-nums">
              {list.length} {list.length === 1 ? "tag" : "tags"}
            </span>
          </h3>
          <ul>
            {list.map((tag) => {
              const info = tags[tag] as TagInfo;
              return (
                <li key={tag} className="py-0.5">
                  {info.cover && (
                    <img
                      alt={`${tag} cover`}
                      loading="lazy"
                      className="mb-1 max-h-32 w-full border bg-muted/40 object-contain"
                      src={info.cover}
                    />
                  )}
                  <div className="group/tag flex items-center gap-1 hover:bg-muted/60">
                    {onCover && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onCover(tag)}
                        aria-label={`Set cover for ${tag}`}
                        title={info.cover ? "Change cover" : "Set cover"}
                        className={
                          info.cover
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        <ImageIcon />
                      </Button>
                    )}
                    <span
                      className={`min-w-0 flex-1 truncate py-1 text-sm ${onCover ? "" : "pl-2"}`}
                      title={tag}
                    >
                      {pretty(tag.slice(parent.length + 1))}
                    </span>
                    <span
                      className="text-xs text-muted-foreground tabular-nums"
                      title={`${info.count} ${info.count === 1 ? "item" : "items"}`}
                    >
                      {info.count}
                    </span>
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemove(tag)}
                        aria-label={`Delete tag ${tag}`}
                        title="Delete tag"
                        className="text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive"
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
