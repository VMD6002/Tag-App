import { ORPCError, os } from "@orpc/server";
import { readdir } from "node:fs/promises";
import z from "zod";
import errorLog from "../lib/errorLog.js";
import { contentDataDB } from "../db/contentData.js";

export const getImages = os.input(z.string()).handler(async ({ input }) => {
  if (!input) {
    throw new ORPCError("NOT_ACCEPTABLE", {
      message: "Blank ImgSet name",
    });
  }
  try {
    const Images = (await readdir(`./media/ImgSets/${input}`)).sort();
    return Images;
  } catch (error) {
    errorLog(error);
    throw new ORPCError("NOT_FOUND", {
      message: `ImgSet with name ${input} doesn't exist`,
    });
  }
});

export const setCover = os
  .input(z.object({ ImgFile: z.string(), id: z.string(), Name: z.string() }))
  .handler(async ({ input }) => {
    contentDataDB.data[input.id].ext[0] = input.ImgFile;
    await contentDataDB.write();
    console.log(`Succefully updated Cover of ${input.Name}`);
    return "Succefully updated Cover of ${input.Name}";
  });
