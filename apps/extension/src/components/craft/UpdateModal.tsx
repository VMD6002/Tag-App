import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiple-selector";
import CodeEditor from "@uiw/react-textarea-code-editor";
import SeeMore from "./SeeMore";
import { atom, useAtom, useAtomValue } from "jotai";
import { tagsAtom } from "@/entrypoints/main/atoms/tags";

export const updateIdAtom = atom("");

export const updateModalOpenAtom = atom(false);
export const updateTitleAtom = atom("");
export const updateCoverAtom = atom("");
export const updateExtraDataAtom = atom("");
export const updateTagsAtom = atom<MultiSelectOption[]>([]);
export const updateInputDisabledAtom = atom(false);

export const updateDataAtom = atom((get) => ({
  id: get(updateIdAtom),
  title: get(updateTitleAtom),
  tags: get(updateTagsAtom).map((o) => o.value),
  cover: get(updateCoverAtom),
  extraData: get(updateExtraDataAtom),
}));

export default function UpdateModal({
  isServer = false,
  updateContentFunc,
}: {
  isServer?: boolean;
  updateContentFunc: () => void;
}) {
  const tags = useAtomValue(tagsAtom);
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useAtom(updateModalOpenAtom);
  const [title, setTitle] = useAtom(updateTitleAtom);
  const [extraData, setExtraData] = useAtom(updateExtraDataAtom);
  const [updateTags, setUpdateTags] = useAtom(updateTagsAtom);
  const [cover, setCover] = useAtom(updateCoverAtom);
  const isDisabled = useAtomValue(updateInputDisabledAtom);

  if (!modalOpen) return <></>;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="grid fixed min-h-screen top-0 right-0 w-full place-items-center overflow-y-auto overflow-x-clip"
    >
      <div
        onClick={() => setModalOpen(false)}
        className="h-screen absolute w-full bg-black/10 backdrop-blur-xs"
      />
      <div className="max-w-md absolute w-full grid bg-secondary rounded shadow px-8 py-10">
        <Label className="mb-2">Name</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name"
          className="mb-4"
        />
        <Label className="mb-2">Tags</Label>
        <MultipleSelector
          options={Object.keys(tags).map((o) => ({
            label: o,
            value: o,
          }))}
          className="mb-4"
          placeholder="Tags"
          value={
            isServer
              ? updateTags
              : updateTags.map((j: any) =>
                  j.label.startsWith("Site:") ? { ...j, fixed: true } : j,
                )
          }
          onChange={setUpdateTags}
        />
        <SeeMore>
          {isServer ? (
            <></>
          ) : (
            <>
              <Label className="mb-2">Cover Url</Label>
              <Input
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Name"
                className="mb-4"
              />
            </>
          )}
          <Label className="mb-2">Extra Data</Label>
          <div className="max-h-36 overflow-y-scroll mb-4">
            <CodeEditor
              value={extraData}
              language="md"
              placeholder="Extra data."
              onChange={(evn) => setExtraData(evn.target.value)}
              padding={15}
              className="bg-background/80!"
              style={{
                fontFamily:
                  "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              }}
              data-color-mode={theme === "system" ? "dark" : theme}
            />
          </div>
        </SeeMore>
        <Button
          disabled={isDisabled}
          onClick={updateContentFunc}
          className="max-w-sm w-11/12 mx-auto"
        >
          Update
        </Button>
      </div>
    </div>
  );
}
