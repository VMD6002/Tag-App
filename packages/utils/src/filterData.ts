import { ArrayHasAll, ArrayHasAnyModified } from "@tagapp/utils";
import Fuse from "fuse.js";
import type {
  ContentWebDataType,
  ContentWebType,
  FilterDataType,
} from "@tagapp/utils/types";

function GetSearchIds(ids: ContentWebType[], search: string) {
  const fuse = new Fuse(ids, {
    keys: ["title"],
    threshold: 0.5,
    shouldSort: false,
  });
  const fuseResults = fuse.search(search);
  const finalResults = fuseResults.map((fuseObj) => fuseObj.item);
  return finalResults;
}

export function filterData(
  filterData: FilterDataType,
  contentData: ContentWebDataType,
) {
  const { any, all, none, search, orderByLatest } = filterData;
  const hasAny = !!any?.length;
  const hasAll = !!all?.length;
  const hasNone = !!none?.length;

  const results: ContentWebType[] = [];

  Object.values(contentData).forEach((contentDetails) => {
    const tags = contentDetails.tags;

    // apply all filters in one pass
    if (hasAny && !ArrayHasAnyModified(tags, any)) return;
    if (hasNone && ArrayHasAnyModified(tags, none)) return;
    if (hasAll && !ArrayHasAll(tags, all)) return;

    results.push(contentDetails);
  });

  // run search last (expensive)
  const preFinalResult =
    search && search.trim().length > 0
      ? GetSearchIds(results, search)
      : results;

  const finalResult = orderByLatest
    ? preFinalResult.sort((a, b) => b.added - a.added)
    : preFinalResult.sort((a, b) => a.added - b.added);

  return finalResult;
}
