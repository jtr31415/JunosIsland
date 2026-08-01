/**
 * WHEN THE NEXT COLLECTION OPENS. Data in, one id out.
 *
 * PB-036 phase 2, implementing JT-027 (`joe/tasks.json:355`) in full. Joe's
 * words, verbatim, are the whole specification:
 *
 *   *"at 80% completion a new collection opens up, never more than 4
 *   collections active. at 4 open collections active a new one opens up only
 *   when another is completed. random order, but hold legendary, dinosaurs and
 *   prehistoric for now. we should also avoid consecutive collections that may
 *   be perceived as related."*
 *
 * THIS IS GREENFIELD. There was no collection-unlock mechanism anywhere in the
 * tree before this file — the "85% unlock cadence" that `types.ts:202` and
 * `roster.ts:63` both refer to in passing was described and never built, and
 * `roster.ts:63` says so out loud: *"no cadence, no gate and no save reads
 * `ship`"*. So nothing here replaces anything, and the 80 below corrects
 * nothing (see `OPEN_AT`).
 *
 * THIS MODULE IS PURE AND IS NOT WIRED UP. No three.js, no save, no `flow.ts`,
 * no `collection.ts`, no `Math.random`. It takes a snapshot of what is open and
 * what the child owns, and answers one question. Phase 2 deliberately stops
 * here: nothing this file decides reaches a child yet, so every number in it can
 * still be argued with for the price of a diff.
 *
 * `ship` (roster.ts:52) is NOT consulted. Joe said "random order", which
 * overrides the provisional ship queue for the purpose of unlocking; the ship
 * numbers remain what they were, an authoring order for the workbench.
 */
import { ri } from '../../core/rng'
import type { Rng } from '../../core/rng'
import type { Collection } from './types'

/**
 * The completion fraction of an ALREADY-OPEN collection that opens a new one.
 *
 * >>> PROVISIONAL, JT-027 — AND THIS IS THE MARK JOE ASKED FOR ON HAND-TUNED
 * >>> NUMBERS, per the JT-021 precedent at `src/island/balance/index.ts:369`.
 * >>> Joe set 80% himself in JT-027 (`joe/tasks.json:355`): *"at 80%
 * >>> completion a new collection opens up"*. Retuning it is an edit to this
 * >>> one line and to the two assertions in
 * >>> `tests/island/species-unlock.test.ts` that name the threshold out loud.
 *
 * IT IS NOT A CORRECTION OF THE "85%" YOU MAY HAVE READ. Two comments in this
 * folder mention an 85% cadence — `types.ts:202` and `roster.ts:63` — but that
 * cadence was never implemented, so 80 does not replace a shipped 85. It is the
 * first number this dial has ever had. If the 85 in those two comments should
 * now read 80, that is a comment edit in files phase 2 is forbidden to touch,
 * and it is listed as such rather than done here.
 */
export const OPEN_AT = 0.80

/**
 * Never more than four collections ACTIVE at once.
 *
 * ACTIVE means OPENED AND NOT YET COMPLETE. That definition is the load-bearing
 * half of JT-027 and it is what makes the second sentence work — see
 * `nextToOpen` below. A collection the child has finished still shows in the
 * album; it just stops occupying one of the four slots.
 *
 * Not marked provisional: Joe gave 4 as a bound ("never more than 4"), not as a
 * feel dial, and the sentence that follows it only parses against a hard cap.
 */
export const MAX_ACTIVE = 4

/**
 * The three Joe is holding back by JUDGEMENT. His call, and only his to undo.
 *
 * >>> PROVISIONAL, JT-027 — THIS LIST IS MEANT TO SHRINK, AND ONLY TO SHRINK.
 * >>> Joe's word was *"but hold legendary, dinosaurs and prehistoric FOR NOW"*
 * >>> (emphasis the point). This is a holding pen, not a policy: these three are
 * >>> expected to be released one at a time as he decides they are ready, and
 * >>> releasing one is deleting a string from this array and nothing else. No
 * >>> save migrates, no id moves, no other file changes.
 *
 * Why these three and not others is his judgement and is not reconstructed here.
 * They are also the three the roster treats as odd elsewhere — `types.ts:56-64`
 * gives `fictional` and `prehistoric` their own threat statuses precisely
 * because a dragon and a trilobite are not Red List animals — so the hold is at
 * least consistent with how the data already thinks.
 *
 * Nothing about MODELS is said here. All three happen also to be unbuilt today,
 * and so appear in `NOT_BUILT_YET`'s reasoning as well, but the two holds are
 * different questions with different release conditions and are kept apart for
 * exactly that reason. See `HELD_BACK` below.
 */
