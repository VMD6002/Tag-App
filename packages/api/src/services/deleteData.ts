import { rm } from "node:fs/promises";
import { contentDataDB } from "../db/contentData.js";
import { DecrementTagCount, tagDB } from "../db/tags.js";
import { ORPCError } from "@orpc/server";
import { rmByBasename } from "../lib/fsBaseNameFunctions.js";
import { ContentServerType } from "@tagapp/utils/types";
import { CTypeDir } from "@tagapp/utils";

export async function deleteData(IdList: string[]) {
  const Deleted: ContentServerType[] = [];
  for await (const ID of IdList) {
    if (!contentDataDB.data[ID])
      throw new ORPCError("BAD_REQUEST", {
        message: `Content with id ${ID} doesn't exist`,
      });
    const data = contentDataDB.data[ID];
    Deleted.push(data);
    delete contentDataDB.data[ID];
  }
  for (const ContentDeleted of Deleted) {
    // Update Tag Count
    DecrementTagCount(ContentDeleted.tags);
    switch (ContentDeleted.type) {
      case "img":
      case "video":
        await rmByBasename(
          `./media/${CTypeDir[ContentDeleted.type]}/.covers`,
          `cover.${ContentDeleted.title}.${ContentDeleted.id}`,
        );
        await rmByBasename(
          `./media/${CTypeDir[ContentDeleted.type]}`,
          `${ContentDeleted.title}.${ContentDeleted.id}`,
        );
        if (ContentDeleted.tags.includes("meta:caption"))
          await rm(
            `./media/${CTypeDir[ContentDeleted.type]}/.captions/caption.${ContentDeleted.title}.${ContentDeleted.id}.vtt`,
            {
              force: true,
            },
          );
        console.log(
          `Removed ${ContentDeleted.title} from ${ContentDeleted.type}`,
        );
        break;
      case "gallery":
      case "audio":
      case "txt":
        await rm(
          `./media/${CTypeDir[ContentDeleted.type]}/${ContentDeleted.title}.${ContentDeleted.id}`,
          {
            recursive: true,
            force: true,
          },
        );
        console.log(
          `Removed ${ContentDeleted.title} from ${ContentDeleted.type}`,
        );
        break;
    }
  }
  await contentDataDB.write();
  await tagDB.write();
  console.log("Changes Written TO DB");
  return IdList;
}
