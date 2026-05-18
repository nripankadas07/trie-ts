/**
 * Trie (prefix tree) — type-safe, character-based, with autocomplete
 * helpers and longest-prefix matching.
 *
 * Keys are walked as JavaScript code units (one character per edge);
 * this keeps the structure cheap and works for ASCII, UTF-16, and
 * arbitrary binary-as-string content. Code points outside the BMP
 * occupy two edges (high + low surrogate), which is intentional and
 * matches `String.length`.
 */

import { InvalidKeyError } from "./errors";
import { TrieNode } from "./node";
import type { LongestPrefixMatch, TrieEntry } from "./types";

export class Trie<V> implements Iterable<TrieEntry<V>> {
  private root: TrieNode<V>;
  private _size: number;

  public constructor() {
    this.root = new TrieNode<V>();
    this._size = 0;
  }

  /**
   * Build a Trie from an iterable of `[key, value]` entries.
   *
   * Later entries with the same key overwrite earlier ones.
   */
  public static from<V>(
    entries: Iterable<readonly [string, V]>,
  ): Trie<V> {
    const trie = new Trie<V>();
    for (const [key, value] of entries) {
      trie.set(key, value);
    }
    return trie;
  }

  /**
   * Build a Trie from an iterable of keys, mapping every key to
   * `true`. Convenient for "is this string in my dictionary?" use.
   */
  public static fromKeys(keys: Iterable<string>): Trie<true> {
    const trie = new Trie<true>();
    for (const key of keys) {
      trie.set(key, true);
    }
    return trie;
  }

  public get size(): number {
    return this._size;
  }

  /**
   * Insert or update a value at `key`. Returns `this` for chaining.
   */
  public set(key: string, value: V): this {
    assertKey(key);
    let node = this.root;
    for (const char of iterateCodeUnits(key)) {
      const next = node.children.get(char);
      if (next !== undefined) {
        node = next;
        continue;
      }
      const fresh = new TrieNode<V>();
      node.children.set(char, fresh);
      node = fresh;
    }
    if (!node.hasValue) {
      this._size += 1;
    }
    node.hasValue = true;
    node.value = value;
    return this;
  }

  /** Return the value stored at `key`, or `undefined` if absent. */
  public get(key: string): V | undefined {
    assertKey(key);
    const node = this.descend(key);
    if (node === undefined || !node.hasValue) {
      return undefined;
    }
    return node.value;
  }

  /** Return `true` iff `key` is stored in the trie. */
  public has(key: string): boolean {
    assertKey(key);
    const node = this.descend(key);
    return node !== undefined && node.hasValue;
  }

  /**
   * Return `true` iff at least one stored key starts with `prefix`.
   * The empty prefix matches any non-empty trie.
   */
  public hasPrefix(prefix: string): boolean {
    assertKey(prefix);
    const node = this.descend(prefix);
    if (node === undefined) {
      return false;
    }
    return node.hasValue || node.children.size > 0;
  }

  /**
   * Remove `key`. Returns `true` if a stored key was removed,
   * `false` if it wasn't present.
   */
  public delete(key: string): boolean {
    assertKey(key);
    const path = this.descendWithPath(key);
    if (path === undefined) {
      return false;
    }
    const terminal = path.length === 0 ? this.root : path[path.length - 1]!.node;
    if (!terminal.hasValue) {
      return false;
    }
    terminal.hasValue = false;
    terminal.value = undefined;
    this._size -= 1;
    pruneEmpty(path);
    return true;
  }

  /** Remove every stored key. */
  public clear(): void {
    this.root = new TrieNode<V>();
    this._size = 0;
  }

  /** Default iterator: yields `[key, value]` in lexicographic order. */
  public [Symbol.iterator](): IterableIterator<TrieEntry<V>> {
    return this.entries();
  }

