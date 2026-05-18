import { Trie } from "../src/trie";

describe("Trie iteration", () => {
  const sample = (): Trie<number> => {
    const t = new Trie<number>();
    t.set("banana", 2);
    t.set("apple", 1);
    t.set("cherry", 3);
    t.set("apricot", 4);
    return t;
  };

  test("entries yields lexicographic order", () => {
    const t = sample();
    expect(Array.from(t.entries())).toEqual([
      ["apple", 1],
      ["apricot", 4],
      ["banana", 2],
      ["cherry", 3],
    ]);
  });

  test("keys yields the same order as entries", () => {
    const t = sample();
    expect(Array.from(t.keys())).toEqual([
      "apple",
      "apricot",
      "banana",
      "cherry",
    ]);
  });

  test("values yields the same order as entries", () => {
    const t = sample();
    expect(Array.from(t.values())).toEqual([1, 4, 2, 3]);
  });

  test("Symbol.iterator delegates to entries", () => {
    const t = sample();
    expect(Array.from(t)).toEqual(Array.from(t.entries()));
  });

  test("toArray materialises the full contents", () => {
    const t = sample();
    expect(t.toArray()).toEqual([
      ["apple", 1],
      ["apricot", 4],
      ["banana", 2],
      ["cherry", 3],
    ]);
  });

  test("empty trie iterates to nothing", () => {
    const t = new Trie<number>();
    expect(Array.from(t)).toEqual([]);
    expect(Array.from(t.keys())).toEqual([]);
    expect(Array.from(t.values())).toEqual([]);
    expect(t.toArray()).toEqual([]);
  });

  test("empty-string key sorts first", () => {
    const t = new Trie<number>();
    t.set("b", 2);
    t.set("a", 1);
    t.set("", 0);
    expect(Array.from(t.keys())).toEqual(["", "a", "b"]);
  });

  test("iteration is stable across multiple passes", () => {
    const t = sample();
    const first = Array.from(t);
    const second = Array.from(t);
    expect(first).toEqual(second);
  });
});
