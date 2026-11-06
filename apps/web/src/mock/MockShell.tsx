import type { ReactNode } from "react";
import { Link } from "wouter";

export type Fidelity = "real" | "mirrored";

/** Dev-only strip above every mock page: way back, what it proves, and scenario switches. */
export default function MockShell({
  title,
  fidelity,
  note,
  scenarios,
  scenario,
  onScenario,
  children,
}: {
  title: string;
  fidelity: Fidelity;
  note: string;
  scenarios?: { id: string; label: string }[];
  scenario?: string;
  onScenario?: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="relative z-[2147483647] flex flex-wrap items-center gap-x-4 gap-y-2 border-b-2 border-dashed border-amber-500/70 bg-amber-500/10 px-4 py-2 text-xs backdrop-blur">
        <Link href="/" className="underline">
          ← mock index
        </Link>
        <strong>{title}</strong>
        <span
          className={`px-1.5 py-0.5 ${fidelity === "real" ? "bg-emerald-600/20" : "bg-amber-600/30"}`}
          title={note}
        >
          {fidelity === "real" ? "real component" : "mirrored markup"}
        </span>
        <span className="hidden text-muted-foreground lg:inline">{note}</span>
        {scenarios && (
          <div className="ml-auto flex flex-wrap items-center gap-1">
            <span className="text-muted-foreground">scenario:</span>
            {scenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onScenario?.(s.id)}
                aria-pressed={scenario === s.id}
                className={`cursor-pointer border px-2 py-0.5 ${scenario === s.id ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
