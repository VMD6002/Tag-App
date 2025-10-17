import TitleHeader from "@/components/craft/TitleHeader";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useDoc } from "../contexts/Doc.Context";
import type { DocContext } from "../contexts/Doc.Context";
import DocInfoSection from "../components/DocInfoSection";

export default function ImagePage() {
  const { doc, serverUrl, Update, removeContent } = useDoc() as DocContext;

  return (
    <>
      <TitleHeader Title="Image" />
      <div className="grid place-items-center sm:place-items-start sm:flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <img
              className="w-full min-h-60 sm:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
              src={`${serverUrl}/media/Images/Covers/${encodeURIComponent(
                `cover.${doc.Title}.${doc.ext?.[0]}`
              )}`}
            />
          </DialogTrigger>
          <DialogContent className="max-w-[80vw] sm:max-w-[80vw] md:max-w-[80vw] lg:max-w-[80vw] xl:max-w-[80vw] border-0 bg-transparent p-0">
            <img
              className="w-full"
              src={`${serverUrl}/media/Images/${encodeURIComponent(
                `${doc.Title}.${doc.ext?.[1]}`
              )}`}
            />
          </DialogContent>
        </Dialog>
        <DocInfoSection
          doc={doc}
          removeContent={removeContent}
          toggleModalFunc={Update.toggleModalFunc}
        />
      </div>
    </>
  );
}
