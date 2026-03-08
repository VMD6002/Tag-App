import { atom } from "jotai";
import {
  selectionEntriesAtom,
  selectionTagsAtom,
  selectionTagsInitialAtom,
} from "./selection";
import { tagsAtom } from "./tags";
import { atomWithStorage } from "jotai/utils";
import { createWxtStorage } from "./storage";
import {
  updateDataAtom,
  updateModalOpenAtom,
  updateTitleAtom,
  updateInputDisabledAtom,
} from "@/components/craft/UpdateModal";
import { ContentWebDataType, ContentWebType } from "@tagapp/utils/types";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";

export const contentDataAtom = atomWithStorage<ContentWebDataType>(
  "contentData",
  {},
  createWxtStorage(),
);

export const updateContentFuncAtom = atom(null, async (get, set) => {
  const updateData = get(updateDataAtom);

  set(updateInputDisabledAtom, true);

  if (!updateData.title.trim()) {
    alert("Title must not be blank");
    set(updateTitleAtom, "");
    set(updateInputDisabledAtom, false);
    return;
  }

  const contentData = structuredClone(await get(contentDataAtom));
  const tagsData = structuredClone(await get(tagsAtom));

  if (!contentData[updateData.id]) return;

  const currentEntryTags = contentData[updateData.id].tags;

  // Handle Removed Tags
  const deletedTags = currentEntryTags.filter(
    (a) => !updateData.tags.includes(a),
  );
  deletedTags.forEach((tag) => {
    if (tagsData[tag]) tagsData[tag].Count--;
  });

  // Handle Added Tags
  const addedTags = updateData.tags.filter(
    (a) => !currentEntryTags.includes(a),
  );
  addedTags.forEach((tag) => {
    if (tagsData[tag]) tagsData[tag].Count++;
    else tagsData[tag] = { Count: 1 };
  });

  // Update Content
  const temp: any = { ...updateData };
  temp.CoverUrl = temp.Cover;
  delete temp.Cover;

  const newContent: ContentWebType = {
    ...contentData[updateData.id],
    ...temp,
    LastUpdated: Math.floor(Date.now() / 1000),
  };

  contentData[newContent.id] = newContent;

  set(tagsAtom, tagsData);
  set(contentDataAtom, contentData);
  set(updateModalOpenAtom, false);
  set(updateInputDisabledAtom, false);
});

export const bulkUpdateContentFuncAtom = atom(null, async (get, set) => {
  const selectionEntries = get(selectionEntriesAtom);
  const selectionTags = get(selectionTagsAtom);
  const selectionTagsInitial = get(selectionTagsInitialAtom);

  const contentData = structuredClone(await get(contentDataAtom));
  const tagsData = structuredClone(await get(tagsAtom));

  const updatedTags = selectionTags.map((o) => o.value);

  // Remove Logic
  const removedTags = selectionTagsInitial.filter(
    (x) => !updatedTags.includes(x),
  );

  for (const tag of removedTags) {
    for (const entryId of selectionEntries) {
      if (!contentData[entryId]) continue;

      contentData[entryId].tags = contentData[entryId].tags.filter(
        (val) => val !== tag,
      );
      contentData[entryId].lastUpdated = Math.floor(Date.now() / 1000);

      if (tagsData[tag]) {
        tagsData[tag].Count--;
      }
    }
  }

  // Add Logic
  const addedTags = updatedTags.filter(
    (x) => !selectionTagsInitial.includes(x),
  );

  for (const tag of addedTags) {
    for (const entryId of selectionEntries) {
      if (!contentData[entryId]) continue;

      if (contentData[entryId].tags.includes(tag)) continue;
      contentData[entryId].tags.push(tag);
      contentData[entryId].lastUpdated = Math.floor(Date.now() / 1000);

      if (tagsData[tag]) {
        tagsData[tag].Count++;
      } else {
        tagsData[tag] = { Count: 1 };
      }
    }
  }

  set(tagsAtom, tagsData);
  set(contentDataAtom, contentData);
  set(bulkUpdateModalOpenAtom, false);
});

export const removeContentsAtom = atom(
  null,
  async (get, set, keys: string[]) => {
    const contentData = structuredClone(await get(contentDataAtom));
    const tagsData = structuredClone(await get(tagsAtom));

    keys.forEach((key) => {
      if (contentData[key]) {
        contentData[key].tags.forEach((tag) => {
          if (tagsData[tag]) tagsData[tag].Count--;
        });
        delete contentData[key];
      }
    });

    set(contentDataAtom, contentData);
    set(tagsAtom, tagsData);
  },
);
