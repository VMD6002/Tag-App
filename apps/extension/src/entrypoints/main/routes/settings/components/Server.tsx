import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { serverUrlAtom } from "../../../atoms/settings";

export default function Server() {
  const [serverUrl, setServerUrl] = useAtom(serverUrlAtom);
  const [serverUrlBuffer, setServerUrlBuffer] = useState(serverUrl);

  useEffect(() => {
    setServerUrlBuffer(serverUrl);
  }, [serverUrl]);

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
      <Button
        size="sm"
        onClick={() => {
          setServerUrl(serverUrlBuffer);
          toast.success("Successfully set Server address");
        }}
      >
        Update
      </Button>
    </section>
  );
}
