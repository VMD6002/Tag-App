import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import MarkdownPlugin from "@goodforyou/vite-plugin-markdown-import";
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  outDir: "dist",
  srcDir: "src",
  modules: ["@wxt-dev/auto-icons", "@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss(), MarkdownPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // or "./src" if using src directory
      },
    },
  }),
  manifest: {
    name: "TagApp Extension",
    // version: "1.0.0",
    // description: "TagApp Extension",
    permissions: ["storage"],
    browser_specific_settings: {
      gecko: {
        id: "tagAppExtension@dev.com",
      },
    },
    web_accessible_resources: [
      {
        resources: ["all-script-userscript.js"],
        matches: ["*://*/*"],
      },
    ],
  },
});
