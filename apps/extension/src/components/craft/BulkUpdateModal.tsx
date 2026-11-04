import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import MultiSelect from "@/components/craft/MultiSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { selectionTagsAtom } from "@/entrypoints/main/atoms/selection";
import { tagsAtom } from "@/entrypoints/main/atoms/tags";

export const bulkUpdateModalOpenAtom = atom(false);

export default function BlukUpdateModal({
  bulkUpdateContentFunc,
  tags,
}: {
  bulkUpdateContentFunc: () => void;
  tags?: string[];
}) {
  const localTags = useAtomValue(tagsAtom);
  const tagsArray = tags ?? Object.keys(localTags);

  const [modalOpen, setModalOpen] = useAtom(bulkUpdateModalOpenAtom);

  const [selectionTags, setSelectionTags] = useAtom(selectionTagsAtom);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, setModalOpen]);

  if (!modalOpen) return null;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="grid fixed h-screen top-0 right-0 w-full place-items-center"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={() => setModalOpen(false)}
        className="h-screen absolute w-full bg-black/10 backdrop-blur-xs cursor-default"
      />
      <div className="max-w-md absolute w-full grid bg-secondary rounded shadow px-8 py-10">
        <Label className="mb-2">Tags</Label>
        <MultiSelect
          options={tagsArray.map((o) => ({
            label: o,
            value: o,
          }))}
          className="mb-4"
          placeholder="Tags"
          value={selectionTags}
          onChange={setSelectionTags}
        />
        <Button
          onClick={bulkUpdateContentFunc}
          className="max-w-sm w-11/12 mx-auto"
        >
          Update
        </Button>
      </div>
    </div>
  );
}
