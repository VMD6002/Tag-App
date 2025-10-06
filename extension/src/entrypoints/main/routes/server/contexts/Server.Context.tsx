import useOrpc from "@/hooks/useOrpc";
import sanitizeStringForFileName from "@/lib/sanitizeStringForFileName";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createContext } from "react";

export interface ServerContext {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  Filter: ReturnType<typeof useFilter>;
  Selection: ReturnType<typeof useSelection>;
  Update: ReturnType<typeof useUpdate>;
  filtered: ContentType[];
  setFiltered: React.Dispatch<React.SetStateAction<ContentType[]>>;
  serverUrl: string;
  removeContents: (keys: string[]) => void;
  updateContentFunc: () => void;
  bulkUpdateContentFunc: () => void;
  isSelected: (id: string) => boolean;
  filterData: () => void;
  serverSyncFunc: () => void;
}

const ServerContext = createContext<any>(null);

export function useServer() {
  return useContext(ServerContext);
}

export function ServerProvider({ children }: any) {
  const orpc = useOrpc();
  const [filtered, setFiltered] = useState<ContentType[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const { serverUrl } = useSettingsData();
  const Filter = useFilter();
  const Selection = useSelection();
  const Update = useUpdate();

  const contentDataQuery = useQuery(
    orpc.main.getData.queryOptions({
      input: Filter.FilterData,
      queryKey: orpc.main.getData.key(),
    })
  );
  const filterData = useCallback(() => {
    Selection.setEntries([]);
    Selection.setOn(false);
    contentDataQuery.refetch();
  }, []);

  const syncContentsModified = useMutation(
    orpc.main.sync.mutationOptions({
      onSuccess: () => {
        contentDataQuery.refetch();
      },
    })
  );
  const serverSyncFunc = useCallback(
    () => syncContentsModified.mutate({}),
    [contentDataQuery]
  );

  const updateContentModified = useMutation(orpc.main.setDoc.mutationOptions());
  const bulkUpdateContentFunc = useCallback(() => {
    const updatedTags = Selection.tags.map((o) => o.value);
    const removedTags = Selection.tagsInitial.current.filter(
      (x) => !updatedTags.includes(x)
    );
    const addedTags = updatedTags.filter(
      (x) => !Selection.tagsInitial.current.includes(x)
    );

    setFiltered((oldFiltered: ContentType[]) =>
      oldFiltered.map((content: ContentType) => {
        if (!Selection.entries.includes(content.id)) return content;
        for (const tag of removedTags) {
          content.Tags = content.Tags.filter((val) => val !== tag);
          content.LastUpdated = Math.floor(Date.now() / 1000);
        }
        for (const tag of addedTags) {
          if (content.Tags.includes(tag)) continue;
          content.Tags.push(tag);
        }
        updateContentModified.mutate(content);
        return content;
      })
    );

    Selection.setModalOpen(false);
  }, [Selection.tags, Selection.entries, Selection.tagsInitial]);
  const updateContentFunc = useCallback(() => {
    if (!Update.Data.title.trim()) {
      alert("Title must not be blank");
      Update.setTitle("");
      return;
    }
    let content: ContentType;
    const sanitizedTitle = sanitizeStringForFileName(Update.Data.title);
    setFiltered((old) =>
      old.map((val) => {
        if (val.id === Update.Data.ID) {
          content = { ...val };
          content.Title = sanitizedTitle;
          content.Tags = Update.Data.tags;
          content.extraData = Update.Data.extraData;
          updateContentModified.mutate(content!);
          return content;
        }
        return val;
      })
    );
    Update.setTitle(sanitizedTitle);
    Update.setModalOpen(false);
  }, [Update.Data]);

  const isSelected = useCallback(
    (id: string) => Selection.entries.includes(id),
    [Selection.entries]
  );

  const deleteContentsModified = useMutation(
    orpc.main.deleteData.mutationOptions()
  );
  const removeContents = useCallback((keys: string[]) => {
    deleteContentsModified.mutate(keys);
  }, []);

  useEffect(() => {
    setFiltered(contentDataQuery?.data ?? []);
  }, [contentDataQuery.data]);

  const ServerTagQuery = useQuery(orpc.main.getServerTags.queryOptions());
  useEffect(() => {
    const serverTags = Object.keys(ServerTagQuery?.data ?? {});
    setTags(serverTags);
  }, [ServerTagQuery.data]);

  const value = useMemo(
    () => ({
      tags,
      setTags,
      Filter,
      Selection,
      Update,
      filtered,
      serverUrl,
      removeContents,
      setFiltered,
      updateContentFunc,
      bulkUpdateContentFunc,
      filterData,
      isSelected,
      serverSyncFunc,
    }),
    [tags, Filter, Selection, Update, filtered, serverUrl]
  );

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
}
