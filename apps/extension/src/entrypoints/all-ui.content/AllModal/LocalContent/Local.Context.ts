import constate from "constate";
import { useCallback, useRef, useEffect, useMemo } from "react";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import TIMEOUTS from "@/lib/TIMEOUTS";
import log from "@/lib/log";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  contentDataAtom,
  useSetContent,
  useRemoveContents,
  useGetContent,
} from "@/entrypoints/main/atoms";
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
  updateDownloadTypeAtom,
} from "@/components/craft/UpdateModal/atom";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";
import { useMutation } from "@tanstack/react-query";
import { loadAtom } from "..";
import { applyConstants } from "@tagapp/utils";

function useLocalContextCore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);
  const constants = useAtomValue(constantsAtom);

  const setLoad = useSetAtom(loadAtom);
  const setOpenModal = useSetAtom(updateModalOpenAtom);
  const countRef = useRef(0);

  const contentData = useAtomValue(contentDataAtom);
  const setContentAction = useSetContent();
  const removeContentsAction = useRemoveContents();
  const getContentAction = useGetContent();

  const setPresetOptions = useSetAtom(updatePresetOptionsAtom);

  const setDownloadType = useSetAtom(updateDownloadTypeAtom);

  const [title, setTitle] = useAtom(updateTitleAtom);
  const [tags, setTags] = useAtom(updateTagsAtom);
  const [cover, setCover] = useAtom(updateCoverAtom);
  const [extraData, setExtraData] = useAtom(updateExtraDataAtom);
  const [preset, setPreset] = useAtom(updatePresetAtom);
  const [contentUrl, setContentUrl] = useAtom(updateContentUrlAtom);

  const [exists, setExists] = useAtom(updateExistsAtom);

  const siteData = useMemo(() => GetTagAppSiteData(), []);

  const getContentDetailsMutation = useMutation({
    mutationFn: async (vars: { id: string }) => await getContentAction(vars),
    onSuccess: (res) => {
      const { download } = siteData;
      const extractedContentDetails = GetDetailsFromPage();
      setDownloadType(extractedContentDetails.downloadType);
      if (res) {
        log("Already Exists returning");
        setTitle(res.title);
        setTags(res.tags.map((o) => ({ label: o, value: o })));
        setCover(res.cover || "");
        setExtraData(res.extraData || "");
        setPreset(res.download?.flags);
        setContentUrl(res.contentUrl);

        setExists(true);
      } else {
        setTitle(extractedContentDetails.title);
        setTags(
          extractedContentDetails.defaultTags.map((o) => ({
            label: o,
            value: o,
          })),
        );
        setCover(extractedContentDetails.cover || "");
        setExtraData(
          `Web: [${extractedContentDetails.url}](${extractedContentDetails.url})${extractedContentDetails.extraData ? "\n" + extractedContentDetails.extraData : ""}`,
        );
        extractedContentDetails.contentUrl &&
          setContentUrl(extractedContentDetails.contentUrl);
        siteData.download?.defaultPreset &&
          setPreset(siteData.download.defaultPreset);
        setExists(false);
      }
      setPresetOptions(download?.presets);

      setLoad(true);
    },
  });
  const checkExistance = useCallback(() => {
    setExists(false);
    const { identifier: id } = GetDetailsFromPage();
    if (!id && countRef.current < 20) {
      countRef.current++;
      log(countRef.current + ":" + " Existance");
      TIMEOUTS.clearAllTimeouts();
      TIMEOUTS.setTimeout(() => checkExistance(), 500);
      return;
    }
    if (!id) {
      TIMEOUTS.clearAllTimeouts();
      log("Count finished, Doesnt Exist");
      return;
    }
    getContentDetailsMutation.mutate({ id });
  }, [contentData, siteData]);

  const setContentMutation = useMutation({
    mutationFn: async (vars: any) => await setContentAction(vars),
    onSuccess: (res) => {
      if (exists) log(`${res.id} Updated`);
      else {
        if (!exists && siteData.afterAddScript)
          iframeRef.current?.contentWindow?.postMessage(
            {
              script: replaceWithKeyOnUpdate
                ? applyConstants(siteData.afterAddScript, constants)
                : siteData.afterAddScript,
              data: { siteData, contentDetails: res },
            },
            "*",
          );
        log(`${res.id} Added`);
      }

      setTitle(res.title);
      setCover(res.cover);
      setContentUrl(res.contentUrl);
      setExists(true);
      setOpenModal(false);
    },
  });
  const setContentFunc = useCallback(() => {
    const {
      identifier,
      downloadType,
      url,
      site,
      cover: pageCover,
    } = GetDetailsFromPage();

    const contentTags = tags.map((o) => o.value);

    if (!exists && pageCover !== cover) {
      setTags((o) => [
        ...o,
        { label: "Util:Different_Cover", value: "Util:Different_Cover" },
      ]);
      contentTags.push("Util:Different_Cover");
    }

    const newContent = {
      // Fixed
      scraper: site,
      url,
      id: identifier,
      // Editable
      title,
      cover,
      tags: contentTags,
      extraData,
      download: downloadType
        ? {
            type: downloadType,
            flags: preset,
          }
        : undefined,
      contentUrl,
    };

    setContentMutation.mutate(newContent);
  }, [title, tags, cover, extraData, preset, contentUrl, exists, siteData]);

  const removeContentsMutation = useMutation({
    mutationFn: async (vars: { ids: string[] }) =>
      await removeContentsAction(vars),
    onSuccess: (res) => {
      if (siteData.afterRemoveScript) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            script: replaceWithKeyOnUpdate
              ? applyConstants(siteData.afterRemoveScript, constants)
              : siteData.afterRemoveScript,
            data: { siteData, contentDetails: res[0] },
          },
          "*",
        );
      }

      const { title } = GetDetailsFromPage();
      setExists(false);
      setTags([]);
      setTitle(title);
    },
  });
  const removeContent = useCallback(async () => {
    if (!confirm("Confirm Deletion")) return;
    const { identifier } = GetDetailsFromPage();

    removeContentsMutation.mutate({ ids: [identifier] });
  }, [siteData, contentData]);

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

export const [LocalProvider, useLocalContext] = constate(useLocalContextCore);
