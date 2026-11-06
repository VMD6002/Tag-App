import { useMemo } from "react";
import "../globals";
import Library from "../../../../../extension/src/entrypoints/main/routes/library";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

const SCENARIOS = [
  { id: "normal", label: "normal" },
  { id: "stress", label: "stress" },
  { id: "empty", label: "empty library" },
  { id: "noresults", label: "no results" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("normal");
  const options = useMemo<FrameOptions>(
    () => ({
      path: "/",
      scenario:
        scenario === "stress"
          ? "stress"
          : scenario === "empty"
            ? "empty"
            : "normal",
      search: scenario === "noresults" ? "zzzzqxv" : undefined,
    }),
    [scenario],
  );
  return (
    <MockShell
      title="Library"
      fidelity="real"
      note="entrypoints/main/routes/library on fake WXT storage"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options}>
        <Library />
      </ExtFrame>
    </MockShell>
  );
}
