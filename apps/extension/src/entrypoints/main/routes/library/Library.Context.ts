import { applyConstants } from "@tagapp/utils";
import type { ContentWebType } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import constate from "constate";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useRef } from "react";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import {
  updateDataAtom,
  updateIdAtom,
  updateModalOpenAtom,
  updatePresetAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal/atom";
import {
  useBulkUpdateContentTags,
  useGetContent,
  useGetFilteredData,
  useRemoveContents,
  useSetContent,
} from "@/entrypoints/main/atoms";
import log from "@/lib/log";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "../../atoms/constants";
import {
  FilterQueryAtom,
  useInitializeFilterDataFromURL,
} from "../../atoms/filter";
import {
  selectionEntriesAtom,
  selectionOnAtom,
  selectionTagsAtom,
  selectionTagsInitialAtom,
} from "../../atoms/selection";
import {
  enableAfterAddRemoveScriptsAtom,
  supportedSitesAtom,
} from "../../atoms/supportedSites";

export const filteredAtom = atom<ContentWebType[]>([]);

function useLibraryContextCore() {
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
    (script: string, data: unknown) => {
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
    mutationFn: async (vars: Parameters<typeof getFilteredDataAction>[0]) =>
      await getFilteredDataAction(vars),
    onSuccess: (res) => setFiltered(res),
  });

  const filterData = useAtomCallback(
    useCallback(
      (get, set, dontOffSelection = false) => {
        // A new result set invalidates the selection, otherwise hidden items get bulk-deleted.
        if (!dontOffSelection) {
          set(selectionEntriesAtom, []);
          set(selectionOnAtom, false);
          set(selectionTagsAtom, []);
          set(selectionTagsInitialAtom, []);
        }
        getFilteredDataMutation.mutate(get(FilterQueryAtom));
      },
      [getFilteredDataMutation.mutate],
    ),
  );

  const setContentMutation = useMutation({
    // biome-ignore lint/suspicious/noExplicitAny: typing this exposes a flags (exactOptionalPropertyTypes) mismatch in setContentFunc; unrelated to lint
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
        const updateId = get(updateIdAtom);
        const updateData = get(updateDataAtom);
        const preset = get(updatePresetAtom);

        const contentDetails = await getContentDetailsMutation.mutateAsync({
          id: updateId,
        });

        const newContent = {
          ...contentDetails,
          ...updateData,
          download: contentDetails?.download?.type
            ? { type: contentDetails.download?.type, flags: preset }
            : undefined,
        };

        setContentMutation.mutate(newContent);
      },
      [getContentDetailsMutation, setContentMutation],
    ),
  );

  const removeContentsMutation = useMutation({
    mutationFn: async (vars: { ids: string[] }) =>
      await removeContentsAction(vars),
    onSuccess: (res) => {
      log(`${res.length} contents removed`);
      for (const content of res) {
        const siteData = supportedSiteData[content.scraper];
        if (siteData?.afterRemoveScript)
          runScript(siteData.afterRemoveScript, {
            siteData,
            contentDetails: content,
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
      filterData(true);
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
      [bulkUpdateTagsMuation],
    ),
  );

  // 5. Initial load sequence
  useEffect(() => {
    const initialFilterQuery = initializeFilterDataFromURL();
    getFilteredDataMutation.mutate(initialFilterQuery);
  }, [initializeFilterDataFromURL, getFilteredDataMutation.mutate]);

  return {
    loadState: {
      isPending:
        getFilteredDataMutation.isPending || getFilteredDataMutation.isIdle,
      isError: getFilteredDataMutation.isError,
      message: getFilteredDataMutation.error?.message,
    },
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
