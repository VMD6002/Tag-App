import constate from "constate";
import { useCallback, useRef, useEffect } from "react";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import TIMEOUTS from "@/lib/TIMEOUTS";
import log from "@/lib/log";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { contentDataAtom } from "@/entrypoints/main/atoms";
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
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import { loadAtom } from "..";
import { applyConstants } from "@tagapp/utils";
import {
  enableAfterAddRemoveScriptsAtom,
  runAfterAddRemoveScriptsInServerAtom,
} from "@/entrypoints/main/atoms/supportedSites";

function useRemoteContextCore() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const orpc = useAtomValue(orpcAtom);

  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);
  const constants = useAtomValue(constantsAtom);

  const setLoad = useSetAtom(loadAtom);
  const setOpenModal = useSetAtom(updateModalOpenAtom);
  const countRef = useRef(0);

  const contentData = useAtomValue(contentDataAtom);

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

  const [remoteTags, setRemoteTags] = useState<string[]>([]);
  const getTagsMutation = useMutation(
    orpc.tags.getTagData.mutationOptions({
      onSuccess: (res) => {
        console.log("Active Tags", res);
        setRemoteTags(Object.keys(res.tags).sort());
      },
    }),
  );
  const runUserCodeMutation = useMutation(
    orpc.main.runUserCode.mutationOptions({
      onSuccess: (res) => {
        log("User After Scripts Executed");
      },
    }),
  );

  const afterAddRemoveScript = useAtomValue(enableAfterAddRemoveScriptsAtom);
  const runAfterAddRemoveScriptsInServer = useAtomValue(
    runAfterAddRemoveScriptsInServerAtom,
  );
  const runScript = useCallback(
    (script: string, data: any) => {
      if (!afterAddRemoveScript) return;
      const input = {
        script: replaceWithKeyOnUpdate
          ? applyConstants(script, constants)
          : script,
        data,
      };
      if (runAfterAddRemoveScriptsInServer) {
        runUserCodeMutation.mutate(input);
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(input, "*");
    },
    [
      replaceWithKeyOnUpdate,
      constants,
      afterAddRemoveScript,
      runAfterAddRemoveScriptsInServer,
    ],
  );

  const getContentDetailsMutation = useMutation(
    orpc.main.getContent.mutationOptions({
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
    }),
  );
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
  }, []);

  const setContentMutation = useMutation(
    orpc.main.setContent.mutationOptions({
      onSuccess: (res) => {
        if (exists) log(`${res.id} Updated`);
        else {
          const { defaultTags } = GetDetailsFromPage();
          setRemoteTags((oldTags) => {
            return [...new Set([...oldTags, ...defaultTags])];
          });
          if (!exists && siteData.afterAddScript)
            runScript(siteData.afterAddScript, {
              siteData,
              contentDetails: res,
            });
          log(`${res.id} Added`);
        }

        setTitle(res.title);
        setCover(res.cover);
        setContentUrl(res.contentUrl);
        setExists(true);
        setOpenModal(false);
      },
    }),
  );
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
  }, [title, tags, cover, extraData, preset, contentUrl, exists, siteData]);

  const removeContentsMutation = useMutation(
    orpc.main.removeContents.mutationOptions({
      onSuccess: (res) => {
        if (siteData.afterRemoveScript)
          runScript(siteData.afterRemoveScript, {
            siteData,
            contentDetails: res[0],
          });

        const { title } = GetDetailsFromPage();
        setExists(false);
        setTags([]);
        setTitle(title);
      },
    }),
  );
  const removeContent = useCallback(async () => {
    if (!confirm("Confirm Deletion")) return;
    const { identifier } = GetDetailsFromPage();

    removeContentsMutation.mutate({ ids: [identifier] });
  }, []);

  useEffect(() => {
    checkExistance();
    const presetOptions = siteData.download?.presets;
    setPresetOptions(presetOptions);
  }, [contentData, siteData, orpc]);

  useEffect(() => {
    getTagsMutation.mutate({});
  }, [orpc]);

  return {
    iframeRef,
    countRef,
    checkExistance,
    setContentFunc,
    removeContent,
    tags: remoteTags,
  };
}

export const [RemoteProvider, useRemoteContext] =
  constate(useRemoteContextCore);
