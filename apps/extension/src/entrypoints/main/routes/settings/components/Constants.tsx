import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appModeAtom } from "../../../atoms/settings";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "../../../atoms/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
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
      alert(z.prettifyError(parsed.error));
      return null;
    }
    return parsed.data;
  } catch {
    alert("Invalid Input!");
    return null;
  }
};

const ServerButtons = () => {
  const setConstants = useSetAtom(constantsAtom);
  const constantsBuffer = useAtomValue(constantsBufferAtom);

  const updateConstants = () => {
    const parsed = validateConstants(constantsBuffer);
    if (!parsed) return;
    setConstants(parsed);
  };

  return (
    <>
      <Button onClick={updateConstants} size="sm" className="mr-2">
        Update
      </Button>
      <Button size="sm">Refresh</Button>
    </>
  );
};

export default function Constants() {
  const orpc = useAtomValue(orpcAtom);
  const [constants, setConstants] = useAtom(constantsAtom);
  const [replaceWithKeyOnUpdate, setReplaceWithKeyOnUpdate] = useAtom(
    replaceWithKeyOnUpdateAtom,
  );
  const [constantsBuffer, setConstantsBuffer] = useAtom(constantsBufferAtom);

  const appMode = useAtomValue(appModeAtom);

  useEffect(() => {
    setConstantsBuffer(objectToCustomFormat(constants));
  }, [constants]);

  const setSettingsMutation = useMutation(
    orpc.main.setSettings.mutationOptions({
      onSuccess: (data) => {
        setConstants(data.constants);
        setReplaceWithKeyOnUpdate(data.replaceWithKeyOnUpdate);
      },
      onError: (error) => {
        alert(error.message);
      },
    }),
  );
  const updateConstants = () => {
    const parsed = validateConstants(constantsBuffer);
    if (!parsed) return;
    if (appMode === "remote") {
      setSettingsMutation.mutate({ constants: parsed });
    } else setConstants(parsed);
  };

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full mb-3">
        <Label className="text-lg mb-1">Constants</Label>
        <div className="flex gap-2 mb-3">
          <Checkbox
            checked={replaceWithKeyOnUpdate}
            onCheckedChange={(newVal) => {
              if (appMode === "remote") {
                setSettingsMutation.mutate({ replaceWithKeyOnUpdate: newVal });
              } else setReplaceWithKeyOnUpdate(newVal as boolean);
            }}
          />
          <Label>Repalce value with key on Update</Label>
        </div>
        <Textarea
          placeholder="e.g.&#10;YT: https://www.youtube.com&#10;Twitter: https://twitter.com"
          value={constantsBuffer}
          onChange={(e) => setConstantsBuffer(e.target.value)}
          className="font-mono tracking-wide [line-break:anywhere]"
          spellCheck={false}
        />
      </div>
      <Button size="sm" onClick={updateConstants}>
        Update
      </Button>
    </section>
  );
}