export const HELD_BACK_BY_JOE: readonly string[] = ['legendary', 'dinosaurs', 'prehistoric']

/**
 * Collections with NOT ONE species built. Held back by arithmetic, not taste.
 *
 * THIS IS A DIFFERENT KIND OF HOLD FROM JOE'S, and confusing the two is how this
 * list gets deleted by someone tidying up. `HELD_BACK_BY_JOE` is a judgement and
 * shrinks when he rules. This one is a measurement and shrinks when a modeller
 * finishes a collection. A collection whose registry entry is empty does not
 * render as "coming soon" or as anything else considerate: `album.ts` draws one
 * frame per ROSTER member, so opening `ocean` today puts sixteen empty squares
 * in front of a five-year-old and calls it a new album. PB-058 is that bug. Four
 * albums drawn at random from twenty-one, when six of the twenty-one have any
 * animals in them at all, means most children open mostly nothing.
 *
 * IT IS DERIVED, NOT DECIDED. The truth is `shippedIn(id).length === 0` in
 * `registry.ts:144`, and that derivation is PINNED BY A TRIPWIRE TEST in
 * `tests/island/species-unlock.test.ts` which recomputes the set from the
 * registry and fails BY NAME the day a collection gains its first model —
 * "ocean now has models, take it out of NOT_BUILT_YET". Nobody has to remember
 * this list exists; the test remembers for them.
 *
 * SO WHY IS IT WRITTEN OUT BY HAND rather than computed here? Because this
 * module is pure and intends to stay pure — the header says "no three.js" —
 * and importing `registry.ts` would drag three.js in behind it, transitively,
 * through `collections/garden.ts:70` to `parts/assembled` to
 * `parts/texture.ts`. Twelve short strings and a test that checks them is a
 * cheaper price than putting a renderer inside the unlock rules.
 *
 * REMOVING AN ID FROM HERE IS WHAT "SHIPPING A COLLECTION" MEANS. There is no
 * other switch. Build the species, delete the string, and the cadence starts
 * offering it the next time a child finishes an album.
 */
export const NOT_BUILT_YET: readonly string[] = [
  'birds', 'ocean', 'critters', 'night-time', 'ice', 'outback', 'jungle', 'raptors',
  'near-threatened', 'vulnerable', 'endangered', 'critically-endangered',
]

/**
 * Collections that are never offered — the union of the two holds above.
 *
 * The name and the type are unchanged from when this was Joe's three alone, so
 * the one place that reads it (`candidates`, below) and every test that imports
 * it carry on working. What changed is that it is now COMPOSED rather than
 * typed out, and the two halves are named separately because they are undone by
 * different people for different reasons: `HELD_BACK_BY_JOE` shrinks when Joe
 * rules on a collection, `NOT_BUILT_YET` shrinks when a collection is actually
 * built. Merging them into one flat array would lose that, and the first person
 * to release `legendary` would have no way of knowing whether they were
 * answering a design question or a modelling one.
 *
 * >>> AND IT NO LONGER ONLY SHRINKS. The note above `HELD_BACK_BY_JOE` still
 * >>> says "meant to shrink" and that is true OF THAT LIST. It is not true of
 * >>> this one: today it grew from three ids to fifteen, and it will grow again
 * >>> the moment someone adds a collection to the roster ahead of its models.
 * >>> A roster row is an ambition; a registry entry is a shipped thing; this
 * >>> union is the gap between them plus Joe's judgement, and the gap moves in
 * >>> both directions.
 *
 * Deduplicated because the two lists overlap today — all three of Joe's three
 * are also unbuilt — and a doubled id would make `HELD_BACK.length` lie to any
 * test that counts it.
 */
export const HELD_BACK: readonly string[] = [
  ...new Set([...HELD_BACK_BY_JOE, ...NOT_BUILT_YET]),
]

