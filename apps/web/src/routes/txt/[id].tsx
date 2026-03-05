import TitleHeader from "@/components/craft/TitleHeader";
import { useDoc } from "../contexts/Doc.Context";
import DocInfoSection from "../components/DocInfoSection";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useEffect, useMemo, useState } from "react";
import { orpc } from "@/lib/orpc";

export interface entry {
  name: string;
  type: "video" | "img";
}

const fetchTxt = async (urlPrefix: string, txtName: string) => {
  if (!txtName || txtName === "/media") return "";
  const res = await fetch(`${urlPrefix}/${encodeURIComponent(txtName)}`);

  // Without this IF block, React Query thinks a 404 is "Success"
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }

  return res.text();
};

export default function TextPage() {
  const { doc, encodedTitle } = useDoc();

  const [media, setMedia] = useState<entry[]>([]);
  const [txts, setTxts] = useState<string[]>([]);
  const [current, setCurrent] = useState("");

  const coverUrl = doc.cover
    ? `/media/Texts/${encodedTitle}/.media/${encodeURIComponent(doc.cover)}`
    : null;

  const getTxtQuery = useQuery({
    queryKey: [current, "Text"],
    queryFn: () => fetchTxt(`/media/Texts/${encodedTitle}`, current),
  });

  const getTxtDataMutation = useMutation(
    orpc.text.getTxtData.mutationOptions({
      onSuccess: (data) => {
        setMedia(data.Media);
        setTxts(data.Texts);
        if (!data.Media.length || current !== "/media") {
          setCurrent(data.Texts[0]);
        }
      },
    }),
  );

  const refreshTxtDataMutation = useMutation(
    orpc.text.refreshTxtData.mutationOptions({
      onSuccess: (data) => {
        setMedia(data.Media);
        setTxts(data.Texts);
        if (!current && data.Media.length) return;
        if (!data.Texts.includes(current)) setCurrent(data.Texts[0]);
      },
    }),
  );

  useEffect(() => {
    getTxtDataMutation.mutate({ name: doc.title, id: doc.id });
  }, [doc]);

  const currentTxt = useMemo(() => getTxtQuery.data ?? "", [getTxtQuery.data]);

  const getMediaURL = (media: string) =>
    `/media/Texts/${encodedTitle}/.media/${encodeURIComponent(media)}`;

  return (
    <>
      <button
        className="w-fit grid mx-auto hover:cursor-pointer"
        onClick={() =>
          refreshTxtDataMutation.mutate({ name: doc.title, id: doc.id })
        }
      >
        <TitleHeader Title="Text" />
      </button>
      <div
        className={
          "grid place-items-center " +
          (coverUrl
            ? "sm:place-items-start place-content-center sm:flex gap-4"
            : "")
        }
      >
        {coverUrl && (
          <div className="relative w-full sm:w-2/5 rounded-sm bg-input/50 max-h-[max(30vh,25rem)] min-h-30 overflow-hidden">
            <img
              className="w-full h-full max-h-[max(30vh,25rem)] object-contain"
              src={coverUrl}
              alt="Cover"
            />
          </div>
        )}
        <DocInfoSection doc={doc} />
      </div>
      <div className="flex flex-wrap gap-3 w-full mx-auto my-6 mb-10">
        {txts.map((txt) => (
          <div className="flex flex-1" key={txt}>
            <Button
              key={txt}
              variant={txt === current ? "default" : "secondary"}
              className="justify-start rounded-none flex-1"
              onClick={() => setCurrent(txt)}
            >
              {txt.slice(0, -3)}
            </Button>
          </div>
        ))}
        {!!media.length && (
          <Button
            variant={"/media" === current ? "default" : "secondary"}
            className="justify-start rounded-none flex-1"
            onClick={() => setCurrent("/media")}
          >
            Media
          </Button>
        )}
      </div>
      {currentTxt && (
        <div className="w-11/12 typography text-base grid mx-auto max-w-full break-all mb-4">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {currentTxt.replaceAll(
              "https://<SERVER_URL>",
              location.href.slice(0, -1),
            )}
          </Markdown>
        </div>
      )}
      {current === "/media" && !!media.length && (
        <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((entry) =>
            entry.type === "img" ? (
              <div key={entry.name} className="w-full my-auto">
                <img src={getMediaURL(entry.name)} className="w-full" />
              </div>
            ) : (
              <video
                key={entry.name}
                src={getMediaURL(entry.name)}
                controls
                className="w-full my-auto"
              />
            ),
          )}
        </div>
      )}
    </>
  );
}
