import { Trie } from "../src/trie";

describe("Trie integration scenarios", () => {
  test("autocomplete suggestions for a small dictionary", () => {
    const t = Trie.fromKeys([
      "javascript",
      "java",
      "json",
      "jest",
      "jenkins",
      "python",
      "perl",
    ]);
    expect(Array.from(t.keysWithPrefix("ja"))).toEqual([
      "java",
      "javascript",
    ]);
    expect(Array.from(t.keysWithPrefix("j"))).toEqual([
      "java",
      "javascript",
      "jenkins",
      "jest",
      "json",
    ]);
    expect(t.countWithPrefix("j")).toBe(5);
  });

  test("URL routing by longest path prefix", () => {
    const routes = new Trie<string>();
    routes.set("/api", "api-root");
    routes.set("/api/v1", "v1");
    routes.set("/api/v1/users", "users");
    routes.set("/api/v2", "v2");
    expect(routes.longestPrefixOf("/api/v1/users/42")).toEqual({
      key: "/api/v1/users",
      value: "users",
    });
    expect(routes.longestPrefixOf("/api/v1/orders")).toEqual({
      key: "/api/v1",
      value: "v1",
    });
    expect(routes.longestPrefixOf("/static/file.css")).toBeUndefined();
  });

  test("set/delete churn keeps invariants", () => {
    const t = new Trie<number>();
    const keys = ["one", "two", "three", "four", "five"];
    keys.forEach((k, i) => t.set(k, i));
    expect(t.size).toBe(keys.length);
    expect(t.delete("three")).toBe(true);
    expect(t.delete("three")).toBe(false);
    expect(t.size).toBe(keys.length - 1);
    expect(Array.from(t.keys()).sort()).toEqual(
      keys.filter((k) => k !== "three").sort(),
    );
  });

  test("clearing and rebuilding produces identical state", () => {
    const t = new Trie<number>();
    t.set("a", 1).set("b", 2).set("c", 3);
    const before = t.toArray();
    t.clear();
    for (const [k, v] of before) {
      t.set(k, v);
    }
    expect(t.toArray()).toEqual(before);
  });

  test("from / fromKeys round-trip via toArray", () => {
    const entries: [string, number][] = [
      ["alpha", 1],
      ["beta", 2],
      ["gamma", 3],
    ];
    const t = Trie.from(entries);
    const sorted = [...entries].sort(([a], [b]) => a.localeCompare(b));
    expect(t.toArray()).toEqual(sorted);
  });
});
