import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagGroup from "./TagGroup";
import { useAtom, useAtomValue } from "jotai";
import { remoteParentTagsAtom, remoteTagsAtom, tagStringAtom } from "../atom";
import { useRemoteTagContext } from "../Remote.Tags.Context";

export default function TagsSection() {
  const { addTags, removeTags, fixTags } = useRemoteTagContext();
  const parentTags = useAtomValue(remoteParentTagsAtom);
  const tags = useAtomValue(remoteTagsAtom);

  const [selectedParent, setSelectedParent] = useState("");
  const [tagString, setTagString] = useAtom(tagStringAtom);

  const addTagFunc = useCallback(() => {
    if (!selectedParent) {
      alert("Please Select a parent tag first");
      return;
    }
    if (!tagString.trim()) {
      setTagString("");
      return;
    }
    const newTags = tagString
      .split(" ")
      .filter((a) => a)
      .map((a) => `${selectedParent}:${a}`);
    addTags(newTags);
    setTagString("");
  }, [tagString, selectedParent]);

  const removeTagFunc = useCallback(
    (tag: string) => {
      if (!confirm(`Confirm deletion of tag ${tag}`)) return;
      removeTags([tag]);
    },
    [removeTags],
  );

  const tagsArray = Object.keys(tags);
  const parentTagsArray = Object.keys(parentTags);

  return (
    <div className="grid gap-6">
      <div className="grid w-full h-fit max-w-sm mx-auto items-center">
        <div className="flex justify-between mb-1 items-center">
          <Label>Add Tags</Label>
          <Button
            onClick={fixTags}
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
          >
            Fix Tag Count
          </Button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTagFunc();
          }}
          className="grid mb-3"
        >
          <Select onValueChange={(selected) => setSelectedParent(selected)}>
            <SelectTrigger className="w-full rounded-b-none">
              <SelectValue placeholder="Select Parent" />
            </SelectTrigger>
            <SelectContent className="data-[side=bottom]:translate-y-0 data-[side=left]:translate-x-0 data-[side=right]:translate-x-0 data-[side=top]:translate-y-0 rounded-t-none max-w-sm min-w-0">
              <SelectGroup>
                {parentTagsArray.map((parent) => (
                  <SelectItem key={`Select-${parent}`} value={parent}>
                    {parent}
                  </SelectItem>
                ))}
              </SelectGroup>
              {!parentTagsArray.length ? (
                <>
                  <p className="max-w-xs w-11/12 mx-auto text-center py-4 text-muted-foreground">
                    No tags are present. Add tags <br /> to view them here...
                  </p>
                </>
              ) : (
                <></>
              )}
            </SelectContent>
          </Select>
          <Input
            className="rounded-t-none"
            value={tagString}
            onChange={(o) => setTagString(o.target.value)}
            type="text"
            placeholder="Tags, eg: Halo Melo"
          />
        </form>
        <Button onClick={addTagFunc} className="w-11/12 mx-auto">
          Add
        </Button>
      </div>
      {!tagsArray.length ? (
        <span className="text-muted-foreground text-xs text-center">
          No tags, add tags to view here...
        </span>
      ) : (
        <></>
      )}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 mb-10 rounded">
        <h1 className="text-3xl mb-5 text-foreground">
          Tags ({tagsArray.length})
        </h1>
        {[...new Set(tagsArray.map((k) => k.split(":")[0]))]
          .sort()
          .map((parent: string) => (
            <TagGroup
              tagsArray={tagsArray}
              key={parent}
              parent={parent}
              removeTagFunc={removeTagFunc}
            />
          ))}
      </div>
    </div>
  );
}
