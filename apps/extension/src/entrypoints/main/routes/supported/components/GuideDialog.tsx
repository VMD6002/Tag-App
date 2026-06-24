import { BookOpen } from "lucide-react";
import Markdown from "react-markdown";
import ScriptingGuidMD from "@/../../../Notes/Scripting Guide.md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { atom, useAtom } from "jotai";

export const guideOpenAtom = atom(false);

export default function GuideDialog() {
  const [guideOpen, setGuideOpen] = useAtom(guideOpenAtom);

  return (
    <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
      <DialogContent
        className="flex flex-col p-8"
        style={{
          width: "95vw",
          maxWidth: "95vw",
          height: "95vh",
          maxHeight: "95vh",
        }}
      >
        <DialogHeader className="border-b border-border pb-4 shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            Scripting Guide
          </DialogTitle>
          <DialogDescription className="text-sm">
            Learn how to write custom userscripts and configure JSON metadata
            for supported sites.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-6 pr-2">
          <div className="typography max-w-[80ch] mx-auto text-base">
            <Markdown>{ScriptingGuidMD.body}</Markdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
