import { Label } from "@radix-ui/react-dropdown-menu";

export default function PresetsMenu({
  presets,
  selectedPreset,
  setSelectedPreset,
}: {
  presets: MultiSelectOption[];
  selectedPreset: string;
  setSelectedPreset: (aaa: string) => void;
}) {
  if (!presets.length) return <></>;
  return (
    <>
      <Label className="mb-2">Preset</Label>
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
