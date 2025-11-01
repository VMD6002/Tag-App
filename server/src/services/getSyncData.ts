import { randomUUID } from "node:crypto";
import { readFile, writeFile, stat, readdir, rename } from "node:fs/promises";
import { pathExists } from "fs-extra/esm";
import getCtype from "../lib/getCtype.js";
import type { ContentJsonType } from "../types/global.js";
import { exists } from "fs-extra";

type contentType = "img" | "video" | "ImgSet" | "VideoSet";

interface UnSplittedDataType extends Omit<ContentJsonType, "Url" | "CoverUrl"> {
  Url?: string;
  CoverUrl?: string;
}

const Folders: Set<string> = new Set();
const Files: Set<string> = new Set();
const NewContents = new Map();

function AddToNewContents(
  Temp: ContentJsonType,
  FileExt: string[],
  Ctype: contentType
) {
  NewContents.set(Temp.id, {
    ...Temp,
    Type: Ctype,
    ext: FileExt,
  });
}

async function GenerateAndAddToNewContents(
  Name: string,
  FileExt: string[],
  Ctype: contentType,
  TimePath: string
) {
  const Temp = randomUUID();
  const Time = Math.floor((await stat(TimePath)).mtime.getTime() / 1000);
  const JsonData = {
    id: Temp,
    Title: Name,
    Tags: [],
    Added: Time,
    LastUpdated: Time,
    extraData: `Generated Data`,
  };
  await writeFile(`./Sync/${Name}.json`, JSON.stringify(JsonData));
  NewContents.set(Temp, {
    ...JsonData,
    Type: Ctype,
    ext: FileExt,
  });
}

async function ReadJSONFile(path: string) {
  const jsonString = await readFile(path, "utf-8");
  return JSON.parse(jsonString);
}

export async function getSyncData() {
  (await readdir("./Sync", { withFileTypes: true })).filter((j) =>
    j.isDirectory() ? Folders.add(j.name) : Files.add(j.name)
  );

  for await (const file of Files) {
    if (!file.startsWith("tdata.") || !file.endsWith(".json")) continue;

    const UnSplittedData: UnSplittedDataType[] = await ReadJSONFile(
      `./Sync/${file}`
    );
    for (const Key in UnSplittedData) {
      delete UnSplittedData[Key].Url;
      delete UnSplittedData[Key].CoverUrl;
      await writeFile(
        `./Sync/${UnSplittedData[Key].Title}.json`,
        JSON.stringify(UnSplittedData[Key])
      );
    }
    Files.delete(file);
  }

  const CoverFiles = new Map();
  for (const file of Files) {
    if (file.startsWith("cover.")) {
      const [Ctype, FileExt, Name] = getCtype(file);
      if (Ctype === "invalid") continue;
      CoverFiles.set(Name.replace("cover.", ""), FileExt);
      Files.delete(file);
    }
  }

  for await (const file of Files) {
    const [Ctype, FileExt, Name] = getCtype(file);
    if (Ctype === "invalid") continue;
    switch (Ctype) {
      case "img":
        if (!CoverFiles.has(Name)) break;
        if (await pathExists(`./Sync/${Name}.json`)) {
          const JsonData: ContentJsonType = await ReadJSONFile(
            `./Sync/${Name}.json`
          );
          AddToNewContents(JsonData, [CoverFiles.get(Name), FileExt], Ctype);
          Files.delete(`${Name}.json`);
          Files.delete(file);
          break;
        }
        GenerateAndAddToNewContents(
          Name,
          [CoverFiles.get(Name), FileExt],
          Ctype,
          `./Sync/${file}`
        );
        Files.delete(file);
        break;
      case "video":
        if (!CoverFiles.has(Name)) break;
        const fileExts = [CoverFiles.get(Name), FileExt];
        if (await exists(`./Sync/caption.${Name}.vtt`)) {
          fileExts.push(true);
          Files.delete(`caption.${Name}.vtt`);
        }
        if (await pathExists(`./Sync/${Name}.json`)) {
          const JsonData = await ReadJSONFile(`./Sync/${Name}.json`);
          AddToNewContents(JsonData, fileExts, Ctype);
          Files.delete(`${Name}.json`);
        } else
          GenerateAndAddToNewContents(Name, fileExts, Ctype, `./Sync/${file}`);
        Files.delete(file);
        break;
    }
  }

  // Files Finished now for the folders
  for await (const folder of Folders) {
    if (!folder.endsWith("ImgSet")) continue;
    const Name = folder.slice(0, -7);
    const Thumb = (await readdir(`./Sync/${folder}`)).sort()[0];
    if (await pathExists(`./Sync/${Name}.json`)) {
      const JsonData: ContentJsonType = await ReadJSONFile(
        `./Sync/${Name}.json`
      );
      AddToNewContents(JsonData, [Thumb], "ImgSet");
      Files.delete(`${Name}.json`);
    } else {
      GenerateAndAddToNewContents(Name, [Thumb], "ImgSet", `./Sync/${folder}`);
    }
    Folders.delete(folder);
  }

  for await (const folder of Folders) {
    if (!folder.endsWith("VideoSet")) continue;
    const Name = folder.slice(0, -9);
    const Thumb = (await readdir(`./Sync/${folder}/covers`)).sort()[0];
    if (await pathExists(`./Sync/${Name}.json`)) {
      const JsonData: ContentJsonType = await ReadJSONFile(
        `./Sync/${Name}.json`
      );
      AddToNewContents(JsonData, [Thumb], "VideoSet");
      Files.delete(`${Name}.json`);
    } else {
      GenerateAndAddToNewContents(
        Name,
        [Thumb],
        "VideoSet",
        `./Sync/${folder}`
      );
    }
    Folders.delete(folder);
  }

  for await (const content of new Set([...Files, ...Folders])) {
    await rename(`./Sync/${content}`, `./UnSyncable/${content}`);
  }

  return Object.fromEntries(NewContents);
}
