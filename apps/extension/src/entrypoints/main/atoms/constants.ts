import { atomWithUserStorage } from "./user";

export const replaceWithKeyOnUpdateAtom = atomWithUserStorage<boolean>(
  "replaceWithKeyOnUpdate",
  true,
);

export const constantsAtom = atomWithUserStorage<Record<string, string>>(
  "constants",
  {},
);
