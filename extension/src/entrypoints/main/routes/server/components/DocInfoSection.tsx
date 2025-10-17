import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";

export default function DocInfoSection({
  doc,
  toggleModalFunc,
  removeContent,
}: {
  doc: ContentType;
  toggleModalFunc: () => void;
  removeContent: () => void;
}) {
  return (
    <div className="w-full sm:w-[calc(40%-1rem)] sm:max-h-96 sm:overflow-y-auto">
      <div className="mb-5 sm:mb-3">
        <Button
          className="w-1/2 rounded-r-none bg-neutral-300/10 dark:!bg-neutral-800/30"
          variant="outline"
          onClick={toggleModalFunc}
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
      <div className="text-muted-foreground text-xs">
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
  );
}
