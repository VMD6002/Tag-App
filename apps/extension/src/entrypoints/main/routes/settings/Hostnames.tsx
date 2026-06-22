import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { hostNamesAtom } from "../../atoms/settings";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";

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
      alert(z.prettifyError(parsed.error));
      return null;
    }
    return parsed.data;
  } catch {
    alert("Invalid Input!");
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
  };

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full mb-3">
        <Label className="text-lg mb-2">Hostnames</Label>
        <Textarea
          value={hostnamesBuffer}
          onChange={(e) => setHostnamesBuffer(e.target.value)}
          className="font-mono tracking-wide [line-break:anywhere]"
          spellCheck={false}
          placeholder="https://localhost:5000&#10;https://example.com"
          rows={6}
        />
      </div>
      <Button size="sm" onClick={updateHostnames}>
        Update
      </Button>
    </section>
  );
}
