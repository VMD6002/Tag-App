import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { enableAfterAddRemoveScriptsAtom } from "@/entrypoints/main/atoms/supportedSites";
import { useAtom } from "jotai";

export default function SiteScripts() {
  const [enableAfterAddRemoveScripts, setEnableAfterAddRemoveScriptsAtom] =
    useAtom(enableAfterAddRemoveScriptsAtom);

  return (
    <section className="max-w-xs w-full">
      <h3 className="text-xl mb-3">Site Scripts</h3>
      <div className="flex gap-2 mb-3">
        <Checkbox
          checked={enableAfterAddRemoveScripts}
          onCheckedChange={(newVal) => {
            setEnableAfterAddRemoveScriptsAtom(newVal as boolean);
          }}
        />
        <Label>Enable after add/remov Scripts</Label>
      </div>
    </section>
  );
}
