import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import MultipleSelector from "@/components/ui/multiple-selector";
import { useMemo, useCallback } from "react"; // Fixed: Added missing imports
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { parentTagsAtom, tagsAtom } from "@/entrypoints/main/atoms/tags";
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
  useToggleSelectionMode,
  useSyncSelectedTags,
} from "@/entrypoints/main/atoms/selection";

import { filteredAtom } from "../Library.Context";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import { useLibraryContext } from "../Library.Context";

export default function Filters() {
  const parentTags = useAtomValue(parentTagsAtom);
  const tags = useAtomValue(tagsAtom);

  const { removeContents, filterData } = useLibraryContext();

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
        await syncSelectedTags();
        set(bulkUpdateModalOpenAtom, true);
      },
      [syncSelectedTags],
    ),
  );

  // Performance Fix: Read current filtered items atomically on-demand instead of mapping over rendering dependencies
  const handleSelectAllChange = useAtomCallback(
    useCallback(
      (get, set, checked: boolean) => {
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
        if (
          !confirm(
            `Are you sure you want to remove ${selectedEntries.length} items?`,
          )
        )
          return;
        removeContents(selectedEntries);
        set(selectionEntriesAtom, []);
      },
      [selectionEntriesAtom, removeContents],
    ),
  );

  const allTagsForMultiSelectComponent = useMemo(
    () =>
      Object.keys(tags).map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags],
  );

  const anyAndNoneTagsForMuliSelectComponent = useMemo(() => {
    const parentTagsConverted = Object.keys(parentTags).map((o: string) => ({
      label: o + ":*",
      value: o + ":*",
    }));

    return [
      ...allTagsForMultiSelectComponent,
      {
        label: "*",
        value: "*",
      },
      ...parentTagsConverted,
    ];
  }, [allTagsForMultiSelectComponent, parentTags]);

  // Is selection fully complete? Check atomically.
  const isAllSelected = useAtomValue(
    useMemo(
      () =>
        atom(
          (get) =>
            get(selectionEntriesAtom).length === get(filteredAtom).length,
        ),
      [],
    ),
  );

  return (
    <>
      <Input
        value={search}
        onChange={(a) => setSearch(a.target.value)}
        placeholder="Search"
        className="mb-4"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <MultipleSelector
          value={any}
          onChange={setAny}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder="Any of these tags"
        />
        <MultipleSelector
          value={none}
          onChange={setNone}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder="None of these tags"
        />
        <MultipleSelector
          value={all}
          onChange={setAll}
          options={allTagsForMultiSelectComponent}
          placeholder="All of these tags"
        />
      </div>
      <div className="mb-4 flex items-center">
        <Button
          onClick={() => {
            injectFilterDataIntoURL();
            filterData();
          }}
          className="w-full max-w-2xs"
        >
          Filter
        </Button>
        <button
          className="text-muted-foreground underline ml-4 cursor-pointer text-sm bg-transparent border-none"
          onClick={reset}
        >
          Clear Filters
        </button>
      </div>

      <div className="flex justify-between mb-4 items-center">
        <div className="flex items-center space-x-5">
          <Button onClick={toggleSelectionMode} variant="outline">
            Toggle Selection Mode
          </Button>
          <span className="font-mono text-base">{filteredLength}</span>
          {selectionOn && (
            <>
              <div className="flex items-center space-x-2">
                <Label htmlFor="select-all-checkbox">Select All</Label>
                <Checkbox
                  id="select-all-checkbox"
                  checked={isAllSelected}
                  onCheckedChange={(checked) =>
                    handleSelectAllChange(!!checked)
                  }
                />
              </div>
              <span className="font-mono text-base text-muted-foreground">
                ({selectedEntries.length} selected)
              </span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Label htmlFor="order-latest-switch">Order By Latest</Label>
          <Switch
            id="order-latest-switch"
            checked={orderByLatest}
            onCheckedChange={(a) => {
              setFiltered((old) => [...old].reverse()); // Safe reverse execution clone
              setOrderByLatest(a);
            }}
          />
        </div>
      </div>

      {selectionOn && (
        <div className="flex gap-2">
          <Button
            disabled={selectedEntries.length < 1}
            onClick={toggleBulkUpdateModal}
            className="mb-4"
            variant="outline"
          >
            Update Selected
          </Button>
          <Button
            disabled={selectedEntries.length < 1}
            onClick={removeSelected}
            className="mb-4 text-red-500 hover:text-red-600"
            variant="outline"
          >
            Remove Selected
          </Button>
        </div>
      )}
      <div className="mb-10" />
    </>
  );
}
