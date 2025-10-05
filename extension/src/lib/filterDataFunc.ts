import { ArrayHasAll, ArryaHasAnyModified } from "@/lib/ArrayHelpers";
import Fuse from "fuse.js";

function GetSearchIds(
  contentData: ContentDataType,
  ids: string[],
  search: string
) {
  const Data: TitleIdObject[] = [];
  ids.map((id) =>
    Data.push({ id: contentData[id].id, Title: contentData[id].Title })
  );
  const fuse = new Fuse(Data, {
    keys: ["Title"],
    threshold: 0.5,
  });
  return fuse.search(search).map((data) => data.item.id);
}

const filterDataFunc =
  (contentData: ContentDataType) => (filterData: FilterDataType) => {
    const { any, all, none, search, orderByLatest } = filterData;
    const hasAny = !!any?.length;
    const hasAll = !!all?.length;
    const hasNone = !!none?.length;

    const keys = Object.keys(contentData);
    const results: string[] = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = contentData[key];
      const tags = item.Tags;

      // apply all filters in one pass
      if (hasAny && !ArryaHasAnyModified(tags, any)) continue;
      if (hasNone && ArryaHasAnyModified(tags, none)) continue;
      if (hasAll && !ArrayHasAll(tags, all)) continue;

      results.push(key);
    }

    // run search last (expensive)
    const finalResults =
      search && search.trim().length > 0
        ? GetSearchIds(contentData, results, search)
        : results;

    return orderByLatest ? finalResults.reverse() : finalResults;
  };

export default filterDataFunc;
