# TagApp 6.0

A browser-extension web clipper for saving and tagging content (videos, galleries and similar) from websites, with an optional self-hosted server for backup and sync. Data lives in extension storage (local mode) or in JSON files on the server via LowDB; there is no SQL database. The old media server is the separate TagAppVault project, not part of this repo.

Status: Chrome (MV3) only; Firefox is not maintained or tested. There are no users yet, so stored data formats may change freely without migrations.

**Stack:** Bun workspaces, WXT (extension), Hono + oRPC (server, `/rpc`), Vite + React + wouter (web), LowDB, Zod, Jotai + Constate + TanStack Query, Tailwind + shadcn/ui (Base UI, `base-nova` preset `b2Pg`), Biome.

## Quick start

```bash
bun install
bun dev:ext      # extension dev build for Chrome
bun dev:server   # server (runtime files land in apps/server)
bun dev:web      # web UI; mock pages at http://localhost:5173/#/mock
bun check        # lint + format
```

All commands, build outputs and conventions: [docs/development.md](docs/development.md).

## Architecture

| Path             | Role                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `apps/extension` | The main product (WXT, MV3): content-script overlay, userscript runner, library, tags, settings and site-script UI |
| `apps/server`    | Hono entry: mounts oRPC at `/rpc`, serves the built web UI                                                         |
| `apps/web`       | Small React SPA to browse the remote data; also hosts dev-only mock pages                                          |
| `packages/api`   | oRPC routers and LowDB stores (`@tagapp/api`)                                                                      |
| `packages/utils` | Shared Zod schemas and types, filtering, string helpers (`@tagapp/utils`)                                          |
| `Notes/`         | `Scripting Guide.md`, how to write site scripts                                                                    |
| `docs/`          | Topic docs, see below                                                                                              |

```
extension --(local mode)--> extension storage
    |
    +--(remote mode, oRPC)--> server (apps/server + packages/api) --> JSON files
                                  ^ serves
                               web UI (apps/web build)
packages/utils: schemas and types shared by all of the above
```

The extension imports server types only (`import type`), never server code.

## Contributing

- Setup: `bun install`, then run the dev command for the part you touch. Solo project: commit directly on `main`, in small commits with conventional-style messages (`feat(settings): ...`, `chore(tooling): ...`).
- Before committing run `bun check:fix`, `bun type:check`, `bun --cwd apps/extension compile`, `bun --cwd apps/web check` and `bun test`.
- Behaviour changes usually need two edits, one in the extension's local logic and one in the server, because they are separate implementations: [docs/modes-and-users.md](docs/modes-and-users.md).
- If you change behaviour, update the matching file in `docs/` in the same commit; a new topic gets a new doc.

More: [AGENTS.md](AGENTS.md) (index for coding agents) and [docs/](docs/).
