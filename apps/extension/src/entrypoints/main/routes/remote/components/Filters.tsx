import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { CheckSquare, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useMemo } from "react"; // Fixed: Added missing imports
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import { confirm } from "@/components/craft/confirm-dialog";
import {
  FilterField,
  FilterPanel,
  ResultsBar,
} from "@/components/craft/library/FilterPanel";
import MultiSelect from "@/components/craft/MultiSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  allAtom,
  anyAtom,
  noneAtom,
  orderByLatestAtom,
  searchAtom,
  useInjectFilterDataIntoURL,
  useResetFilter,
} from "@/entrypoints/main/atoms/filter";
import {
  selectionEntriesAtom,
  selectionOnAtom,
  useSyncSelectedTags,
  useToggleSelectionMode,
} from "@/entrypoints/main/atoms/selection";
import { filteredAtom, useRemoteContext } from "../Remote.Context";

export default function Filters() {
  const { removeContents, filterData, tags } = useRemoteContext();

  // Performance Fix: Avoid reading whole `filtered` array directly here to prevent filter panel stuttering
  const setFiltered = useSetAtom(filteredAtom);
  const filteredLength = useAtomValue(
    useMemo(() => atom((get) => get(filteredAtom).length), []),
  );

  const [search, setSearch] = useAtom(searchAtom);
  const [all, setAll] = useAtom(allAtom);
  const [any, setAny] = useAtom(anyAtom);
  const [none, setNone] = useAtom(noneAtom);
  const [orderByLatest, setOrderByLatest] = useAtom(orderByLatestAtom);

  const reset = useResetFilter();
  const injectFilterDataIntoURL = useInjectFilterDataIntoURL();

  const selectedEntries = useAtomValue(selectionEntriesAtom);
  const selectionOn = useAtomValue(selectionOnAtom);
  const toggleSelectionMode = useToggleSelectionMode();
  const syncSelectedTags = useSyncSelectedTags();

  // Wired code but the set here actually runs a function for syncSelectTagsAtom
  const toggleBulkUpdateModal = useAtomCallback(
    useCallback(
      async (get, set) => {
        const filtered = get(filteredAtom);
        await syncSelectedTags(filtered);
        set(bulkUpdateModalOpenAtom, true);
      },
      [syncSelectedTags],
    ),
  );

  // Performance Fix: Read current filtered items atomically on-demand instead of mapping over rendering dependencies
  const handleSelectAllChange = useAtomCallback(
    useCallback(
      async (get, set, checked: boolean) => {
        if (checked) {
          const currentFiltered = get(filteredAtom);
          set(
            selectionEntriesAtom,
            currentFiltered.map((o) => o.id),
          );
        } else {
          set(selectionEntriesAtom, []);
        }
      },
      [filteredAtom, selectionEntriesAtom],
    ),
  );

  const removeSelected = useAtomCallback(
    useCallback(
      (get, set) => {
        const selectedEntries = get(selectionEntriesAtom);
        confirm
          .destructive({
            title: "Remove selected items?",
            description: `${selectedEntries.length} ${selectedEntries.length === 1 ? "item" : "items"} will be removed from your library. This can't be undone.`,
            confirmText: "Remove",
          })
          .then((ok) => {
            if (ok) {
              removeContents(selectedEntries);
              set(selectionEntriesAtom, []);
            }
          });
      },
      [selectionEntriesAtom, removeContents],
    ),
  );

  const allTagsForMultiSelectComponent = useMemo(
    () =>
      tags.map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags],
  );

  const anyAndNoneTagsForMuliSelectComponent = useMemo(() => {
    const parentTags = Array.from(
      new Set(tags.map((tag) => tag.split(":")[0])),
    );
    const tagParentsConverted = parentTags.map((o) => ({
      label: `${o}:*`,
      value: `${o}:*`,
    }));

    return [
      ...allTagsForMultiSelectComponent,
      {
        label: "*",
        value: "*",
      },
      ...tagParentsConverted,
    ];
  }, [allTagsForMultiSelectComponent]);

  // Is selection fully complete? Check atomically.
  const isAllSelected = useAtomValue(
    useMemo(
      () =>
        atom(
          (get) =>
            get(filteredAtom).length > 0 &&
            get(selectionEntriesAtom).length === get(filteredAtom).length,
        ),
      [],
    ),
  );

  const activeCount =
    any.length + none.length + all.length + (search.trim() ? 1 : 0);

  const applyFilters = () => {
    injectFilterDataIntoURL();
    filterData();
  };

  return (
    <>
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        onApply={applyFilters}
        onClear={() => {
          reset();
          injectFilterDataIntoURL();
        }}
        activeCount={activeCount}
      >
        <FilterField label="Any of" hint="at least one">
          <MultiSelect
            value={any}
            onChange={setAny}
            options={anyAndNoneTagsForMuliSelectComponent}
            placeholder="Choose tags"
            label="Any of these tags"
          />
        </FilterField>
        <FilterField label="None of" hint="exclude these">
          <MultiSelect
            value={none}
            onChange={setNone}
            options={anyAndNoneTagsForMuliSelectComponent}
            placeholder="Choose tags"
            label="None of these tags"
          />
        </FilterField>
        <FilterField label="All of" hint="must have every one">
          <MultiSelect
            value={all}
            onChange={setAll}
            options={allTagsForMultiSelectComponent}
            placeholder="Choose tags"
            label="All of these tags"
          />
        </FilterField>
      </FilterPanel>

      <ResultsBar
        left={
          <>
            <Button
              onClick={toggleSelectionMode}
              variant={selectionOn ? "default" : "outline"}
              size="sm"
              aria-pressed={selectionOn}
              title={
                selectionOn
                  ? "Leave selection mode"
                  : "Select several items to edit tags or remove them together"
              }
            >
              {selectionOn ? (
                <>
                  <X /> Done selecting
                </>
              ) : (
                <>
                  <CheckSquare /> Select items
                </>
              )}
            </Button>

            {selectionOn ? (
              <>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all-checkbox"
                    checked={isAllSelected}
                    onCheckedChange={(checked) =>
                      handleSelectAllChange(!!checked)
                    }
                  />
                  <Label htmlFor="select-all-checkbox" className="text-sm">
                    Select all
                  </Label>
                </div>
                <span
                  aria-live="polite"
                  className="text-sm tabular-nums text-muted-foreground"
                >
                  {selectedEntries.length} of {filteredLength} selected
                </span>
                <Button
                  disabled={selectedEntries.length < 1}
                  onClick={toggleBulkUpdateModal}
                  variant="outline"
                  size="sm"
                  title="Add or remove tags on the selected items"
                >
                  <Pencil /> Edit tags
                </Button>
                <Button
                  disabled={selectedEntries.length < 1}
                  onClick={removeSelected}
                  variant="outline"
                  size="sm"
                  title="Remove the selected items from the library"
                  className="hover:text-destructive"
                >
                  <Trash2 /> Remove
                </Button>
              </>
            ) : (
              <p aria-live="polite" className="text-sm text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">
                  {filteredLength}
                </span>{" "}
                {filteredLength === 1 ? "item" : "items"}
              </p>
            )}
          </>
        }
        right={
          <>
            <Label htmlFor="order-latest-switch" className="text-sm">
              Newest first
            </Label>
            <Switch
              id="order-latest-switch"
              checked={orderByLatest}
              onCheckedChange={(a) => {
                setFiltered((old) => [...old].reverse());
                setOrderByLatest(a);
              }}
            />
          </>
        }
      />
    </>
  );
}
