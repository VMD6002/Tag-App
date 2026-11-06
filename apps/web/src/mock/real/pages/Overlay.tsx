import { useMemo } from "react";
import "../globals";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";
import Overlay, { type OverlayState } from "../Overlay";

const SCENARIOS = [
  { id: "new", label: "page not saved" },
  { id: "saved", label: "page saved" },
  { id: "add", label: "add modal" },
  { id: "edit", label: "edit modal" },
  { id: "add-shadow", label: "add modal in shadow DOM" },
  { id: "saved-shadow", label: "saved in shadow DOM" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("saved");
  const options = useMemo<FrameOptions>(
    () => ({ path: "/", scenario: "normal" }),
    [],
  );
  const state = scenario.replace("-shadow", "") as OverlayState;
  return (
    <MockShell
      title="Clip overlay / update modal"
      fidelity="real"
      note="real UpdateModal + FloatingButtons; the get-details/save plumbing is replaced by no-ops"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options} chrome={false}>
        <Overlay state={state} shadow={scenario.endsWith("shadow")} />
      </ExtFrame>
    </MockShell>
  );
}
