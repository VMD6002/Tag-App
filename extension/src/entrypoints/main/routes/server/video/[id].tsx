import TitleHeader from "@/components/craft/TitleHeader";
import { useDoc } from "../contexts/Doc.Context";
import type { DocContext } from "../contexts/Doc.Context";
import DocInfoSection from "../components/DocInfoSection";

export default function VideoPage() {
  const { doc, serverUrl, Update, removeContent } = useDoc() as DocContext;
  const videoUrl = `${serverUrl}/media/Videos/${encodeURIComponent(
    `${doc.Title}.${doc.ext?.[1]}`
  )}`;
  const posterUrl = `${serverUrl}/media/Videos/Covers/${encodeURIComponent(
    `cover.${doc.Title}.${doc.ext?.[0]}`
  )}`;
  const captionUrl =
    doc.ext?.[2] &&
    `${serverUrl}/media/Videos/Captions/${encodeURIComponent(
      `caption.${doc.Title}.vtt`
    )}`;
  return (
    <>
      <TitleHeader Title="Video" />
      <div className="grid place-items-center sm:place-items-start sm:flex gap-4">
        <video
          className="w-full sm:w-3/5 rounded-sm object-contain max-h-[60vh] min-h-64 bg-input/50"
          src={videoUrl}
          poster={posterUrl}
          controls
        >
          {captionUrl ? (
            <track
              src={captionUrl}
              kind="subtitles"
              srcLang="en"
              label="English"
            />
          ) : (
            <></>
          )}
        </video>
        <DocInfoSection
          doc={doc}
          removeContent={removeContent}
          toggleModalFunc={Update.toggleModalFunc}
        />
      </div>
    </>
  );
}
