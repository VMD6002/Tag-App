import { ServerIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { contentDataOptionalScriptAtom } from "@/entrypoints/main/atoms/settings";
import type { ContentWebType } from "@tagapp/utils/types";

export default function ServerAffix({
  iframeRef,
  filtered,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  filtered: ContentWebType[];
}) {
  const contentDataOptionalScript = useAtomValue(contentDataOptionalScriptAtom);

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
