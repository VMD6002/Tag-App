import useFilter from "@/hooks/useFilter";
import { orpc } from "@/lib/orpc";
import { useMutation } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
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

  const ServerTagMutation = useMutation(
    orpc.main.getServerTags.mutationOptions({
      onSuccess: (res) => setTags(Object.keys(res)),
    })
  );
  const contentDataMutation = useMutation(
    orpc.main.getData.mutationOptions({
      onSuccess: (res) => {
        ServerTagMutation.mutate({});
        setFiltered(res);
      },
    })
  );

  const filterData = useCallback(() => {
    contentDataMutation.mutate(Filter.FilterData);
  }, [Filter.FilterData]);

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
  const initialFilterData = useEffectEvent(() =>
    contentDataMutation.mutate(Filter.FilterData)
  );

  useEffect(() => {
    setTimeout(() => initialFilterData(), 0);
  }, []);

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
}
