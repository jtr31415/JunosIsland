/**
 * Economy constants and the cost curve (slice-1 spec §4, §8).
 *
 * Nothing about pacing is hardcoded anywhere else. The whole point of the
 * curve is that the first of anything is nearly free and the tenth is real
 * work, without a cliff between them — so it is tuned by editing JSON, not by
 * hunting constants through the code.
 */
import raw from './balance.json'

export interface CostCurve { base: number; cap: number; tau: number }

export interface Balance {
  tile: CostCurve
  egg: CostCurve
  /**
   * What one completed item is worth (Run A7).
   *
   * Costs used to be denominated in items: one sum paid 1, and a tile cost 8
   * sums. They are now denominated in UNITS, and one item pays 2 — every cost
   * on both curves doubled with it, so nothing about the pacing changed. It
   * exists to buy fractions the old denomination could not express: Run B pays
   * 3 for probe questions and honeymoon periods, and there is no such thing as
   * paying 1.5.
   *
   * This is also the curve's rounding quantum — see `cost()`, which is where
   * the invisibility is actually enforced.
   *
   * `honeymoon` is the OTHER rate the paragraph above was written for: what one
   * completed MATHS item pays while a Run B honeymoon is running (runA.md:233 —
   * *"pay 3, 2 sessions, cost-index frozen"*). It is a second denomination, not
   * a replacement — see `honeymoonPay`.
   */
  pay: { item: number; honeymoon: number }
  pages: { wordsPerFindPage: number; mix: PageKind[] }
  governor: {
    /**
     * How long the island stays a sandbox — the opening stretch in which no wall
     * exists at all. Joe, JT-016: five animals and ten tiles.
     *
     * Both at once, and the AND is the point: a child with three animals on
     * fourteen tiles has left the sandbox and should hear from Fred, and so has
     * a child with eight animals on six tiles. Grace ends when EITHER number
     * grows up. See `graceHolds`, and the tuning table above `emptySteps`.
     */
    grace: { pets: number; tiles: number }
    /**
     * The two walls of the corridor they are free to play inside, in TILES PER PET.
     *
     * Joe, JT-012: *"target ratio i think should be 1 animal per 2 tiles, with a
     * buffer to 2:3 either way, then it starts to become increasingly tougher to
     * get either."*
     *
     * TARGET: 2.0 tiles per pet — one animal per two tiles. It is not a knob
     * because nothing reads it; it is the middle of the corridor these two walls
     * describe, and it supersedes the old `tilesPerPet: 1.5` in its role as the
     * TARGET. The 1.5 itself survives, as `crowded`.
     *
     * WHY THEY LOOK LOPSIDED. 1.5 and 3.0 are not symmetric about 2.0, and that
     * is deliberate rather than a slip. Joe stated the target in ANIMALS PER
     * TILE — "1 animal per 2 tiles", "a buffer to 2:3 either way" — and in that
     * unit the three numbers are 2/3, 1/2, 1/3: evenly spaced, a sixth apart
     * either side of the target. Inverting each to tiles per pet gives 1.5, 2.0,
     * 3.0, which is only lopsided because reciprocals do not preserve midpoints.
     * The buffer is even in the unit he said it in.
     *
     * `crowded` — 1.5 tiles per pet, two animals for every three tiles. Breached
     * when `habitableFields < 1.5 · pets`: too many friends for the land, so the
     * EGG gets dearer and Fred asks for maths.
     *
     * `empty` — 3.0 tiles per pet, one animal for every three tiles. Breached
     * when `habitableFields > 3 · pets`: bare land with nobody on it, so the
     * TILE gets dearer and Fred asks them to read.
     *
     * See `emptySteps` and `crowdedSteps`, which are the only place either
     * number is compared against anything — the governors and the prices read
     * the SAME two functions, so an announcement and a rise cannot drift apart.
     */
    corridor: { crowded: number; empty: number }
    /**
     * The two walls at which the PRICE actually starts to climb, in the same
     * unit — tiles per pet. Joe, JT-014 and PB-042: the warning and the charge
     * used to fire at the same wall, and he wanted daylight between them.
     *
     * `corridor` is where FRED SPEAKS. This is where the TILL OPENS, and it sits
     * strictly further out on both sides: 1.2 outside 1.5, 4.0 outside 3.0. In
     * the band between them they have been told and are not being charged,
     * which is the whole of the ruling.
     *
     * The measured reasons for these two numbers, and everything else in the
     * governor block, are in the tuning table above `emptySteps`.
     */
    price: { crowded: number; empty: number }
    /**
     * How much dearer a reward gets for each whole step past its wall.
     *
     * Joe, JT-012: *"let the user run with whatever they want to do up to a
     * point... we then make the reward really really tough to reach if it pushes
     * imbalance further if its too far out of balance."*
     *
     * LINEAR, not exponential: `1 + steps · slope`, so the first step past the
     * wall costs a quarter more and the eighth costs treble. A curve that bit
     * harder early would make the wall a lockout in everything but name, and
     * §19 does not allow a lockout.
     *
     * `capMultiple` is the "up to a point" at the far end: nothing is ever more
     * than three times its list price, however far out of balance they run. With
     * the shipped caps that is 96 units of sums for a tile and 84 of pages for an
     * egg — a lot of work, reachable work, and it never grows again.
     */
    escalation: { slope: number; capMultiple: number }
  }
  pets: {
    /**
     * How many recent hatches the species draw refuses to repeat.
     *
     * Joe, from playtesting: *"investigate: two cats spawned in a row."* The
     * draw was uniform over the 24 species with no memory at all, so a repeat
     * came up one hatch in 24 — often enough that a child collecting friends
     * meets one early and reads it as their work not counting.
     *
     * FIVE, of 24. An egg is several pages of reading apart, so five covers a
     * whole sitting's worth of hatches: within one session they cannot meet the
     * same animal twice. It still leaves 19 candidates on every draw, so the
     * next friend is genuinely a surprise, and a favourite can come back after
     * six hatches rather than after the whole pack. Raising it toward 23 turns
     * the collection into a checklist; dropping it to 1 fixes only the literal
     * back-to-back case and leaves cat-dog-cat, which reads the same to them.
     */
    speciesMemory: number
  }
  /**
   * Where the grown-ups panel's three measures turn into words (Run A6).
   *
   * These are thresholds on a child's numbers, which is precisely why they are
   * data. The spec asks for them here in terms — *"thresholds in balance,
   * tunable"* — because the honest answer to "is .84 steady or solid?" is that
   * nobody knows yet, and a number nobody knows yet does not belong in a
   * compiled constant where changing it is a code change and a test rewrite.
   *
   * `accuracy` and `consistency` are the spec's own numbers. TWO of these are
   * not, and are flagged as chosen where they are used in `report.ts`: the spec
   * names one speed threshold (15%) and a three-tier scale needs two, so
   * `speed.solid` is a mechanical call; and the spec defines consistency as one
   * boolean, so the middle rung `report.ts` reads out of it is likewise. Both
   * sit here rather than in code so that retuning them is an edit to a data
   * file and not an argument with the type checker.
   *
   * `samples` is the small-sample honesty gate — below these counts the panel
   * shows dashes rather than a tier, because a verdict drawn from four attempts
   * is a statement about the sample and not about the child.
   */
  report: {
    accuracy: { steady: number; solid: number }
    speed: { steady: number; solid: number }
    consistency: { session: number; sessions: number; days: number }
    samples: { accuracy: number; speed: number; sessions: number }
  }
  /**
   * How long the opening story waits on each of Fred's lines before moving
   * itself on. Scaled to the LINE, not flat: a flat wait makes a short line
   * sit there as long as a long one, which is what makes an intro drag.
   */
  story: { beatMinMs: number; beatPerCharMs: number; beatMaxMs: number }
  stage: {
    spinSec: number; progressDots: boolean; flyBackMs: number
    /** How long the friend stands on the plinth before the stage dissolves. */
    hatchHoldMs: number
    /**
     * How long the ceremony will wait for a pet model before going on.
     *
     * Generous, because a COLD fetch of a pet on a first hatch genuinely
     * takes over a second and an empty plinth is the failure this all exists
     * to prevent — but bounded, because the exits are locked while it waits
     * and an unbounded wait on a stalled request is a permanent soft-lock.
     */
    petLoadMs: number
    /** The album chip's flight. */
    chipMs: number
    /** How long the finished plot shows its flourish on the turntable. */
    flourishMs: number
    /** How high, and how far out, the fly-back arcs from. */
    landHeight: number
    landReach: number
  }
  firstRun: { tileOffer: string[]; egg2DelaySec: number }
  unlocks: Array<{ type: string; tiles: number; pets: number }>
}

