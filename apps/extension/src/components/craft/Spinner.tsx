import { Disc3 } from "lucide-react";

export default function Spinner() {
  return (
    <div className="h-[calc(100vh-8rem)] grid place-items-center">
      <div className="flex flex-col items-center gap-2">
        <Disc3 className="animate-spin" size={"4rem"} />
        <p className="text-sm text-foreground">
          Check serverUrl in settings page if loading doesn't end
        </p>
      </div>
    </div>
  );
}
