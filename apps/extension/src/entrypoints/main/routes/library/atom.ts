import { filterDataWeb } from "@tagapp/utils";
import { contentDataAtom } from "@/entrypoints/main/atoms/contentData";
import {
  selectionEntriesAtom,
  selectionOnAtom,
} from "@/entrypoints/main/atoms/selection";
import { atom } from "jotai";
import { FilterDataAtom } from "@/entrypoints/main/atoms/filter";

export const filteredAtom = atom<string[]>([]);

export const filterDataAtom = atom(null, async (get, set) => {
  const contentData = await get(contentDataAtom);
  const filterData = get(FilterDataAtom);

  const filteredKeys = filterDataWeb(contentData, filterData);

  set(selectionEntriesAtom, []);
  set(selectionOnAtom, false);
  set(filteredAtom, filteredKeys);
});
