import type { BackUpType } from "@tagapp/utils/types";
import { useAtomValue } from "jotai";
import { Download } from "lucide-react";
import { useCallback } from "react";
import { SettingField } from "@/components/craft/Settings";
import { Button } from "@/components/ui/button";
import { contentDataAtom } from "@/entrypoints/main/atoms";
import { parentTagsAtom, tagsAtom } from "@/entrypoints/main/atoms/tags";
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
    <SettingField
      label="Back up"
      help="Downloads a JSON file you can restore later or on another profile."
    >
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleAll} variant="outline" size="sm">
          <Download />
          Everything
        </Button>
        <Button onClick={handleContentData} variant="outline" size="sm">
          <Download />
          Items only
        </Button>
        <Button onClick={handleTags} variant="outline" size="sm">
          <Download />
          Tags only
        </Button>
      </div>
    </SettingField>
  );
}
