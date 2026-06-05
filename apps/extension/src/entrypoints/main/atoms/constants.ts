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

export const applyConstantsAtom = atom(async (get) => {
    const constants = await get(constantsAtom);

    return (rawString: string) =>
        rawString.replace(/\$(\w+)/g, (match, key) => {
            return constants[key] !== undefined ? constants[key] : match;
        });
});