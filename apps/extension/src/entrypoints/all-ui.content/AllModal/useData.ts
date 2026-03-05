import GetDetailsFromPage from "@/lib/GetDetailsFromPage";

export default function useData() {
  const [exists, setExists] = useState<boolean>(false);
  const [preset, setPreset] = useState<string>("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<MultiSelectOption[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [extraData, setExtraData] = useState("");

  const resetTitle = useCallback(() => {
    const { title } = GetDetailsFromPage();
    setTitle(title);
  }, []);

  const resetCoverUrl = useCallback(() => {
    const { coverUrl } = GetDetailsFromPage();
    setCoverUrl(coverUrl);
  }, []);

  const resetExtraData = useCallback(() => {
    const { url } = GetDetailsFromPage();
    setExtraData(`Web: [${url}](${url})`);
  }, []);

  const resetAll = useCallback(() => {
    const { title, coverUrl, url, site } = GetDetailsFromPage();
    setTitle(title);
    setCoverUrl(coverUrl);
    setExtraData(`Web: [${url}](${url})`);
    setTags([{ label: `Site:${site}`, value: `Site:${site}`, fixed: true }]);
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
