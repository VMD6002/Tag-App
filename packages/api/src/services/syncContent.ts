import { rm, rename } from "node:fs/promises";
import { getSyncData } from "./getSyncData.js";
import { contentDataDB } from "../db/contentData.js";
import { IncrementTagCount, tagDB } from "../db/tags.js";
import { CTypeDir } from "@tagapp/utils";

export async function syncContent() {
  const Data = await getSyncData();
  for (const id in Data) {
    const content = Data[id]!;

    const { ext, ...data } = content;
    contentDataDB.data[content.id] = data;
    IncrementTagCount(content.tags);
    const coverFile = `cover.${content.title}.${content.id}.${content.ext[0]}`;
    const file = `${content.title}.${content.id}.${content.ext[2]}`;

    switch (content.type) {
      case "img":
      case "video":
        await rename(
          `./Sync/${coverFile}`,
          `./media/${CTypeDir[content.type]}/Covers/${coverFile}`,
        );
        await rename(
          `./Sync/${file}`,
          `./media/${CTypeDir[content.type]}/${file}`,
        );
        if (content.tags.includes("meta:cc"))
          await rename(
            `./Sync/${content.title}.${content.id}.vtt`,
            `./media/${CTypeDir[content.type]}/Covers/caption.${
              content.title
            }.${content.id}.vtt`,
          );
        break;
      case "gallery":
      case "audio":
      case "txt":
        await rename(
          `./Sync/${content.title}.${content.id}.${content.type}`,
          `./media/${CTypeDir[content.type]}/${content.title}.${content.id}`,
        );
        contentDataDB.data[content.id] = {
          ...data,
          cover: content.ext[0],
        };
        break;
      default:
        continue;
    }
    await rm(`./Sync/${content.title}.${content.id}.json`, { recursive: true });
  }
  await contentDataDB.write();
  await tagDB.write();
  console.log("Data Synced");
  return "Data Synced";
}
