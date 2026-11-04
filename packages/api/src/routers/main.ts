import { ORPCError, os } from "@orpc/server";
import {
  filterData,
  replaceWithConstantKey,
  sanitizeStringForFileName,
} from "@tagapp/utils";
import {
  ContentWebBaseSchema,
  ContentWebSchema,
  type ContentWebType,
  FilterQuerySchema,
} from "@tagapp/utils/types";
import z from "zod";
import { contentDataDB } from "../db/contentData";
import { settingsDB } from "../db/settings";
import { DecrementTagCount, IncrementTagCount, tagDB } from "../db/tags";
import { runPersonalScript } from "../lib/runJsStringCode";

const DocSchema = ContentWebSchema.extend({
  added: z.undefined(),
  lastUpdated: z.undefined(),
});

export type DocType = z.infer<typeof DocSchema>;

export const setContent = os
  .input(ContentWebBaseSchema)
  .handler(async ({ input }) => {
    const { sanitizeTitleOnSave, replaceWithKeyOnUpdate, constants } =
      settingsDB.data;

    const Time = Math.floor(Date.now() / 1000);

    const title = sanitizeTitleOnSave
      ? sanitizeStringForFileName(input.title)
      : input.title.trim();
    const cover =
      input.cover && replaceWithKeyOnUpdate
        ? replaceWithConstantKey(input.cover, constants)
        : input.cover;

    const tags = [...new Set(input.tags)];
    const oldDetails = contentDataDB.data[input.id];

    let newContent: ContentWebType;
    if (!oldDetails) {
      IncrementTagCount(tags);
      newContent = {
        ...input,
        tags,
        title,
        cover,
        added: Time,
        lastUpdated: Time,
      };
      contentDataDB.data[input.id] = newContent;
      await contentDataDB.write();
      await tagDB.write();
      return newContent;
    }

    // Handle Removed Tags
    const removedTags = oldDetails.tags.filter((a) => !tags.includes(a));
    DecrementTagCount(removedTags);

    // Handle Added Tags
    const addedTags = tags.filter((a) => !oldDetails.tags.includes(a));
    IncrementTagCount(addedTags);

    newContent = {
      ...oldDetails,
      ...input,
      tags,
      title,
      cover,
      lastUpdated: Time,
    };

    contentDataDB.data[newContent.id] = newContent;
    await contentDataDB.write();
    await tagDB.write();
    return newContent;
  });

export const setSettings = os
  .input(
    z
      .object({
        replaceWithKeyOnUpdate: z.boolean(),
        sanitizeTitleOnSave: z.boolean(),
        constants: z.record(z.string(), z.string()),
      })
      .partial(),
  )
  .handler(async ({ input }) => {
    settingsDB.data = { ...settingsDB.data, ...input };
    await settingsDB.write();
    return settingsDB.data;
  });

export const bulkUpdateContentTags = os
  .input(
    z.object({
      ids: z.string().array(),
      added: z.string().array(),
      removed: z.string().array(),
    }),
  )
  .handler(async ({ input }) => {
    // Validate first so a bad id can't leave counts half-updated.
    for (const id of input.ids)
      if (!contentDataDB.data[id])
        throw new ORPCError("BAD_REQUEST", {
          message: `Content with id ${id} doesn't exist`,
        });

    for (const id of new Set(input.ids)) {
      const content = contentDataDB.data[id]!;
      const removed = input.removed.filter((t) => content.tags.includes(t));
      content.tags = content.tags.filter((t) => !removed.includes(t));
      const added = [...new Set(input.added)].filter(
        (t) => !content.tags.includes(t),
      );
      content.tags.push(...added);
      DecrementTagCount(removed);
      IncrementTagCount(added);
    }

    await contentDataDB.write();
    await tagDB.write();
    return input;
  });

export const removeContents = os
  .input(z.object({ ids: z.string().array() }))
  .handler(async ({ input }) => {
    const removed: ContentWebType[] = [];

    input.ids.forEach((id) => {
      const contentDetails = contentDataDB.data[id];
      if (!contentDetails) return;
      removed.push(contentDetails);
      DecrementTagCount(contentDetails.tags);
      delete contentDataDB.data[id];
    });

    await contentDataDB.write();
    await tagDB.write();
    return removed;
  });

export const getSettings = os.handler(async () => {
  return settingsDB.data;
});

export const getContent = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return contentDataDB.data[input.id];
  });

export const getFilteredData = os
  .input(FilterQuerySchema)
  .handler(async ({ input }) => {
    return filterData(input, contentDataDB.data);
  });

export const runUserCode = os
  .input(z.object({ script: z.string(), data: z.any() }))
  .handler(async ({ input }) => {
    return runPersonalScript(input.script, input.data);
  });
