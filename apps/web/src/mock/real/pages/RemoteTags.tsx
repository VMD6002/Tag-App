import { useMemo } from "react";
import "../globals";
import RemoteTagPage from "../../../../../extension/src/entrypoints/main/routes/remoteTags";
import MockShell from "../../MockShell";
import { useScenario } from "../../useScenario";
import ExtFrame, { type FrameOptions } from "../ExtFrame";

const SCENARIOS = [
  { id: "normal", label: "normal" },
  { id: "stress", label: "stress (many tags)" },
  { id: "empty", label: "no tags" },
  { id: "loading", label: "loading" },
  { id: "error", label: "server error" },
];

export default function Page() {
  const [scenario, setScenario] = useScenario("normal");
  const options = useMemo<FrameOptions>(
    () => ({
      path: "/tags",
      mode: "remote",
      scenario:
        scenario === "stress"
          ? "stress"
          : scenario === "empty"
            ? "empty"
            : "normal",
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
      title="Remote tags"
      fidelity="real"
      note="entrypoints/main/routes/remoteTags; a fake fetch answers the oRPC calls"
      scenarios={SCENARIOS}
      scenario={scenario}
      onScenario={setScenario}
    >
      <ExtFrame options={options}>
        <RemoteTagPage />
      </ExtFrame>
    </MockShell>
  );
}
