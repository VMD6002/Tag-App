import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appModeAtom, sanitizeTitleAtom } from "../../../atoms/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import { useMutation } from "@tanstack/react-query";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";

type AppModeType = "local" | "remote";

export default function AppMode() {
  const orpc = useAtomValue(orpcAtom);
  const [appMode, setAppMode] = useAtom(appModeAtom);
  const [sanitizeTitle, setSanitizeTitle] = useAtom(sanitizeTitleAtom);
  const [replaceWithKeyOnUpdate, setReplaceWithKeyOnUpdate] = useAtom(
    replaceWithKeyOnUpdateAtom,
  );
  const [constants, setConstants] = useAtom(constantsAtom);

  const setSettingsMutation = useMutation(
    orpc.main.setSettings.mutationOptions({
      onSuccess: (data) => {
        setSanitizeTitle(data.sanitizeTitleOnSave);
      },
      onError: (error) => {
        alert(error.message);
      },
    }),
  );

  const overRideRemoteSettings = async () => {
    try {
      await setSettingsMutation.mutateAsync({
        replaceWithKeyOnUpdate,
        constants,
        sanitizeTitleOnSave: sanitizeTitle,
      });
      alert("Remote Settings Overridden Successfully");
    } catch (err) {
      console.log((err as any).message);
    }
  };

  const getSettingsMutation = useMutation(
    orpc.main.getSettings.mutationOptions({
      onSuccess: (data) => {
        setSanitizeTitle(data.sanitizeTitleOnSave);
        setReplaceWithKeyOnUpdate(data.replaceWithKeyOnUpdate);
        setConstants(data.constants);
        alert("Settings Pulled Successfully");
      },
      onError: (error) => {
        alert(error.message);
      },
    }),
  );

  return (
    <section className="max-w-xs w-full">
      <h3 className="text-xl mb-3">App Mode</h3>
      <div className="flex gap-2 mb-3">
        <Checkbox
          checked={sanitizeTitle}
          onCheckedChange={(newVal) => {
            if (appMode === "remote") {
              setSettingsMutation.mutate({ sanitizeTitleOnSave: newVal });
            } else setSanitizeTitle(newVal as boolean);
          }}
        />
        <Label>Sanitize Title Before Adding To DB</Label>
      </div>
      <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg">
        {(["local", "remote"] as AppModeType[]).map((mode) => (
          <Button
            key={mode}
            variant={appMode === mode ? "default" : "ghost"}
            size="sm"
            className={`capitalize transition-all ${
              appMode === mode
                ? "bg-background text-foreground shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() =>
              confirm(
                `Are you sure you want to change app mode to "${mode}"?`,
              ) && setAppMode(mode)
            }
          >
            {mode}
          </Button>
        ))}
      </div>
      {appMode === "remote" && (
        <div className="grid gap-1 p-1">
          <Button
            size="sm"
            variant="outline"
            className="capitalize transition-all"
            onClick={() =>
              confirm(
                `Are you sure you want to override the remote settings with local settings?`,
              ) && overRideRemoteSettings()
            }
          >
            Override Remote Settings
          </Button>
          <Button
            size="sm"
            className="capitalize transition-all"
            variant="outline"
            onClick={() =>
              confirm(
                `Are you sure you want to override the local settings with remote settings?`,
              ) && getSettingsMutation.mutate({})
            }
          >
            Pull Remote Settings
          </Button>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground mt-2 px-1">
        {appMode === "local" &&
          "Uses offline browser storage for data and tags."}
        {appMode === "remote" &&
          "Uses remote server to save contentData along with a extrenal web interface."}
      </p>
    </section>
  );
}
