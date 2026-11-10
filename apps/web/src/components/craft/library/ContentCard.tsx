import type { ContentWebType } from "@tagapp/utils/types";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const MAX_GROUPS = 3;
const MAX_PER_GROUP = 6;

const pretty = (s: string) => s.replaceAll("_", " ");

function TagList({ tags }: { tags: string[] }) {
  const [expanded, setExpanded] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const tag of [...tags].sort()) {
      const parent = tag.split(":")[0] as string;
      map.set(parent, [...(map.get(parent) ?? []), tag]);
    }
    return [...map.entries()].map(([parent, list]) => ({
      parent,
      values: list.map((t) => t.slice(parent.length + 1)),
    }));
  }, [tags]);

  if (!tags.length)
    return <p className="text-xs text-muted-foreground">No tags</p>;

  const shownGroups = expanded ? groups : groups.slice(0, MAX_GROUPS);
  const rows = shownGroups.map((g) => ({
    ...g,
    values: expanded ? g.values : g.values.slice(0, MAX_PER_GROUP),
  }));
  const hiddenTags =
    tags.length - rows.reduce((n, r) => n + r.values.length, 0);

  return (
    <div className="grid gap-1.5">
      {rows.map((g) => (
        <div key={g.parent} className="flex items-start gap-2">
          <span
            title={pretty(g.parent)}
            className="w-[4.5rem] shrink-0 truncate pt-0.5 text-[11px] leading-4 text-muted-foreground"
          >
            {pretty(g.parent)}
          </span>
          <ul className="flex min-w-0 flex-wrap gap-1">
            {g.values.map((v) => (
              <li
                key={v}
                className="max-w-full border bg-muted/50 px-1.5 py-0.5 text-[11px] leading-4 [overflow-wrap:anywhere]"
              >
                {pretty(v)}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {(hiddenTags > 0 || expanded) && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="w-fit cursor-pointer text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {expanded ? "Show fewer tags" : `Show ${hiddenTags} more`}
        </button>
      )}
    </div>
  );
}

type Props = {
  content: ContentWebType;
  /** Resolved (constants applied) page URL and cover URL. */
  url: string;
  cover: string;
  selection?: { on: boolean; selected: boolean; onToggle: () => void };
  onEdit?: () => void;
  onRemove?: () => void;
};

const ContentCard = memo(
  ({ content, url, cover, selection, onEdit, onRemove }: Props) => {
    const selectionOn = !!selection?.on;
    const selected = !!selection?.selected;
    const added = new Date(content.added * 1000);

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: whole-card click is a mouse shortcut; the checkbox button is the accessible control
      <article
        onClick={() => selectionOn && selection?.onToggle()}
        className={cn(
          "group/card relative flex h-fit flex-col border bg-card/40 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_26rem]",
          selected
            ? "border-foreground ring-1 ring-foreground"
            : "hover:border-foreground/30",
          selectionOn && "cursor-pointer",
        )}
      >
        <div className="relative flex min-h-32 items-center justify-center overflow-hidden border-b bg-muted/40">
          {cover ? (
            <img
              loading="lazy"
              className="max-h-72 w-full object-contain"
              src={cover}
              alt=""
            />
          ) : (
            <ImageOff
              className="size-6 text-muted-foreground/50"
              role="img"
              aria-label="No cover"
            />
          )}
          {selectionOn && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => selection?.onToggle()}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${content.title}`}
              className="absolute top-2 left-2 size-5 bg-background/90"
            />
          )}
        </div>

        <div className="grid gap-3 p-3">
          <div className="min-w-0">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block text-sm leading-snug font-semibold [overflow-wrap:anywhere] hover:underline focus-visible:underline"
            >
              {content.title}
            </a>
            <p
              title={`ID: ${content.id}`}
              className="mt-1 truncate font-mono text-[11px] text-muted-foreground/80"
            >
              {content.id}
            </p>
          </div>
          <TagList tags={content.tags} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t px-3 py-1.5">
          <time
            dateTime={added.toISOString()}
            className="text-[11px] text-muted-foreground"
          >
            {added.toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </time>
          {(onEdit || onRemove) && (
            <div className="flex items-center gap-0.5">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="xs"
                  disabled={selectionOn}
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering selection click handler
                    onEdit();
                  }}
                  aria-label={`Edit ${content.title}`}
                >
                  <Pencil />
                  Edit
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={selectionOn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  title="Remove from library"
                  aria-label={`Remove ${content.title}`}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          )}
        </div>
      </article>
    );
  },
);

ContentCard.displayName = "ContentCard";
export default ContentCard;
