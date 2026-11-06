import { useMemo } from "react";
import "../globals";
import Supported from "../../../../../extension/src/entrypoints/main/routes/supported";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

const SCENARIOS = [
  { id: "normal", label: "7 sites" },
  { id: "stress", label: "35 sites" },
  { id: "empty", label: "none" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("normal");
  const options = useMemo<FrameOptions>(
    () => ({
      path: "/supported",
      scenario: scenario as FrameOptions["scenario"],
    }),
    [scenario],
  );
  return (
    <MockShell
      title="Supported sites"
      fidelity="real"
      note="entrypoints/main/routes/supported on fake storage"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options}>
        <Supported />
      </ExtFrame>
    </MockShell>
  );
}
