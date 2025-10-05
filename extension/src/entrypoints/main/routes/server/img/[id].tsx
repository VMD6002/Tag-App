import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useDoc } from "../contexts/Doc.Context";
import type { DocContext } from "../contexts/Doc.Context";
import Markdown from "react-markdown";

export default function ImagePage() {
  const { doc, serverUrl, Update, removeContent } = useDoc() as DocContext;
  if (!doc.Title) return <></>;
  return (
    <>
      <TitleHeader Title="Image" />
      <div className="grid place-items-center md:place-items-start md:flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <img
              className="w-full min-h-60 md:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
              src={`${serverUrl}/media/Images/Covers/${encodeURIComponent(
                `cover.${doc.Title}.${doc.ext?.[0]}`
              )}`}
            />
          </DialogTrigger>
          <DialogContent className="max-w-[80vw] sm:max-w-[80vw] md:max-w-[80vw] lg:max-w-[80vw] border-0 bg-transparent p-0">
            <img
              className="w-full"
              src={`${serverUrl}/media/Images/${encodeURIComponent(
                `${doc.Title}.${doc.ext?.[1]}`
              )}`}
            />
          </DialogContent>
        </Dialog>
        <div className="md:w-[calc(40%-1rem)] w-full">
          <div className="mb-3">
            <Button
              className="w-1/2 rounded-r-none bg-neutral-300/10 dark:!bg-neutral-800/30"
              variant="outline"
              onClick={Update.toggleModalFunc}
            >
              Edit
            </Button>
            <Button
              className="w-1/2 rounded-l-none text-red-500 !bg-red-600/10 dark:!bg-red-950/20"
              variant="outline"
              onClick={removeContent}
            >
              Remove
            </Button>
          </div>
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
                <div>
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
    </>
  );
}
