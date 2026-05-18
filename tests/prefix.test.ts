import { Trie } from "../src/trie";

describe("Trie prefix queries", () => {
  const sample = (): Trie<number> => {
    const t = new Trie<number>();
    t.set("car", 1);
    t.set("card", 2);
    t.set("care", 3);
    t.set("cart", 4);
    t.set("dog", 5);
    return t;
  };

  describe("hasPrefix", () => {
    test("returns true when at least one stored key matches", () => {
      const t = sample();
      expect(t.hasPrefix("ca")).toBe(true);
      expect(t.hasPrefix("car")).toBe(true);
      expect(t.hasPrefix("d")).toBe(true);
    });

    test("returns false for prefixes that match no stored key", () => {
      const t = sample();
      expect(t.hasPrefix("x")).toBe(false);
      expect(t.hasPrefix("cart!")).toBe(false);
    });

    test("returns true for empty prefix on non-empty trie", () => {
      const t = sample();
      expect(t.hasPrefix("")).toBe(true);
    });

    test("returns false for empty prefix on empty trie", () => {
      const t = new Trie<number>();
      expect(t.hasPrefix("")).toBe(false);
    });

    test("returns true if only the empty key is stored", () => {
      const t = new Trie<number>();
      t.set("", 0);
      expect(t.hasPrefix("")).toBe(true);
      expect(t.hasPrefix("x")).toBe(false);
    });
  });

  describe("keysWithPrefix", () => {
    test("yields matching keys in lex order", () => {
      const t = sample();
      expect(Array.from(t.keysWithPrefix("car"))).toEqual([
        "car",
        "card",
        "care",
        "cart",
      ]);
    });

    test("includes the prefix itself when stored", () => {
      const t = sample();
      expect(Array.from(t.keysWithPrefix("car"))).toContain("car");
    });

    test("empty when no key matches", () => {
      const t = sample();
      expect(Array.from(t.keysWithPrefix("zz"))).toEqual([]);
    });

    test("empty prefix returns every key", () => {
      const t = sample();
      expect(Array.from(t.keysWithPrefix(""))).toEqual([
        "car",
        "card",
        "care",
        "cart",
        "dog",
      ]);
    });
  });

  describe("valuesWithPrefix", () => {
    test("yields values in the same order as keysWithPrefix", () => {
      const t = sample();
      expect(Array.from(t.valuesWithPrefix("car"))).toEqual([1, 2, 3, 4]);
    });

    test("empty on miss", () => {
      const t = sample();
      expect(Array.from(t.valuesWithPrefix("zz"))).toEqual([]);
    });
  });

  describe("entriesWithPrefix", () => {
    test("yields [key, value] pairs in lex order", () => {
      const t = sample();
      expect(Array.from(t.entriesWithPrefix("car"))).toEqual([
        ["car", 1],
        ["card", 2],
        ["care", 3],
        ["cart", 4],
      ]);
    });

    test("empty on miss", () => {
      const t = sample();
      expect(Array.from(t.entriesWithPrefix("xyz"))).toEqual([]);
    });
  });

  describe("countWithPrefix", () => {
    test("counts matching keys", () => {
      const t = sample();
      expect(t.countWithPrefix("car")).toBe(4);
      expect(t.countWithPrefix("d")).toBe(1);
      expect(t.countWithPrefix("")).toBe(5);
    });

    test("returns 0 on miss", () => {
      const t = sample();
      expect(t.countWithPrefix("zz")).toBe(0);
    });
  });
});
