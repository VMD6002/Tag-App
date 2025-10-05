import { contentDataDB } from "../db/contentData.js";
import { tagDB } from "../db/tags.js";
import type { Context } from "hono";

export default async function clearDataBase(c: Context) {
  try {
    contentDataDB.data = {};
    tagDB.data = {};
    await contentDataDB.write();
    await tagDB.write();
    return c.text("✅ All tables cleared successfully.");
  } catch (error) {
    console.error("Error clearing all tables:", error);
    return c.text("Error clearing all tables", 500);
  }
}
