import { Button } from "@/components/ui/button";
import { X, Image } from "lucide-react";
import { useTagContext } from "../Tags.Context";
import { useAtomValue } from "jotai";
import { tagsAtom } from "@/entrypoints/main/atoms/tags";

type props = {
  tagsStringArray: string[];
  parent: string;
  removeTagFunc: any;
};
``;
export default function TagGroup({
  tagsStringArray,
  parent,
  removeTagFunc,
}: props) {
  const { openCoverModal, getCover } = useTagContext();
  const tags = useAtomValue(tagsAtom);

  const Children = useMemo(
    () => tagsStringArray.filter((k) => k.startsWith(parent)).sort(),
    [tagsStringArray, parent],
  );

  return (
    <div key={parent} className="mb-3">
      <h1 className="text-xl mb-3 text-foreground">
        {parent.replaceAll("_", " ")} ({Children.length})
      </h1>
      <div className="grid gap-y-3 text-sm">
        {Children.map((tag) => (
          <div key={`${parent}-${tag}`} className="break-inside-avoid-column">
            {tags[tag].CoverUrl ? (
              <img
                loading="lazy"
                className="w-full"
                src={getCover(tags[tag].CoverUrl)}
              />
            ) : (
              <></>
            )}
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
