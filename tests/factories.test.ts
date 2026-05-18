import { Trie } from "../src/trie";

describe("Trie.from / Trie.fromKeys", () => {
  test("from accepts an array of [key, value] pairs", () => {
    const t = Trie.from<number>([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    expect(t.size).toBe(3);
    expect(t.get("a")).toBe(1);
    expect(t.get("c")).toBe(3);
  });

  test("from accepts any iterable, e.g. a Map", () => {
    const source = new Map<string, string>([
      ["x", "X"],
      ["y", "Y"],
    ]);
    const t = Trie.from(source);
    expect(t.size).toBe(2);
    expect(t.get("y")).toBe("Y");
  });

  test("from gives the last value when keys repeat", () => {
    const t = Trie.from<number>([
      ["a", 1],
      ["a", 99],
    ]);
    expect(t.get("a")).toBe(99);
    expect(t.size).toBe(1);
  });

  test("from on an empty iterable yields an empty trie", () => {
    const t = Trie.from<number>([]);
    expect(t.size).toBe(0);
  });

  test("fromKeys maps every key to true", () => {
    const t = Trie.fromKeys(["apple", "banana", "cherry"]);
    expect(t.size).toBe(3);
    expect(t.get("apple")).toBe(true);
    expect(t.has("banana")).toBe(true);
    expect(t.get("missing")).toBeUndefined();
  });

  test("fromKeys accepts a Set", () => {
    const t = Trie.fromKeys(new Set(["one", "two"]));
    expect(t.size).toBe(2);
    expect(Array.from(t.keys()).sort()).toEqual(["one", "two"]);
  });
});