export type PageKind = 'find' | 'build'

export const balance = raw as Balance

/** Injected by Vite. See vite.island.config.ts and platform/flags.ts. */
declare const __CHANNEL__: string

/**
 * Pull in the compressed-time overlay, or prove there is nothing to pull.
 *
 * The brief requires `balance.dev.json` to be "structurally unloadable in
 * production", and that is stronger than a runtime check. Because
 * `__CHANNEL__` is a build-time constant, this comparison folds to `false` in
 * a production build and Rollup deletes the whole branch — the dynamic import
 * with it, so the JSON is never emitted as a chunk and its contents appear
 * nowhere in the output. `tests/island/channel.test.ts` greps the built bundle
 * for a marker string to prove exactly that, because "I believe Rollup drops
 * it" is not the same as knowing.
 *
 * It MUTATES the exported object rather than returning a new one. Every call
 * site imports `balance` directly and reads it whenever it likes, so handing
 * back a copy would leave most of the game reading the un-overlaid original —
 * a tuning switch that appeared to work and mostly did not.
 */
export async function applyDevBalance(enabled: boolean): Promise<boolean> {
  if (!enabled) return false
  if (__CHANNEL__ === 'production') return false
  const overlay = (await import('./balance.dev.json')).default as Partial<Balance>
  for (const [key, value] of Object.entries(overlay)) {
    if (key.startsWith('__')) continue          // the marker, not a setting
    ;(balance as unknown as Record<string, unknown>)[key] = value
  }
  return true
}

