/**
 * The persistence barrier, as a type rather than a habit.
 *
 * Phase 3 item 1's law: state that awards anything commits to storage BEFORE
 * any celebratory animation begins. Ceremonies present already-saved facts.
 *
 * The brief proposes a `persistBarrier()` awaited at the top of each ceremony,
 * with a test that greps the entry points for it. That is the weak form, and
 * this project has paid for the weak form four times: a test asserting a call
 * was made passed happily while the feature behind it was dead. A grep also
 * cannot catch the case that actually bites — a barrier awaited at the top of
 * a ceremony that then awards something else halfway through.
 *
 * So: awarding produces a `Committed` token, only `commit` can mint one, and
 * `ceremony` demands one as an argument. A celebration that has not been
 * handed proof of a completed save does not compile. Same trick as staging
 * becoming an argument to `open*()` — the wrong sequence stops being
 * expressible rather than merely being tested for.
 *
 * `ceremony` also owns the exit-locking, which was hand-rolled identically at
 * both call sites and is the other thing HANDOFF says every async sequence in
 * main.ts needs. One helper, both laws, no way to remember one and forget the
 * other.
 */

/**
 * Proof that a value reached storage.
 *
 * The private brand is what makes this work: no other module can construct
 * one, so the only way to hold a token is to have awaited a real write.
 */
declare const committed: unique symbol

export interface Committed<T> {
  readonly [committed]: true
  /** What was saved. The ceremony presents this, not live mutable state. */
  readonly value: T
}

/** What a ceremony must hold shut while it runs. */
export interface Exits {
  /** Called once, before the body. */
  lock(): void
  /** Called in a finally, however the body ends. */
  unlock(): void
}

/**
 * Write, wait for it, and hand back the receipt.
 *
 * The await is the whole point. `persist()` in main.ts was
 * `void saveIsland(...)` — fire and forget — so "save first, celebrate second"
 * was true in the ordering of the source and false in the ordering of events:
 * the ceremony began while the write was still in flight, which is the window
 * the hatched-pet bug lived in.
 */
export async function commit<T>(value: T, write: (value: T) => Promise<void>): Promise<Committed<T>> {
  await write(value)
  return { value } as Committed<T>
}

/**
 * Run a celebration over a fact that is already saved.
 *
 * Takes the token but does not otherwise use it. That is not an oversight —
 * the argument exists to make the call impossible without the write, and
 * spending it on anything else would invite someone to fake one.
 *
 * The body's errors are deliberately not swallowed: a ceremony that throws
 * should surface, and the exits are released either way. What must never
 * happen is an exception leaving the world locked with no overlay, which is
 * the state that used to be recoverable only by reloading.
 */
export async function ceremony<T>(
  _proof: Committed<T>,
  exits: Exits,
  body: () => Promise<void>,
): Promise<void> {
  exits.lock()
  try {
    await body()
  } finally {
    exits.unlock()
  }
}
