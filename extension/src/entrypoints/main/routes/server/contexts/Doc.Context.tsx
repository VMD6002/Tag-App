import { createContext } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useRoute } from "wouter";
import UpdateModal from "@/components/craft/UpdateModal";
import { Disc3 } from "lucide-react";
import { navigate } from "wouter/use-hash-location";
import useOrpc from "@/hooks/useOrpc";
import sanitizeStringForFileName from "@/lib/sanitizeStringForFileName";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const docPlaceholderData: ContentType = {
  id: "",
  Title: "",
  CoverUrl: "",
  Tags: [],
  Added: 0, // Unix epoch start time
  LastUpdated: 0, // Unix epoch start time
  extraData: "",
  Type: "img",
  ext: [],
};

export interface DocContext {
  doc: ContentType;
  setDoc: React.Dispatch<React.SetStateAction<ContentType>>;
  Update: ReturnType<typeof useUpdate>;
  serverUrl: string;
  removeContent: () => void;
  updateContentFunc: () => void;
  orpc: ReturnType<typeof useOrpc>;
}

const DocContext = createContext<DocContext | null>(null);

export function useDoc() {
  return useContext(DocContext);
}

export function Child({ children }: { children: React.ReactNode }) {
  const orpc = useOrpc();
  const { id } = useRoute("/server/:contentType/:id")[1] as { id: string };
  const { serverUrl } = useSettingsData();
  const Update = useUpdate();
  const [doc, setDoc] = useState<ContentType>(docPlaceholderData);

  const getDocQuery = useQuery(
    orpc.main.getDoc.queryOptions({
      input: id,
    })
  );

  const updateContentsModified = useMutation(
    orpc.main.setDoc.mutationOptions()
  );
  const updateContentFunc = useCallback(async () => {
    if (!Update.Data.title.trim()) {
      alert("Title must not be blank");
      Update.setTitle("");
      return;
    }
    let content: ContentType;
    const sanitizedTitle = sanitizeStringForFileName(Update.Data.title);
    setDoc((old) => {
      content = { ...old };
      content.Title = sanitizedTitle;
      content.Tags = Update.Data.tags;
      content.extraData = Update.Data.extraData;
      return content;
    });
    updateContentsModified.mutate(content!);
    Update.setTitle(sanitizedTitle);
    Update.setModalOpen(false);
  }, [Update.Data]);

  const deleteContentsModified = useMutation(
    orpc.main.deleteData.mutationOptions({
      onSuccess: () => {
        navigate("/server");
      },
    })
  );
  const removeContent = useCallback(() => {
    if (confirm(`Please Confirm deletion of "${doc.Title}"`))
      deleteContentsModified.mutate([id]);
  }, [id, doc.Title]);

  const value = useMemo(
    () => ({
      doc,
      setDoc,
      Update,
      serverUrl,
      removeContent,
      updateContentFunc,
      orpc,
    }),
    [doc, Update, serverUrl, orpc]
  );

  useEffect(() => {
    if (!getDocQuery.data?.id) return;
    setDoc(getDocQuery.data);
    Update.setTags(
      getDocQuery.data?.Tags?.map((o: string) => ({ label: o, value: o }))
    );
    Update.setTitle(getDocQuery.data?.Title);
    Update.setExtraData(getDocQuery.data?.extraData);
    setTimeout(
      () => (document.title = `${document.title} - ${getDocQuery.data?.Title}`),
      0
    );
  }, [getDocQuery.data]);

  if (getDocQuery.isLoading)
    return (
      <div className="h-[calc(100vh-8rem)] grid place-items-center">
        <Disc3 className="animate-spin" size={"4rem"} />
      </div>
    );

  return (
    <DocContext.Provider value={value}>
      <UpdateModal
        isServer
        Update={Update}
        updateContentFunc={updateContentFunc}
      />
      {children}
    </DocContext.Provider>
  );
}

export default function DocProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Child>{children}</Child>
    </QueryClientProvider>
  );
}
