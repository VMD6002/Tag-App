# Domain model

Content and tag data shapes, the invariants that keep them consistent, constants, and filtering. Schemas live in `packages/utils/src/types.ts` (Zod, shared by extension, server and web).

## Content (`ContentWebType`)

| Field | Notes |
| --- | --- |
| `id` | Site-specific identifier chosen by the site script (`ctdls.identifier`), not a UUID. Key of the `contentData` record. Saving an existing id merges `{...old, ...input}` and keeps `added`. |
| `title` | Trimmed on save, or run through `sanitizeStringForFileName` (invalid filename chars to `-`, max 120) when the sanitize setting is on. |
| `tags` | `string[]`, de-duplicated on save. |
| `extraData` | Markdown string. |
| `cover?`, `url`, `contentUrl?` | `cover` is rewritten to `$Key` form on save (see Constants). |
| `scraper` | Site name (`SiteData.name`); used to find the site's after-add/remove scripts. |
| `download?` | `{type, flags?: {label, value}}`. |
| `added`, `lastUpdated` | Unix seconds, set by the store, never by callers. |

`ContentWebBaseSchema` is the same without the two timestamps (the input of `setContent`). `BackUpSchema` (backup/restore) embeds `ContentWebSchema`.

## Tags and parent tags

- A tag is a free string, conventionally `Parent:Value`. Parent = text before the first `:` (`tag.split(":")[0]`); a tag without `:` is its own parent.
- `tags`: `Record<tag, {count, cover?}>`. `parentTags`: `Record<parent, {cover?}>`.
- Local storage: `tagsAtom` (`tags`) and `parentTagsAtom` (`parents`) in `apps/extension/src/entrypoints/main/atoms/tags.ts`. Server: `DB/tags.json` as `{tags, parentTags}` (see [server API](server-api.md)).
- Defaults differ: the extension seeds parents `Type`, `Tag`, `Site` and tags `Type:GIF`, `Type:Short_Clip`, `Tag:Watched`, `Tag:To-Watch` (count 0). The server starts empty.
- Tags added automatically during a clip (`Site:<name>`, `meta:different-cover`): see [clip flow](clip-flow.md).

## Count invariants

- `count` equals the number of content items carrying the tag. Every save, edit, remove and bulk update diffs old vs new tags and adjusts counts. Decrement clamps at 0 and ignores unknown tags; increment creates the tag entry and its parent entry.
- Count 0 is intentional: such tags stay selectable for future content. Only explicit tag/parent removal deletes a tag. The web app hides count-0 tags from its filter options (`apps/web/src/routes/Remote.Context.ts`).
- Removing a tag or parent must also strip it from every content item and bump that item's `lastUpdated`. Local: `useRemoveTag` / `useRemoveParent`. Server: `tags.removeTags` / `tags.removeParentTags`. Keep them in sync (see [modes and users](modes-and-users.md)).
- Repair hooks: local `useFixTagCount` (`atoms/tags.ts`, Tags page button, and after a local restore); server `tags.fixTagCount` and `restore` call `recountTags()` (`packages/api/src/db/tags.ts`). Both call the shared `computeTagCounts` (`packages/utils/src/computeTagCounts.ts`): recount from content, count a duplicated tag within one item once, rebuild `parentTags`, and keep tag covers, parent covers and zero-count tags.
- In remote mode, tag list changes made from the extension tags page bump `remoteTagsUpdated` (see [clip flow](clip-flow.md)).

## Constants and `replaceWithKeyOnUpdate`

- `constants`: `Record<key, string>` (e.g. a CDN base URL). Local: `constantsAtom`, `replaceWithKeyOnUpdateAtom` (default `true`) in `atoms/constants.ts`. Remote: server `settings.json` (see [server API](server-api.md)).
- On save with the flag on, `replaceWithConstantKey` replaces every occurrence of each constant value with `$key`, in `cover` only (not `url`, not `title`).
- `applyConstants` (`packages/utils/src/StringHelperFunctions.ts`) expands `$word` tokens, leaving unknown keys untouched. Used when rendering card `url`/`cover` and on after-add/remove script text (the latter only when the flag is on).

## Filtering and search

- `filterData(query, contentData)` in `packages/utils/src/filterData.ts`, used by local `useGetFilteredData` and server `main.getFilteredData`. Query = `FilterQuerySchema`: `any`, `all`, `none`, `search`, `orderByLatest`.
- `any` / `none` use `ArrayHasAnyModified`: `*` matches any item with at least one tag; `Parent:*` matches by prefix. `all` is exact (no wildcards).
- Tag filters run first, then Fuse.js title search (`threshold` 0.5), then sort by `added` (descending when `orderByLatest`).
- Tests: `packages/utils/src/utils.test.ts` (`bun test`).

## To change the schema, look at

1. `packages/utils/src/types.ts` (the Zod schema; types derive from it).
2. Local logic: `atoms/index.ts` (`setContentCallback`, bulk update, remove), `atoms/tags.ts`. Server logic: `packages/api/src/routers/main.ts`, `routers/tags.ts`, `db/tags.ts`.
3. The overlay payload built in `AllModal/{LocalContent,RemoteContent}/*.Context.ts` (`setContentFunc`).
4. Hand-written type copies in `Notes/Scripting Guide.md` ("TS types").
5. Mock data and fake server: `apps/web/src/mock/{data,stubs}.ts`.

No migrations are needed for stored data (no users yet).
