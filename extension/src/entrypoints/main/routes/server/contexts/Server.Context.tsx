import useOrpc from "@/hooks/useOrpc";
import sanitizeStringForFileName from "@/lib/sanitizeStringForFileName";
import { useMutation } from "@tanstack/react-query";
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
  inputDisabled: boolean;
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
  const [inputDisabled, setInputDisabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const { serverUrl } = useSettingsData();
  const Filter = useFilter();
  const Selection = useSelection();
  const Update = useUpdate();

  const ServerTagsMutation = useMutation(
    orpc.main.getServerTags.mutationOptions({
      onSuccess: (res) => {
        setTags(Object.keys(res));
      },
      onError: () => {
        alert("Could't fetch server tags");
      },
    })
  );
  const contentDataMutation = useMutation(
    orpc.main.getData.mutationOptions({
      onSuccess: (res) => {
        ServerTagsMutation.mutate({});
        setFiltered(res);
      },
      onError: () => {
        console.warn("DB, online ?");
      },
    })
  );
  const filterData = useCallback(() => {
    Selection.setEntries([]);
    Selection.setOn(false);
    contentDataMutation.mutate(Filter.FilterData);
  }, [Filter.FilterData]);

  const syncContentsModified = useMutation(
    orpc.main.sync.mutationOptions({
      onSuccess: () => {
        contentDataMutation.mutate(Filter.FilterData);
      },
    })
  );
  const serverSyncFunc = useCallback(() => syncContentsModified.mutate({}), []);

  const updateContentMutaion = useMutation(
    orpc.main.setDoc.mutationOptions({
      onSuccess: (res) => {
        setFiltered((old) =>
          old.map((val) => {
            if (val.id !== res.id) return val;
            const content = { ...val };
            const oldTags = content.Tags;
            const addedTags = res.Tags.filter((tag) => !oldTags.includes(tag));
            setTags((old) => {
              const unSyncedTags = addedTags.filter(
                (tag) => !old.includes(tag)
              );
              if (!unSyncedTags.length) return old;
              return [...old, ...unSyncedTags];
            });
            return res;
          })
        );
        Update.setTitle(res.Title);
        Update.setModalOpen(false);
        setInputDisabled(false);
      },
      onError: () => {
        alert("Couldn't update, check console for error");
        setInputDisabled(false);
      },
    })
  );
  const updateContentFunc = useCallback(() => {
    const sanitizedTitle = sanitizeStringForFileName(Update.Data.Title);
    if (!sanitizedTitle) {
      alert("Title must not be blank");
      Update.setTitle("");
      return;
    }
    const content = { ...Update.Data, Title: sanitizedTitle };
    setInputDisabled(true);
    updateContentMutaion.mutate(content);
  }, [Update.Data, filtered]);

  const bulkUpdateMutation = useMutation(
    orpc.main.bulkUpdate.mutationOptions({
      onSuccess: (res) => {
        setTags((old) => {
          const unSyncedTags = res.added.filter((tag) => !old.includes(tag));
          if (!unSyncedTags.length) return old;
          return [...old, ...unSyncedTags];
        });
        setFiltered((oldFiltered: ContentType[]) =>
          oldFiltered.map((content: ContentType) => {
            if (!res.ids.includes(content.id)) return content;
            for (const tag of res.removed) {
              content.Tags = content.Tags.filter((val) => val !== tag);
              content.LastUpdated = Math.floor(Date.now() / 1000);
            }
            for (const tag of res.added) {
              if (content.Tags.includes(tag)) continue;
              content.Tags.push(tag);
            }
            return content;
          })
        );
        Selection.setModalOpen(false);
        setInputDisabled(false);
      },
      onError: () => {
        alert("Bulk update failed, check console for error");
        setInputDisabled(false);
      },
    })
  );
  const bulkUpdateContentFunc = useCallback(() => {
    const updatedTags = Selection.tags.map((o) => o.value);
    const removedTags = Selection.tagsInitial.current.filter(
      (x) => !updatedTags.includes(x)
    );
    const addedTags = updatedTags.filter(
      (x) => !Selection.tagsInitial.current.includes(x)
    );
    setInputDisabled(true);
    bulkUpdateMutation.mutate({
      ids: Selection.entries,
      added: addedTags,
      removed: removedTags,
    });
  }, [Selection.tags, Selection.entries, Selection.tagsInitial]);

  const isSelected = useCallback(
    (id: string) => Selection.entries.includes(id),
    [Selection.entries]
  );

  const deleteContentsModified = useMutation(
    orpc.main.deleteData.mutationOptions({
      onSuccess: (res) => {
        setFiltered((old) => old.filter((doc) => !res.includes(doc.id)));
      },
      onError: () => {
        alert("delete contents failed, check console for error");
      },
    })
  );
  const removeContents = useCallback((keys: string[]) => {
    deleteContentsModified.mutate(keys);
  }, []);

  useEffect(() => {
    contentDataMutation.mutate(Filter.FilterData);
  }, []);

  const value: ServerContext = useMemo(
    () => ({
      tags,
      setTags,
      Filter,
      Selection,
      Update,
      filtered,
      serverUrl,
      inputDisabled,
      removeContents,
      setFiltered,
      updateContentFunc,
      bulkUpdateContentFunc,
      filterData,
      isSelected,
      serverSyncFunc,
    }),
    [tags, Filter, Selection, Update, filtered, inputDisabled, serverUrl]
  );

  return (
    <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
  );
}
