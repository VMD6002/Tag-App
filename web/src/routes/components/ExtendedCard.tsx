import { Image, Images, ListVideo, SquarePlay } from "lucide-react";
import { memo } from "react";

function getCoverUrl(Type: string, Title: string, ext: string[]) {
  switch (Type) {
    case "img":
      return `media/Images/Covers/${encodeURIComponent(
        `cover.${Title}.${ext[0]}`
      )}`;
    case "video":
      return `media/Videos/Covers/${encodeURIComponent(
        `cover.${Title}.${ext[0]}`
      )}`;
    case "ImgSet":
      return `media/ImgSets/${encodeURIComponent(`${Title}/${ext[0]}`)}`;
    case "VideoSet":
      return `media/VideoSets/${encodeURIComponent(
        `${Title}/covers/${ext[0]}`
      )}`;
  }
}

const getUrl = (id: string, Type: string) => `/#/${Type}/${id}`;

const contentTypeColor = {
  img: (
    <Image
      size={"2rem"}
      className="absolute bg-background p-1 -top-5 right-2 rounded"
    />
  ),
  video: (
    <SquarePlay
      size={"2rem"}
      className="absolute bg-background py-1 -top-5 right-2 rounded"
    />
  ),
  ImgSet: (
    <Images
      size={"2rem"}
      className="absolute bg-background p-1 -top-5 right-2 rounded"
    />
  ),
  VideoSet: (
    <ListVideo
      size={"2rem"}
      className="absolute bg-background p-1 -top-5 right-2 rounded"
    />
  ),
};

const ExtendedCard = memo(({ data }: { data: ContentType }) => {
  try {
    const { id, Title, Tags, Added, Type, ext } = data;

    return (
      <div className={"block p-2 h-fit text-left "}>
        <div className="w-full bg-input/50 overflow-hidden rounded-sm">
          <img
            loading="lazy"
            className="object-contain m-auto max-h-[max(8.25rem,55vh)] w-full min-h-33"
            src={`/${getCoverUrl(Type!, Title, ext!)}`}
          />
        </div>
        <div className="relative h-5">
          {/* @ts-ignore */}
          {contentTypeColor[Type]}
        </div>
        <div className="w-[95%] ml-[2.5%] break-all">
          <a href={getUrl(id, Type!)} target="_blank">
            <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
              {Title}
            </h1>
          </a>
          <div className="text-muted-foreground text-xs mb-4">
            {new Date(Added * 1000).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm space-y-1">
            {[...new Set(Tags.map((tag: string) => tag.split(":")[0]))]
              .sort()
              .map((parent: string) => (
                <div key={Title + "-" + parent}>
                  {parent.replaceAll("_", " ")} :{" "}
                  <span className="text-muted-foreground">
                    {Tags.filter((tag: string) => tag.startsWith(parent))
                      .sort()
                      .map((e: string) =>
                        e.replace(parent + ":", "").replaceAll("_", " ")
                      )
                      .join(", ")}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error(err);
    return <></>;
  }
});

export default ExtendedCard;
