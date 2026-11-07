import type { ParentTagsType, TagsType } from "./types";

const parentOf = (tag: string) => tag.split(":")[0]!;

// Rebuild every tag count and parentTags from content; keeps covers and zero-count tags.
// A tag duplicated within one item counts once. Does not mutate its inputs.
export const computeTagCounts = (
  contents: Iterable<{ tags: string[] }>,
  tags: TagsType,
  parentTags: ParentTagsType,
) => {
  const counted: TagsType = {};
  const parents: ParentTagsType = {};
  for (const content of contents) {
    for (const tag of new Set(content.tags)) {
      counted[tag] = { count: (counted[tag]?.count ?? 0) + 1 };
      parents[parentOf(tag)] = {};
    }
  }
  for (const tag in tags)
    counted[tag] = { ...tags[tag], count: counted[tag]?.count ?? 0 };
  return { tags: counted, parentTags: { ...parents, ...parentTags } };
};
