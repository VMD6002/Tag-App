import { createContext, useContext, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useRoute } from "wouter";
import { orpc } from "@/lib/orpc";
import Spinner from "@/components/craft/Spinner";

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
  orpc: typeof orpc;
}

const DocContext = createContext<DocContext | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useDoc() {
  return useContext(DocContext);
}

export function Child({ children }: { children: React.ReactNode }) {
  const { id } = useRoute("/:contentType/:id")[1] as { id: string };
  const [doc, setDoc] = useState<ContentType>(docPlaceholderData);

  const getDocMutation = useMutation(
    orpc.main.getDoc.mutationOptions({
      onSuccess: (res) => {
        setDoc(res);
        setTimeout(
          () => (document.title = document.title + " - " + res.Title),
          100
        );
      },
    })
  );

  useEffect(() => {
    getDocMutation.mutate(id);
  }, [id]);

  if (getDocMutation.isPending) return <Spinner />;

  return (
    <DocContext.Provider
      value={{
        doc,
        orpc,
      }}
    >
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
