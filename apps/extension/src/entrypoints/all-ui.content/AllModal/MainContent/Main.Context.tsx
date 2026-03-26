import constate from "constate";
import { useCallback, useRef, useState, useEffect } from "react";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import TIMEOUTS from "@/lib/TIMEOUTS";
import log from "@/lib/log";
import { sanitizeStringForFileName } from "@tagapp/utils";
import { useAtom, useSetAtom } from "jotai";
import {
  contentDataAtom,
  removeContentsAtom,
} from "@/entrypoints/main/atoms/contentData";
import { tagsAtom as globalTagsAtom } from "@/entrypoints/main/atoms/tags";
import {
  titleAtom,
  tagsAtom,
  coverUrlAtom,
  extraDataAtom,
  presetAtom,
  existsAtom,
  loadAtom,
  openModalAtom,
} from "./atom";

function useMainContextCore() {
  const setLoad = useSetAtom(loadAtom);
  const setOpenModal = useSetAtom(openModalAtom);
  const count = useRef(0);
  const [presets, setPresets] = useState<any[]>([]);

  const [contentData, setContentData] = useAtom(contentDataAtom);
  const removeContents = useSetAtom(removeContentsAtom);
  const setGlobalTags = useSetAtom(globalTagsAtom);

  const [title, setTitle] = useAtom(titleAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [coverUrl, setCoverUrl] = useAtom(coverUrlAtom);
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
      const SiteTag = `Site:${data.site}`;
      setTags([
        ...mediaData.tags.map((o: any) =>
          o !== SiteTag
            ? { label: o, value: o }
            : { label: o, value: o, fixed: true },
        ),
      ]);
      setCoverUrl(mediaData.coverUrl!);
      setExtraData(mediaData.extraData || "");
      setPreset(JSON.stringify(mediaData.download?.flags));
      setExists(true);
    } else {
      setTitle(sanitizeStringForFileName(data.title));
      const SiteTag = `Site:${data.site}`;
      setTags([
        { label: SiteTag, value: SiteTag, fixed: true },
        ...data.defaultTags.map((o: any) => ({ label: o, value: o })),
      ]);
      setCoverUrl(data.coverUrl);
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
    const sanitizedVideoTitle = sanitizeStringForFileName(title);
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      setTitle("");
      return;
    }
    const { identifier, site, url, downloader } = GetDetailsFromPage();
    const { coverUrl: pageCover } = GetDetailsFromPage();

    const Time = Math.floor(Date.now() / 1000);
    if (pageCover !== coverUrl) {
      setTags((o) => [
        ...o,
        { label: "Util:Different_Cover", value: "Util:Different_Cover" },
      ]);
    }

    setContentData(async (tmp) => {
      const oldVids = await tmp;
      if (identifier in oldVids) {
        log("Already Exists returning");
        setExists(true);
        setOpenModal(false);
        return oldVids;
      }

      const SiteTag = `Site:${site}`;
      setGlobalTags(async (tmpp) => {
        const oldTags = await tmpp;
        if (!oldTags[SiteTag]) oldTags[SiteTag] = { Count: 1 };
        else oldTags[SiteTag].Count = oldTags[SiteTag].Count + 1;
        tags.forEach(
          (tag: any) => (oldTags[tag.value] ??= { Count: 0 }).Count++,
        );
        return oldTags;
      });

      oldVids[identifier] = {
        id: identifier,
        title: sanitizedVideoTitle,
        coverUrl: coverUrl,
        tags: [
          ...new Set([
            ...tags.map((o: any) => o.value),
            pageCover !== coverUrl ? "Util:Different_Cover" : null,
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
      return oldVids;
    });
    setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [title, tags, coverUrl, extraData, preset]);

  const updateContentFunc = useCallback(() => {
    const sanitizedVideoTitle = sanitizeStringForFileName(title);
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      setTitle("");
      return;
    }
    const { identifier, downloader } = GetDetailsFromPage();

    setContentData(async (tmp1) => {
      const oldContent = await tmp1;
      const updatedTags = tags.map((o: any) => o.value);
      setGlobalTags(async (tmp2) => {
        const oldTags = await tmp2;
        const Deleted = oldContent[identifier].tags.filter(
          (a: any) => !updatedTags.includes(a),
        );
        Deleted.forEach((tag: any) => {
          oldTags[tag].Count--;
        });

        const Added = updatedTags.filter(
          (a: any) => !oldContent[identifier].tags.includes(a),
        );
        Added.forEach((tag: any) => {
          oldTags[tag].Count++;
        });
        return oldTags;
      });

      oldContent[identifier].title = sanitizedVideoTitle;
      oldContent[identifier].coverUrl = coverUrl;
      oldContent[identifier].tags = tags.map((o: any) => o.value);
      oldContent[identifier].extraData = extraData;
      oldContent[identifier].lastUpdated = Math.floor(Date.now() / 1000);
      oldContent[identifier].download = {
        type: downloader,
        flags: JSON.parse(preset),
      };
      return oldContent;
    });
    setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [title, tags, coverUrl, extraData, preset]);

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
