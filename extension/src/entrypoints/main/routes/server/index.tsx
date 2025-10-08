import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ExtendedCard from "./components/ExtendedCard";
import { ServerProvider, useServer } from "./contexts/Server.Context";
import type { ServerContext } from "./contexts/Server.Context";
import UpdateModal from "@/components/craft/UpdateModal";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  const {
    filtered,
    Update,
    updateContentFunc,
    bulkUpdateContentFunc,
    Selection,
    Filter,
    inputDisabled,
  } = useServer() as ServerContext;

  return (
    <>
      <UpdateModal
        Update={Update}
        updateContentFunc={updateContentFunc}
        isServer={true}
        inputDisabled={inputDisabled}
      />
      <BulkUpdateModal
        Selection={Selection}
        bulkUpdateContentFunc={bulkUpdateContentFunc}
      />
      <button className="w-full hover:cursor-pointer" onClick={Filter.reset}>
        <TitleHeader Title="Server Library" />
      </button>
      <Filters />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((data) => (
          <ExtendedCard key={data.id} data={data} />
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