/**
 * Which collections would read as "related" if they opened back to back.
 *
 * >>> MINE, NOT JOE'S. HE SHOULD OVERRULE THIS FREELY. JT-027 says only *"we
 * >>> should also avoid consecutive collections that may be perceived as
 * >>> related"* and does not say what related means. The grouping below is my
 * >>> reading of that sentence and nothing more — no brief, no roster section
 * >>> and no earlier ruling backs any single row of it. It is deliberately a
 * >>> flat table of twenty short strings so it can be corrected on a phone:
 * >>> move an id to another group, or invent a group, and the rule re-derives
 * >>> itself. Nothing else in this file knows what the groups mean.
 *
 * THE `conservation` GROUP HAVING FOUR MEMBERS IS THE WHOLE POINT. Near
 * Threatened, Vulnerable, Endangered and Critically Endangered are four Red List
 * tiers (roster §5, `types.ts:58-66`). Four pages of increasingly sad animals
 * opening one after another is the single most obvious way "perceived as
 * related" goes wrong, and it is the case a grouping has to catch to be worth
 * having at all.
 *
 * The table is TOTAL over `COLLECTIONS` minus `base`: every id in the roster has
 * a group, including every id in `HELD_BACK` however long that list grows, so
 * that releasing one of them needs no edit here. `base` is absent on purpose — it is never a candidate and
 * never the "most recently opened", because it was never opened.
 */
export const RELATED_GROUP: Readonly<Record<string, string>> = {
  // Temperate British-garden-ish ground: a garden and a wood are the same walk.
  garden: 'temperate',
  woodland: 'temperate',
  // Feathers is feathers to a five-year-old, however different the beaks are.
  birds: 'birds',
  raptors: 'birds',
  ocean: 'water',
  // Hot-and-far-away. Africa then Jungle would read as one long safari.
  africa: 'exotic-hot',
  jungle: 'exotic-hot',
  critters: 'minibeast',
  'night-time': 'nocturnal',
  // Animals a child might actually meet, in a house or on a farm.
  'home-pets': 'domestic',
  farm: 'domestic',
  ice: 'polar',
  outback: 'outback',
  // The four Red List tiers. See the note above — this row is the reason the
  // whole table exists.
  'near-threatened': 'conservation',
  vulnerable: 'conservation',
  endangered: 'conservation',
  'critically-endangered': 'conservation',
  // The three held back. Grouped anyway so the table stays total and releasing
  // one from HELD_BACK is a one-line change there and nothing here.
  legendary: 'legendary',
  dinosaurs: 'deep-time',
  prehistoric: 'deep-time',
}

/**
 * The snapshot `nextToOpen` reasons over. Everything it needs, nothing it does not.
 *
 * There is deliberately no `justCompleted` flag. A completion is not an event
 * this module has to be told about — it is visible in the snapshot as a
 * collection that is OPEN and at 100%, and that single fact does both halves of
 * Joe's second sentence at once. See `nextToOpen`.
 */
export interface UnlockState {
  /** Every collection id that has been opened, complete or not. Order irrelevant. */
  open: readonly string[]
  /**
   * How many members of each collection the child owns, by collection id.
   * A missing id means zero. Counts above the collection's size are clamped.
   */
  owned: Readonly<Record<string, number>>
  /**
   * The id opened most recently, or `null` before anything has been opened.
   * This is the only input to the "not two related in a row" rule.
   */
  lastOpened: string | null
  /** The roster to consult — normally `COLLECTIONS` from `roster.ts`. */
  roster: readonly Collection[]
}

/** Roster lookup by id. Ids not in the roster simply do not exist to this module. */
function find(roster: readonly Collection[], id: string): Collection | undefined {
  return roster.find((c) => c.id === id)
}

/**
 * How far through a collection the child is, in [0, 1].
 *
 * A collection with NO MEMBERS reads as 1, not as NaN and not as 0. No roster
 * row is empty today (`tests/island/species-roster.test.ts` pins every count),
 * so this is purely defensive — but the choice matters if it ever fires: 1 means
 * "there is nothing left to collect here", so an empty collection frees its
 * active slot instead of occupying one forever, which 0 would do.
 */
export function completion(state: UnlockState, id: string): number {
  const c = find(state.roster, id)
  if (!c) return 0
  const size = c.members.length
  if (size === 0) return 1
  const have = state.owned[id] ?? 0
  return Math.max(0, Math.min(1, have / size))
}

