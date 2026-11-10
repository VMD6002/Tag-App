import { useAtom, useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { confirm } from "@/components/craft/confirm-dialog";
import { TagGroups, TagSearchInput } from "@/components/craft/tags/TagGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { remoteParentTagsAtom, remoteTagsAtom, tagStringAtom } from "../atom";
import { useRemoteTagContext } from "../Remote.Tags.Context";

export default function TagsSection() {
  const { addTags, removeTags, fixTags, openCoverModal, fixingCounts } =
    useRemoteTagContext();
  const parentTags = useAtomValue(remoteParentTagsAtom);
  const tags = useAtomValue(remoteTagsAtom);

  const [selectedParent, setSelectedParent] = useState("");
  const [tagString, setTagString] = useAtom(tagStringAtom);
  const [query, setQuery] = useState("");

  const addTagFunc = useCallback(() => {
    if (!selectedParent) {
      toast.warning("Please Select a parent tag first");
      return;
    }
    if (!tagString.trim()) {
      setTagString("");
      return;
    }
    const newTags = tagString
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((a) => `${selectedParent}:${a}`);
    addTags(newTags);
    setTagString("");
  }, [tagString, selectedParent, setTagString, addTags]);

  const removeTagFunc = useCallback(
    (tag: string) =>
      confirm
        .destructive({
          title: "Delete this tag?",
          description: `"${tag}" will be deleted and removed from every item that uses it. This can't be undone.`,
          confirmText: "Delete tag",
        })
        .then((ok) => {
          if (ok) removeTags([tag]);
        }),
    [removeTags],
  );

  const tagCount = Object.keys(tags).length;
  const parentTagsArray = Object.keys(parentTags);

  return (
    <div className="grid grid-cols-1 gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTagFunc();
        }}
        className="grid gap-2 border bg-card/40 p-3 sm:grid-cols-[minmax(9rem,13rem)_1fr_auto]"
      >
        <div className="sm:col-span-3">
          <h2 className="text-sm font-semibold">Add tags</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick a group, then type one or more tag names separated by spaces.
          </p>
        </div>
        <Select
          onValueChange={(selected) =>
            selected && setSelectedParent(String(selected))
          }
        >
          <SelectTrigger className="w-full" aria-label="Group for the new tags">
            <SelectValue placeholder="Choose group" />
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className="max-w-sm min-w-0"
          >
            <SelectGroup>
              {parentTagsArray.map((parent) => (
                <SelectItem key={`Select-${parent}`} value={parent}>
                  {parent}
                </SelectItem>
              ))}
            </SelectGroup>
            {!parentTagsArray.length ? (
              <p className="mx-auto w-11/12 max-w-xs py-4 text-center text-xs text-muted-foreground">
                No groups yet. Add a group first.
              </p>
            ) : (
              <></>
            )}
          </SelectContent>
        </Select>
        <Input
          value={tagString}
          onChange={(o) => setTagString(o.target.value)}
          type="text"
          aria-label="New tag names"
          placeholder="Tag names, e.g. Cooking Travel"
        />
        <Button type="submit">Add tags</Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TagSearchInput value={query} onChange={setQuery} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {tagCount} {tagCount === 1 ? "tag" : "tags"}
          </span>
          <Button
            onClick={fixTags}
            disabled={fixingCounts}
            size="sm"
            variant="outline"
            title="Recount every tag from the items that use it. Use this if a number looks wrong."
          >
            Fix tag counts
          </Button>
        </div>
      </div>

      <TagGroups
        tags={tags}
        query={query}
        onCover={openCoverModal}
        onRemove={removeTagFunc}
      />
    </div>
  );
}
