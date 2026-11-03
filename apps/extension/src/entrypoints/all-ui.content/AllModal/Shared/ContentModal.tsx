import { useAtomValue } from "jotai";
import UpdateModal from "@/components/craft/UpdateModal";
import { enableAfterAddRemoveScriptsAtom } from "@/entrypoints/main/atoms/supportedSites";
import type { useLocalContext } from "../LocalContent/Local.Context";
import type { useRemoteContext } from "../RemoteContent/Remote.Context";

export default function ContentModal({
  useContext,
}: {
  useContext: typeof useLocalContext | typeof useRemoteContext;
}) {
  const { iframeRef, setContentFunc, tags } = useContext();
  const afterAddRemoveScript = useAtomValue(enableAfterAddRemoveScriptsAtom);
  return (
    <>
      {afterAddRemoveScript && (
        <iframe
          ref={iframeRef}
          title="Script Sandbox"
          src={browser.runtime.getURL("/sandbox.html")}
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="hidden"
        />
      )}
      <UpdateModal
        updateContentFunc={setContentFunc}
        className="text-foreground font-sans"
        tags={tags}
      />
    </>
  );
}
