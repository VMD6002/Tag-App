import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { remoteTagsUpdatedAtom } from "../../atoms/tags";
import constate from "constate";
import {
  parentTagStringAtom,
  remoteParentTagsAtom,
  remoteTagsAtom,
  tagStringAtom,
} from "./atom";
import { orpcAtom } from "../../atoms/orpc";
import { useMutation } from "@tanstack/react-query";

export function useRemoteTag() {
  const orpc = useAtomValue(orpcAtom);

  const [open, setOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useAtom(remoteTagsAtom);
  const setParentTags = useSetAtom(remoteParentTagsAtom);
  const setTagString = useSetAtom(tagStringAtom);
  const setParentTagString = useSetAtom(parentTagStringAtom);
  const setRemoteTagsUpdated = useSetAtom(remoteTagsUpdatedAtom);

  const toggleModal = useCallback(() => setOpen((old) => !old), []);

  const openCoverModal = useCallback(
    (tag: string) => {
      setCurrentTag(tag);
      setCover(tags[tag].cover ?? "");
      setOpen(true);
    },
    [tags],
  );

  const setTagCoverMutation = useMutation(
    orpc.tags.setTagCover.mutationOptions({
      onSuccess: (res) => {
        setTags((old) => {
          old[res.tag].cover = res.cover;
          return { ...old };
        });
        setOpen(false);
      },
    }),
  );
  const setTagCover = useCallback(() => {
    if (!cover.trim()) {
      alert("Cover url can't be blank");
      setCover("");
      return;
    }
    setTagCoverMutation.mutate({
      tag: currentTag,
      cover,
    });
  }, [currentTag, cover]);

  const removeCover = useCallback(() => {
    setTagCoverMutation.mutate({
      tag: currentTag,
    });
  }, [currentTag]);

  const addTagsMutation = useMutation(
    orpc.tags.addTags.mutationOptions({
      onSuccess: (res) => {
        setTags((old) => {
          res.forEach((tag) => {
            old[tag] = { count: 1 };
          });
          return { ...old };
        });
        setTagString("");
        setRemoteTagsUpdated(async (old) => !(await old));
      },
    }),
  );
  const addTags = useCallback(
    (tags: string[]) => addTagsMutation.mutate({ tags }),
    [],
  );

  const removeTagsMutation = useMutation(
    orpc.tags.removeTags.mutationOptions({
      onSuccess: (res) => {
        setTags((old) => {
          res.forEach((tag) => {
            delete old[tag];
          });
          return { ...old };
        });
        setRemoteTagsUpdated(async (old) => !(await old));
      },
    }),
  );
  const removeTags = useCallback(
    (tags: string[]) => removeTagsMutation.mutate({ tags }),
    [],
  );

  const addParentTagsMutation = useMutation(
    orpc.tags.addParentTags.mutationOptions({
      onSuccess: (res) => {
        setParentTags((old) => {
          res.forEach((parentTag) => {
            old[parentTag] = {};
          });
          return { ...old };
        });
        setParentTagString("");
      },
    }),
  );
  const addParentTags = useCallback(
    (parentTags: string[]) => addParentTagsMutation.mutate({ parentTags }),
    [],
  );

  const removeParentTagsMutation = useMutation(
    orpc.tags.removeParentTags.mutationOptions({
      onSuccess: (res) => {
        setParentTags(res.parentTags);
        setTags(res.tags);
        setRemoteTagsUpdated(async (old) => !(await old));
      },
    }),
  );
  const removeParentTags = useCallback(
    (parentTags: string[]) => removeParentTagsMutation.mutate({ parentTags }),
    [],
  );

  const fixTagsMutation = useMutation(
    orpc.tags.fixTagCount.mutationOptions({
      onSuccess: (res) => {
        setTags(res.tags);
        setParentTags(res.parentTags);
      },
    }),
  );
  const fixTags = useCallback(() => fixTagsMutation.mutate({}), []);

  const getTagDataMutation = useMutation(
    orpc.tags.getTagData.mutationOptions({
      onSuccess: (res) => {
        setTags(res.tags);
        setParentTags(res.parentTags);
      },
    }),
  );
  useEffect(() => {
    getTagDataMutation.mutate({});
  }, [orpc]);

  return {
    open,
    cover,
    addTags,
    removeTags,
    addParentTags,
    removeParentTags,
    setCover,
    removeCover,
    toggleModal,
    setTagCover,
    openCoverModal,
    fixTags,
  };
}

export const [RemoteTagContextProvider, useRemoteTagContext] =
  constate(useRemoteTag);
