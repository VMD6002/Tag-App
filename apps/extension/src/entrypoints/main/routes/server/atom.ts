import { ContentServerType } from "@tagapp/utils/types";
import { atom } from "jotai";

export const filteredAtom = atom<ContentServerType[]>([]);

export const tagsAtom = atom<string[]>([]);
