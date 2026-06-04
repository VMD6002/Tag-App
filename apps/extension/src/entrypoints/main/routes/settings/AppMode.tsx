import { useAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { appModeAtom } from "../../atoms/settings";

type AppModeType = "local" | "hybrid" | "remote";

export default function AppMode() {
  const [appMode, setAppMode] = useAtom(appModeAtom);

  return (
    <section className="max-w-xs w-full">
      <h3 className="text-xl mb-3">App Mode</h3>
      <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg">
        {(["local", "hybrid"] as AppModeType[]).map((mode) => (
          <Button
            key={mode}
            variant={appMode === mode ? "default" : "ghost"}
            size="sm"
            className={`capitalize transition-all ${appMode === mode
              ? "bg-background text-foreground shadow-sm hover:bg-background"
              : "text-muted-foreground hover:text-foreground"
              }`}
            onClick={() =>
              confirm(
                `Are you sure you want to change app mode to "${mode}"?`,
              ) && setAppMode(mode)
            }
          >
            {mode}
          </Button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 px-1">
        {appMode === "local" &&
          "Uses offline browser storage for data and tags."}
        {appMode === "hybrid" &&
          "Syncs browser storage tags and data with a remote server."}

      </p>
    </section>
  );
}
