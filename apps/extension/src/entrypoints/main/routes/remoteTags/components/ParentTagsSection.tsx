import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { parentTagStringAtom, remoteParentTagsAtom } from "../atom";
import { useRemoteTagContext } from "../Remote.Tags.Context";

export default function ParentTagsSection() {
  const [parentString, setParentString] = useAtom(parentTagStringAtom);
  const parentTags = useAtomValue(remoteParentTagsAtom);
  const { addParentTags, removeParentTags } = useRemoteTagContext();

  const addParentFunc = useCallback(() => {
    addParentTags(parentString.trim().split(/\s+/).filter(Boolean));
  }, [parentString]);

  const removeParentFunc = useCallback(
    (parent: string) => () => {
      if (
        !confirm(
          `Confirm deletion of parent tag ${parent}.\nNote: Every related child tag will also be deleted`,
        )
      )
        return;
      removeParentTags([parent]);
    },
    [removeParentTags],
  );

  const parentTagsArray = Object.keys(parentTags);

  return (
    <div className="grid gap-6 mb-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addParentFunc();
        }}
        className="grid w-full h-fit max-w-sm mx-auto items-center gap-3"
      >
        <Label>Add Parent Tags</Label>
        <Input
          value={parentString}
          onChange={(o) => setParentString(o.target.value)}
          type="text"
          placeholder="Parent Tags, eg: Halo Melo"
        />
        <Button onClick={addParentFunc} className="w-11/12 mx-auto">
          Add
        </Button>
      </form>
      <div className="flex w-fit gap-2 flex-wrap mx-auto">
        {parentTagsArray
          .filter((parentTag) => parentTag !== "Site")
          .toSorted()
          .map((parentTag) => (
            <Button
              variant={"secondary"}
              key={`List-item-${parentTag}`}
              size="sm"
              onClick={removeParentFunc(parentTag)}
            >
              {parentTag.replaceAll("_", " ")}
              <X />
            </Button>
          ))}
        {!parentTagsArray.length ? (
          <span className="text-muted-foreground text-xs">
            No parent tags are present. Add parent tags to view them here...
          </span>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
