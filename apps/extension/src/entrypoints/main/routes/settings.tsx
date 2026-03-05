import TitleHeader from "@/components/craft/TitleHeader";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import saveJsonFile from "@/lib/saveJsonFile";
import z from "zod";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { tagsAtom } from "../atoms/tags";
import { contentDataAtom } from "../atoms/contentData";
import {
  galleryListWidthAtom,
  serverFeaturesAtom,
  serverUrlAtom,
} from "../atoms/settings";
import { contentWebSchema } from "@tagapp/utils/types";

const TagTypeSchema = z.record(
  z.string(),
  z.object({
    Count: z.number(),
    CoverUrl: z.string().optional(),
  }),
);

const BackUpSchema = z.object({
  contentData: z.record(z.string(), contentWebSchema),
  tags: TagTypeSchema,
});

const Restore = () => {
  const [overwrite, setOverwrite] = useState(false);
  const setContentData = useSetAtom(contentDataAtom);
  const setTags = useSetAtom(tagsAtom);

  const restoreAll = useCallback(
    (event: any) => {
      if (
        overwrite &&
        !confirm("U sure want to overwrite ContentData and Tags ?")
      ) {
        event.target.value = null;
        return;
      }
      const file = event.target.files?.[0];
      if (!file) return;

      file
        .text()
        .then((text: string) => JSON.parse(text))
        .then((parsedData: Record<string, any>) => {
          const validator = BackUpSchema.safeParse(parsedData);
          if (!validator.success) {
            alert(validator.error.message);
            return;
          }
          const data = validator.data;
          if (overwrite) {
            setContentData(data.contentData);
            setTags(data.tags);
            return;
          } else {
            setContentData((old) => ({ ...old, ...data.contentData }));
            setTags((old) => ({ ...old, ...data.tags }));
          }
          alert(
            `Successfully restored Tags and ContentData by ${
              overwrite ? "Overwriting" : "Merging"
            }`,
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite],
  );

  const restoreTags = useCallback(
    (event: any) => {
      if (overwrite && !confirm("U sure want to overwrite Tags ?")) {
        event.target.value = null;
        return;
      }
      const file = event.target.files?.[0];
      if (!file) return;

      file
        .text()
        .then((text: string) => JSON.parse(text))
        .then((parsedData: Record<string, any>) => {
          const validator = BackUpSchema.safeParse(parsedData);
          if (!validator.success) {
            alert(validator.error.message);
            return;
          }
          const data = validator.data;
          if (overwrite) {
            setTags(() => data.tags);
          } else setTags((old) => ({ ...old, ...data.tags }));
          alert(
            `Successfully restored Tags by ${
              overwrite ? "Overwriting" : "Merging"
            }`,
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite],
  );

  const restoreContentData = useCallback(
    (event: any) => {
      if (overwrite && !confirm("U sure want to overwrite contentData ?")) {
        event.target.value = null;
        return;
      }
      const file = event.target.files?.[0];
      if (!file) return;

      file
        .text()
        .then((text: string) => JSON.parse(text))
        .then((parsedData: Record<string, any>) => {
          const validator = BackUpSchema.safeParse(parsedData);
          if (!validator.success) {
            alert(validator.error.message);
            return;
          }
          const data = validator.data;
          if (overwrite) {
            setContentData(data.contentData);
            return;
          } else {
            setContentData((old) => ({ ...old, ...data.contentData }));
          }
          alert(
            `Successfully restored ContentData by ${
              overwrite ? "Overwriting" : "Merging"
            }`,
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite],
  );

  return (
    <section className="max-w-xs w-full grid gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl">Restore Backup</h3>
        <div className="flex space-x-3">
          <Label>Overwrite</Label>
          <Switch
            checked={overwrite}
            onCheckedChange={(o) => setOverwrite(o)}
          />
        </div>
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">All</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreAll}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">Only ContentData</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreContentData}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2">Only Tags</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreTags}
          placeholder="Select backup file to restore"
        />
      </div>
    </section>
  );
};

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

function BackUp() {
  const contentData = useAtomValue(contentDataAtom);
  const tags = useAtomValue(tagsAtom);
  const handleAll = useCallback(() => {
    saveJsonFile(
      {
        contentData,
        tags,
      },
      `Tags And ContentData Backup.${getLocalDateStringWithTime()}.json`,
    );
  }, [contentData, tags]);
  const handleTags = useCallback(() => {
    saveJsonFile(
      {
        contentData: {},
        tags,
      },
      `Tags Only Backup.${getLocalDateStringWithTime()}.json`,
    );
  }, [tags]);
  const handleContentData = useCallback(() => {
    saveJsonFile(
      {
        contentData,
        tags: {},
      },
      `ContentData Only Backup.${getLocalDateStringWithTime()}.json`,
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

const Other = () => {
  const [galleryListWidth, setGalleryListWidth] = useAtom(galleryListWidthAtom);
  return (
    <section className="max-w-xs w-full">
      <h3 className="text-xl mb-3">ImgSet</h3>
      <Label className="text-sm mb-1">Width {galleryListWidth}%</Label>
      <Slider
        value={[Number(galleryListWidth)]}
        onValueChange={(o) => setGalleryListWidth(o[0])}
        max={100}
        step={1}
      />
    </section>
  );
};

const Server = () => {
  const [serverFeatures, setServerFeatures] = useAtom(serverFeaturesAtom);
  const [serverUrl, setServerUrl] = useAtom(serverUrlAtom);
  const [serverUrlBuffer, setServerUrlBuffer] = useState(serverUrl);

  return (
    <section className="max-w-xs w-full">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-xl">Server Features</Label>
        <Switch
          checked={serverFeatures}
          onCheckedChange={(newVal) => setServerFeatures(newVal)}
        />
      </div>
      <div className="grid w-full items-center">
        <Label className={serverFeatures ? "" : "text-foreground/30"}>
          Server Address
        </Label>
        <Input
          className="my-2"
          disabled={!serverFeatures}
          type="url"
          value={serverUrlBuffer}
          onChange={(o) => setServerUrlBuffer(o.target.value)}
          placeholder="server address, eg: http://localhost:3000"
        />
      </div>
      <Button
        disabled={!serverFeatures}
        size="sm"
        onClick={() => setServerUrl(serverUrlBuffer)}
      >
        Update
      </Button>
    </section>
  );
};

export default function Settings() {
  return (
    <>
      <TitleHeader Title="Settings" />
      <div className="mx-auto grid sm:grid-cols-2 gap-x-6 w-fit">
        <div className="space-y-6">
          <Restore />
          <Other />
        </div>
        <div className="space-y-6">
          <BackUp />
          <Server />
        </div>
      </div>
    </>
  );
}
