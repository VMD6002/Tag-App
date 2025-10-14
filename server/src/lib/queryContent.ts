import z from "zod";
import { contentDataDB, type contentData } from "../db/contentData.js";
import { ArrayHasAll, ArryaHasAnyModified } from "../lib/HelperFunctions.js";
import Fuse from "fuse.js";

export const queryValidator = z.object({
  any: z.string().array(), // 1st array - content with at least one of these tags
  all: z.string().array(), // 2nd array - content with all these tags
  none: z.string().array(), // 3rd array - content without any of these tags
  search: z.string(), // string for title search
  types: z.string().array(), // array of types to include (e.g., ["img", "video"])
  orderByLatest: z.boolean(),
});

export type QueryParams = z.infer<typeof queryValidator>;

function GetSearchIds(ids: contentData[], search: string) {
  const fuse = new Fuse(ids, {
    keys: ["Title"],
    threshold: 0.5,
    shouldSort: false,
  });
  const results: any[] | contentData[] = fuse.search(search);
  results.forEach((fuseObj, i) => (results[i] = fuseObj.item));
  return results;
}

const filterDataFunc = (filterData: QueryParams) => {
  const { any, all, none, search, types, orderByLatest } = filterData;
  const hasAny = !!any?.length;
  const hasAll = !!all?.length;
  const hasNone = !!none?.length;
  const allTypes = !types.length;

  const keys = Object.keys(contentDataDB.data);
  const results: contentData[] = [];

  for (const key of keys) {
    const item = contentDataDB.data[key];
    if (!allTypes && !types.includes(item.Type)) continue;
    const tags = item.Tags;

    // apply all filters in one pass
    if (hasAny && !ArryaHasAnyModified(tags, any)) continue;
    if (hasNone && ArryaHasAnyModified(tags, none)) continue;
    if (hasAll && !ArrayHasAll(tags, all)) continue;

    results.push(item);
  }

  // run search last (expensive)
  const preFinalResult =
    search && search.trim().length > 0
      ? GetSearchIds(results, search)
      : results;

  const finalResult = orderByLatest
    ? preFinalResult.sort((a, b) => b.Added - a.Added)
    : preFinalResult.sort((a, b) => a.Added - b.Added);

  return finalResult;
};

export default filterDataFunc;
