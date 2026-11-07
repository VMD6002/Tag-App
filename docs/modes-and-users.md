# Modes and users

Local vs remote app mode, the duplicated logic that follows from it, and per-profile persisted storage. Paths below are under `apps/extension/src/entrypoints/` unless prefixed.

## Local vs remote

`appModeAtom` (`"local" | "remote"`, default `"local"`, per profile) in `main/atoms/settings.ts`. Switched in `main/routes/settings/components/AppMode.tsx`.

| | local | remote |
| --- | --- | --- |
| Library `/`, tags `/tags` | `main/routes/library`, `main/routes/tags` | `main/routes/remote`, `main/routes/remoteTags` (picked in `main/App.tsx`) |
| Clip overlay ([clip flow](clip-flow.md)) | `all-ui.content/AllModal/LocalContent` | `AllModal/RemoteContent` (picked in `AllModal/index.tsx`) |
| Data access | Jotai atom callbacks: `useSetContent`, `useRemoveContents`, `useBulkUpdateContentTags`, `useGetContent`, `useGetFilteredData` (`main/atoms/index.ts`); `useRemoveTag`, `useRemoveParent`, `useFixTagCount` (`atoms/tags.ts`) | oRPC through `orpcAtom` (`atoms/orpc.ts`, `serverUrlAtom` + `/rpc`); results held in React state / `remoteTagsAtom` |
| Data lives in | extension storage: `contentData`, `tags`, `parents` | server `DB/*.json` ([server API](server-api.md)) |
| Settings (`constants`, `replaceWithKeyOnUpdate`, sanitize title) | local atoms | server `settings.json`; the extension writes through `main.setSettings` and mirrors the result into its local atoms. `AppMode.tsx` has buttons to overwrite either side from the other |

- `apps/web` is always remote: its client is `location.origin + "/rpc"` (`apps/web/src/lib/orpc.ts`).
- Always local, in both modes: site scripts ([site scripts](site-scripts.md)), `hostNames`, profiles, theme, `filteredDataPostServerUrl`.
- With an empty `serverUrl`, `orpcAtom` installs a `fetch` that never resolves, so remote calls hang silently instead of erroring.

## Duplicated logic: fix behaviour in two places

The server re-implements the local atom logic. A behaviour fix needs both edits.

| Behaviour | Local | Server (`packages/api/src`) |
| --- | --- | --- |
| Save / edit content | `setContentCallback` | `routers/main.ts` `setContent` |
| Bulk tag update | `bulkUpdateContentTagsCallback` | `main.bulkUpdateContentTags` |
| Remove content | `removeContentsCallback` | `main.removeContents` |
| Remove tag / parent | `removeTagCallback`, `removeParentCallback` | `routers/tags.ts` `removeTags`, `removeParentTags` |
| Recount tags | `fixTagCountCallback` | `db/tags.ts` `recountTags` via `tags.fixTagCount` (both wrap shared `computeTagCounts`) |
| Backup / restore | `settings/components/{Backup,Restore}.tsx` | `routers/restoreAndBackup.ts` |

Shared (single implementation): `filterData`, `computeTagCounts`, schemas, string helpers in `packages/utils`. Invariants these must keep: [domain model](domain-model.md).

Convention in local atom callbacks: `structuredClone` the atom values, mutate the clone, then `set(...)`. Do not mutate a value read from an atom.

## Profiles and `atomWithUserStorage`

- `currentUserAtom` (`local:currentUser`) and `userListAtom` (`local:userList`) are global, not per profile. `DEFAULT_USER = "DEFAULT"` (`lib/CONSTANTS.ts`).
- `atomWithUserStorage(key, default)` (`main/atoms/user.ts`) returns a proxy atom that reads and writes the atom for the current profile. The WXT storage key is `local:<user>:<key>` (`createWxtStorage` in `atoms/storage.ts` adds the `local:` prefix). All persisted settings, content and tags use it.
- Removing a profile (`settings/components/Users.tsx`) deletes every storage key starting with `<user>:`.
- Defaults are never written to disk. `createWxtStorage` substitutes the default on read, but raw `storage.getItem` callers must supply their own fallback. The content script is the main one: `all-ui.content/index.tsx` reads `local:<user>:appMode`, `hostNames`, `tags`, `serverUrl`, `supportedHostsIndex`, `supportedSites` directly, with `??` fallbacks.

## Add a persisted setting

1. Define the atom with `atomWithUserStorage<T>("key", default)` in `main/atoms/settings.ts` (or a topical file such as `constants.ts`).
2. Add the UI under `main/routes/settings/components/` and mount it in a `SettingsSection` in `main/routes/settings/index.tsx`.
3. If the content script (outside React/Jotai) needs it, read `local:<user>:key` with an explicit fallback. In the overlay, atoms read inside atom callbacks are kept subscribed with `useAtomValue` (see `sanitizeTitleAtom` in `Local.Context.ts`).
4. If remote mode must honour it server-side, it also belongs in `settings.json` ([server API](server-api.md)) and needs a mirror like `constants`.
