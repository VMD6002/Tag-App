import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { tagsAtom, filteredAtom } from "../atom";
import {
  updateInputDisabledAtom,
  updateDataAtom,
  updateModalOpenAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal";
import {
  selectionEntriesAtom,
  selectionOnAtom,
  selectionTagsAtom,
  selectionTagsInitialAtom,
} from "@/entrypoints/main/atoms/selection";
import {
  FilterDataAtom,
  injectFilterDataIntoURLAtom,
} from "@/entrypoints/main/atoms/filter";
import { sanitizeStringForFileName } from "@tagapp/utils";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import constate from "constate";

const useServer = () => {
  const orpc = useAtomValue(orpcAtom);
  const setFiltered = useSetAtom(filteredAtom);
  const setInputDisabled = useSetAtom(updateInputDisabledAtom);
  const setTags = useSetAtom(tagsAtom);
  const injectFilterDataIntoURL = useSetAtom(injectFilterDataIntoURLAtom);

  const ServerTagsMutation = useMutation(
    orpc.main.getServerTags.mutationOptions({
      onSuccess: (res) => {
        setTags(Object.keys(res));
      },
      onError: () => {
        alert("Could't fetch server tags");
      },
    }),
  );
  const contentDataMutation = useMutation(
    orpc.main.getData.mutationOptions({
      onSuccess: (res) => {
        ServerTagsMutation.mutate({});
        setFiltered(res);
      },
      onError: () => {
        console.warn("DB, online ?");
      },
    }),
  );

  const [selectedEntries, setSelectedEntries] = useAtom(selectionEntriesAtom);
  const setSelectionModeOn = useSetAtom(selectionOnAtom);
  const FilterData = useAtomValue(FilterDataAtom);

  const filterData = useCallback(() => {
    injectFilterDataIntoURL();
    setSelectedEntries([]);
    setSelectionModeOn(false);
    contentDataMutation.mutate(FilterData);
  }, [FilterData]);

  const syncContentsModified = useMutation(
    orpc.main.sync.mutationOptions({
      onSuccess: () => {
        contentDataMutation.mutate(FilterData);
      },
    }),
  );
  const serverSyncFunc = useCallback(() => syncContentsModified.mutate({}), []);

  const setUpdateTitle = useSetAtom(updateTitleAtom);
  const setUpdateModalOpen = useSetAtom(updateModalOpenAtom);
  const updateContentMutaion = useMutation(
    orpc.main.setDoc.mutationOptions({
      onSuccess: (res) => {
        setFiltered((old) =>
          old.map((val) => {
            if (val.id !== res.id) return val;
            const content = { ...val };
            const oldTags = content.tags;
            const addedTags = res.tags.filter((tag) => !oldTags.includes(tag));
            setTags((old) => {
              const unSyncedTags = addedTags.filter(
                (tag) => !old.includes(tag),
              );
              if (!unSyncedTags.length) return old;
              return [...old, ...unSyncedTags];
            });
            return res;
          }),
        );
        setUpdateTitle(res.title);
        setUpdateModalOpen(false);
        setInputDisabled(false);
      },
      onError: () => {
        alert("Couldn't update, check console for error");
        setInputDisabled(false);
      },
    }),
  );

  const updateData = useAtomValue(updateDataAtom);
  const updateContentFunc = useCallback(() => {
    const sanitizedTitle = sanitizeStringForFileName(updateData.title);
    if (!sanitizedTitle) {
      alert("Title must not be blank");
      setUpdateTitle("");
      return;
    }
    const content: typeof updateData = { ...updateData, title: sanitizedTitle };
    setInputDisabled(true);
    updateContentMutaion.mutate(content);
  }, [updateData]);

  const setBulkUpdateModalOpen = useSetAtom(bulkUpdateModalOpenAtom);
  const bulkUpdateMutation = useMutation(
    orpc.main.bulkUpdate.mutationOptions({
      onSuccess: (res) => {
        setTags((old) => {
          const unSyncedTags = res.added.filter((tag) => !old.includes(tag));
          if (!unSyncedTags.length) return old;
          return [...old, ...unSyncedTags];
        });
        setFiltered((oldFiltered) =>
          oldFiltered.map((content) => {
            if (!res.ids.includes(content.id)) return content;
            for (const tag of res.removed) {
              content.tags = content.tags.filter((val) => val !== tag);
              content.lastUpdated = Math.floor(Date.now() / 1000);
            }
            for (const tag of res.added) {
              if (content.tags.includes(tag)) continue;
              content.tags.push(tag);
            }
            return content;
          }),
        );
        setBulkUpdateModalOpen(false);
        setInputDisabled(false);
      },
      onError: () => {
        alert("Bulk update failed, check console for error");
        setInputDisabled(false);
      },
    }),
  );

  const selectionTags = useAtomValue(selectionTagsAtom);
  const selectionTagsInitial = useAtomValue(selectionTagsInitialAtom);

  const bulkUpdateContentFunc = useCallback(() => {
    const updatedTags = selectionTags.map((o) => o.value);
    const removedTags = selectionTagsInitial.filter(
      (x) => !updatedTags.includes(x),
    );
    const addedTags = updatedTags.filter(
      (x) => !selectionTagsInitial.includes(x),
    );
    setInputDisabled(true);
    bulkUpdateMutation.mutate({
      ids: selectedEntries,
      added: addedTags,
      removed: removedTags,
    });
  }, [selectionTags, selectedEntries, selectionTagsInitial]);

  const deleteContentsModified = useMutation(
    orpc.main.deleteData.mutationOptions({
      onSuccess: (res) => {
        setFiltered((old) => old.filter((doc) => !res.includes(doc.id)));
      },
      onError: () => {
        alert("delete contents failed, check console for error");
      },
    }),
  );

  const removeContents = useCallback((keys: string[]) => {
    deleteContentsModified.mutate(keys);
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      return selectedEntries.includes(id);
    },
    [selectedEntries],
  );

  return {
    removeContents,
    setFiltered,
    updateContentFunc,
    bulkUpdateContentFunc,
    filterData,
    serverSyncFunc,
    isSelected,
  };
};

export const [ServerProvider, useServerActions] = constate(useServer);
