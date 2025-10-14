import { os } from "@orpc/server";
import { JSONFilePreset } from "lowdb/node";
import z from "zod";

const presetSchema = z.object({
  label: z.string(),
  value: z.string(),
  cookies: z.literal(true).optional(),
});

const docValidator = z.object({
  id: z.string(),
  Title: z.string(),
  CoverUrl: z.string(),
  Url: z.string(),
  Tags: z.string().array(),
  extraData: z.string(),
  Added: z.number(),
  LastUpdated: z.number(),
  Download: z.object({
    type: z.enum(["yt-dlp", "curl"]),
    flags: z.union([presetSchema, z.string()]),
  }),
});

const dataValidator = z.array(docValidator);

export const set = os.input(dataValidator).handler(async ({ input }) => {
  const defaultData: typeof input = [];
  const db = await JSONFilePreset("./Download/tmp.json", defaultData);
  db.data = input;
  await db.write();
});
