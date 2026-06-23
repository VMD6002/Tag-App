import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Redo2 } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import {
  updateDownloadTypeAtom,
  updatePresetAtom,
  updatePresetOptionsAtom,
  updateResetOptionsAtom,
} from "./atom";

export default function PresetsMenu() {
  const presetOptions = useAtomValue(updatePresetOptionsAtom);
  const [preset, setPreset] = useAtom(updatePresetAtom);
  const resetOptions = useAtomValue(updateResetOptionsAtom);
  const downloadType = useAtomValue(updateDownloadTypeAtom);

  if (!downloadType) return <></>;
  if (!presetOptions || presetOptions.length <= 0) return <></>;

  return (
    <>
      <div className="flex justify-between mb-1 items-center">
        <Label>Presets</Label>
        {resetOptions?.preset && (
          <Button
            onClick={() => setPreset(resetOptions.preset)}
            size="icon"
            variant="outline"
            className="scale-80"
          >
            <Redo2 />
          </Button>
        )}
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
        value={preset?.label}
        onChange={(o) =>
          setPreset(
            presetOptions.filter((p) => p.label === o.currentTarget.value)[0],
          )
        }
      >
        {presetOptions.map((obj) => (
          <option key={`Select-${obj.label}`} value={obj.label}>
            {obj.label}
          </option>
        ))}
      </select>
    </>
  );
}
