import { BackUpSchema } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { type ChangeEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { confirm } from "@/components/craft/confirm-dialog";
import { FilePickButton, SettingField } from "@/components/craft/Settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";

export default function RemoteRestore() {
  const [overwrite, setOverwrite] = useState(false);
  const orpc = useAtomValue(orpcAtom);
  const restoreMutation = useMutation(
    orpc.restoreAndBackup.restore.mutationOptions({
      onSuccess: () => {
        toast.success(
          `Restored to the server: ${overwrite ? "replaced existing data" : "merged with existing data"}`,
        );
      },
    }),
  );

  const restore = useCallback(
    async (
      event: ChangeEvent<HTMLInputElement>,
      type: "All" | "contentData" | "tags",
    ) => {
      if (
        overwrite &&
        !(await confirm.destructive({
          title: "Replace existing data?",
          description: `Everything of this kind (${type}) currently stored will be deleted and replaced with the file's contents.`,
          confirmText: "Replace",
        }))
      ) {
        event.target.value = "";
        return;
      }
      const file = event.target.files?.[0];
      if (!file) return;

      file
        .text()
        .then((text: string) => JSON.parse(text))
        .then((parsedData: unknown) => {
          const validator = BackUpSchema.safeParse(parsedData);
          if (!validator.success) {
            toast.error(z.prettifyError(validator.error));
            return;
          }
          const data = validator.data;

          restoreMutation.mutate({ data, type, overwrite });
        })
        .catch((error: unknown) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = "";
    },
    [overwrite, restoreMutation.mutate],
  );

  return (
    <SettingField
      label="Restore from a backup"
      help="Choose a backup file made with the Back up buttons. Merge keeps what you have and adds the file's data; replace deletes the current data of that kind first."
    >
      <div className="flex items-center gap-2">
        <Switch
          id="restore-overwrite"
          checked={overwrite}
          onCheckedChange={(o) => setOverwrite(o)}
        />
        <Label htmlFor="restore-overwrite" className="text-sm font-normal">
          Replace instead of merge
        </Label>
      </div>
      <p
        aria-live="polite"
        className={`text-xs ${overwrite ? "text-destructive" : "text-muted-foreground"}`}
      >
        {overwrite
          ? "Replace: the current data is deleted and swapped for the file's. You'll be asked to confirm."
          : "Merge: items and tags from the file are added; entries with the same ID or name are updated."}
      </p>
      <div className="flex flex-wrap gap-2">
        <FilePickButton
          label="Restore everything"
          onChange={(e) => restore(e, "All")}
        />
        <FilePickButton
          label="Restore items only"
          onChange={(e) => restore(e, "contentData")}
        />
        <FilePickButton
          label="Restore tags only"
          onChange={(e) => restore(e, "tags")}
        />
      </div>
    </SettingField>
  );
}
