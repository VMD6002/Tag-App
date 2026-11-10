import {
  filterData,
  parentOf,
  replaceWithConstantKey,
  sanitizeStringForFileName,
} from "@tagapp/utils";
import type {
  ContentWebBaseType,
  ContentWebDataType,
  ContentWebType,
  FilterDataType,
} from "@tagapp/utils/types";
import type { Getter, Setter } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";
import { constantsAtom, replaceWithKeyOnUpdateAtom } from "./constants";
import { sanitizeTitleAtom } from "./settings";
import { parentTagsAtom, tagsAtom } from "./tags";
import { atomWithUserStorage } from "./user";

export const contentDataAtom = atomWithUserStorage<ContentWebDataType>(
  "contentData",
  {},
);

const setContentCallback = async (
  get: Getter,
  set: Setter,
  input: ContentWebBaseType,
) => {
  const [santizeTitle, replaceWithKeyOnUpdate, constants] = await Promise.all([
    get(sanitizeTitleAtom),
    get(replaceWithKeyOnUpdateAtom),
    get(constantsAtom),
  ]);

  const contentData = structuredClone(await get(contentDataAtom));
  const tagsData = structuredClone(await get(tagsAtom));
  const parentsData = structuredClone(await get(parentTagsAtom));

  const Time = Math.floor(Date.now() / 1000);

  const title = santizeTitle
    ? sanitizeStringForFileName(input.title)
    : input.title.trim();
  const cover =
    input.cover && replaceWithKeyOnUpdate
      ? replaceWithConstantKey(input.cover, constants)
      : input.cover;

  const tags = [...new Set(input.tags)];
  const oldDetails = contentData[input.id];
  const oldTags = oldDetails?.tags ?? [];

  // Handle Removed Tags
  oldTags
    .filter((a) => !tags.includes(a))
    .forEach((tag) => {
      if (tagsData[tag])
        tagsData[tag].count = Math.max(0, tagsData[tag].count - 1);
    });

  // Handle Added Tags
  tags
    .filter((a) => !oldTags.includes(a))
    .forEach((tag) => {
      tagsData[tag] ??= { count: 0 };
      tagsData[tag].count++;
      parentsData[parentOf(tag)] ??= {};
    });

  const newContent: ContentWebType = oldDetails
    ? { ...oldDetails, ...input, tags, title, cover, lastUpdated: Time }
    : { ...input, tags, title, cover, added: Time, lastUpdated: Time };

  contentData[newContent.id] = newContent;
  set(contentDataAtom, contentData);
  set(tagsAtom, tagsData);
  set(parentTagsAtom, parentsData);
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
      if (tagsData[tag])
        tagsData[tag].count = Math.max(0, tagsData[tag].count - 1);
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
  const parentsData = structuredClone(await get(parentTagsAtom));

  // Validate first so a bad id can't leave counts half-updated.
  const targets = [...new Set(input.ids)].map((id) => {
    const content = contentData[id];
    if (!content) throw new Error(`Content with id ${id} doesn't exist`);
    return content;
  });

  const now = Math.floor(Date.now() / 1000);
  for (const content of targets) {
    const removed = input.removed.filter((t) => content.tags.includes(t));
    content.tags = content.tags.filter((t) => !removed.includes(t));
    const added = [...new Set(input.added)].filter(
      (t) => !content.tags.includes(t),
    );
    content.tags.push(...added);
    if (!removed.length && !added.length) continue;

    removed.forEach((tag) => {
      if (tagsData[tag])
        tagsData[tag].count = Math.max(0, tagsData[tag].count - 1);
    });
    added.forEach((tag) => {
      tagsData[tag] ??= { count: 0 };
      tagsData[tag].count++;
      parentsData[parentOf(tag)] ??= {};
    });
    content.lastUpdated = now;
  }

  set(contentDataAtom, contentData);
  set(tagsAtom, tagsData);
  set(parentTagsAtom, parentsData);
  return input;
};

export const useBulkUpdateContentTags = () =>
  useAtomCallback(useCallback(bulkUpdateContentTagsCallback, []));

const getContentCallback = async (
  get: Getter,
  _set: Setter,
  input: { id: string },
) => {
  const contentData = await get(contentDataAtom);
  return contentData[input.id];
};

export const useGetContent = () =>
  useAtomCallback(useCallback(getContentCallback, []));

const getFilteredDataCallback = async (
  get: Getter,
  _set: Setter,
  input: FilterDataType,
) => {
  const contentData = await get(contentDataAtom);
  return filterData(input, contentData);
};

export const useGetFilteredData = () =>
  useAtomCallback(useCallback(getFilteredDataCallback, []));
