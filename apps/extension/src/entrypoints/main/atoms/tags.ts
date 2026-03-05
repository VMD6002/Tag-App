import { atom } from "jotai";
import { contentDataAtom } from "./contentData";
import { atomWithStorage } from "jotai/utils";
import { createWxtStorage } from "./storage";

export const tagDefaultData = {
  "Type:Img": { Count: 0 },
  "Type:GIF": { Count: 0 },
  "Type:Animation": {
    Count: 0,
  },
  "Type:3D": {
    Count: 0,
  },
  "Type:Short_Clip": {
    Count: 0,
  },
  "Util:Downloaded": {
    Count: 0,
    CoverUrl: "https://www.svgrepo.com/show/501864/disk.svg",
  },
  "Util:Different_Cover": {
    Count: 0,
  },
};

export const tagsAtom = atomWithStorage<TagType>(
  "tags",
  tagDefaultData,
  createWxtStorage(),
);

export const tagParentsAtom = atomWithStorage<string[]>(
  "parents",
  ["Type", "Util", "Site"],
  createWxtStorage(),
);

export const removeParentAtom = atom(null, async (get, set, parent: string) => {
  const tagParents = (await get(tagParentsAtom)).filter(
    (val) => val !== parent,
  );
  const tagsData = structuredClone(await get(tagsAtom));
  const contentData = structuredClone(await get(contentDataAtom));

  const deletedTags = new Set<string>();

  Object.keys(tagsData).forEach((tag) => {
    if (tag.startsWith(parent)) {
      deletedTags.add(tag);
      delete tagsData[tag];
    }
  });

  Object.values(contentData).forEach((entry) => {
    const originalTagsCount = entry.tags.length;
    entry.tags = entry.tags.filter((t) => !deletedTags.has(t));
    if (entry.tags.length !== originalTagsCount) {
      entry.lastUpdated = Math.floor(Date.now() / 1000);
    }
  });

  set(tagParentsAtom, tagParents);
  set(tagsAtom, tagsData);
  set(contentDataAtom, contentData);
});

export const removeTagAtom = atom(null, async (get, set, tag: string) => {
  const contentData = structuredClone(await get(contentDataAtom));

  const isSiteTag = tag.startsWith("Site:");
  const hasEntries = Object.values(contentData).some((entry) =>
    entry.tags.includes(tag),
  );

  if (isSiteTag && hasEntries) {
    alert(`Entry or Entries with ${tag} exist. Can't remove.`);
    return;
  }

  const tagsData = structuredClone(await get(tagsAtom));
  delete tagsData[tag];

  Object.values(contentData).forEach((entry) => {
    if (entry.tags.includes(tag)) {
      entry.tags = entry.tags.filter((t) => t !== tag);
      entry.lastUpdated = Math.floor(Date.now() / 1000);
    }
  });

  set(tagsAtom, tagsData);
  set(contentDataAtom, contentData);
});

export const fixTagCountAtom = atom(null, async (get, set) => {
  const contentData = await get(contentDataAtom);
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
      newTagsData[tag] = { ...tagsData[tag], Count: count };
    } else {
      newTagsData[tag] = { Count: count };
    }
  });

  AllTags.forEach((tag) => {
    if (!CalculatedTags.has(tag)) {
      if (!newTagsData[tag]) {
        newTagsData[tag] = { ...tagsData[tag], Count: 0 };
      }
    }
  });

  set(tagsAtom, newTagsData);
});
