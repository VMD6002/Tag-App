import { atom } from "jotai";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";

// Content Data

export const presetAtom = atom<string>("");
export const titleAtom = atom<string>("");
export const tagsAtom = atom<MultiSelectOption[]>([]);
export const coverUrlAtom = atom<string>("");
export const extraDataAtom = atom<string>("");

export const resetTitleAtom = atom(null, (get, set) => {
  const { title } = GetDetailsFromPage();
  set(titleAtom, title);
});

export const resetCoverUrlAtom = atom(null, (get, set) => {
  const { coverUrl } = GetDetailsFromPage();
  set(coverUrlAtom, coverUrl);
});

export const resetExtraDataAtom = atom(null, (get, set) => {
  const { url } = GetDetailsFromPage();
  set(extraDataAtom, `Web: [${url}](${url})`);
});

export const resetPresetAtom = atom(null, (get, set) => {
  const { download } = GetTagAppSiteData();
  set(presetAtom, JSON.stringify(download?.defaultPreset));
});

export const resetAllAtom = atom(null, (get, set) => {
  const { title, coverUrl, url, site, defaultTags } = GetDetailsFromPage();
  const { download } = GetTagAppSiteData();

  set(presetAtom, JSON.stringify(download?.defaultPreset));
  set(titleAtom, title);
  set(coverUrlAtom, coverUrl);
  set(extraDataAtom, `Web: [${url}](${url})`);
  set(tagsAtom, defaultTags.map((tag) => ({ label: tag, value: tag })));
});

// Other

export const existsAtom = atom<boolean>(false);

export const loadAtom = atom<boolean>(false);

export const openModalAtom = atom<boolean>(false);
