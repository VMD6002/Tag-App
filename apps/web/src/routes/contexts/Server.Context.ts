import { FilterDataAtom, injectFilterDataIntoURLAtom } from "@/atom";
import { orpc } from "@/lib/orpc";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import constate from "constate";
import type { ContentServerType } from "@tagapp/utils/types";

function useServerContext() {
  const [filtered, setFiltered] = useState<ContentServerType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const FilterData = useAtomValue(FilterDataAtom);
  const injectFilterDataIntoURL = useSetAtom(injectFilterDataIntoURLAtom);

  const ServerTagMutation = useMutation(
    orpc.main.getServerTags.mutationOptions({
      onSuccess: (res) => setTags(Object.keys(res)),
    }),
  );
  const contentDataMutation = useMutation(
    orpc.main.getData.mutationOptions({
      onSuccess: (res) => {
        ServerTagMutation.mutate({});
        setFiltered(res);
      },
    }),
  );

  const filterData = useCallback(() => {
    injectFilterDataIntoURL();
    contentDataMutation.mutate(FilterData);
  }, [FilterData]);

  return {
    tags,
    setTags,
    filtered,
    setFiltered,
    filterData,
  };
}

export const [ServerProvider, useServer] = constate(useServerContext);
