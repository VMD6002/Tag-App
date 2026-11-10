# Clip flow

How a page gets from the content script to a saved item, plus the host-page tag handshake and after-add/remove scripts. Paths are under `apps/extension/src/`. Site script schema and `sh.*` helpers: [site scripts](site-scripts.md).

## The five steps

1. `entrypoints/all-ui.content/index.tsx` (content script, `<all_urls>`) runs `injectSiteDataIntoPage()` on every page. Order: current user from `local:currentUser`; if `location.origin` is in the `hostNames` of the host-page owner (below), do the tag handshake and stop; else pick the site owner, look up that profile's `supportedHostsIndex[location.host]`, load that `SiteData`, check `matchPatterns`; no match means nothing happens. The owner is the current user, unless `local:crossUserScripts` is on: then `pickOwner` (`packages/utils`: current profile if it is a candidate, else the first candidate) over `crossUserHostsIndex[location.host]` ([site scripts](site-scripts.md)); no candidate means nothing happens.
   - With Cross User Scripts on, the content script calls `setContentScriptUser(owner)` (`main/atoms/user.ts`) before mounting the overlay, so `effectiveUserAtom` returns the owner on the host page and `appMode`, `serverUrl`, tags, library, sanitize and after-add/remove scripts all come from that profile. Off, the overlay follows the stored current user as before.
2. On a match it appends `<script id="TagAppSiteData" type="application/json">` holding the whole `SiteData`, injects `all-script-userscript.js` into the page main world (`injectScript`), and mounts the shadow-DOM overlay (`SHADOW_ROOT_ID`, anchor `html`).
   - `matchPatterns` are path-only, prefixed with `protocol//hostname` (no port) and tested with WXT `MatchPattern`, e.g. `/*`.
3. `entrypoints/all-script-userscript/index.ts` (page world) builds `contentDetails` (`SiteContentDetails`, global type in `types/global.d.ts`), sets `site` and the default tag `Site:<name>`, then runs the user script as `AsyncFunction("ctdls", "sh", script)` (not awaited, errors not caught).
4. The script fills `ctdls` and calls `sh.clickUpdateOrRefresh()`. That writes `contentDetails` into `<script id="TagAppContentDetails">` (appended to `documentElement` the first time) and clicks the hidden `#loadAndRefresh` input inside the shadow root. A 1 s poll (gives up after ~10 s) calls it automatically once the overlay exists and the script set `sh.ready = true`.
5. The overlay (`entrypoints/all-ui.content/AllModal/`) reads the details with `lib/GetDetailsFromPage.ts` and saves:
   - `AllModal/index.tsx` renders only the two hidden forms until the first `#loadAndRefresh` click, then mounts `LocalContent` or `RemoteContent` by `appModeAtom` ([modes](modes-and-users.md)). `HiddenForms` re-registers `#loadAndRefresh` (resets the counter, runs `checkExistance`) and `#remove` (hides the toolbar; what `sh.clickRemove` clicks).
   - `checkExistance` waits for `identifier` (up to 20 tries, 500 ms), asks the store for an existing item (`getContent`), and fills the update modal atoms (`components/craft/UpdateModal/atom.ts`) from the stored item or from page details. `extraData` starts as `Web: [url](url)` plus the script's `extraData`. Then `loadAtom` shows `Shared/FloatingButtons`.
   - `setContentFunc` (in `Local.Context.ts` / `Remote.Context.ts`) sends `{scraper: site, url, id: identifier, title, cover, tags, extraData, download: downloadType ? {type, flags: preset} : undefined, contentUrl}`. For a new item whose edited cover differs from the page cover it adds the tag `meta:different-cover`.

## DOM bridge

Content script and page world share only the DOM. Two hidden `<script type="application/json">` elements are the channel: `TagAppSiteData` (content script to page) and `TagAppContentDetails` (page to overlay). Ids are `SITE_DATA_ELEMENT_ID` and `CONTENT_DETAILS_ELEMENT_ID` in `lib/CONSTANTS.ts`; builders/readers: `lib/generateJsonScriptElement.ts`, `lib/GetTagAppSiteData.ts`, `lib/GetDetailsFromPage.ts`. The host page can read both, scripts included.

## Host-page tag broadcast (`hostNames`)

For origins in the user's `hostNames` (e.g. the TagAppVault page), the content script sends the tag list instead of mounting an overlay.

- Owner: the current user if its `hostNames` has `location.origin`. With Cross User Scripts on there is no index: one `storage.getItems` reads `local:userList` profiles' `hostNames` and `pickOwner` takes the current user if listed, else the first profile in `userList` order that lists the origin. Everything below (`appMode`, `tags`/`serverUrl`, the `remoteTagsUpdated` watcher) uses the owner. Only the owner at page load is watched.
- Tags: local mode `Object.keys` of `local:<owner>:tags`; remote mode `POST <serverUrl>/rpc/tags/getTagData` (raw, see [server API](server-api.md)).
- `sendTagsWithHandshake`: `window.postMessage({type: "TAG_APP_INJECT_TAGS", payload: string[]}, "*")` every 500 ms, up to 20 times, until the page answers `{type: "TAG_APP_TAGS_RECEIVED"}` (only messages with `event.source === window` count). The receiving page must implement the ACK.
- It re-broadcasts when `local:<owner>:remoteTagsUpdated` (a `Date.now()` number) changes. Only the remote tags page bumps it (add tag, remove tag, remove parent; `routes/remoteTags/Remote.Tags.Context.tsx`). Local-mode tag edits do not, The watcher is registered before the first handshake; broadcasts are queued so an update during the first handshake re-broadcasts fresh tags after it finishes.

## After-add / after-remove scripts

Run only when `enableAfterAddRemoveScripts` is on (`atoms/supportedSites.ts`); the sandbox iframe is not even rendered otherwise. Input `data = {siteData, contentDetails}`; script text first gets `$Key` constants expanded when `replaceWithKeyOnUpdate` is on.

- Add: only on first save (`!exists`). Remove: from the overlay toolbar and from library remove (looked up by `content.scraper`).
- Sandbox (default, both modes): hidden iframe on `public/sandbox.html` (manifest `sandbox.pages`), `postMessage({script, data})`, run as `AsyncFunction("data", ...)` with a try/catch. Used by `ContentModal.tsx` and the library routes.
- Server: remote mode plus `runAfterAddRemoveScriptsInServer` calls `main.runUserCode` instead (limits and trust: [server API](server-api.md)).

## Where to change X

| Change | Look at |
| --- | --- |
| Overlay save/edit/remove | `AllModal/{LocalContent,RemoteContent}/*.Context.ts` (keep both in step), `AllModal/Shared/` |
| Host-page tag injection | `all-ui.content/index.tsx` (`sendTagsWithHandshake`, `injectSiteDataIntoPage`) |
| Site matching | `injectSiteDataIntoPage`, `checkMatchPatterns` |
| Sandbox runner | `public/sandbox.html`, `wxt.config.ts` |
