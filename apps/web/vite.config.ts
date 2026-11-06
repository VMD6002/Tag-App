import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { mockAliases, mockMarkdown } from "./vite.mock";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // The #/mock pages render real extension components, so they need these in dev only.
    ...(command === "serve" ? [mockMarkdown()] : []),
  ],
  resolve: {
    alias:
      command === "serve"
        ? mockAliases
        : { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "../server/dist/WebUI",
  },
}));
