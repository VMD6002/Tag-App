import { MainProvider } from "./Main.Context";
import HiddenForms from "./HiddenForms";
import FloatingButtons from "./FloatingButtons";
import UpdateModal from "@/components/craft/UpdateModal";
import { useMainContext } from "./Main.Context";

function ContentModal() {
  const { iframeRef, setContentFunc } = useMainContext();
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
      />
    </>
  );
}

export default function MainContent() {
  return (
    <MainProvider>
      <HiddenForms />
      <ContentModal />
      <FloatingButtons />
    </MainProvider>
  );
}
