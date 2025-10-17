import TitleHeader from "@/components/craft/TitleHeader";
import { useDoc, type DocContext } from "../contexts/Doc.Context";
import DocInfoSection from "../components/DocInfoSection";

export default function VideoPage() {
  const { doc } = useDoc() as DocContext;

  return (
    <>
      <TitleHeader Title="Video" />
      <div className="grid place-items-center sm:place-items-start sm:flex gap-4">
        <video
          className="w-full sm:w-3/5 rounded-sm object-contain max-h-[60vh] min-h-64 bg-input/50"
          src={`/media/Videos/${encodeURIComponent(
            `${doc.Title}.${doc.ext?.[1]}`
          )}`}
          poster={`/media/Videos/Covers/${encodeURIComponent(
            `cover.${doc.Title}.${doc.ext?.[0]}`
          )}`}
          controls
        />
        <DocInfoSection doc={doc} />
      </div>
    </>
  );
}
