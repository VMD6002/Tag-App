import { useAtom, useSetAtom } from "jotai";
import { useMemo } from "react"; // Fixed: Added missing imports
import {
  allAtom,
  anyAtom,
  injectFilterDataIntoURLAtom,
  noneAtom,
  orderByLatestAtom,
  resetFilterAtom,
  searchAtom,
} from "@/atom";
import MultiSelect from "@/components/craft/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { filteredAtom, useRemoteContext } from "../Remote.Context";

export default function Filters() {
  const { filterData, tags } = useRemoteContext();

  // Performance Fix: Avoid reading whole `filtered` array directly here to prevent filter panel stuttering
  const setFiltered = useSetAtom(filteredAtom);

  const [search, setSearch] = useAtom(searchAtom);
  const [all, setAll] = useAtom(allAtom);
  const [any, setAny] = useAtom(anyAtom);
  const [none, setNone] = useAtom(noneAtom);
  const [orderByLatest, setOrderByLatest] = useAtom(orderByLatestAtom);

  const reset = useSetAtom(resetFilterAtom);
  const injectFilterDataIntoURL = useSetAtom(injectFilterDataIntoURLAtom);

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
    const tagParentsConverted = parentTags.map((o: string) => ({
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

  return (
    <>
      <Input
        value={search}
        onChange={(a) => setSearch(a.target.value)}
        placeholder="Search"
        className="mb-4"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <MultiSelect
          value={any}
          onChange={setAny}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder="Any of these tags"
        />
        <MultiSelect
          value={none}
          onChange={setNone}
          options={anyAndNoneTagsForMuliSelectComponent}
          placeholder="None of these tags"
        />
        <MultiSelect
          value={all}
          onChange={setAll}
          options={allTagsForMultiSelectComponent}
          placeholder="All of these tags"
        />
      </div>
      <div className="flex justify-between mb-4 items-center">
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
            type="button"
            className="text-muted-foreground underline ml-4 cursor-pointer text-sm bg-transparent border-none"
            onClick={reset}
          >
            Clear Filters
          </button>
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
      <div className="mb-10" />
    </>
  );
}
