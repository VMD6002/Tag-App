import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { contentDataOptionalScriptAtom } from "@/entrypoints/main/atoms/settings";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useTheme } from "@/components/theme-provider";
import { FileCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ContentDataScript() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [contentDataOptionalScriptBuffer, setContentDataOptionalScriptBuffer] =
    useState("");
  const [contentDataOptionalScript, setContentDataOptionalScript] = useAtom(
    contentDataOptionalScriptAtom,
  );

  // Sync buffer whenever underlying state changes
  useEffect(() => {
    setContentDataOptionalScriptBuffer(contentDataOptionalScript);
  }, [contentDataOptionalScript]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setContentDataOptionalScriptBuffer(contentDataOptionalScript);
    }
  };

  const handleSave = () => {
    setContentDataOptionalScript(contentDataOptionalScriptBuffer.trim());
    setIsOpen(false);
  };

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full mb-3">
        <Label className="text-lg mb-2">Content Data Optional Script</Label>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Configure a JavaScript script to process or filter your content data dynamically.
        </p>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2 cursor-pointer justify-center">
              <FileCode className="size-4" />
              <span>Edit Script</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="flex flex-col p-6 max-w-full"
            style={{
              width: "80vw",
              maxWidth: "80vw",
              height: "80vh",
              maxHeight: "80vh",
            }}
          >
            <DialogHeader className="border-b border-border pb-4 shrink-0">
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileCode className="size-5 text-primary" />
                Content Data Optional Script
              </DialogTitle>
              <DialogDescription>
                Write JavaScript code to post-process your content data. The <code>data</code> variable represents the filtered content data.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 border border-border rounded-md overflow-hidden bg-background min-h-0 overflow-y-auto my-4">
              <CodeEditor
                value={contentDataOptionalScriptBuffer}
                language="javascript"
                placeholder="console.log(data) // data is the filtered contentData"
                onChange={(evn) =>
                  setContentDataOptionalScriptBuffer(evn.target.value)
                }
                padding={15}
                className="bg-background/80 min-h-full text-sm!"
                style={{
                  fontFamily:
                    "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
                data-color-mode={theme === "system" ? "dark" : theme}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="cursor-pointer"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

