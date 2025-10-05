import { randomUUID } from "node:crypto";
import { readFile, writeFile, stat, readdir, rename } from "node:fs/promises";
import { pathExists } from "fs-extra/esm";
import getCtype from "../lib/getCtype.js";
import type { ContentJsonType } from "../schemas/contentData.js";

const GetDataFromJSON = async (path: string) => {
  const data = (await readFile(path)).toString();
  return JSON.parse(data);
};

interface UnSplittedDataType extends ContentJsonType {
  Url?: string;
  CoverUrl?: string;
}

type contentType = "img" | "video" | "ImgSet" | "VideoSet";

export async function getSyncData() {
  const Folders: Set<string> = new Set();
  const Files: Set<string> = new Set();
  (await readdir("./Sync", { withFileTypes: true })).filter((j) =>
    j.isDirectory() ? Folders.add(j.name) : Files.add(j.name)
  );
  const NewContents = new Map();

  const AddToNewContentsWithJson = (
    Temp: ContentJsonType,
    FileExt: string[],
    Ctype: contentType
  ) => {
    NewContents.set(Temp.id, {
      ...Temp,
      Type: Ctype,
      ext: FileExt,
    });
  };

  const Add_Generated_Data_To_NewContents = async (
    Name: string,
    FileExt: string[],
    Ctype: contentType,
    TimePath: string
  ) => {
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
  };

  for await (const file of Files) {
    if (!file.startsWith("tdata.") || !file.endsWith(".json")) continue;

    const UnSplittedData: UnSplittedDataType[] = await GetDataFromJSON(
      `./Sync/${file}`
    );
    for (const Key in UnSplittedData) {
      delete UnSplittedData[Key].Url;
      delete UnSplittedData[Key].CoverUrl;
      if (UnSplittedData[Key].Tags.includes("Type:Img"))
        // remove img extention from name
        UnSplittedData[Key].Title = UnSplittedData[Key].Title.split(".")
          .slice(0, -1)
          .join(".");
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
          const JsonData: ContentJsonType = await GetDataFromJSON(
            `./Sync/${Name}.json`
          );
          AddToNewContentsWithJson(
            JsonData,
            [CoverFiles.get(Name), FileExt],
            Ctype
          );
          Files.delete(`${Name}.json`);
          Files.delete(file);
          break;
        }
        Add_Generated_Data_To_NewContents(
          Name,
          [CoverFiles.get(Name), FileExt],
          Ctype,
          `./Sync/${file}`
        );
        Files.delete(file);
        break;
      case "video":
        if (await pathExists(`./Sync/${Name}.json`)) {
          const JsonData2 = await GetDataFromJSON(`./Sync/${Name}.json`);
          if (!CoverFiles.has(Name)) break;
          AddToNewContentsWithJson(
            JsonData2,
            [CoverFiles.get(Name), FileExt],
            Ctype
          );
          Files.delete(`${Name}.json`);
          Files.delete(file);
        } else if (CoverFiles.has(Name)) {
          Add_Generated_Data_To_NewContents(
            Name,
            [CoverFiles.get(Name), FileExt],
            Ctype,
            `./Sync/${file}`
          );
          Files.delete(file);
        }
        break;
    }
  }

  // Files Finished now for the folders
  for await (const folder of Folders) {
    if (!folder.endsWith("ImgSet")) continue;
    const Name = folder.slice(0, -7);
    const Thumb = (await readdir(`./Sync/${folder}`)).sort()[0];
    if (await pathExists(`./Sync/${Name}.json`)) {
      const JsonData: ContentJsonType = await GetDataFromJSON(
        `./Sync/${Name}.json`
      );
      AddToNewContentsWithJson(JsonData, [Thumb], "ImgSet");
      Files.delete(`${Name}.json`);
    } else {
      Add_Generated_Data_To_NewContents(
        Name,
        [Thumb],
        "ImgSet",
        `./Sync/${folder}`
      );
    }
    Folders.delete(folder);
  }

  // Files Finished now for the folders
  for await (const folder of Folders) {
    if (!folder.endsWith("VideoSet")) continue;
    const Name = folder.slice(0, -9);
    const Thumb = (await readdir(`./Sync/${folder}/covers`)).sort()[0];
    if (await pathExists(`./Sync/${Name}.json`)) {
      const JsonData: ContentJsonType = await GetDataFromJSON(
        `./Sync/${Name}.json`
      );
      AddToNewContentsWithJson(JsonData, [Thumb], "VideoSet");
      Files.delete(`${Name}.json`);
    } else {
      Add_Generated_Data_To_NewContents(
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
