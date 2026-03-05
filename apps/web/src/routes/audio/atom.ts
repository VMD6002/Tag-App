import { atom } from "jotai";

export const currentAtom = atom("");

export type AudioEntry = {
  name: string;
  cover?: string;
};

export const audiosAtom = atom<AudioEntry[]>([]);
