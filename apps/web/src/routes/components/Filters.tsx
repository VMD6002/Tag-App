import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MultipleSelector from "@/components/ui/multiple-selector";
import { useMemo } from "react"; // Fixed: Added missing imports
import { useAtom, useSetAtom } from "jotai";
import {
  allAtom,
  anyAtom,
  injectFilterDataIntoURLAtom,
  noneAtom,
  orderByLatestAtom,
  resetFilterAtom,
  searchAtom,
} from "@/atom";

import { filteredAtom } from "../Remote.Context";
import { useRemoteContext } from "../Remote.Context";

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
