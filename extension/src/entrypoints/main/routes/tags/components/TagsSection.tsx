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
import { useTagContext } from "../Tags.Context";
import type { TagContext } from "../Tags.Context";

export default function TagsSection() {
  const { removeTag, fixTagCount, tagParents, tags, setTags } =
    useTagContext() as TagContext;

  const [selectedParent, setSelectedParent] = useState("");
  const [tagString, setTagString] = useState("");

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
    setTags((oldTags) => {
      newTags.map((tag) => {
        if (tag in oldTags!) return;
        oldTags![tag] = { Count: 0 };
      });
      return { ...oldTags };
    });
    setTagString("");
  }, [tagString, selectedParent]);

  const removeTagFunc = useCallback(
    (tag: string) => {
      if (!confirm(`Confirm deletion of tag ${tag}`)) return;
      removeTag(tag);
    },
    [removeTag]
  );

  const tagsStringArray = useMemo(() => Object.keys(tags), [tags]);

  return (
    <div className="grid gap-6">
      <div className="grid w-full h-fit max-w-sm mx-auto items-center">
        <div className="flex justify-between mb-1 items-center">
          <Label>Add Tags</Label>
          <Button
            onClick={fixTagCount}
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
            <SelectContent className="data-[side=bottom]:translate-y-0 data-[side=left]:-translate-x-0 data-[side=right]:translate-x-0 data-[side=top]:-translate-y-0 rounded-t-none max-w-sm min-w-0">
              <SelectGroup>
                {tagParents.map((parent) => (
                  <SelectItem key={`Select-${parent}`} value={parent}>
                    {parent}
                  </SelectItem>
                ))}
              </SelectGroup>
              {!tagParents.length ? (
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
      {!tagsStringArray.length ? (
        <span className="text-muted-foreground text-xs text-center">
          No tags, add tags to view here...
        </span>
      ) : (
        <></>
      )}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 mb-10 rounded">
        <h1 className="text-3xl mb-5 text-foreground">
          Tags ({tagsStringArray.length})
        </h1>
        {[...new Set(tagsStringArray.map((k) => k.split(":")[0]))]
          .sort()
          .map((parent: string) => (
            <TagGroup
              tagsStringArray={tagsStringArray}
              key={parent}
              parent={parent}
              removeTagFunc={removeTagFunc}
            />
          ))}
      </div>
    </div>
  );
}
