import { ORPCError, os } from "@orpc/server";
import z from "zod";

import { tagDB } from "../db/tags.js";
import { contentDataDB } from "../db/contentData.js";
import { settingsDB } from "../db/settings.js";
import {
  ContentWebBaseSchema,
  ContentWebSchema,
  ContentWebType,
  FilterQuerySchema,
} from "@tagapp/utils/types";
import {
  filterData,
  replaceWithConstantKey,
  sanitizeStringForFileName,
} from "@tagapp/utils";

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

    const oldDetails = contentDataDB.data[input.id];

    let newContent: ContentWebType;
    if (!oldDetails) {
      input.tags.forEach((tag) => {
        tagDB.data[tag] ??= 0;
        tagDB.data[tag]++;
      });
      newContent = {
        ...input,
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
    const deletedTags = oldDetails.tags.filter((a) => !input.tags.includes(a));
    deletedTags.forEach((tag) => {
      if (tagDB.data[tag]) tagDB.data[tag]--;
      else delete tagDB.data[tag];
    });

    // Handle Added Tags
    const addedTags = input.tags.filter((a) => !oldDetails.tags.includes(a));
    addedTags.forEach((tag) => {
      tagDB.data[tag] ??= 0;
      tagDB.data[tag]++;
    });

    newContent = {
      ...oldDetails,
      ...input,
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
  .input(z.record(z.string(), z.any()))
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
    input.ids.forEach((id) => {
      const contentDetails = contentDataDB.data[id];

      if (!contentDetails)
        throw new ORPCError("BAD_REQUEST", {
          message: `Content with id ${id} doesn't exist`,
        });

      input.removed.forEach((tag) => {
        if (tagDB.data[tag]) tagDB.data[tag]--;
        else delete tagDB.data[tag];
      });
      contentDetails.tags = contentDetails.tags.filter(
        (tag) => !input.removed.includes(tag),
      );

      input.added.forEach((tag) => {
        tagDB.data[tag] ??= 0;
        tagDB.data[tag]++;
      });
      contentDetails.tags = [
        ...new Set([...contentDetails.tags, ...input.added]),
      ];
    });

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
      contentDetails.tags.forEach((tag) => {
        if (tagDB.data[tag]) tagDB.data[tag]--;
        else delete tagDB.data[tag];
      });
      delete contentDataDB.data[id];
    });

    await contentDataDB.write();
    await tagDB.write();
    return removed;
  });

export const getServerTags = os.handler(async () => {
  const Data = tagDB.data;
  return Data;
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
