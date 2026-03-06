import { useDoc } from "../../contexts/Doc.Context";
import { useAtomValue } from "jotai";
import { autoPlayAtom, type entry } from "./atom";
import LazyVideo from "@/components/LazyVideo";

const getMediaUrl = (encodedTitle: string, contentPath: string) =>
  `/media/Galleries/${encodedTitle}/${encodeURIComponent(contentPath)}`;

const ContentMold = ({ data }: { data: entry }) => {
  const { encodedTitle } = useDoc();
  const autoPlay = useAtomValue(autoPlayAtom);

  const contentUrl = getMediaUrl(encodedTitle, data.name);
  const coverUrl =
    data.cover && getMediaUrl(encodedTitle, ".gallery-covers/" + data.cover);

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

export default function GalleryContentCard({ data }: { data: entry }) {
  return (
    <div className="w-full my-auto hover:cursor-pointer relative ">
      <button className="size-full">
        <ContentMold data={data} />
        <span className="text-base">{data.name}</span>
      </button>
    </div>
  );
}
