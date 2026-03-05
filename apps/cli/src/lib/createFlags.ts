import { TMP_DIR } from "./constants";
import { downloadImage } from "./downloadImage";
import { getImageExtensionFromURL } from "./getImageExtensionFromURL";
import colors from "yoctocolors";
import type { Ora } from "ora";
import type { ContentWebType, preset } from "@tagapp/utils/types";

const DEFAULT_FLAGS = ["--embed-thumbnail", "-R", "3"];

export async function createFlag(item: ContentWebType, spinner: Ora) {
  const flags = [
    item.url,
    "-o",
    `${TMP_DIR}/${item.title}.${item.id}.%(ext)s`,
    ...DEFAULT_FLAGS,
  ];
  if (item.download.flags) {
    const preset = item.download.flags as preset;
    flags.push(...preset.value.replace(/"|' /g, "").split(" "));
    if (preset.cookies) {
      const siteTag = item.tags.find((tag) => tag.startsWith("Site:"));
      const siteName = siteTag!.split(":")[1];
      flags.push("--cookies", `${siteName}.txt`);
    }
  }
  if (!item.tags.includes("Util:Different_Cover"))
    flags.push(
      "--write-thumbnail",
      "-o",
      `thumbnail:${TMP_DIR}/cover.${item.title}.${item.id}.%(ext)s`,
    );
  else {
    spinner.text = "Downloading custom cover image...";
    const ext = getImageExtensionFromURL(item.coverUrl);
    await downloadImage(
      item.coverUrl,
      `${TMP_DIR}/cover.${item.title}.${item.id}.${ext}`,
    );
    spinner.text = `${colors.green(
      "✔",
    )} Successfully downloaded cover image of "${item.title}"`;
  }
  return flags;
}
