import { useEffect, useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { useRoute } from "wouter";
import { orpc } from "@/lib/orpc";
import type { ContentServerType } from "@tagapp/utils/types";
import constate from "constate";
import { Disc3 } from "lucide-react";

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

export function useDocContext() {
  const [doc, setDoc] = useState<ContentServerType>(docPlaceholderData);

  const getDocMutation = useMutation(
    orpc.main.getDoc.mutationOptions({
      onSuccess: (res) => {
        setDoc(res);
        setTimeout(
          () => (document.title = document.title + " - " + res.title),
          100,
        );
      },
    }),
  );

  const encodedTitle = useMemo(
    () => encodeURIComponent(`${doc.title}.${doc.id}`),
    [doc.title, doc.id],
  );

  return {
    doc,
    getDocMutation,
    encodedTitle,
  };
}

export const [Provider, useDoc] = constate(useDocContext);

export function Child({ children }: { children: React.ReactNode }) {
  const { doc, getDocMutation } = useDoc();
  const { id } = useRoute("/:contentType/:id")[1] as { id: string };

  useEffect(() => {
    getDocMutation.mutate(id);
  }, [id]);

  if (getDocMutation.isPending || !doc.title)
    return (
      <div className="h-[calc(100vh-8rem)] grid place-items-center">
        <Disc3 className="animate-spin" size={"4rem"} />
      </div>
    );

  return <>{children}</>;
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
