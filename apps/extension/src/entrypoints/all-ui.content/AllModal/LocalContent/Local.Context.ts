import { applyConstants } from "@tagapp/utils";
import { useMutation } from "@tanstack/react-query";
import constate from "constate";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  updateContentUrlAtom,
  updateCoverAtom,
  updateDownloadTypeAtom,
  updateExistsAtom,
  updateExtraDataAtom,
  updateModalOpenAtom,
  updatePresetAtom,
  updatePresetOptionsAtom,
  updateTagsAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal/atom";
import {
  contentDataAtom,
  useGetContent,
  useRemoveContents,
  useSetContent,
} from "@/entrypoints/main/atoms";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";
import { sanitizeTitleAtom } from "@/entrypoints/main/atoms/settings";
import { enableAfterAddRemoveScriptsAtom } from "@/entrypoints/main/atoms/supportedSites";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import log from "@/lib/log";
import TIMEOUTS from "@/lib/TIMEOUTS";
import { loadAtom } from "..";

function useLocalContextCore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);
  const constants = useAtomValue(constantsAtom);
  useAtomValue(sanitizeTitleAtom); // keep subscribed: setContent reads it without mounting

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

  const afterAddRemoveScript = useAtomValue(enableAfterAddRemoveScriptsAtom);
  const runScript = useCallback(
    (script: string, data: unknown) => {
      if (!afterAddRemoveScript) return;
      iframeRef.current?.contentWindow?.postMessage(
        {
          script: replaceWithKeyOnUpdate
            ? applyConstants(script, constants)
            : script,
          data,
        },
        "*",
      );
    },
    [replaceWithKeyOnUpdate, constants, afterAddRemoveScript],
  );

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
          `Web: [${extractedContentDetails.url}](${extractedContentDetails.url})${extractedContentDetails.extraData ? `\n${extractedContentDetails.extraData}` : ""}`,
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
      log(`${countRef.current}: Existance`);
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
  }, [setExists, getContentDetailsMutation.mutate]);

  const setContentMutation = useMutation({
    mutationFn: async (vars: Parameters<typeof setContentAction>[0]) =>
      await setContentAction(vars),
    onSuccess: (res) => {
      if (exists) log(`${res.id} Updated`);
      else {
        if (!exists && siteData.afterAddScript)
          runScript(siteData.afterAddScript, { siteData, contentDetails: res });
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

    if (!exists && (pageCover || "") !== (cover || "")) {
      setTags((o) => [
        ...o,
        { label: "meta:different-cover", value: "meta:different-cover" },
      ]);
      contentTags.push("meta:different-cover");
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
  }, [
    title,
    tags,
    cover,
    extraData,
    preset,
    contentUrl,
    exists,
    setTags,
    setContentMutation.mutate,
  ]);

  const removeContentsMutation = useMutation({
    mutationFn: async (vars: { ids: string[] }) =>
      await removeContentsAction(vars),
    onSuccess: (res) => {
      if (siteData.afterRemoveScript)
        runScript(siteData.afterRemoveScript, {
          siteData,
          contentDetails: res[0],
        });

      const { title, defaultTags } = GetDetailsFromPage();
      setExists(false);
      setTags(defaultTags.map((o) => ({ label: o, value: o })));
      setTitle(title);
    },
  });
  const removeContent = useCallback(() => {
    if (!confirm("Confirm Deletion")) return;
    const { identifier } = GetDetailsFromPage();

    removeContentsMutation.mutate({ ids: [identifier] });
  }, [removeContentsMutation.mutate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-check existence whenever the stored content or site data changes
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
    tags: undefined,
  };
}

export const [LocalProvider, useLocalContext] = constate(useLocalContextCore);
