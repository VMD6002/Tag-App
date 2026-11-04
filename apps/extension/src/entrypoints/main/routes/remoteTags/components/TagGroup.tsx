import { useAtomValue } from "jotai";
import { Image, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { remoteTagsAtom } from "../atom";
import { useRemoteTagContext } from "../Remote.Tags.Context";

type props = {
  tagsArray: string[];
  parent: string;
  removeTagFunc: any;
};
export default function TagGroup({ tagsArray, parent, removeTagFunc }: props) {
  const { openCoverModal } = useRemoteTagContext();
  const tags = useAtomValue(remoteTagsAtom);

  const Children = useMemo(
    () => tagsArray.filter((k) => k.split(":")[0] === parent).sort(),
    [tagsArray, parent],
  );

  return (
    <div key={parent} className="mb-3">
      <h1 className="text-xl mb-3 text-foreground">
        {parent.replaceAll("_", " ")} ({Children.length})
      </h1>
      <div className="grid gap-y-3 text-sm">
        {Children.map((tag) => (
          <div key={`${parent}-${tag}`} className="break-inside-avoid-column">
            {tags[tag]!.cover ? (
              <img
                alt={`${tag} cover`}
                loading="lazy"
                className="w-full"
                src={tags[tag]!.cover}
              />
            ) : null}
            <div className="bg-secondary flex place-items-center justify-between">
              <Button size={"icon"} onClick={() => openCoverModal(tag)}>
                <Image />
              </Button>
              <span className="mx-3 w-full">
                {String(tags[tag]!.count).padStart(3, "0")} |{" "}
                {tag.replace(`${parent}:`, "").replaceAll("_", " ")}
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
