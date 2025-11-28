import TitleHeader from "@/components/craft/TitleHeader";
import { Slider } from "@/components/ui/slider";
import { useDoc, type DocContext } from "../contexts/Doc.Context";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import DocInfoSection from "../components/DocInfoSection";
import LazyVideo from "@/components/LazyVideo";

export default function ImgSetPage() {
  const { doc, orpc } = useDoc() as DocContext;
  const [imgSetWidth, setImgSetWidth] = useLocalStorage("imgSetWidth", 100);

  const ImgSetImagesQuery = useQuery(
    orpc.ImgSet.getImages.queryOptions({
      input: doc.Title,
    })
  );

  const getImgURL = useCallback(
    (img: any) =>
      doc.id && `/media/ImgSets/${encodeURIComponent(`${doc.Title}/${img}`)}`,
    [doc.Title, doc.id]
  );

  const ImgSetImages: string[] = useMemo(
    () => ImgSetImagesQuery.data ?? [],
    [ImgSetImagesQuery.data]
  );

  return (
    <>
      <TitleHeader Title="Image Set" />
      <div className="grid place-items-center sm:place-items-start sm:flex gap-4">
        <img
          className="w-full sm:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
          src={getImgURL(doc.ext?.[0])}
        />
        <DocInfoSection doc={doc} />
      </div>
      <div className="h-10 sticky top-19 grid bg-background">
        <Slider
          className="w-[calc(100%-2rem)] m-auto"
          value={[Number(imgSetWidth)]}
          onValueChange={(o) => setImgSetWidth(o[0])}
          max={100}
          step={1}
        />
      </div>
      <div
        style={{ width: imgSetWidth + "%" }}
        className="mx-auto space-y-5 bg-input/30 min-h-96 rounded overflow-hidden"
      >
        {ImgSetImages.map((img) =>
          img.endsWith("mp4") ? (
            <LazyVideo src={getImgURL(img)} />
          ) : (
            <button disabled={true} className={"w-full "}>
              <img loading="lazy" className="w-full" src={getImgURL(img)} />
            </button>
          )
        )}
      </div>
    </>
  );
}
