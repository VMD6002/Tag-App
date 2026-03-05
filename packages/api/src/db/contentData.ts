import { ContentServerType } from "@tagapp/utils/types";
import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";

type contentDataDB = Record<string, ContentServerType>;

const contentDataDB_DefaultData: contentDataDB = {};
const contentDataDB: Low<contentDataDB> = await JSONFilePreset(
  "./DB/contentData.json",
  contentDataDB_DefaultData,
);
export { contentDataDB };
