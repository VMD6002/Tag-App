# Site scripts

Where site scripts are defined and stored, the host index, and the `sh.*` helper surface in code. Authoring advice and the helper reference for script writers: `Notes/Scripting Guide.md` (also shown in the Supported Sites guide dialog via `routes/supported/components/GuideDialog.tsx`). How scripts run during a clip: [clip flow](clip-flow.md).

## `SiteData`

Zod schema `SiteDataSchema` in `apps/extension/src/entrypoints/main/routes/supported/SupportedSite.Context.ts`; `SiteData` type is re-exported from `routes/supported/index.tsx`.

| Field | Notes |
| --- | --- |
| `name` | Key in `supportedSitesAtom`; becomes `scraper` on saved content and the default tag `Site:<name>`. |
| `hosts` | `string[]`, min 1; matched against `location.host` (includes port). |
| `script` | Body of an async function with params `ctdls`, `sh`. |
| `afterAddScript?`, `afterRemoveScript?` | Optional, see [clip flow](clip-flow.md). |
| `matchPatterns?` | Path patterns such as `/*`; semantics in [clip flow](clip-flow.md). |
| `download?` | `{presets: {label, value}[], defaultPreset}`. |

- A `.refine` rejects non-empty `download.presets` when the script text never mentions `downloadType` (plain regex, so a commented-out assignment passes).
- The editor (`SupportedSite.Context.ts`, `components/ScriptEditor.tsx`) edits the three script strings in tabs and the remaining fields as JSON (`DefaultSiteDataString` scaffold, `defaultSiteScript` starter). Renaming deletes the old key.
- Import validates each entry with `SiteDataSchema.safeParse` and skips invalid ones; export writes the whole `supportedSites` record.
- To change the shape: the schema above, `lib/GetTagAppSiteData.ts` (reader in the overlay), and the hand-written `SiteData` copy in `Notes/Scripting Guide.md`.

## Storage and the host index

Both atoms are in `apps/extension/src/entrypoints/main/atoms/supportedSites.ts`, per profile ([modes and users](modes-and-users.md)), and always local, even in remote mode (never sent to the server).

- `supportedSitesAtom`: `Record<siteName, SiteData>` (storage key `supportedSites`).
- `supportedHostsIndexAtom`: `Record<host, siteName>` (key `supportedHostsIndex`). This is a derived copy the content script reads for fast lookup, so it must be rebuilt whenever sites change. If two sites share a host, the later one in iteration order wins.
- Rebuild with `useRefreshSupportedHostsIndex()`. Pass the new sites object when you have it (`refresh(newSites)`), otherwise it reads `supportedSitesAtom`. Currently called after save, remove and import in `SupportedSite.Context.ts`; any new code that writes `supportedSitesAtom` must call it too.
- `crossUserHostsIndex` (key `local:crossUserHostsIndex`, not per profile): `Record<host, profileName[]>`, the profiles whose `supportedHostsIndex` has that host, in `userList` order. Built by `rebuildCrossUserHostsIndex(users, fresh?)` (plain async, reads every profile's index from storage; `fresh` is the index just computed for the profile being refreshed, because its atom write may not have landed). Rebuilt at the end of every `useRefreshSupportedHostsIndex()` refresh, when a profile is removed (`Users.tsx`), and when Cross User Scripts is switched on.
- `crossUserScriptsAtom` (`local:crossUserScripts`, default `false`): global switch, not per profile (like `currentUserAtom`). When on, the content script runs a site script from any profile ([clip flow](clip-flow.md)). UI: `settings/components/CrossUserScripts.tsx`.
- Same file: `enableAfterAddRemoveScriptsAtom` and `runAfterAddRemoveScriptsInServerAtom` (both default `false`).

## `sh.*` helpers

Built in `apps/extension/src/entrypoints/all-script-userscript/index.ts` (the `sh` object, also holds `ready`), implementations in sibling files:

| Helper | File | Behaviour worth knowing |
| --- | --- | --- |
| `sleep(ms)`, `toBase36(n)`, `getUniqueIdFromString(s)` | `helpers.ts` | `toBase36` uses BigInt for all-digit strings (exact beyond 2^53). `getUniqueIdFromString` is a 32-bit FNV-1a of the NFC-normalized string, base 36 (at most 7 chars). |
| `getMicroData()`, `getOgImage()`, `decodeHtmlEntities(s)` | `dom-utils.ts` | `getMicroData` parses the first `script[type='application/ld+json']` and throws if none exists. `getOgImage` may return `undefined`. |
| `clickUpdateOrRefresh(firstRun?)`, `clickRemove()` | `extension-api.ts` | Bridge into the overlay (see [clip flow](clip-flow.md)). |
| `SPAContentRefresh(firstRun?)` | `index.ts` | Calls `clickUpdateOrRefresh`, sets `sh.ready = true` on success. |
| `log(...)` | `lib/log.ts` | `console.log` with a `tagAppExt:` prefix. |

To add a helper: implement it in the matching file (or a new one), add it to the `sh` object in `index.ts`, and document it in `Notes/Scripting Guide.md` ("Builtin helper Functions"). Helpers run in the page world, so they cannot use extension APIs directly.
