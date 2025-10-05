import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const TagGroup = ({
  tags,
  parent,
}: {
  tags: ServerTagType;
  parent: string;
}) => {
  const Children = useMemo(
    () =>
      Object.keys(tags)
        .filter((k) => k.startsWith(parent))
        .sort(),
    [tags, parent]
  );
  return (
    <div key={`Section-${parent}`} className="mb-3">
      <h2 className="text-xl mb-3 text-foreground">
        {parent.replaceAll("_", " ")} ({Children.length})
      </h2>
      <div className="grid gap-y-1">
        {Children.map((tag) => (
          <span
            key={tag}
            className="bg-secondary text-secondary-foreground rounded-md text-sm shadow-xs px-4 py-2"
          >
            {String(tags[tag]).padStart(3, "0")} |{" "}
            {tag.replace(parent + ":", "").replaceAll("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
};

function Child() {
  const orpc = useOrpc();
  const [tags, setTags] = useState<ServerTagType>({});

  const GetTagsFromServerQuery = useQuery(
    orpc.main.getServerTags.queryOptions()
  );

  const FixServerTagsMutation = useMutation(
    orpc.fix.hardResetTagCount.mutationOptions()
  );

  const RemoveUnusedServerTagsMutation = useMutation(
    orpc.fix.hardResetTagCount.mutationOptions({
      onSuccess: () => {
        setTags((old) => {
          const temp = { ...old };
          for (const tag in temp) {
            if (!temp[tag]) delete temp[tag];
          }
          return temp;
        });
      },
    })
  );

  useEffect(() => {
    const Data = GetTagsFromServerQuery.data ?? {};
    setTags(Data);
  }, [GetTagsFromServerQuery.data]);

  return (
    <>
      <TitleHeader Title="Server Tags" />
      <div className="grid sm:grid-cols-2 max-w-sm mx-auto mb-20 rounded-md overflow-hidden">
        <Button
          className="rounded-none"
          onClick={() => RemoveUnusedServerTagsMutation.mutate({})}
        >
          Remove Unused Tags
        </Button>
        <Button
          variant="secondary"
          className="rounded-none"
          onClick={() => FixServerTagsMutation.mutate({})}
        >
          Fix Count
        </Button>
      </div>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 mb-10 rounded">
        <h1 className="text-3xl mb-5 text-foreground">Tags ({tags.length})</h1>
        {[...new Set(Object.keys(tags).map((tag) => tag.split(":")[0]))]
          .sort()
          .map((parent: string) => (
            <TagGroup key={parent} parent={parent} tags={tags} />
          ))}
      </div>
    </>
  );
}

export default function ServerTags() {
  return (
    <QueryClientProvider client={queryClient}>
      <Child />
    </QueryClientProvider>
  );
}
