export default function useUpdate() {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [extraData, setExtraData] = useState("");
  const [tags, setTags] = useState<MultiSelectOption[]>([]);
  const ID = useRef("");

  const Data = useMemo(
    () => ({
      Title: title,
      Tags: tags.map((o) => o.value),
      id: ID.current,
      Cover: cover,
      extraData: extraData,
    }),
    [title, tags, ID, cover, extraData]
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
    cover,
    setCover,
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
