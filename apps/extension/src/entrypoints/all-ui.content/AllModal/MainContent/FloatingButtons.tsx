import { Button } from "@/components/ui/button";
import { Pen, Plus, Trash } from "lucide-react";
import { useMainContext } from "./Main.Context";
import {
  updateExistsAtom,
  updateModalOpenAtom,
} from "@/components/craft/UpdateModal/atom";
import { loadAtom } from "./Main.Context";
import { useAtom, useAtomValue } from "jotai";

export default function FloatingButtons() {
  const exists = useAtomValue(updateExistsAtom);
  const load = useAtomValue(loadAtom);
  const [openModal, setOpenModal] = useAtom(updateModalOpenAtom);
  const { removeContent } = useMainContext();

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
