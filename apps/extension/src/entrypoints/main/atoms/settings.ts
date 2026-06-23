import { atomWithUserStorage } from "./user";

export const themeAtom = atomWithUserStorage<"dark" | "light" | "system">(
  "theme",
  "system",
);

export const serverUrlAtom = atomWithUserStorage<string>("serverUrl", "");

type AppModeType = "local" | "remote";

export const appModeAtom = atomWithUserStorage<AppModeType>("appMode", "local");

export const sanitizeTitleAtom = atomWithUserStorage<boolean>(
  "sanitizeTitle",
  false,
);

export const hostNamesAtom = atomWithUserStorage<string[]>("hostNames", []);

export const contentDataOptionalScriptAtom = atomWithUserStorage<string>(
  "contentDataOptionalScript",
  "",
);
