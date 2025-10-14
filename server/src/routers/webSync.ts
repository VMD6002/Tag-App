import { os } from "@orpc/server";
import { readFile, writeFile } from "node:fs/promises";
import z from "zod";
import type { ContentJsonType } from "../types/global.js";

const webContentDataFileName = "./webSync/contentData.json";
export const getContentData = os.handler(async () => {
  console.log("Web ContentData requested");
  try {
    const webContent: Record<string, ContentJsonType> = await readFile(
      webContentDataFileName,
      "utf-8"
    ).then(JSON.parse);
    return webContent;
  } catch {
    await writeFile(webContentDataFileName, "{}");
    return {};
  }
});
export const setContentData = os
  .input(z.string())
  .handler(async ({ input }) => {
    await writeFile(webContentDataFileName, input);
  });

const webTagsValidator = z.object({
  tags: z.record(
    z.string(),
    z.object({
      Count: z.number(),
      CoverUrl: z.string().optional(),
    })
  ),
  tagParents: z.string().array(),
});

type tagAndtagParents = z.infer<typeof webTagsValidator>;

const webTagsFileName = "./webSync/tagData.json";
export const getTags = os.handler(async () => {
  console.log("Web ContentData requested");
  try {
    const webTags: tagAndtagParents = await readFile(
      webTagsFileName,
      "utf-8"
    ).then(JSON.parse);
    return webTags;
  } catch {
    await writeFile(webTagsFileName, '{"tagParents":[],"tags":{}}');
    return { tagParents: [], tags: {} };
  }
});
export const setTags = os.input(webTagsValidator).handler(async ({ input }) => {
  await writeFile(webTagsFileName, JSON.stringify(input));
});
