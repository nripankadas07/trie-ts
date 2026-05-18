import { Trie } from "../src/trie";
import { TrieNode } from "../src/node";
import { InvalidKeyError, TrieError } from "../src/errors";

describe("Error hierarchy", () => {
  test("TrieError is an Error subclass with its name set", () => {
    const err = new TrieError("boom");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("TrieError");
    expect(err.message).toBe("boom");
  });

  test("InvalidKeyError records the received value", () => {
    const err = new InvalidKeyError(42);
    expect(err).toBeInstanceOf(TrieError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("InvalidKeyError");
    expect(err.received).toBe(42);
    expect(err.message).toContain("number");
  });

  test("InvalidKeyError handles null specifically", () => {
    const err = new InvalidKeyError(null);
    expect(err.received).toBeNull();
    expect(err.message).toContain("null");
  });
});

describe("Runtime key validation", () => {
  test("set throws InvalidKeyError for non-string keys", () => {
    const t = new Trie<number>();
    expect(() => t.set(7 as unknown as string, 1)).toThrow(InvalidKeyError);
  });

  test("get throws InvalidKeyError for non-string keys", () => {
    const t = new Trie<number>();
    expect(() => t.get(null as unknown as string)).toThrow(InvalidKeyError);
  });

  test("has throws InvalidKeyError for non-string keys", () => {
    const t = new Trie<number>();
    expect(() => t.has({} as unknown as string)).toThrow(InvalidKeyError);
  });

  test("delete throws InvalidKeyError for non-string keys", () => {
    const t = new Trie<number>();
    expect(() => t.delete(undefined as unknown as string)).toThrow(
      InvalidKeyError,
    );
  });

  test("hasPrefix throws InvalidKeyError for non-string prefixes", () => {
    const t = new Trie<number>();
    expect(() =>
      t.hasPrefix(true as unknown as string),
    ).toThrow(InvalidKeyError);
  });

  test("longestPrefixOf throws InvalidKeyError for non-string text", () => {
    const t = new Trie<number>();
    expect(() =>
      t.longestPrefixOf(123 as unknown as string),
    ).toThrow(InvalidKeyError);
  });

  test("entriesWithPrefix throws InvalidKeyError for non-string prefixes", () => {
    const t = new Trie<number>();
    const it = t.entriesWithPrefix(false as unknown as string);
    expect(() => it.next()).toThrow(InvalidKeyError);
  });
});

describe("TrieNode internal", () => {
  test("isPrunable is true for fresh node", () => {
    const node = new TrieNode<number>();
    expect(node.isPrunable()).toBe(true);
  });

  test("isPrunable is false when value present", () => {
    const node = new TrieNode<number>();
    node.hasValue = true;
    node.value = 1;
    expect(node.isPrunable()).toBe(false);
  });

  test("isPrunable is false when children present", () => {
    const node = new TrieNode<number>();
    node.children.set("a", new TrieNode<number>());
    expect(node.isPrunable()).toBe(false);
  });
});
