import { os } from "@orpc/server";
import { contentDataDB } from "../db/contentData";
import { tagDB } from "../db/tags";
import { BackUpSchema } from "@tagapp/utils/types";
import z from "zod";

export const backup = os
  .input(
    z.object({
      type: z.enum(["All", "tags", "contentData"]),
    }),
  )
  .handler(({ input }) => {
    const { type } = input;

    const includeContent = type === "All" || type === "contentData";
    const includeTags = type === "All" || type === "tags";

    return {
      contentData: includeContent ? contentDataDB.data : {},
      tags: includeTags ? tagDB.data.tags : {},
      parentTags: includeTags ? tagDB.data.parentTags : {},
    };
  });

export const restore = os
  .input(
    z.object({
      data: BackUpSchema,
      type: z.enum(["All", "tags", "contentData"]),
      overwrite: z.boolean(),
    }),
  )
  .handler(async ({ input }) => {
    const { type, overwrite, data } = input;

    // Helper to merge or overwrite data based on the flag
    const updateData = (current: any, incoming: any) => {
      return overwrite ? incoming : { ...current, ...incoming };
    };

    const shouldUpdateContent = type === "All" || type === "contentData";
    const shouldUpdateTags = type === "All" || type === "tags";

    if (shouldUpdateContent) {
      contentDataDB.data = updateData(contentDataDB.data, data.contentData);
    }

    if (shouldUpdateTags) {
      tagDB.data.tags = updateData(tagDB.data.tags, data.tags);
      tagDB.data.parentTags = updateData(
        tagDB.data.parentTags,
        data.parentTags,
      );
    }

    await Promise.all([tagDB.write(), contentDataDB.write()]);

    return input;
  });
