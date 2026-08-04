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
 * Not marked provisional: Joe gave the number as a bound ("never more than"),
 * not as a feel dial, and the sentence that follows it only parses against a
 * hard cap.
 *
 * >>> FOUR BECAME THREE on 4 August 2026 — Joe: *"have 3 albums on the go."*
 * >>> Nothing about the rules changed with it; the cap is a number and this is
 * >>> the number. A child already carrying four open albums KEEPS all four: the
 * >>> cadence only ever adds, and `activeIds(state) >= MAX_ACTIVE` simply means
 * >>> nothing new opens for her until she finishes one. *"dont affect what kids
 * >>> have already."*
 */
export const MAX_ACTIVE = 3

/**
 * THE PIPELINE. Which collection opens next, in order, for every child.
 *
 * Joe, 4 August 2026: *"keep a set order in which they are opened ... once a
 * collection is complete, a new one is enabled. that way we have a rolling
 * pipeline. order of the collections is your's to set, but start with what we
 * have already."*
 *
 * ## This replaces "random order"
 *
 * JT-027 said *"random order"* and the draw was uniform over everything
 * available. That was right when nothing was built and any three of twenty-one
 * were as good as any other three. It is wrong now: the collections differ
 * enormously in how ready and how familiar they are, and a five-year-old opening
 * Ice before Farm meets a page of animals she has never heard of instead of a
 * cow. An order is a curriculum, and a random draw cannot express one.
 *
 * ## The order, and why it is this
 *
 * The first three are not a choice — they are what is already open on her
 * island, and re-ordering them would be exactly the "affect what kids have
 * already" he ruled out. After that it runs outward from what a British
 * five-year-old can name, and only then to the exotic and the abstract:
 *
 *   base, garden, home-pets   what she has. Untouched.
 *   woodland                  the same walk as the garden, one field further.
 *   farm                      a cow, a sheep, a hen. Named before she reads.
 *   birds                     still the garden, now looking up.
 *   ocean                     the seaside — met on holiday, not on a screen.
 *   night-time                the first page that needs imagination.
 *   africa                    the zoo animals. Every child's favourites, and
 *                             deliberately not first: they are the reward.
 *   ice, jungle, outback      further out, one climate at a time.
 *   critters, raptors         the specialist pages, once the broad ones are done.
 *   near-threatened ... critically-endangered
 *                             LAST, and in that order, because they are a
 *                             conservation ladder rather than a habitat and only
 *                             mean anything to a child who has met the animals
 *                             on them. `types.ts` treats them apart too.
 *
 * `legendary`, `dinosaurs` and `prehistoric` are absent on purpose: they are
 * `HELD_BACK_BY_JOE`. Appending them here would be deciding something that is
 * his, and `heldBack` would refuse them anyway.
 *
 * ## Relatedness is expressed HERE now, not by a filter
 *
 * `RELATED_GROUP` and the "avoid consecutive related collections" rule existed
 * because a random draw could put Africa next to Jungle. An explicit order does
 * that job better and without a fallback branch, and the order above is built to
 * satisfy it: garden and woodland have home-pets between them, home-pets and
 * farm have woodland, africa and jungle have ice, and the two bird pages sit at
 * opposite ends. `species-unlock.test.ts` asserts that pairwise rather than
 * trusting this paragraph — it caught `home-pets, farm` in the first draft.
 *
 * THE ONE EXEMPTION IS THE CONSERVATION LADDER, and it is the opposite case.
 * Those four share a group and run consecutively ON PURPOSE: their order carries
 * the meaning — least threatened to most — so interleaving a habitat page
 * between `vulnerable` and `endangered` would break the one thing they are for.
 * The rule exists to stop a draw feeling repetitive; a ladder is not repetition.
 *
 * A collection missing from this list is not offerable at all — asserted in
 * `species-unlock.test.ts`, so adding one to the roster and forgetting it here
 * is a red test rather than a collection no child is ever shown.
 */
