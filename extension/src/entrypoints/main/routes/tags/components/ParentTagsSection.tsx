import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function ParentTagsSection() {
  const [parentString, setParentString] = useState("");
  const { tagParents, setTagParents, removeParent } = useTagData();

  const addParentFunc = useCallback(() => {
    // @ts-ignore
    setTagParents((old: string[]) => {
      const Temp = [
        ...new Set([...parentString.split(" ").filter((val) => val), ...old]),
      ];
      return Temp;
    });
    setTimeout(() => setParentString(""), 0);
  }, [parentString]);

  const removeParentFunc = useCallback(
    (parent: string) => () => {
      if (
        !confirm(
          `Confirm deletion of parent tag ${parent}.\nNote: Every related child tag will also be deleted`
        )
      )
        return;
      removeParent(parent);
    },
    [removeParent]
  );

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
        {tagParents
          .filter((parent) => parent !== "Site")
          .toSorted()
          .map((parent) => (
            <Button
              variant={"secondary"}
              key={`List-item-${parent}`}
              size="sm"
              onClick={removeParentFunc(parent)}
            >
              {parent}
              <X />
            </Button>
          ))}
        {!tagParents.length ? (
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
