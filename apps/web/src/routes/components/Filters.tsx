import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
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
import {
  FilterField,
  FilterPanel,
  ResultsBar,
} from "@/components/craft/library/FilterPanel";
import MultiSelect from "@/components/craft/MultiSelect";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { filteredAtom, useRemoteContext } from "../Remote.Context";

const filteredLengthAtom = atom((get) => get(filteredAtom).length);

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
  }, [allTagsForMultiSelectComponent, tags]);

  const activeCount =
    any.length + none.length + all.length + (search.trim() ? 1 : 0);

  const applyFilters = () => {
    injectFilterDataIntoURL();
    filterData();
  };

  const filteredLength = useAtomValue(filteredLengthAtom);

  return (
    <>
      <FilterPanel
        search={search}
        onSearchChange={setSearch}
        onApply={applyFilters}
        onClear={reset}
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
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">
              {filteredLength}
            </span>{" "}
            {filteredLength === 1 ? "item" : "items"}
          </p>
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
                setFiltered((old) => [...old].reverse()); // Safe reverse execution clone
                setOrderByLatest(a);
              }}
            />
          </>
        }
      />
    </>
  );
}
