import { ORPCError, os } from "@orpc/server";
import {
  ContentWebBaseSchema,
  ContentWebType,
  FilterQuerySchema,
} from "@tagapp/utils/types";
import { store } from ".";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "../main/atoms/constants";
import { tagsAtom } from "../main/atoms/tags";
import {
  filterData,
  replaceWithConstantKey,
  sanitizeStringForFileName,
} from "@tagapp/utils";
import z from "zod";
import { contentDataAtom } from "../main/atoms";
import { sanitizeTitleAtom } from "../main/atoms/settings";

export const setContent = os
  .input(ContentWebBaseSchema)
  .handler(async ({ input }) => {
    const santizeTitle = await store.get(sanitizeTitleAtom);
    const replaceWithKeyOnUpdate = await store.get(replaceWithKeyOnUpdateAtom);
    const constants = await store.get(constantsAtom);

    const contentData = await store.get(contentDataAtom);
    const tagsData = await store.get(tagsAtom);

    const Time = Math.floor(Date.now() / 1000);

    const title = santizeTitle
      ? sanitizeStringForFileName(input.title)
      : input.title.trim();
    const cover =
      input.cover && replaceWithKeyOnUpdate
        ? replaceWithConstantKey(input.cover, constants)
        : input.cover;

    const oldDetails = contentData[input.id];

    let newContent: ContentWebType;
    if (!oldDetails) {
      input.tags.forEach((tag) => {
        tagsData[tag] ??= { Count: 0 };
        tagsData[tag].Count++;
      });
      newContent = {
        ...input,
        title,
        cover,
        added: Time,
        lastUpdated: Time,
      };
      contentData[input.id] = newContent;
      await store.set(contentDataAtom, contentData);
      await store.set(tagsAtom, tagsData);
      return newContent;
    }

    // Handle Removed Tags
    const deletedTags = oldDetails.tags.filter((a) => !input.tags.includes(a));
    deletedTags.forEach((tag) => {
      if (tagsData[tag]) tagsData[tag].Count--;
    });

    // Handle Added Tags
    const addedTags = input.tags.filter((a) => !oldDetails.tags.includes(a));
    addedTags.forEach((tag) => {
      tagsData[tag] ??= { Count: 0 };
      tagsData[tag].Count++;
    });

    newContent = {
      ...oldDetails,
      ...input,
      title,
      cover,
      lastUpdated: Time,
    };

    contentData[newContent.id] = newContent;

    await store.set(contentDataAtom, contentData);
    await store.set(tagsAtom, tagsData);
    return newContent;
  });

export const removeContents = os
  .input(z.object({ ids: z.string().array() }))
  .handler(async ({ input }) => {
    const contentData = await store.get(contentDataAtom);
    const tagsData = await store.get(tagsAtom);

    const removed: ContentWebType[] = [];

    input.ids.forEach((id) => {
      const contentDetails = contentData[id];
      if (!contentDetails) return;
      removed.push(contentDetails);
      contentDetails.tags.forEach((tag) => {
        if (tagsData[tag]) tagsData[tag].Count--;
      });
      delete contentData[id];
    });

    await store.set(contentDataAtom, contentData);
    await store.set(tagsAtom, tagsData);
    return removed;
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
    const contentData = await store.get(contentDataAtom);
    const tagsData = await store.get(tagsAtom);

    input.ids.forEach((id) => {
      const contentDetails = contentData[id];

      if (!contentDetails)
        throw new ORPCError("BAD_REQUEST", {
          message: `Content with id ${id} doesn't exist`,
        });

      input.removed.forEach((tag) => {
        if (tagsData[tag]) tagsData[tag].Count--;
      });
      contentDetails.tags = contentDetails.tags.filter(
        (tag) => !input.removed.includes(tag),
      );

      input.added.forEach((tag) => {
        tagsData[tag] ??= { Count: 0 };
        tagsData[tag].Count++;
      });
      contentDetails.tags = [
        ...new Set([...contentDetails.tags, ...input.added]),
      ];
    });

    await store.set(contentDataAtom, contentData);
    await store.set(tagsAtom, tagsData);
    return input;
  });

export const getContent = os
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const contentData = await store.get(contentDataAtom);
    return contentData[input.id];
  });

export const getFilteredData = os
  .input(FilterQuerySchema)
  .handler(async ({ input }) => {
    const contentData = await store.get(contentDataAtom);
    return filterData(input, contentData);
  });
