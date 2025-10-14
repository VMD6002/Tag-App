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
import { useLocal } from "../Local.Context";
import type { LocalContext } from "../Local.Context";

const ToBeLoaded = ({ overwrite, setOverwrite }: any) => {
  const orpc = useOrpc();
  const { contentData, setContentData, filtered, getDataGivenKeys } =
    useLocal() as LocalContext;

  const GetWebContentServerQuery = useMutation(
    orpc.webSync.getContentData.mutationOptions({
      onSuccess: (res) => {
        setContentData(res);
      },
    })
  );
  const getFunc = useCallback(() => {
    GetWebContentServerQuery.mutate({});
  }, []);
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
    interface DownloadType {
      id: string;
      Title: string;
      CoverUrl: string;
      Tags: string[];
      Download: ContentDownload;
      Url: string;
      Added: number;
      LastUpdated: number;
      extraData: string;
    }
    const downloadData = getDataGivenKeys(filtered) as DownloadType[];
    SetServerDownloadMutaion.mutate(downloadData);
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
