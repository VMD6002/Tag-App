import { useDoc } from "../contexts/Doc.Context";
import { useAtom } from "jotai";
import { currentAtom } from "./atom";
import type { AudioEntry } from "./atom";
import { useCallback } from "react";

export default function AudioCard({ data }: { data: AudioEntry }) {
  const { doc, encodedTitle } = useDoc();

  const [current, setCurrent] = useAtom(currentAtom);

  const handleClick = useCallback(() => {
    setCurrent(data.name);
  }, [data, doc]);

  const getAudioCover = (cover: string) =>
    `/media/Audios/${encodedTitle}/.audio-covers/${encodeURIComponent(cover)}`;

  return (
    <div
      className={
        "w-full my-auto bg-secondary rounded hover:cursor-pointer relative " +
        (current === data.name ? "bg-foreground! text-background" : "")
      }
    >
      <button className="size-full text-left" onClick={handleClick}>
        {data.cover && (
          <img
            src={getAudioCover(data.cover)}
            className="w-full min-h-36 mb-2 object-contain"
          />
        )}
        <p className="text-base break-all p-5">{data.name}</p>
      </button>
    </div>
  );
}
