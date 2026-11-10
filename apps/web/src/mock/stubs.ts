// In-memory stand-ins for the WXT/extension globals and the TagApp server, so the real
// extension components can run inside the web app. Dev only (see src/mock/index.tsx).
import { filterData } from "@tagapp/utils";
import type {
  ContentWebType,
  FilterDataType,
  ParentTagsType,
  TagsType,
} from "@tagapp/utils/types";

export const MOCK_SERVER_URL = "http://mock.invalid";

// ── WXT `storage` stub ─────────────────────────────────────────────────────────
const store = new Map<string, unknown>();
const watchers = new Map<string, Set<(v: unknown) => void>>();
let readDelayMs = 0;

const clone = <T>(v: T): T => (v === undefined ? v : structuredClone(v));

const stubStorage = {
  async getItem(key: string) {
    if (readDelayMs) await new Promise((r) => setTimeout(r, readDelayMs));
    return store.has(key) ? clone(store.get(key)) : null;
  },
  async setItem(key: string, value: unknown) {
    store.set(key, clone(value));
    for (const w of watchers.get(key) ?? []) w(clone(value));
  },
  async removeItem(key: string) {
    store.delete(key);
    for (const w of watchers.get(key) ?? []) w(null);
  },
  async removeItems(keys: string[]) {
    for (const k of keys) await stubStorage.removeItem(k);
  },
  async snapshot() {
    return Object.fromEntries(
      [...store.entries()].map(([k, v]) => [
        k.replace(/^local:/, ""),
        clone(v),
      ]),
    );
  },
  watch(key: string, cb: (v: unknown) => void) {
    const set = watchers.get(key) ?? new Set();
    set.add(cb);
    watchers.set(key, set);
    return () => set.delete(cb);
  },
};

export type StorageSeed = Record<string, unknown>;

/** Replace everything in the fake storage. Keys are written without the `local:` prefix. */
export function seedStorage(
  seed: StorageSeed,
  opts?: { readDelayMs?: number },
) {
  store.clear();
  readDelayMs = opts?.readDelayMs ?? 0;
  for (const [k, v] of Object.entries(seed)) store.set(`local:${k}`, clone(v));
}

// ── Fake TagApp server (answers oRPC calls to MOCK_SERVER_URL) ─────────────────
export type ServerMode = "ok" | "error" | "loading";

type Server = {
  mode: ServerMode;
  contents: Record<string, ContentWebType>;
  tags: TagsType;
  parentTags: ParentTagsType;
  settings: {
    replaceWithKeyOnUpdate: boolean;
    sanitizeTitleOnSave: boolean;
    constants: Record<string, string>;
  };
};

const server: Server = {
  mode: "ok",
  contents: {},
  tags: {},
  parentTags: {},
  settings: {
    replaceWithKeyOnUpdate: true,
    sanitizeTitleOnSave: false,
    constants: {},
  },
};

export function seedServer(init: {
  mode: ServerMode;
  contents: ContentWebType[];
  tags: TagsType;
  parentTags: ParentTagsType;
  constants?: Record<string, string>;
}) {
  server.mode = init.mode;
  server.contents = Object.fromEntries(init.contents.map((c) => [c.id, c]));
  server.tags = structuredClone(init.tags);
  server.parentTags = structuredClone(init.parentTags);
  server.settings.constants = init.constants ?? {};
}

const recount = () => {
  const counts: Record<string, number> = {};
  for (const c of Object.values(server.contents))
    for (const t of c.tags) counts[t] = (counts[t] ?? 0) + 1;
  for (const t of new Set([
    ...Object.keys(server.tags),
    ...Object.keys(counts),
  ]))
    server.tags[t] = { ...server.tags[t], count: counts[t] ?? 0 };
};

