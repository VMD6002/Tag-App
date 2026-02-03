import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import { logger } from "hono/logger";

import { RPCHandler } from "@orpc/server/fetch";

import getDefaults from "./lib/getDefaults.js";
import createAppDirs from "./lib/createAppDirs.js";

import * as download from "./routers/download.js";
import * as fix from "./routers/fix.js";
import * as ImgSet from "./routers/ImgSet.js";
import * as main from "./routers/main.js";
import * as VideoSet from "./routers/VideoSet.js";
import * as webSync from "./routers/webSync.js";

const Defaults = getDefaults();
createAppDirs();

const app = new Hono();
app.use(logger());
app.use(trimTrailingSlash());
app.use(
  cors({
    origin: "*",
    allowHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    maxAge: 3600,
  }),
);
// Sever the frontend
app.use(
  "/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => `/WebUI/${path}`,
  }),
);

const router = {
  download,
  fix,
  ImgSet,
  main,
  VideoSet,
  webSync,
};

export type router = typeof router;

const handler = new RPCHandler(router);
app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: {}, // Provide initial context if needed
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// Not setting as an orpc endpoint as to be accessible in curl
import clearDataBase from "./services/clearDataBase.js";
app.get("/api/clearDB", clearDataBase);

// Sever the media files

app.use("/media/*", async (c, next) => {
  const range = c.req.header("range");

  // If there's no range header, just let serveStatic handle it normally
  if (!range) {
    return await next();
  }

  // Manually handle the range request for Bun
  const urlPath = c.req.path.replace(/^\/media/, ""); // Remove the prefix
  const filePath = `./media${urlPath}`; // Point to your actual folder
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return await next();
  }

  // Parse Range (e.g., "bytes=0-1024")
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : file.size - 1;
  const chunksize = end - start + 1;

  return new Response(file.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${file.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize.toString(),
      "Content-Type": file.type, // Bun automatically detects mime type
    },
  });
});

// Fallback for non-range requests
app.use(
  "/media/*",
  serveStatic({
    root: "./",
    onNotFound: (path, c) => {
      console.log(`${path} not found, req url = ${c.req.path}`);
    },
  }),
);

console.log(`Server is running on http://localhost:${Defaults.port}`);

export default {
  port: Defaults.port,
  fetch: app.fetch,
  hostname: "0.0.0.0",
};
