import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiple-selector";
import CodeEditor from "@uiw/react-textarea-code-editor";
import SeeMore from "./SeeMore";

export default function UpdateModal({
  Update,
  updateContentFunc,
  isServer = false,
  inputDisabled = false,
}: {
  Update: ReturnType<typeof useUpdate>;
  updateContentFunc: () => void;
  isServer?: boolean;
  inputDisabled?: boolean;
}) {
  const { tags } = useTagData();

  if (!Update.modalOpen) return <></>;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="grid fixed h-screen top-0 right-0 w-full place-items-center"
    >
      <div
        onClick={Update.toggleModalFunc}
        className="h-screen absolute w-full bg-black/10 backdrop-blur-xs"
      />
      <div className="max-w-md absolute w-full grid bg-secondary rounded shadow px-8 py-10">
        <Label className="mb-2">Name</Label>
        <Input
          value={Update.title}
          onChange={(e) => Update.setTitle(e.target.value)}
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
              ? Update.tags
              : Update.tags.map((j: any) =>
                  j.label.startsWith("Site:") ? { ...j, fixed: true } : j
                )
          }
          onChange={Update.setTags}
        />
        <SeeMore>
          {isServer ? (
            <></>
          ) : (
            <>
              <Label className="mb-2">Cover Url</Label>
              <Input
                value={Update.cover}
                onChange={(e) => Update.setCover(e.target.value)}
                placeholder="Name"
                className="mb-4"
              />
            </>
          )}
          <Label className="mb-2">Extra Data</Label>
          <CodeEditor
            value={Update.extraData}
            language="md"
            placeholder="Extra data."
            onChange={(evn) => Update.setExtraData(evn.target.value)}
            padding={15}
            className="bg-background/80! mb-4"
            style={{
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </SeeMore>
        <Button
          disabled={inputDisabled}
          onClick={updateContentFunc}
          className="max-w-sm w-11/12 mx-auto"
        >
          Update
        </Button>
      </div>
    </div>
  );
}
