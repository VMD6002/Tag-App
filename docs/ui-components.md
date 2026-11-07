# UI components

Scope: shadcn/Base UI component layers and rules for the extension and web app.

## Layers

| Path                                              | Rule                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/*/src/components/ui/`                       | Stock shadcn. Never edit. Biome ignores it (`!**/components/ui`).    |
| `apps/extension/src/components/craft/ui/`         | Customised primitives (`popover.tsx`, `sonner.tsx`). Change them here. |
| `apps/*/src/components/craft/`                    | App-level pieces built on the primitives (modals, MultiSelect, EmptyState). |

## Base UI, not Radix

- Triggers: `render={<Button />}` instead of `asChild`. Example: `DropdownMenuTrigger render={<Button ... />}`.
- State attributes: `data-open` / `data-closed`, not `data-[state=open]`.
- `Select` `onValueChange` can receive `null`. Guard it: `onValueChange={(val) => val && setX(val)}`.

## PopoverContent `anchor` / `container`

- Source: `apps/extension/src/components/craft/ui/popover.tsx` (re-exports the stock `ui/popover`, overrides `PopoverContent`).
- `anchor`: element the popup positions against (MultiSelect passes its wrapper ref).
- `container`: portal target, default `document.body`. Pass a node inside a modal or shadow root.
- Why: the clip overlay renders inside a shadow DOM (`all-ui.content`). A body-portalled popup would sit outside that root, lose its styles, and fight Base UI Dialog focus/inert handling. MultiSelect uses `container={wrapper}`.

## shadcn CLI

- Config: `apps/extension/components.json` (style `base-nova`, css `src/assets/tailwind.css`, icons `lucide`) and `apps/web/components.json` (css `src/index.css`).
- Preset: style `base-nova`, applied via the CLI as preset `b2Pg` (the preset id is not recorded in either `components.json`).
- `shadcn apply` cannot detect the WXT extension app. Workaround: create a temporary `vite.config.ts` in `apps/extension` while running it, then remove it.
