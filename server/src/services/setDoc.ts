import { eqSet, SetDifferenceES6 } from "../lib/HelperFunctions.js";
import { CTypeDir } from "../lib/constants.js";
import { pathExists } from "fs-extra/esm";
import { rename } from "node:fs/promises";
import { contentDataDB } from "../db/contentData.js";
import { DecrementTagCount, IncrementTagCount, tagDB } from "../db/tags.js";
import { ORPCError } from "@orpc/server";
import type { DocType } from "../routers/main.js";

export async function setDoc(input: DocType) {
  const NewData = input;

  const OldData = contentDataDB.data[NewData.id];

  if (!OldData)
    throw new ORPCError("NOT_FOUND", {
      message: `Doc with id ${NewData.id} doesn't exist`,
    });

  // To chnage file Name when content Title is changed
  if (NewData.Title !== OldData?.Title) {
    switch (OldData.Type) {
      case "img":
      case "video":
        if (
          (await pathExists(
            `./media/${CTypeDir[OldData.Type]}/Covers/cover.${NewData.Title}.${
              OldData.ext[0]
            }`
          )) ||
          (await pathExists(
            `./media/${CTypeDir[OldData.Type]}/${NewData.Title}.${
              OldData.ext[1]
            }`
          )) ||
          (OldData.ext[2] &&
            (await pathExists(
              `./media/${CTypeDir[OldData.Type]}/Captions/caption.${
                NewData.Title
              }.vtt`
            )))
        )
          throw new ORPCError("CONFLICT", {
            message: `Confiliction file with name ${NewData.Title} already exists`,
          });
        await rename(
          `./media/${CTypeDir[OldData.Type]}/Covers/cover.${OldData.Title}.${
            OldData.ext[0]
          }`,
          `./media/${CTypeDir[OldData.Type]}/Covers/cover.${NewData.Title}.${
            OldData.ext[0]
          }`
        );
        await rename(
          `./media/${CTypeDir[OldData.Type]}/${OldData.Title}.${
            OldData.ext[1]
          }`,
          `./media/${CTypeDir[OldData.Type]}/${NewData.Title}.${OldData.ext[1]}`
        );
        if (OldData.ext[2])
          await rename(
            `./media/${CTypeDir[OldData.Type]}/Captions/caption.${
              OldData.Title
            }.vtt`,
            `./media/${CTypeDir[OldData.Type]}/Captions/caption.${
              NewData.Title
            }.vtt`
          );
        break;
      case "ImgSet":
        if (await pathExists(`./ImgSets/${NewData.Title}`))
          throw new ORPCError("CONFLICT", {
            message: `ImgSet with name ${NewData.Title} already exists`,
          });
        await rename(
          `./media/ImgSets/${OldData.Title}`,
          `./media/ImgSets/${NewData.Title}`
        );
        break;
      case "VideoSet":
        if (await pathExists(`./VideoSets/${NewData.Title}`))
          throw new ORPCError("CONFLICT", {
            message: `VideoSets with name ${NewData.Title} already exists`,
          });
        await rename(
          `./media/VideoSets/${OldData.Title}`,
          `./media/VideoSets/${NewData.Title}`
        );
        break;
    }
  }
  const OldDataTags: Set<string> = new Set(OldData.Tags);
  const NewDataTags: Set<string> = new Set(NewData.Tags);
  if (!eqSet(OldDataTags, NewDataTags)) {
    // Deleted Tags
    const RemovedTags = SetDifferenceES6(OldDataTags, NewDataTags);
    DecrementTagCount(RemovedTags);
    // Newly Added Tags
    const AddedTags = SetDifferenceES6(NewDataTags, OldDataTags);
    IncrementTagCount(AddedTags);
  }

  const updatedData = {
    ...NewData,
    LastUpdated: Math.floor(Date.now() / 1000),
    Added: OldData.Added,
    Type: OldData.Type,
    ext: OldData.ext,
  };
  contentDataDB.data[NewData.id] = updatedData;
  await contentDataDB.write();
  await tagDB.write();
  console.log(`Contents of ${NewData.id} Updated`);
  return updatedData;
}
