# Mock pages (dev only)

Scope: `#/mock` pages in `apps/web` that render real extension components on stubbed WXT storage and a fake server. Use them when changing extension UI (layout, states, dark/light, narrow width). Loading the unpacked extension is not needed.

## Open

- `bun dev:web`, then `http://localhost:5173/#/mock` (index) or `#/mock/<slug>?s=<scenario>`.
- Slugs: `library`, `remote-library`, `tags`, `remote-tags`, `settings`, `supported`, `popup`, `overlay`, `bulk-update`.
- Scenario ids per page (`real/pages/*.tsx`, `SCENARIOS`):
  - library: `normal`, `stress`, `empty`, `noresults`
  - remote-library: as library, plus `loading`, `error`
  - tags: `normal`, `stress`. remote-tags: `normal`, `stress`, `empty`, `loading`, `error`
  - supported: `normal` (7 sites), `stress` (35), `empty`
  - settings: `local`, `remote`. overlay: `new`, `saved`, `add`, `edit`, `add-shadow`, `saved-shadow`
  - popup and bulk-update: no scenario bar
- Changing page or scenario reloads the tab on purpose (`hashchange` listener in `mock/index.tsx`). Storage-backed atoms read their initial value once per page load.

## Dev-only wiring

- `src/App.tsx`: `const Mock = import.meta.env.DEV ? lazy(() => import("./mock")) : null`. Vite drops it from `vite build`.
- Check: `grep -ril mock apps/server/dist/WebUI` should print nothing.
- `vite.config.ts` adds `vite.mock.ts` aliases and the markdown plugin only for `command === "serve"`. `@/` maps to web `src/`, except for files inside `apps/extension`, which get extension `src/`. `.md` imports return `{ body }` (serves the Notes guide).

## Layout

- `src/mock/index.tsx`: page index, `MOCK_PAGES`, `FILE_FOR_SLUG`, CSP meta (`img-src 'self' data: blob:`, no network images), error boundary.
- `data.ts`: invented placeholder data. Covers are CSS-gradient SVG data URIs.
- `stubs.ts`: fake `storage`/`browser` globals, fake server at `http://mock.invalid` answering oRPC fetch calls (modes `ok`, `error`, `loading`).
- `MockShell.tsx` (scenario bar), `useScenario.ts` (scenario in the hash `?s=`).
- `real/ExtFrame.tsx`: mounts NavBar and providers like `entrypoints/main/App.tsx`. `real/Overlay.tsx`, `real/ext.css`.
- `real/pages/*.tsx`: one file per page.
- `real/` imports extension code by relative path, so `tsconfig.app.json` excludes `src/mock/real` from `tsc`. Vite still compiles it.

## Adding a page

1. Add `real/pages/<Name>.tsx`. Import `"../globals"` before any extension code: it installs storage globals and seeds storage before extension modules evaluate.
2. Add an entry to `MOCK_PAGES` and to `FILE_FOR_SLUG` in `mock/index.tsx` (value = lowercased file name, e.g. `remotelibrary`).

## Not covered

- Content-script plumbing (`lib/GetDetailsFromPage.ts`, hidden forms, userscript runner), real `chrome.storage`, real server logic.
- Keep mock data neutral and invented.
