import { Button } from "@/components/ui/button";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import { Label } from "@/components/ui/label";
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
    const { download } = GetTagAppSiteData();
    setSelectedPreset(JSON.stringify(download?.defaultPreset));
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
        className="mb-4 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
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
