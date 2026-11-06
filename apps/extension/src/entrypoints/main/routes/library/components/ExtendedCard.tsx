import { applyConstants } from "@tagapp/utils";
import type { ContentWebType } from "@tagapp/utils/types";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useMemo } from "react"; // Fixed: Added missing imports
import { confirm } from "@/components/craft/confirm-dialog";
import ContentCard from "@/components/craft/library/ContentCard";
import {
  updateContentUrlAtom,
  updateCoverAtom,
  updateDownloadTypeAtom,
  updateExtraDataAtom,
  updateIdAtom,
  updateModalOpenAtom,
  updatePresetAtom,
  updatePresetOptionsAtom,
  updateTagsAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal/atom";
import { constantsAtom } from "@/entrypoints/main/atoms/constants";
import {
  selectionEntriesAtom, // Added for atomic selection check
  selectionOnAtom,
  useSelectEntry,
} from "@/entrypoints/main/atoms/selection";
import { supportedSitesAtom } from "@/entrypoints/main/atoms/supportedSites"; // Adjust path if needed
import { useLibraryContext } from "../Library.Context";

const ExtendedCard = memo(
  ({ contentDetails }: { contentDetails: ContentWebType }) => {
    // Grab iframe reference from context
    const { removeContents } = useLibraryContext();

    const constants = useAtomValue(constantsAtom);

    // Modal Setters
    const setUpdateModalOpen = useSetAtom(updateModalOpenAtom);
    const setUpdateId = useSetAtom(updateIdAtom);
    const setTitle = useSetAtom(updateTitleAtom);
    const setExtraData = useSetAtom(updateExtraDataAtom);
    const setUpdateTags = useSetAtom(updateTagsAtom);
    const setCover = useSetAtom(updateCoverAtom);
    const setPresetOptions = useSetAtom(updatePresetOptionsAtom);
    const setContentUrl = useSetAtom(updateContentUrlAtom);
    const setPreset = useSetAtom(updatePresetAtom);
    const setDownloadType = useSetAtom(updateDownloadTypeAtom);

    // Selection Atoms
    const selectionOn = useAtomValue(selectionOnAtom);
    const selectEntry = useSelectEntry();

    // Performance Fix: Pinpoint subscription ensures ONLY this card re-renders when its selection status shifts
    const selectedTrue = useAtomValue(
      useMemo(
        () =>
          atom((get) => get(selectionEntriesAtom).includes(contentDetails.id)),
        [contentDetails.id],
      ),
    );

    // Find specific site configuration data matching this item
    const supportedSites = useAtomValue(supportedSitesAtom);
    const siteData = useMemo(() => {
      // Adjust 'contentDetails.site' to whatever property tracks the source site on your object
      return supportedSites[contentDetails.scraper];
    }, [supportedSites, contentDetails]);

    const memoisedUrls = useMemo(() => {
      return {
        url: applyConstants(contentDetails.url, constants),
        cover: contentDetails.cover
          ? applyConstants(contentDetails.cover, constants)
          : "",
      };
    }, [contentDetails.url, contentDetails.cover, constants]);

    const updateSetupFunc = useCallback(() => {
      setUpdateId(contentDetails.id);
      setTitle(contentDetails.title);
      setCover(contentDetails.cover || "");
      setExtraData(contentDetails.extraData);
      setUpdateTags(contentDetails.tags.map((o) => ({ label: o, value: o })));

      // Load every field, otherwise saving blanks whatever the modal didn't show.
      setContentUrl(contentDetails.contentUrl);
      setPreset(contentDetails.download?.flags);
      setDownloadType(contentDetails.download?.type);
      setPresetOptions(siteData?.download?.presets);

      setUpdateModalOpen(true);
    }, [
      contentDetails,
      siteData,
      setUpdateId,
      setTitle,
      setCover,
      setExtraData,
      setUpdateTags,
      setPresetOptions,
      setUpdateModalOpen,
      setContentUrl,
      setPreset,
      setDownloadType,
    ]);

    const removeContent = useCallback(async () => {
      if (
        !(await confirm.destructive({
          title: "Remove this item?",
          description: `"${contentDetails.title}" will be removed from your library.`,
          confirmText: "Remove",
        }))
      )
        return;
      removeContents([contentDetails.id]);
    }, [contentDetails, removeContents]);

    return (
      <ContentCard
        content={contentDetails}
        url={memoisedUrls.url}
        cover={memoisedUrls.cover}
        selection={{
          on: selectionOn,
          selected: selectedTrue,
          onToggle: () => selectEntry(contentDetails.id),
        }}
        onEdit={updateSetupFunc}
        onRemove={removeContent}
      />
    );
  },
);

ExtendedCard.displayName = "ExtendedCard";
export default ExtendedCard;
