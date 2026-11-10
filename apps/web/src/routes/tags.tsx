import type { TagsType } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/craft/EmptyState";
import TitleHeader from "@/components/craft/TitleHeader";
import { TagGroups, TagSearchInput } from "@/components/craft/tags/TagGroups";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";

export default function RemoteTags() {
  const [tags, setTags] = useState<TagsType>({});
  const [query, setQuery] = useState("");

  const getTagsMutation = useMutation(
    orpc.tags.getTagData.mutationOptions({
      onSuccess: (res) => {
        setTags(res.tags);
      },
    }),
  );

  const fixTagCountMutation = useMutation(
    orpc.tags.fixTagCount.mutationOptions({
      onSuccess: (res) => setTags(res.tags),
    }),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch tags when the server changes
  useEffect(() => {
    getTagsMutation.mutate({});
  }, [orpc]); // react-doctor-disable-line react-doctor/exhaustive-deps

  const tagCount = Object.keys(tags).length;
  const loading = getTagsMutation.isPending || getTagsMutation.isIdle;

  return (
    <>
      <TitleHeader
        Title="Tags"
        description={`${tagCount} ${tagCount === 1 ? "tag" : "tags"} on the server, grouped by the part before the colon. The number is how many items use the tag.`}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={fixTagCountMutation.isPending}
          title="Recount every tag from the items that use it. Use this if a number looks wrong."
          onClick={() => fixTagCountMutation.mutate({})}
        >
          {fixTagCountMutation.isPending ? "Recounting…" : "Fix tag counts"}
        </Button>
      </TitleHeader>

      <div className="mb-6">
        <TagSearchInput value={query} onChange={setQuery} />
      </div>

      {getTagsMutation.isError ? (
        <ErrorState
          title="Couldn't load tags"
          message={getTagsMutation.error?.message}
          onRetry={() => getTagsMutation.mutate({})}
        />
      ) : loading && !tagCount ? (
        <LoadingState label="Loading tags…" />
      ) : (
        <TagGroups tags={tags} query={query} />
      )}
    </>
  );
}
