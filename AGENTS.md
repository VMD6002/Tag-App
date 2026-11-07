# AGENTS.md

Index for coding agents. Read the doc that owns your task before editing; docs link to code, code is the source of truth.

TagApp is a Chrome MV3 web-clipper extension (WXT) that saves and tags content from websites, with an optional self-hosted server (Hono + oRPC + LowDB) and a small web UI to browse the server's data. Human overview: [README.md](README.md).

Layout: `apps/extension` (main product), `apps/server`, `apps/web`, `packages/api` (oRPC routers, LowDB), `packages/utils` (shared schemas and helpers), `Notes/` (scripting guide), `docs/`.

## Invariants

- Chrome only; no users yet, so no backward compatibility or migrations: [development](docs/development.md).
- Code is the source of truth; docs describe it, so fix the doc when it drifts: [development](docs/development.md).
- Local (extension atoms) and remote (server) logic are duplicated; fix both: [modes and users](docs/modes-and-users.md).
- Tag counts must stay in sync with content: [domain model](docs/domain-model.md).
- `components/ui` is stock shadcn and immutable; customise in `components/craft/ui`: [ui components](docs/ui-components.md).
- The extension imports server types only, never server code: [development](docs/development.md).
- The server has no auth and `runUserCode` is not sandboxed: trusted LAN only: [server API](docs/server-api.md).

## Docs

| Doc                                                    | Read it when you are...                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [docs/domain-model.md](docs/domain-model.md)           | changing content or tag shapes, counts, constants, filtering                                |
| [docs/modes-and-users.md](docs/modes-and-users.md)     | touching local vs remote mode, profiles, persisted settings                                 |
| [docs/clip-flow.md](docs/clip-flow.md)                 | working on the content script, overlay, save flow, host-page tags, after-add/remove scripts |
| [docs/site-scripts.md](docs/site-scripts.md)           | changing `SiteData`, the Supported Sites editor, host index, `sh.*` helpers                 |
| [Notes/Scripting Guide.md](Notes/Scripting%20Guide.md) | writing or documenting site scripts (user-facing guide)                                     |
| [docs/server-api.md](docs/server-api.md)               | adding endpoints, changing server storage, settings, startup                                |
| [docs/extension-ui.md](docs/extension-ui.md)           | editing extension pages, popup, manifest, build key                                         |
| [docs/ui-components.md](docs/ui-components.md)         | working with shadcn/Base UI components or the shadcn CLI                                    |
| [docs/web-app.md](docs/web-app.md)                     | working on `apps/web`                                                                       |
| [docs/mock-pages.md](docs/mock-pages.md)               | checking extension UI without loading the extension                                         |
| [docs/development.md](docs/development.md)             | running commands, linting, committing                                                       |

## Where to change X

| Task                                | Read                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| Content or tag schema               | [domain-model](docs/domain-model.md), then [modes and users](docs/modes-and-users.md) |
| Filtering or search                 | [domain-model](docs/domain-model.md)                                                  |
| New persisted extension setting     | [modes and users](docs/modes-and-users.md)                                            |
| New `sh.*` script helper            | [site scripts](docs/site-scripts.md)                                                  |
| Site-script data shape              | [site scripts](docs/site-scripts.md)                                                  |
| Clip overlay or save flow           | [clip flow](docs/clip-flow.md)                                                        |
| Host-page tag injection             | [clip flow](docs/clip-flow.md)                                                        |
| New server endpoint, port or prefix | [server API](docs/server-api.md)                                                      |
| Manifest, permissions, build        | [extension UI](docs/extension-ui.md)                                                  |
| Extension or web UI components      | [ui components](docs/ui-components.md), [mock pages](docs/mock-pages.md)              |

## Rules

- When behaviour changes, update the matching doc in the same change.
- For a new topic, add a new doc under `docs/` and list it above instead of growing an existing one.
