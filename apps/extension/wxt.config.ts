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
  manifest: ({ command }) => {
    const key = process.env.EXTENSION_PUBLIC_KEY;

    // Logic: Only apply the key if we are BUILDING (production/zip)
    // In 'dev' mode (npm run dev), Chrome will use the default path-based ID
    const isProd = command === "build";

    if (isProd && !key) {
      console.warn("\n⚠️  WARNING: EXTENSION_PUBLIC_KEY is missing from .env!");
      console.warn(
        "   The Extension ID will not be persistent across portable drives.\n",
      );
    }

    return {
      name: "TagApp Extension",
      // Apply key only during build
      key: isProd ? key : undefined,

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
    };
  },
});