export const PIPELINE_ORDER: readonly string[] = [
  'base', 'garden', 'home-pets',
  'woodland', 'farm', 'birds', 'ocean', 'night-time', 'africa',
  'ice', 'jungle', 'outback', 'critters', 'raptors',
  'near-threatened', 'vulnerable', 'endangered', 'critically-endangered',
]

/**
 * How the next album is chosen from the front of the pipeline.
 *
 * Joe: *"probability of opening the earliest: 50%, 2nd: 35%, 3rd: 15%."*
 *
 * Not a uniform draw over the whole pool and not a strict queue either. The
 * earliest waiting collection is the likeliest by a distance, so the order is
 * the order in practice — but two children who have played the same amount do
 * not have identical islands, which is roster §3's "playground currency" and the
 * whole reason JT-027 asked for randomness in the first place. This keeps both.
 *
 * With fewer than three waiting the weights are normalised over what is there,
 * so the last collection in the game opens with probability 1 rather than 0.5.
 */
export const OPEN_WEIGHTS: readonly number[] = [0.50, 0.35, 0.15]

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
 * and so are held back twice over, but the two holds are different questions
 * with different release conditions and are kept apart for exactly that reason.
 * See `heldBack` below, which is where the other half now lives.
 *
 * >>> SO RELEASING ONE OF THESE THREE IS NOT ENOUGH ON ITS OWN. Deleting a
 * >>> string here is still the whole of Joe's half, but a collection also has to
 * >>> have something built before the cadence will offer it. For these three
 * >>> that is a real gap and not a formality: none of them has a single model.
 */
export const HELD_BACK_BY_JOE: readonly string[] = ['legendary', 'dinosaurs', 'prehistoric']

/*
 * >>> `NOT_BUILT_YET` AND `HELD_BACK` WERE DELETED HERE ON 3 AUGUST 2026, and
 * >>> what replaced them is `heldBack()` below. This note is what they were for,
 * >>> because the REASON survives them and the next person needs it.
 *
 * `NOT_BUILT_YET` was a hand-written list of the collections with not one
 * species built, held back by arithmetic rather than by taste. The bug it
 * existed for is real and is not fixed by deleting it: a collection whose
 * registry entry is empty does not render as "coming soon" or as anything else
 * considerate, so opening `ocean` puts sixteen empty squares in front of a
 * five-year-old and calls it a new album. That is PB-058.
 *
 * IT WAS WRITTEN BY HAND FOR A GOOD REASON — this module is pure, and computing
 * the truth here would have dragged three.js in through `registry.ts` and
 * `collections/garden.ts`. A tripwire test recomputed it and failed by name the
 * day a collection gained its first model. That was a fair trade at the time.
 *
 * >>> IT STOPPED BEING A FAIR TRADE, AND THE TRIPWIRE WAS ABOUT TO CAUSE THE
 * >>> VERY BUG IT GUARDED. The tripwire measured `shippedIn(id).length`, which
 * >>> counts REGISTERED RECORDS — and a record is not an animal. `built.ts`
 * >>> spells this out: the method the last three collections were built by
 * >>> writes ALL of a collection's records in one commit and the species files
 * >>> afterwards, one at a time. So the moment Farm's sixteen records landed,
 * >>> the tripwire would have gone red saying "farm now has models — take it out
 * >>> of NOT_BUILT_YET so the cadence can start offering it", with ZERO farm
 * >>> animals built. Whoever obeyed it would have handed a child an album the
 * >>> album view itself refuses to draw a single frame of.
 * >>>
 * >>> The list also went BACKWARDS twice, which its own comment said could not
 * >>> happen: `woodland` and `farm` re-entered it on 2 August when PB-036
 * >>> deleted the kit-built route. A list that can move in both directions and
 * >>> is checked by the wrong predicate is not a cache of the truth, it is a
 * >>> second opinion — and two functions answering one question is how the
 * >>> album came to read "13 of 13" while the unlocker read 81%.
 *
 * So the hold is now DERIVED, live, from the same `state.built` counts that
 * `completion` divides by — one predicate, `built.ts`, reaching here by
 * injection rather than by import, so purity is kept and the list cannot rot.
 * "Shipping a collection" is no longer a string anybody has to remember to
 * delete: build an animal, and the cadence offers the collection on its own.
 */
