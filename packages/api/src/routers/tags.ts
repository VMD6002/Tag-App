import { os } from "@orpc/server";
import z from "zod";
import { DecrementTagCount, tagDB } from "../db/tags";
import { contentDataDB } from "../db/contentData";
import errorLog from "../lib/errorLog";
import { ParentTagsType, TagsType } from "@tagapp/utils/types";

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
    tagDB.data.tags[input.tag]!.cover = input.cover;
    await tagDB.write();
    return input;
  });

export const addTags = os
  .input(z.object({ tags: z.array(z.string()) }))
  .handler(async ({ input: { tags } }) => {
    try {
      const tagsArray = Array.from(tags);
      tagsArray.forEach((tag) => {
        if (!tagDB.data.tags[tag]) {
          tagDB.data.tags[tag] = { count: 0 };
          console.log(`New tag created: ${tag}`);
        }
      });
      tagsArray.length &&
        console.log("All tag decrement operations completed.");
    } catch (batchError) {
      errorLog(batchError);
    }
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
    await tagDB.write();
    return tags;
  });

export const removeParentTags = os
  .input(z.object({ parentTags: z.array(z.string()) }))
  .handler(async ({ input: { parentTags } }) => {
    for (const tag in tagDB.data.tags)
      if (parentTags.includes(tag.split(":")[0]!)) delete tagDB.data.tags[tag];
    for (const parentTag of parentTags) delete tagDB.data.parentTags[parentTag];
    await tagDB.write();
    return tagDB.data;
  });

export const fixTagCount = os.handler(async () => {
  const updateTagData: TagsType = {};
  const updateParentTagData: ParentTagsType = {};
  for (const id in contentDataDB.data) {
    contentDataDB.data[id]!.tags.forEach((tag) => {
      const parentTag = tag.split(":")[0]!;
      if (!tagDB.data.parentTags[parentTag])
        updateParentTagData[parentTag] = {};

      const newCount = (updateTagData[tag]?.count ?? 0) + 1;
      if (!updateTagData[tag]) {
        updateTagData[tag] = { count: newCount };
        console.log(`New tag created: ${tag}`);
      } else {
        updateTagData[tag]!.count = newCount;
        console.log(`Increment: New Count = ${newCount}, Tag = ${tag}`);
      }
    });
  }

  for (const tag in tagDB.data.tags) {
    if (!updateTagData[tag]) {
      updateTagData[tag] = { ...tagDB.data.tags[tag], count: 0 };
    }
  }
  tagDB.data.tags = updateTagData;
  tagDB.data.parentTags = { ...tagDB.data.parentTags, ...updateParentTagData };

  await tagDB.write();
  console.log("Server Tag Count Fixed");
  return tagDB.data;
});
