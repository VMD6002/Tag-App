import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { toast } from "sonner";
import z from "zod";
import { SaveRow, SettingField } from "@/components/craft/Settings";
import { Textarea } from "@/components/ui/textarea";
import { hostNamesAtom } from "../../../atoms/settings";

const hostnamesBufferAtom = atom<string>("");

// Converts array of hostnames to a newline-separated string
function hostnamesToFormat(arr: string[]): string {
  return arr.join("\n");
}

// Converts newline-separated string to an array of trimmed, non-empty hostnames
function formatToHostnames(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const validateHostnames = (hostnamesText: string) => {
  try {
    const list = formatToHostnames(hostnamesText);
    // Validates that every line entered is a valid URL
    const parsed = z
      .array(z.url("Each line must be a valid URL"))
      .safeParse(list);

    if (!parsed.success) {
      toast.error(z.prettifyError(parsed.error));
      return null;
    }
    return parsed.data.map((u) => new URL(u).origin);
  } catch {
    toast.error("Invalid Input!");
    return null;
  }
};

export default function Hostnames() {
  const [hostNames, setHostNames] = useAtom(hostNamesAtom);
  const [hostnamesBuffer, setHostnamesBuffer] = useAtom(hostnamesBufferAtom);

  // Sync buffer whenever underlying state changes
  useEffect(() => {
    setHostnamesBuffer(hostnamesToFormat(hostNames));
  }, [hostNames, setHostnamesBuffer]);

  const updateHostnames = () => {
    const parsed = validateHostnames(hostnamesBuffer);
    if (!parsed) return;
    setHostNames(parsed);
    toast.success("Hostnames saved");
  };

  return (
    <SettingField
      label="Share my tags with these websites"
      htmlFor="hostnames"
      help="Pages on these addresses don't get the clip button. Instead they receive your tag list, so a web UI (such as your TagApp server's page) can suggest your tags. One address per line."
    >
      <Textarea
        id="hostnames"
        value={hostnamesBuffer}
        onChange={(e) => setHostnamesBuffer(e.target.value)}
        className="max-w-md font-mono tracking-wide [line-break:anywhere]"
        spellCheck={false}
        placeholder="e.g.&#10;https://localhost:5000&#10;https://example.com"
        rows={4}
      />
      <SaveRow
        dirty={hostnamesBuffer !== hostnamesToFormat(hostNames)}
        onSave={updateHostnames}
      />
    </SettingField>
  );
}
