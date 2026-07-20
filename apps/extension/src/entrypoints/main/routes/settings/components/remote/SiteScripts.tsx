import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  enableAfterAddRemoveScriptsAtom,
  runAfterAddRemoveScriptsInServerAtom,
} from "@/entrypoints/main/atoms/supportedSites";
import { useAtom } from "jotai";

export default function RemoteSiteScripts() {
  const [enableAfterAddRemoveScripts, setEnableAfterAddRemoveScriptsAtom] =
    useAtom(enableAfterAddRemoveScriptsAtom);
  const [
    runAfterAddRemoveScriptsInServer,
    setRunAfterAddRemoveScriptsInServer,
  ] = useAtom(runAfterAddRemoveScriptsInServerAtom);

  return (
    <section className="max-w-xs space-y-3 w-full">
      <h3 className="text-xl">Site Scripts</h3>
      <div className="flex gap-2">
        <Checkbox
          checked={enableAfterAddRemoveScripts}
          onCheckedChange={(newVal) => {
            setEnableAfterAddRemoveScriptsAtom(newVal as boolean);
          }}
        />
        <Label>Enable after add/remov Scripts</Label>
      </div>
      <div className="flex gap-2">
        <Checkbox
          disabled={!enableAfterAddRemoveScripts}
          checked={runAfterAddRemoveScriptsInServer}
          onCheckedChange={(newVal) => {
            setRunAfterAddRemoveScriptsInServer(newVal as boolean);
          }}
        />
        <Label
          className={
            !enableAfterAddRemoveScripts ? "text-muted-foreground" : ""
          }
        >
          Run the scripts on Server
        </Label>
      </div>
    </section>
  );
}
