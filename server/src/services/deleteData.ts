import { CTypeDir } from "../lib/constants.js";
import { rm } from "node:fs/promises";
import type { IndividualContentDataType } from "../schemas/contentData.js";
import { contentDataDB } from "../db/contentData.js";
import { DecrementTagCount, tagDB } from "../db/tags.js";

export async function deleteData(IdList: string[]) {
  const Deleted: IndividualContentDataType[] = [];
  for await (const ID of IdList) {
    if (!contentDataDB.data[ID]) {
      return `Content wiht ID ${ID} not found while deleting`;
    }
    const data = contentDataDB.data[ID];
    Deleted.push(data);
    delete contentDataDB.data[ID];
  }
  for (const ContentDeleted of Deleted) {
    // Update Tag Count
    DecrementTagCount(ContentDeleted.Tags);
    switch (ContentDeleted.Type) {
      case "img":
      case "video":
        const CoverFilePath = `./media/${
          CTypeDir[ContentDeleted.Type]
        }/Covers/cover.${ContentDeleted.Title}.${ContentDeleted.ext[0]}`;
        await rm(CoverFilePath);

        const FilePath = `./media/${CTypeDir[ContentDeleted.Type]}/${
          ContentDeleted.Title
        }.${ContentDeleted.ext[1]}`;
        await rm(FilePath);

        console.log(
          `Removed ./${CTypeDir[ContentDeleted.Type]}/${ContentDeleted.Title}.${
            ContentDeleted.ext[1]
          }`
        );
        break;
      case "ImgSet":
        await rm(`./media/ImgSets/${ContentDeleted.Title}`, {
          recursive: true,
          force: true,
        });
        console.log(`Removed image set ${ContentDeleted.Title}`);
        break;
      case "VideoSet":
        await rm(`./media/VideoSets/${ContentDeleted.Title}`, {
          recursive: true,
          force: true,
        });
        console.log(`Removed video set ${ContentDeleted.Title}`);
        break;
    }
  }
  await contentDataDB.write();
  await tagDB.write();
  console.log("Changes Written TO DB");
  return "Exterminated it, EXTERMINATED!";
}
