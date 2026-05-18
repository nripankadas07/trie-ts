/**
 * Public types for trie-ts.
 */

/**
 * A `[key, value]` entry — the same shape as
 * `Map.prototype.entries()` and `Array.from(map)`.
 */
export type TrieEntry<V> = readonly [string, V];

/**
 * Result of a longest-prefix lookup: the matched stored key and its
 * value. `undefined` when no stored key is a prefix of the input.
 */
export interface LongestPrefixMatch<V> {
  readonly key: string;
  readonly value: V;
}
