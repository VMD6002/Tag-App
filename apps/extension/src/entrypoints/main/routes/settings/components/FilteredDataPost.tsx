import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filteredDataPostServerUrlAtom } from "../../../atoms/settings";

export default function FilteredDataPost() {
  const [filteredDataPostUrl, setFilteredDataPostUrl] = useAtom(
    filteredDataPostServerUrlAtom,
  );
  const [buffer, setBuffer] = useState(filteredDataPostUrl);

  useEffect(() => {
    setBuffer(filteredDataPostUrl);
  }, [filteredDataPostUrl]);

  return (
    <section className="max-w-xs w-full">
      <div className="grid w-full items-center">
        <Label className="text-lg">Filtered data post server address</Label>
        <Input
          className="my-2"
          type="url"
          value={buffer}
          onChange={(o) => setBuffer(o.target.value)}
          placeholder="filtered data post server, eg: http://localhost:5001"
        />
      </div>
      <Button
        size="sm"
        onClick={() => {
          setFilteredDataPostUrl(buffer);
          toast.success("Successfully set Filtered data post server address");
        }}
      >
        Update
      </Button>
    </section>
  );
}
