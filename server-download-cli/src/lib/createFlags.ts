import { TMP_DIR } from "./constants";
import { downloadImage } from "./downloadImage";
import { getImageExtensionFromURL } from "./getImageExtensionFromURL";
import colors from "yoctocolors";
import type { Ora } from "ora";

const DEFAULT_FLAGS = ["--embed-thumbnail", "-R", "3"];

export async function createFlag(item: DownloadItem, spinner: Ora) {
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
    spinner.text = "Downloading custom cover image...";
    const ext = getImageExtensionFromURL(item.CoverUrl);
    await downloadImage(item.CoverUrl, `${TMP_DIR}/cover.${item.Title}.${ext}`);
    spinner = spinner.stopAndPersist({
      symbol: colors.green("✔"),
      text: `Successfully downloaded cover image of "${item.Title}"`,
    });
  }
  return flags;
}
