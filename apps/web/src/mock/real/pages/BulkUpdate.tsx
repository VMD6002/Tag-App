import "../globals";
import { useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";
import BulkUpdateModal, {
  bulkUpdateModalOpenAtom,
} from "../../../../../extension/src/components/craft/BulkUpdateModal";
import { selectionTagsAtom } from "../../../../../extension/src/entrypoints/main/atoms/selection";
import Library from "../../../../../extension/src/entrypoints/main/routes/library";
import MockShell from "../../MockShell";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

function Open() {
  const open = useSetAtom(bulkUpdateModalOpenAtom);
  const setTags = useSetAtom(selectionTagsAtom);
  useEffect(() => {
    setTags([{ label: "Type:Video", value: "Type:Video" }]);
    open(true);
  }, [open, setTags]);
  return <BulkUpdateModal bulkUpdateContentFunc={() => open(false)} />;
}

export default function Page() {
  const options = useMemo<FrameOptions>(
    () => ({ path: "/", scenario: "normal" }),
    [],
  );
  return (
    <MockShell
      title="Bulk update modal"
      fidelity="real"
      note="real BulkUpdateModal over the real library; Save tags just closes it"
    >
      <ExtFrame options={options}>
        <Library />
        <Open />
      </ExtFrame>
    </MockShell>
  );
}
