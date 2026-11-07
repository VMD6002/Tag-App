import { describe, expect, test } from "bun:test";
import { ArrayHasAnyModified } from "./ArrayHelperFunctions";
import { computeTagCounts } from "./computeTagCounts";
import { filterData } from "./filterData";
import {
  applyConstants,
  replaceWithConstantKey,
} from "./StringHelperFunctions";

const item = (id: string, tags: string[], added: number) => ({
  id,
  title: id,
  tags,
  extraData: "",
  url: "",
  scraper: "s",
  added,
  lastUpdated: added,
});
const data = {
  a: item("a", ["Type:GIF", "Site:X"], 1),
  b: item("b", ["Type:Clip"], 2),
  c: item("c", [], 3),
};
const q = { any: [], all: [], none: [], search: "", orderByLatest: true };
const ids = (r: { id: string }[]) => r.map((o) => o.id);

describe("filterData", () => {
  test("orders by added", () => {
    expect(ids(filterData(q, data))).toEqual(["c", "b", "a"]);
    expect(ids(filterData({ ...q, orderByLatest: false }, data))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
  test("any / all / none with wildcards", () => {
    expect(ids(filterData({ ...q, any: ["Type:*"] }, data))).toEqual([
      "b",
      "a",
    ]);
    expect(
      ids(filterData({ ...q, all: ["Type:GIF", "Site:X"] }, data)),
    ).toEqual(["a"]);
    expect(ids(filterData({ ...q, none: ["*"] }, data))).toEqual(["c"]);
  });
});

test("ArrayHasAnyModified: parent wildcard needs the colon", () => {
  expect(ArrayHasAnyModified(["Typer:x"], ["Type:*"])).toBe(false);
});

test("constants round trip", () => {
  const c = { cdn: "https://cdn.example.com" };
  const short = replaceWithConstantKey("https://cdn.example.com/a.jpg", c);
  expect(short).toBe("$cdn/a.jpg");
  expect(applyConstants(short, c)).toBe("https://cdn.example.com/a.jpg");
});

describe("computeTagCounts", () => {
  test("counts a duplicated tag once, rebuilds parents, keeps covers and zero-count tags", () => {
    const r = computeTagCounts(
      [{ tags: ["A:x", "A:x", "B:y"] }, { tags: ["A:x"] }],
      { "A:x": { count: 9, cover: "c" }, "Z:old": { count: 3 } },
      { Z: { cover: "pc" } },
    );
    expect(r.tags).toEqual({
      "A:x": { count: 2, cover: "c" },
      "B:y": { count: 1 },
      "Z:old": { count: 0 },
    });
    expect(r.parentTags).toEqual({ A: {}, B: {}, Z: { cover: "pc" } });
  });
});
