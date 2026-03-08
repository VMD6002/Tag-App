import { ArrayHasAll, ArrayHasAnyModified } from "./HelperFunctions";
import Fuse from "fuse.js";
import type { ContentWebDataType, FilterDataType } from "./types";

type TitleIdObject = {
  id: string;
  title: string;
};

function GetSearchIds(
  contentData: ContentWebDataType,
  ids: string[],
  search: string,
) {
  const Data: TitleIdObject[] = [];
  ids.map((id) =>
    Data.push({
      id: contentData[id]!.id,
      title: contentData[id]!.title,
    }),
  );
  const fuse = new Fuse(Data, {
    keys: ["title"],
    threshold: 0.5,
  });
  return fuse.search(search).map((data) => data.item.id);
}

export const filterDataWeb = (
  contentData: ContentWebDataType,
  filterData: FilterDataType,
) => {
  const { any, all, none, search, orderByLatest } = filterData;
  const hasAny = !!any?.length;
  const hasAll = !!all?.length;
  const hasNone = !!none?.length;

  const keys = Object.keys(contentData);
  const results: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    const item = contentData[key]!;
    const tags = item.tags;

    // apply all filters in one pass
    if (hasAny && !ArrayHasAnyModified(tags, any)) continue;
    if (hasNone && ArrayHasAnyModified(tags, none)) continue;
    if (hasAll && !ArrayHasAll(tags, all)) continue;

    results.push(key);
  }

  // run search last (expensive)
  const finalResults =
    search && search.trim().length > 0
      ? GetSearchIds(contentData, results, search)
      : results;

  // Currently just reverse the array for orderByLatest, need to implement proper sorting
  return orderByLatest
    ? finalResults.sort((a, b) => contentData[b]!.added - contentData[a]!.added)
    : finalResults.sort(
        (a, b) => contentData[a]!.added - contentData[b]!.added,
      );
};
