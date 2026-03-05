import {
  GalleryVerticalEnd,
  Headphones,
  Image,
  ScrollText,
  SquarePlay,
} from "lucide-react";
import { memo, useMemo } from "react";
import type { ContentServerType, CType } from "@tagapp/utils/types";
import { CTypeDir } from "@tagapp/utils";

function getCoverUrl(Content: ContentServerType) {
  const pathPrefix = `media/${CTypeDir[Content.type]}`;
  const encodedTitle = encodeURIComponent(`${Content.title}.${Content.id}`);
  const encodedCover = Content.cover ? encodeURIComponent(Content.cover) : null;
  switch (Content.type) {
    case "img":
    case "video":
      return `${pathPrefix}/.covers/cover.${encodedTitle}`;
    case "gallery":
      if (!encodedCover) return null;
      return `${pathPrefix}/${encodedTitle}/${encodedCover}`;
    case "audio":
      if (!encodedCover) return null;
      return `${pathPrefix}/${encodedTitle}/.audio-covers/${encodedCover}`;
    case "txt":
      if (!encodedCover) return null;
      return `${pathPrefix}/${encodedTitle}/.media/${encodedCover}`;
  }
}

const getUrl = (id: string, Type: string) => `/#/${Type}/${id}`;

const contentTypeIconsClassName =
  "absolute bg-background p-1.5 -top-5 right-2 rounded";
const contentTypeColor: Record<CType, ReturnType<typeof Image>> = {
  img: <Image size={"2rem"} className={contentTypeIconsClassName} />,
  video: <SquarePlay size={"2rem"} className={contentTypeIconsClassName} />,
  gallery: (
    <GalleryVerticalEnd size={"2rem"} className={contentTypeIconsClassName} />
  ),
  audio: <Headphones size={"2rem"} className={contentTypeIconsClassName} />,
  txt: <ScrollText size={"2rem"} className={contentTypeIconsClassName} />,
};

const ExtendedCard = memo(({ Content }: { Content: ContentServerType }) => {
  const coverUrl = useMemo(() => getCoverUrl(Content), [Content]);

  return (
    <div className="block p-2 h-fit text-left ">
      {coverUrl && (
        <>
          <div className="w-full bg-input/50 overflow-hidden rounded-sm">
            <img
              loading="lazy"
              className="object-contain m-auto max-h-[max(8.25rem,55vh)] w-full min-h-33"
              src={coverUrl}
            />
          </div>
          <div className="relative h-5">{contentTypeColor[Content.type]}</div>
        </>
      )}
      <div className="w-[95%] ml-[2.5%] break-all">
        <a href={getUrl(Content.id, Content.type)} target="_blank">
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
          {!coverUrl && (
            <div className="relative text-foreground">
              {contentTypeColor[Content.type]}
            </div>
          )}
        </div>
        <div className="text-sm space-y-1">
          {[...new Set(Content.tags.map((tag: string) => tag.split(":")[0]))]
            .sort()
            .map((parent: string) => (
              <div key={`${Content.id}-${parent}`}>
                {parent.replaceAll("_", " ")} :{" "}
                <span className="text-muted-foreground">
                  {Content.tags
                    .filter((tag: string) => tag.startsWith(parent))
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
    </div>
  );
});

export default ExtendedCard;
