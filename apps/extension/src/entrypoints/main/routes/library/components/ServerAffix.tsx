import { ServerIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { filteredAtom } from "../Library.Context";
import { Button } from "@/components/ui/button";
import { contentDataOptionalScriptAtom } from "@/entrypoints/main/atoms/settings";

export default function ServerAffix({
  iframeRef,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}) {
  const contentDataOptionalScript = useAtomValue(contentDataOptionalScriptAtom);
  const filtered = useAtomValue(filteredAtom);

  if (!contentDataOptionalScript) return null;

  const onClick = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        script: contentDataOptionalScript,
        data: filtered,
      },
      "*",
    );
  };

  return (
    <Button
      size="icon-lg"
      variant="outline"
      className="fixed top-auto bottom-5 left-auto right-5"
      onClick={onClick}
    >
      <ServerIcon />
    </Button>
  );
}
