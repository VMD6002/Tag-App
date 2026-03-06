import { useDoc } from "../../contexts/Doc.Context";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  autoPlayAtom,
  currentModeAtom,
  entry,
  selectedContentAtom,
} from "./atom";
import {
  contentModalDataAtom,
  contentModalOpenAtom,
} from "./GaleryContentModal";
import LazyVideo from "@/components/LazyVideo";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

const getMediaUrl = (
  serverUrl: string,
  encodedTitle: string,
  contentPath: string,
) =>
  `${serverUrl}/media/Galleries/${encodedTitle}/${encodeURIComponent(contentPath)}`;

const ContentMold = ({ data }: { data: entry }) => {
  const { serverUrl, encodedTitle } = useDoc();
  const autoPlay = useAtomValue(autoPlayAtom);

  const contentUrl = getMediaUrl(serverUrl, encodedTitle, data.name);
  const coverUrl =
    data.cover &&
    getMediaUrl(serverUrl, encodedTitle, ".gallery-covers/" + data.cover);

  if (data.type === "video" && (autoPlay || !data.cover))
    if (autoPlay)
      return (
        <LazyVideo
          src={contentUrl}
          className="w-full min-h-36 mb-2 object-contain"
        />
      );
    else
      return (
        <LazyVideo
          autoPlay={false}
          src={contentUrl}
          className="w-full min-h-36 mb-2 object-contain"
        />
      );

  return (
    <img
      src={coverUrl || contentUrl}
      alt=""
      className="w-full min-h-36 mb-2 object-contain"
      loading="lazy"
    />
  );
};

export default function GalleryContentCard({
  data,
  updateCover,
  removeContentCover,
}: {
  data: entry;
  updateCover: (coverPath: string) => void;
  removeContentCover: (cover: string) => void;
}) {
  const { doc } = useDoc();

  const setContentModalOpen = useSetAtom(contentModalOpenAtom);
  const setContentModalData = useSetAtom(contentModalDataAtom);
  const currentMode = useAtomValue(currentModeAtom);
  const [selected, setSelected] = useAtom(selectedContentAtom);

  const handleClick = useCallback(() => {
    switch (currentMode) {
      case "view":
        setContentModalData(data);
        setContentModalOpen(true);
        break;
      case "delete":
        setSelected((prev) =>
          prev.includes(data.name)
            ? prev.filter((item) => item !== data.name)
            : [...prev, data.name],
        );
        break;
      case "cover":
        if (data.type === "img") updateCover(data.name);
        else if (data.type === "video" && data.cover)
          updateCover(".gallery-covers/" + data.cover);
        else alert("Invalid cover selection");
        break;
      default:
        break;
    }
  }, [data, doc, currentMode]);

  return (
    <div
      className={
        "w-full my-auto hover:cursor-pointer relative " +
        (currentMode !== "view"
          ? "border-2 p-3 " +
            (selected.includes(data.name) ? "border-red-500" : "")
          : "")
      }
    >
      {data.cover && currentMode === "view" && (
        <Button
          variant="destructive"
          className="absolute right-0 rounded-none rounded-bl z-10"
          size="icon-lg"
          onClick={() => removeContentCover(data.cover!)}
        >
          <Trash />
        </Button>
      )}
      <button className="size-full" onClick={handleClick}>
        <ContentMold data={data} />
        <span className="text-base">{data.name}</span>
      </button>
    </div>
  );
}
