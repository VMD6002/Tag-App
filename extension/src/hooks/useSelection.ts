export default function useSelection() {
  const [on, setOn] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);
  const [tags, setTags] = useState<MultiSelectOption[]>([]);
  const tagsInitial = useRef<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const selectAll = useCallback((filtered: string[]) => {
    setEntries(filtered);
  }, []);

  const unSelectAll = useCallback(() => {
    setEntries([]);
  }, []);

  const toggleModalFunc = useCallback(() => setModalOpen((old) => !old), []);

  const toggleSelectionMode = useCallback(
    () =>
      setOn((o) => {
        if (o) setEntries([]);
        return !o;
      }),
    []
  );

  const selectEntry = useCallback(
    (key: string) => {
      if (entries.includes(key)) {
        setEntries((e) => e.filter((val) => val !== key));
        return;
      }
      setEntries((e) => [...e, key]);
    },
    [entries]
  );

  const syncSelectedTags = useCallback(
    (contentData: ContentDataType) => {
      const TagsArray = entries.map((key) => contentData[key].Tags);
      const Data = TagsArray.reduce((a, b) => a.filter((c) => b.includes(c)));
      tagsInitial.current = Data;
      setTags(Data.map((o) => ({ label: o, value: o })));
    },
    [entries]
  );

  return {
    on,
    setOn,
    toggleSelectionMode,
    // ---
    entries,
    setEntries,
    // ---
    tags,
    setTags,
    // ---
    tagsInitial,
    // ---
    modalOpen,
    setModalOpen,
    toggleModalFunc,
    // ---
    selectAll,
    unSelectAll,
    selectEntry,
    syncSelectedTags,
  };
}
