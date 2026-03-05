import TitleHeader from "@/components/craft/TitleHeader";
import { useDoc } from "../contexts/Doc.Context";
import DocInfoSection from "../components/DocInfoSection";

export default function VideoPage() {
  const { doc, serverUrl, encodedTitle, removeContent } = useDoc();
  const videoUrl = `${serverUrl}/media/Videos/${encodedTitle}`;
  const posterUrl = `${serverUrl}/media/Videos/.covers/cover.${encodedTitle}`;
  const captionUrl =
    doc.tags.includes("meta:cc") &&
    `${serverUrl}/media/Videos/.captions/caption.${encodedTitle}.vtt`;
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
        <DocInfoSection doc={doc} removeContent={removeContent} />
      </div>
    </>
  );
}
