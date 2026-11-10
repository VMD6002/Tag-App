import { useAtom, useAtomValue } from "jotai";
import { toast } from "sonner";
import { SettingField } from "@/components/craft/Settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  crossUserScriptsAtom,
  rebuildCrossUserHostsIndex,
} from "@/entrypoints/main/atoms/supportedSites";
import { userListAtom } from "@/entrypoints/main/atoms/user";

export default function CrossUserScripts() {
  const [crossUserScripts, setCrossUserScripts] = useAtom(crossUserScriptsAtom);
  const userList = useAtomValue(userListAtom);

  return (
    <SettingField
      label="Cross User Scripts"
      htmlFor="cross-user-scripts"
      help="Applies to all profiles. A site script runs under the profile that owns it, even when another profile is active (the active profile wins if it also has one). Pages in Connected pages get their tags from the owning profile too."
    >
      <div className="flex items-center gap-2">
        <Switch
          id="cross-user-scripts"
          checked={crossUserScripts}
          onCheckedChange={async (newVal) => {
            setCrossUserScripts(newVal);
            if (newVal) await rebuildCrossUserHostsIndex(userList);
            toast.success(`Cross user scripts ${newVal ? "on" : "off"}`);
          }}
        />
        <Label htmlFor="cross-user-scripts" className="text-sm font-normal">
          Run site scripts from any profile
        </Label>
      </div>
    </SettingField>
  );
}
