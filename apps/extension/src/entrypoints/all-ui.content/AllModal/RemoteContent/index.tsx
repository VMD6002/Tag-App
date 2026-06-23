import { RemoteProvider } from "./Remote.Context";
import HiddenForms from "../Shared/HiddenForms";
import FloatingButtons from "../Shared/FloatingButtons";
import { useRemoteContext } from "./Remote.Context";
import ContentModal from "../Shared/ContentModal";

export default function RemoteContent() {
  return (
    <RemoteProvider>
      <HiddenForms useContext={useRemoteContext} />
      <ContentModal useContext={useRemoteContext} />
      <FloatingButtons useContext={useRemoteContext} />
    </RemoteProvider>
  );
}
