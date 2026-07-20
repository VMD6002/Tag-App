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
  useGetContent,
  useGetFilteredData,
  useSetContent,
  useRemoveContents,
  useBulkUpdateContentTags,
  contentDataAtom,
} from "@/entrypoints/main/atoms";
import { useMutation } from "@tanstack/react-query";
import {
  enableAfterAddRemoveScriptsAtom,
  supportedSitesAtom,
} from "../../atoms/supportedSites";
import {
  selectionEntriesAtom,
  selectionTagsAtom,
  selectionTagsInitialAtom,
} from "../../atoms/selection";
import {
  FilterQueryAtom,
  useInitializeFilterDataFromURL,
} from "../../atoms/filter";
import type { ContentWebType } from "@tagapp/utils/types";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import { useAtomCallback } from "jotai/utils";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "../../atoms/constants";
import { applyConstants } from "@tagapp/utils";

export const filteredAtom = atom<ContentWebType[]>([]);

function useLibraryContextCore() {
  const contentData = useAtomValue(contentDataAtom);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const initializeFilterDataFromURL = useInitializeFilterDataFromURL();
  const setFiltered = useSetAtom(filteredAtom);
  const setOpenModal = useSetAtom(updateModalOpenAtom);
  const setBulkUpdateModalOpen = useSetAtom(bulkUpdateModalOpenAtom);
  const setTitle = useSetAtom(updateTitleAtom);

  const supportedSiteData = useAtomValue(supportedSitesAtom);
  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);
  const constants = useAtomValue(constantsAtom);

  const getContentAction = useGetContent();
  const getFilteredDataAction = useGetFilteredData();
  const setContentAction = useSetContent();
  const removeContentsAction = useRemoveContents();
  const bulkUpdateContentTagsAction = useBulkUpdateContentTags();

  const afterAddRemoveScript = useAtomValue(enableAfterAddRemoveScriptsAtom);
  const runScript = useCallback(
    (script: string, data: any) => {
      if (!afterAddRemoveScript) return;
      iframeRef.current?.contentWindow?.postMessage(
        {
          script: replaceWithKeyOnUpdate
            ? applyConstants(script, constants)
            : script,
          data,
        },
        "*",
      );
    },
    [replaceWithKeyOnUpdate, constants, afterAddRemoveScript],
  );

  const getContentDetailsMutation = useMutation({
    mutationFn: async (vars: { id: string }) => await getContentAction(vars),
  });
  const getFilteredDataMutation = useMutation({
    mutationFn: async (vars: any) => await getFilteredDataAction(vars),
    onSuccess: (res) => setFiltered(res),
  });

  const filterQueryReadAtom = atom((get) => get(FilterQueryAtom));
  const filterData = useAtomCallback(
    useCallback(
      (get) => {
        const query = get(filterQueryReadAtom);
        getFilteredDataMutation.mutate(query);
      },
      [contentData],
    ),
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

  const setContentFunc = useAtomCallback(
    useCallback(
      async (get) => {
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
      },
      [
        updateIdAtom,
        updateDataAtom,
        updatePresetAtom,
        getContentDetailsMutation,
        setContentMutation,
      ],
    ),
  );

  const removeContentsMutation = useMutation({
    mutationFn: async (vars: { ids: string[] }) =>
      await removeContentsAction(vars),
    onSuccess: (res) => {
      log(`${res.length} contents removed`);
      for (const content of res) {
        const siteData = supportedSiteData[content.scraper];
        if (siteData.afterRemoveScript)
          runScript(siteData.afterRemoveScript, {
            siteData,
            contentDetails: res[0],
          });
      }
      setFiltered((old) => {
        const excludedIds = new Set(res.map((o) => o.id));
        return old.filter((o) => !excludedIds.has(o.id));
      });
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
    mutationFn: async (vars: {
      ids: string[];
      added: string[];
      removed: string[];
    }) => await bulkUpdateContentTagsAction(vars),
    onSuccess: () => {
      filterData();
      setBulkUpdateModalOpen(false);
    },
  });

  const bulkUpdateTags = useAtomCallback(
    useCallback(
      (get) => {
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
      },
      [
        selectionEntriesAtom,
        selectionTagsAtom,
        selectionTagsInitialAtom,
        bulkUpdateTagsMuation,
      ],
    ),
  );

  // 5. Initial load sequence
  useEffect(() => {
    const initialFilterQuery = initializeFilterDataFromURL();
    getFilteredDataMutation.mutate(initialFilterQuery);
  }, []);

  return {
    iframeRef,
    supportedSiteData,
    afterAddRemoveScript,
    setContentFunc,
    bulkUpdateTags,
    removeContents,
    filterData,
  };
}

export const [LibraryProvider, useLibraryContext] = constate(
  useLibraryContextCore,
);
