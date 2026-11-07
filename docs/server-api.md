# Server API

The optional self-hosted server: oRPC routers, runtime files, LowDB conventions and startup. Code: `packages/api/src` (routers, DB stores) and `apps/server/src/index.ts` (Hono entry). Storage is JSON files via LowDB; there is no SQL database.

## Routers (mounted at `/rpc`)

`packages/api/src/index.ts` exports `router = {tags, main, restoreAndBackup}` (from `routers/*.ts`), `routerType`, and `settingsDB`.

| Router | Procedures |
| --- | --- |
| `main` | `setContent`, `bulkUpdateContentTags`, `removeContents`, `getContent`, `getFilteredData` (`FilterQuerySchema`), `getSettings`, `setSettings`, `runUserCode` |
| `tags` | `getTagData`, `setTagCover`, `addTags`, `addParentTags`, `removeTags`, `removeParentTags`, `fixTagCount` |
| `restoreAndBackup` | `backup` (`type`: `All \| tags \| contentData`; excluded parts come back as `{}`), `restore` (same `type` plus `overwrite`: replace vs shallow merge; always runs `recountTags()` and writes both DBs) |

Logic here duplicates the extension's local atoms: [modes and users](modes-and-users.md). Invariants: [domain model](domain-model.md).

## Add an endpoint

1. Export `os.input(zodSchema).handler(...)` from a file in `routers/`. Routers are imported as `import * as main`, so every export becomes a procedure: do not export helpers or schemas from router files (types are fine). A new router file must be added to `router` in `packages/api/src/index.ts`.
2. Types flow to both clients through `routerType`: `orpc.<router>.<proc>` in the extension (`atoms/orpc.ts`) and the web app (`apps/web/src/lib/orpc.ts`). Import it as `import type` only ([development](./development.md)).
3. If mock pages should call it, add a `"router/proc"` entry to `handlers` in `apps/web/src/mock/stubs.ts`.
4. Throw `ORPCError` for client errors (see `bulkUpdateContentTags`).

Raw wire format: `POST /rpc/<router>/<proc>`, body `{"json": <input>}`, response `{"json": <output>}`. The content script uses it for `tags/getTagData` (`{"json":{}}`, no `Content-Type` header; see [clip flow](clip-flow.md)).

## Runtime files and settings

Paths are relative to the server cwd (`./settings.json`, `./DB/contentData.json`, `./DB/tags.json`, `./WebUI`).

- `DB/contentData.json`: `Record<id, ContentWebType>`. `DB/tags.json`: `{tags, parentTags}`. Stores: `db/contentData.ts`, `db/tags.ts`, `db/settings.ts`.
- `settings.json` (defaults in `db/settings.ts`): `port` 5000, `prefix` `"/"`, `replaceWithKeyOnUpdate` true, `sanitizeTitleOnSave` false, `constants` `{}`. `main.setSettings` only accepts the last three (partial); `port` and `prefix` are edited in the file and need a restart. No CLI flags.
- LowDB does not merge defaults into an existing file: a key added to the defaults later is missing from old `settings.json`. The file is written once at startup (`settingsDB.write()` in `db/settings.ts`).
- `apps/server/.gitignore` lists `DB/` and `WebUI/`, but spells the settings entry `setttings.json`, so `settings.json` is not actually ignored.

## LowDB handling conventions

- Mutate the in-memory `db.data`, then `await db.write()`. Write both `contentDataDB` and `tagDB` whenever tags or content tags change (`Promise.all` in `routers/tags.ts`).
- Count changes go through `IncrementTagCount`, `DecrementTagCount`, `recountTags` in `db/tags.ts`; tag removal through `stripTagsFromContent` in `routers/tags.ts`.
- Bun runtime. DB modules use top-level `await` for init and cwd-relative paths. `bun dev:server` runs `bun --cwd apps/server dev`, so `DB/` and `settings.json` land in `apps/server`. The built `apps/server/dist/index.js` expects `WebUI/` in its cwd (the web build outputs to `apps/server/dist/WebUI`).

## Startup, port and prefix

`apps/server/src/index.ts`: Hono with `logger`, `trimTrailingSlash`, CORS `origin: "*"`; binds `0.0.0.0` on `settings.port`. The prefix is normalized (leading `/`, no trailing `/`) and applies only to the static UI and SPA fallback. `/rpc/*`, `/assets/*` and `/favicon.ico` are always at the root.

## Trust warning

There is no auth, CORS is `*`, and it binds all interfaces: trusted LAN only. `main.runUserCode` runs caller-supplied JS with `node:vm` (`lib/runJsStringCode.ts`) exposing only `fetch`, `console.log/error`, `setTimeout`, `clearTimeout` and `data`. That is not a security boundary, and the whole run, including awaited `fetch` and timers, is abandoned after 5 s (`Promise.race`; the script is not killed, it just stops being awaited).
