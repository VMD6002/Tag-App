import { os } from "@orpc/server";
import { contentWebSchema, ContentWebType } from "@tagapp/utils/types";
import z from "zod";
import { readJSON, writeJSON } from "fs-extra/esm";

const webContentDataFilePath = "./webSync/contentData.json";
export const getContentData = os.handler(async () => {
  console.log("Web ContentData requested");
  try {
    const webContent: Record<string, ContentWebType> = await readJSON(
      webContentDataFilePath,
    );
    return webContent;
  } catch {
    await writeJSON(webContentDataFilePath, {});
    return {};
  }
});
export const setContentData = os
  .input(z.record(z.string(), contentWebSchema))
  .handler(async ({ input }) => {
    await writeJSON(webContentDataFilePath, input);
  });

const webTagsValidator = z.object({
  tags: z.record(
    z.string(),
    z.object({
      Count: z.number(),
      CoverUrl: z.string().optional(),
    }),
  ),
  tagParents: z.string().array(),
});

type tagAndtagParents = z.infer<typeof webTagsValidator>;

const webTagsFilePath = "./webSync/tagData.json";
export const getTags = os.handler(async () => {
  console.log("Web ContentData requested");
  try {
    const webTags: tagAndtagParents = await readJSON(webTagsFilePath);
    return webTags;
  } catch {
    await writeJSON(webTagsFilePath, { tagParents: [], tags: {} });
    return { tagParents: [], tags: {} };
  }
});
export const setTags = os.input(webTagsValidator).handler(async ({ input }) => {
  await writeJSON(webTagsFilePath, input);
});
