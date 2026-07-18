import type { ParentTagsType, TagsType } from "@tagapp/utils/types";
import errorLog from "../lib/errorLog";
import { JSONFilePreset } from "lowdb/node";

const tagDB_DefaultData = {
  parentTags: {} as ParentTagsType,
  tags: {} as TagsType,
};
const tagDB = await JSONFilePreset("./DB/tags.json", tagDB_DefaultData);

const DecrementTagCount = (tags: string[] | Set<string>) => {
  try {
    const tagsArray = Array.from(tags);
    tagsArray.forEach((tag) => {
      if (!tagDB.data.tags[tag]) {
        console.log(`Tag "${tag}" not found. No update performed.`);
        return;
      }
      const newCount = tagDB.data.tags[tag]!.count - 1;
      tagDB.data.tags[tag]!.count = newCount;
      console.log(`Decrement: New Count = ${newCount}, Tag = ${tag}`);
    });
    tagsArray.length && console.log("All tag decrement operations completed.");
  } catch (batchError) {
    errorLog(batchError);
  }
};

const IncrementTagCount = (tags: string[] | Set<string>) => {
  try {
    const tagsArray = Array.from(tags);
    tagsArray.forEach((tag) => {
      const newCount = (tagDB.data.tags[tag]?.count ?? 0) + 1;
      if (!tagDB.data.tags[tag]) {
        tagDB.data.tags[tag] = { count: newCount };
        console.log(`New tag created: ${tag}`);
      } else {
        tagDB.data.tags[tag]!.count = newCount;
        console.log(`Increment: New Count = ${newCount}, Tag = ${tag}`);
      }
    });
    tagsArray.length && console.log("All tag decrement operations completed.");
  } catch (batchError) {
    errorLog(batchError);
  }
};
export { tagDB, IncrementTagCount, DecrementTagCount };
