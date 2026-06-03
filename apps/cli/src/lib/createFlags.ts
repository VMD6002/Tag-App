import { TMP_DIR } from "./constants";
import { downloadContent } from "./downloadContent";
import { getImageExtensionFromURL } from "./getImageExtensionFromURL";
import colors from "yoctocolors";
import type { Ora } from "ora";
import type { ContentWebType, preset } from "@tagapp/utils/types";
import { existsSync } from "node:fs";

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
      if (!siteTag) {
        spinner.stopAndPersist({
          symbol: colors.red("✗"),
          text: colors.dim("No site tag found for cookies"),
        });
        return false;
      }
      const siteName = siteTag.split(":")[1];
      const fileExists = existsSync(`./cookies/${siteName}.txt`);
      if (!fileExists) {
        spinner.stopAndPersist({
          symbol: colors.red("✗"),
          text: colors.dim(`No cookies file found for site ${siteName}`),
        });
        return false;
      }
      flags.push("--cookies", `./cookies/${siteName}.txt`);
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
    await downloadContent(
      item.coverUrl,
      `${TMP_DIR}/cover.${item.title}.${item.id}.${ext}`,
    );
    spinner.text = `${colors.green(
      "✔",
    )} Successfully downloaded cover image of "${item.title}"`;
  }
  return flags;
}
