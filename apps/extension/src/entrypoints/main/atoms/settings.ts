import { atomWithStorage } from "jotai/utils";
import { createWxtStorage } from "./storage";

export const themeAtom = atomWithStorage<"dark" | "light" | "system">(
  "theme",
  "system",
  createWxtStorage(),
);

export const galleryListWidthAtom = atomWithStorage<number>(
  "galleryListWidth",
  100,
  createWxtStorage(),
);

export const galleryViewModeAtom = atomWithStorage<
  "list" | "grid-2" | "grid-3" | "grid-4"
>("galleryViewMode", "list", createWxtStorage());

export const serverUrlAtom = atomWithStorage<string>(
  "serverUrl",
  "",
  createWxtStorage(),
);

export const serverFeaturesAtom = atomWithStorage<boolean>(
  "serverFeatures",
  true,
  createWxtStorage(),
);

export const overwriteAtom = atomWithStorage<boolean>(
  "Overwrite",
  true,
  createWxtStorage(),
);
