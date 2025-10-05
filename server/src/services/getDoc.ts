import { contentDataDB } from "../db/contentData.js";
import { ORPCError } from "@orpc/server";

export async function getDoc(id: string) {
  if (!id) throw new ORPCError("BAD_REQUEST");

  const Data = contentDataDB.data[id];

  if (!Data) throw new ORPCError("NOT_FOUND");

  console.log(`${id} data requested`);
  return Data;
}
