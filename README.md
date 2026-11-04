# TagApp 6.0

Browser-extension "web clipper" for saving and tagging content (videos, galleries, etc.) from websites, with an optional self-hosted **remote DB** server for backup/sync. Extension-first; the old media server was split out into the separate **TagAppVault** project (not in this repo). **Storage is browser extension storage (local mode) or JSON files via LowDB (server). There is no SQL database.**

> For LLM sessions: this file is the project reference. Code is the source of truth. Update this file when you change something it describes.

## Stack

Bun workspaces · WXT (extension, MV3/Chrome + Firefox) · Hono + oRPC (`/rpc`) · Vite + React + wouter (hash router) · LowDB (JSON) · Zod · Jotai + Constate + TanStack Query · Tailwind + shadcn/ui · Biome (lint/format).

## Repo map

| Path             | Package              | Role                                                                                                                                                                  |
| ---------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/extension` | `tag-app-extension`  | **The main product.** WXT extension: content script overlay, userscript runner, library/tags/settings/site-script UI.                                                |
| `apps/server`    | `tag-app-server`     | Hono entry (`src/index.ts`): mounts oRPC at `/rpc`, serves built web UI from `./WebUI` under a configurable prefix. Port/prefix from `settings.json`.                |
| `apps/web`       | `tag-app-web`        | Small React SPA to browse the **remote** DB (library + tags). Builds into `apps/server/dist/WebUI`. oRPC client: `src/lib/orpc.ts`.                                   |
| `packages/api`   | `@tagapp/api`        | oRPC `router` (`src/index.ts`): `routers/{main,tags,restoreAndBackup}.ts`, LowDB stores in `db/`, `lib/runJsStringCode.ts`. Exports `router`, `routerType`, `settingsDB`. |
| `packages/utils` | `@tagapp/utils`      | Shared Zod schemas/types (`@tagapp/utils/types`), `filterData` (Fuse.js title search + tag filters), array/string helpers (`replaceWithConstantKey`, `sanitizeStringForFileName`, ...). |
| `Notes/`         | -                    | `Scripting Guide.md`: how to write site scripts (also bundled into the extension's guide dialog).                                                                      |
| `.devtool/features/` | -                | Feature/todo markdown files (status in frontmatter; `done/` = finished).                                                                                              |
| `tmp/`           | -                    | Gitignored scratch: build/zip scripts, signing key, personal notes. Ignore.                                                                                           |

Imports: `@/` → app `src/` (extension and web). Extension imports server types via `import type { routerType } from "@tagapp/api"` (types only; never import server code at runtime in the extension).

## Core concepts

- **Content** (`ContentWebType`, `packages/utils/src/types.ts`): `id, title, tags[], extraData (markdown), cover?, url, scraper (site name), download?{type, flags?{label,value}}, contentUrl?, added, lastUpdated` (unix seconds). `id` is the site-specific identifier chosen by the site script (not a UUID). `ContentWebBaseSchema` = input without timestamps.
- **Tags**: free strings, conventionally `Parent:Value` (e.g. `Site:YouTube`, `Type:GIF`). `tags` store = `Record<tag, {count, cover?}>`; `parentTags` = `Record<parent, {cover?}>`. **Counts must stay in sync with content**: every add/edit/remove/bulk-update adjusts counts. Repair with `useFixTagCount` (extension) / `tags.fixTagCount` (server). Extension defaults: parents `Type`, `Tag`, `Site`.
- **Two app modes** (`appModeAtom`: `"local" | "remote"`), per user:
  - `local`: all data in extension storage, CRUD done by calling Jotai atom callbacks directly (`atoms/index.ts`: `useSetContent`, `useRemoveContents`, `useBulkUpdateContentTags`, `useGetFilteredData`...).
  - `remote`: same UI routes (`routes/remote`, `routes/remoteTags`) but data goes to the server over oRPC (`atoms/orpc.ts`, URL from `serverUrlAtom`).
  - The server logic in `packages/api/routers/main.ts` **duplicates** the local atom logic (setContent, bulk tag update, remove). Keep both in sync when changing behaviour.
- **Users**: multiple profiles. `currentUserAtom` + `atomWithUserStorage(key, default)` (`atoms/user.ts`) stores everything under `local:<user>:<key>` in WXT storage. Use it for any new persisted setting. Note: defaults are not written to disk, so raw `storage.getItem` callers must supply their own fallback.
- **Site scripts** (`SiteData`, schema in `routes/supported/SupportedSite.Context.ts`): user-authored JS per site: `name, hosts[], script, afterAddScript?, afterRemoveScript?, matchPatterns?, download?{presets, defaultPreset}`. Stored in `supportedSitesAtom`; `supportedHostsIndexAtom` maps host → site name (rebuild with `useRefreshSupportedHostsIndex` after changes). Authoring guide and helper API: `Notes/Scripting Guide.md`.
- **Constants / `replaceWithKeyOnUpdate`**: `constants` map (key → string, e.g. CDN base URLs); when enabled, `cover` URLs are rewritten to use the key (`replaceWithConstantKey`) on save.
- **Settings** (server `settings.json`): `port, prefix, replaceWithKeyOnUpdate, sanitizeTitleOnSave, constants`. Extension equivalents are atoms in `atoms/settings.ts` and `atoms/constants.ts`.

## How a page gets clipped (extension flow)

1. `entrypoints/all-ui.content/index.tsx` (content script, `<all_urls>`) runs on every page. If the origin is in the user's `hostNames` (e.g. the TagAppVault/web UI), it only broadcasts the tag list via `window.postMessage` (`TAG_APP_INJECT_TAGS`, retried until the page ACKs `TAG_APP_TAGS_RECEIVED`) and re-broadcasts when `remoteTagsUpdated` (a `Date.now()` timestamp) changes.
2. Otherwise it looks up `location.host` in `supportedHostsIndex`, checks `matchPatterns`, injects the site's `SiteData` as `<script id="TagAppSiteData" type="application/json">`, injects `all-script-userscript.js` into the page's main world, and mounts the shadow-DOM overlay (`SHADOW_ROOT_ID`).
3. `entrypoints/all-script-userscript/index.ts` (page context) builds `contentDetails` (`SiteContentDetails`), exposes helpers as `sh` (`sleep`, `clickUpdateOrRefresh`, `SPAContentRefresh`, `clickRemove`, `getMicroData`, `getOgImage`, `toBase36`, `getUniqueIdFromString`, `decodeHtmlEntities`, `log`), then runs the user's script as `AsyncFunction("ctdls", "sh", script)`.
4. The script fills `ctdls` (`title, cover, identifier, url, defaultTags, contentUrl, extraData, downloadType`) and calls `sh.clickUpdateOrRefresh()`, which serializes it into `<script id="TagAppContentDetails">` and clicks the hidden `#loadAndRefresh` input inside the shadow root. The overlay (`AllModal/`, `LocalContent` or `RemoteContent` by app mode) reads it via `lib/GetDetailsFromPage.ts`, shows the update modal (`components/craft/UpdateModal`), and saves.
5. After add/remove, `afterAddScript` / `afterRemoveScript` run (only if `enableAfterAddRemoveScripts`): in local mode inside `public/sandbox.html` (sandboxed iframe, `postMessage` of `{script, data}`); in remote mode on the server via `main.runUserCode` (Node `vm`, 5s timeout, only `fetch/console/setTimeout/data` exposed, with `runAfterAddRemoveScriptsInServer`).

