import { Trie } from "../src/trie";

describe("Trie.longestPrefixOf", () => {
  test("returns undefined on empty trie", () => {
    const t = new Trie<number>();
    expect(t.longestPrefixOf("anything")).toBeUndefined();
  });

  test("returns the longest stored prefix match", () => {
    const t = new Trie<string>();
    t.set("a", "A");
    t.set("ab", "AB");
    t.set("abc", "ABC");
    expect(t.longestPrefixOf("abcdef")).toEqual({
      key: "abc",
      value: "ABC",
    });
  });

  test("returns the empty-key match when nothing else fits", () => {
    const t = new Trie<string>();
    t.set("", "ROOT");
    t.set("xyz", "XYZ");
    expect(t.longestPrefixOf("abc")).toEqual({ key: "", value: "ROOT" });
  });

  test("returns undefined when no stored key is a prefix", () => {
    const t = new Trie<number>();
    t.set("foo", 1);
    expect(t.longestPrefixOf("bar")).toBeUndefined();
  });

  test("matches the full input when stored", () => {
    const t = new Trie<number>();
    t.set("hello", 1);
    expect(t.longestPrefixOf("hello")).toEqual({ key: "hello", value: 1 });
  });

  test("stops walking when no child can match", () => {
    const t = new Trie<number>();
    t.set("alpha", 1);
    expect(t.longestPrefixOf("alphX")).toBeUndefined();
  });

  test("prefers longer matches when both are stored", () => {
    const t = new Trie<string>();
    t.set("car", "C");
    t.set("carpet", "CP");
    expect(t.longestPrefixOf("carpenter")).toEqual({
      key: "car",
      value: "C",
    });
    expect(t.longestPrefixOf("carpets")).toEqual({
      key: "carpet",
      value: "CP",
    });
  });

  test("longest-prefix on empty input returns the empty-key match", () => {
    const t = new Trie<string>();
    t.set("", "ROOT");
    expect(t.longestPrefixOf("")).toEqual({ key: "", value: "ROOT" });
  });

  test("longest-prefix on empty input without empty key returns undefined", () => {
    const t = new Trie<string>();
    t.set("a", "A");
    expect(t.longestPrefixOf("")).toBeUndefined();
  });

  test("walks UTF-16 code units consistently with String.length", () => {
    const t = new Trie<string>();
    // "𝕄" is U+1D544, a surrogate pair taking 2 code units.
    t.set("𝕄", "M");
    expect(t.longestPrefixOf("𝕄athematicals")).toEqual({
      key: "𝕄",
      value: "M",
    });
  });
});
