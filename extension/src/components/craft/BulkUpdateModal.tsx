import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiple-selector";

export default function BlukUpdateModal({
  Selection,
  bulkUpdateContentFunc,
}: any) {
  const { tags } = useTagData();

  if (!Selection.modalOpen) return <></>;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="grid fixed h-screen top-0 right-0 w-full place-items-center"
    >
      <div
        onClick={Selection.toggleModalFunc}
        className="h-screen absolute w-full bg-black/10 backdrop-blur-xs"
      />
      <div className="max-w-md absolute w-full grid bg-secondary rounded shadow px-8 py-10">
        <Label className="mb-2">Tags</Label>
        <MultipleSelector
          options={Object.keys(tags).map((o) => ({
            label: o,
            value: o,
          }))}
          className="mb-4"
          placeholder="Tags"
          value={Selection.tags}
          onChange={Selection.setTags}
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
