import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type props = {
  tagsStringArray: string[];
  tags: TagType;
  parent: string;
  removeTagFunc: any;
};

export default function TagGroup({
  tagsStringArray,
  tags,
  parent,
  removeTagFunc,
}: props) {
  const Children = useMemo(
    () => tagsStringArray.filter((k) => k.startsWith(parent)).sort(),
    [tagsStringArray]
  );
  return (
    <div key={parent} className="mb-3">
      <h1 className="text-xl mb-3 text-foreground">
        {parent.replaceAll("_", " ")} ({Children.length})
      </h1>
      <div className="grid gap-y-1">
        {Children.map((childTag) => (
          <Button
            variant={"secondary"}
            key={`${parent}-${childTag}`}
            onClick={() => removeTagFunc(childTag)}
          >
            <span className="w-full text-left">
              {String(tags[childTag].Count).padStart(3, "0")} |{" "}
              {childTag.replace(parent + ":", "").replaceAll("_", " ")}
            </span>
            <X />
          </Button>
        ))}
      </div>
    </div>
  );
}