/**
 * Is this collection never to be offered? Joe's judgement, or nothing built.
 *
 * The two halves stay NAMED SEPARATELY even though the function returns one
 * boolean, because they are undone by different people for different reasons:
 * `HELD_BACK_BY_JOE` shrinks when Joe rules on a collection, and the built
 * clause shrinks the moment a modeller commits a species file. Collapsing them
 * into one flat idea would lose that, and the first person to release
 * `legendary` would have no way of knowing whether they were answering a design
 * question or a modelling one.
 *
 * THE BUILT CLAUSE IS THE WHOLE OF PB-058, now stated as arithmetic rather than
 * remembered as a list. A collection with nothing built is never drawn, so a
 * child is never handed sixteen empty frames.
 *
 * `night-time` IS THE CASE THAT SHOWS WHY THIS IS A COUNT AND NOT A FLAG. It has
 * thirteen of sixteen built, and the other three — `animal-bat`,
 * `animal-sugar-glider`, `animal-scorpion` — want a membrane and a pincer that
 * the parts bank does not have, so on today's bank they cannot be built at all.
 * Under the OLD roster-denominated maths that made the collection permanently
 * uncompletable: it sat at 13/16, never reached 100%, never went inactive, and
 * held one of `MAX_ACTIVE`'s four slots for good. Under JT-047 it is 13 of 13,
 * it completes, and it frees its slot like any other. **That is JT-030 — "may a
 * collection unlock with a hole in it?" — answered by arithmetic rather than by
 * ruling: there is no hole any more, because the roster's ambition is no longer
 * what a child is measured against.** Joe may still want to rule on whether a
 * partial collection should be offered at all; that question is now cosmetic
 * rather than a wedge, and it is his.
 *
 * It takes the BUILT MAP rather than a whole `UnlockState` because `opened.ts`'s
 * prune needs the same answer while it is still assembling one, and the two must
 * not be allowed to drift into separate readings of "never offered" — that
 * divergence is the entire subject of this file's 3 August rewrite.
 */
