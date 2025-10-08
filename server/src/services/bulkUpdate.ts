import { ORPCError } from "@orpc/server";
import { contentDataDB } from "../db/contentData.js";
import { tagDB } from "../db/tags.js";

export async function bulkUpdate({
  ids,
  added,
  removed,
}: {
  ids: string[];
  added: string[];
  removed: string[];
}) {
  for await (const ID of ids) {
    if (!contentDataDB.data[ID])
      throw new ORPCError("BAD_REQUEST", {
        message: `Content with id ${ID} doesn't exist`,
      });
    for (const tag of added) {
      if (contentDataDB.data[ID].Tags.includes(tag)) continue;
      contentDataDB.data[ID].Tags.push(tag);
      tagDB.data[tag] = (tagDB.data[tag] ?? 0) + 1;
    }
    for (const tag of removed) {
      if (!contentDataDB.data[ID].Tags.includes(tag)) continue;
      contentDataDB.data[ID].Tags = contentDataDB.data[ID].Tags.filter(
        (val) => val !== tag
      );
      if (tagDB.data[tag] > 1) tagDB.data[tag] = tagDB.data[tag] - 1;
      else if (!isNaN(tagDB.data[tag])) delete tagDB.data[tag];
    }
    contentDataDB.data[ID].LastUpdated = Math.floor(Date.now() / 1000);
  }

  if (added.length) console.log("INCREMENTED TAGS:");
  for (const tag of added) console.log(`Count: ${tagDB.data[tag]},Tag: ${tag}`);

  if (removed.length) console.log("DECREMENTED TAGS:");
  for (const tag of removed)
    tagDB.data[tag]
      ? console.log(`Count: ${tagDB.data[tag]},Tag: ${tag}`)
      : console.log(`${tag} REMOVED tags DB`);

  await contentDataDB.write();
  await tagDB.write();
  console.log("Changes Written TO DB");
  return {
    ids,
    added,
    removed,
  };
}
