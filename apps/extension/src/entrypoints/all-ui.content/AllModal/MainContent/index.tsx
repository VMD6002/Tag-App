import { MainProvider } from "./Main.Context";
import HiddenForms from "./HiddenForms";
import ContentModal from "./ContentModal";
import FloatingButtons from "./FloatingButtons";

export default function MainContent() {
  return (
    <MainProvider>
      <HiddenForms />
      <ContentModal />
      <FloatingButtons />
    </MainProvider>
  );
}
