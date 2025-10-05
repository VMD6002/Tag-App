import { contentDataDB } from "../db/contentData.js";
import errorLog from "../lib/errorLog.js";
import { ORPCError, os } from "@orpc/server";
import { readdir } from "node:fs/promises";
import z from "zod";

async function getVideoCoverFiles(VideoSetName: string, Videos: string[]) {
  const Temp = new Set(Videos);
  const Images: any = {};
  const CoverFiles = new Set(
    await readdir(`./media/VideoSets/${VideoSetName}/covers`)
  );
  CoverFiles.forEach((coverFile) => {
    Temp.forEach((a) => {
      const Name = a.split(".").slice(0, -1).join(".");
      if (coverFile.slice(6).startsWith(Name)) {
        Images[a] = coverFile;
        Temp.delete(a);
        CoverFiles.delete(coverFile);
      }
    });
  });
  Images.extra = [...CoverFiles];
  return Images;
}

export const getVideos = os.input(z.string()).handler(async ({ input }) => {
  const name = input;
  if (!name) {
    throw new ORPCError("NOT_ACCEPTABLE", {
      message: `Blank VideoSet Name`,
    });
  }
  try {
    const Videos = (await readdir(`./media/VideoSets/${name}`))
      .filter((j) => j !== "covers")
      .sort();
    const CoverFiles = await getVideoCoverFiles(name, Videos);
    return { Videos, CoverFiles };
  } catch (error) {
    errorLog(error);
    throw new ORPCError("NOT_FOUND", {
      message: `VideoSet with name ${name} doesn't exist`,
    });
  }
});

export const setCover = os
  .input(z.object({ ImgFile: z.string(), id: z.string(), Name: z.string() }))
  .handler(async ({ input }) => {
    contentDataDB.data[input.id].ext[0] = input.ImgFile;
    await contentDataDB.write();
    console.log(`Succefully updated Cover of ${input.Name}`);
    return `Succefully updated Cover of ${input.Name}`;
  });
