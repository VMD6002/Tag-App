import { createContext } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
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
  const [inputDisabled, setInputDisabled] = useState(false);

  const getDocMutation = useMutation(
    orpc.main.getDoc.mutationOptions({
      onSuccess: (res) => {
        Update.setTitle(res.Title);
        Update.setExtraData(res.extraData);
        Update.setTags(res.Tags.map((tag) => ({ label: tag, value: tag })));
        setDoc(res);
        setTimeout(
          () => (document.title = `${document.title} - ${res.Title}`),
          0
        );
      },
      onError: () => {
        console.error("Couldn't get doc, check console for errors");
      },
    })
  );

  const updateContentModified = useMutation(
    orpc.main.setDoc.mutationOptions({
      onSuccess: (res) => {
        setDoc(res);
        Update.setTitle(res.Title);
        Update.setModalOpen(false);
        setInputDisabled(false);
      },
      onError: () => {
        alert("Couldn't update, check console for error");
        setInputDisabled(false);
      },
    })
  );
  const updateContentFunc = useCallback(() => {
    const sanitizedTitle = sanitizeStringForFileName(Update.Data.Title);
    if (!sanitizedTitle) {
      alert("Title must not be blank");
      Update.setTitle("");
      return;
    }
    const content = {
      ...Update.Data,
      Title: sanitizedTitle,
      id: doc.id,
    };
    setInputDisabled(true);
    updateContentModified.mutate(content);
  }, [Update.Data, doc.id]);

  const removeContentsMutaion = useMutation(
    orpc.main.deleteData.mutationOptions({
      onSuccess: () => {
        navigate("/server");
      },
      onError: () => {
        alert("delete contents failed, check console for error");
      },
    })
  );
  const removeContent = useCallback(() => {
    removeContentsMutaion.mutate([id]);
  }, [id]);

  const value: DocContext = useMemo(
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
    if (!serverUrl) return;
    getDocMutation.mutate(id);
  }, [id, serverUrl]);

  if (getDocMutation.isPending || !doc.Title)
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
        inputDisabled={inputDisabled}
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
