# trie-ts

A small, type-safe Trie (prefix tree) for TypeScript. Built for
autocomplete, longest-prefix routing, and any "is this string in my
dictionary?" workload. Zero runtime dependencies.

## Install

```bash
npm install && npm run build
```

Requires Node 18+ and TypeScript 4.7+ (uses `exactOptionalPropertyTypes`
in the generated declaration types).

## Quick start

```ts
import { Trie } from "trie-ts";

const t = new Trie<number>();
t.set("car", 1).set("card", 2).set("care", 3).set("cart", 4);

t.get("card");                // → 2
t.has("ca");                  // → false  (prefix, not a stored key)
t.hasPrefix("ca");            // → true

Array.from(t.keysWithPrefix("car"));
// → ["car", "card", "care", "cart"]

t.longestPrefixOf("cartesian");
// → { key: "cart", value: 4 }

t.delete("card");             // → true
t.size;                       // → 3
```

## API reference

### Construction

`new Trie<V>()` — empty trie.

`Trie.from<V>(entries: Iterable<readonly [string, V]>) : Trie<V>` —
build from any iterable of `[key, value]` pairs. Later entries
overwrite earlier ones.

`Trie.fromKeys(keys: Iterable<string>) : Trie<true>` — build a "set"
trie where every key maps to `true`.

### Basic operations

`set(key, value): this` — Insert or update. Returns the trie for
chaining.

`get(key): V | undefined` — Lookup, undefined when absent.

`has(key): boolean` — Stored-key existence check (does NOT match
prefix-only nodes).

`delete(key): boolean` — Returns `true` if a stored key was removed,
`false` otherwise. Prunes the leaf chain bottom-up so the structure
stays compact across heavy churn.

`clear(): void` — Remove every entry.

`readonly size: number` — Number of stored keys.

### Iteration

Iteration order is lexicographic on the key.

`keys(), values(), entries()` — Same shape as the `Map` analogues.

`[Symbol.iterator]()` — Delegates to `entries()`, so
`Array.from(trie)` gives you `[key, value][]`.

`toArray(): [string, V][]` — Materialise the whole trie.

### Prefix queries

`hasPrefix(prefix): boolean` — Is any stored key starting with
`prefix`? The empty prefix is true iff the trie is non-empty.

`keysWithPrefix(prefix): IterableIterator<string>`,
`valuesWithPrefix(prefix): IterableIterator<V>`,
`entriesWithPrefix(prefix): IterableIterator<[string, V]>` —
Autocomplete-style enumeration.

`countWithPrefix(prefix): number` — Count of matching stored keys.

### Longest prefix

`longestPrefixOf(text): { key, value } | undefined` — The longest
stored key that is a prefix of `text`. Useful for URL routing,
tokenisation, and abbreviation expansion.

### Errors

```ts
TrieError extends Error
└── InvalidKeyError   // thrown at runtime when a non-string is passed
    .received          // the offending value
```

The type system normally prevents this, but JavaScript callers can
still pass anything; the error makes the failure mode explicit and
uniform.

## Implementation notes

Keys are walked as **UTF-16 code units** (one character per edge),
matching `String.length` and `String.charAt`. This keeps the data
structure cheap and works for ASCII, BMP characters, and arbitrary
binary-as-string content. Code points outside the BMP occupy two
edges (one surrogate per edge), which is intentional and matches
JavaScript's own string length semantics.

Iteration sorts each level's child labels on demand, so iteration
order is deterministic across runs and platforms.

## Running tests

```bash
npm install
npm test           # jest
npm run test:coverage
npm run typecheck  # tsc --noEmit
```

The full suite is 81 tests across eight files with **100% statements,
branches, functions, and lines** under Jest's istanbul coverage; the
build passes `tsc --strict --noEmit` with the full strictness panel
(`exactOptionalPropertyTypes`, `noImplicitAny`, `noUnusedLocals`,
`noUnusedParameters`, `noImplicitReturns`,
`noFallthroughCasesInSwitch`).

## License

MIT — see [LICENSE](./LICENSE).
