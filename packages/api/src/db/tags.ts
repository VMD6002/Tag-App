import type { ParentTagsType, TagsType } from "@tagapp/utils/types";
import { JSONFilePreset } from "lowdb/node";
import { contentDataDB } from "./contentData";

const tagDB_DefaultData = {
  parentTags: {} as ParentTagsType,
  tags: {} as TagsType,
};
const tagDB = await JSONFilePreset("./DB/tags.json", tagDB_DefaultData);

const parentOf = (tag: string) => tag.split(":")[0]!;

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

// Rebuild every tag count from content; keeps covers and zero-count tags.
const recountTags = () => {
  const counted: TagsType = {};
  const parents: ParentTagsType = {};
  for (const content of Object.values(contentDataDB.data)) {
    for (const tag of new Set(content.tags)) {
      counted[tag] = { count: (counted[tag]?.count ?? 0) + 1 };
      parents[parentOf(tag)] = {};
    }
  }
  for (const tag in tagDB.data.tags)
    counted[tag] = { ...tagDB.data.tags[tag], count: counted[tag]?.count ?? 0 };
  tagDB.data.tags = counted;
  tagDB.data.parentTags = { ...parents, ...tagDB.data.parentTags };
};

export { DecrementTagCount, IncrementTagCount, recountTags, tagDB };
