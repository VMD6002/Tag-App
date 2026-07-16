import { useAtom } from "jotai";
import { tagsAtom } from "../../atoms/tags";
import constate from "constate";

export function useTag() {
  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useAtom(tagsAtom);

  const toggleModal = useCallback(() => setOpen((old) => !old), []);

  const openCoverModal = useCallback(
    (tag: string) => {
      setCurrentTag(tag);
      setCover(tags[tag].cover ?? "");
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
      temp[currentTag].cover = cover;
      return temp;
    });
    setOpen(false);
  }, [currentTag, cover]);

  const removeCover = useCallback(() => {
    setTags(async (old) => {
      const temp = await old;
      delete temp[currentTag].cover;
      return temp;
    });
    setOpen(false);
  }, [currentTag]);

  return {
    open,
    cover,
    setCover,
    removeCover,
    toggleModal,
    setTagCover,
    openCoverModal,
  };
}

export const [TagContextProvider, useTagContext] = constate(useTag);