export function heldBack(
  built: Readonly<Record<string, number>>, id: string,
): boolean {
  return HELD_BACK_BY_JOE.includes(id) || (built[id] ?? 0) === 0
}

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
 * a group, including every id `heldBack` currently refuses, so that releasing
 * one of them needs no edit here. `base` is absent on purpose — it is never a candidate and
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
  // one is a one-line change in HELD_BACK_BY_JOE and nothing here.
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
  /**
   * HOW MANY MEMBERS OF EACH COLLECTION ARE ACTUALLY BUILT, right now.
   *
   * A missing id means none. This is the denominator of `completion` and the
   * whole of JT-047 — Joe, 3 August: *"the unlocker and counters on the page
   * should go of the number of animals pushed on that collection at any one
   * time. i might make some more, needs to be dynamic."*
   *
   * >>> IT IS INJECTED RATHER THAN IMPORTED, AND THAT IS NOT SQUEAMISHNESS.
   * >>> The one honest answer to "is this animal built" lives in `built.ts`, and
   * >>> `built.ts` costs three.js twice over — `KITS` comes from `kit.ts`, and
   * >>> `speciesRecord` comes from `registry.ts` which reaches three through
   * >>> `collections/garden.ts`. This module is pure and its header promises to
   * >>> stay pure, so it takes the ANSWER and never the renderer. `roster` above
   * >>> is injected for exactly the same reason and has been since phase 2, so
   * >>> this is the established seam rather than a new one.
   * >>>
   * >>> THERE IS STILL ONLY ONE PREDICATE. Nothing here re-derives "built";
   * >>> `opened.ts` threads a map through and `main.ts` fills it from
   * >>> `built.ts`'s `builtIn`. Two functions answering this question separately
   * >>> is precisely how the album came to read "13 of 13" while the unlocker
   * >>> read 81% — the bug JT-047 exists to close.
   *
   * DO NOT CACHE IT ANYWHERE THAT OUTLIVES A CALL. "Needs to be dynamic" is the
   * requirement: the map is rebuilt from the live registry on each arrival, so
   * an animal added between two sessions changes the sums with no migration and
   * nothing to invalidate. It is never written to the save — see the ratchet
   * note on `isComplete`.
   */
  built: Readonly<Record<string, number>>
  /**
   * EVERY COLLECTION THIS ISLAND HAS EVER HAD COMPLETE. Append-only. THE RATCHET.
   *
   * This is the one thing in the snapshot that is HISTORY rather than a reading
   * of the present, and it has to be, because after Joe adds two animals "she
   * has 13 of 14" and "she once had all of them" are the same current state.
   * There is nothing left to derive it from, so it is written down.
   *
   * >>> WHY IT EXISTS — brief §19, and it is not optional. `built` above can
   * >>> FALL as well as rise: Joe says *"i might make some more"*, so a
   * >>> collection is 14 of 14 and COMPLETE today and 14 of 16 and INCOMPLETE
   * >>> tomorrow. Without this field that collection becomes ACTIVE again, the
   * >>> active count goes back to `MAX_ACTIVE`, and `nextToOpen` returns null
   * >>> FOREVER until she collects the two new ones.
   * >>>
   * >>> The cost of that lands at the exact moment the whole feature exists for.
   * >>> This game teaches a child one rule — finish an album and a new one
   * >>> appears — and rule 1 below calls "one completion, one opening" the
   * >>> load-bearing invariant. Without the ratchet, a content push nobody at
   * >>> the screen can see silently spends her next album weeks in advance, and
   * >>> she finishes a collection to be told nothing. Not one person in the room
   * >>> could explain it; Joe would not connect "I pushed two owls" to "the
   * >>> island went quiet".
   * >>>
   * >>> WHAT IS RATCHETED IS ONLY THE SLOT ACCOUNTING, and that is the point.
   * >>> The counter still moves honestly from "13 of 13" to "13 of 14", the
   * >>> album visibly reopens, and she can go and collect the new animals. New
   * >>> animals in a finished album are a GIFT ON TOP OF HER TROPHY, never a
   * >>> lien against her next one.
   *
   * `opened.ts` owns the appending and the save carries it; ids are never
   * removed, and a wipe clears it with the rest of the island (`save.ts`) —
   * deliberately NOT with `onceFlags`, which survive a wipe and would leave a
   * fresh island with a freed slot and no animals to show for it.
   */
  everCompleted: readonly string[]
}

/** Roster lookup by id. Ids not in the roster simply do not exist to this module. */
function find(roster: readonly Collection[], id: string): Collection | undefined {
  return roster.find((c) => c.id === id)
}

/**
 * How far through a collection the child is, in [0, 1].
 *
 * >>> IT DIVIDES BY THE BUILT MEMBERS, NOT BY THE ROSTER. This is JT-047 and it
 * >>> is the whole of Joe's ruling: *"the unlocker and counters on the page
 * >>> should go of the number of animals pushed on that collection at any one
 * >>> time."* The roster is what a collection WILL hold one day; dividing by it
 * >>> asks a child to collect animals that do not exist.
 * >>>
 * >>> IT WAS THE ROSTER UNTIL 3 AUGUST 2026 AND THAT WAS A LIVE BUG. Night Time
 * >>> is thirteen built of sixteen rostered. `album.ts:874` already counted the
 * >>> built ones, so the album told her "13 of 13" — finished — while this
 * >>> function read 13/16 = 81%, so to the unlocker the collection was never
 * >>> complete, never freed its slot, and the next album never opened. Africa
 * >>> was worse: one built of sixteen, 6%, uncompletable by any amount of play.
 * >>> Both were masked only because neither happened to be the collection in
 * >>> progress. The two numbers now come from ONE predicate (`built.ts`), which
 * >>> is the only way they cannot drift apart again.
 *
 * A collection with NOTHING BUILT reads as 1, not as NaN and not as 0, and under
 * built-denominated maths that case is REAL rather than defensive — PB-036
 * deleted fifty-nine species without touching the roster, so a child can own
 * pets from a collection whose models are all gone. 1 means "there is nothing
 * left to collect here", so it frees its active slot; 0 would wedge it open
 * forever holding one of `MAX_ACTIVE`'s four, which is exactly the trap
 * `opened.ts` documents at its step 0. Such a collection is also never OFFERED
 * (see `heldBack`), so it can neither occupy a slot nor be drawn into one.
 *
 * An id that is not in the roster at all still reads 0: it does not exist to
 * this module, which is a different thing from existing and being empty.
 */
