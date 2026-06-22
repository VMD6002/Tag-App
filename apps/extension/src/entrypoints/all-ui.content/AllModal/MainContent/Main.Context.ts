import constate from "constate";
import { useCallback, useRef, useEffect } from "react";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import TIMEOUTS from "@/lib/TIMEOUTS";
import log from "@/lib/log";
import {
  sanitizeStringForFileName,
  replaceWithConstantKey,
} from "@tagapp/utils";
import {
  atom,
  getDefaultStore,
  useAtom,
  useAtomValue,
  useSetAtom,
} from "jotai";
import {
  contentDataAtom,
  removeContentsAtom,
} from "@/entrypoints/main/atoms/contentData";
import { tagsAtom as globalTagsAtom } from "@/entrypoints/main/atoms/tags";
import {
  updateTitleAtom,
  updateTagsAtom,
  updateCoverAtom,
  updateExtraDataAtom,
  updatePresetAtom,
  updateExistsAtom,
  updateModalOpenAtom,
  updateContentUrlAtom,
  updatePresetOptionsAtom,
  updateResetOptionsAtom,
  updateDataAtom,
} from "@/components/craft/UpdateModal/atom";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";
import { sanitizeTitleAtom } from "@/entrypoints/main/atoms/settings";
import type { ContentWebType } from "@tagapp/utils/types";

export const loadAtom = atom(false);

const store = getDefaultStore();

store.set(updateResetOptionsAtom, {
  title: () => GetDetailsFromPage().title,
  cover: () => GetDetailsFromPage().cover!,
  tags: () =>
    GetDetailsFromPage().defaultTags.map((o) => ({ label: o, value: o })),
  contentUrl: () => GetDetailsFromPage().contentUrl!,
  preset: () => GetTagAppSiteData().download?.defaultPreset!,
  extraData: () =>
    `Web: [${GetDetailsFromPage().url}](${GetDetailsFromPage().url})${GetDetailsFromPage().extraData ? "\n" + GetDetailsFromPage().extraData : ""}`,
});

