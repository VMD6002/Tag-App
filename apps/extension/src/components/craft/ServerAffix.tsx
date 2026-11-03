import type { ContentWebType } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { ServerIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { filteredDataPostServerUrlAtom } from "@/entrypoints/main/atoms/settings";

export default function ServerAffix({
  filtered,
}: {
  filtered: ContentWebType[];
}) {
  const filteredDataPostUrl = useAtomValue(filteredDataPostServerUrlAtom);

  const postMuation = useMutation({
    mutationFn: (filtered: ContentWebType[]) => {
      return fetch(filteredDataPostUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtered),
      });
    },
    onSuccess: () => {
      toast.success("Filtered data posted successfully");
    },
    onError: () => {
      toast.error("Error posting filtered data");
    },
  });

  const onClick = () => {
    postMuation.mutate(filtered);
  };

  if (!filteredDataPostUrl) return null;

  return (
    <Button
      size="icon-lg"
      variant="outline"
      className="fixed top-auto bottom-5 left-auto right-5"
      onClick={onClick}
    >
      <ServerIcon />
    </Button>
  );
}
