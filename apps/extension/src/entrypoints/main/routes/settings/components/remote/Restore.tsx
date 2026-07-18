import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import z from "zod";
import { BackUpSchema } from "@tagapp/utils/types";
import { useAtomValue } from "jotai";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import { useMutation } from "@tanstack/react-query";

export default function RemoteRestore() {
  const [overwrite, setOverwrite] = useState(false);
  const orpc = useAtomValue(orpcAtom);
  const restoreMutation = useMutation(
    orpc.restoreAndBackup.restore.mutationOptions({
      onSuccess: () => {
        alert(
          `Successfully restored Tags and ContentData by ${
            overwrite ? "Overwriting" : "Merging"
          }`,
        );
      },
    }),
  );

  const restore = useCallback(
    (event: any, type: "All" | "contentData" | "tags") => {
      if (
        overwrite &&
        !confirm("U sure want to overwrite ContentData and Tags ?")
      ) {
        event.target.value = null;
        return;
      }
      const file = event.target.files?.[0];
      if (!file) return;

      file
        .text()
        .then((text: string) => JSON.parse(text))
        .then((parsedData: Record<string, any>) => {
          const validator = BackUpSchema.safeParse(parsedData);
          if (!validator.success) {
            alert(z.prettifyError(validator.error));
            return;
          }
          const data = validator.data;

          restoreMutation.mutate({ data, type, overwrite });
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite],
  );

  return (
    <section className="max-w-xs w-full grid gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl">Restore Backup (Remote)</h3>
        <div className="flex space-x-3">
          <Label>Overwrite</Label>
          <Switch
            checked={overwrite}
            onCheckedChange={(o) => setOverwrite(o)}
          />
        </div>
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">All</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={(e) => restore(e, "All")}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">Only ContentData</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={(e) => restore(e, "contentData")}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">Only Tags</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={(e) => restore(e, "tags")}
          placeholder="Select backup file to restore"
        />
      </div>
    </section>
  );
}
