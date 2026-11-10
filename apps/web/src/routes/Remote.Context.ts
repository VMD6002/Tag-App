import type { ContentWebType } from "@tagapp/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import constate from "constate";
import { atom, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useState } from "react";
import { FilterQueryAtom, initializeFilterDataFromURLAtom } from "@/atom";
import { orpc } from "@/lib/orpc";

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
      [getFilteredDataMutation],
    ),
  );

  // 5. Initial load sequence
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload filtered data when the server changes
  useEffect(() => {
    const initialFilterQuery = initializeFilterDataFromURL();
    getFilteredDataMutation.mutate(initialFilterQuery);
  }, [orpc]);

  return {
    loadState: {
      isPending:
        getFilteredDataMutation.isPending || getFilteredDataMutation.isIdle,
      isError: getFilteredDataMutation.isError,
      message: getFilteredDataMutation.error?.message,
    },
    tags,
    constants,
    filterData,
  };
}

export const [RemoteProvider, useRemoteContext] =
  constate(useRemoteContextCore);
