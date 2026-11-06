import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SaveRow, SettingField } from "@/components/craft/Settings";
import { Input } from "@/components/ui/input";
import { serverUrlAtom } from "../../../atoms/settings";

export default function Server() {
  const [serverUrl, setServerUrl] = useAtom(serverUrlAtom);
  const [serverUrlBuffer, setServerUrlBuffer] = useState(serverUrl);

  useEffect(() => {
    setServerUrlBuffer(serverUrl);
  }, [serverUrl]);

  const cleaned = serverUrlBuffer.trim().replace(/\/+$/, "");

  return (
    <SettingField
      label="Server address"
      htmlFor="server-url"
      help="Where your TagApp server runs, for example http://localhost:5001. Remote mode can't load anything until this is set."
    >
      <Input
        id="server-url"
        className="max-w-md"
        type="url"
        value={serverUrlBuffer}
        onChange={(o) => setServerUrlBuffer(o.target.value)}
        placeholder="http://localhost:5001"
      />
      <SaveRow
        dirty={cleaned !== serverUrl}
        onSave={() => {
          setServerUrl(cleaned);
          toast.success("Server address saved");
        }}
      />
    </SettingField>
  );
}
