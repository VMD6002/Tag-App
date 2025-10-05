import { Button } from "@/components/ui/button";
import { Pen, Plus, Trash } from "lucide-react";

export default function FloatingButtons({
  load,
  openModal,
  exists,
  toggleModalFunc,
  removeContent,
}: {
  load: boolean;
  openModal: boolean;
  exists: boolean;
  toggleModalFunc: () => void;
  removeContent: () => void;
}) {
  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed space-x-8 bottom-8 top-auto left-auto right-8"
    >
      {load ? (
        <>
          {!openModal && !exists ? (
            <Button
              onClick={toggleModalFunc}
              size="icon"
              className="fixed bottom-8 top-auto left-auto right-8 border-[1px] border-white scale-150"
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
                className="cursor-pointer scale-150 border-[1px] border-background"
              >
                <Trash />
              </Button>
              <Button
                onClick={toggleModalFunc}
                size="icon"
                className="cursor-pointer scale-150 border-[1px] border-background"
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
