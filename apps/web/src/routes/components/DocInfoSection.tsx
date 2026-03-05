import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { ContentServerType } from "@tagapp/utils/types";

export default function DocInfoSection({ doc }: { doc: ContentServerType }) {
  return (
    <div className="w-full sm:w-[calc(40%-1rem)] sm:max-h-96 sm:overflow-y-auto">
      <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
        {doc.title}
      </h1>
      <div className="text-muted-foreground text-xs">
        {new Date(doc.added * 1000).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>
      {doc.tags.length ? (
        <>
          <hr className="my-4" />
          <div className="text-sm space-y-1">
            {[...new Set([...doc.tags.map((k: string) => k.split(":")[0])])]
              .sort()
              .map((parent) => (
                <div key={parent}>
                  {parent}:{" "}
                  <span className="text-muted-foreground">
                    {doc.tags
                      .filter((k: string) => k.startsWith(parent))
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
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {doc.extraData}
        </Markdown>
      </div>
    </div>
  );
}
