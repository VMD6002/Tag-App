import TitleHeader from "@/components/craft/TitleHeader";
import { useDoc, type DocContext } from "../contexts/Doc.Context";
import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { useCallback, useEffect, useMemo, useState } from "react";

function VideoCard({
  Title,
  ImgUrl,
  notVideo = false,
  setCurrent = (a: string) => a,
}: {
  Title: string;
  ImgUrl: string;
  notVideo?: boolean;
  setCurrent?: any;
}) {
  return (
    <div onClick={() => !notVideo && setCurrent(Title)}>
      <div className="relative mb-2 bg-input/50 overflow-hidden rounded-sm">
        <img
          loading="lazy"
          className="object-contain m-auto max-h-[50vh] sm:h-50 lg:max-h-40"
          src={ImgUrl}
        />
      </div>
      <h3 className="text-sm mx-3 break-all">{Title}</h3>
    </div>
  );
}

export default function VideoSet() {
  const { doc, orpc } = useDoc() as DocContext;

  const [currentVideo, setCurrentVideo] = useState("");

  const VideoSetDataQuery = useQuery(
    orpc.VideoSet.getVideos.queryOptions({
      input: doc.Title,
    })
  );

  const getMediaURL = useCallback(
    (path: string) =>
      doc.id &&
      `/media/VideoSets/${encodeURIComponent(`${doc.Title}/${path}`)}`,
    [doc.Title, doc.id]
  );

  useEffect(() => {
    if (!VideoSetDataQuery.data?.Videos?.[0]) return;
    const url = new URL(location.href);
    const params = url.searchParams;
    params.set("current", VideoSetDataQuery.data?.Videos?.[0]);
    history.pushState({}, "", url.toString());
    setCurrentVideo(VideoSetDataQuery.data?.Videos?.[0]);
  }, [VideoSetDataQuery.data]);

  const VideoSetData: {
    Videos: string[];
    CoverFiles: Record<string, string>;
  } = useMemo(
    () => VideoSetDataQuery.data ?? { Videos: [], CoverFiles: {} },
    [VideoSetDataQuery.data]
  );

  return (
    <>
      <TitleHeader Title="Video Set" />
      <div className="grid place-items-center lg:place-items-start lg:flex gap-4">
        <div className="w-full lg:w-7/10 mb-10 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] overflow-y-scroll hideScrollBar">
          <video
            className="rounded-sm mb-5 object-contain min-h-[40vh] max-h-[max(60vh,20rem)] w-full bg-input/50"
            src={getMediaURL(currentVideo)}
            poster={getMediaURL(
              `covers/${VideoSetData.CoverFiles[currentVideo]}`
            )}
            controls
          />
          <h1 className="mb-7 mx-2 text-lg font-semibold font-stretch-condensed">
            {currentVideo}
          </h1>

          <div className="text-sm space-y-1">
            <div className="inline float-left w-1/2 md:w-1/3 bg-input/50 mr-4 rounded-sm overflow-hidden">
              <img
                loading="lazy"
                className="object-contain m-auto max-h-[16rem]"
                src={getMediaURL(`covers/${doc.ext?.[0]}`)}
              />
            </div>
            <h1 className="mb-3 text-md font-semibold font-stretch-condensed">
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
            <div className="w-11/12 prose prose-lg max-w-full break-all mt-4">
              <Markdown>{doc.extraData}</Markdown>
            </div>
            <div className="h-10" />
          </div>
        </div>
        <div className="lg:w-[calc(30%-1rem)] grid gap-5 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
          {VideoSetData.Videos.map((video) => (
            <VideoCard
              Title={video}
              ImgUrl={getMediaURL(`covers/${VideoSetData.CoverFiles[video]}`)}
              setCurrent={setCurrentVideo}
            />
          ))}
          {
            // @ts-ignore
            VideoSetData.CoverFiles?.extra?.map((extra: string) => (
              <VideoCard
                Title={extra}
                ImgUrl={getMediaURL(`covers/${extra}`)}
                notVideo={true}
              />
            ))
          }
        </div>
      </div>
    </>
  );
}
