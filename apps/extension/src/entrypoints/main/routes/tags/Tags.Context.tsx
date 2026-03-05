import { useAtom, useAtomValue } from "jotai";
import { tagsAtom } from "../../atoms/tags";
import getImgURL from "./getImgURL";
import constate from "constate";
import { serverUrlAtom } from "@/entrypoints/main/atoms/settings";

export function useTag() {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [tag, setTag] = useState("");
  const serverUrl = useAtomValue(serverUrlAtom);
  const [tags, setTags] = useAtom(tagsAtom);

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
      setCover(tags[tag].CoverUrl ?? "");
      setOpen(true);
    },
    [tags],
  );

  const setTagCover = useCallback(() => {
    if (!cover.trim()) {
      alert("Cover url can't be blank");
      setCover("");
      return;
    }
    setTags(async (old) => {
      const temp = await old;
      temp[tag].CoverUrl = cover;
      return temp;
    });
    setOpen(false);
  }, [tag, cover]);

  const removeCover = useCallback(() => {
    setTags(async (old) => {
      const temp = await old;
      delete temp[tag].CoverUrl;
      return temp;
    });
    setOpen(false);
  }, [tag]);

  const getCover = useCallback(
    (codedURL: string) => getImgURL(codedURL, portAndIP[0], portAndIP[1]),
    [portAndIP],
  );

  return {
    open,
    cover,
    portAndIP,
    setCover,
    removeCover,
    toggleModal,
    setTagCover,
    openCoverModal,
    getCover,
  };
}

export const [TagContextProvider, useTagContext] = constate(useTag);
