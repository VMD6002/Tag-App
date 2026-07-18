import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import saveJsonFile from "@/lib/saveJsonFile";
import { contentDataAtom } from "@/entrypoints/main/atoms";
import { parentTagsAtom, tagsAtom } from "@/entrypoints/main/atoms/tags";
import { BackUpType } from "@tagapp/utils/types";

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

export default function Backup() {
  const contentData = useAtomValue(contentDataAtom);
  const tags = useAtomValue(tagsAtom);
  const parentTags = useAtomValue(parentTagsAtom);

  const handleAll = useCallback(() => {
    saveBackUpFile(
      {
        contentData,
        tags,
        parentTags,
      },
      `Tags And ContentData Backup.${getLocalDateStringWithTime()}`,
    );
  }, [contentData, tags, parentTags]);

  const handleTags = useCallback(() => {
    saveBackUpFile(
      {
        contentData: {},
        tags,
        parentTags,
      },
      `Tags Only Backup.${getLocalDateStringWithTime()}`,
    );
  }, [tags, parentTags]);

  const handleContentData = useCallback(() => {
    saveBackUpFile(
      {
        contentData,
        tags: {},
        parentTags: {},
      },
      `ContentData Only Backup.${getLocalDateStringWithTime()}`,
    );
  }, [contentData]);

  return (
    <section className="max-w-xs w-full grid gap-3">
      <h3 className="text-xl mb-3">Backup Data</h3>
      <Button onClick={handleAll} variant={"outline"}>
        Backup All
      </Button>
      <Button onClick={handleContentData} variant={"outline"}>
        Backup ContentData only
      </Button>
      <Button onClick={handleTags} variant={"outline"}>
        Backup Tags only
      </Button>
    </section>
  );
}
