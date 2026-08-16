import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import MarkdownPlugin from "@goodforyou/vite-plugin-markdown-import";
import react from "@vitejs/plugin-react";
import path from "path";
import { EXTENSION_ID } from "./src/lib/CONSTANTS";

// See https://wxt.dev/api/config.html
export default defineConfig({
  outDir: "dist",
  srcDir: "src",
  modules: ["@wxt-dev/auto-icons"],
  vite: () => ({
    plugins: [
      react(), // <--- Uses standard react plugin with built-in fast transformations
      tailwindcss(),
      MarkdownPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),

        // Below path related fixes to supress filenamify warnings
        "node:path": "path-browserify", // <--- Polyfills node:path for browser
        path: "path-browserify", // <--- Polyfills path for browser
      },
    },
    build: {
      target: "es2022",
      chunkSizeWarningLimit: 2000, // raises limit to 2MB to hide the warning temporarily
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
      sandbox: {
        pages: ["sandbox.html"],
      },
      permissions: ["storage"],
      host_permissions: ["<all_urls>"],
      browser_specific_settings: {
        gecko: {
          id: EXTENSION_ID,
        },
      },
      web_accessible_resources: [
        {
          resources: [
            "all-script-userscript.js",
            "sandbox.html",
            "favicon.ico",
          ],
          matches: ["*://*/*"],
        },
      ],
    };
  },
});
