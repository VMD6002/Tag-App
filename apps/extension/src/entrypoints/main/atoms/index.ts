import {
  ContentWebBaseType,
  ContentWebDataType,
  ContentWebType,
  FilterDataType,
} from "@tagapp/utils/types";
import { atomWithUserStorage } from "./user";
import { Getter, Setter } from "jotai";
import { constantsAtom, replaceWithKeyOnUpdateAtom } from "./constants";
import { tagsAtom } from "./tags";
import { sanitizeTitleAtom } from "./settings";
import {
  filterData,
  replaceWithConstantKey,
  sanitizeStringForFileName,
} from "@tagapp/utils";
import { useCallback } from "react";
import { useAtomCallback } from "jotai/utils";

export const contentDataAtom = atomWithUserStorage<ContentWebDataType>(
  "contentData",
  {},
);

const setContentCallback = async (
  get: Getter,
  set: Setter,
  input: ContentWebBaseType,
) => {
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
      tagsData[tag] ??= { count: 0 };
      tagsData[tag].count++;
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
    if (tagsData[tag]) tagsData[tag].count--;
  });

  // Handle Added Tags
  const addedTags = input.tags.filter((a) => !oldDetails.tags.includes(a));
  addedTags.forEach((tag) => {
    tagsData[tag] ??= { count: 0 };
    tagsData[tag].count++;
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
};

export const useSetContent = () =>
  useAtomCallback(useCallback(setContentCallback, []));

const removeContentsCallback = async (
  get: Getter,
  set: Setter,
  input: { ids: string[] },
) => {
  const contentData = structuredClone(await get(contentDataAtom));
  const tagsData = structuredClone(await get(tagsAtom));

  const removed: ContentWebType[] = [];

  input.ids.forEach((id) => {
    const contentDetails = contentData[id];
    if (!contentDetails) return;
    removed.push(contentDetails);
    contentDetails.tags.forEach((tag) => {
      if (tagsData[tag]) tagsData[tag].count--;
    });
    delete contentData[id];
  });

  set(contentDataAtom, contentData);
  set(tagsAtom, tagsData);
  return removed;
};

export const useRemoveContents = () =>
  useAtomCallback(useCallback(removeContentsCallback, []));

const bulkUpdateContentTagsCallback = async (
  get: Getter,
  set: Setter,
  input: { ids: string[]; added: string[]; removed: string[] },
) => {
  const contentData = structuredClone(await get(contentDataAtom));
  const tagsData = structuredClone(await get(tagsAtom));

  input.ids.forEach((id) => {
    const contentDetails = contentData[id];

    if (!contentDetails) throw new Error(`Content with id ${id} doesn't exist`);

    input.removed.forEach((tag) => {
      if (tagsData[tag]) tagsData[tag].count--;
    });
    contentDetails.tags = contentDetails.tags.filter(
      (tag) => !input.removed.includes(tag),
    );

    input.added.forEach((tag) => {
      tagsData[tag] ??= { count: 0 };
      tagsData[tag].count++;
    });
    contentDetails.tags = [
      ...new Set([...contentDetails.tags, ...input.added]),
    ];
  });

  set(contentDataAtom, contentData);
  set(tagsAtom, tagsData);
  return input;
};

export const useBulkUpdateContentTags = () =>
  useAtomCallback(useCallback(bulkUpdateContentTagsCallback, []));

const getContentCallback = async (
  get: Getter,
  set: Setter,
  input: { id: string },
) => {
  const contentData = await get(contentDataAtom);
  return contentData[input.id];
};

export const useGetContent = () =>
  useAtomCallback(useCallback(getContentCallback, []));

const getFilteredDataCallback = async (
  get: Getter,
  set: Setter,
  input: FilterDataType,
) => {
  const contentData = await get(contentDataAtom);
  return filterData(input, contentData);
};

export const useGetFilteredData = () =>
  useAtomCallback(useCallback(getFilteredDataCallback, []));
