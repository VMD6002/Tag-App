import constate from "constate";
import { useCallback, useRef, useState, useEffect } from "react";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import TIMEOUTS from "@/lib/TIMEOUTS";
import log from "@/lib/log";
import { sanitizeStringForFileName, replaceWithConstantKey } from "@tagapp/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  contentDataAtom,
  removeContentsAtom,
} from "@/entrypoints/main/atoms/contentData";
import { tagsAtom as globalTagsAtom } from "@/entrypoints/main/atoms/tags";
import {
  titleAtom,
  tagsAtom,
  coverAtom,
  extraDataAtom,
  presetAtom,
  existsAtom,
  loadAtom,
  openModalAtom,
} from "./atom";
import { constantsAtom, replaceWithKeyOnUpdateAtom } from "@/entrypoints/main/atoms/constants";
import { sanitizeTitleAtom } from "@/entrypoints/main/atoms/settings";

function useMainContextCore() {
  const constants = useAtomValue(constantsAtom)
  const santizeTitle = useAtomValue(sanitizeTitleAtom)
  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom)

  const setLoad = useSetAtom(loadAtom);
  const setOpenModal = useSetAtom(openModalAtom);
  const count = useRef(0);
  const [presets, setPresets] = useState<any[]>([]);

  const [contentData, setContentData] = useAtom(contentDataAtom);
  const removeContents = useSetAtom(removeContentsAtom);
  const setGlobalTags = useSetAtom(globalTagsAtom);

  const [title, setTitle] = useAtom(titleAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [cover, setCover] = useAtom(coverAtom);
  const [extraData, setExtraData] = useAtom(extraDataAtom);
  const [preset, setPreset] = useAtom(presetAtom);

  const setExists = useSetAtom(existsAtom);

  const checkExistance = useCallback(() => {
    setExists(false);
    const data = GetDetailsFromPage();
    if (!data.identifier && count.current < 20) {
      count.current++;
      log(count.current + ":" + " Existance");
      TIMEOUTS.clearAllTimeouts();
      TIMEOUTS.setTimeout(() => checkExistance(), 500);
      return;
    }
    if (!data.identifier) {
      TIMEOUTS.clearAllTimeouts();
      log("Count finished, Doesnt Exist");
      return;
    }
    const { download } = GetTagAppSiteData();
    if (data.identifier in contentData) {
      log("Already Exists returning");
      const mediaData = contentData[data.identifier];
      setTitle(mediaData.title);
      setTags(mediaData.tags.map((o) => ({ label: o, value: o })));
      setCover(mediaData.cover!);
      setExtraData(mediaData.extraData || "");
      setPreset(JSON.stringify(mediaData.download?.flags));
      setExists(true);
    } else {
      setTitle(santizeTitle ? sanitizeStringForFileName(data.title) : data.title);
      setTags(data.defaultTags.map((o) => ({ label: o, value: o })));
      setCover(data.cover);
      setExtraData(
        `Web: [${data.url}](${data.url})${data.extraData ? "\n" + data.extraData : ""}`,
      );
      setPreset(
        data.contentUrl
          ? `"${data.contentUrl}"`
          : (JSON.stringify(download?.defaultPreset) ?? `""`),
      );
      setExists(false);
    }
    setPresets(download?.presets ?? []);

    setLoad(true);
  }, [contentData]);

  const addContentFunc = useCallback(() => {
    const sanitizedVideoTitle = santizeTitle ? sanitizeStringForFileName(title) : title.trim();
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      setTitle("");
      return;
    }
    const { identifier, url, downloader } = GetDetailsFromPage();
    const { cover: pageCover } = GetDetailsFromPage();

    const Time = Math.floor(Date.now() / 1000);
    if (pageCover !== cover) {
      setTags((o) => [
        ...o,
        { label: "Util:Different_Cover", value: "Util:Different_Cover" },
      ]);
    }

    setContentData(async (oldContentData) => {
      const NewContentData = { ...(await oldContentData) };
      if (identifier in NewContentData) {
        log("Already Exists returning");
        setExists(true);
        setOpenModal(false);
        return oldContentData;
      }

      setGlobalTags(async (oldGlobalTags) => {
        const NewGlobalTags = { ...(await oldGlobalTags) };
        tags.forEach(
          (tag: any) => (NewGlobalTags[tag.value] ??= { Count: 0 }).Count++,
        );
        return NewGlobalTags;
      });

      NewContentData[identifier] = {
        id: identifier,
        title: replaceWithKeyOnUpdate ? replaceWithConstantKey(sanitizedVideoTitle, constants) : sanitizedVideoTitle,
        cover: cover,
        tags: [
          ...new Set([
            ...tags.map((o: any) => o.value),
            pageCover !== cover ? "Util:Different_Cover" : null,
          ]),
        ].filter((o) => o) as string[],
        url: url,
        added: Time,
        lastUpdated: Time,
        extraData: extraData,
        download: {
          type: downloader,
          flags: JSON.parse(preset),
        },
      };

      return NewContentData;
    });
    setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [title, tags, cover, extraData, preset, constants, replaceWithKeyOnUpdate]);

  const updateContentFunc = useCallback(() => {
    const sanitizedVideoTitle = santizeTitle ? sanitizeStringForFileName(title) : title.trim();
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      setTitle("");
      return;
    }
    const { identifier, downloader } = GetDetailsFromPage();

    setContentData(async (oldContentData) => {
      const NewContentData = { ...(await oldContentData) };
      const updatedTags = tags.map((o: any) => o.value);
      setGlobalTags(async (oldGlobalTags) => {
        const NewGlobalTags = { ...(await oldGlobalTags) };
        const Deleted = NewContentData[identifier].tags.filter(
          (a: any) => !updatedTags.includes(a),
        );
        Deleted.forEach((tag: any) => {
          NewGlobalTags[tag].Count--;
        });

        const Added = updatedTags.filter(
          (a: any) => !NewContentData[identifier].tags.includes(a),
        );
        Added.forEach((tag: any) => {
          NewGlobalTags[tag].Count++;
        });
        return NewGlobalTags;
      });

      NewContentData[identifier] = {
        ...NewContentData[identifier],
        title: replaceWithKeyOnUpdate ? replaceWithConstantKey(sanitizedVideoTitle, constants) : sanitizedVideoTitle,
        cover,
        tags: tags.map((o: any) => o.value),
        extraData,
        lastUpdated: Math.floor(Date.now() / 1000),
        download: {
          type: downloader,
          flags: JSON.parse(preset),
        },
      };
      return NewContentData;
    });
    setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [title, tags, cover, extraData, preset, constants, replaceWithKeyOnUpdate]);

  const removeContent = useCallback(() => {
    if (!confirm("Confirm Deletion")) return;
    const { identifier, title: pageTitle } = GetDetailsFromPage();
    removeContents([identifier]);
    setExists(false);
    setTags([]);
    setTitle(pageTitle);
  }, []);

  useEffect(() => {
    checkExistance();
  }, [contentData]);

  return {
    count,
    presets,
    checkExistance,
    addContentFunc,
    updateContentFunc,
    removeContent,
  };
}

export const [MainProvider, useMainContext] = constate(useMainContextCore);
