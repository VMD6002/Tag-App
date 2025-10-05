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
  useQuery,
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
import { useLocal } from "../Local.Context";
import type { LocalContext } from "../Local.Context";

const ToBeLoaded = ({ overwrite, setOverwrite }: any) => {
  const orpc = useOrpc();
  const { contentData, setContentData, filtered, getDataGivenKeys } =
    useLocal() as LocalContext;

  const GetWebContentServerQuery = useQuery(
    orpc.webSync.getContentData.queryOptions({
      enabled: false,
    })
  );
  const getFunc = useCallback(() => {
    GetWebContentServerQuery.refetch();
  }, []);
  useEffect(() => {
    if (!GetWebContentServerQuery.data) return;
    setContentData(GetWebContentServerQuery.data);
  }, [GetWebContentServerQuery.data]);

  const SetWebContentMutaion = useMutation(
    orpc.webSync.setContentData.mutationOptions()
  );
  const setFunc = useCallback(() => {
    SetWebContentMutaion.mutate(JSON.stringify(contentData));
  }, [contentData]);

  const SetServerDownloadMutaion = useMutation(
    orpc.download.set.mutationOptions()
  );
  const downFunc = useCallback(() => {
    SetServerDownloadMutaion.mutate(getDataGivenKeys(filtered));
  }, [filtered]);

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
          <DropdownMenuSeparator className="bg-foreground" />
          <DropdownMenuItem onClick={downFunc}>Download</DropdownMenuItem>
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
      <ToBeLoaded serverUrl={serverUrl} {...{ overwrite, setOverwrite }} />
    </QueryClientProvider>
  );
}
