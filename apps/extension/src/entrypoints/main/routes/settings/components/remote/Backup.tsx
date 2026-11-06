import type { BackUpType } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Download } from "lucide-react";
import { SettingField } from "@/components/craft/Settings";
import { Button } from "@/components/ui/button";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";
import saveJsonFile from "@/lib/saveJsonFile";

function getLocalDateStringWithTime() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year} ${month} ${day} ${hour}h ${minute}m ${seconds}s`;
}

const saveBackUpFile = (data: BackUpType, fileName: string) => {
  saveJsonFile(data, fileName);
};

export default function RemoteBackup() {
  const orpc = useAtomValue(orpcAtom);
  const getAllDataMutation = useMutation(
    orpc.restoreAndBackup.backup.mutationOptions({
      onSuccess: (data) => {
        saveBackUpFile(
          data,
          `Remote Tags And ContentData Backup.${getLocalDateStringWithTime()}`,
        );
      },
    }),
  );

  return (
    <SettingField
      label="Back up"
      help="Downloads a JSON copy of what's on the server. You can restore it later or into another server."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => getAllDataMutation.mutate({ type: "All" })}
          variant="outline"
          size="sm"
        >
          <Download />
          Everything
        </Button>
        <Button
          onClick={() => getAllDataMutation.mutate({ type: "contentData" })}
          variant="outline"
          size="sm"
        >
          <Download />
          Items only
        </Button>
        <Button
          onClick={() => getAllDataMutation.mutate({ type: "tags" })}
          variant="outline"
          size="sm"
        >
          <Download />
          Tags only
        </Button>
      </div>
    </SettingField>
  );
}
