import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ExtendedCard from "./components/ExtendedCard";
import UpdateModal from "@/components/craft/UpdateModal";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerProvider, useServerActions } from "./contexts/Server.Context";
import { useAtomValue, useSetAtom } from "jotai";
import {
  initializeFilterDataFromURLAtom,
  resetFilterAtom,
} from "@/entrypoints/main/atoms/filter";
import { filteredAtom } from "./atom";
import TIMEOUTS from "@/lib/TIMEOUTS";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

function Child() {
  const filtered = useAtomValue(filteredAtom);
  const { updateContentFunc, bulkUpdateContentFunc, filterData } =
    useServerActions();
  const initializeFilterDataFromURL = useSetAtom(
    initializeFilterDataFromURLAtom,
  );
  const reset = useSetAtom(resetFilterAtom);

  useEffect(() => {
    initializeFilterDataFromURL();
    TIMEOUTS.clearAllTimeouts();
    TIMEOUTS.setTimeout(() => filterData(), 100);
  }, []);

  return (
    <>
      <UpdateModal updateContentFunc={updateContentFunc} isServer={true} />
      <BulkUpdateModal bulkUpdateContentFunc={bulkUpdateContentFunc} />
      <button
        className="w-full hover:cursor-pointer"
        onClick={() => {
          reset();
          filterData();
        }}
      >
        <TitleHeader Title="Server Library" />
      </button>
      <Filters />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((data) => (
          <ExtendedCard key={data.id} Content={data} />
        ))}
      </div>
    </>
  );
}

export default function Server() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider>
        <Child />
      </ServerProvider>
    </QueryClientProvider>
  );
}
