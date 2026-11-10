# Development

Scope: project status, commands, lint and type conventions, import rules, git workflow, and folders to ignore.

## Project status

- Chrome (MV3) only. The extension is not maintained or tested on Firefox.
- No users yet, so stored data and storage formats may change freely: no backward compatibility or migrations are needed.
- Extension first. The old media server lives in the separate TagAppVault project (not in this repo). Storage is extension storage (local mode) or LowDB JSON files (server); there is no SQL database.

## Commands (root `package.json`)

| Command                              | Does                                                                 |
| ------------------------------------ | -------------------------------------------------------------------- |
| `bun install`                        | Install workspaces                                                   |
| `bun dev:ext`                        | WXT dev build for Chrome (`apps/extension`)                          |
| `bun dev:server`                     | `bun --watch src/index.ts` in `apps/server` (runtime files land there) |
| `bun dev:web`                        | Vite dev server for `apps/web`                                       |
| `bun build:ext`                      | WXT build to `apps/extension/dist/chrome-mv3`                        |
| `bun build:server`                   | `apps/server/dist/index.js`                                          |
| `bun build:web`                      | Vite build into `apps/server/dist/WebUI`                             |
| `bun build:serverFull`               | Clean `apps/server/dist`, then server and web builds                  |
| `bun type:check`                     | `bun run -r type:check`: only `packages/api` and `packages/utils` define it |
| `bun --cwd apps/extension compile`   | Extension `tsc --noEmit`                                             |
| `bun --cwd apps/web check`           | Web `tsc -b` (not covered by root `type:check`)                      |
| `bun test`                           | `bun test packages/utils`                                            |
| `bun check` / `bun check:fix`        | Biome lint and format check / apply fixes                            |
| `bun doctor:web` / `bun doctor:ext`  | React Doctor scan of `apps/web` / `apps/extension` (telemetry off, so no score) |

- React Doctor (`react-doctor`, root devDependency) is installed; its config is `doctor.config.json` (ignores `components/ui`, `.wxt/` and `dist/`). Report only: nothing runs it automatically. A score needs telemetry on: run `bunx react-doctor --yes --project apps/web` (without `--no-telemetry`).
- Server port and prefix are not flags: see [server API](./server-api.md). `EXTENSION_PUBLIC_KEY` for production builds: see [extension UI](./extension-ui.md).

## Code conventions

- TypeScript strict, ESM (`"type": "module"`). Zod at every boundary.
- Biome: 2-space indent, double quotes, organised imports, `recommended` rules, `node:` import protocol required, `useExhaustiveDependencies` is a warning. `components/ui` (see [ui components](./ui-components.md)), `dist/` and `.wxt/` are excluded.
- `@/` is the app `src/` in `apps/extension` and `apps/web` (tsconfig `paths`).
- Extension and web import server types only: `import type { routerType } from "@tagapp/api"`. Never import server runtime code into a client.
- Server (Bun, LowDB, cwd-relative paths) conventions: [server API](./server-api.md).

## Ignore these

- `tmp/` (gitignored): scratch build and zip scripts, signing key, personal notes.
- `.devtool/` (gitignored): `features/*.md` with frontmatter `status`; `features/done/` holds finished items.
- `apps/*/README.md`: untouched framework templates. Not project docs.

## Git

- Solo project: commit directly on `main`, prefer several small commits.
- Conventional-style messages, e.g. `feat(settings): ...`, `chore(tooling): ...` (older history also has plain `Fixed ...`).
- Run `bun check:fix` (Biome) before committing, plus the type checks and `bun test` from Commands above.
- When behaviour changes, update the matching file in `docs/` in the same commit.
