import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { memo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { removeContentsAtom } from "@/entrypoints/main/atoms/contentData";
import { filteredAtom } from "../atom";
import {
  selectEntryAtom,
  selectionOnAtom,
} from "@/entrypoints/main/atoms/selection";
import {
  updateCoverAtom,
  updateExtraDataAtom,
  updateIdAtom,
  updateModalOpenAtom,
  updatePresetOptionsAtom,
  updateTagsAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal/atom";
import { ContentWebType } from "@tagapp/utils/types";
import { TagParentChildList } from "../../server/components/DocInfoSection";
import { constantsAtom } from "@/entrypoints/main/atoms/constants";
import { applyConstants } from "@tagapp/utils";
import type { SiteData } from "../../supported";

const ExtendedCard = memo(
  ({
    id,
    getContentAndSiteDataByID,
    isSelected,
    iframeRef,
  }: {
    id: string;
    getContentAndSiteDataByID: (id: string) => {
      contentDetails: ContentWebType;
      siteData: SiteData;
    };
    isSelected: (id: string) => boolean;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
  }) => {
    const constants = useAtomValue(constantsAtom);

    const removeContents = useSetAtom(removeContentsAtom);

    const setFiltered = useSetAtom(filteredAtom);

    const setUpdateModalOpen = useSetAtom(updateModalOpenAtom);
    const setUpdateId = useSetAtom(updateIdAtom);

    const setTitle = useSetAtom(updateTitleAtom);
    const setExtraData = useSetAtom(updateExtraDataAtom);
    const setUpdateTags = useSetAtom(updateTagsAtom);
    const setCover = useSetAtom(updateCoverAtom);
    const setPresetOptions = useSetAtom(updatePresetOptionsAtom);

    const selectionOn = useAtomValue(selectionOnAtom);
    const selectEntry = useSetAtom(selectEntryAtom);

    const { contentDetails, siteData } = getContentAndSiteDataByID(id);

    const memoisedUrls = useMemo(() => {
      return {
        url: applyConstants(contentDetails.url, constants),
        cover: applyConstants(contentDetails.cover!, constants),
      };
    }, [contentDetails.url, contentDetails.cover, constants]);

    const updateSetupFunc = useCallback(() => {
      setUpdateId(contentDetails.id);

      setTitle(contentDetails.title);
      setCover(contentDetails.cover!);
      setExtraData(contentDetails.extraData);
      setUpdateTags(contentDetails.tags.map((o) => ({ label: o, value: o })));

      setPresetOptions(siteData.download?.presets);

      setUpdateModalOpen(true);
    }, [contentDetails, siteData]);

    const removeContent = useCallback(async () => {
      if (!confirm("Confirm Deletion")) return;
      removeContents([contentDetails.id]);

      if (siteData.afterRemoveScript)
        iframeRef.current?.contentWindow?.postMessage(
          { siteData, contentDetails, action: "remove" },
          "*",
        );

      setFiltered((old: string[]) =>
        old.filter((val) => val !== contentDetails.id),
      );
    }, [contentDetails, siteData]);

    const selectedTrue = useMemo(() => isSelected(id), [isSelected, id]);

    return (
      <div
        onClick={() => selectionOn && selectEntry(id)}
        className={
          "block p-2 h-fit relative text-left " +
          (selectedTrue ? "border-2 rounded-sm" : "") +
          " " +
          (selectedTrue ? "border-white opacity-80" : "")
        }
      >
        <div className="w-full mb-5 bg-input/50 overflow-hidden rounded-sm">
          <img
            loading="lazy"
            className="object-contain m-auto max-h-[max(8.25rem,55vh)] w-full min-h-33"
            src={memoisedUrls.cover}
          />
        </div>
        <div className="w-[95%] ml-[2.5%] break-all">
          <div className="mb-3">
            <Button
              disabled={selectionOn}
              onClick={updateSetupFunc}
              className="w-1/2 rounded-r-none hover:bg-neutral-300/20 bg-neutral-300/10 dark:bg-neutral-800/30! dark:hover:bg-neutral-700/30!"
              variant="outline"
            >
              Edit
            </Button>
            <Button
              disabled={selectionOn}
              onClick={removeContent}
              className="w-1/2 rounded-l-none text-red-500 bg-red-600/10! dark:bg-red-950/20!"
              variant="outline"
            >
              Remove
            </Button>
          </div>
          <a href={memoisedUrls.url} target="_blank">
            <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
              {contentDetails.title}
            </h1>
          </a>
          <div className="text-muted-foreground text-xs mb-4">
            {new Date(contentDetails.added * 1000).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm space-y-1">
            <div>
              ID:{" "}
              <span className="text-muted-foreground">{contentDetails.id}</span>
            </div>
            <TagParentChildList tags={contentDetails.tags} />
          </div>
        </div>
        {selectionOn ? (
          <>
            {isSelected(id) ? (
              <Check className="bg-foreground border-background border top-4 left-4 text-background absolute rounded-sm" />
            ) : (
              <div className="bg-background border-foreground border aspect-square h-5 top-4 left-4 text-background absolute rounded-sm" />
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    );
  },
);

export default ExtendedCard;
