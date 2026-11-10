import { computeTagCounts, parentOf } from "@tagapp/utils";
import type { ParentTagsType, TagsType } from "@tagapp/utils/types";
import { JSONFilePreset } from "lowdb/node";
import { contentDataDB } from "./contentData";

const tagDB_DefaultData = {
  parentTags: {} as ParentTagsType,
  tags: {} as TagsType,
};
const tagDB = await JSONFilePreset("./DB/tags.json", tagDB_DefaultData);

const DecrementTagCount = (tags: Iterable<string>) => {
  for (const tag of tags) {
    const entry = tagDB.data.tags[tag];
    if (entry) entry.count = Math.max(0, entry.count - 1);
  }
};

const IncrementTagCount = (tags: Iterable<string>) => {
  for (const tag of tags) {
    const entry = tagDB.data.tags[tag] ?? { count: 0 };
    entry.count += 1;
    tagDB.data.tags[tag] = entry;
    tagDB.data.parentTags[parentOf(tag)] ??= {};
  }
};

const recountTags = () => {
  const result = computeTagCounts(
    Object.values(contentDataDB.data),
    tagDB.data.tags,
    tagDB.data.parentTags,
  );
  tagDB.data.tags = result.tags;
  tagDB.data.parentTags = result.parentTags;
};

export { DecrementTagCount, IncrementTagCount, recountTags, tagDB };
