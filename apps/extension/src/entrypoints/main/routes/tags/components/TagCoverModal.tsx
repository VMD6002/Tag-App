import { useDeferredValue } from "react";
import ModalShell from "@/components/craft/ModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTagContext } from "../Tags.Context";

export default function TagCoverModal() {
  const {
    currentTag,
    cover,
    toggleModal,
    setCover,
    setTagCover,
    open,
    removeCover,
  } = useTagContext();

  const coverURL = useDeferredValue(cover);

  return (
    <ModalShell
      open={open}
      onClose={toggleModal}
      title="Tag cover"
      description={<span className="break-all">{currentTag}</span>}
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={toggleModal}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={removeCover}>
            Remove cover
          </Button>
          <Button onClick={setTagCover}>Save cover</Button>
        </>
      }
    >
      <div className="flex min-h-40 items-center justify-center overflow-hidden border bg-muted/40">
        {coverURL ? (
          <img
            alt="Tag cover preview"
            className="max-h-[max(16rem,50vh)] w-full object-contain"
            src={coverURL}
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            Paste an image URL to preview it
          </span>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tag-cover-url">Cover image URL</Label>
        <Input
          id="tag-cover-url"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          type="text"
          placeholder="https://…"
        />
      </div>
    </ModalShell>
  );
}
