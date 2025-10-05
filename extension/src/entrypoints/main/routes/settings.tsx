import TitleHeader from "@/components/craft/TitleHeader";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import saveJsonFile from "@/lib/saveJsonFile";
import z from "zod";

const ContentDataSchema = z.object({
  id: z.string(),
  Title: z.string(),
  CoverUrl: z.string(),
  Tags: z.array(z.string()),
  Download: z
    .object({
      type: z.enum(["yt-dlp", "curl"]),
      flags: z.union([z.any(), z.string()]).optional(), // Replace `z.any()` with your MultiSelectOption schema if defined
    })
    .optional(),
  Url: z.string().optional(),
  Added: z.string(),
  LastUpdated: z.string(),
  extraData: z.string(),
  Type: z.enum(["img", "video", "ImgSet", "VideoSet"]).optional(),
  ext: z.array(z.string()).optional(),
});

const TagTypeSchema = z.record(
  z.string(),
  z.object({
    Count: z.number(),
    CoverUrl: z.string().optional(),
  })
);

const BackUpSchema = z.object({
  contentData: z.record(z.string(), ContentDataSchema),
  tags: TagTypeSchema,
});

const Restore = ({
  setContentData,
  setTags,
}: {
  setContentData: (aaa: any) => void;
  setTags: (aaa: any) => void;
}) => {
  const [overwrite, setOverwrite] = useState(false);

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
            setContentData(() => data.contentData);
            setTags(() => data.tags);
            return;
          } else {
            // @ts-ignore
            setContentData((old) => ({ ...old, ...data.contentData }));
            // @ts-ignore
            setTags((old) => ({ ...old, ...data.tags }));
          }
          alert(
            `Successfully restored Tags and ContentData by ${overwrite ? "Overwriting" : "Merging"}`
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite]
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
          }
          // @ts-ignore
          else setTags((old) => ({ ...old, ...data.tags }));
          alert(
            `Successfully restored Tags by ${overwrite ? "Overwriting" : "Merging"}`
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite]
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
            setContentData(() => data.contentData);
            return;
          } else {
            // @ts-ignore
            setContentData((old) => ({ ...old, ...data.contentData }));
          }
          alert(
            `Successfully restored ContentData by ${overwrite ? "Overwriting" : "Merging"}`
          );
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
      event.target.value = null;
    },
    [overwrite]
  );

  return (
    <section className="max-w-xs w-full grid gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl text-muted-foreground">Restore Backup</h3>
        <div className="flex space-x-3">
          <Label>Overwrite</Label>
          <Switch
            checked={overwrite}
            onCheckedChange={(o) => setOverwrite(o)}
          />
        </div>
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2 text-muted-foreground">All</Label>
        <Input
          type="file"
          accept=".json,application/json"
          onChange={restoreAll}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2 text-muted-foreground">Only ContentData</Label>
        <Input
          disabled
          type="file"
          accept=".json,application/json"
          onChange={restoreContentData}
          placeholder="Select backup file to restore"
        />
      </div>
      <div className="grid w-full items-center">
        <Label className="mb-2 text-muted-foreground">Only Tags</Label>
        <Input
          disabled
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

function BackUp({
  contentData,
  tags,
}: {
  contentData: ContentDataType;
  tags: TagType;
}) {
  const handleAll = useCallback(() => {
    saveJsonFile(
      {
        contentData,
        tags,
      },
      `Tags And ContentData Backup.${getLocalDateStringWithTime()}.json`
    );
  }, [contentData, tags]);
  const handleTags = useCallback(() => {
    saveJsonFile(
      {
        contentData: {},
        tags,
      },
      `Tags Only Backup.${getLocalDateStringWithTime()}.json`
    );
  }, [tags]);
  const handleContentData = useCallback(() => {
    saveJsonFile(
      {
        contentData,
        tags: {},
      },
      `ContentData Only Backup.${getLocalDateStringWithTime()}.json`
    );
  }, [contentData]);
  return (
    <section className="max-w-xs w-full grid gap-3">
      <h3 className="text-xl mb-3 text-muted-foreground">Backup Data</h3>
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

const Other = ({
  imgSetWidth,
  setImgSetWidth,
}: {
  imgSetWidth: string | number;
  setImgSetWidth: (aaa: string | number) => void;
}) => {
  return (
    <section className="max-w-xs w-full">
      <h3 className="text-xl mb-3">ImgSet</h3>
      <Label className="text-sm mb-1">Width {imgSetWidth}%</Label>
      <Slider
        value={[Number(imgSetWidth)]}
        onValueChange={(o) => setImgSetWidth(o[0])}
        max={100}
        step={1}
      />
    </section>
  );
};

const Server = ({
  serverFeatures,
  setServerFeatures,
  serverUrl,
  setServerUrl,
}: {
  serverFeatures: boolean;
  setServerFeatures: (aaa: boolean) => void;
  serverUrl: string;
  setServerUrl: (aaa: string) => void;
}) => {
  const [serverUrlBuffer, setServerUrlBuffer] = useState("");
  useEffect(() => setServerUrlBuffer(serverUrl), [serverUrl]);
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
  const {
    serverFeatures,
    setServerFeatures,
    serverUrl,
    setServerUrl,
    imgSetWidth,
    setImgSetWidth,
  } = useSettingsData();
  const { contentData, setContentData } = useContentData();
  const { tags, setTags } = useTagData();
  return (
    <>
      <TitleHeader Title="Settings" />
      <div className="mx-auto grid sm:grid-cols-2 gap-x-6 w-fit">
        <div className="space-y-6">
          <Restore setContentData={setContentData} setTags={setTags} />
          <Other imgSetWidth={imgSetWidth} setImgSetWidth={setImgSetWidth} />
        </div>
        <div className="space-y-6">
          <BackUp contentData={contentData} tags={tags} />
          <Server
            serverFeatures={serverFeatures}
            serverUrl={serverUrl}
            setServerFeatures={setServerFeatures}
            setServerUrl={setServerUrl}
          />
        </div>
      </div>
    </>
  );
}