/**
 * cost(n) = pay · round((cap − (cap − base) · e^((1 − n) / tau)) / pay)
 *
 * The nth thing of its kind costs this many UNITS. Asymptotic to `cap`, so the
 * curve flattens rather than running away: the twentieth tile is a fair amount
 * of work, the fiftieth is not punishment.
 *
 * `n` is 1-based — the first egg costs `base`.
 *
 * **Why it rounds in items and not in units.** The A7 re-base doubled `base`,
 * `cap` and the payment together, and the survey called that invisible "by
 * construction". It is not: rounding does not commute with doubling, because
 * `round(2x) ≠ 2·round(x)`. Rounding the doubled curve directly gives the
 * second tile a cost of 7 units — and at 2 a sum that is FOUR sums where it
 * has always been three, a 33% rise on the most visible price in the game.
 * Ten values on the tile curve and five on the egg curve moved that way.
 *
 * So the curve rounds to a whole ITEM and then converts. `exact / pay` is
 * identically the old pre-A7 exact curve (halving `base` and `cap` gives it
 * back exactly), so this returns `2 ×` the old cost at every n, and the items
 * a child actually answers are unchanged everywhere. That is the sense in
 * which the re-base is invisible, and `tests/island/economy.test.ts` walks a
 * month of play to hold it there.
 *
 * It also means a cost is always a whole number of standard items, so the
 * curve never asks for a half-answer. Run B's pay-3 items spend against the
 * same units without moving any price.
 */
export function cost(curve: CostCurve, n: number): number {
  const pay = Math.max(1, balance.pay.item)
  return pay * Math.round(exactCost(curve, n) / pay)
}

/**
 * The curve before it is rounded to a whole item — the list price, exactly.
 *
 * Pulled out so the surcharge can multiply it BEFORE the quantum is applied
 * (see `costPast`). Rounding twice would let a step past the wall move a price
 * by nothing at all, or by two items where the multiplier asked for one.
 */
function exactCost(curve: CostCurve, n: number): number {
  const i = Math.max(1, n)
  return curve.cap - (curve.cap - curve.base) * Math.exp((1 - i) / curve.tau)
}

