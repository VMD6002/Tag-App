# Web app (`apps/web`)

Scope: the small React SPA that browses the REMOTE server's data. Not the extension.

- Pages: library (`/`, `src/routes/index.tsx`) and tags (`/tags`, `src/routes/tags.tsx`) only. There is no per-item page.
- Stack: Vite, React, wouter hash router (`src/App.tsx`, `useHashLocation`), TanStack Query (`refetchOnMount: false`, `retry: 1`), Tailwind 4.
- Entry: `src/main.tsx` renders `src/App.tsx`. Pages are `React.lazy` imports behind a `Suspense` spinner. Unknown routes go to `404.tsx`.
- State: `src/atom.ts` (Jotai filter atoms), `src/routes/Remote.Context.ts` (Constate provider, queries via `orpc`).
- Own copies of `components/` (ui, craft, NavBar). It imports nothing from `apps/extension` except in dev mocks. Component rules: [ui-components.md](./ui-components.md).
- oRPC client: `src/lib/orpc.ts`. `RPCLink` to `${location.origin}/rpc`, typed with `import type { routerType } from "@tagapp/api"`, exported as `orpc` (`createTanstackQueryUtils`). Same origin as the server, so there is no server URL setting.
- Build: `vite build --emptyOutDir`, `outDir: ../server/dist/WebUI`. `apps/server` serves that folder under its configured prefix.
- Dev: `bun dev:web` (Vite). Type check: `bun --cwd apps/web check` (`tsc -b`).
- Dev-only `#/mock` pages (real extension components on fake storage): see [mock-pages.md](./mock-pages.md). Absent from the production build.
- Data model and API: see [domain-model.md](./domain-model.md) and [server-api.md](./server-api.md).
