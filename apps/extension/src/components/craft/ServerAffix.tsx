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
    mutationFn: async (filtered: ContentWebType[]) => {
      const res = await fetch(filteredDataPostUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtered),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      return res;
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
      variant="outline"
      className="fixed top-auto right-5 bottom-5 left-auto z-30 h-9 gap-2 bg-background px-3 shadow-lg"
      onClick={onClick}
      disabled={postMuation.isPending}
      title={`Send the ${filtered.length} filtered items as JSON (POST) to ${filteredDataPostUrl}`}
    >
      <ServerIcon />
      {postMuation.isPending ? "Sending…" : `Send ${filtered.length} to server`}
    </Button>
  );
}
