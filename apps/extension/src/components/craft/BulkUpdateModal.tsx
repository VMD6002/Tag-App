import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import ModalShell from "@/components/craft/ModalShell";
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
  const close = useCallback(() => setModalOpen(false), [setModalOpen]);

  return (
    <ModalShell
      open={modalOpen}
      onClose={close}
      title="Edit tags on selected items"
      description="Tags shared by every selected item are pre-filled. Add tags to give them to all items, or remove one to take it off all items."
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button onClick={bulkUpdateContentFunc}>Save tags</Button>
        </>
      }
    >
      <div className="grid gap-2">
        <Label>Tags</Label>
        <MultiSelect
          options={tagsArray.map((o) => ({
            label: o,
            value: o,
          }))}
          placeholder="Choose tags"
          label="Tags for the selected items"
          value={selectionTags}
          onChange={setSelectionTags}
        />
      </div>
    </ModalShell>
  );
}
