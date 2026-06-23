import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import MultipleSelector from "@/components/ui/multiple-selector";
import { useMemo, useCallback } from "react"; // Fixed: Added missing imports
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { tagParentsAtom, tagsAtom } from "@/entrypoints/main/atoms/tags";
import {
  allAtom,
  anyAtom,
  injectFilterDataIntoURLAtom,
  noneAtom,
  orderByLatestAtom,
  resetFilterAtom,
  searchAtom,
} from "@/entrypoints/main/atoms/filter";
import {
  selectionEntriesAtom,
  selectionOnAtom,
  toggleSelectionModeAtom,
  syncSelectedTagsAtom,
} from "@/entrypoints/main/atoms/selection";

import { filteredAtom } from "../Remote.Context";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import { useRemoteContext } from "../Remote.Context";

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

  const reset = useSetAtom(resetFilterAtom);
  const injectFilterDataIntoURL = useSetAtom(injectFilterDataIntoURLAtom);

  const selectedEntries = useAtomValue(selectionEntriesAtom);
  const selectionOn = useAtomValue(selectionOnAtom);
  const toggleSelectionMode = useSetAtom(toggleSelectionModeAtom);

  // Wired code but the set here actually runs a function for syncSelectTagsAtom
  const toggleBulkUpdateModal = useSetAtom(
    atom(null, (get, set) => {
      set(syncSelectedTagsAtom, get(filteredAtom));
      set(bulkUpdateModalOpenAtom, true);
    }),
  );

  // Performance Fix: Read current filtered items atomically on-demand instead of mapping over rendering dependencies
  const handleSelectAllChange = useSetAtom(
    atom(null, (get, set, checked: boolean) => {
      if (checked) {
        const currentFiltered = get(filteredAtom);
        set(
          selectionEntriesAtom,
          currentFiltered.map((o) => o.id),
        );
      } else {
        set(selectionEntriesAtom, []);
      }
    }),
  );

  const removeSelected = useSetAtom(
    atom(null, (get, set) => {
      const selectedEntries = get(selectionEntriesAtom);
      if (
        !confirm(
          `Are you sure you want to remove ${selectedEntries.length} items?`,
        )
      )
        return;
      removeContents(selectedEntries);
      set(selectionEntriesAtom, []);
    }),
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
    const parentTags = Array.from(
      new Set(Object.keys(tags).map((tag) => tag.split(":")[0])),
    );
    const tagParentsConverted = parentTags.map((o: string) => ({
      label: o + ":*",
      value: o + ":*",
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
