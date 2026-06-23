import { LocalProvider } from "./Local.Context";
import HiddenForms from "../Shared/HiddenForms";
import FloatingButtons from "../Shared/FloatingButtons";
import { useLocalContext } from "./Local.Context";
import ContentModal from "../Shared/ContentModal";

export default function LocalContent() {
  return (
    <LocalProvider>
      <HiddenForms useContext={useLocalContext} />
      <ContentModal useContext={useLocalContext} />
      <FloatingButtons useContext={useLocalContext} />
    </LocalProvider>
  );
}
