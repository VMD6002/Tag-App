import { Button } from "@/components/ui/button";
import { X, Image } from "lucide-react";
import { useTagContext } from "../Tags.Context";
import type { TagContext } from "../Tags.Context";

type props = {
  tagsStringArray: string[];
  parent: string;
  removeTagFunc: any;
};

export default function TagGroup({
  tagsStringArray,
  parent,
  removeTagFunc,
}: props) {
  const { openCoverModal, getCover, tags } = useTagContext() as TagContext;
  const Children = useMemo(
    () => tagsStringArray.filter((k) => k.startsWith(parent)).sort(),
    [tagsStringArray]
  );

  return (
    <div key={parent} className="mb-3">
      <h1 className="text-xl mb-3 text-foreground">
        {parent.replaceAll("_", " ")} ({Children.length})
      </h1>
      <div className="grid gap-y-5 text-sm">
        {Children.map((tag) => (
          <div key={`${parent}-${tag}`} className="break-inside-avoid-column">
            <img
              className="w-full"
              src={
                tags[tag].CoverUrl ? getCover(tags[tag].CoverUrl) : undefined
              }
            />
            <div className="bg-secondary flex place-items-center justify-between">
              <Button size={"icon"} onClick={() => openCoverModal(tag)}>
                <Image />
              </Button>
              <span className="mx-3 w-full">
                {String(tags[tag].Count).padStart(3, "0")} |{" "}
                {tag.replace(parent + ":", "").replaceAll("_", " ")}
              </span>
              <Button size={"icon"} onClick={() => removeTagFunc(tag)}>
                <X />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
