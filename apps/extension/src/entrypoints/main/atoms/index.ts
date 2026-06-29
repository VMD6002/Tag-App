import { ContentWebBaseType, ContentWebDataType, ContentWebType, FilterDataType } from "@tagapp/utils/types";
import { atomWithUserStorage } from "./user";
import { atom } from "jotai";
import { constantsAtom, replaceWithKeyOnUpdateAtom } from "./constants";
import { tagsAtom } from "./tags";
import { sanitizeTitleAtom } from "./settings";
import { filterData, replaceWithConstantKey, sanitizeStringForFileName } from "@tagapp/utils";

export const contentDataAtom = atomWithUserStorage<ContentWebDataType>(
  "contentData",
  {},
);

export const setContentAtom = atom(
  null,
  async (get, set, input: ContentWebBaseType) => {
    const santizeTitle = await get(sanitizeTitleAtom);
    const replaceWithKeyOnUpdate = await get(replaceWithKeyOnUpdateAtom);
    const constants = await get(constantsAtom);

    const contentData = structuredClone(await get(contentDataAtom));
    const tagsData = structuredClone(await get(tagsAtom));

    const Time = Math.floor(Date.now() / 1000);

    const title = santizeTitle
      ? sanitizeStringForFileName(input.title)
      : input.title.trim();
    const cover =
      input.cover && replaceWithKeyOnUpdate
        ? replaceWithConstantKey(input.cover, constants)
        : input.cover;

    const oldDetails = contentData[input.id];

    let newContent: ContentWebType;
    if (!oldDetails) {
      input.tags.forEach((tag) => {
        tagsData[tag] ??= { Count: 0 };
        tagsData[tag].Count++;
      });
      newContent = {
        ...input,
        title,
        cover,
        added: Time,
        lastUpdated: Time,
      };
      contentData[input.id] = newContent;
      set(contentDataAtom, contentData);
      set(tagsAtom, tagsData);
      return newContent;
    }

    // Handle Removed Tags
    const deletedTags = oldDetails.tags.filter((a) => !input.tags.includes(a));
    deletedTags.forEach((tag) => {
      if (tagsData[tag]) tagsData[tag].Count--;
    });

    // Handle Added Tags
    const addedTags = input.tags.filter((a) => !oldDetails.tags.includes(a));
    addedTags.forEach((tag) => {
      tagsData[tag] ??= { Count: 0 };
      tagsData[tag].Count++;
    });

    newContent = {
      ...oldDetails,
      ...input,
      title,
      cover,
      lastUpdated: Time,
    };

    contentData[newContent.id] = newContent;

    set(contentDataAtom, contentData);
    set(tagsAtom, tagsData);
    return newContent;
  },
);

export const removeContentsAtom = atom(
  null,
  async (get, set, input: { ids: string[] }) => {
    const contentData = structuredClone(await get(contentDataAtom));
    const tagsData = structuredClone(await get(tagsAtom));

    const removed: ContentWebType[] = [];

    input.ids.forEach((id) => {
      const contentDetails = contentData[id];
      if (!contentDetails) return;
      removed.push(contentDetails);
      contentDetails.tags.forEach((tag) => {
        if (tagsData[tag]) tagsData[tag].Count--;
      });
      delete contentData[id];
    });

    set(contentDataAtom, contentData);
    set(tagsAtom, tagsData);
    return removed;
  },
);

export const bulkUpdateContentTagsAtom = atom(
  null,
  async (get, set, input: { ids: string[]; added: string[]; removed: string[] }) => {
    const contentData = structuredClone(await get(contentDataAtom));
    const tagsData = structuredClone(await get(tagsAtom));

    input.ids.forEach((id) => {
      const contentDetails = contentData[id];

      if (!contentDetails)
        throw new Error(`Content with id ${id} doesn't exist`);

      input.removed.forEach((tag) => {
        if (tagsData[tag]) tagsData[tag].Count--;
      });
      contentDetails.tags = contentDetails.tags.filter(
        (tag) => !input.removed.includes(tag),
      );

      input.added.forEach((tag) => {
        tagsData[tag] ??= { Count: 0 };
        tagsData[tag].Count++;
      });
      contentDetails.tags = [
        ...new Set([...contentDetails.tags, ...input.added]),
      ];
    });

    set(contentDataAtom, contentData);
    set(tagsAtom, tagsData);
    return input;
  },
);

export const getContentAtom = atom(
  null,
  async (get, set, input: { id: string }) => {
    const contentData = await get(contentDataAtom);
    return contentData[input.id];
  },
);

export const getFilteredDataAtom = atom(
  null,
  async (get, set, input: FilterDataType) => {
    const contentData = await get(contentDataAtom);
    return filterData(input, contentData);
  },
);
