import { Button } from "@/components/ui/button";
import { Check, Image, Images, ListVideo, SquarePlay } from "lucide-react";
import { useServer } from "../contexts/Server.Context";
import { memo } from "react";
import type { ServerContext } from "../contexts/Server.Context";

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

const getUrl = (id: string, Type: string) => `/main.html#/server/${Type}/${id}`;

const contentTypeColor = {
  img: (
    <Image
      size={"2rem"}
      className="absolute bg-background p-1.5 -top-5 right-2 rounded"
    />
  ),
  video: (
    <SquarePlay
      size={"2rem"}
      className="absolute bg-background p-1.5 -top-5 right-2 rounded"
    />
  ),
  ImgSet: (
    <Images
      size={"2rem"}
      className="absolute bg-background p-1.5 -top-5 right-2 rounded"
    />
  ),
  VideoSet: (
    <ListVideo
      size={"2rem"}
      className="absolute bg-background p-1.5 -top-5 right-2 rounded"
    />
  ),
};

const ExtendedCard = memo(({ data }: { data: ContentType }) => {
  try {
    const { removeContents, Selection, Update, isSelected, serverUrl } =
      useServer() as ServerContext;

    const { id, Title, Tags, Added, Type, ext, extraData } = data;

    const updateSetupFunc = useCallback(() => {
      Update.setTitle(Title);
      Update.setTags(Tags.map((o: string) => ({ label: o, value: o })));
      Update.setExtraData(extraData);
      Update.ID.current = data.id;
      Update.toggleModalFunc();
    }, [Title, Tags, Update, data.id, extraData]);

    const removeContent = useCallback(() => {
      if (!confirm("Confirm Deletion")) return;
      removeContents([data.id]);
    }, []);

    const Selected = useMemo(() => isSelected(id), [isSelected, id]);

    return (
      <div
        onClick={() => Selection.on && Selection.selectEntry(id)}
        className={
          "block p-2 h-fit text-left " +
          (Selection.on ? "border-2 rounded-sm" : "") +
          " " +
          (Selected ? "border-white opacity-80" : "")
        }
      >
        <div className="w-full bg-input/50 overflow-hidden rounded-sm">
          <img
            loading="lazy"
            className="object-contain m-auto max-h-[max(8.25rem,55vh)] w-full min-h-33"
            src={`${serverUrl}/${getCoverUrl(Type!, Title, ext!)}`}
          />
        </div>
        <div className="h-5 relative">{contentTypeColor[Type!]}</div>
        <div className="w-[95%] ml-[2.5%] break-all">
          <div className="mb-3">
            <Button
              disabled={Selection.on}
              onClick={updateSetupFunc}
              className="w-1/2 rounded-r-none hover:bg-neutral-300/20 bg-neutral-300/10 dark:!bg-neutral-800/30 dark:hover:!bg-neutral-700/30"
              variant="outline"
            >
              Edit
            </Button>
            <Button
              disabled={Selection.on}
              onClick={removeContent}
              className="w-1/2 rounded-l-none text-red-500 !bg-red-600/10 dark:!bg-red-950/20"
              variant="outline"
            >
              Remove
            </Button>
          </div>
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
        {Selection.on ? (
          <>
            {Selected ? (
              <Check className="bg-foreground border-background border-[1px] top-4 left-4 text-background absolute rounded-sm" />
            ) : (
              <div className="bg-background border-foreground border-[1px] aspect-square h-5 top-4 left-4 text-background absolute rounded-sm" />
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
});

export default ExtendedCard;
