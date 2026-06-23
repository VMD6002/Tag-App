import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appModeAtom, serverUrlAtom } from "../../../atoms/settings";

export default function Server() {
  const [serverUrl, setServerUrl] = useAtom(serverUrlAtom);
  const [serverUrlBuffer, setServerUrlBuffer] = useState(serverUrl);

  useEffect(() => {
    setServerUrlBuffer(serverUrl);
  }, [serverUrl]);

  const appMode = useAtomValue(appModeAtom);
  if (appMode === "local") {
    return null;
  }

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full items-center">
        <Label className="text-lg">Server Address</Label>
        <Input
          className="my-2"
          type="url"
          value={serverUrlBuffer}
          onChange={(o) => setServerUrlBuffer(o.target.value)}
          placeholder="server address, eg: http://localhost:5001"
        />
      </div>
      <Button size="sm" onClick={() => setServerUrl(serverUrlBuffer)}>
        Update
      </Button>
    </section>
  );
}
