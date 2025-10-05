import GetDetailsFromPage from "@/lib/GetDetailsFromPage";

export default function useData() {
  const [exists, setExists] = useState<boolean>(false);
  const [preset, setPreset] = useState<string>("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<MultiSelectOption[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [extraData, setExtraData] = useState("");

  const resetTitle = useCallback(() => {
    const { Title } = GetDetailsFromPage();
    setTitle(Title);
  }, []);

  const resetCoverUrl = useCallback(() => {
    const { CoverUrl } = GetDetailsFromPage();
    setTitle(CoverUrl);
  }, []);

  const resetExtraData = useCallback(() => {
    const { Url } = GetDetailsFromPage();
    setExtraData(`Web: [${Url}](${Url})`);
  }, []);

  const resetAll = useCallback(() => {
    const { Title, CoverUrl, Url, Site } = GetDetailsFromPage();
    setTitle(Title);
    setTitle(CoverUrl);
    setExtraData(`Web: [${Url}](${Url})`);
    setTags([{ label: `Site:${Site}`, value: `Site:${Site}`, fixed: true }]);
  }, []);

  return {
    exists,
    setExists,
    preset,
    setPreset,
    title,
    setTitle,
    tags,
    setTags,
    coverUrl,
    setCoverUrl,
    extraData,
    setExtraData,
    // functions
    resetAll,
    resetTitle,
    resetCoverUrl,
    resetExtraData,
  };
}
