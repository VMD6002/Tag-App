import constate from "constate";
import { useRef, useEffect, useCallback } from "react";
import log from "@/lib/log";
import { atom, useAtomValue, useSetAtom } from "jotai";
import {
  updateTitleAtom,
  updatePresetAtom,
  updateModalOpenAtom,
  updateIdAtom,
  updateDataAtom,
} from "@/components/craft/UpdateModal/atom";
import {
  getContentAtom,
  getFilteredDataAtom,
  setContentAtom,
  removeContentsAtom,
  bulkUpdateContentTagsAtom,
} from "@/entrypoints/main/atoms";
import { useMutation } from "@tanstack/react-query";
import { supportedSitesAtom } from "../../atoms/supportedSites";
import {
  selectionEntriesAtom,
  selectionTagsAtom,
  selectionTagsInitialAtom,
} from "../../atoms/selection";
import {
  FilterQueryAtom,
  initializeFilterDataFromURLAtom,
} from "../../atoms/filter";
import type { ContentWebType } from "@tagapp/utils/types";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";

export const filteredAtom = atom<ContentWebType[]>([]);

function useLibraryContextCore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1. Get ONLY the setters/actions (These never trigger re-renders when state changes)
  const initializeFilterDataFromURL = useSetAtom(
    initializeFilterDataFromURLAtom,
  );
  const setFiltered = useSetAtom(filteredAtom);
  const setOpenModal = useSetAtom(updateModalOpenAtom);
  const setBulkUpdateModalOpen = useSetAtom(bulkUpdateModalOpenAtom);
  const setTitle = useSetAtom(updateTitleAtom);

  // 2. Read ONLY static/rarely changed configuration data here if absolutely necessary
  const supportedSiteData = useAtomValue(supportedSitesAtom);

  const getContentAction = useSetAtom(getContentAtom);
  const getFilteredDataAction = useSetAtom(getFilteredDataAtom);
  const setContentAction = useSetAtom(setContentAtom);
  const removeContentsAction = useSetAtom(removeContentsAtom);
  const bulkUpdateContentTagsAction = useSetAtom(bulkUpdateContentTagsAtom);

  // 3. Setup TanStack Mutations (These references are stable)
  const getContentDetailsMutation = useMutation({
    mutationFn: async (vars: { id: string }) => await getContentAction(vars),
  });
  const getFilteredDataMutation = useMutation({
    mutationFn: async (vars: any) => await getFilteredDataAction(vars),
    onSuccess: (res) => setFiltered(res),
  });

  const filterQueryReadAtom = atom((get) => get(FilterQueryAtom));
  const filterData = useSetAtom(
    atom(null, (get, set) => {
      const query = get(filterQueryReadAtom);
      getFilteredDataMutation.mutate(query);
    }),
  );

  const setContentMutation = useMutation({
    mutationFn: async (vars: any) => await setContentAction(vars),
    onSuccess: (res) => {
      log(`${res.id} Updated`);
      setTitle(res.title);
      setFiltered((old) => old.map((o) => (o.id === res.id ? res : o)));
      setOpenModal(false);
    },
  });

  // 4. Read dynamic/rapidly changing state inside an ATOM on-demand, NOT in React
  // This is the core trick. The functions read the state at the exact moment they execute.
  const setContentFunc = useSetAtom(
    atom(null, async (get, set) => {
      const updateId = get(updateIdAtom)!;
      const updateData = get(updateDataAtom);
      const preset = get(updatePresetAtom);

      const contentDetails = await getContentDetailsMutation.mutateAsync({
        id: updateId,
      });

      const newContent = {
        ...contentDetails,
        ...updateData,
        download: contentDetails.download?.type
          ? { type: contentDetails.download?.type, flags: preset }
          : undefined,
      };

      setContentMutation.mutate(newContent);
    }),
  );

  const removeContentsMutation = useMutation({
    mutationFn: async (vars: { ids: string[] }) => await removeContentsAction(vars),
    onSuccess: (res) => {
      log(`${res.length} contents removed`);
      setFiltered((old) => old.filter((o) => !res.includes(o)));
    },
  });
  // Inside your component or custom hook
  const removeContents = useCallback(
    (ids: string[]) => {
      removeContentsMutation.mutate({ ids });
    },
    [removeContentsMutation],
  );

  const bulkUpdateTagsMuation = useMutation({
    mutationFn: async (vars: { ids: string[]; added: string[]; removed: string[] }) => await bulkUpdateContentTagsAction(vars),
    onSuccess: () => {
      filterData();
      setBulkUpdateModalOpen(false);
    },
  });

  const bulkUpdateTags = useSetAtom(
    atom(null, (get) => {
      const selectionEntries = get(selectionEntriesAtom);
      const selectionTags = get(selectionTagsAtom);
      const selectionTagsInitial = get(selectionTagsInitialAtom);

      const updatedTags = selectionTags.map((o) => o.value);
      const added = updatedTags.filter(
        (o) => !selectionTagsInitial.includes(o),
      );
      const removed = selectionTagsInitial.filter(
        (o) => !updatedTags.includes(o),
      );

      bulkUpdateTagsMuation.mutate({ ids: selectionEntries, added, removed });
    }),
  );

  // 5. Initial load sequence
  useEffect(() => {
    const initialFilterQuery = initializeFilterDataFromURL();
    getFilteredDataMutation.mutate(initialFilterQuery);
  }, []);

  return {
    iframeRef,
    supportedSiteData,
    setContentFunc,
    bulkUpdateTags,
    removeContents,
    filterData,
  };
}

export const [LibraryProvider, useLibraryContext] = constate(
  useLibraryContextCore,
);
