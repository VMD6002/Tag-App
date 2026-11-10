import { ORPCError, os } from "@orpc/server";
import { parentOf } from "@tagapp/utils";
import z from "zod";
import { contentDataDB } from "../db/contentData";
import { recountTags, tagDB } from "../db/tags";

// Strip the given tags from every content item so no item references a removed tag.
const stripTagsFromContent = (shouldRemove: (tag: string) => boolean) => {
  const now = Math.floor(Date.now() / 1000);
  for (const content of Object.values(contentDataDB.data)) {
    if (!content.tags.some(shouldRemove)) continue;
    content.tags = content.tags.filter((t) => !shouldRemove(t));
    content.lastUpdated = now;
  }
};

export const getTagData = os.handler(async () => {
  return tagDB.data;
});

export const setTagCover = os
  .input(
    z.object({
      tag: z.string(),
      cover: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const tag = tagDB.data.tags[input.tag];
    if (!tag)
      throw new ORPCError("NOT_FOUND", {
        message: `Tag ${input.tag} doesn't exist`,
      });
    tag.cover = input.cover;
    await tagDB.write();
    return input;
  });

export const addTags = os
  .input(z.object({ tags: z.array(z.string()) }))
  .handler(async ({ input: { tags } }) => {
    for (const tag of tags) tagDB.data.tags[tag] ??= { count: 0 };
    await tagDB.write();
    return tags;
  });

export const addParentTags = os
  .input(z.object({ parentTags: z.array(z.string()) }))
  .handler(async ({ input: { parentTags } }) => {
    parentTags.forEach((parentTag) => {
      if (!tagDB.data.parentTags[parentTag])
        tagDB.data.parentTags[parentTag] = {};
    });
    await tagDB.write();
    return parentTags;
  });

export const removeTags = os
  .input(z.object({ tags: z.array(z.string()) }))
  .handler(async ({ input: { tags } }) => {
    for (const tag of tags) delete tagDB.data.tags[tag];
    stripTagsFromContent((tag) => tags.includes(tag));
    await Promise.all([tagDB.write(), contentDataDB.write()]);
    return tags;
  });

export const removeParentTags = os
  .input(z.object({ parentTags: z.array(z.string()) }))
  .handler(async ({ input: { parentTags } }) => {
    for (const tag in tagDB.data.tags)
      if (parentTags.includes(parentOf(tag))) delete tagDB.data.tags[tag];
    for (const parentTag of parentTags) delete tagDB.data.parentTags[parentTag];
    stripTagsFromContent((tag) => parentTags.includes(parentOf(tag)));
    await Promise.all([tagDB.write(), contentDataDB.write()]);
    return tagDB.data;
  });

export const fixTagCount = os.handler(async () => {
  recountTags();
  await tagDB.write();
  return tagDB.data;
});
