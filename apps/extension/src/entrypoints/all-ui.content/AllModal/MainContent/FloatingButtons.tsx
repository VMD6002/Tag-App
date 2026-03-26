import { Button } from "@/components/ui/button";
import { Pen, Plus, Trash } from "lucide-react";
import { useMainContext } from "./Main.Context";
import { existsAtom, loadAtom, openModalAtom } from "./atom";
import { useAtom, useAtomValue } from "jotai";

export default function FloatingButtons() {
  const exists = useAtomValue(existsAtom);
  const load = useAtomValue(loadAtom);
  const [openModal, setOpenModal] = useAtom(openModalAtom);
  const { removeContent } = useMainContext();

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed space-x-8 bottom-8 top-auto left-auto right-8"
    >
      {load ? (
        <>
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
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
