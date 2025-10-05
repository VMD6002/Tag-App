import { os } from "@orpc/server";
import { JSONFilePreset } from "lowdb/node";
import { dataValidator } from "../schemas/contentData.js";

export const set = os.input(dataValidator).handler(async ({ input }) => {
  const defaultData: typeof input = [];
  const db = await JSONFilePreset("./Download/tmp.json", defaultData);
  db.data = input;
  await db.write();
});
