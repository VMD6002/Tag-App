import { atomWithUserStorage } from "./user";

export const themeAtom = atomWithUserStorage<"dark" | "light" | "system">(
  "theme",
  "system",
);

export const galleryListWidthAtom = atomWithUserStorage<number>(
  "galleryListWidth",
  100,
);

export const galleryViewModeAtom = atomWithUserStorage<
  "list" | "grid-2" | "grid-3" | "grid-4"
>("galleryViewMode", "list");

export const serverUrlAtom = atomWithUserStorage<string>("serverUrl", "");

type AppModeType = "local" | "hybrid" | "remote";

export const appModeAtom = atomWithUserStorage<AppModeType>("appMode", "local");

export const overwriteAtom = atomWithUserStorage<boolean>("Overwrite", true);

export const sanitizeTitleAtom = atomWithUserStorage<boolean>(
  "sanitizeTitle",
  true,
);

export const hostNamesAtom = atomWithUserStorage<string[]>("hostNames", []);
