import { atom } from "jotai";
import { atomWithUserStorage } from "./user";

export const replaceWithKeyOnUpdateAtom = atomWithUserStorage<boolean>(
    "replaceWithKeyOnUpdate",
    false,
);

export const constantsAtom = atomWithUserStorage<Record<string, string>>(
    "constants",
    { YT: "https://www.youtube.com" },
);