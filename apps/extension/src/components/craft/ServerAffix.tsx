import { ServerIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { contentDataOptionalScriptAtom } from "@/entrypoints/main/atoms/settings";
import type { ContentWebType } from "@tagapp/utils/types";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";
import { applyConstants } from "@tagapp/utils";

export default function ServerAffix({
  iframeRef,
  filtered,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  filtered: ContentWebType[];
}) {
  const contentDataOptionalScript = useAtomValue(contentDataOptionalScriptAtom);

  const replaceWithKeyOnUpdate = useAtomValue(replaceWithKeyOnUpdateAtom);
  const constants = useAtomValue(constantsAtom);

  if (!contentDataOptionalScript) return null;

  const onClick = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        script: replaceWithKeyOnUpdate
          ? applyConstants(contentDataOptionalScript, constants)
          : contentDataOptionalScript,
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
