import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import { logger } from "hono/logger";

import { RPCHandler } from "@orpc/server/fetch";

import getDefaults from "./lib/getDefaults.js";
import createAppDirs from "./lib/createAppDirs.js";
import { router } from "@tagapp/api";

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

app.use(
  "/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => `/WebUI/${path}`,
  }),
);

// 4. The SPA Fallback (The very last thing)
app.get("*", serveStatic({ path: "./WebUI/index.html" }));

console.log(`Server active on http://0.0.0.0:${Defaults.port}`);

export default {
  port: Defaults.port,
  fetch: app.fetch,
  hostname: "0.0.0.0",
};
