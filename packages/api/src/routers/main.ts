import { tagDB } from "../db/tags.js";
import queryContent, { queryValidator } from "../lib/queryContent.js";
import { bulkUpdate as bulkUpdateTags } from "../services/bulkUpdate.js";
import { deleteData as deleteDocs } from "../services/deleteData.js";
import { getDoc as get } from "../services/getDoc.js";
import { setDoc as set } from "../services/setDoc.js";
import { syncContent } from "../services/syncContent.js";
import { os } from "@orpc/server";
import z from "zod";

// TODO: Setup getSyncData for editing functionality before syncing it up
import { getSyncData as gtSyncData } from "../services/getSyncData.js";
import { contentDataDB } from "../db/contentData.js";
export const getSyncData = os.handler(gtSyncData);

export const sync = os.handler(syncContent);

const docValidator = z.object({
  id: z.string(),
  title: z.string(),
  tags: z.string().array(),
  extraData: z.string(),
});

export type DocType = z.infer<typeof docValidator>;

export const setDoc = os
  .input(docValidator)
  .handler(async ({ input }) => await set(input));

export const setCover = os
  .input(
    z.object({
      coverPath: z.string().optional(),
      id: z.string(),
      name: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    contentDataDB.data[input.id]!.cover = input.coverPath;
    await contentDataDB.write();
    console.log(`Succefully updated Cover of ${input.name}`);
    return input;
  });

export const bulkUpdate = os
  .input(
    z.object({
      ids: z.array(z.string()),
      added: z.array(z.string()),
      removed: z.array(z.string()),
    }),
  )
  .handler(async ({ input }) => await bulkUpdateTags(input));

export const deleteData = os
  .input(z.string().array())
  .handler(async ({ input }) => await deleteDocs(input));

export const getData = os.input(queryValidator).handler(async ({ input }) => {
  console.log("Data requested");
  const FilteredData = queryContent(input);
  return FilteredData;
});

export const getDoc = os
  .input(z.string())
  .handler(async ({ input }) => await get(input));

export const getServerTags = os.handler(async () => {
  const Data = tagDB.data;
  return Data;
});
