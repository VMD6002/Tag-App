import { atom } from "jotai";
import { contentDataAtom } from "./contentData";
import { resetFilterAtom, injectFilterDataIntoURLAtom } from "./filter";
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

  set(tagParentsAtom, tagParents);

  set(tagsAtom, async (promise) => {
    const raw = await promise;
    const tagsData = { ...raw };
    const deletedTags = new Set<string>();

    Object.keys(tagsData).forEach((tag) => {
      if (tag.startsWith(parent)) {
        deletedTags.add(tag);
        delete tagsData[tag];
      }
    });

    set(contentDataAtom, async (cPromise) => {
      const cRaw = await cPromise;
      const contentData = { ...cRaw };
      Object.values(contentData).forEach((entry) => {
        const originalTagsCount = entry.tags.length;
        entry.tags = entry.tags.filter((t) => !deletedTags.has(t));
        if (entry.tags.length !== originalTagsCount) {
          entry.lastUpdated = Math.floor(Date.now() / 1000);
        }
      });
      return contentData;
    });

    return tagsData;
  });
});

export const removeTagAtom = atom(null, async (get, set, tag: string) => {
  const isSiteTag = tag.startsWith("Site:");
  const initialContentData = await get(contentDataAtom);
  const hasEntries = Object.values(initialContentData).some((entry) =>
    entry.tags.includes(tag),
  );

  if (isSiteTag && hasEntries) {
    alert(`Entry or Entries with ${tag} exist. Can't remove.`);
    return;
  }

  set(tagsAtom, async (promise) => {
    const raw = await promise;
    const tagsData = { ...raw };
    delete tagsData[tag];
    return tagsData;
  });

  set(contentDataAtom, async (promise) => {
    const raw = await promise;
    const contentData = { ...raw };
    Object.values(contentData).forEach((entry) => {
      if (entry.tags.includes(tag)) {
        entry.tags = entry.tags.filter((t) => t !== tag);
        entry.lastUpdated = Math.floor(Date.now() / 1000);
      }
    });
    return contentData;
  });
});

export const fixTagCountAtom = atom(null, async (get, set) => {
  set(resetFilterAtom);
  set(injectFilterDataIntoURLAtom);

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
