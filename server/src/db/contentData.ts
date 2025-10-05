import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import z from "zod";

const contentDataValidator = z.object({
  id: z.string(),
  Title: z.string(),
  Tags: z.string().array(),
  extraData: z.string(),
  Added: z.number(),
  LastUpdated: z.number(),
  Type: z.enum(["img", "video", "ImgSet", "VideoSet"]),
  ext: z.array(z.string()),
});
export type contentData = z.infer<typeof contentDataValidator>;
type contentDataDB = Record<string, contentData>;

const contentDataDB_DefaultData: contentDataDB = {};
const contentDataDB: Low<contentDataDB> = await JSONFilePreset(
  "./DB/contentData.json",
  contentDataDB_DefaultData
);
export { contentDataDB };
