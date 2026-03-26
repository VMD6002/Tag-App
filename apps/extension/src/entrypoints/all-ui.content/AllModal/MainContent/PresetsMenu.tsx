import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Redo2 } from "lucide-react";
import { useMainContext } from "./Main.Context";
import { useAtom, useSetAtom } from "jotai";
import { presetAtom, resetPresetAtom } from "./atom";

export default function PresetsMenu() {
  const { presets } = useMainContext();
  const [selectedPreset, setSelectedPreset] = useAtom(presetAtom);

  const resetPreset = useSetAtom(resetPresetAtom);
  if (!presets.length) return <></>;
  return (
    <>
      <div className="flex justify-between mb-1 items-center">
        <Label>Presets</Label>
        <Button
          onClick={resetPreset}
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
        {presets.map((obj: any) => (
          <option key={`Select-${obj.label}`} value={JSON.stringify(obj)}>
            {obj.label}
          </option>
        ))}
        <option value={'{"label":"Worst","value":"-f wv*+wa/w"}'}>Worst</option>
      </select>
    </>
  );
}
