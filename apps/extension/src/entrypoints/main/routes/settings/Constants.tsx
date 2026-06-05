import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appModeAtom } from "../../atoms/settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { constantsAtom, replaceWithKeyOnUpdateAtom } from "../../atoms/constants";
import { Checkbox } from "@/components/ui/checkbox";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const constantsBufferAtom = atom<string>("");

function objectToCustomFormat(obj: Record<string, string>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    lines.push(`${key}: ${value}`);
  }

  return lines.join('\n');
}

function customFormatToObject(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    // This splits ONLY on the first colon it encounters
    const [key, ...valueParts] = line.split(':');

    if (key) {
      // Rejoin the rest of the pieces back with a colon (fixes the URL issue)
      const value = valueParts.join(':');

      result[key.trim()] = value.trim();
    }
  }

  return result;
}
const validateConstants = (constants: string) => {
  try {
    const parsed = z.record(z.string(), z.string()).safeParse(customFormatToObject(constants));
    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return null;
    }
    return parsed.data;
  } catch {
    alert("Invalid Input!");
    return null;
  }
}

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
  const [constants, setConstants] = useAtom(constantsAtom);
  const [replaceWithKeyOnUpdate, setReplaceWithKeyOnUpdate] = useAtom(replaceWithKeyOnUpdateAtom);
  const [constantsBuffer, setConstantsBuffer] = useAtom(constantsBufferAtom);

  const appMode = useAtomValue(appModeAtom);

  useEffect(() => {
    setConstantsBuffer(objectToCustomFormat(constants));
  }, [constants]);

  const updateConstants = () => {
    const parsed = validateConstants(constantsBuffer);
    if (!parsed) return;
    setConstants(parsed);
  };

  return (
    <section className="max-w-xs w-full">

      <div className="grid w-full mb-3">
        <Label className="text-lg mb-1">Constants</Label>
        <div className="flex gap-2 mb-3">
          <Checkbox checked={replaceWithKeyOnUpdate} onCheckedChange={(newVal) => setReplaceWithKeyOnUpdate(newVal as boolean)} />
          <Label>Repalce value with key on Update</Label>
        </div>
        <Textarea
          value={constantsBuffer}
          onChange={(e) => setConstantsBuffer(e.target.value)}
          className="font-mono tracking-wide [line-break:anywhere]"
          spellCheck={false}
        />
      </div>
      {appMode === "local" ? (
        <Button size="sm" onClick={updateConstants}>
          Update
        </Button>
      ) : (
        <QueryClientProvider client={queryClient}>
          <ServerButtons />
        </QueryClientProvider>
      )}
    </section>
  );
}
