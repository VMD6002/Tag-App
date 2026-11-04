import { BackUpSchema } from "@tagapp/utils/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { confirm } from "@/components/craft/confirm-dialog";
import { Input } from "@/components/ui/input";
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
        if (overwrite && !(await confirm(`U sure want to overwrite ${type}?`)))
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
          `Successfully restored ${type} by ${overwrite ? "Overwriting" : "Merging"}`,
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

  const fileInput = (label: string, type: RestoreType) => (
    <div className="grid w-full items-center">
      <Label className="mb-2">{label}</Label>
      <Input
        type="file"
        accept=".json,application/json"
        onChange={(e) => restore(e, type)}
      />
    </div>
  );

  return (
    <section className="max-w-xs w-full grid gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl">Restore Backup</h3>
        <div className="flex space-x-3">
          <Label>Overwrite</Label>
          <Switch
            checked={overwrite}
            onCheckedChange={(o) => setOverwrite(o)}
          />
        </div>
      </div>
      {fileInput("All", "All")}
      {fileInput("Only ContentData", "contentData")}
      {fileInput("Only Tags", "tags")}
    </section>
  );
}
