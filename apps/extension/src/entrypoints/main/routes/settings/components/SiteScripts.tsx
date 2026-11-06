import { useAtom } from "jotai";
import { toast } from "sonner";
import { SettingField } from "@/components/craft/Settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { enableAfterAddRemoveScriptsAtom } from "@/entrypoints/main/atoms/supportedSites";

export default function SiteScripts() {
  const [enableAfterAddRemoveScripts, setEnableAfterAddRemoveScriptsAtom] =
    useAtom(enableAfterAddRemoveScriptsAtom);

  return (
    <SettingField
      label="After add / after remove scripts"
      htmlFor="enable-after-scripts"
      help="A site script can include optional code that runs right after you save or remove one of its items. Turn this on to let them run."
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id="enable-after-scripts"
          checked={enableAfterAddRemoveScripts}
          onCheckedChange={(newVal) => {
            setEnableAfterAddRemoveScriptsAtom(newVal as boolean);
            toast.success(`After add/remove scripts ${newVal ? "on" : "off"}`);
          }}
        />
        <Label htmlFor="enable-after-scripts" className="text-sm font-normal">
          Run after add/remove scripts
        </Label>
      </div>
    </SettingField>
  );
}
