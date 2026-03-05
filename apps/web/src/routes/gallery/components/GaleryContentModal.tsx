import { atom, useAtom, useAtomValue } from "jotai";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDoc } from "../../contexts/Doc.Context";
import type { entry } from "./atom";

export const contentModalOpenAtom = atom(false);
export const contentModalDataAtom = atom<entry | null>(null);

export default function GaleryContentModal() {
  const data = useAtomValue(contentModalDataAtom);
  const [open, setOpen] = useAtom(contentModalOpenAtom);
  const { encodedTitle } = useDoc();

  const contentUrl = `/media/Galleries/${encodedTitle}/${encodeURIComponent(data?.name!)}`;
  const coverUrl =
    data?.type === "video" && data?.cover
      ? `/media/Galleries/${encodedTitle}/.gallery-covers/${encodeURIComponent(data?.cover!)}`
      : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[80vw] sm:max-w-[80vw] md:max-w-[80vw] lg:max-w-[80vw] xl:max-w-[80vw] border-0 bg-secondary/60 backdrop-blur p-0">
        {data?.type === "video" ? (
          <video
            className="max-h-[90vh] size-full object-contain"
            poster={coverUrl}
            src={contentUrl}
            controls
          />
        ) : (
          <img
            className="max-h-[90vh] size-full object-contain"
            src={contentUrl}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
