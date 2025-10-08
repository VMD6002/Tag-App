/* eslint-disable react-hooks/rules-of-hooks */
import TitleHeader from "@/components/craft/TitleHeader";
import { Slider } from "@/components/ui/slider";
import { useDoc, type DocContext } from "../contexts/Doc.Context";
import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { useCallback, useMemo, useState } from "react";

export default function ImgSetPage() {
  const { doc, orpc } = useDoc() as DocContext;
  const [imgSetWidth, setImgSetWidth] = useState(100);

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
      <div className="grid place-items-center md:place-items-start md:flex gap-4">
        <img
          className="w-full md:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
          src={getImgURL(doc.ext?.[0])}
        />
        <div className="md:w-[calc(40%-1rem)]">
          <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
            {doc.Title}
          </h1>
          <div className="text-muted-foreground text-xs mb-4">
            {new Date(doc.Added).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div className="w-11/12 prose prose-lg max-w-full break-all mb-4">
            <Markdown>{doc.extraData}</Markdown>
          </div>
          <div className="text-sm space-y-1">
            {[...new Set([...doc.Tags.map((k: string) => k.split(":")[0])])]
              .sort()
              .map((parent) => (
                <div key={parent}>
                  {parent}:{" "}
                  <span className="text-muted-foreground">
                    {doc.Tags.filter((k: string) => k.startsWith(parent))
                      .sort()
                      .map((e: string) => e.replace(parent + ":", ""))
                      .join(", ")}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <Slider
        className="my-6 w-[calc(100%-2rem)] mx-auto"
        value={[Number(imgSetWidth)]}
        onValueChange={(o) => setImgSetWidth(o[0])}
        max={100}
        step={1}
      />
      <div
        style={{ width: imgSetWidth + "%" }}
        className="mx-auto space-y-5 bg-input/30 min-h-96 rounded overflow-hidden"
      >
        {ImgSetImages.map((img) => (
          <button disabled={true} className={"w-full "}>
            <img className="w-full" src={getImgURL(img)} />
          </button>
        ))}
      </div>
    </>
  );
}
