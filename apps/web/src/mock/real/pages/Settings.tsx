import { useMemo } from "react";
import "../globals";
import Settings from "../../../../../extension/src/entrypoints/main/routes/settings";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

const SCENARIOS = [
  { id: "local", label: "local mode" },
  { id: "remote", label: "remote mode" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("local");
  const options = useMemo<FrameOptions>(
    () => ({
      path: "/settings",
      scenario: "normal",
      mode: scenario === "remote" ? "remote" : "local",
    }),
    [scenario],
  );
  return (
    <MockShell
      title="Settings"
      fidelity="real"
      note="entrypoints/main/routes/settings on fake storage and fake server"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options}>
        <Settings />
      </ExtFrame>
    </MockShell>
  );
}
