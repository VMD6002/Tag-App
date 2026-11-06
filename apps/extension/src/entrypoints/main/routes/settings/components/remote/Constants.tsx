import { useMutation } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { SaveRow, SettingField } from "@/components/craft/Settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "@/entrypoints/main/atoms/constants";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";

const constantsBufferAtom = atom<string>("");

function objectToCustomFormat(obj: Record<string, string>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    lines.push(`${key}: ${value}`);
  }

  return lines.join("\n");
}

function customFormatToObject(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    // This splits ONLY on the first colon it encounters
    const [key, ...valueParts] = line.split(":");

    if (key) {
      // Rejoin the rest of the pieces back with a colon (fixes the URL issue)
      const value = valueParts.join(":");

      result[key.trim()] = value.trim();
    }
  }

  return result;
}
const validateConstants = (constants: string) => {
  try {
    const parsed = z
      .record(z.string(), z.string())
      .safeParse(customFormatToObject(constants));
    if (!parsed.success) {
      toast.error(z.prettifyError(parsed.error));
      return null;
    }
    return parsed.data;
  } catch {
    toast.error("Invalid Input!");
    return null;
  }
};

export default function RemoteConstants() {
  const orpc = useAtomValue(orpcAtom);
  const [constants, setConstants] = useAtom(constantsAtom);
  const [replaceWithKeyOnUpdate, setReplaceWithKeyOnUpdate] = useAtom(
    replaceWithKeyOnUpdateAtom,
  );
  const [constantsBuffer, setConstantsBuffer] = useAtom(constantsBufferAtom);

  useEffect(() => {
    setConstantsBuffer(objectToCustomFormat(constants));
  }, [constants]);

  const setSettingsMutation = useMutation(
    orpc.main.setSettings.mutationOptions({
      onSuccess: (data) => {
        setConstants(data.constants);
        setReplaceWithKeyOnUpdate(data.replaceWithKeyOnUpdate);
        toast.success("Constants saved");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const updateConstants = () => {
    const parsed = validateConstants(constantsBuffer);
    if (!parsed) return;
    setSettingsMutation.mutate({ constants: parsed });
  };

  return (
    <>
      <SettingField
        label="Constants"
        htmlFor="constants"
        help={
          <>
            Short names for the start of a URL{" (stored on the server)"}. Write
            one per line as <code>Name: value</code>, then use{" "}
            <code>$Name</code> in a URL to expand it, e.g.{" "}
            <code>$YT/watch</code>.
          </>
        }
      >
        <Textarea
          id="constants"
          placeholder="e.g.&#10;YT: https://www.youtube.com&#10;Twitter: https://twitter.com"
          value={constantsBuffer}
          onChange={(e) => setConstantsBuffer(e.target.value)}
          className="max-w-md font-mono tracking-wide [line-break:anywhere]"
          spellCheck={false}
          rows={5}
        />
        <SaveRow
          dirty={constantsBuffer !== objectToCustomFormat(constants)}
          onSave={updateConstants}
        />
      </SettingField>
      <SettingField
        label="Shorten URLs when saving"
        htmlFor="replace-with-key"
        help="When on, a cover URL that contains a constant's value is stored with its $Name instead, so changing the constant later updates every item."
      >
        <div className="flex items-center gap-2">
          <Checkbox
            id="replace-with-key"
            checked={replaceWithKeyOnUpdate}
            onCheckedChange={(newVal) => {
              setSettingsMutation.mutate({ replaceWithKeyOnUpdate: newVal });
            }}
          />
          <Label htmlFor="replace-with-key" className="text-sm font-normal">
            Replace matching URL prefixes with their constant name
          </Label>
        </div>
      </SettingField>
    </>
  );
}
