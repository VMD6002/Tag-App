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

  if (!load) return;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed space-x-8 bottom-8 top-auto left-auto right-8"
    >
      {!openModal && !exists ? (
        <Button
          onClick={() => setOpenModal(true)}
          size="icon"
          className="cursor-pointer scale-150 backdrop-blur-sm"
        >
          <Plus />
        </Button>
      ) : (
        <></>
      )}
      {!openModal && exists ? (
        <>
          <Button
            onClick={removeContent}
            size="icon"
            className="cursor-pointer scale-150 backdrop-blur-sm"
          >
            <Trash />
          </Button>
          <Button
            onClick={() => setOpenModal(true)}
            size="icon"
            className="cursor-pointer scale-150 backdrop-blur-sm"
          >
            <Pen />
          </Button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