/**
 * What one completed item pays, in units. Read through a function because the
 * dev overlay may replace `balance.pay` after import (see `applyDevBalance`).
 */
export const itemPay = (): number => Math.max(1, balance.pay.item)

/**
 * What one completed MATHS item pays while a honeymoon is running — runA.md:233,
 * *"pay 3, 2 sessions, cost-index frozen"*.
 *
 * A SIBLING OF `itemPay`, NOT A PARAMETER ON IT, and the difference is not
 * stylistic. `itemPay()` is read by three callers that must go on seeing 2
 * whatever the harness has stamped:
 *
 *   - `itemsFor` (below), which converts a price in units into the number of
 *     items a child answers — the pacing figure a month of tests pins.
 *   - `pagesRead` (below), which turns `readProgress` into a PAGE INDEX. Reading
 *     always pays one standard item, so a 3 here would read the find/build mix
 *     at the wrong stride (PB-038, JT-010(2)).
 *   - the save's re-denomination stamp (`save.ts:161`, read back at `:203`).
 *     THIS IS THE DANGEROUS ONE. `fromSave` rescales banked progress by
 *     `itemPay() / save.pay`, so a stamp of 3 written during a honeymoon would
 *     make every later load multiply — or divide — every unit a child has
 *     banked. A parameterised `itemPay(honeymoon)` invites exactly that call.
 *
 * `Math.max` rather than a bare read, so a dev overlay or a hand-tuned
 * `balance.json` can never make the honeymoon pay LESS than an ordinary item:
 * "going easy on them" that charged more would be a punishment for saying yes.
 */
export const honeymoonPay = (): number =>
  Math.max(itemPay(), balance.pay.honeymoon)

/**
 * How many ordinary items the nth thing actually costs — the number a child
 * experiences, and the one the pacing tests pin.
 */
export const itemsFor = (curve: CostCurve, n: number): number =>
  Math.ceil(cost(curve, n) / Math.max(1, balance.pay.item))

/** Pages needed for the nth egg (1-based). */
export const eggCost = (n: number): number => cost(balance.egg, n)

/** Sums needed for the nth tile (1-based). */
export const tileCost = (n: number): number => cost(balance.tile, n)

