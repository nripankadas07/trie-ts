/**
 * Internal trie node.
 *
 * Each node holds an optional value (controlled by `hasValue` so that
 * storing `undefined` as a real value still works) and a map of
 * single-character edges to children.
 *
 * The node itself is not part of the public API — consumers interact
 * with the {@link Trie} class only.
 */

export class TrieNode<V> {
  public hasValue: boolean;
  public value: V | undefined;
  public readonly children: Map<string, TrieNode<V>>;

  public constructor() {
    this.hasValue = false;
    this.value = undefined;
    this.children = new Map();
  }

  /** `true` if this node is a leaf with no value (safe to prune). */
  public isPrunable(): boolean {
    return !this.hasValue && this.children.size === 0;
  }
}
