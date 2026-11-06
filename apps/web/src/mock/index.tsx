// Dev-only mock pages of the extension UI. Loaded lazily from App.tsx behind import.meta.env.DEV,
// so none of this is part of `vite build`. Pages under ./real import the real extension components.
import type { ComponentType, ReactNode } from "react";
import { Component, lazy, Suspense, useEffect } from "react";
import { Link, useRoute } from "wouter";

const loaders = import.meta.glob<{ default: ComponentType }>(
  "./real/pages/*.tsx",
);

export const MOCK_PAGES = [
  {
    slug: "library",
    title: "Library (local mode)",
    note: "Real extension route + real atoms on a fake WXT storage.",
  },
  {
    slug: "remote-library",
    title: "Remote library",
    note: "Real route; a fake fetch plays the TagApp server.",
  },
  {
    slug: "tags",
    title: "Tags (local mode)",
    note: "Real route on fake storage.",
  },
  {
    slug: "remote-tags",
    title: "Remote tags",
    note: "Real route; fake server.",
  },
  {
    slug: "settings",
    title: "Settings",
    note: "Real route, local and remote mode.",
  },
  {
    slug: "supported",
    title: "Supported sites",
    note: "Real route: sidebar, script editor, guide dialog.",
  },
  {
    slug: "popup",
    title: "Popup",
    note: "The real popup index.html and style.css in an iframe.",
  },
  {
    slug: "overlay",
    title: "Clip overlay / update modal",
    note: "Real UpdateModal and FloatingButtons, optionally inside a shadow root.",
  },
  {
    slug: "bulk-update",
    title: "Bulk update modal",
    note: "Real BulkUpdateModal over the real library.",
  },
] as const;

const pages = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [
    /\/([^/]+)\.tsx$/.exec(path)?.[1]?.toLowerCase() ?? path,
    lazy(load),
  ]),
) as Record<string, ComponentType>;

// File names are PascalCase page names; map slug -> file key.
const FILE_FOR_SLUG: Record<string, string> = {
  library: "library",
  "remote-library": "remotelibrary",
  tags: "tags",
  "remote-tags": "remotetags",
  settings: "settings",
  supported: "supported",
  popup: "popup",
  overlay: "overlay",
  "bulk-update": "bulkupdate",
};

/** Shows a render error on screen instead of leaving a blank page. */
class MockErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <pre className="m-6 whitespace-pre-wrap border border-destructive p-4 text-xs">
        {this.state.error.stack ?? String(this.state.error)}
      </pre>
    ) : (
      this.props.children
    );
  }
}

export default function Mock() {
  const [match, params] = useRoute("/:page");
  const Page = match
    ? pages[FILE_FOR_SLUG[params.page.split("?")[0] ?? ""] ?? ""]
    : undefined;

  // Mock pages must not touch the network (the sites sidebar asks a favicon service for each host).
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = "img-src 'self' data: blob:";
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  // Pages hold module-level state (fake storage, atoms); a clean load per route is the simple fix.
  useEffect(() => {
    const reload = () => location.reload();
    window.addEventListener("hashchange", reload);
    return () => window.removeEventListener("hashchange", reload);
  }, []);

  if (Page)
    return (
      <MockErrorBoundary>
        <Suspense fallback={<p className="p-6 text-sm">Loading mock…</p>}>
          <Page />
        </Suspense>
      </MockErrorBoundary>
    );

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-xl font-semibold">Extension UI mocks</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Dev only. These pages render the extension's real components with
        stubbed storage and a fake server. They are not part of the production
        build.
      </p>
      <ul className="mt-6 divide-y border">
        {MOCK_PAGES.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/${p.slug}`}
              className="block px-4 py-3 hover:bg-muted/60"
            >
              <span className="font-medium">{p.title}</span>
              <span className="block text-xs text-muted-foreground">
                {p.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
