import * as trie from "../src/index";
import { Trie } from "../src/trie";
import { InvalidKeyError, TrieError } from "../src/errors";

describe("public API surface", () => {
  test("exports the documented names", () => {
    expect(typeof trie.Trie).toBe("function");
    expect(typeof trie.TrieError).toBe("function");
    expect(typeof trie.InvalidKeyError).toBe("function");
    expect(trie.Trie).toBe(Trie);
    expect(trie.TrieError).toBe(TrieError);
    expect(trie.InvalidKeyError).toBe(InvalidKeyError);
  });

  test("Trie is a constructor producing an instance", () => {
    const instance = new trie.Trie<number>();
    expect(instance).toBeInstanceOf(trie.Trie);
    expect(instance.size).toBe(0);
  });

  test("Trie exposes the documented methods", () => {
    const t = new Trie<number>();
    const expected = [
      "set",
      "get",
      "has",
      "delete",
      "clear",
      "hasPrefix",
      "keys",
      "values",
      "entries",
      "toArray",
      "keysWithPrefix",
      "valuesWithPrefix",
      "entriesWithPrefix",
      "countWithPrefix",
      "longestPrefixOf",
    ];
    for (const name of expected) {
      expect(typeof (t as unknown as Record<string, unknown>)[name]).toBe(
        "function",
      );
    }
  });

  test("Trie has static from / fromKeys factories", () => {
    expect(typeof Trie.from).toBe("function");
    expect(typeof Trie.fromKeys).toBe("function");
  });
});
