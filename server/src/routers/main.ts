import type { contentData } from "../db/contentData.js";
import { tagDB } from "../db/tags.js";
import queryContent from "../lib/queryContent.js";
import { docValidator, queryValidator } from "../schemas/contentData.js";
import { bulkUpdate as bulkUpdateTags } from "../services/bulkUpdate.js";
import { deleteData as deleteDocs } from "../services/deleteData.js";
import { getDoc as get } from "../services/getDoc.js";
import { getSyncData as gtSyncData } from "../services/getSyncData.js";
import { setDoc as set } from "../services/setDoc.js";
import { syncContent } from "../services/syncContent.js";
import { os } from "@orpc/server";
import z from "zod";

export const getSyncData = os.handler(gtSyncData);

export const sync = os.handler(syncContent);

export const setDoc = os
  .input(docValidator)
  .handler(async ({ input }) => await set(input));

export const bulkUpdate = os
  .input(
    z.object({
      ids: z.array(z.string()),
      added: z.array(z.string()),
      removed: z.array(z.string()),
    })
  )
  .handler(async ({ input }) => await bulkUpdateTags(input));

export const deleteData = os
  .input(z.string().array())
  .handler(async ({ input }) => await deleteDocs(input));

export const getData = os.input(queryValidator).handler(async ({ input }) => {
  console.log("Data requested");
  const FilteredData = queryContent(input) as contentData[];
  return FilteredData;
});

export const getDoc = os
  .input(z.string())
  .handler(async ({ input }) => await get(input));

export const getServerTags = os.handler(async () => {
  const Data = tagDB.data;
  return Data;
});
