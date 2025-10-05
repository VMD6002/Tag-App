import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ExtendedCard from "./components/ExtendedCard";
import { ServerProvider, useServer } from "./contexts/Server.Context";
import type { ServerContext } from "./contexts/Server.Context";
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
  const { filtered, Filter } = useServer() as ServerContext;

  return (
    <>
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

export default function Library() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider>
        <Child />
      </ServerProvider>
    </QueryClientProvider>
  );
}
