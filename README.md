# TagApp 6.0

The latest evolution of TagApp, shifting from a monolithic-adjacent architecture to a decoupled, extension-first ecosystem with remote database synchronization.

## Current Stack

| Category                | Technology                                     |
| ----------------------- | ---------------------------------------------- |
| **Extension Framework** | WXT JS                                         |
| **Web UI**              | Vite React (wouter with `useHashRouter`)       |
| **Server / Remote DB**  | Hono                                           |
| **Database**            | JSON with LowDB                                |
| **API Layer**           | **oRPC** (Optimized RPC for type-safe routing) |
| **State Management**    | Jotai + Constate                               |
| **Styling & UI**        | Tailwind CSS + Shadcn UI                       |

---

## Major Architectural Revisions (v5.0 ➔ v6.0)

| Feature                | TagApp 5.0                      | TagApp 6.0 (Current)                                                               |
| ---------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| **Media Architecture** | Dedicated Caddy Media Server    | Split into **TagAppVault** (Independent media project syncing tags/extension data) |
| **Server Role**        | Media Serving & Traditional API | Acts strictly as a **Remote DB** for the extension                                 |

---

## Key Features in 6.0

- ~~oRPC Background Engine: Most CRUD operations on `contentData` are now routed through an oRPC setup directly inside the extension's background script, ensuring type safety and lightning-fast execution.~~ ( Didn't work due to MV3 killing the background script immediatly, still using the same context setup but now by calling the jotai functions directly )
- **Decoupled Vault (`TagAppVault`)**: The old media server has been completely extracted into its own dedicated project. It connects to the extension to seamlessly ingest user data, tags, and saved states.
- **Lean Remote DB**: The Hono server has been rewritten and streamlined to act purely as a remote database backup and sync layer for the extension.
- **Lifecycle Hook Support**: Introduced `AfterAddScripts` and `AfterRemoveScripts` to trigger automated workflows whenever data is added or removed.

---

> **Note on TagAppVault:** The media server component now lives in its own repository (`TagAppVault`). Ensure it is configured to listen to this extension's export payloads for seamless tag and metadata synchronization.

---

## References

### Architecture & Tooling

- [oRPC Documentation & Monorepo Reference](https://github.com/middleapi/orpc-multiservice-monorepo-playground/tree/main)
- [WXT Next-gen Web Extension Framework](https://wxt.dev/)
