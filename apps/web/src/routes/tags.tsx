import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { orpc } from "@/lib/orpc";
import type { TagsType } from "@tagapp/utils/types";

function TagGroup({
  tags,
  tagsArray,
  parent,
}: {
  tags: TagsType;
  tagsArray: string[];
  parent: string;
}) {
  const Children = useMemo(
    () => tagsArray.filter((k) => k.startsWith(parent)).sort(),
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
            {tags[tag].cover ? (
              <img loading="lazy" className="w-full" src={tags[tag].cover} />
            ) : (
              <></>
            )}
            <div className="bg-secondary flex place-items-center justify-between">
              <span className="mx-3 w-full">
                {String(tags[tag].count).padStart(3, "0")} |{" "}
                {tag.replace(parent + ":", "").replaceAll("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RemoteTags() {
  const [tags, setTags] = useState<TagsType>({});

  const getTagsMutation = useMutation(
    orpc.tags.getTagData.mutationOptions({
      onSuccess: (res) => {
        setTags(res.tags);
      },
    }),
  );

  const fixTagCountMutation = useMutation(
    orpc.tags.fixTagCount.mutationOptions(),
  );

  useEffect(() => {
    getTagsMutation.mutate({});
  }, [orpc]);

  const taags = useMemo(() => Object.keys(tags), [tags]);

  return (
    <>
      <TitleHeader Title="Server Tags" />
      <Button
        variant="secondary"
        className="rounded-none"
        onClick={() => fixTagCountMutation.mutate({})}
      >
        Fix Count
      </Button>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 mb-10 rounded">
        <h1 className="text-3xl mb-5 text-foreground">Tags ({taags.length})</h1>
        {[...new Set(taags.map((tag) => tag.split(":")[0]))]
          .sort()
          .map((parent: string) => (
            <TagGroup
              key={parent}
              parent={parent}
              tags={tags}
              tagsArray={taags}
            />
          ))}
      </div>
    </>
  );
}
