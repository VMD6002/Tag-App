import TitleHeader from "@/components/craft/TitleHeader";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useDoc, type DocContext } from "../contexts/Doc.Context";
import Markdown from "react-markdown";

export default function ImagePage() {
  const { doc } = useDoc() as DocContext;

  return (
    <>
      <TitleHeader Title="Image" />
      <div className="grid place-items-center md:place-items-start md:flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <img
              className="w-full min-h-60 md:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
              src={`/media/Images/Covers/${encodeURIComponent(
                `cover.${doc.Title}.${doc.ext?.[0]}`
              )}`}
            />
          </DialogTrigger>
          <DialogContent className="max-w-[80vw] sm:max-w-[80vw] md:max-w-[80vw] lg:max-w-[80vw] border-0 bg-transparent p-0">
            <img
              className="w-full"
              src={`/media/Images/${encodeURIComponent(
                `${doc.Title}.${doc.ext?.[1]}`
              )}`}
            />
          </DialogContent>
        </Dialog>
        <div className="md:w-[calc(40%-1rem)] md:max-h-96 md:overflow-y-auto">
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
          {doc.Tags.length ? (
            <>
              <hr className="my-4" />
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
            </>
          ) : (
            <></>
          )}
          <hr className="my-4" />
          <div className="w-11/12 prose prose-sm dark:prose-invert max-w-full break-all mb-4">
            <Markdown>{doc.extraData}</Markdown>
          </div>
        </div>
      </div>
    </>
  );
}
