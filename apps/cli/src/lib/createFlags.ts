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
        const errMsg = "No site tag found for cookies";
        spinner.stopAndPersist({
          symbol: colors.red("✗"),
          text: colors.dim(errMsg),
        });
        return errMsg;
      }
      const siteName = siteTag.split(":")[1];
      const fileExists = existsSync(`./cookies/${siteName}.txt`);
      if (!fileExists) {
        const errMsg = `No cookies file found for site ${siteName}`;
        spinner.stopAndPersist({
          symbol: colors.red("✗"),
          text: colors.dim(errMsg),
        });
        return errMsg;
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
    if (!item.cover) {
      const errMsg = `No cover found`;
      spinner.stopAndPersist({
        symbol: colors.red("✗"),
        text: colors.dim(errMsg),
      });
      return errMsg;
    }
    const ext = getImageExtensionFromURL(item.cover);
    await downloadContent(
      item.cover,
      `${TMP_DIR}/cover.${item.title}.${item.id}.${ext}`,
    );
    spinner.text = `${colors.green(
      "✔",
    )} Successfully downloaded cover image of "${item.title}"`;
  }
  return flags;
}
