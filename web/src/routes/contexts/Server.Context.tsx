import useFilter from "@/hooks/useFilter";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ServerContext {
  tags: string[];
  Filter: ReturnType<typeof useFilter>;
  filtered: ContentType[];
  setFiltered: React.Dispatch<React.SetStateAction<ContentType[]>>;
  filterData: () => void;
}

const ServerContext = createContext<any>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useServer() {
  return useContext(ServerContext);
}

export function ServerProvider({ children }: any) {
  const [filtered, setFiltered] = useState<ContentType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const Filter = useFilter();

  const contentDataQuery = useQuery(
    orpc.main.getData.queryOptions({
      input: Filter.FilterData,
    })
  );
  const filterData = useCallback(() => {
    contentDataQuery.refetch();
  }, [contentDataQuery]);

  const value = useMemo(
    () => ({
      tags,
      setTags,
      Filter,
      filtered,
      setFiltered,
      filterData,
    }),
    [tags, Filter, filtered, filterData]
  );

  useEffect(() => {
    setFiltered(contentDataQuery?.data ?? []);
  }, [contentDataQuery.data]);

  const ServerTagQuery = useQuery(orpc.main.getServerTags.queryOptions());
  useEffect(() => {
    const serverTags = Object.keys(ServerTagQuery?.data ?? {});
    setTags(serverTags);
  }, [ServerTagQuery.data]);

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
}
