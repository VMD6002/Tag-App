import { BackUpSchema } from "@tagapp/utils/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { confirm } from "@/components/craft/confirm-dialog";
import { FilePickButton, SettingField } from "@/components/craft/Settings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { contentDataAtom } from "@/entrypoints/main/atoms";
import {
  parentTagsAtom,
  tagsAtom,
  useFixTagCount,
} from "@/entrypoints/main/atoms/tags";

type RestoreType = "All" | "contentData" | "tags";

export default function Restore() {
  const [overwrite, setOverwrite] = useState(false);
  const contentData = useAtomValue(contentDataAtom);
  const tags = useAtomValue(tagsAtom);
  const parentTags = useAtomValue(parentTagsAtom);
  const setContentData = useSetAtom(contentDataAtom);
  const setTags = useSetAtom(tagsAtom);
  const setParentTags = useSetAtom(parentTagsAtom);
  const fixTagCount = useFixTagCount();

  const restore = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, type: RestoreType) => {
      const input = event.target;
      const file = input.files?.[0];
      try {
        if (!file) return;
        if (
          overwrite &&
          !(await confirm.destructive({
            title: "Replace existing data?",
            description: `Everything of this kind (${type}) currently stored will be deleted and replaced with the file's contents.`,
            confirmText: "Replace",
          }))
        )
          return;

        const validator = BackUpSchema.safeParse(JSON.parse(await file.text()));
        if (!validator.success) {
          toast.error(z.prettifyError(validator.error));
          return;
        }
        const data = validator.data;
        const combine = <T extends object>(old: T, incoming: T): T =>
          overwrite ? incoming : { ...old, ...incoming };

        if (type !== "tags")
          await setContentData(combine(contentData, data.contentData));
        if (type !== "contentData") {
          await setTags(combine(tags, data.tags));
          await setParentTags(combine(parentTags, data.parentTags));
        }
        // Counts in the backup may not match the content that ended up on disk.
        await fixTagCount();
        toast.success(
          `Restored ${type}: ${overwrite ? "replaced existing data" : "merged with existing data"}`,
        );
      } catch (error) {
        toast.error("Error reading or parsing the JSON file");
        console.error("Error reading or parsing the JSON file:", error);
      } finally {
        input.value = "";
      }
    },
    [
      overwrite,
      contentData,
      tags,
      parentTags,
      setContentData,
      setTags,
      setParentTags,
      fixTagCount,
    ],
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
