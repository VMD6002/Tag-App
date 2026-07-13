import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { memo, useMemo, useCallback } from "react"; // Fixed: Added missing imports
import { atom, useAtomValue, useSetAtom } from "jotai";
import {
  selectionEntriesAtom, // Added for atomic selection check
  selectionOnAtom,
  useSelectEntry,
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
import type { ContentWebType } from "@tagapp/utils/types";
import { constantsAtom } from "@/entrypoints/main/atoms/constants";
import { applyConstants } from "@tagapp/utils";
import { supportedSitesAtom } from "@/entrypoints/main/atoms/supportedSites"; // Adjust path if needed
import { useLibraryContext } from "../Library.Context";

function TagParentChildList({ tags }: { tags: string[] }) {
  const parentTags = useMemo(
    () => [...new Set(tags.map((k) => k.split(":")[0]))],
    [tags],
  );

  return (
    <>
      {parentTags.sort().map((parent) => (
        <div key={parent} className="text-xs">
          {parent}:{" "}
          <span className="text-muted-foreground">
            {tags
              .filter((k) => k.startsWith(parent))
              .sort()
              .map((e) => e.replace(parent + ":", "").replaceAll("_", " "))
              .join(", ")}
          </span>
        </div>
      ))}
    </>
  );
}

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

      if (siteData?.download?.presets) {
        setPresetOptions(siteData.download.presets);
      }

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
    ]);

    const removeContent = useCallback(async () => {
      if (!confirm("Confirm Deletion")) return;
      removeContents([contentDetails.id]);
    }, [contentDetails, removeContents]);

    return (
      <div
        onClick={() => selectionOn && selectEntry(contentDetails.id)} // Fixed: id -> contentDetails.id
        className={`block p-2 h-fit relative text-left border rounded-sm transition-all ${
          selectedTrue
            ? "border-white opacity-80 bg-neutral-800/10"
            : "border-transparent"
        }`}
      >
        <div className="w-full mb-5 bg-input/50 overflow-hidden rounded-sm">
          {memoisedUrls.cover && (
            <img
              loading="lazy"
              className="object-contain m-auto max-h-[max(8.25rem,55vh)] w-full min-h-33"
              src={memoisedUrls.cover}
              alt={contentDetails.title}
            />
          )}
        </div>

        <div className="w-full break-all">
          <div className="mb-3 flex">
            <Button
              disabled={selectionOn}
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering selection click handler
                updateSetupFunc();
              }}
              className="w-1/2 rounded-r-none hover:bg-neutral-300/20 bg-neutral-300/10 dark:bg-neutral-800/30 dark:hover:bg-neutral-700/30"
              variant="outline"
            >
              Edit
            </Button>
            <Button
              disabled={selectionOn}
              onClick={(e) => {
                e.stopPropagation();
                removeContent();
              }}
              className="w-1/2 rounded-l-none text-red-500 bg-red-600/10 dark:bg-red-950/20"
              variant="outline"
            >
              Remove
            </Button>
          </div>

          <a
            href={memoisedUrls.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="mb-1 text-lg font-semibold font-stretch-condensed hover:underline">
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

        {selectionOn && (
          <div className="absolute top-4 left-4 z-10">
            {selectedTrue ? (
              <Check className="bg-foreground border-background border text-background rounded-sm h-5 w-5 p-0.5" />
            ) : (
              <div className="bg-background border-foreground border aspect-square h-5 text-background rounded-sm" />
            )}
          </div>
        )}
      </div>
    );
  },
);

ExtendedCard.displayName = "ExtendedCard";
export default ExtendedCard;
