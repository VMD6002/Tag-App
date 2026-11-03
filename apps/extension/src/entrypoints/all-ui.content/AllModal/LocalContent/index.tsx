import ContentModal from "../Shared/ContentModal";
import FloatingButtons from "../Shared/FloatingButtons";
import HiddenForms from "../Shared/HiddenForms";
import { LocalProvider, useLocalContext } from "./Local.Context";

export default function LocalContent() {
  return (
    <LocalProvider>
      <HiddenForms useContext={useLocalContext} />
      <ContentModal useContext={useLocalContext} />
      <FloatingButtons useContext={useLocalContext} />
    </LocalProvider>
  );
}
