import { Getter, Setter } from "jotai";
import { contentDataAtom } from ".";
import { resetFilterCallback, injectFilterDataIntoURLCallback } from "./filter";
import { atomWithUserStorage } from "./user";
import { useCallback } from "react";
import { useAtomCallback } from "jotai/utils";

export const tagDefaultData = {
  "Type:GIF": { count: 0 },
  "Type:Short_Clip": {
    count: 0,
  },
  "Tag:Watched": {
    count: 0,
  },
  "Tag:To-Watch": {
    count: 0,
  },
};

export const tagsAtom = atomWithUserStorage<TagType>("tags", tagDefaultData);

export const tagParentsAtom = atomWithUserStorage<Record<string, string>>(
  "parents",
  {
    Type: "",
    Tag: "",
    Site: "",
  },
);

const removeParentCallback = async (
  get: Getter,
  set: Setter,
  parent: string,
) => {
  const tagParents = await get(tagParentsAtom);
  delete tagParents[parent];

  const tagsData = { ...(await get(tagsAtom)) };
  const deletedTags = new Set<string>();

  Object.keys(tagsData).forEach((tag) => {
    if (tag.startsWith(parent)) {
      deletedTags.add(tag);
      delete tagsData[tag];
    }
  });

  set(tagsAtom, tagsData);
  set(tagParentsAtom, tagParents);
};

export const useRemoveParent = () =>
  useAtomCallback(useCallback(removeParentCallback, []));

const removeTagCallback = async (get: Getter, set: Setter, tag: string) => {
  const tagsData = { ...(await get(tagsAtom)) };
  delete tagsData[tag];
  set(tagsAtom, tagsData);

  const contentData = { ...(await get(contentDataAtom)) };
  Object.values(contentData).forEach((entry) => {
    if (entry.tags.includes(tag)) {
      entry.tags = entry.tags.filter((t) => t !== tag);
      entry.lastUpdated = Math.floor(Date.now() / 1000);
    }
  });
  set(contentDataAtom, contentData);
};

export const useRemoveTag = () =>
  useAtomCallback(useCallback(removeTagCallback, []));

const fixTagCountCallback = async (get: Getter, set: Setter) => {
  resetFilterCallback(get, set);
  injectFilterDataIntoURLCallback(get, set);

  const contentData = { ...(await get(contentDataAtom)) };
  const tagsData = structuredClone(await get(tagsAtom));

  const CalculatedTags = new Map<string, number>();
  const AllTags = new Set(Object.keys(tagsData));

  Object.values(contentData).forEach((entry) => {
    entry.tags.forEach((tag) => {
      CalculatedTags.set(tag, (CalculatedTags.get(tag) || 0) + 1);
    });
  });

  const newTagsData: TagType = {};

  CalculatedTags.forEach((count, tag) => {
    if (tagsData[tag]) {
      newTagsData[tag] = { ...tagsData[tag], count: count };
    } else {
      newTagsData[tag] = { count: count };
    }
  });

  AllTags.forEach((tag) => {
    if (!CalculatedTags.has(tag)) {
      if (!newTagsData[tag]) {
        newTagsData[tag] = { ...tagsData[tag], count: 0 };
      }
    }
  });

  set(tagsAtom, newTagsData);
};

export const useFixTagCount = () =>
  useAtomCallback(useCallback(fixTagCountCallback, []));
