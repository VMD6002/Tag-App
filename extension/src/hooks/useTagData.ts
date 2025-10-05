import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export const tagDefaultData = {
  "Type:Img": { Count: 0, CoverUrl: "https://picsum.photos/200/300" },
  "Type:GIF": { Count: 0, CoverUrl: "https://picsum.photos/200/300" },
  "Type:Animation": {
    Count: 0,
    CoverUrl: "https://picsum.photos/200/300",
  },
  "Type:3D": {
    Count: 0,
    CoverUrl: "https://picsum.photos/200/300",
  },
  "Type:ImgSet": {
    Count: 0,
    CoverUrl: "https://picsum.photos/200/300",
  },
  "Type:Short_Clip": {
    Count: 0,
    CoverUrl: "https://picsum.photos/200/300",
  },
  "Util:Downloaded": {
    Count: 0,
    CoverUrl: "https://picsum.photos/200/300",
  },
  "Util:Different_Cover": {
    Count: 0,
    CoverUrl: "https://picsum.photos/200/300",
  },
};

export default function useTagData() {
  const { contentData, setContentData, getFilteredContent } = useContentData();

  const [tagParents, setTagParents] = useStorage<string[]>(
    {
      key: "parents",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? ["Type", "Util", "Site"] : v)
  );
  const [tags, setTags] = useStorage<TagType>(
    {
      key: "tags",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? tagDefaultData : v)
  );

  const removeParent = useCallback((parent: string) => {
    // @ts-ignore
    setTagParents((oldTagParents: string[]) => {
      const DeletedTags = new Set();
      // @ts-ignore
      setTags((oldTags: TagType) => {
        Object.keys(oldTags).filter((tag) => {
          if (!tag.startsWith(parent)) return;
          DeletedTags.add(tag);
          delete oldTags[tag];
        });
        return oldTags;
      });
      // @ts-ignore
      setContentData((oldContentData: ContentDataType) => {
        getFilteredContent({ any: [`${parent}:*`] }).map((entry) => {
          const Tags = new Set(oldContentData[entry].Tags);
          oldContentData[entry].Tags = [...Tags.difference(DeletedTags)];
        });
        return oldContentData;
      });
      return oldTagParents.filter((val) => val != parent);
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setTags((oldTags) => {
      // @ts-ignore
      delete oldTags[tag];
      // @ts-ignore
      setContentData((oldContentData) => {
        getFilteredContent({ any: [tag] }).map(
          (entry) =>
            // @ts-ignore
            (oldContentData[entry].Tags = oldContentData[entry].Tags.filter(
              (o) => o != tag
            ))
        );
        return oldContentData;
      });
      return { ...oldTags };
    });
  }, []);

  const fixTagCount = useCallback(() => {
    const CalculatedTags: Map<string, number> = new Map();
    const AllTags = new Set(Object.keys(tags));
    Object.keys(contentData).map((key) =>
      contentData[key].Tags.map((tag) =>
        CalculatedTags.set(
          tag,
          // @ts-ignore
          (CalculatedTags.get(tag) ? CalculatedTags.get(tag) : 0) + 1
        )
      )
    );
    // @ts-ignore
    setTags((oldTage: TagType) => {
      CalculatedTags.forEach(
        (tagCount, tag) => (oldTage[tag].Count = tagCount)
      );
      AllTags.difference(new Set(CalculatedTags.keys())).forEach(
        (unUsedTag) => (oldTage[unUsedTag].Count = 0)
      );
      return oldTage;
    });
  }, [contentData]);

  return {
    tagParents,
    setTagParents,
    // --
    tags,
    setTags,
    // --
    removeParent,
    removeTag,
    fixTagCount,
  };
}
