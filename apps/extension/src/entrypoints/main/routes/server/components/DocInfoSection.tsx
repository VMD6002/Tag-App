import { updateModalOpenAtom } from "@/components/craft/UpdateModal";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ContentServerType } from "@tagapp/utils/types";

export default function DocInfoSection({
  doc,
  removeContent,
}: {
  doc: ContentServerType;
  removeContent: () => void;
}) {
  const setUpdateModalOpen = useSetAtom(updateModalOpenAtom);
  return (
    <div className="w-full sm:w-[calc(40%-1rem)] sm:max-h-96 sm:overflow-y-auto">
      <div className="mb-5 sm:mb-3">
        <Button
          className="w-1/2 rounded-r-none bg-neutral-300/10 dark:bg-neutral-800/30!"
          variant="outline"
          onClick={() => setUpdateModalOpen(true)}
        >
          Edit
        </Button>
        <Button
          className="w-1/2 rounded-l-none text-red-500 bg-red-600/10! dark:bg-red-950/20!"
          variant="outline"
          onClick={removeContent}
        >
          Remove
        </Button>
      </div>
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
      <div className="w-11/12 typography max-w-full break-all mb-4">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {doc.extraData}
        </Markdown>
      </div>
    </div>
  );
}
