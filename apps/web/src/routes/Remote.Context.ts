import constate from "constate";
import { useCallback, useEffect, useState } from "react";
import { atom, useSetAtom } from "jotai";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ContentWebType } from "@tagapp/utils/types";
import { FilterQueryAtom, initializeFilterDataFromURLAtom } from "@/atom";
import { orpc } from "@/lib/orpc";
import { useAtomCallback } from "jotai/utils";

export const filteredAtom = atom<ContentWebType[]>([]);

function useRemoteContextCore() {
  const [tags, setTags] = useState<string[]>([]);

  const { data } = useQuery(orpc.main.getSettings.queryOptions());
  const constants = data?.constants || {};

  const initializeFilterDataFromURL = useSetAtom(
    initializeFilterDataFromURLAtom,
  );
  const setFiltered = useSetAtom(filteredAtom);

  const getTagsMutation = useMutation(
    orpc.tags.getTagData.mutationOptions({
      onSuccess: (res) => {
        const activeTags = Object.entries(res.tags)
          .filter(([, tagData]) => tagData.count > 0)
          .map(([key]) => key);
        setTags(activeTags.sort());
      },
    }),
  );

  const getFilteredDataMutation = useMutation(
    orpc.main.getFilteredData.mutationOptions({
      onSuccess: (res) => {
        setFiltered(res);
        getTagsMutation.mutate({});
      },
    }),
  );

  const filterData = useAtomCallback(
    useCallback(
      async (get) => {
        const query = get(FilterQueryAtom);
        getFilteredDataMutation.mutate(query);
      },
      [getFilteredDataMutation, FilterQueryAtom],
    ),
  );

  // 5. Initial load sequence
  useEffect(() => {
    const initialFilterQuery = initializeFilterDataFromURL();
    getFilteredDataMutation.mutate(initialFilterQuery);
  }, [orpc]);

  return {
    tags,
    constants,
    filterData,
  };
}

export const [RemoteProvider, useRemoteContext] =
  constate(useRemoteContextCore);
