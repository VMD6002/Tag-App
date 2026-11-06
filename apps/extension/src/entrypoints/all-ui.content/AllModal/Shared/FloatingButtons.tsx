import { useAtom, useAtomValue } from "jotai";
import { Pen, Plus, Trash } from "lucide-react";
import {
  updateExistsAtom,
  updateModalOpenAtom,
} from "@/components/craft/UpdateModal/atom";
import { Button } from "@/components/ui/button";
import { loadAtom } from "..";
import type { useLocalContext } from "../LocalContent/Local.Context";
import type { useRemoteContext } from "../RemoteContent/Remote.Context";

export default function FloatingButtons({
  useContext,
}: {
  useContext: typeof useLocalContext | typeof useRemoteContext;
}) {
  const exists = useAtomValue(updateExistsAtom);
  const load = useAtomValue(loadAtom);
  const [openModal, setOpenModal] = useAtom(updateModalOpenAtom);
  const { removeContent } = useContext();

  if (!load || openModal) return;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed top-auto right-6 bottom-6 left-auto flex items-center gap-1 border bg-popover p-1 font-sans text-popover-foreground shadow-lg"
      role="toolbar"
      aria-label="TagApp"
    >
      {!exists ? (
        <Button
          onClick={() => setOpenModal(true)}
          className="cursor-pointer"
          title="Save this page to your TagApp library"
        >
          <Plus />
          Add to TagApp
        </Button>
      ) : (
        <>
          <span className="px-2 text-xs text-muted-foreground">
            Saved in TagApp
          </span>
          <Button
            onClick={() => setOpenModal(true)}
            variant="outline"
            className="cursor-pointer"
            title="Edit the saved name, tags and details"
          >
            <Pen />
            Edit
          </Button>
          <Button
            onClick={removeContent}
            variant="outline"
            className="cursor-pointer text-destructive hover:text-destructive"
            title="Remove this page from your TagApp library"
          >
            <Trash />
            Remove
          </Button>
        </>
      )}
    </div>
  );
}
