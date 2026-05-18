/**
 * trie-ts — a small, fully-typed Trie (prefix tree) for TypeScript.
 *
 * Public surface:
 *   - {@link Trie} — the main class.
 *   - {@link TrieError}, {@link InvalidKeyError} — error hierarchy.
 *   - {@link TrieEntry}, {@link LongestPrefixMatch} — helper types.
 */

export { Trie } from "./trie";
export { InvalidKeyError, TrieError } from "./errors";
export type { LongestPrefixMatch, TrieEntry } from "./types";
