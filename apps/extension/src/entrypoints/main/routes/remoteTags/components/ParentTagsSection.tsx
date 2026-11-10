import { useAtom, useAtomValue } from "jotai";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { confirm } from "@/components/craft/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  parentTagStringAtom,
  remoteParentTagsAtom,
  remoteTagsAtom,
} from "../atom";
import { useRemoteTagContext } from "../Remote.Tags.Context";

export default function ParentTagsSection() {
  const [parentString, setParentString] = useAtom(parentTagStringAtom);
  const parentTags = useAtomValue(remoteParentTagsAtom);
  const tags = useAtomValue(remoteTagsAtom);
  const { addParentTags, removeParentTags } = useRemoteTagContext();

  const addParentFunc = useCallback(() => {
    addParentTags(parentString.trim().split(/\s+/).filter(Boolean));
  }, [parentString, addParentTags]);

  const removeParentFunc = useCallback(
    (parent: string) => () =>
      confirm
        .destructive({
          title: `Delete the ${parent} group?`,
          description: `Every tag in ${parent} will be deleted too, and removed from all items that use them. This can't be undone.`,
          confirmText: "Delete group",
        })
        .then((ok) => {
          if (ok) removeParentTags([parent]);
        }),
    [removeParentTags],
  );

  const parentTagsArray = Object.keys(parentTags);
  const countByParent = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tag of Object.keys(tags)) {
      const parent = tag.split(":")[0] as string;
      map[parent] = (map[parent] ?? 0) + 1;
    }
    return map;
  }, [tags]);

  return (
    <section
      aria-labelledby="tag-groups-heading"
      className="grid grid-cols-1 gap-3 border bg-card/40 p-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="tag-groups-heading" className="text-sm font-semibold">
            Tag groups
          </h2>
          <p className="mt-0.5 max-w-prose text-xs text-muted-foreground">
            A group is the part before the colon: <code>Type</code> in{" "}
            <code>Type:Video</code>. Deleting a group deletes all of its tags.
            The built-in Site group can't be deleted.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addParentFunc();
          }}
          className="flex w-full gap-2 sm:w-auto"
        >
          <Input
            value={parentString}
            onChange={(o) => setParentString(o.target.value)}
            type="text"
            aria-label="New group names"
            placeholder="New groups, e.g. Topic Mood"
            className="sm:w-64"
          />
          <Button type="submit">Add group</Button>
        </form>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {parentTagsArray
          .filter((parent) => parent !== "Site")
          .toSorted()
          .map((parent) => (
            <li
              key={`List-item-${parent}`}
              className="inline-flex items-stretch border bg-muted/40 text-sm"
            >
              <span className="flex items-center gap-1.5 py-1 pr-1 pl-2.5">
                {parent.replaceAll("_", " ")}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {countByParent[parent] ?? 0}
                </span>
              </span>
              <button
                type="button"
                onClick={removeParentFunc(parent)}
                aria-label={`Delete group ${parent}`}
                title="Delete group and its tags"
                className="grid cursor-pointer place-items-center px-1.5 text-muted-foreground/60 outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        {!parentTagsArray.length && (
          <li className="text-xs text-muted-foreground">
            No groups yet. Add one above to start organising tags.
          </li>
        )}
      </ul>
    </section>
  );
}
