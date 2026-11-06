import { useMemo } from "react";
import "../globals";
import RemoteLibrary from "../../../../../extension/src/entrypoints/main/routes/remote";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

const SCENARIOS = [
  { id: "normal", label: "normal" },
  { id: "stress", label: "stress" },
  { id: "empty", label: "empty library" },
  { id: "noresults", label: "no results" },
  { id: "loading", label: "loading" },
  { id: "error", label: "server error" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("normal");
  const options = useMemo<FrameOptions>(
    () => ({
      path: "/",
      mode: "remote",
      scenario:
        scenario === "stress"
          ? "stress"
          : scenario === "empty"
            ? "empty"
            : "normal",
      search: scenario === "noresults" ? "zzzzqxv" : undefined,
      serverMode:
        scenario === "loading"
          ? "loading"
          : scenario === "error"
            ? "error"
            : "ok",
    }),
    [scenario],
  );
  return (
    <MockShell
      title="Remote library"
      fidelity="real"
      note="entrypoints/main/routes/remote; a fake fetch answers the oRPC calls"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options}>
        <RemoteLibrary />
      </ExtFrame>
    </MockShell>
  );
}
