import { readdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { writeFileSync, mkdirSync } from "node:fs";
import colors from "yoctocolors";
import type YTDlpWrap from "yt-dlp-wrap-plus";
const { default: YTDlpWrapRuntime } = require("yt-dlp-wrap-plus");
import ora from "ora";

import { createFlag } from "./lib/createFlags";
import { TMP_DIR, COMPLETED_DIR } from "./lib/constants";
import { downloadImage } from "./lib/downloadImage";
import { getImageExtensionFromURL } from "./lib/getImageExtensionFromURL";
import select from "@inquirer/select";

let jsonString: string;
try {
  jsonString = await readFile("tmp.json", "utf-8");
  writeFileSync("tmp.backup.json", jsonString);
} catch {
  console.error(colors.red("No tmp.json file"));
  console.log(colors.bold("Exiting..."));
  process.exit(1);
}
const downloadData: DownloadItem[] = JSON.parse(jsonString);

let answer;
try {
  answer = await select({
    message:
      "Running the script will\n\n\
    - Clean tmp folder\n\
    - Wipe the error.log\n\
    - Overwrite tmp.backup.json\n\n\
  Are you sure you want to continue?",
    default: "Yes",
    choices: [
      {
        name: "Yes",
        value: true,
      },
      {
        name: "no",
        value: false,
      },
    ],
  });
} catch {}

if (!answer) {
  console.log(colors.bold("Exiting..."));
  process.exit(1);
}

rmSync(TMP_DIR, { force: true, recursive: true });
mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(COMPLETED_DIR, { recursive: true });

rmSync("./error.log", { force: true, recursive: true });
writeFileSync("./error.log", "Error Logs:\n");

let spinner = ora("Loading...");

const ytDlpWrap: YTDlpWrap = new YTDlpWrapRuntime();

function onComplete(item: DownloadItem, errorMassage?: string) {
  if (errorMassage) {
    spinner = spinner.stopAndPersist({
      symbol: colors.red("✖"),
      text: `Failed to download "${item.Title}"`,
    });
    const newErrorEntry = `[${new Date().toISOString()}] - ${
      item.Title
    }:\n${errorMassage}\n`;

    const prevLog = readFileSync("./error.log", "utf-8");
    writeFileSync(
      "./error.log",
      `${prevLog}\n\n=============\n${newErrorEntry}=============`
    );

    rmSync(TMP_DIR, { force: true, recursive: true });
    mkdirSync(TMP_DIR, { recursive: true });
    return;
  }

  spinner = spinner.stopAndPersist({
    symbol: colors.green("✔"),
    text: `Successfully downloaded "${item.Title}"`,
  });

  const files = readdirSync("tmp");
  for (const file of files)
    renameSync(`${TMP_DIR}/${file}`, `${COMPLETED_DIR}/${file}`);

  const tmp: contentJsonType = { ...item };
  delete tmp.CoverUrl;
  delete tmp.Download;
  delete tmp.Url;
  writeFileSync(
    `${COMPLETED_DIR}/${tmp.Title}.json`,
    JSON.stringify(tmp, null, 2)
  );

  const newDownloadData = downloadData.filter((i) => i.id !== item.id);
  writeFileSync("tmp.json", JSON.stringify(newDownloadData, null, 2));
}

if (!downloadData.length) {
  console.log(colors.bold("No downloads found, Exiting"));
  process.exit(0);
}

console.log(colors.bold(`Downloads`));

for (const item of downloadData) {
  spinner.start(`Processing: "${item.Title}"`);

  if (item.Download.type !== "yt-dlp") {
    try {
      const coverExt = getImageExtensionFromURL(item.CoverUrl);
      spinner.text = "Downloading Cover...";
      await downloadImage(
        item.CoverUrl,
        `${TMP_DIR}/cover.${item.Title}.${coverExt}`
      );
      spinner.text = `Downloaded Cover`;
      spinner.text = `Downloadeding Image...`;

      const imgURL = item.Download.flags as string;
      const imgExt = getImageExtensionFromURL(imgURL);
      spinner.text = "Downloading image...";
      await downloadImage(imgURL, `${TMP_DIR}/${item.Title}.${imgExt}`);

      onComplete(item);
    } catch (err: Error | any) {
      onComplete(item, err?.message ?? "Unknown Error");
    }
    continue;
  }

  const flags = await createFlag(item, spinner);

  ytDlpWrap
    .exec(flags)
    .on("progress", (progress) => {
      let progressString = `Downloading: "${item.Title}"`;
      progress.percent &&
        (progressString += ` | Progress: ${progress.percent.toFixed(2)}%`);
      progress.eta && (progressString += ` | ETA: ${progress.eta}`);
      progress.currentSpeed &&
        (progressString += ` | Download: ${progress.currentSpeed}`);
      spinner.text = progressString;
    })
    .on("error", (err) => onComplete(item, err.message))
    .on("close", (code) => {
      if (code !== 0 && code !== null) onComplete(item, "Unknown Error");
      else onComplete(item);
    });
}
