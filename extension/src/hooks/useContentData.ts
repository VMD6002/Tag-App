import filterDataFunc from "@/lib/filterDataFunc";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export default function useContentData() {
  const setTags = useStorage<TagType>(
    {
      key: "tags",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? tagDefaultData : v)
  )[1];

  const [contentData, setContentData] = useStorage<ContentDataType>(
    {
      key: "contentData",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? {} : v)
  );

  const removeContents = useCallback((keys: string[]) => {
    // @ts-ignore
    setContentData((oldVids: ContentDataType) => {
      keys.map((key) => {
        // @ts-ignore
        setTags((oldTags: TagType) => {
          oldVids[key].Tags.map((tag) => oldTags[tag].Count--);
          return oldTags;
        });
        delete oldVids[key];
      });
      return oldVids;
    });
  }, []);

  // Dont panic, filterDataFunc is a curried function
  const getFilteredContent = useCallback(filterDataFunc(contentData), [
    contentData,
  ]);

  const getDataGivenKeys = useCallback(
    (keys: string[]) => {
      const Data: ContentType[] = [];
      keys.forEach((key) => Data.push(contentData[key]));
      return Data;
    },
    [contentData]
  );

  return {
    contentData,
    setContentData,
    // --
    removeContents,
    getFilteredContent,
    getDataGivenKeys,
  };
}
