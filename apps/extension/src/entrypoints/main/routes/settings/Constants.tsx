import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appModeAtom, constantsAtom } from "../../atoms/settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";

const CONSTANTS_SCHEMA = z.record(z.string(), z.string());
const validateConstants = (constants: string) => {
  try {
    const parsed = CONSTANTS_SCHEMA.safeParse(JSON.parse(constants || "{}"));
    if (!parsed.success) {
      alert(z.prettifyError(parsed.error));
      return null;
    }
    return parsed.data;
  } catch {
    alert("Invalid JSON!");
    return null;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const constantsBufferAtom = atom<string>("{}");

const ServerButtons = () => {
  const setConstants = useSetAtom(constantsAtom);
  const constantsBuffer = useAtomValue(constantsBufferAtom);

  const updateConstants = () => {
    const parsed = validateConstants(constantsBuffer);
    if (parsed) {
      setConstants(parsed);
    }
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
  const [constantsBuffer, setConstantsBuffer] = useAtom(constantsBufferAtom);

  const appMode = useAtomValue(appModeAtom);

  useEffect(() => {
    setConstantsBuffer(JSON.stringify(constants, null, 2));
  }, [constants]);

  const updateConstants = () => {
    const parsed = validateConstants(constantsBuffer);
    if (parsed) {
      setConstants(parsed);
    }
  };

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full items-center mb-2">
        <Label className="text-lg">Constants</Label>
        <Textarea
          value={constantsBuffer}
          onChange={(e) => setConstantsBuffer(e.target.value)}
          className="font-mono tracking-wide"
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
