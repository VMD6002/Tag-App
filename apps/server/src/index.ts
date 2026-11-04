import { mkdirSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { RPCHandler } from "@orpc/server/fetch";
import { router, settingsDB } from "@tagapp/api";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      // Skip loopback (127.0.0.1) and non-IPv4 addresses
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

const activePort: number = settingsDB.data.port;
// Normalise: leading "/", no trailing "/"; the root prefix becomes "".
const basePath = `/${settingsDB.data.prefix}`
  .replace(/\/+/g, "/")
  .replace(/\/$/, "");
const activePrefix = basePath || "/";

mkdirSync("DB", { recursive: true });

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
    maxAge: 3600,
  }),
);

const handler = new RPCHandler(router);
app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: {},
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// 2. Catch Vite's static assets requested at the root
app.use(
  "/assets/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => `/WebUI${path}`,
  }),
);

// 3. Catch the favicon
app.use(
  "/favicon.ico",
  serveStatic({
    path: "./WebUI/favicon.ico",
  }),
);

// 4. Map static files to the dynamically configured prefix
app.use(
  `${basePath}/*`,
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => `/WebUI${path.slice(basePath.length)}`,
  }),
);

// 5. The SPA Fallback (bound to the active prefix)
app.get(activePrefix, serveStatic({ path: "./WebUI/index.html" }));
app.get(`${basePath}/*`, serveStatic({ path: "./WebUI/index.html" }));

const localIP = getLocalIP();
console.log(`Server active on:`);
console.log(`  - Local:   http://localhost:${activePort}${activePrefix}`);
console.log(`  - Network: http://${localIP}:${activePort}${activePrefix}`);
console.log(`  - RPC API: http://localhost:${activePort}/rpc`);

export default {
  port: activePort,
  fetch: app.fetch,
  hostname: "0.0.0.0",
};
