import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import MultipleSelector from "@/components/ui/multiple-selector";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
  selectAllAtom,
  selectionEntriesAtom,
  selectionOnAtom,
  toggleSelectionModeAtom,
  unSelectAllAtom,
  syncSelectedTagsAtom,
} from "@/entrypoints/main/atoms/selection";

import { filterDataAtom, filteredAtom } from "../atom";
import { bulkUpdateModalOpenAtom } from "@/components/craft/BulkUpdateModal";
import { removeContentsAtom } from "@/entrypoints/main/atoms/contentData";

export default function Filters() {
  const tagParents = useAtomValue(tagParentsAtom);
  const tags = useAtomValue(tagsAtom);

  const removeContents = useSetAtom(removeContentsAtom);

  const [filtered, setFiltered] = useAtom(filteredAtom);

  const [search, setSearch] = useAtom(searchAtom);
  const [all, setAll] = useAtom(allAtom);
  const [any, setAny] = useAtom(anyAtom);
  const [none, setNone] = useAtom(noneAtom);
  const [orderByLatest, setOrderByLatest] = useAtom(orderByLatestAtom);

  const reset = useSetAtom(resetFilterAtom);

  const injectFilterDataIntoURL = useSetAtom(injectFilterDataIntoURLAtom);
  const filterData = useSetAtom(filterDataAtom);

  const selectedEntries = useAtomValue(selectionEntriesAtom);
  const selectionOn = useAtomValue(selectionOnAtom);
  const toggleSelectionMode = useSetAtom(toggleSelectionModeAtom);
  const selectAll = useSetAtom(selectAllAtom);
  const unSelectAll = useSetAtom(unSelectAllAtom);

  const setBulkUpdateModalOpen = useSetAtom(bulkUpdateModalOpenAtom);

  const syncSelectedTags = useSetAtom(syncSelectedTagsAtom);

  const toggleBulkUpdateModal = useCallback(() => {
    syncSelectedTags();
    setBulkUpdateModalOpen(true);
  }, []);

  const onSelectAllCheckedChange = useCallback(
    (a: boolean) => (a ? selectAll(filtered) : unSelectAll()),
    [filtered],
  );

  const deleteSelected = useCallback(() => {
    if (!confirm(`U sure u want to delete ${selectedEntries.length} items ?`))
      return;
    setFiltered((old: string[]) =>
      old.filter((entry) => !selectedEntries.includes(entry)),
    );
    removeContents(selectedEntries);
  }, [selectedEntries]);

  const allTagsForMultiSelectComponent = useMemo(
    () =>
      Object.keys(tags).map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags],
  );

  const anyAndNoneTagsForMuliSelectComponent = useMemo(() => {
    const tagParentsCoverted = tagParents.map((o: string) => ({
      label: o + ":*",
      value: o + ":*",
    }));

    return [
      ...allTagsForMultiSelectComponent,
      {
        label: "*",
        value: "*",
      },
      ...tagParentsCoverted,
    ];
  }, [allTagsForMultiSelectComponent, tagParents]);

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
          placeholder={"Any of these tags"}
        />
        <MultipleSelector
          value={none}
          onChange={setNone}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder={"None of these tags"}
        />
        <MultipleSelector
          value={all}
          onChange={setAll}
          options={allTagsForMultiSelectComponent}
          placeholder={"All of these tags"}
        />
      </div>
      <div className="mb-4">
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
          className="text-muted-foreground underline ml-4"
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
          <span className="font-mono text-base">{filtered.length}</span>
          {selectionOn ? (
            <>
              <div className="flex space-x-3">
                <Label>Select All</Label>
                <Checkbox
                  checked={selectedEntries.length === filtered.length}
                  onCheckedChange={onSelectAllCheckedChange}
                />
              </div>
              <span className="font-mono text-base">
                {selectedEntries.length}
              </span>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="flex space-x-3">
          <Label>Order By Latest</Label>
          <Switch
            checked={orderByLatest}
            onCheckedChange={(a) => {
              setFiltered((old) => old.toReversed());
              setOrderByLatest(a);
            }}
          />
        </div>
      </div>
      {selectionOn ? (
        <div>
          <Button
            disabled={selectedEntries.length < 1}
            onClick={toggleBulkUpdateModal}
            className="mb-4 mr-4"
            variant="outline"
          >
            Update Selected
          </Button>
          <Button
            disabled={selectedEntries.length < 1}
            onClick={deleteSelected}
            className="mb-4"
            variant="outline"
          >
            Delete Selected
          </Button>
        </div>
      ) : (
        <></>
      )}
      <div className="mb-10" />
    </>
  );
}