The DOM `<script type="application/json">` handoff (`CONTENT_DETAILS_ELEMENT_ID`, `SITE_DATA_ELEMENT_ID`, constants in `lib/CONSTANTS.ts`) is the bridge between content-script world and page world.

## Extension UI (`apps/extension/src/entrypoints/main`, hash routes)

`/` library (local or remote by mode) · `/tags` (local or remote) · `/supported` site-script editor + import/export · `/settings` (server URL, app mode, users, hostnames, constants, backup/restore, filtered-data post URL). Popup (`entrypoints/popup`) is just links to these. Per-route state lives in `routes/<name>/*.Context.ts(x)` (Constate providers); `components/ui` = shadcn, `components/craft` = custom pieces (confirm dialog, update/bulk-update modals). `ServerAffix` POSTs the current filtered data to `filteredDataPostServerUrl` if set.

## Server API (oRPC, mounted at `/rpc`, `packages/api/src/routers`)

- `main`: `setContent`, `bulkUpdateContentTags`, `removeContents`, `getContent`, `getFilteredData` (`FilterQuerySchema`: `any/all/none` tags, `search`, `orderByLatest`), `getSettings`, `setSettings`, `runUserCode`
- `tags`: `getTagData`, `setTagCover`, `addTags`, `addParentTags`, `removeTags`, `removeParentTags`, `fixTagCount`
- `restoreAndBackup`: `backup`, `restore` (`type`: `All | tags | contentData`, `overwrite` merges vs replaces)

