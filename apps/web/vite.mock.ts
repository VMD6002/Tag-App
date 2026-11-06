// Dev-only helpers for the #/mock pages (see src/mock). Never imported by the production build.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { AliasOptions, Plugin } from "vite";

const webSrc = path.resolve(__dirname, "./src");
const extSrc = path.resolve(__dirname, "../extension/src");

/** `@/` means the web src, except for files that live in the extension, where it means the extension src. */
export const mockAliases: AliasOptions = [
  {
    find: /^@\//,
    replacement: `${webSrc}/`,
    customResolver(this: any, updated: string, importer?: string) {
      const target =
        importer?.startsWith(extSrc) && updated.startsWith(webSrc)
          ? path.join(extSrc, updated.slice(webSrc.length))
          : updated;
      return this.resolve(target, importer, { skipSelf: true });
    },
  },
];

/** The extension imports Notes/*.md through a markdown plugin; serve it as `{ body }` here. */
export const mockMarkdown = (): Plugin => ({
  name: "tagapp-mock-markdown",
  enforce: "pre",
  load(id) {
    const file = id.split("?")[0] as string;
    if (!file.endsWith(".md")) return null;
    return `export default ${JSON.stringify({ body: readFileSync(file, "utf8") })}`;
  },
});
