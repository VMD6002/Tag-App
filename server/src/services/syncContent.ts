import { rm, rename } from "node:fs/promises";
import { getSyncData } from "./getSyncData.js";
import type { IndividualContentDataType } from "../schemas/contentData.js";
import { contentDataDB } from "../db/contentData.js";
import { IncrementTagCount, tagDB } from "../db/tags.js";

const CTypeDir = {
  img: "./Images",
  gif: "./Images",
  video: "./Videos",
};

export async function syncContent() {
  const Data = (await getSyncData()) as Record<
    string,
    IndividualContentDataType
  >;
  for (const id in Data) {
    const content = Data[id];
    contentDataDB.data[content.id] = content;
    IncrementTagCount(content.Tags);
    const CoverFile = `cover.${content.Title}.${content.ext[0]}`;
    const File = `${content.Title}.${content.ext[1]}`;

    switch (content.Type) {
      case "img":
      case "video":
        await rename(
          `./Sync/${CoverFile}`,
          `./media/${CTypeDir[content.Type]}/Covers/${CoverFile}`
        );
        await rename(
          `./Sync/${File}`,
          `./media/${CTypeDir[content.Type]}/${File}`
        );
        await rm(`./Sync/${content.Title}.json`);
        break;
      case "ImgSet":
        await rename(
          `./Sync/${content.Title}.ImgSet`,
          `./media/ImgSets/${content.Title}`
        );
        await rm(`./Sync/${content.Title}.json`);
        break;
      case "VideoSet":
        await rename(
          `./Sync/${content.Title}.VideoSet`,
          `./media/VideoSets/${content.Title}`
        );
        await rm(`./Sync/${content.Title}.json`);
        break;
    }
  }
  await contentDataDB.write();
  await tagDB.write();
  console.log("Data Synced");
  return "Data Synced";
}
