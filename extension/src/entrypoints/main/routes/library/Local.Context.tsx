import { createContext } from "react";

export interface LocalContext
  extends ReturnType<typeof useContentData>,
    ReturnType<typeof useTagData> {
  Filter: ReturnType<typeof useFilter>;
  Selection: ReturnType<typeof useSelection>;
  Update: ReturnType<typeof useUpdate>;
  filtered: string[];
  setFiltered: React.Dispatch<React.SetStateAction<string[]>>;
  updateContentFunc: () => void;
  bulkUpdateContentFunc: () => void;
  filterData: () => void;
  getContentByID: (id: string) => ContentType;
  isSelected: (id: string) => boolean;
}

const LocalContext = createContext<LocalContext | null>(null);

export function useLocal() {
  return useContext(LocalContext);
}

export function LocalProvider({ children }: { children: React.ReactNode }) {
  const [filtered, setFiltered] = useState<string[]>([]);
  const Filter = useFilter();
  const Content = useContentData();
  const Tag = useTagData();
  const Selection = useSelection();
  const Update = useUpdate();
  const InitialContentDataLength = useRef(0);

  const filterData = useCallback(() => {
    const FilteredKeys = Content.getFilteredContent(Filter.FilterData);
    Selection.setEntries([]);
    Selection.setOn(false);
    setFiltered(FilteredKeys);
  }, [Filter.FilterData, Content.contentData]);

  const bulkUpdateContentFunc = useCallback(() => {
    // @ts-ignore
    Content.setContentData((oldContent: ContentDataType) => {
      const updatedTags = Selection.tags.map((o) => o.value);
      // @ts-ignore
      Tag.setTags((oldTags: TagType) => {
        const removedTags = Selection.tagsInitial.current.filter(
          (x) => !updatedTags.includes(x)
        );
        for (const tag of removedTags) {
          for (const entry of Selection.entries) {
            oldContent[entry].Tags = oldContent[entry].Tags.filter(
              (val) => val !== tag
            );
            oldContent[entry].LastUpdated = Math.floor(Date.now() / 1000);
            oldTags[tag].Count--;
          }
        }

        const addedTags = updatedTags.filter(
          (x) => !Selection.tagsInitial.current.includes(x)
        );
        for (const tag of addedTags) {
          for (const entry of Selection.entries) {
            if (oldContent[entry].Tags.includes(tag)) continue;
            oldContent[entry].Tags.push(tag);
            oldContent[entry].LastUpdated = Math.floor(Date.now() / 1000);
            oldTags[tag].Count++;
          }
        }
        return oldTags;
      });
      return oldContent;
    });

    Selection.setModalOpen(false);
  }, [Selection.tags, Selection.entries, Selection.tagsInitial]);

  const updateContentFunc = useCallback(() => {
    if (!Update.Data.Title.trim()) {
      alert("Title must not be blank");
      Update.setTitle("");
      return;
    }
    Content.setContentData((oldContent) => {
      Tag.setTags((oldTags) => {
        const Deleted = oldContent![Update.Data.id].Tags.filter(
          (a) => !Update.Data.Tags.includes(a)
        );
        Deleted.map((tag) => {
          oldTags![tag].Count--;
        });

        const Added = Update.Data.Tags.filter(
          (a) => !oldContent![Update.Data.id].Tags.includes(a)
        );
        Added.map((tag) => {
          oldTags![tag].Count++;
        });
        return oldTags!;
      });

      const temp: any = Update.Data;
      temp.CoverUrl = temp.Cover;
      delete temp.Cover;
      const newContent: ContentType = {
        ...oldContent![Update.Data.id],
        ...temp,
        LastUpdated: Math.floor(Date.now() / 1000),
      };
      oldContent![newContent.id] = newContent;
      return { ...oldContent };
    });
    Update.setModalOpen(false);
  }, [Update.Data]);

  const getContentByID = useCallback(
    (id: string) => Content.contentData[id],
    [Content.contentData]
  );

  const isSelected = useCallback(
    (id: string) => Selection.entries.includes(id),
    [Selection.entries]
  );

  useEffect(() => {
    const ContentDataLength = Object.keys(Content.contentData).length;
    if (ContentDataLength !== InitialContentDataLength.current) {
      InitialContentDataLength.current = ContentDataLength;
      filterData();
    }
  }, [InitialContentDataLength, Content.contentData]);

  const value = useMemo(
    () => ({
      ...Content,
      ...Tag,
      Filter,
      Selection,
      Update,
      filtered,
      setFiltered,
      updateContentFunc,
      bulkUpdateContentFunc,
      filterData,
      getContentByID,
      isSelected,
    }),
    [Content, Tag, Filter, Selection, Update, filtered]
  );

  return (
    <LocalContext.Provider value={value}>{children}</LocalContext.Provider>
  );
}
