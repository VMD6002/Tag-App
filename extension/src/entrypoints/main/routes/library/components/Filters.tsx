import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocal } from "../Local.Context";
import MultipleSelector from "@/components/ui/multiple-selector";
import type { LocalContext } from "../Local.Context";

export default function Filters() {
  const {
    Filter,
    tags,
    setFiltered,
    filtered,
    Selection,
    removeContents,
    contentData,
    filterData,
    tagParents,
  } = useLocal() as LocalContext;

  const onSelectAllCheckedChange = useCallback(
    (a: boolean) =>
      a ? Selection.selectAll(filtered) : Selection.unSelectAll(),
    [filtered]
  );

  const deleteSelected = useCallback(() => {
    if (!confirm(`U sure u want to delete ${Selection.entries.length} items ?`))
      return;
    setFiltered((old: string[]) =>
      old.filter((entry) => !Selection.entries.includes(entry))
    );
    removeContents(Selection.entries);
  }, [Selection.entries]);

  const openBulkUpdateModal = useCallback(() => {
    Selection.syncSelectedTags(contentData);
    Selection.toggleModalFunc();
  }, [contentData, Selection.entries]);

  const allTagsForMultiSelectComponent = useMemo(
    () =>
      Object.keys(tags).map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags]
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
        value={Filter.search}
        onChange={(a) => Filter.setSearch(a.target.value)}
        placeholder="Search"
        className="mb-4"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <MultipleSelector
          value={Filter.any}
          onChange={Filter.setAny}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder={"Any of these tags"}
        />
        <MultipleSelector
          value={Filter.none}
          onChange={Filter.setNone}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder={"None of these tags"}
        />
        <MultipleSelector
          value={Filter.all}
          onChange={Filter.setAll}
          options={allTagsForMultiSelectComponent}
          placeholder={"All of these tags"}
        />
      </div>
      <div className="mb-4">
        <Button
          onClick={() => {
            Filter.injectFilterDataIntoURL();
            filterData();
          }}
          className="w-full max-w-[18rem]"
        >
          Filter
        </Button>
        <button
          className="text-muted-foreground underline ml-4"
          onClick={Filter.reset}
        >
          Clear Filters
        </button>
      </div>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex items-center space-x-5">
          <Button onClick={Selection.toggleSelectionMode} variant="outline">
            Toggle Selection Mode
          </Button>
          <span className="font-mono text-base">{filtered.length}</span>
          {Selection.on ? (
            <>
              <div className="flex space-x-3">
                <Label>Select All</Label>
                <Checkbox
                  checked={Selection.entries.length === filtered.length}
                  onCheckedChange={onSelectAllCheckedChange}
                />
              </div>
              <span className="font-mono text-base">
                {Selection.entries.length}
              </span>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="flex space-x-3">
          <Label>Order By Latest</Label>
          <Switch
            checked={Filter.orderByLatest}
            onCheckedChange={(a) => {
              setFiltered((old: string[]) => [...old].reverse());
              Filter.setOrderByLatest(a);
            }}
          />
        </div>
      </div>
      {Selection.on ? (
        <div>
          <Button
            disabled={Selection.entries.length < 1}
            onClick={openBulkUpdateModal}
            className="mb-4 mr-4"
            variant="outline"
          >
            Update Selected
          </Button>
          <Button
            disabled={Selection.entries.length < 1}
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