// biome-ignore lint/suspicious/noExplicitAny: mock handlers receive arbitrary RPC inputs
const handlers: Record<string, (input: any) => unknown> = {
  "main/getSettings": () => server.settings,
  "main/setSettings": (i) => Object.assign(server.settings, i),
  "main/getFilteredData": (i: FilterDataType) => filterData(i, server.contents),
  "main/getContent": (i) => server.contents[i.id] ?? null,
  "main/setContent": (i: ContentWebType) => {
    const now = Math.floor(Date.now() / 1000);
    const old = server.contents[i.id];
    server.contents[i.id] = {
      ...old,
      ...i,
      added: old?.added ?? now,
      lastUpdated: now,
    };
    recount();
    return server.contents[i.id];
  },
  "main/removeContents": (i: { ids: string[] }) => {
    const removed = i.ids.flatMap((id) => server.contents[id] ?? []);
    for (const id of i.ids) delete server.contents[id];
    recount();
    return removed;
  },
  "main/bulkUpdateContentTags": (i: {
    ids: string[];
    added: string[];
    removed: string[];
  }) => {
    for (const id of i.ids) {
      const c = server.contents[id];
      if (!c) continue;
      c.tags = [
        ...new Set([
          ...c.tags.filter((t) => !i.removed.includes(t)),
          ...i.added,
        ]),
      ];
      for (const t of i.added) server.tags[t] ??= { count: 0 };
    }
    recount();
    return i;
  },
  "tags/getTagData": () => ({
    tags: server.tags,
    parentTags: server.parentTags,
  }),
  "tags/setTagCover": (i: { tag: string; cover?: string }) => {
    server.tags[i.tag] = { ...server.tags[i.tag], cover: i.cover };
    return i;
  },
  "tags/addTags": (i: { tags: string[] }) => {
    for (const t of i.tags) server.tags[t] ??= { count: 0 };
    return i.tags;
  },
  "tags/addParentTags": (i: { parentTags: string[] }) => {
    for (const t of i.parentTags) server.parentTags[t] ??= {};
    return i.parentTags;
  },
  "tags/removeTags": (i: { tags: string[] }) => {
    for (const t of i.tags) delete server.tags[t];
    for (const c of Object.values(server.contents))
      c.tags = c.tags.filter((t) => !i.tags.includes(t));
    return i.tags;
  },
  "tags/removeParentTags": (i: { parentTags: string[] }) => {
    for (const p of i.parentTags) {
      delete server.parentTags[p];
      for (const t of Object.keys(server.tags))
        if (t.split(":")[0] === p) delete server.tags[t];
    }
    return { tags: server.tags, parentTags: server.parentTags };
  },
  "tags/fixTagCount": () => {
    recount();
    return { tags: server.tags, parentTags: server.parentTags };
  },
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify({ json: body, meta: [] }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function installFetch() {
  const w = window as typeof window & { __tagappMockFetch?: boolean };
  if (w.__tagappMockFetch) return;
  w.__tagappMockFetch = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const req = new Request(input, init);
    if (!req.url.startsWith(`${MOCK_SERVER_URL}/rpc/`))
      return realFetch(input, init);
    const route = req.url.slice(`${MOCK_SERVER_URL}/rpc/`.length);
    if (server.mode === "loading") return new Promise<Response>(() => {});
    await new Promise((r) => setTimeout(r, 120));
    if (server.mode === "error")
      return json(
        {
          defined: false,
          code: "INTERNAL_SERVER_ERROR",
          status: 500,
          message: "Mock server error: couldn't read the database file",
          data: {},
        },
        500,
      );
    const body = await req.json().catch(() => ({}));
    const handler = handlers[route];
    if (!handler)
      return json(
        {
          defined: false,
          code: "NOT_FOUND",
          status: 404,
          message: `No mock for ${route}`,
          data: {},
        },
        404,
      );
    return json(handler(body?.json ?? {}));
  };
}

// ── Globals WXT would normally auto-import ─────────────────────────────────────
export function installStorageGlobals() {
  const g = globalThis as Record<string, unknown>;
  g.storage = stubStorage;
  g.browser = { runtime: { getURL: (p: string) => p } };
  installFetch();
}

export function installGlobals(extra: { useTheme: unknown }) {
  (globalThis as Record<string, unknown>).useTheme = extra.useTheme;
}
