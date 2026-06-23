import { atom } from "jotai";
import { contentDataAtom } from ".";
import { ContentWebType } from "@tagapp/utils/types";

export const selectionOnAtom = atom(false);
export const selectionEntriesAtom = atom<string[]>([]);
export const selectionTagsAtom = atom<MultiSelectOption[]>([]);
export const selectionTagsInitialAtom = atom<string[]>([]);

export const selectEntryAtom = atom(null, (get, set, key: string) => {
  const entries = get(selectionEntriesAtom);
  if (entries.includes(key)) {
    set(
      selectionEntriesAtom,
      entries.filter((val) => val !== key),
    );
  } else {
    set(selectionEntriesAtom, [...entries, key]);
  }
});

export const toggleSelectionModeAtom = atom(null, (get, set) => {
  const on = get(selectionOnAtom);
  if (on) set(selectionEntriesAtom, []);
  set(selectionOnAtom, !on);
});

// Extension Specific

export const syncSelectedTagsAtom = atom(
  null,
  async (get, set, remoteContentData?: ContentWebType[]) => {
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
  },
);
