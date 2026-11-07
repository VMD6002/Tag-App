# Extension UI

Scope: the extension's settings/library/tags/supported pages (`apps/extension/src/entrypoints/main`) and the popup.

## Routes (`main/App.tsx`, wouter with `useHashLocation`)

| Hash route  | Component                                                  | Mode split                          |
| ----------- | ---------------------------------------------------------- | ----------------------------------- |
| `/`         | `routes/library` or `routes/remote`                        | by `appModeAtom`                    |
| `/tags`     | `routes/tags` or `routes/remoteTags`                       | by `appModeAtom`                    |
| `/supported`| `routes/supported` (site-script editor, JSON import/export)| none                                |
| `/settings` | `routes/settings`                                          | sections switch local/remote parts  |
| other       | `404.tsx`                                                  |                                     |

- Settings sections: Profiles, Storage and connection, Saving items, Site scripts, Connected pages (`Hostnames`, `FilteredDataPost`), Backup and restore.
- Mode semantics: see [modes-and-users.md](./modes-and-users.md). The `/supported` editor and storage: [site-scripts.md](./site-scripts.md). What the content script does on a page: [clip-flow.md](./clip-flow.md).
- The server URL field (`Server.tsx`) suggests `http://localhost:5001`; that is only placeholder text, the server default port is 5000.

## Popup

- `entrypoints/popup/index.html` + `style.css`: static links only (Library, Tags, Settings, Supported), each opening `/main.html#/...` in a new tab. No React.

## State and components

- Per-route state: `routes/<name>/<Name>.Context.ts(x)` as Constate providers (`library`, `remote`, `remoteTags`, `tags`, `supported`). The clip overlay has its own in `all-ui.content/AllModal/{LocalContent,RemoteContent}/`.
- Shared Jotai atoms: `main/atoms/*.ts`.
- `components/craft`: app pieces (`confirm-dialog.tsx` `ConfirmProvider`, `UpdateModal/`, `BulkUpdateModal.tsx`). Layer rules for `components/ui` and `craft/ui`: [ui-components.md](./ui-components.md).

## ServerAffix

- `components/craft/ServerAffix.tsx`: fixed bottom-right button, rendered only when `filteredDataPostServerUrlAtom` is set.
- Click: POSTs the current filtered `ContentWebType[]` as JSON to that URL, toasts the result.
- URL is set in Settings > Connected pages (`routes/settings/components/FilteredDataPost.tsx`). Stored per user via `atomWithUserStorage` under key `filteredDataPostServerUrl`.

## Manifest, permissions, build key

- Manifest and permissions live only in `apps/extension/wxt.config.ts`: `permissions: ["storage", "unlimitedStorage"]`, `host_permissions: ["<all_urls>"]`, `sandbox.pages: ["sandbox.html"]`, `web_accessible_resources` for `all-script-userscript.js` and `sandbox.html`.
- `EXTENSION_PUBLIC_KEY` (read from `apps/extension/.env`) becomes manifest `key` only on `build`, not `dev`. Missing key on build prints a warning. It keeps the extension ID stable.
