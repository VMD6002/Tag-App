import { useAtom } from "jotai";
import { toast } from "sonner";
import { SettingField } from "@/components/craft/Settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  enableAfterAddRemoveScriptsAtom,
  runAfterAddRemoveScriptsInServerAtom,
} from "@/entrypoints/main/atoms/supportedSites";

export default function RemoteSiteScripts() {
  const [enableAfterAddRemoveScripts, setEnableAfterAddRemoveScriptsAtom] =
    useAtom(enableAfterAddRemoveScriptsAtom);
  const [
    runAfterAddRemoveScriptsInServer,
    setRunAfterAddRemoveScriptsInServer,
  ] = useAtom(runAfterAddRemoveScriptsInServerAtom);

  return (
    <>
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
              toast.success(
                `After add/remove scripts ${newVal ? "on" : "off"}`,
              );
            }}
          />
          <Label htmlFor="enable-after-scripts" className="text-sm font-normal">
            Run after add/remove scripts
          </Label>
        </div>
      </SettingField>
      <SettingField
        label="Where the scripts run"
        htmlFor="run-scripts-on-server"
        help="Run them on the server (limited to fetch, console and setTimeout, 5 second limit) instead of in this browser. Needs the option above."
      >
        <div className="flex items-center gap-2">
          <Checkbox
            id="run-scripts-on-server"
            disabled={!enableAfterAddRemoveScripts}
            checked={runAfterAddRemoveScriptsInServer}
            onCheckedChange={(newVal) => {
              setRunAfterAddRemoveScriptsInServer(newVal as boolean);
              toast.success(
                `Scripts will run ${newVal ? "on the server" : "in this browser"}`,
              );
            }}
          />
          <Label
            htmlFor="run-scripts-on-server"
            className={`text-sm font-normal ${!enableAfterAddRemoveScripts ? "text-muted-foreground" : ""}`}
          >
            Run the scripts on the server
          </Label>
        </div>
      </SettingField>
    </>
  );
}
