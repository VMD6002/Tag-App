import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import getImgURL from "./getImgURL";

export interface TagContext extends ReturnType<typeof useTagData> {
  cover: string;
  setCover: Dispatch<SetStateAction<string>>;
  portAndIP: string[];
  open: boolean;
  toggleModal: () => void;
  setTagCover: () => void;
  removeCover: () => void;
  openCoverModal: (tag: string) => void;
  getCover: (codedString: string) => string | undefined;
}

const TagContext = createContext<TagContext | null>(null);

export function useTagContext() {
  return useContext(TagContext);
}

export function TagContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [tag, setTag] = useState("");
  const { serverUrl } = useSettingsData();
  const Tags = useTagData();

  const portAndIP = useMemo(() => {
    try {
      const tmp = new URL(serverUrl);
      const IP = tmp.hostname;
      const port = tmp.port;
      return [IP, port];
    } catch {
      return ["", ""];
    }
  }, [serverUrl]);

  const toggleModal = useCallback(() => setOpen((old) => !old), []);

  const openCoverModal = useCallback(
    (tag: string) => {
      setTag(tag);
      setCover(Tags.tags[tag].CoverUrl ?? "");
      setOpen(true);
    },
    [Tags.tags]
  );

  const setTagCover = useCallback(() => {
    if (!cover.trim()) {
      alert("Cover url can't be blank");
      setCover("");
      return;
    }
    Tags.setTags((old) => {
      const temp = { ...old };
      temp[tag].CoverUrl = cover;
      return temp;
    });
    setOpen(false);
  }, [tag, cover]);

  const removeCover = useCallback(() => {
    Tags.setTags((old) => {
      const temp = { ...old };
      delete temp[tag].CoverUrl;
      return temp;
    });
    setOpen(false);
  }, [tag]);

  const getCover = useCallback(
    (codedURL: string) => getImgURL(codedURL, portAndIP[0], portAndIP[1]),
    [portAndIP]
  );

  const value: TagContext = useMemo(
    () => ({
      ...Tags,
      open,
      cover,
      setCover,
      removeCover,
      portAndIP,
      toggleModal,
      setTagCover,
      openCoverModal,
      getCover,
    }),
    [cover, portAndIP, open, Tags.tags, Tags.tagParents]
  );

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
}
