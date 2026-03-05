import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { createWxtStorage } from "@/entrypoints/main/atoms/storage";
import { ContentWebDataType } from "@tagapp/utils/types";

export interface TagType {
  [key: string]: {
    Count: number;
    CoverUrl?: string;
  };
}

export const tagDefaultData: TagType = {
  "Type:Img": { Count: 0 },
  "Type:GIF": { Count: 0 },
  "Type:Animation": { Count: 0 },
  "Type:3D": { Count: 0 },
  "Type:Short_Clip": { Count: 0 },
  "Util:Downloaded": {
    Count: 0,
    CoverUrl: "https://www.svgrepo.com/show/501864/disk.svg",
  },
  "Util:Different_Cover": { Count: 0 },
};

export const tagsAtom = atomWithStorage<TagType>(
  "tags",
  tagDefaultData,
  createWxtStorage(),
);

export const contentDataAtom = atomWithStorage<ContentWebDataType>(
  "contentData",
  {},
  createWxtStorage(),
);

export const tagParentsAtom = atomWithStorage<string[]>(
  "parents",
  ["Type", "Util", "Site"],
  createWxtStorage(),
);

export const removeContentsAtom = atom(
  null,
  async (get, set, keys: string[]) => {
    const contentData = structuredClone(await get(contentDataAtom));
    const tagsData = structuredClone(await get(tagsAtom));

    keys.forEach((key) => {
      if (contentData[key]) {
        contentData[key].tags.forEach((tag: string) => {
          if (tagsData[tag]) tagsData[tag].Count--;
        });
        delete contentData[key];
      }
    });

    set(contentDataAtom, contentData);
    set(tagsAtom, tagsData);
  },
);
