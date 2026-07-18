import { Button } from "@/components/ui/button";
import saveJsonFile from "@/lib/saveJsonFile";
import { BackUpType } from "@tagapp/utils/types";
import { useMutation } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { orpcAtom } from "@/entrypoints/main/atoms/orpc";

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
    <section className="max-w-xs w-full grid gap-3">
      <h3 className="text-xl mb-3">Backup Data (Remote)</h3>
      <Button
        onClick={() => getAllDataMutation.mutate({ type: "All" })}
        variant={"outline"}
      >
        Backup All
      </Button>
      <Button
        onClick={() => getAllDataMutation.mutate({ type: "contentData" })}
        variant={"outline"}
      >
        Backup ContentData only
      </Button>
      <Button
        onClick={() => getAllDataMutation.mutate({ type: "tags" })}
        variant={"outline"}
      >
        Backup Tags only
      </Button>
    </section>
  );
}