/* ------------------------------------------------------------------------- *
 * The corridor, and what it costs to run outside it — JT-012.
 *
 * Joe: *"it should start with invitation first, then let the user run with
 * whatever they want to do up to a point otherwise we risk breaking the balance
 * of the island. we then make the reward really really tough to reach if it
 * pushes imbalance further if its too far out of balance. with an
 * announcement."*
 *
 * Three things had to be true at once, and they are why the maths lives HERE,
 * in plain numbers, rather than in `governors.ts` or `flow.ts`:
 *
 *   1. The invitation and the price must fire at the same place. Fred's ask IS
 *      the announcement Joe required, so a price that started anywhere else
 *      would be a silent tax. `activeGovernor` and `pagesForEgg`/`sumsForTile`
 *      therefore call the SAME two step functions; there is no second copy of
 *      either threshold anywhere in the tree to drift.
 *   2. `cost` must stay ratio-blind. It is called from places that have no
 *      Flow, and a month of pacing tests pin it exactly as it is.
 *   3. `governors.ts` type-imports `Flow` from `flow.ts`, so a value import
 *      back the other way would be a genuine cycle. These take three numbers
 *      and no types, so neither file has to reach for the other.
 *
 *
 * ===========================================================================
 * THE GOVERNOR TUNING TABLE — JT-015. THE ONLY PLACE ANY OF THIS IS SET.
 * ===========================================================================
 *
 * Joe, JT-015: *"mark the location of this explicitly if user testing finds it
 * needs adjusting."* This is that mark. Every number below lives in the FIVE
 * lines of the `"governor"` block in `src/island/balance/balance.json`, and
 * nowhere else in the tree. Editing those five lines retunes the whole scheme;
 * no code, no test and no other file has to change with them. If a child in
 * testing is being nagged too early or charged too hard, that block is the dial.
 *
 *   WHAT                 SET TO           WHERE IN balance.json      RULING
 *   -------------------  ---------------  -------------------------  -------
 *   Target                2.0 tiles/pet   (not a knob — see below)   JT-013
 *   Warn wall, crowded    1.5 tiles/pet   corridor.crowded           JT-012
 *   Warn wall, empty      3.0 tiles/pet   corridor.empty             JT-012
 *   Price wall, crowded   1.2 tiles/pet   price.crowded              JT-014
 *   Price wall, empty     4.0 tiles/pet   price.empty                JT-014
 *   Grace, animals        5 animals       grace.pets                 JT-016
 *   Grace, tiles          10 tiles        grace.tiles                JT-016
 *   Escalation            +25% per step   escalation.slope           JT-012
 *   Ceiling               treble, never   escalation.capMultiple     JT-012
 *                         dearer
 *
 * HOW TO READ IT. The island wants about two tiles for every animal. Between
 * 1.5 and 3.0 tiles per animal nothing happens at all. Outside that, Fred SAYS
 * something — and only outside 1.2 and 4.0 does anything cost more, a quarter
 * more for each whole step further out, never more than three times list. The
 * first five animals and first ten tiles are free of all of it.
 *
 * >>> PROVISIONAL, JT-021 — THE TWO PRICE WALLS ARE THE NUMBERS MOST LIKELY TO
 * >>> MOVE, AND THIS IS THE MARK JOE ASKED FOR. He ratified them for now rather
 * >>> than settled them: *"lets keep for now, its very hard to predict and
 * >>> depends on play test. mark it in the code commentary so we find it easy if
 * >>> we need to change."* So `price.crowded` (1.2) and `price.empty` (4.0)
 * >>> stand AS SHIPPED and are expected to be retuned once a child has played
 * >>> against them. RETUNING IS A DATA EDIT to the `governor.price` line in
 * >>> `src/island/balance/balance.json` — no code change, no test rewrite,
 * >>> nothing else in the tree to touch. The same marker is on that line. The
 * >>> measurement below is an argument about HEADROOM, not about play: it says
 * >>> what these two values buy, not that they will feel right to a five-year-old.
 *
 * WHY THE PRICE WALL IS NOT THE WARN WALL (PB-042). They used to be the same
 * wall, so the sentence "you have rather a lot of friends" and the higher price
 * arrived in the same instant: they were told and billed together, and had no
 * move that was merely warned. The gap is the room to act on the warning.
 *
 * WHY 1.2 AND 4.0 — MEASURED, not chosen by eye. Both were fixed by walking
 * every island size 1..40 animals:
 *
 *   CROWDED. Standing exactly on the warn wall, at `fields = ceil(pets · 1.5)`,
 *   the wall leaves ZERO animals of headroom — at EVERY pet count 1..10, and in
 *   fact 1..40. `floor(fields / 1.5) - pets` is 0 every time. So one more egg
 *   at the moment Fred speaks was always already a charged egg. Widening the
 *   divisor buys headroom at about ONE SPARE ANIMAL PER 6 TILES (the gap is
 *   `floor(f/1.2) - floor(f/1.5)`, which grows by exactly 1 every 6 tiles). On
 *   the tenth-grid these numbers are tuned in, 1.2 is the TIGHTEST divisor that
 *   buys at least one spare animal at every size outside grace: 1.3 still leaves
 *   6 animals on 9 tiles with nothing spare, and 1.4 fails at 6, 7, 8, 10 and 12.
 *   (1.25 also clears the bar, failing only at 1, 2 and 4 animals — all of them
 *   deep inside grace where no wall exists. 1.2 was taken for the round number
 *   and the extra animal of room at the sizes a child actually plays.)
 *
 *   EMPTY. The empty side was tighter still: `emptySteps` is already 1 at the
 *   FIRST tile past the wall, for every pet count 1..12 — one hex too many and
 *   the next tile is dearer. 3.5 does not fix it, because at ONE animal the
 *   first overshoot is 4 tiles and `floor(3.5 · 1)` is 3, so it still costs a
 *   step; 3.75 fails there too. 4.0 is the SMALLEST multiplier that absorbs the
 *   first overshoot at every size, and what it buys is exactly ONE SPARE TILE
 *   PER ANIMAL (`floor(4p) - floor(3p) = p`, exactly, at every p).
 *
 * WHY THE TWO SIDES ARE NOT SYMMETRIC (JT-018). Joe: the crowded wall prices
 * EGGS, and animals come out of a limited stash — they cannot make more. The
 * empty wall prices TILES, and tiles are unlimited. Being generous about bare
 * land costs the island nothing, so the empty buffer is the wide one.
 *
 * WHAT IS NOT HERE. `emptySteps` and `crowdedSteps` still read `corridor` and
 * must keep doing so: they are the WARNING — the condition Fred speaks on — and
 * the price functions beside them are a separate pair on purpose. Pointing
 * either of them at `price` would collapse PB-042 back to one wall in silence.
 * ------------------------------------------------------------------------- */

