import chalk from "chalk";
import { TMP_DIR } from "./constants";
import { downloadImage } from "./downloadImage";
import { getImageExtensionFromURL } from "./getImageExtensionFromURL";

const DEFAULT_FLAGS = ["--embed-thumbnail", "-R", "3"];

export async function createFlag(item: DownloadItem) {
  const flags = [
    item.Url,
    "-o",
    `${TMP_DIR}/${item.Title}.%(ext)s`,
    ...DEFAULT_FLAGS,
  ];
  if (item.Download.flags) {
    const preset = item.Download.flags as preset;
    flags.push(...preset.value.replace(/"|' /g, "").split(" "));
    if (preset.cookies) {
      const siteTag = item.Tags.find((tag) => tag.startsWith("Site:"));
      const siteName = siteTag!.split(":")[1];
      flags.push("--cookies", `${siteName}.txt`);
    }
  }
  if (!item.Tags.includes("Util:Different_Cover"))
    flags.push(
      "--write-thumbnail",
      "-o",
      `thumbnail:${TMP_DIR}/cover.${item.Title}.%(ext)s`
    );
  else {
    console.log(chalk.italic("Downloading custom cover image..."));
    const ext = getImageExtensionFromURL(item.CoverUrl);
    await downloadImage(item.CoverUrl, `${TMP_DIR}/cover.${item.Title}.${ext}`);
    console.log(chalk.green.dim("Downloaded custom cover image"));
  }
  return flags;
}
