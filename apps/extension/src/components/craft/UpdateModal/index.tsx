import CodeEditor from "@uiw/react-textarea-code-editor";
import { useAtom, useAtomValue } from "jotai";
import { Redo2 } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import ModalShell from "@/components/craft/ModalShell";
import MultiSelect from "@/components/craft/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tagsAtom } from "@/entrypoints/main/atoms/tags";
import {
  updateContentUrlAtom,
  updateCoverAtom,
  updateExistsAtom,
  updateExtraDataAtom,
  updateInputDisabledAtom,
  updateModalOpenAtom,
  updateResetOptionsAtom,
  updateTagsAtom,
  updateTitleAtom,
} from "./atom";
import PresetsMenu from "./PresetsMenu";
import SeeMore from "./SeeMore";

/** Label row with the optional "reset to the value found on the page" button. */
function Field({
  label,
  htmlFor,
  onReset,
  children,
}: {
  label: string;
  htmlFor?: string;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex min-h-6 items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {onReset && (
          <Button
            onClick={onReset}
            size="icon-xs"
            variant="ghost"
            aria-label={`Reset ${label.toLowerCase()} to the page value`}
            title="Reset to the page value"
          >
            <Redo2 />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function UpdateModal({
  className = "",
  updateContentFunc,
  tags,
}: {
  updateContentFunc: () => void;
  className?: string;
  tags?: string[];
}) {
  const localTags = useAtomValue(tagsAtom);
  const tagsArray = tags ?? Object.keys(localTags);
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useAtom(updateModalOpenAtom);
  const [title, setTitle] = useAtom(updateTitleAtom);
  const [extraData, setExtraData] = useAtom(updateExtraDataAtom);
  const [updateTags, setUpdateTags] = useAtom(updateTagsAtom);
  const [cover, setCover] = useAtom(updateCoverAtom);
  const [contentUrl, setContentUrl] = useAtom(updateContentUrlAtom);
  const isDisabled = useAtomValue(updateInputDisabledAtom);
  const exists = useAtomValue(updateExistsAtom);
  const resetFuntions = useAtomValue(updateResetOptionsAtom);
  const close = useCallback(() => setModalOpen(false), [setModalOpen]);

  return (
    <ModalShell
      open={modalOpen}
      onClose={close}
      title={exists ? "Edit item" : "Add to library"}
      className={className}
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={isDisabled} onClick={updateContentFunc}>
            {exists ? "Save changes" : "Add to library"}
          </Button>
        </>
      }
    >
      <Field
        label="Name"
        htmlFor="update-title"
        onReset={
          resetFuntions?.title
            ? () => {
                const val = resetFuntions.title?.();
                if (val !== undefined) setTitle(val);
              }
            : undefined
        }
      >
        <Input
          id="update-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name"
        />
      </Field>
      <Field
        label="Tags"
        onReset={
          resetFuntions?.tags
            ? () => {
                const val = resetFuntions.tags?.();
                if (val !== undefined) setUpdateTags(val);
              }
            : undefined
        }
      >
        <MultiSelect
          options={tagsArray.map((o) => ({
            label: o,
            value: o,
          }))}
          placeholder="Choose tags"
          label="Tags"
          value={updateTags}
          onChange={setUpdateTags}
        />
      </Field>
      <SeeMore>
        <PresetsMenu />
        {cover !== undefined && (
          <Field
            label="Cover"
            htmlFor="update-cover"
            onReset={
              resetFuntions?.cover
                ? () => {
                    const val = resetFuntions.cover?.();
                    if (val !== undefined) setCover(val);
                  }
                : undefined
            }
          >
            <Input
              id="update-cover"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="Cover image URL"
            />
          </Field>
        )}
        {contentUrl !== undefined && (
          <Field
            label="Content URL"
            htmlFor="update-content-url"
            onReset={
              resetFuntions?.contentUrl
                ? () => {
                    const val = resetFuntions.contentUrl?.();
                    if (val !== undefined) setContentUrl(val);
                  }
                : undefined
            }
          >
            <Input
              id="update-content-url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="Content URL"
            />
          </Field>
        )}
        <Field
          label="Notes"
          onReset={
            resetFuntions?.extraData
              ? () => {
                  const val = resetFuntions.extraData?.();
                  if (val !== undefined) setExtraData(val);
                }
              : undefined
          }
        >
          <div className="max-h-40 overflow-y-auto border border-input">
            <CodeEditor
              value={extraData}
              language="md"
              placeholder="Notes (markdown)"
              onChange={(evn) => setExtraData(evn.target.value)}
              padding={12}
              className="bg-background/80"
              style={{
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              }}
              data-color-mode={theme === "system" ? "dark" : theme}
            />
          </div>
        </Field>
      </SeeMore>
    </ModalShell>
  );
}