/**
 * How many whole fields past the EMPTY wall the island stands — the tile's step
 * count. Zero unless they are genuinely out of balance.
 *
 * The first field past the wall is step 1, and that is exactly the field at
 * which Fred starts asking (`activeGovernor`), which is the coherence the card
 * required: `> 0` here and 'space-surplus' there are the same condition, not two
 * conditions that happen to agree today.
 *
 * `floor` because the largest field count that does NOT breach `empty · pets` is
 * `floor(empty · pets)`, whatever `empty` is retuned to.
 */
export const emptySteps = (habitableFields: number, pets: number): number =>
  Math.max(0, habitableFields - Math.floor(balance.governor.corridor.empty * pets))

/**
 * How many whole pets past the CROWDED wall the island stands — the egg's step
 * count. The mirror of `emptySteps`, and its exact mirror by construction.
 *
 * Measured in PETS rather than fields, because the egg is what gets dearer at
 * this wall and a pet is the thing they are buying. The most pets
 * `habitableFields` can hold without breaching is `floor(fields / crowded)`;
 * every pet beyond that is one step.
 */
export const crowdedSteps = (habitableFields: number, pets: number): number =>
  Math.max(0, pets - Math.floor(habitableFields / balance.governor.corridor.crowded))

/**
 * How many whole fields past the PRICE wall on the empty side — what the tile
 * actually gets charged for. `emptySteps`' shape exactly, one wall further out.
 *
 * Zero everywhere `emptySteps` is zero and for a stretch beyond it: the band
 * where Fred has asked them to read and the tile still costs list price. Never
 * greater than `emptySteps`, because `price.empty` is the outer wall — the
 * warning cannot arrive after the bill.
 */
export const emptyPriceSteps = (habitableFields: number, pets: number): number =>
  Math.max(0, habitableFields - Math.floor(balance.governor.price.empty * pets))

/**
 * How many whole pets past the PRICE wall on the crowded side — what the egg is
 * actually charged for. `crowdedSteps`' shape exactly, one wall further out.
 *
 * In PETS, for the same reason `crowdedSteps` is: the egg is what gets dearer
 * and an animal is the thing they are buying. The most animals `habitableFields`
 * can hold before the till opens is `floor(fields / price.crowded)`.
 */
export const crowdedPriceSteps = (habitableFields: number, pets: number): number =>
  Math.max(0, pets - Math.floor(habitableFields / balance.governor.price.crowded))

/**
 * Is the island still in its opening stretch, where no wall exists (JT-016)?
 *
 * AND, not OR, which is the same shape `inGracePeriod` has always had: grace
 * holds only while BOTH numbers are small, so it ends the moment either one
 * grows up. Five animals or ten tiles is still grace; a sixth animal ends it,
 * and so does an eleventh tile.
 *
 * Here rather than in `governors.ts` because it is a statement about two
 * numbers and the two numbers are in `balance.json` — the caller that has a
 * `Flow` can hand it `pets.length` and `tiles.size`.
 */
export const graceHolds = (pets: number, tiles: number): boolean =>
  pets <= balance.governor.grace.pets && tiles <= balance.governor.grace.tiles

