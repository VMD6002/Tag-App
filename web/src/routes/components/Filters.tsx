import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServer } from "../contexts/Server.Context";
import MultipleSelector from "@/components/ui/multiple-selector";
import type { ServerContext } from "../contexts/Server.Context";
import { useMemo } from "react";

export default function Filters() {
  const { Filter, tags, filterData } = useServer() as ServerContext;

  const tagsForMultiSelectComponent = useMemo(
    () =>
      tags.map((o: string) => ({
        label: o,
        value: o,
      })),
    [tags]
  );

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
          options={tagsForMultiSelectComponent}
          placeholder={"Any of these tags"}
        />
        <MultipleSelector
          value={Filter.none}
          onChange={Filter.setNone}
          options={tagsForMultiSelectComponent}
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
          className="w-full max-w-[18rem]"
        >
          Filter
        </Button>
      </div>
      <div className="mb-10" />
    </>
  );
}