export function completion(state: UnlockState, id: string): number {
  if (!find(state.roster, id)) return 0
  const size = state.built[id] ?? 0
  if (size === 0) return 1
  const have = state.owned[id] ?? 0
  return Math.max(0, Math.min(1, have / size))
}

/**
 * Complete = at 100% NOW, or ever having been. Not "at or above OPEN_AT".
 *
 * THE `everCompleted` CLAUSE IS THE RATCHET AND IT IS LOAD-BEARING. See the
 * field's own note on `UnlockState` for why brief §19 requires it; the short
 * version is that `completion` can FALL when Joe builds more animals, and a
 * collection she has already finished must never take back the slot it freed.
 *
 * Putting the clause HERE rather than in `activeIds` is deliberate: `isComplete`
 * is read by both things that matter — `activeIds` for the slot, and rule 2 of
 * `nextToOpen` by way of a completed collection always clearing `OPEN_AT` — so
 * one clause in one function ratchets both, and they cannot disagree.
 */
export function isComplete(state: UnlockState, id: string): boolean {
  if (state.everCompleted.includes(id)) return true
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
  /*
   * IN PIPELINE ORDER since 4 August, not roster order — see `PIPELINE_ORDER`.
   * The order IS the feature now: `draw` weights the first three 50/35/15, so
   * what this returns first is what a child is most likely to be given next.
   *
   * Driven off `PIPELINE_ORDER` rather than sorting the roster by it, so a
   * collection nobody has placed in the pipeline is not offered at all. That is
   * the safe direction to fail: an unplaced collection is one nobody has decided
   * where to put, and showing it to a child early is a decision by accident.
   */
  const known = new Set(state.roster.map((c) => c.id))
  return PIPELINE_ORDER.filter((id) => known.has(id)
    && id !== 'base' && !state.open.includes(id) && !heldBack(state.built, id))
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
  //
  // `isComplete` IS ASKED FIRST, AND NOT ONLY AS A SHORTCUT. It carries the
  // ratchet, and without it this line would leak the very failure the ratchet
  // exists to stop: a collection she FINISHED, at 14 of 14, reads 14/20 = 70%
  // the day Joe builds six more, which is under `OPEN_AT`. Rule 1 would already
  // have freed her slot on the strength of `isComplete`, and then this rule
  // would refuse to fill it — she would be owed an album by one half of the
  // rule and denied it by the other. Both halves must ratchet or neither can.
  const triggered = state.open.some(
    (id) => find(state.roster, id) !== undefined
      && (isComplete(state, id) || completion(state, id) >= OPEN_AT),
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

  /*
   * RULE 4 IS GONE, and its job moved into `PIPELINE_ORDER`.
   *
   * It filtered out candidates sharing a `RELATED_GROUP` with `lastOpened` —
   * "avoid consecutive collections that may be perceived as related" — and
   * needed a documented fallback for the case where avoiding them left nothing
   * to open at all. Both existed because the draw was uniform over the whole
   * pool and could put Africa next to Jungle.
   *
   * An explicit order does that job better: the pipeline separates the related
   * pairs by construction, so there is no filter to fight and no empty-pool
   * branch to fall back from. `RELATED_GROUP` is kept as the record of WHICH
   * collections read as related — it is what the order was built from, and it is
   * asserted against the order in `species-unlock.test.ts`.
   *
   * RULE 5, WEIGHTED. Joe: *"probability of opening the earliest: 50%, 2nd:
   * 35%, 3rd: 15%."* Still the caller's seeded stream, never `Math.random`, so a
   * save reproduces and a test can pin the draw (`src/core/rng.ts:23`).
   */
  const front = pool.slice(0, OPEN_WEIGHTS.length)
  const weights = OPEN_WEIGHTS.slice(0, front.length)
  const total = weights.reduce((a, b) => a + b, 0)

  /* Normalised over what is actually waiting, so the last collection in the game
   * opens with probability 1 rather than 0.5 — otherwise half the draws would
   * fall past the end of the list and open nothing. */
  let ticket = rng() * total
  for (const [at, id] of front.entries()) {
    ticket -= weights[at] as number
    if (ticket < 0) return id
  }
  // Float dust only: `rng()` is [0, 1) so the loop above all but always returns.
  return front[front.length - 1] ?? null
}

/**
 * Open collections until four are active. The START of a game, not a cadence.
 *
 * >>> WHY THIS EXISTS AT ALL, because it looks like it contradicts rule 2.
 * >>> Joe, on the album, 1 Aug: *"4 albums always on show, next one shows when
 * >>> one is completed."* Both halves of that sentence have to be true at once,
 * >>> and under `nextToOpen` alone the first one never is: a fresh island has
 * >>> only `base` open at 0%, nothing satisfies rule 2, and they would see ONE
 * >>> album until they owned twenty of the twenty-four — which is the opposite
 * >>> of the anticipation the whole feature is for.
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
 * >>> THE POOL IS FOUR COLLECTIONS WIDE TODAY, AND THAT IS THE TIGHTEST IT HAS
 * >>> BEEN. It is no longer a list anybody maintains — `heldBack` derives it
 * >>> from `state.built`, so this paragraph is a MEASUREMENT AND WILL GO STALE,
 * >>> which is exactly why the numbers are pinned in
 * >>> `tests/island/species-built.test.ts` instead of trusted here.
 * >>>
 * >>> On 3 August 2026 the non-base collections with anything built are
 * >>> `garden` (14), `home-pets` (16), `night-time` (13) and `africa` (1). This
 * >>> paragraph said SIX until today and named `woodland` and `farm` among them;
 * >>> both went to zero built when PB-036 deleted the kit route on 2 August, and
 * >>> the sentence was simply not updated. A fresh island opens `base` plus
 * >>> three of those four to reach the cap, leaving exactly ONE in reserve for
 * >>> the rest of the game. That is not a fault in this function — it is the
 * >>> true state of the registry, and it is far better than opening a child an
 * >>> album of sixteen empty frames — but it is the first number to look at when
 * >>> someone asks why the album stopped growing.
 * >>>
 * >>> **Farm is being built right now and will widen this to five.** That is the
 * >>> case the derivation exists for: nobody has to remember to delete a string
 * >>> for the cadence to start offering it.
 * >>>
 * >>> THE TWO PARAGRAPHS ABOVE ARE OUT OF DATE AND ARE KEPT FOR THE REASONING,
 * >>> NOT THE COUNT. `woodland` and `farm` were both named there as part of the
 * >>> six; both then went back into `NOT_BUILT_YET` when Joe retired the
 * >>> kit-built route, taking the pool down to four. Farm returned on 3 August
 * >>> (PB-074) with all sixteen rebuilt on the assembly route, so the pool is
 * >>> FIVE today — `garden`, `home-pets`, `africa`, `night-time` and `farm` —
 * >>> and `woodland` is the only one of the original six still missing. A fresh
 * >>> island still opens `base` plus three, so the reserve is two rather than
 * >>> three, and Farm is the first of those two that a child can actually
 * >>> finish: it is sixteen of sixteen and frees its slot on completion, which
 * >>> `night-time` cannot do.
 * >>>
 * >>> A POOL SMALLER THAN THE CAP DEGRADES SILENTLY, ON PURPOSE. It neither
 * >>> throws nor spins: `draw` returns null the instant `candidates` is empty
 * >>> (the `pool.length === 0` guard), and the `room--` bound below caps the loop
 * >>> at the pool's size however far off the cap we still are. A child on a build
 * >>> where nothing at all was buildable would simply see their own base album
 * >>> and no others. Fewer albums is a disappointment; a hang or a crash on the
 * >>> way to their island is not, and that is the trade being made.
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
