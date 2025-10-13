import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ServerIcon } from "lucide-react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const ToBeLoaded = ({ overwrite, setOverwrite }: any) => {
  const orpc = useOrpc();
  const { tags, tagParents, setTags, setTagParents } = useTagData();
  const GetTagsFromServerQuery = useMutation(
    orpc.webSync.getTags.mutationOptions({
      onSuccess: (res) => {
        setTags(res.tags);
        setTagParents(res.tagParents);
      },
    })
  );
  const getFunc = useCallback(() => {
    GetTagsFromServerQuery.mutate({});
  }, []);

  const SetServerTagsMutation = useMutation(
    orpc.webSync.setTags.mutationOptions()
  );
  const setFunc = useCallback(() => {
    SetServerTagsMutation.mutate({ tags, tagParents });
  }, [tags, tagParents]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="fixed bg-background border-[.063rem] border-foreground top-auto bottom-5 left-auto right-5 p-2 rounded-sm">
        <ServerIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="-translate-x-5 p-0 border-foreground">
        <div className="p-1">
          <div className="flex items-center w-full px-2 py-2">
            Overwrite{" "}
            <Switch
              checked={overwrite}
              onCheckedChange={(o) => setOverwrite(o)}
              className="ml-2"
            />
          </div>
          <DropdownMenuSeparator className="bg-foreground" />
          <DropdownMenuItem onClick={setFunc}>Set</DropdownMenuItem>
          <DropdownMenuItem onClick={getFunc}>Get</DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function ServerAffix() {
  const { serverUrl, serverFeatures, overwrite, setOverwrite } =
    useSettingsData();

  if (!serverFeatures) return <></>;

  return (
    <QueryClientProvider client={queryClient}>
      <ToBeLoaded overwrite={overwrite} setOverwrite={setOverwrite} />
    </QueryClientProvider>
  );
}
