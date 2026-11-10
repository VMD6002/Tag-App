import { useMutation } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { toast } from "sonner";
import { confirm } from "@/components/craft/confirm-dialog";
import { SettingField } from "@/components/craft/Settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import { cn } from "@/lib/utils";
import { appModeAtom, sanitizeTitleAtom } from "../../../atoms/settings";

type AppModeType = "local" | "remote";

const MODES: Record<AppModeType, { name: string; blurb: string }> = {
  local: { name: "Local", blurb: "Stored in this browser" },
  remote: { name: "Remote", blurb: "Stored on your TagApp server" },
};

export function SanitizeTitle() {
  const orpc = useAtomValue(orpcAtom);
  const appMode = useAtomValue(appModeAtom);
  const [sanitizeTitle, setSanitizeTitle] = useAtom(sanitizeTitleAtom);

  const setSettingsMutation = useMutation(
    orpc.main.setSettings.mutationOptions({
      onSuccess: (data) => {
        setSanitizeTitle(data.sanitizeTitleOnSave);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <SettingField
      label="Clean titles when saving"
      htmlFor="sanitize-title"
      help="Replaces characters that file names can't contain (such as / : ?) with a dash and shortens titles to 120 characters."
    >
      <div className="flex items-center gap-2">
        <Checkbox
          id="sanitize-title"
          checked={sanitizeTitle}
          onCheckedChange={(newVal) => {
            if (appMode === "remote") {
              setSettingsMutation.mutate({ sanitizeTitleOnSave: newVal });
            } else setSanitizeTitle(newVal as boolean);
            toast.success(`Title cleaning ${newVal ? "on" : "off"}`);
          }}
        />
        <Label htmlFor="sanitize-title" className="text-sm font-normal">
          Clean titles before saving
        </Label>
      </div>
    </SettingField>
  );
}

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
        toast.error(error.message);
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
      toast.success("Server settings replaced with this profile's settings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      console.log(err instanceof Error ? err.message : String(err));
    }
  };

  const getSettingsMutation = useMutation(
    orpc.main.getSettings.mutationOptions({
      onSuccess: (data) => {
        setSanitizeTitle(data.sanitizeTitleOnSave);
        setReplaceWithKeyOnUpdate(data.replaceWithKeyOnUpdate);
        setConstants(data.constants);
        toast.success("This profile's settings replaced with the server's");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <>
      <SettingField
        label="Where your library is stored"
        help={
          appMode === "local"
            ? "Items and tags live in this browser's extension storage. Nothing leaves your computer."
            : "Items and tags live on your TagApp server, which also serves a web page for browsing them. Set the server address below."
        }
      >
        <div
          role="radiogroup"
          aria-label="Where your library is stored"
          className="grid max-w-md grid-cols-2 gap-2"
        >
          {(["local", "remote"] as AppModeType[]).map((mode) => (
            <Button
              key={mode}
              role="radio"
              aria-checked={appMode === mode}
              variant="outline"
              className={cn(
                "h-auto flex-col items-start gap-0.5 px-3 py-2 text-left whitespace-normal",
                appMode === mode &&
                  "border-foreground bg-muted ring-1 ring-foreground",
              )}
              onClick={() =>
                appMode !== mode &&
                confirm({
                  title: `Switch to ${MODES[mode].name.toLowerCase()} mode?`,
                  description:
                    mode === "remote"
                      ? "The library and tags will be loaded from your server instead of this browser. Data already stored in this browser is kept."
                      : "The library and tags will be loaded from this browser instead of your server. Data on the server is kept.",
                  confirmText: "Switch",
                }).then((ok) => {
                  if (ok) setAppMode(mode);
                })
              }
            >
              <span className="text-sm font-medium">{MODES[mode].name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {MODES[mode].blurb}
              </span>
            </Button>
          ))}
        </div>
      </SettingField>

      {appMode === "remote" && (
        <SettingField
          label="Copy settings between this profile and the server"
          help="Constants, key replacement and title cleaning can differ between the two. Pick a direction; the other side is overwritten."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                confirm({
                  title: "Replace the server's settings?",
                  description:
                    "The server's constants, key replacement and title cleaning will be overwritten with this profile's.",
                  confirmText: "Replace server settings",
                  variant: "warning",
                }).then((ok) => {
                  if (ok) overRideRemoteSettings();
                })
              }
            >
              Send my settings to the server
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                confirm({
                  title: "Replace this profile's settings?",
                  description:
                    "This profile's constants, key replacement and title cleaning will be overwritten with the server's.",
                  confirmText: "Replace my settings",
                  variant: "warning",
                }).then((ok) => {
                  if (ok) getSettingsMutation.mutate({});
                })
              }
            >
              Get settings from the server
            </Button>
          </div>
        </SettingField>
      )}
    </>
  );
}
