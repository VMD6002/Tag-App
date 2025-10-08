import { eqSet, SetDifferenceES6 } from "../lib/HelperFunctions.js";
import { CTypeDir } from "../lib/constants.js";
import { pathExists } from "fs-extra/esm";
import { rename } from "node:fs/promises";
import type { ContentJsonType } from "../schemas/contentData.js";
import { contentDataDB } from "../db/contentData.js";
import { DecrementTagCount, IncrementTagCount, tagDB } from "../db/tags.js";
import { ORPCError } from "@orpc/server";

export async function setDoc(input: ContentJsonType) {
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
          ))
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
        break;
      case "ImgSet":
        if (await pathExists(`./ImgSets/${NewData.Title}`))
          throw new ORPCError("CONFLICT", {
            message: `Confiliction ImgSet with name ${NewData.Title} already exists`,
          });
        await rename(
          `./media/ImgSets/${OldData.Title}`,
          `./media/ImgSets/${NewData.Title}`
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

  contentDataDB.data[NewData.id] = {
    ...NewData,
    LastUpdated: Math.floor(Date.now() / 1000),
    extraData: NewData.extraData,
    Type: OldData.Type,
    ext: OldData.ext,
  };
  await contentDataDB.write();
  await tagDB.write();
  console.log(`Contents of ${NewData.id} Updated`);
  return NewData;
}
