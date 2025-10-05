import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import { serve } from "@hono/node-server";
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
  })
);
// Sever the frontend
app.use(
  "/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => `/WebUI/${path}`,
  })
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
app.use(
  "/media/*",
  serveStatic({
    root: "./",
    onNotFound: (path, c) => {
      console.log(`${path} not found, req url = ${c.req.path}`);
    },
  })
);

serve(
  {
    fetch: app.fetch,
    port: Defaults.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
