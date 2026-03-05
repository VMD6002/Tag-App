import { CTypeDir, eqSet, SetDifferenceES6 } from "@tagapp/utils";
import { rename } from "node:fs/promises";
import { contentDataDB } from "../db/contentData.js";
import { DecrementTagCount, IncrementTagCount, tagDB } from "../db/tags.js";
import { ORPCError } from "@orpc/server";
import type { DocType } from "../routers/main.js";
import { renameByBasename } from "../lib/fsBaseNameFunctions.js";

export async function setDoc(input: DocType) {
  const NewData = input;

  const OldData = contentDataDB.data[NewData.id];

  if (!OldData)
    throw new ORPCError("NOT_FOUND", {
      message: `Doc with id ${NewData.id} doesn't exist`,
    });

  // To change file Name when content Title is changed
  if (NewData.title !== OldData?.title) {
    switch (OldData.type) {
      case "img":
      case "video":
        await renameByBasename(
          `./media/${CTypeDir[OldData.type]}`,
          OldData.title + "." + OldData.id,
          NewData.title + "." + OldData.id,
        );
        await renameByBasename(
          `./media/${CTypeDir[OldData.type]}/Covers`,
          OldData.title + "." + OldData.id,
          NewData.title + "." + OldData.id,
        );
        if (OldData.type === "video" && OldData.tags.includes("meta:cc"))
          await rename(
            `./media/${CTypeDir[OldData.type]}/Captions/caption.${OldData.title}.${OldData.id}.vtt`,
            `./media/${CTypeDir[OldData.type]}/Captions/caption.${NewData.title}.${OldData.id}.vtt`,
          );
        break;
      case "gallery":
      case "audio":
      case "txt":
        await rename(
          `./media/${CTypeDir[OldData.type]}/${OldData.title}.${OldData.id}`,
          `./media/${CTypeDir[OldData.type]}/${NewData.title}.${OldData.id}`,
        );
        break;
    }
  }
  const OldDataTags: Set<string> = new Set(OldData.tags);
  const NewDataTags: Set<string> = new Set(NewData.tags);
  if (!eqSet(OldDataTags, NewDataTags)) {
    // Deleted Tags
    const RemovedTags = SetDifferenceES6(OldDataTags, NewDataTags);
    DecrementTagCount(RemovedTags);
    // Newly Added Tags
    const AddedTags = SetDifferenceES6(NewDataTags, OldDataTags);
    IncrementTagCount(AddedTags);
  }

  const updatedData = {
    ...OldData,
    ...NewData,
  };
  contentDataDB.data[NewData.id] = updatedData;
  await contentDataDB.write();
  await tagDB.write();
  console.log(`Contents of ${NewData.id} Updated`);
  return updatedData;
}
