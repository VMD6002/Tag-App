import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import { ServerProvider, useServer } from "./contexts/Server.Context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeFilterDataFromURLAtom, resetFilterAtom } from "@/atom";
import { useSetAtom } from "jotai";
import ExtendedCard from "./components/ExtendedCard";
import { useEffect } from "react";
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
  const { filtered, filterData } = useServer();
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
      <button onClick={reset} className="w-full hover:cursor-pointer">
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

export default function Library() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerProvider>
        <Child />
      </ServerProvider>
    </QueryClientProvider>
  );
}
