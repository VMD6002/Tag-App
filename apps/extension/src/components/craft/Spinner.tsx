import { LoadingState } from "./EmptyState";

export default function Spinner() {
  return (
    <LoadingState
      label="Loading…"
      hint="Taking too long? Check the server address in Settings."
    />
  );
}