Add an endpoint: export `os.input(zod).handler(...)` from a router file; it is auto-typed on both clients (`orpc.<router>.<proc>`). Wire format for raw fetch: `POST /rpc/<router>/<proc>` with body `{"json": <input>}`; response `{json: ...}` (the content script uses this for `tags/getTagData`).

Runtime files (relative to server cwd): `settings.json`, `DB/contentData.json` (`Record<id, ContentWebType>`), `DB/tags.json` (`{tags, parentTags}`). No auth, CORS `*`, binds `0.0.0.0` — trusted LAN only.

## Where to change X

| Task                                  | Look at                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content/tag schema                    | `packages/utils/src/types.ts`, then local atoms (`atoms/index.ts`, `atoms/tags.ts`) **and** server routers/db                                              |
| Filtering/search                      | `packages/utils/src/filterData.ts` (shared by both modes)                                                                                                 |
| New persisted extension setting       | `atoms/settings.ts` via `atomWithUserStorage`, UI in `routes/settings/components/`                                                                          |
| New script helper (`sh.*`)            | `entrypoints/all-script-userscript/{index,helpers,dom-utils,extension-api}.ts`, document in `Notes/Scripting Guide.md`                                      |
| Site-script data shape                | `SiteDataSchema` in `routes/supported/SupportedSite.Context.ts`, `lib/GetTagAppSiteData.ts`                                                                |
| Clip overlay / save flow              | `entrypoints/all-ui.content/AllModal/{LocalContent,RemoteContent,Shared}`                                                                                  |
| Host-page tag injection               | `entrypoints/all-ui.content/index.tsx` (`sendTagsWithHandshake`)                                                                                           |
| Server port/prefix / static serving   | `apps/server/src/index.ts`, `packages/api/src/db/settings.ts`                                                                                              |
| Manifest / permissions / build        | `apps/extension/wxt.config.ts`                                                                                                                             |

## Commands

```bash
bun install
bun dev:ext          # WXT dev (Chrome); `bun --cwd apps/extension dev:firefox` for Firefox
bun dev:server       # cwd = apps/server (runtime files land there)
bun dev:web          # Vite
bun build:ext        # → apps/extension/dist/<browser>-mv3
bun build:serverFull # → apps/server/dist: index.js + WebUI/ (build:server then build:web)
bun type:check       # recursive; only packages/api and packages/utils define it
bun --cwd apps/extension compile   # extension tsc --noEmit
bun check            # Biome lint+format (check:fix / lint:fix / format to apply)
```

Server port/prefix: `settings.json` only (defaults `5000`, `/`); the server takes no CLI flags. Extension placeholder text suggests `http://localhost:5001`. For a persistent extension ID in production builds set `EXTENSION_PUBLIC_KEY` in `.env` (warns if missing).

## Conventions

- Solo project: commit directly on `main`; prefer several small commits. Conventional-style messages (`chore(tooling): ...`, `Fixed ...`).
- Biome: 2-space indent, double quotes, organized imports; fix lint before committing. TypeScript + ESM, Zod at every boundary.
- Server runs on Bun; server code uses top-level `await` for LowDB init and cwd-relative paths (`./DB`, `./settings.json`).
- Server handlers mutate the in-memory LowDB object then `await db.write()`; always write both `contentDataDB` and `tagDB` when tags change.
- Extension local-mode atom callbacks `structuredClone` before mutating, then `set(...)`.

## Gotchas

- Local and remote logic are separate implementations (see above): a behaviour fix usually needs two edits.
- Tags with count 0 are intentional (kept so they stay selectable for future content); only explicit removal deletes a tag.
- Removing a tag or parent tag must also strip it from all content (and bump `lastUpdated`). Implemented in `useRemoveTag`/`useRemoveParent` (extension) and `tags.removeTags`/`tags.removeParentTags` (server); keep them in sync.
- `runUserCode` executes user-supplied JS with `vm` (not a security boundary) and the server has no auth: never expose it beyond a trusted network.
- `apps/*/README.md` are untouched template READMEs; ignore them. `tmp/` and `.devtool/` are gitignored personal files.
- `apps/web/src/routes/` has only library + tags; there is no per-item page.
