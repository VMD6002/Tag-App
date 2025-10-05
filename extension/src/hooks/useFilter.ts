import { useLayoutEffect } from "react";

const urlArrToObjArrForMultiSelect = (arr: string) =>
  arr.split(",").map((val) => ({ label: val, value: val }));

export default function useFilter() {
  const { orderByLatest } = useSettingsData();
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<MultiSelectOption[]>([]);
  const [all, setAll] = useState<MultiSelectOption[]>([]);
  const [any, setAny] = useState<MultiSelectOption[]>([]);
  const [none, setNone] = useState<MultiSelectOption[]>([]);

  const FilterData = useMemo(
    () => ({
      search,
      all: all.map((o) => o.value),
      any: any.map((o) => o.value),
      none: none.map((o) => o.value),
      types: types.map((o) => o.value),
      orderByLatest,
    }),
    [search, all, any, none, orderByLatest, types]
  );

  const injectFilterDataIntoURL = useCallback(() => {
    const url = new URL(location.href);
    const params = url.searchParams;

    FilterData.any.length
      ? params.set("any", FilterData.any.join(","))
      : params.delete("any");

    FilterData.none.length
      ? params.set("none", FilterData.none.join(","))
      : params.delete("none");

    FilterData.all.length
      ? params.set("all", FilterData.all.join(","))
      : params.delete("all");

    FilterData.types.length
      ? params.set("types", FilterData.types.join(","))
      : params.delete("types");

    FilterData.search.trim()
      ? params.set("search", FilterData.search)
      : params.delete("search");

    history.pushState({}, "", url.toString());
  }, [FilterData]);

  const reset = useCallback(() => {
    setSearch("");
    setAll([]);
    setAny([]);
    setNone([]);
  }, []);

  useLayoutEffect(() => {
    const urlFilterData = Object.fromEntries(
      new URL(location.href).searchParams.entries()
    );
    if (urlFilterData.any)
      setAny(urlArrToObjArrForMultiSelect(urlFilterData.any));
    if (urlFilterData.none)
      setNone(urlArrToObjArrForMultiSelect(urlFilterData.none));
    if (urlFilterData.all)
      setAll(urlArrToObjArrForMultiSelect(urlFilterData.all));
    if (urlFilterData.types)
      setTypes(urlArrToObjArrForMultiSelect(urlFilterData.types));
    if (urlFilterData.search) setSearch(urlFilterData.search);
  }, []);

  return {
    FilterData,
    reset,
    search,
    setSearch,
    all,
    setAll,
    any,
    setAny,
    none,
    setNone,
    orderByLatest,
    setTypes,
    types,
    injectFilterDataIntoURL,
  };
}
