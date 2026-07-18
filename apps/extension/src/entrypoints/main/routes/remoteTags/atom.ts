import type { ParentTagsType, TagsType } from "@tagapp/utils/types";
import { atom } from "jotai";

export const remoteTagsAtom = atom<TagsType>({});
export const remoteParentTagsAtom = atom<ParentTagsType>({});
export const tagStringAtom = atom("");
export const parentTagStringAtom = atom("");
