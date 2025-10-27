import { rm, rename } from "node:fs/promises";
import { getSyncData } from "./getSyncData.js";
import { contentDataDB, type contentData } from "../db/contentData.js";
import { IncrementTagCount, tagDB } from "../db/tags.js";

const CTypeDir = {
  img: "./Images",
  gif: "./Images",
  video: "./Videos",
  ImgSet: "./ImgSets",
  VideoSet: "./VideoSets",
};

export async function syncContent() {
  const Data = (await getSyncData()) as Record<string, contentData>;
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
        if (content.ext[2])
          await rename(
            `./Sync/${File}`,
            `./media/${CTypeDir[content.Type]}/Covers/caption.${
              content.Title
            }.vtt`
          );
        break;
      case "ImgSet":
      case "VideoSet":
        await rename(
          `./Sync/${content.Title}.${content.Type}`,
          `./media/${CTypeDir[content.Type]}/${content.Title}`
        );
        break;
      default:
        continue;
    }
    await rm(`./Sync/${content.Title}.json`, { recursive: true });
  }
  await contentDataDB.write();
  await tagDB.write();
  console.log("Data Synced");
  return "Data Synced";
}
