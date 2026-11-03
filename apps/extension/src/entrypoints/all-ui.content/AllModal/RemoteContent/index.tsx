import ContentModal from "../Shared/ContentModal";
import FloatingButtons from "../Shared/FloatingButtons";
import HiddenForms from "../Shared/HiddenForms";
import { RemoteProvider, useRemoteContext } from "./Remote.Context";

export default function RemoteContent() {
  return (
    <RemoteProvider>
      <HiddenForms useContext={useRemoteContext} />
      <ContentModal useContext={useRemoteContext} />
      <FloatingButtons useContext={useRemoteContext} />
    </RemoteProvider>
  );
}
