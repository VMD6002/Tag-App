import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSetAtom } from "jotai";
import z from "zod";
import { contentDataAtom } from "@/entrypoints/main/atoms";
import { parentTagsAtom, tagsAtom } from "@/entrypoints/main/atoms/tags";
import { ContentWebSchema } from "@tagapp/utils/types";

const TagTypeSchema = z.record(
  z.string(),
  z.object({
    Count: z.number(),
    CoverUrl: z.string().optional(),
  }),
);

const BackUpSchema = z.object({
  contentData: z.record(z.string(), ContentWebSchema),
  tags: TagTypeSchema,
});

export default function Restore() {
  const [overwrite, setOverwrite] = useState(false);
  const setContentData = useSetAtom(contentDataAtom);
  const setTags = useSetAtom(tagsAtom);
  const setParentTags = useSetAtom(parentTagsAtom);

  const restoreAll = useCallback(
    (event: any) => {
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
          if (overwrite) {
            setContentData(data.contentData);
            setTags(data.tags);
            return;
          } else {
            setContentData((old) => ({ ...old, ...data.contentData }));
            setTags((old) => ({ ...old, ...data.tags }));
          }
          alert(
            `Successfully restored Tags and ContentData by ${
              overwrite ? "Overwriting" : "Merging"
            }`,
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite, setContentData, setTags],
  );

  const restoreTags = useCallback(
    (event: any) => {
      if (overwrite && !confirm("U sure want to overwrite Tags ?")) {
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
          const parentTags: Record<string, string> = Object.keys(
            data.tags,
          ).reduce(
            (acc, currentKey) => {
              const [parent, tag] = currentKey.split(":");
              acc[parent] = tag;
              return acc;
            },
            {} as Record<string, string>,
          );
          if (overwrite) {
            setTags(data.tags);
            setParentTags(parentTags);
          } else {
            setTags((old) => ({ ...old, ...data.tags }));
            setParentTags((old) => ({ ...old, ...parentTags }));
          }
          alert(
            `Successfully restored Tags by ${
              overwrite ? "Overwriting" : "Merging"
            }`,
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite, setTags],
  );

  const restoreContentData = useCallback(
    (event: any) => {
      if (overwrite && !confirm("U sure want to overwrite contentData ?")) {
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
          if (overwrite) {
            setContentData(data.contentData);
            return;
          } else {
            setContentData((old) => ({ ...old, ...data.contentData }));
          }
          alert(
            `Successfully restored ContentData by ${
              overwrite ? "Overwriting" : "Merging"
            }`,
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite, setContentData],
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
      <div className="grid w-full items-center">
        <Label className="mb-2">All</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreAll}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">Only ContentData</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreContentData}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">Only Tags</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreTags}
          placeholder="Select backup file to restore"
        />
      </div>
    </section>
  );
}
