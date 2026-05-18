/**
 * Error hierarchy for trie-ts.
 *
 * All errors thrown by the library inherit from {@link TrieError},
 * which is itself a standard {@link Error}. Callers can either catch
 * the broad family or pick out specific subclasses.
 */

export class TrieError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "TrieError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a key is not a string at runtime.
 *
 * TypeScript's type system normally prevents this, but JavaScript
 * callers can pass anything; this class makes the failure mode
 * explicit and uniform.
 */
export class InvalidKeyError extends TrieError {
  public readonly received: unknown;

  public constructor(received: unknown) {
    super(
      `Trie keys must be strings, received ${describe(received)}`,
    );
    this.name = "InvalidKeyError";
    this.received = received;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function describe(value: unknown): string {
  if (value === null) {
    return "null";
  }
  return typeof value;
}