  /** Iterate every stored key in lexicographic order. */
  public *keys(): IterableIterator<string> {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  /** Iterate every stored value in the same order as {@link keys}. */
  public *values(): IterableIterator<V> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  /** Iterate `[key, value]` entries in lexicographic key order. */
  public *entries(): IterableIterator<TrieEntry<V>> {
    yield* walkEntries(this.root, "");
  }

  /** Materialise the full contents into an array. */
  public toArray(): TrieEntry<V>[] {
    return Array.from(this.entries());
  }

  /**
   * Iterate every stored key that starts with `prefix`.
   *
   * The empty prefix is equivalent to {@link keys}.
   */
  public *keysWithPrefix(prefix: string): IterableIterator<string> {
    for (const [key] of this.entriesWithPrefix(prefix)) {
      yield key;
    }
  }

  /** Iterate every value whose key starts with `prefix`. */
  public *valuesWithPrefix(prefix: string): IterableIterator<V> {
    for (const [, value] of this.entriesWithPrefix(prefix)) {
      yield value;
    }
  }

  /**
   * Iterate every `[key, value]` entry whose key starts with
   * `prefix`. Order is lexicographic on the suffix.
   */
  public *entriesWithPrefix(
    prefix: string,
  ): IterableIterator<TrieEntry<V>> {
    assertKey(prefix);
    const node = this.descend(prefix);
    if (node === undefined) {
      return;
    }
    yield* walkEntries(node, prefix);
  }

  /** Count stored keys whose key starts with `prefix`. */
  public countWithPrefix(prefix: string): number {
    let count = 0;
    for (const _ of this.keysWithPrefix(prefix)) {
      count += 1;
    }
    return count;
  }

  /**
   * Return the longest stored key that is a prefix of `text`, or
   * `undefined` if no such key exists.
   *
   * If the empty string is a stored key, it is always a valid (and
   * shortest) match.
   */
  public longestPrefixOf(
    text: string,
  ): LongestPrefixMatch<V> | undefined {
    assertKey(text);
    let node: TrieNode<V> | undefined = this.root;
    let bestLength = -1;
    let bestValue: V | undefined;
    if (this.root.hasValue) {
      bestLength = 0;
      bestValue = this.root.value;
    }
    let consumed = 0;
    for (const char of iterateCodeUnits(text)) {
      const next: TrieNode<V> | undefined = node.children.get(char);
      if (next === undefined) {
        break;
      }
      node = next;
      consumed += 1;
      if (node.hasValue) {
        bestLength = consumed;
        bestValue = node.value;
      }
    }
    if (bestLength < 0) {
      return undefined;
    }
    return { key: text.slice(0, bestLength), value: bestValue as V };
  }

  private descend(key: string): TrieNode<V> | undefined {
    let node: TrieNode<V> | undefined = this.root;
    for (const char of iterateCodeUnits(key)) {
      node = node.children.get(char);
      if (node === undefined) {
        return undefined;
      }
    }
    return node;
  }

  private descendWithPath(
    key: string,
  ): { node: TrieNode<V>; char: string; parent: TrieNode<V> }[] | undefined {
    const path: { node: TrieNode<V>; char: string; parent: TrieNode<V> }[] = [];
    let node = this.root;
    for (const char of iterateCodeUnits(key)) {
      const next = node.children.get(char);
      if (next === undefined) {
        return undefined;
      }
      path.push({ node: next, char, parent: node });
      node = next;
    }
    return path;
  }
}

function assertKey(key: unknown): asserts key is string {
  if (typeof key !== "string") {
    throw new InvalidKeyError(key);
  }
}

function* iterateCodeUnits(text: string): IterableIterator<string> {
  for (let index = 0; index < text.length; index += 1) {
    yield text.charAt(index);
  }
}

function* walkEntries<V>(
  node: TrieNode<V>,
  prefix: string,
): IterableIterator<TrieEntry<V>> {
  if (node.hasValue) {
    yield [prefix, node.value as V];
  }
  const sortedChars = Array.from(node.children.keys()).sort();
  for (const char of sortedChars) {
    const child = node.children.get(char) as TrieNode<V>;
    yield* walkEntries(child, prefix + char);
  }
}

function pruneEmpty<V>(
  path: { node: TrieNode<V>; char: string; parent: TrieNode<V> }[],
): void {
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const step = path[index]!;
    if (!step.node.isPrunable()) {
      return;
    }
    step.parent.children.delete(step.char);
  }
}
