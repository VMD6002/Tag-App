import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useRoute } from "wouter";
import { navigate } from "wouter/use-hash-location";
import { sanitizeStringForFileName } from "@tagapp/utils";
import { useAtomValue, useSetAtom } from "jotai";
import UpdateModal, {
  updateDataAtom,
  updateExtraDataAtom,
  updateIdAtom,
  updateInputDisabledAtom,
  updateModalOpenAtom,
  updateTagsAtom,
  updateTitleAtom,
} from "@/components/craft/UpdateModal";
import constate from "constate";
import { Disc3 } from "lucide-react";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import { serverUrlAtom } from "@/entrypoints/main/atoms/settings";
import { ContentServerType } from "@tagapp/utils/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const docPlaceholderData: ContentServerType = {
  id: "",
  title: "",
  cover: "",
  tags: [],
  added: 0, // Unix epoch start time
  lastUpdated: 0, // Unix epoch start time
  extraData: "",
  type: "img",
};

function useDocContext() {
  const orpc = useAtomValue(orpcAtom);

  const { id } = useRoute("/server/:contentType/:id")[1] as { id: string };
  const serverUrl = useAtomValue(serverUrlAtom);
  const [doc, setDoc] = useState<ContentServerType>(docPlaceholderData);
  const setInputDisabled = useSetAtom(updateInputDisabledAtom);

  const setTitle = useSetAtom(updateTitleAtom);
  const setExtraData = useSetAtom(updateExtraDataAtom);
  const setUpdateTags = useSetAtom(updateTagsAtom);
  const setId = useSetAtom(updateIdAtom);

  const getDocMutation = useMutation(
    orpc.main.getDoc.mutationOptions({
      onSuccess: (res) => {
        setId(res.id);
        setTitle(res.title);
        setExtraData(res.extraData);
        setUpdateTags(res.tags.map((tag) => ({ label: tag, value: tag })));
        setDoc(res);
        setTimeout(
          () => (document.title = document.title + " - " + res.title),
          100,
        );
      },
      onError: () => {
        console.error("Couldn't get doc, check console for errors");
      },
    }),
  );

  const setUpdateModalOpen = useSetAtom(updateModalOpenAtom);
  const updateContentModified = useMutation(
    orpc.main.setDoc.mutationOptions({
      onSuccess: (res) => {
        setDoc(res);
        setTitle(res.title);
        setUpdateModalOpen(false);
        setInputDisabled(false);
      },
      onError: () => {
        alert("Couldn't update, check console for error");
        setInputDisabled(false);
      },
    }),
  );

  const updateData = useAtomValue(updateDataAtom);
  const updateContentFunc = useCallback(() => {
    const sanitizedTitle = sanitizeStringForFileName(updateData.title);
    if (!sanitizedTitle) {
      alert("Title must not be blank");
      setTitle("");
      return;
    }
    const content: typeof updateData = {
      ...updateData,
      title: sanitizedTitle,
    };
    setInputDisabled(true);
    updateContentModified.mutate(content);
  }, [updateData]);

  const removeContentsMutaion = useMutation(
    orpc.main.deleteData.mutationOptions({
      onSuccess: () => {
        navigate("/server");
      },
      onError: () => {
        alert("delete contents failed, check console for error");
      },
    }),
  );
  const removeContent = useCallback(() => {
    removeContentsMutaion.mutate([id]);
  }, [id]);

  const encodedTitle = useMemo(
    () => encodeURIComponent(`${doc.title}.${doc.id}`),
    [doc.title, doc.id],
  );

  const setCoverMutation = useMutation(
    orpc.main.setCover.mutationOptions({
      onSuccess: (data) => {
        setDoc((old) => ({ ...old, cover: data.coverPath }));
      },
    }),
  );

  return {
    doc,
    serverUrl,
    orpc,
    encodedTitle,
    getDocMutation,
    setDoc,
    removeContent,
    setCoverMutation,
    updateContentFunc,
  };
}

export const [Provider, useDoc] = constate(useDocContext);

export function Child({ children }: { children: React.ReactNode }) {
  const { doc, serverUrl, getDocMutation, updateContentFunc } = useDoc();
  const { id } = useRoute("/server/:contentType/:id")[1] as { id: string };

  useEffect(() => {
    if (!serverUrl) return;
    getDocMutation.mutate(id);
  }, [id, serverUrl]);

  if (getDocMutation.isPending || !doc.title)
    return (
      <div className="h-[calc(100vh-8rem)] grid place-items-center">
        <Disc3 className="animate-spin" size={"4rem"} />
      </div>
    );

  return (
    <>
      <UpdateModal updateContentFunc={updateContentFunc} isServer={true} />
      {children}
    </>
  );
}

export default function DocProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <Child>{children}</Child>
      </Provider>
    </QueryClientProvider>
  );
}
