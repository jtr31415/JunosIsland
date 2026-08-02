/**
 * Who is in the next egg: a dealer that knows what has already been collected.
 *
 * Joe, 29 Jul, on the shipped build: *"a second animal of the same type has
 * just spawned. that must not happen."*
 *
 * ## Why the previous fix was not this fix
 *
 * An earlier report — *"investigate: two cats spawned in a row"* — was answered
 * with `core/decks.ts`'s `makeMemoryDeck`: a uniform draw that will not repeat
 * anything dealt in the last few hatches. That was the right answer to THAT
 * report and it is still doing its job. It is simply not a collection rule.
 *
 * A window of five over a pack of twenty-four leaves nineteen candidates on
 * every draw, and how many of those nineteen the child already owns is a fact
 * about their island that the window cannot see. At eight pets, roughly eight
 * of the nineteen are animals they have got, so about two hatches in five were
 * a duplicate — this was not a collision, it was the ordinary case arriving on
 * a schedule. Widening the window does not fix it either: the window measures
 * HATCHES and the rule is about the ISLAND, and at a width of twenty-four the
 * dealer degenerates into a rota that hands out the pack in a fixed lap.
 *
 * So the rule is stated in the terms it is actually about: **never deal an
 * animal the child already has, while anyone in the pack is still unmet.**
 *
 * ## What happens when everybody has been met
 *
 * PB-036 is a standing requirement — Joe, JT-018: *"i have an unlimited amount
 * of tiles but a limited stash of animals as rewards. neither must ever run
 * out."* Twenty-four species and a no-repeats rule collide at the twenty-fifth
 * hatch, and every tidy-looking answer to that is worse than the bug it fixes:
 * an egg that hatches nothing, a draw that throws inside a ceremony which has
 * already locked the exits, a filter that spins looking for a candidate that
 * cannot exist.
 *
 * The rule is therefore CONDITIONAL by construction, not by accident. Once the
 * pack is exhausted the deck falls back to precisely the behaviour that
 * shipped — a uniform draw carrying the short memory, so a completed album
 * still produces friends, with new names, and never the one seen a moment
 * ago. It is a floor, not an answer: what a child should actually be given for
 * a twenty-fifth egg is a product decision, raised as JT-027.
 *
 * ## Forward-compatible with the sets that are coming
 *
 * `docs/pet-island-species-roster.md` adds ~296 species across 20 collections,
 * and its §3 treats `species + set` as the identity of a collectible. This deck
 * never looks inside its items — it deals opaque keys and compares them for
 * equality — so the day a set field exists, the caller passes
 * `` `${set}/${species}` `` instead of `species` and everything here is
 * unchanged. Today, with one set live, that reduces to the species id.
 */
import { ri } from '../core/rng'
import type { Rng } from '../core/rng'

/** Deals the unmet first. Callable; `remember` states what the child has. */
export interface CollectionDeck {
  (): string
  /**
   * State what is already on the island, in the order it came home.
   *
   * REPLACES whatever the deck was holding rather than adding to it, because
   * the caller is stating the collection, not appending to it — the same
   * contract as `MemoryDeck.remember`, so the two are interchangeable at the
   * call site. Anything outside `src` is ignored: brief §19 says nothing the
   * child owns is ever lost, and a save naming a species that has since been
   * dropped from the pack must not throw on the way to the next hatch, nor
   * consume one of the slots that are left.
   */
  remember(owned: readonly string[]): void
}

/**
 * Deal the unmet first; once none are left, deal as the memory deck does.
 *
 * `memory` only ever governs the exhausted case — while the collection is
 * incomplete, ownership is a strictly stronger constraint than recency and
 * subsumes it, since anything dealt recently is by definition owned.
 *
 * Never starves, never throws and never loops: both branches choose from a
 * non-empty pool by construction (see the comments at each), so a hatch inside
 * a ceremony that has locked the exits always gets an answer.
 *
 * Lazy in the same way as `makeDeck` and `makeMemoryDeck` — creating one
 * consumes no randomness, which matters because the golden harness shares a
 * single RNG across every generator in the game.
 */
export function makeCollectionDeck(
  rng: Rng, src: readonly string[], memory: number,
): CollectionDeck {
  const keep = Math.max(0, Math.min(Math.trunc(memory) || 0, src.length - 1))
  /**
   * Everything the child has, plus everything this deck has promised.
   *
   * A draw counts as owned the moment it is DEALT, not when the pet lands.
   * main.ts decides the species a whole egg ahead so it can be preloaded, so
   * between the draw and the hatch there is a friend who is spoken for but not
   * yet on the island — and dealing it twice would put two of the same animal
   * in the pack's own queue. If the tab closes in that window the promise is
   * simply forgotten and re-drawn on the next load, which costs nothing:
   * `remember` re-states the collection from `flow.pets`, the only record that
   * matters.
   */
  let owned = new Set<string>()
  /** The last `keep` dealt, by either branch. Only the fallback reads it. */
  let recent: string[] = []

  const push = (v: string): void => {
    owned.add(v)
    if (!keep) return
    recent.push(v)
    if (recent.length > keep) recent.splice(0, recent.length - keep)
  }

  const deck = ((): string => {
    // Anyone not met yet always wins, and there is nothing to weigh:
    // every unmet animal is equally new.
    const unmet = src.filter(v => !owned.has(v))
    if (unmet.length) {
      const drawn = unmet[ri(rng, unmet.length)] as string
      push(drawn)
      return drawn
    }
    /*
     * The album is full. Fall back to what shipped: uniform, minus the last
     * `keep`. `free` is empty only when `keep` has reached `src.length`, which
     * the clamp above forbids for any pack of two or more; a pack of ONE deals
     * that one for ever, exactly as `makeDeck` does, rather than hanging.
     */
    const free = keep ? src.filter(v => !recent.includes(v)) : src
    const pool = free.length ? free : src
    const drawn = pool[ri(rng, pool.length)] as string
    push(drawn)
    return drawn
  }) as CollectionDeck

  deck.remember = (seen: readonly string[]): void => {
    owned = new Set<string>()
    recent = []
    for (const v of seen) if (src.includes(v)) push(v)
  }
  return deck
}
