import { memo, useMemo } from "react"; // Fixed: Added missing imports
import { useRemoteContext } from "../Remote.Context";
import type { ContentWebType } from "@tagapp/utils/types";
import { applyConstants } from "@tagapp/utils";

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
    const { constants } = useRemoteContext();

    const memoisedUrls = useMemo(() => {
      return {
        url: applyConstants(contentDetails.url, constants),
        cover: contentDetails.cover
          ? applyConstants(contentDetails.cover, constants)
          : "",
      };
    }, [contentDetails.url, contentDetails.cover, constants]);

    return (
      <div className="block p-2 h-fit relative text-left border rounded-sm transition-all">
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
      </div>
    );
  },
);

ExtendedCard.displayName = "ExtendedCard";
export default ExtendedCard;
