import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export const tagDefaultData = {
  "Type:Img": { Count: 0 },
  "Type:GIF": { Count: 0 },
  "Type:Animation": {
    Count: 0,
  },
  "Type:3D": {
    Count: 0,
  },
  "Type:Short_Clip": {
    Count: 0,
  },
  "Util:Downloaded": {
    Count: 0,
    CoverUrl: "https://www.svgrepo.com/show/501864/disk.svg",
  },
  "Util:Different_Cover": {
    Count: 0,
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

  const removeParent = useCallback(
    (parent: string) => {
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
    },
    [getFilteredContent]
  );

  const removeTag = useCallback(
    (tag: string) => {
      const filtered = getFilteredContent({ any: [tag] });
      if (tag.startsWith("Site:") && filtered.length) {
        alert(
          `Entry or Entries (no: ${filtered.length}) from ${tag} is in library, can't remove ${tag}. Remove all of them first.`
        );
        return;
      }
      setTags((oldTags) => {
        delete oldTags![tag];
        setContentData((oldContentData) => {
          filtered.map(
            (entry) =>
              (oldContentData![entry].Tags = oldContentData![entry].Tags.filter(
                (o) => o != tag
              ))
          );
          return oldContentData!;
        });
        return { ...oldTags };
      });
    },
    [getFilteredContent]
  );

  const fixTagCount = useCallback(() => {
    const CalculatedTags: Map<string, number> = new Map();
    const AllTags = new Set(Object.keys(tags));
    Object.keys(contentData).map((key) =>
      contentData[key].Tags.map((tag) =>
        CalculatedTags.set(tag, (CalculatedTags.get(tag) ?? 0) + 1)
      )
    );

    setTags((oldTage) => {
      const tmp: TagType = {};
      CalculatedTags.forEach((tagCount, tag) => {
        const tagData = oldTage![tag];
        if (!tagData) tmp[tag] = { Count: tagCount };
        else tmp[tag] = { ...tagData, Count: tagCount };
      });
      AllTags.difference(new Set(CalculatedTags.keys())).forEach(
        (tag) => (tmp[tag] = { ...tags[tag], Count: 0 })
      );
      return tmp;
    });
  }, [contentData, tags]);

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
