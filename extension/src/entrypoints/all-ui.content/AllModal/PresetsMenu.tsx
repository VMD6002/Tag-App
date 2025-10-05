import { Button } from "@/components/ui/button";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Redo2 } from "lucide-react";

export default function PresetsMenu({
  presets,
  selectedPreset,
  setSelectedPreset,
}: {
  presets: MultiSelectOption[];
  selectedPreset: string;
  setSelectedPreset: (aaa: string) => void;
}) {
  const reset = useCallback(() => {
    const { Download } = GetTagAppSiteData();
    setSelectedPreset(JSON.stringify(Download?.defaultPreset));
  }, []);
  if (!presets.length) return <></>;
  return (
    <>
      <div className="flex justify-between mb-1 items-center">
        <Label>Presets</Label>
        <Button
          onClick={reset}
          size="icon"
          variant="outline"
          className="scale-80"
        >
          <Redo2 />
        </Button>
      </div>
      <select
        className="mb-4 border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
        value={selectedPreset}
        onChange={(o) => setSelectedPreset(o.currentTarget.value)}
      >
        <option value={'{"label":"Worst","value":"-f bv*+ba/b"}'}>Best</option>
        {presets.map((obj) => (
          <option key={`Select-${obj.label}`} value={JSON.stringify(obj)}>
            {obj.label}
          </option>
        ))}
        <option value={'{"label":"Worst","value":"-f wv*+wa/w"}'}>Worst</option>
      </select>
    </>
  );
}
