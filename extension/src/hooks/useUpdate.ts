export default function useUpdate() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [extraData, setExtraData] = useState("");
  const [tags, setTags] = useState<MultiSelectOption[]>([]);
  const ID = useRef("");

  const Data = useMemo(
    () => ({
      title,
      tags: tags.map((o) => o.value),
      ID: ID.current,
      coverUrl: coverUrl,
      extraData: extraData,
    }),
    [title, tags, ID, coverUrl, extraData]
  );

  const toggleModalFunc = useCallback(() => {
    setModalOpen((old) => !old);
  }, []);

  return {
    Data,
    // --
    modalOpen,
    setModalOpen,
    // --
    title,
    setTitle,
    // --
    coverUrl,
    setCoverUrl,
    // --
    tags,
    setTags,
    //--
    extraData,
    setExtraData,
    // --
    ID,
    toggleModalFunc,
  };
}