/**
 * How many grass tiles they must ADD to get back inside the CROWDED warn wall —
 * the number Fred can say out loud instead of "you have rather a lot of
 * friends". Zero when they are already inside it.
 *
 * The exact inverse of `crowdedSteps` by construction, and tested as one:
 * adding this many fields makes `crowdedSteps` exactly 0, and adding one fewer
 * does not. `ceil` because the smallest field count that does NOT breach
 * `crowded · pets` is `ceil(crowded · pets)` — the mirror of the `floor` in
 * `crowdedSteps`, and it stays the mirror whatever `crowded` is retuned to.
 */
export const tilesShortOfCorridor = (habitableFields: number, pets: number): number =>
  Math.max(0, Math.ceil(pets * balance.governor.corridor.crowded) - habitableFields)

/**
 * How many animals they must ADD to get back inside the EMPTY warn wall — the
 * mirror of `tilesShortOfCorridor`, in the unit that side is measured in.
 * Zero when they are already inside it.
 *
 * The exact inverse of `emptySteps`, on the same terms: adding this many pets
 * drives it to 0 and one fewer does not. `ceil(fields / empty)` is the fewest
 * animals that carry `fields` without the land reading as bare.
 */
export const petsShortOfCorridor = (habitableFields: number, pets: number): number =>
  Math.max(0, Math.ceil(habitableFields / balance.governor.corridor.empty) - pets)

/**
 * What a reward costs, as a multiple of its list price, this many steps out.
 *
 * `1 + steps/4`, capped at 3: one step out is a quarter dearer, eight steps out
 * is treble and nothing is ever dearer than that. Inside the corridor `steps` is
 * 0 and this is exactly 1, so every price in a balanced island is the price it
 * has always been — the whole scheme is invisible until they leave the corridor.
 */
export function scarcityMultiplier(steps: number): number {
  const { slope, capMultiple } = balance.governor.escalation
  return Math.min(capMultiple, 1 + Math.max(0, steps) * slope)
}

/**
 * The nth thing of its kind, `steps` past its wall, in units.
 *
 * The multiplier goes on the EXACT curve and the quantum is applied once, at the
 * end — so every price is still a whole number of items and a multiple of `pay`,
 * the steps climb monotonically, and no price is rounded twice.
 */
export function costPast(curve: CostCurve, n: number, steps: number): number {
  const pay = Math.max(1, balance.pay.item)
  return pay * Math.round(exactCost(curve, n) * scarcityMultiplier(steps) / pay)
}

/** Pages needed for the nth egg when the island is `steps` past the crowded wall. */
export const eggCostPast = (n: number, steps: number): number =>
  costPast(balance.egg, n, steps)

/** Sums needed for the nth tile when the island is `steps` past the empty wall. */
export const tileCostPast = (n: number, steps: number): number =>
  costPast(balance.tile, n, steps)

/**
 * How many reading PAGES the progress toward an egg represents.
 *
 * `readProgress` is denominated in units and a page pays one item, so the two
 * are the same number only while an item is worth one unit — which it stopped
 * being at A7. Without this conversion the page index advances 0, 2, 4, 6 and
 * reads the four-long mix at every other slot: one find page in two, where the
 * data says one in four (`PB-038`, Joe's ruling JT-010(2)).
 *
 * Exact rather than rounded, because a reading page pays exactly one item.
 * `floor` guards only the case of a save re-denominated across a re-base
 * leaving a part-item behind, which cannot buy a page either.
 */
export const pagesRead = (readProgress: number): number =>
  Math.floor(readProgress / itemPay())

/**
 * Pages alternate find/build (§3), so reading practice is never all one shape.
 * Which kind the nth page of an egg is — the index is in PAGES, not units.
 */
export function pageKind(pageIndex: number): PageKind {
  const mix = balance.pages.mix
  return mix[pageIndex % mix.length] as PageKind
}

/**
 * The A6 report's thresholds, read through a function for the same reason
 * `itemPay` is: the dev overlay may replace `balance.report` wholesale after
 * import (see `applyDevBalance`), and a module that destructured it at load
 * time would go on reading the original and quietly ignore the tuning.
 */
export const reportRules = (): Balance['report'] => balance.report
