import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SaveRow, SettingField } from "@/components/craft/Settings";
import { Input } from "@/components/ui/input";
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
    <SettingField
      label="Send filtered results to"
      htmlFor="filtered-data-post-url"
      help="Optional. When set, the library shows a button that sends the currently filtered items to this address as JSON (an HTTP POST). Leave it empty to hide the button."
    >
      <Input
        id="filtered-data-post-url"
        className="max-w-md"
        type="url"
        value={buffer}
        onChange={(o) => setBuffer(o.target.value)}
        placeholder="http://localhost:5001/filtered"
      />
      <SaveRow
        dirty={buffer !== filteredDataPostUrl}
        onSave={() => {
          setFilteredDataPostUrl(buffer);
          toast.success("Results address saved");
        }}
      />
    </SettingField>
  );
}