/** Complete = at 100%. Not "at or above OPEN_AT" — that is a different question. */
export function isComplete(state: UnlockState, id: string): boolean {
  return completion(state, id) >= 1
}

/**
 * ACTIVE = opened and not yet complete. The thing `MAX_ACTIVE` caps.
 *
 * `base` is counted like any other open collection if the caller puts it in
 * `open`. This module does not know that `base` is special except that it can
 * never be a candidate; whether the live 24 occupy one of Joe's four slots is a
 * question for whoever wires this up, and the answer is expressed by including
 * `base` in `open` or leaving it out. Ids not in the roster are ignored.
 */
export function activeIds(state: UnlockState): readonly string[] {
  return state.open.filter((id) => find(state.roster, id) && !isComplete(state, id))
}

/**
 * Every collection that could be offered right now, before the relatedness rule.
 *
 * Not already open, not held back, not `base`. Derived in roster order so the
 * candidate list is stable and the seeded draw below is reproducible — never
 * from `Object.keys(state.owned)`, whose order is the caller's accident.
 */
export function candidates(state: UnlockState): readonly string[] {
  return state.roster
    .map((c) => c.id)
    .filter((id) => id !== 'base' && !state.open.includes(id) && !HELD_BACK.includes(id))
}

/**
 * Does anything open right now, and if so what?
 *
 * The rules, in the order JT-027 states them:
 *
 * 1. AT THE CAP, ONLY A COMPLETION RELEASES THE NEXT ONE. Joe: *"at 4 open
 *    collections active a new one opens up only when another is completed."*
 *    This falls out of `MAX_ACTIVE` and the definition of ACTIVE and needs no
 *    extra flag: while four collections are open and unfinished, `activeIds`
 *    is 4, we return null, and NOTHING — not even one of them crossing 80% —
 *    opens a fifth. The moment one is finished it stops being active, the count
 *    drops to 3, and that same finished collection is sitting at 100%, which is
 *    above `OPEN_AT`, so it is also the thing that satisfies rule 2. One
 *    completion, one opening. Call again and the count is back at 4 and the
 *    answer is null again.
 * 2. BELOW THE CAP, 80% OPENS ONE. Any open collection at or above `OPEN_AT`
 *    is enough; it does not have to be the newest or the fullest.
 * 3. Candidates are everything not open, not held back, not `base`.
 * 4. Drop candidates sharing a `RELATED_GROUP` with `lastOpened` — with the
 *    fallback below.
 * 5. Pick from what survives with the CALLER'S rng. Joe said "random order".
 *
 * Returns the id to open, or `null` for "nothing opens now". Calling it twice
 * with the same state gives the same answer; it is the caller's job to fold an
 * opening back into `open`/`lastOpened` before asking again.
 */
export function nextToOpen(state: UnlockState, rng: Rng): string | null {
  // Rule 1. At or over the cap nothing opens, full stop. Written `>=` rather
  // than `===` so a state that somehow carries five active is not treated as a
  // green light.
  if (activeIds(state).length >= MAX_ACTIVE) return null

  // Rule 2. Something already open has to have reached 80%. A completed
  // collection is at 100% and therefore always satisfies this — which is
  // exactly what makes rule 1's release work.
  const triggered = state.open.some(
    (id) => find(state.roster, id) !== undefined && completion(state, id) >= OPEN_AT,
  )
  if (!triggered) return null

  return draw(state, rng)
}

/**
 * Rules 3, 4 and 5 — WHICH one opens, given that one is opening.
 *
 * Split out of `nextToOpen` so that `fillToCap` cannot drift from it. The two
 * differ over exactly one thing, rule 2, and everything about how a candidate is
 * chosen is stated once, here.
 */
