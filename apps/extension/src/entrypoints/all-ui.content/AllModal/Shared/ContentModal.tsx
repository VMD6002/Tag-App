import { useRemoteContext } from "../RemoteContent/Remote.Context";
import { useLocalContext } from "../LocalContent/Local.Context";
import UpdateModal from "@/components/craft/UpdateModal";

export default function ContentModal({
  useContext,
}: {
  useContext: typeof useLocalContext | typeof useRemoteContext;
}) {
  const { iframeRef, setContentFunc, tags } = useContext();
  return (
    <>
      <iframe
        ref={iframeRef}
        src={browser.runtime.getURL("/sandbox.html")}
        sandbox="allow-scripts allow-modals allow-same-origin"
        className="hidden"
      />
      <UpdateModal
        updateContentFunc={setContentFunc}
        className="text-foreground font-sans"
        tags={tags}
      />
    </>
  );
}
