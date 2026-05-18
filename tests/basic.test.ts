import { Trie } from "../src/trie";

describe("Trie basic operations", () => {
  describe("set / get / size", () => {
    test("get returns undefined on missing key", () => {
      const t = new Trie<number>();
      expect(t.get("anything")).toBeUndefined();
    });

    test("set stores a value retrievable by get", () => {
      const t = new Trie<number>();
      t.set("hello", 42);
      expect(t.get("hello")).toBe(42);
    });

    test("set returns the trie for chaining", () => {
      const t = new Trie<number>();
      expect(t.set("a", 1)).toBe(t);
      t.set("a", 1).set("b", 2).set("c", 3);
      expect(t.get("b")).toBe(2);
    });

    test("set overwrites an existing value", () => {
      const t = new Trie<number>();
      t.set("k", 1);
      t.set("k", 2);
      expect(t.get("k")).toBe(2);
    });

    test("size reflects unique keys", () => {
      const t = new Trie<number>();
      expect(t.size).toBe(0);
      t.set("a", 1);
      expect(t.size).toBe(1);
      t.set("b", 2);
      expect(t.size).toBe(2);
      t.set("a", 99);
      expect(t.size).toBe(2);
    });

    test("supports the empty string as a key", () => {
      const t = new Trie<string>();
      t.set("", "root");
      expect(t.get("")).toBe("root");
      expect(t.has("")).toBe(true);
      expect(t.size).toBe(1);
    });

    test("get distinguishes prefix nodes from stored keys", () => {
      const t = new Trie<number>();
      t.set("car", 1);
      expect(t.get("ca")).toBeUndefined();
      expect(t.get("c")).toBeUndefined();
      expect(t.get("car")).toBe(1);
    });

    test("storing undefined as a value is preserved", () => {
      const t = new Trie<number | undefined>();
      t.set("x", undefined);
      expect(t.has("x")).toBe(true);
      expect(t.get("x")).toBeUndefined();
      expect(t.size).toBe(1);
    });
  });

  describe("has", () => {
    test("returns false for empty trie", () => {
      const t = new Trie<number>();
      expect(t.has("nope")).toBe(false);
    });

    test("returns true only for stored keys", () => {
      const t = new Trie<number>();
      t.set("car", 1);
      t.set("card", 2);
      expect(t.has("car")).toBe(true);
      expect(t.has("card")).toBe(true);
      expect(t.has("ca")).toBe(false);
      expect(t.has("c")).toBe(false);
    });
  });

  describe("delete", () => {
    test("returns false when key is absent", () => {
      const t = new Trie<number>();
      expect(t.delete("nope")).toBe(false);
      expect(t.size).toBe(0);
    });

    test("returns false when prefix exists but key does not", () => {
      const t = new Trie<number>();
      t.set("cart", 1);
      expect(t.delete("car")).toBe(false);
      expect(t.size).toBe(1);
      expect(t.has("cart")).toBe(true);
    });

    test("returns true and removes the entry", () => {
      const t = new Trie<number>();
      t.set("foo", 1);
      expect(t.delete("foo")).toBe(true);
      expect(t.has("foo")).toBe(false);
      expect(t.get("foo")).toBeUndefined();
      expect(t.size).toBe(0);
    });

    test("prunes leaf chain on the way up", () => {
      const t = new Trie<number>();
      t.set("abc", 1);
      t.delete("abc");
      // After delete, the trie should be empty and reusable.
      expect(t.size).toBe(0);
      expect(t.has("a")).toBe(false);
      t.set("abc", 2);
      expect(t.get("abc")).toBe(2);
    });

    test("preserves siblings when pruning", () => {
      const t = new Trie<number>();
      t.set("ab", 1);
      t.set("ac", 2);
      expect(t.delete("ab")).toBe(true);
      expect(t.has("ac")).toBe(true);
      expect(t.size).toBe(1);
    });

    test("preserves prefix keys that are also stored", () => {
      const t = new Trie<number>();
      t.set("car", 1);
      t.set("card", 2);
      expect(t.delete("card")).toBe(true);
      expect(t.has("car")).toBe(true);
      expect(t.size).toBe(1);
    });

    test("can delete the empty-string key", () => {
      const t = new Trie<number>();
      t.set("", 0);
      t.set("a", 1);
      expect(t.delete("")).toBe(true);
      expect(t.has("")).toBe(false);
      expect(t.has("a")).toBe(true);
    });

    test("repeated delete returns false the second time", () => {
      const t = new Trie<number>();
      t.set("k", 1);
      expect(t.delete("k")).toBe(true);
      expect(t.delete("k")).toBe(false);
    });
  });

  describe("clear", () => {
    test("removes every entry and resets size", () => {
      const t = new Trie<number>();
      t.set("a", 1).set("b", 2).set("c", 3);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.has("a")).toBe(false);
      expect(Array.from(t.entries())).toEqual([]);
    });

    test("leaves the trie usable", () => {
      const t = new Trie<number>();
      t.set("a", 1);
      t.clear();
      t.set("z", 26);
      expect(t.get("z")).toBe(26);
      expect(t.size).toBe(1);
    });
  });
});