function draw(state: UnlockState, rng: Rng): string | null {
  // Rule 3.
  const pool = candidates(state)
  if (pool.length === 0) return null

  // Rule 4. "avoid consecutive collections that may be perceived as related".
  const lastGroup = state.lastOpened === null ? undefined : RELATED_GROUP[state.lastOpened]
  const unrelated = lastGroup === undefined
    ? pool
    : pool.filter((id) => RELATED_GROUP[id] !== lastGroup)

  // >>> THE FALLBACK, AND IT IS DELIBERATE — READ THIS BEFORE FILING A BUG.
  // If avoiding the last group would leave NOTHING to open, we open a related
  // one anyway. Relatedness is a cosmetic ordering preference; the child having
  // something new to collect is not. The case is real and reachable: with the
  // four conservation tiers grouped together, a late game can arrive at a pool
  // that is nothing but conservation tiers right after a conservation tier
  // opened. A child must never be stuck on an empty island because of a
  // presentation rule, so this branch prefers a slightly repetitive album to a
  // dead one. It looks like a missing filter. It is not.
  const choices = unrelated.length > 0 ? unrelated : pool

  // Rule 5. The caller's seeded stream, never Math.random, so a save reproduces
  // and a test can pin the draw (`src/core/rng.ts:23`).
  return choices[ri(rng, choices.length)] ?? null
}

/**
 * Open collections until four are active. The START of a game, not a cadence.
 *
 * >>> WHY THIS EXISTS AT ALL, because it looks like it contradicts rule 2.
 * >>> Joe, on the album, 1 Aug: *"4 albums always on show, next one shows when
 * >>> one is completed."* Both halves of that sentence have to be true at once,
 * >>> and under `nextToOpen` alone the first one never is: a fresh island has
 * >>> only `base` open at 0%, nothing satisfies rule 2, and she would see ONE
 * >>> album until she owned twenty of the twenty-four — which is the opposite of
 * >>> the anticipation the whole feature is for.
 *
 * So the four are seeded AT THE CAP and the cadence takes over from there. That
 * is not a second policy fighting the first: starting full means `activeIds` is
 * already 4, so rule 1 holds the line and the only thing that can ever open a
 * fifth is a completion — which is Joe's second half, word for word. Rule 2 is
 * skipped here and NOWHERE ELSE, because "how does the game begin" is a
 * different question from "what does progress unlock", and rule 2 only answers
 * the second.
 *
 * Returns the ids to open, in the order they were drawn, so the caller can fold
 * them in and record the last one. Empty when four are already active.
 *
 * >>> THE POOL IS FIVE COLLECTIONS WIDE TODAY, AND THAT IS TIGHT. Since PB-058
 * >>> put the twelve unbuilt collections into `HELD_BACK` (see `NOT_BUILT_YET`),
 * >>> everything this function can ever draw is `garden`, `home-pets`,
 * >>> `woodland`, `africa` and `farm` — five. A fresh island opens `base` plus
 * >>> three of those to reach the cap of four, which leaves exactly TWO in
 * >>> reserve for the whole of the rest of the game: she completes an album, one
 * >>> of the two opens, she completes another, the last one opens, and after
 * >>> that the cadence has nothing left to give until a modeller ships a
 * >>> collection. That is not a fault in this function, it is the true state of
 * >>> the registry, and it is a great deal better than opening her an album of
 * >>> sixteen empty frames — but it is the number to look at first when someone
 * >>> asks why the album stopped growing.
 * >>>
 * >>> A POOL SMALLER THAN THE CAP DEGRADES SILENTLY, ON PURPOSE. It neither
 * >>> throws nor spins: `draw` returns null the instant `candidates` is empty
 * >>> (the `pool.length === 0` guard), and the `room--` bound below caps the loop
 * >>> at the pool's size however far off the cap we still are. A child on a build
 * >>> where nothing at all was buildable would simply see her own base album and
 * >>> no others. Fewer albums is a disappointment; a hang or a crash on the way
 * >>> to her island is not, and that is the trade being made.
 *
 * TERMINATES BY CONSTRUCTION even though it is a loop with a draw in it: every
 * id drawn is added to `open`, `candidates` excludes anything open, so the pool
 * strictly shrinks and the loop is bounded by its size. That bound is what
 * matters rather than the active count, because a hypothetical zero-member
 * collection reads as complete (see `completion`) and so would never raise the
 * active count at all.
 */
export function fillToCap(state: UnlockState, rng: Rng): readonly string[] {
  const opened: string[] = []
  let at = state
  let room = candidates(state).length
  while (activeIds(at).length < MAX_ACTIVE && room-- > 0) {
    const id = draw(at, rng)
    if (id === null) break
    opened.push(id)
    at = { ...at, open: [...at.open, id], lastOpened: id }
  }
  return opened
}
