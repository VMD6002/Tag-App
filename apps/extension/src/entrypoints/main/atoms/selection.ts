import { atom, Getter, Setter } from "jotai";
import { contentDataAtom } from ".";
import { ContentWebType } from "@tagapp/utils/types";
import { useCallback } from "react";
import { useAtomCallback } from "jotai/utils";

export const selectionOnAtom = atom(false);
export const selectionEntriesAtom = atom<string[]>([]);
export const selectionTagsAtom = atom<MultiSelectOption[]>([]);
export const selectionTagsInitialAtom = atom<string[]>([]);

const selectEntryCallback = (get: Getter, set: Setter, key: string) => {
  const entries = get(selectionEntriesAtom);
  if (entries.includes(key)) {
    set(
      selectionEntriesAtom,
      entries.filter((val) => val !== key),
    );
  } else {
    set(selectionEntriesAtom, [...entries, key]);
  }
};

export const useSelectEntry = () => useAtomCallback(useCallback(selectEntryCallback, []));

const toggleSelectionModeCallback = (get: Getter, set: Setter) => {
  const on = get(selectionOnAtom);
  if (on) set(selectionEntriesAtom, []);
  set(selectionOnAtom, !on);
};

export const useToggleSelectionMode = () => useAtomCallback(useCallback(toggleSelectionModeCallback, []));

// Extension Specific

const syncSelectedTagsCallback = async (get: Getter, set: Setter, remoteContentData?: ContentWebType[]) => {
  const contentData = remoteContentData
    ? Object.fromEntries(
        remoteContentData.map((contentDetails) => [
          contentDetails.id,
          contentDetails,
        ]),
      )
    : { ...(await get(contentDataAtom)) };
  const entries = get(selectionEntriesAtom);

  if (entries.length === 0) {
    set(selectionTagsInitialAtom, []);
    set(selectionTagsAtom, []);
    return;
  }

  const tagsArray = entries.map((key) => contentData[key].tags);

  const data = tagsArray.reduce((a, b) => a.filter((c) => b.includes(c)));

  set(selectionTagsInitialAtom, data);
  set(
    selectionTagsAtom,
    data.map((o) => ({ label: o, value: o })),
  );
};

export const useSyncSelectedTags = () => useAtomCallback(useCallback(syncSelectedTagsCallback, []));
