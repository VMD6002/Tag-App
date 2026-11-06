import { useMemo } from "react";
import "../globals";
import TagPage from "../../../../../extension/src/entrypoints/main/routes/tags";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

const SCENARIOS = [
  { id: "normal", label: "normal" },
  { id: "stress", label: "stress (many tags)" },
  { id: "empty", label: "no tags" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("normal");
  const options = useMemo<FrameOptions>(
    () => ({ path: "/tags", scenario: scenario as FrameOptions["scenario"] }),
    [scenario],
  );
  return (
    <MockShell
      title="Tags"
      fidelity="real"
      note="entrypoints/main/routes/tags on fake WXT storage"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options}>
        <TagPage />
      </ExtFrame>
    </MockShell>
  );
}