function useMainContextCore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const constants = useAtomValue(constantsAtom);
  const santizeTitle = useAtomValue(sanitizeTitleAtom);
  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);

  const setLoad = useSetAtom(loadAtom);
  const setOpenModal = useSetAtom(updateModalOpenAtom);
  const countRef = useRef(0);

  const [contentData, setContentData] = useAtom(contentDataAtom);
  const removeContents = useSetAtom(removeContentsAtom);
  const setGlobalTags = useSetAtom(globalTagsAtom);
  const setPresetOptions = useSetAtom(updatePresetOptionsAtom);

  const [title, setTitle] = useAtom(updateTitleAtom);
  const [tags, setTags] = useAtom(updateTagsAtom);
  const [cover, setCover] = useAtom(updateCoverAtom);
  const [extraData, setExtraData] = useAtom(updateExtraDataAtom);
  const [preset, setPreset] = useAtom(updatePresetAtom);
  const [contentUrl, setContentUrl] = useAtom(updateContentUrlAtom);

  const [exists, setExists] = useAtom(updateExistsAtom);

  const siteData = useMemo(() => GetTagAppSiteData(), []);

  const checkExistance = useCallback(() => {
    setExists(false);
    const siteContentDetails = GetDetailsFromPage();
    if (!siteContentDetails.identifier && countRef.current < 20) {
      countRef.current++;
      log(countRef.current + ":" + " Existance");
      TIMEOUTS.clearAllTimeouts();
      TIMEOUTS.setTimeout(() => checkExistance(), 500);
      return;
    }
    if (!siteContentDetails.identifier) {
      TIMEOUTS.clearAllTimeouts();
      log("Count finished, Doesnt Exist");
      return;
    }
    const { download } = siteData;
    if (siteContentDetails.identifier in contentData) {
      log("Already Exists returning");
      const contentDetails = contentData[siteContentDetails.identifier];
      setTitle(contentDetails.title);
      setTags(contentDetails.tags.map((o) => ({ label: o, value: o })));
      setCover(contentDetails.cover || "");
      setExtraData(contentDetails.extraData || "");
      setPreset(contentDetails.download?.flags);
      setContentUrl(contentDetails.contentUrl);

      setExists(true);
    } else {
      setTitle(
        santizeTitle
          ? sanitizeStringForFileName(siteContentDetails.title)
          : siteContentDetails.title,
      );
      setTags(
        siteContentDetails.defaultTags.map((o) => ({ label: o, value: o })),
      );
      setCover(siteContentDetails.cover || "");
      setExtraData(
        `Web: [${siteContentDetails.url}](${siteContentDetails.url})${siteContentDetails.extraData ? "\n" + siteContentDetails.extraData : ""}`,
      );
      siteContentDetails.contentUrl &&
        setContentUrl(siteContentDetails.contentUrl);
      siteData.download?.defaultPreset &&
        setPreset(siteData.download.defaultPreset);
      setExists(false);
    }
    setPresetOptions(download?.presets);

    setLoad(true);
  }, [contentData, siteData]);

  const setContentFunc = useCallback(async () => {
    const sanitizedVideoTitle = santizeTitle
      ? sanitizeStringForFileName(title)
      : title.trim();
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      setTitle("");
      return;
    }
    const {
      identifier,
      downloader,
      url,
      site,
      cover: pageCover,
    } = GetDetailsFromPage();

    let newContent: ContentWebType;

    await setContentData(async (oldContentData) => {
      const NewContentData = await oldContentData;

      const updatedTags = tags.map((o) => o.value);

      if (!exists && pageCover !== cover) {
        setTags((o) => [
          ...o,
          { label: "Util:Different_Cover", value: "Util:Different_Cover" },
        ]);
        updatedTags.push("Util:Different_Cover");
      }

      await setGlobalTags(async (oldGlobalTags) => {
        const NewGlobalTags = await oldGlobalTags;

        if (!exists) {
          updatedTags.forEach(
            (tag) => (NewGlobalTags[tag] ??= { Count: 0 }).Count++,
          );
          return { ...NewGlobalTags };
        }

        const Deleted = NewContentData[identifier].tags.filter(
          (a) => !updatedTags.includes(a),
        );
        Deleted.forEach((tag) => {
          NewGlobalTags[tag].Count--;
        });

        const Added = updatedTags.filter(
          (a) => !NewContentData[identifier].tags.includes(a),
        );
        Added.forEach((tag: any) => {
          NewGlobalTags[tag].Count++;
        });
        return { ...NewGlobalTags };
      });

      const Time = Math.floor(Date.now() / 1000);

      if (!exists)
        newContent = {
          // Fixed
          scraper: site,
          url: url,
          id: identifier,
          added: Time,
          lastUpdated: Time, // Not exactly fixed but not editable either
          // Editable
          title: sanitizedVideoTitle,
          cover:
            cover && replaceWithKeyOnUpdate
              ? replaceWithConstantKey(cover, constants)
              : cover,
          tags: updatedTags,
          extraData: extraData,
          download: downloader
            ? {
                type: downloader,
                flags: preset,
              }
            : undefined,
          contentUrl: contentUrl,
        };
      else
        newContent = {
          ...NewContentData[identifier],
          title: sanitizedVideoTitle,
          cover:
            cover && replaceWithKeyOnUpdate
              ? replaceWithConstantKey(cover, constants)
              : cover,
          tags: tags.map((o: any) => o.value),
          download: downloader
            ? {
                type: downloader,
                flags: preset,
              }
            : undefined,
          extraData,
          contentUrl,
          lastUpdated: Math.floor(Date.now() / 1000),
        };

      NewContentData[identifier] = newContent;
      return { ...NewContentData };
    });

    if (exists) log(`${identifier} Updated`);
    else {
      log(`${identifier} Added`);
      if (siteData.afterAddScript)
        iframeRef.current?.contentWindow?.postMessage(
          { siteData, contentDetails: newContent!, action: "add" },
          "*",
        );
    }

    setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [
    title,
    tags,
    cover,
    extraData,
    preset,
    constants,
    replaceWithKeyOnUpdate,
    contentUrl,
    exists,
    siteData,
  ]);

  const updateData = useAtomValue(updateDataAtom);
  const removeContent = useCallback(async () => {
    if (!confirm("Confirm Deletion")) return;
    const contentDetails = GetDetailsFromPage();

    await removeContents([contentDetails.identifier]);
    if (siteData.afterRemoveScript) {
      const modifiedContentDetails = {
        ...contentDetails,
        ...updateData,
      };
      iframeRef.current?.contentWindow?.postMessage(
        { siteData, contentDetails: modifiedContentDetails, action: "remove" },
        "*",
      );
    }

    setExists(false);
    setTags([]);
    setTitle(contentDetails.title);
  }, [siteData, updateData]);

  useEffect(() => {
    checkExistance();
    const presetOptions = siteData.download?.presets;
    setPresetOptions(presetOptions);
  }, [contentData, siteData]);

  return {
    iframeRef,
    countRef,
    checkExistance,
    setContentFunc,
    removeContent,
  };
}

export const [MainProvider, useMainContext] = constate(useMainContextCore);
