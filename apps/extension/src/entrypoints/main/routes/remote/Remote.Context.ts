import { applyConstants } from "@tagapp/utils";
import type { ContentWebType } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import constate from "constate";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import {
  updateDataAtom,
  updateIdAtom,
  updateModalOpenAtom,
  updatePresetAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal/atom";
import log from "@/lib/log";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "../../atoms/constants";
import {
  FilterQueryAtom,
  useInitializeFilterDataFromURL,
} from "../../atoms/filter";
import { orpcAtom } from "../../atoms/orpc";
import {
  selectionEntriesAtom,
  selectionOnAtom,
  selectionTagsAtom,
  selectionTagsInitialAtom,
} from "../../atoms/selection";
import {
  enableAfterAddRemoveScriptsAtom,
  runAfterAddRemoveScriptsInServerAtom,
  supportedSitesAtom,
} from "../../atoms/supportedSites";
import { remoteTagsUpdatedAtom } from "../../atoms/tags";

export const filteredAtom = atom<ContentWebType[]>([]);

function useRemoteContextCore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tags, setTags] = useState<string[]>([]);

  const orpc = useAtomValue(orpcAtom);

  const remoteTagsUpdated = useAtomValue(remoteTagsUpdatedAtom);

  const initializeFilterDataFromURL = useInitializeFilterDataFromURL();
  const setFiltered = useSetAtom(filteredAtom);
  const setOpenModal = useSetAtom(updateModalOpenAtom);
  const setBulkUpdateModalOpen = useSetAtom(bulkUpdateModalOpenAtom);
  const setTitle = useSetAtom(updateTitleAtom);

  const supportedSiteData = useAtomValue(supportedSitesAtom);
  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);
  const constants = useAtomValue(constantsAtom);

  const runUserCodeMutation = useMutation(
    orpc.main.runUserCode.mutationOptions({
      onSuccess: () => {
        log("User After Scripts Executed");
      },
    }),
  );
  const afterAddRemoveScript = useAtomValue(enableAfterAddRemoveScriptsAtom);
  const runAfterAddRemoveScriptsInServer = useAtomValue(
    runAfterAddRemoveScriptsInServerAtom,
  );
  const runScript = useCallback(
    (script: string, data: unknown) => {
      if (!afterAddRemoveScript) return;
      const input = {
        script: replaceWithKeyOnUpdate
          ? applyConstants(script, constants)
          : script,
        data,
      };
      if (runAfterAddRemoveScriptsInServer) {
        runUserCodeMutation.mutate(input);
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(input, "*");
    },
    [
      replaceWithKeyOnUpdate,
      constants,
      afterAddRemoveScript,
      runAfterAddRemoveScriptsInServer,
      runUserCodeMutation.mutate,
    ],
  );

  const getTagsMutation = useMutation(
    orpc.tags.getTagData.mutationOptions({
      onSuccess: (res) => {
        setTags(Object.keys(res.tags).sort());
      },
    }),
  );

  const getContentDetailsMutation = useMutation(
    orpc.main.getContent.mutationOptions(),
  );
  const getFilteredDataMutation = useMutation(
    orpc.main.getFilteredData.mutationOptions({
      onSuccess: (res) => {
        setFiltered(res);
      },
    }),
  );

  const filterData = useAtomCallback(
    useCallback(
      async (get, set, dontOffSelection = false) => {
        const query = get(FilterQueryAtom);
        if (!dontOffSelection) {
          set(selectionEntriesAtom, []);
          set(selectionOnAtom, false);
          set(selectionTagsAtom, []);
          set(selectionTagsInitialAtom, []);
        }
        getFilteredDataMutation.mutate(query);
      },
      [getFilteredDataMutation],
    ),
  );

  const setContentMutation = useMutation(
    orpc.main.setContent.mutationOptions({
      onSuccess: (res) => {
        log(`${res.id} Updated`);
        setTitle(res.title);
        setFiltered((old) => old.map((o) => (o.id === res.id ? res : o)));
        setOpenModal(false);
      },
    }),
  );

  const setContentFunc = useAtomCallback(
    useCallback(
      async (get) => {
        const updateId = get(updateIdAtom);
        const updateData = get(updateDataAtom);
        const preset = get(updatePresetAtom);

        const contentDetails = await getContentDetailsMutation.mutateAsync({
          id: updateId,
        });
        if (!contentDetails) return;

        const newContent = {
          ...contentDetails,
          ...updateData,
          download: contentDetails?.download?.type
            ? { type: contentDetails?.download?.type, flags: preset }
            : undefined,
        };

        setContentMutation.mutate(newContent);
      },
      [getContentDetailsMutation, setContentMutation],
    ),
  );

  const removeContentsMutation = useMutation(
    orpc.main.removeContents.mutationOptions({
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
    }),
  );
  // Inside your component or custom hook
  const removeContents = useCallback(
    (ids: string[]) => {
      removeContentsMutation.mutate({ ids });
    },
    [removeContentsMutation],
  );

  const bulkUpdateTagsMuation = useMutation(
    orpc.main.bulkUpdateContentTags.mutationOptions({
      onSuccess: () => {
        filterData(true);
        setBulkUpdateModalOpen(false);
      },
    }),
  );
  const bulkUpdateTags = useAtomCallback(
    useCallback(
      async (get) => {
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload filtered data when the server changes
  useEffect(() => {
    const initialFilterQuery = initializeFilterDataFromURL();
    getFilteredDataMutation.mutate(initialFilterQuery);
  }, [orpc]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch tags when the server or tags change
  useEffect(() => {
    getTagsMutation.mutate({});
  }, [orpc, remoteTagsUpdated]);

  return {
    loadState: {
      isPending:
        getFilteredDataMutation.isPending || getFilteredDataMutation.isIdle,
      isError: getFilteredDataMutation.isError,
      message: getFilteredDataMutation.error?.message,
    },
    tags,
    iframeRef,
    supportedSiteData,
    afterAddRemoveScript,
    setContentFunc,
    bulkUpdateTags,
    removeContents,
    filterData,
  };
}

export const [RemoteProvider, useRemoteContext] =
  constate(useRemoteContextCore);
