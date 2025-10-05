import { createContext, useContext, useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
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
  const { id } = useRoute("/server/:contentType/:id")[1] as { id: string };
  const [doc, setDoc] = useState<ContentType>(docPlaceholderData);

  const getDocQuery = useQuery(
    orpc.main.getDoc.queryOptions({
      input: id,
    })
  );

  useEffect(() => {
    if (!getDocQuery.data?.id) return;
    setDoc(getDocQuery.data);
    setTimeout(
      () => (document.title = `${document.title} - ${getDocQuery.data?.Title}`),
      0
    );
  }, [getDocQuery.data]);

  if (getDocQuery.isLoading) return <Spinner />;

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
