import { useEffect } from "react";
import { useAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { contentDataOptionalScriptAtom } from "@/entrypoints/main/atoms/settings";
import CodeEditor from "@uiw/react-textarea-code-editor";

export default function ContentDataScript() {
  const { theme } = useTheme();
  const [contentDataOptionalScriptBuffer, setContentDataOptionalScriptBuffer] =
    useState("");
  const [contentDataOptionalScript, setContentDataOptionalScript] = useAtom(
    contentDataOptionalScriptAtom,
  );

  // Sync buffer whenever underlying state changes
  useEffect(() => {
    setContentDataOptionalScriptBuffer(contentDataOptionalScript);
  }, [contentDataOptionalScript, setContentDataOptionalScriptBuffer]);

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full mb-3">
        <Label className="text-lg mb-2">Content Data Optional Script</Label>
        <div className="h-36 overflow-y-scroll">
          <CodeEditor
            value={contentDataOptionalScriptBuffer}
            language="javascript"
            placeholder="console.log(data) // data is the filtered contentData"
            onChange={(evn) =>
              setContentDataOptionalScriptBuffer(evn.target.value)
            }
            padding={15}
            className="bg-background/80 min-h-36"
            style={{
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
            data-color-mode={theme === "system" ? "dark" : theme}
          />
        </div>
      </div>
      <Button
        size="sm"
        onClick={() =>
          setContentDataOptionalScript(contentDataOptionalScriptBuffer.trim())
        }
      >
        Update
      </Button>
    </section>
  );
}
