import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServer } from "../contexts/Server.Context";
import MultipleSelector from "@/components/ui/multiple-selector";
import { useMemo } from "react";
import { useAtom } from "jotai";
import {
  allAtom,
  anyAtom,
  noneAtom,
  orderByLatestAtom,
  searchAtom,
  typesAtom,
} from "@/atom";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { contentTypes } from "@tagapp/utils";

export default function Filters() {
  const { tags, filterData, setFiltered } = useServer();

  const [search, setSearch] = useAtom(searchAtom);
  const [all, setAll] = useAtom(allAtom);
  const [any, setAny] = useAtom(anyAtom);
  const [none, setNone] = useAtom(noneAtom);
  const [types, setTypes] = useAtom(typesAtom);
  const [orderByLatest, setOrderByLatest] = useAtom(orderByLatestAtom);

  const tagsForMultiSelectComponent = useMemo(
    () =>
      tags.map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags],
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
    return [
      ...tagsForMultiSelectComponent,
      {
        label: "*",
        value: "*",
      },
      ...convertTedParentTags,
    ];
  }, [tagsForMultiSelectComponent, tags]);

  return (
    <>
      <Input
        value={search}
        onChange={(a) => setSearch(a.target.value)}
        placeholder="Search"
        className="mb-4"
      />
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <MultipleSelector
          value={types}
          onChange={setTypes}
          options={contentTypes.map((o) => ({ label: o, value: o }))}
          placeholder={"All of these Content Types"}
        />
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
          options={tagsForMultiSelectComponent}
          placeholder={"All of these tags"}
        />
      </div>
      <div className="mb-4 gap-2 flex justify-between flex-wrap">
        <Button onClick={filterData} className="w-full max-w-[18rem]">
          Filter
        </Button>
        <div className="flex space-x-3">
          <Label>Order By Latest</Label>
          <Switch
            checked={orderByLatest}
            onCheckedChange={(a) => {
              setFiltered((old) => old.reverse());
              setOrderByLatest(a);
            }}
          />
        </div>
      </div>
      <div className="mb-10" />
    </>
  );
}
