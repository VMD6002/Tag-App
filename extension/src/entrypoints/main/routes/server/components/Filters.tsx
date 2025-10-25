import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useServer } from "../contexts/Server.Context";
import MultipleSelector from "@/components/ui/multiple-selector";
import type { ServerContext } from "../contexts/Server.Context";

export default function Filters() {
  const {
    Filter,
    tags,
    setFiltered,
    filtered,
    Selection,
    removeContents,
    filterData,
    serverSyncFunc,
  } = useServer() as ServerContext;

  const onSelectAllCheckedChange = useCallback(
    (a: boolean) =>
      a
        ? Selection.selectAll(filtered.map((o: ContentType) => o.id))
        : Selection.unSelectAll(),
    [filtered]
  );

  const deleteSelected = useCallback(() => {
    if (!confirm(`U sure u want to delete ${Selection.entries.length} items ?`))
      return;
    setFiltered((old: ContentType[]) =>
      old.filter((entry) => !Selection.entries.includes(entry.id))
    );
    removeContents(Selection.entries);
  }, [Selection.entries]);

  const syncSelectedTags = useCallback(() => {
    const TagsArray = filtered
      .filter((o: ContentType) => Selection.entries.includes(o.id))
      .map((content: ContentType) => content.Tags);

    const Data = TagsArray.reduce((a: string[], b: string[]) =>
      a.filter((c) => b.includes(c))
    );
    Selection.tagsInitial.current = Data;
    Selection.setTags(Data.map((o: string) => ({ label: o, value: o })));
  }, [Selection.entries, filtered, Selection.tagsInitial]);

  const openBulkUpdateModal = useCallback(() => {
    syncSelectedTags();
    Selection.toggleModalFunc();
  }, [syncSelectedTags]);

  const tagsForMultiSelectComponent = useMemo(
    () =>
      tags.sort().map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags]
  );

  const anyAndNoneTagsForMuliSelectComponent = useMemo(() => {
    const convertTedParentTags = [
      ...new Set(tags.map((o: string) => o.split(":")[0])),
    ]
      .sort()
      .map((o: string) => ({
        label: o + ":*",
        value: o + ":*",
      }));
    return [...tagsForMultiSelectComponent, ...convertTedParentTags];
  }, [tagsForMultiSelectComponent, tags]);

  return (
    <>
      <Input
        value={Filter.search}
        onChange={(a) => Filter.setSearch(a.target.value)}
        placeholder="Search"
        className="mb-4"
      />
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <MultipleSelector
          value={Filter.types}
          onChange={Filter.setTypes}
          options={[
            { value: "img", label: "img" },
            { value: "video", label: "video" },
            { value: "ImgSet", label: "ImgSet" },
            { value: "VideoSet", label: "VideoSet" },
          ]}
          placeholder={"All of these Content Types"}
        />
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
          options={tagsForMultiSelectComponent}
          placeholder={"All of these tags"}
        />
      </div>
      <div className="mb-4 gap-2 flex justify-between flex-wrap">
        <Button
          onClick={() => {
            Filter.injectFilterDataIntoURL();
            filterData();
          }}
          className="w-full max-w-2xs"
        >
          Filter
        </Button>
        <Button onClick={serverSyncFunc} className="w-fit">
          Sync
        </Button>
      </div>
      <div className="flex justify-between mb-4 items-center flex-wrap-reverse gap-y-3">
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
              setFiltered((old) => old.toReversed());
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
