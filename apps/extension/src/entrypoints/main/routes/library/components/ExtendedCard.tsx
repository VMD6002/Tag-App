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
  updateTagsAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal";
import { ContentWebType } from "@tagapp/utils/types";

const ExtendedCard = memo(
  ({
    id,
    getContentByID,
    isSelected,
  }: {
    id: string;
    getContentByID: (id: string) => ContentWebType;
    isSelected: (id: string) => boolean;
  }) => {
    try {
      const removeContents = useSetAtom(removeContentsAtom);

      const setFiltered = useSetAtom(filteredAtom);

      const setUpdateModalOpen = useSetAtom(updateModalOpenAtom);
      const setUpdateId = useSetAtom(updateIdAtom);

      const setTitle = useSetAtom(updateTitleAtom);
      const setExtraData = useSetAtom(updateExtraDataAtom);
      const setUpdateTags = useSetAtom(updateTagsAtom);
      const setCover = useSetAtom(updateCoverAtom);

      const selectionOn = useAtomValue(selectionOnAtom);
      const selectEntry = useSetAtom(selectEntryAtom);

      const Content = getContentByID(id);

      const updateSetupFunc = useCallback(() => {
        setUpdateId(id);

        setTitle(Content.title);
        setCover(Content.coverUrl!);
        setExtraData(Content.extraData);
        setUpdateTags(
          Content.tags.map((o: string) => ({ label: o, value: o })),
        );

        setUpdateModalOpen(true);
      }, [Content, id]);

      const removeContent = useCallback(() => {
        if (!confirm("Confirm Deletion")) return;
        removeContents([id]);
        setFiltered((old: string[]) => old.filter((val) => val !== id));
      }, [id]);

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
              src={Content.coverUrl}
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
            <a href={Content.url} target="_blank">
              <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
                {Content.title}
              </h1>
            </a>
            <div className="text-muted-foreground text-xs mb-4">
              {new Date(Content.added * 1000).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
            <div className="text-sm space-y-1">
              {[
                ...new Set(
                  Content.tags.map((tag: string) => tag.split(":")[0]),
                ),
              ]
                .sort()
                .map((parent) => (
                  <div key={`${id}-${parent}`}>
                    {(parent as string).replaceAll("_", " ")} :{" "}
                    <span className="text-muted-foreground">
                      {Content.tags
                        .filter((tag: string) =>
                          tag.startsWith(parent as string),
                        )
                        .sort()
                        .map((e: string) =>
                          e.replace(parent + ":", "").replaceAll("_", " "),
                        )
                        .join(", ")}
                    </span>
                  </div>
                ))}
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
    } catch (err) {
      console.error(err);
      return <></>;
    }
  },
);

export default ExtendedCard;
