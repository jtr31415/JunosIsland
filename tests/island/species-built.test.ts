/**
 * IS THERE AN ANIMAL HERE YET — the predicate the album's view is filtered on.
 *
 * Joe, 2 August: *"i can still see all the empty slots from the blocky animals
 * in the albums by the way. we should remove them all and they get built up as
 * soon as i push new animals to the game."*
 *
 * `album-built.test.ts` covers what the PAGE does with the answer. This file is
 * about the answer itself, and it has one job the behaviour suite cannot do:
 * **it is the thing that tells the next person what the album actually shows.**
 * Every count below was MEASURED by running it, not reasoned about, and every
 * one of them is written out by hand so that building an animal is a red line
 * with a number in it rather than a silent change of shape on a child's tablet.
 *
 * Three properties are load-bearing and are asserted separately from the counts:
 *
 *   1. THE FROZEN 24 ARE ALWAYS BUILT. Roster §1 freezes them and brief §19 says
 *      nothing a child owns is lost; a filter that dropped one of these would be
 *      the worst possible bug this change could have.
 *   2. ROSTER ORDER SURVIVES THE FILTER. `naming.ts` allocates given names over
 *      the full ratified roster precisely so that building a new animal cannot
 *      rename one a child already owns, so `builtIn` may only ever REMOVE
 *      members — never reorder them. Asserted as a subsequence, which is the
 *      exact statement of "filters and never reorders".
 *   3. `isBuilt` CANNOT DRIFT FROM THE ALBUM'S ABILITY TO DRAW. The last test
 *      re-derives the three drawable shapes from the literal kit names rather
 *      than from `KITS`, so adding a kit to the registry without building it is
 *      a failure here rather than a blank frame in the album.
 */
import { describe, it, expect } from 'vitest'
import { isBuilt, isReleased, builtIn } from '../../src/island/species/built'
import { BASE_SPECIES, speciesRecord } from '../../src/island/species/registry'
import { COLLECTIONS, collection } from '../../src/island/species/roster'

/** Every species in the roster, in roster order, across every collection. */
const ROSTER: readonly string[] = COLLECTIONS.flatMap(c => c.members)

const members = (id: string): readonly string[] => collection(id)?.members ?? []

/**
 * The three kits that are actually WRITTEN, named as literals.
 *
 * Deliberately not `Object.keys(KITS)`: `built.ts` asks `KITS` and this asserts
 * what `KITS` is allowed to contain, so importing it here would make the
 * tripwire agree with itself. `types.ts:45` declares six (`BUILT_KITS`) and
 * three of them — swim, minibeast, bespoke — throw by name in `buildSpecies`.
 * A record naming one of those draws a blank frame, which is the thing being
 * removed.
 */
const IMPLEMENTED_KITS: readonly string[] = ['quadruped', 'songbird', 'raptor']

/* ------------------------------------------------------------------ */

describe('isBuilt: has anybody actually made this animal', () => {
  it('says yes to every one of the frozen 24', () => {
    /*
     * They carry `kit: 'kenney'`, no `build` and no `assembly` — an authored GLB
     * that `pets.ts` loads. Roster §1 freezes them and this is the clause of
     * `isBuilt` that keeps them on the page.
     */
    expect(BASE_SPECIES).toHaveLength(24)
    for (const s of BASE_SPECIES) {
      expect(s.kit, s.id).toBe('kenney')
      expect(s.build, s.id).toBeUndefined()
      expect(s.assembly, s.id).toBeUndefined()
      expect(isBuilt(s.id), s.id).toBe(true)
    }
  })

  it('has no rostered species left without a record — and would still say no to one', () => {
    /*
     * THIS TEST IS INVERTED SINCE 6 AUGUST AND IT IS THE SAME TEST.
     *
     * It used to assert that at least one rostered id had no registry record,
     * and named Night Time's three as the live examples: `animal-bat` and
     * `animal-sugar-glider` wanting a membrane, `animal-scorpion` a pincer.
     * Those three were built, and they were the last three anywhere in the
     * roster, so the population this test was written over is now empty.
     *
     * An empty population makes the old `for` loop vacuous, so the assertion is
     * moved rather than deleted: the derivation stays (nothing is hard-coded),
     * the count is asserted at ZERO — which is a real claim that a roster
     * addition reopens — and the three are named again from the other side, so
     * the file still records which species this test was about. The `isBuilt`
     * clause it was guarding is exercised by the test below it, which asks about
     * a species the roster has never heard of.
     */
    const recordless = ROSTER.filter(id => speciesRecord(id) === undefined)
    expect(recordless).toEqual([])
    for (const id of recordless) expect(isBuilt(id), id).toBe(false)

    for (const id of ['animal-bat', 'animal-sugar-glider', 'animal-scorpion']) {
      expect(speciesRecord(id), `${id} lost its record`).toBeDefined()
      expect(isBuilt(id), id).toBe(true)
    }
  })

  it('says no to a species that is not in the roster at all', () => {
    // What a save from a later build can carry. `album.ts` still guesses at the
    // pack for such a PET; it must never draw an empty FRAME for one.
    expect(ROSTER).not.toContain('animal-from-the-future')
    expect(isBuilt('animal-from-the-future')).toBe(false)
    expect(isBuilt('')).toBe(false)
  })
})

/* ------------------------------------------------------------------ */

describe('builtIn: a collection\'s built members', () => {
  it('keeps them in ROSTER ORDER — it filters and never reorders', () => {
    /*
     * THE load-bearing property. `naming.ts:218` allocates given names over the
     * full ratified roster so that building a new animal cannot rename one a
     * child already owns; the same order is what makes a half-finished page
     * something two children can compare (roster §3, "playground currency").
     *
     * Stated as a SUBSEQUENCE, which is exactly "every member kept, in the order
     * the roster put them, with only removals" — a reorder passes a set
     * comparison and fails this.
     */
    for (const c of COLLECTIONS) {
      const roster = members(c.id)
      const built = builtIn(c.id)
      let at = 0
      for (const id of built) {
        at = roster.indexOf(id, at)
        expect(at, `${c.id}: ${id} is out of roster order`).toBeGreaterThan(-1)
        at++
      }
      expect(built.every(id => roster.includes(id)), c.id).toBe(true)
    }
  })

  it('answers an unknown collection with nothing rather than throwing', () => {
    // `builtIn(id).length > 0` is also the "this build can resolve that album"
    // test the album used to make separately — see `pages` in album.ts.
    expect(builtIn('atlantis')).toEqual([])
    expect(builtIn('')).toEqual([])
  })

  it('agrees with isReleased member by member', () => {
    /* It agreed with `isBuilt` until 4 August, when Joe asked for the album to
     * show only what has been pushed. `isBuilt` still answers "is there a picture
     * to draw"; `isReleased` adds "and can she actually be dealt it". This is the
     * assertion that keeps `builtIn` from becoming a second opinion on either. */
    for (const c of COLLECTIONS) {
      expect(builtIn(c.id), c.id).toEqual(members(c.id).filter(isReleased))
    }
  })
})

/* ------------------------------------------------------------------ */

describe('WHAT THE ALBUM SHOWS TODAY, collection by collection', () => {
  /*
   * >>> MEASURED, 2 August 2026. These are the frames a child sees, and this
   * >>> block is the only place in the tree that says so out loud.
   *
   * A number here changing is not a broken test — it is somebody having built an
   * animal, or having deleted one. Update the number, and know that you have
   * changed the page. `roster` is the ambition and never moves; `built` is what
   * exists.
   *
   * Note the two SURPRISES this measurement turned up, both of which contradict
   * commit 8f31619's "Garden is the only complete collection left":
   *
   *   - HOME PETS IS ALSO 16 OF 16, entirely on the assembly route.
   *   - AFRICA IS 1 OF 16 — `animal-crocodile` alone, built bespoke on the
   *     assembly kit. Fifteen frames went away there.
   *
   * >>> RE-MEASURED, 3 August 2026, after PB-074 merged. FARM IS 16 OF 16 and is
   * >>> the third complete collection. That is the whole of this update: sixteen
   * >>> animals that did not exist when the block above was written now do, so
   * >>> farm goes 0 -> 16, the total goes 68 -> 84, and farm becomes a sixth
   * >>> collection with frames — which makes it a sixth PAGE. Nothing here was
   * >>> loosened; the numbers were wrong because the world moved under them.
   *
   * >>> RE-MEASURED AGAIN, 4 August 2026, and this time the RULE changed rather
   * >>> than the world. Joe: *"i only want to see in the album the silhouette
   * >>> cards for the animals that have successfully pushed."* `builtIn` filters
   * >>> on RELEASED now — signed off, or one of the frozen base 24 that
   * >>> `dealPool` deals regardless — so this column counts what a child can
   * >>> actually be dealt rather than what somebody has modelled.
   * >>>
   * >>> Africa (1), Night Time (13) and Farm (16) go to ZERO and stop being
   * >>> pages: every animal in them is built and none is pushed. Home Pets is 15
   * >>> of 16 — `animal-rat` is built and waiting. The total goes 84 -> 53.
   * >>> Nothing was deleted and nothing regressed; the moment Joe pushes those
   * >>> collections the numbers come back on their own.
   */
  const PINNED: ReadonlyArray<readonly [string, number, number]> = [
    // collection            roster  released
    ['base', 24, 24],
    ['garden', 14, 14],
    ['home-pets', 16, 15],
    ['night-time', 16, 0],
    ['africa', 16, 0],
    ['farm', 16, 0],
    ['woodland', 16, 0],
    ['birds', 18, 0],
    ['ocean', 16, 0],
    ['critters', 16, 0],
    ['ice', 16, 0],
    ['outback', 16, 0],
    ['jungle', 16, 0],
    ['raptors', 16, 0],
    ['dinosaurs', 16, 0],
    ['prehistoric', 12, 0],
    ['legendary', 12, 0],
    ['near-threatened', 12, 0],
    ['vulnerable', 12, 0],
    ['endangered', 12, 0],
    ['critically-endangered', 12, 0],
  ]

  for (const [id, rostered, released] of PINNED) {
    it(`${id}: ${released} frames of ${rostered} rostered`, () => {
      expect(members(id), `${id} is not in the roster`).toHaveLength(rostered)
      expect(builtIn(id)).toHaveLength(released)
    })
  }

  it('pins every collection in the roster, so a new one cannot slip in unmeasured', () => {
    expect(PINNED.map(p => p[0]).sort()).toEqual(COLLECTIONS.map(c => c.id).sort())
  })

  it('is 277 modelled in total across the whole roster of 320', () => {
    // The one number to quote. Everything else on this page is an outline of
    // something nobody has drawn yet, and none of it is shown any more.
    //
    // >>> MOVING WHILE WOODLAND IS REBUILT (4 August 2026). `isBuilt` counts
    // >>> what somebody has MODELLED — not what a child can be dealt, which is
    // >>> the `released` column above and is still zero for Woodland. So this
    // >>> number climbs once per Woodland species and the table above does not
    // >>> move at all until Joe pushes them. 84 -> 87 with the three drafts a
    // >>> previous session left on disk.
    // >>> 213 SINCE 5 AUGUST. Four collections were assembled in parallel in one
    // >>> tree that day; JUNGLE is sixteen of them and its own header carries the
    // >>> separation work. `isBuilt` still counts what somebody has MODELLED, so
    // >>> the released column above does not move for any of them until Joe
    // >>> pushes. This number moves with whichever sibling lands last.
    // >>> 277 SINCE 5 AUGUST, and the +64 is five more collections assembled in
    // >>> parallel in the same tree: near threatened, raptors, vulnerable,
    // >>> critically endangered and endangered. Same reading as above — modelled
    // >>> is not released, so nothing on the table above moves until Joe pushes,
    // >>> and this number is whatever the tree held when the last sibling ran.
    // >>> 317 SINCE 6 AUGUST, and the +40 is PREHISTORIC (12), DINOSAURS (16)
    // >>> and the twelve species of LEGENDARY whose files are on the register.
    // >>> Set to what the tree ACTUALLY held when the DINOSAURS builder ran,
    // >>> with a sibling still landing, which is the only honest thing a shared
    // >>> count can be. Same reading as above: modelled is not released.
    // >>> 320 SINCE 6 AUGUST, and the +3 is NIGHT TIME's last three — the bat,
    // >>> the sugar glider and the scorpion, which were the last three unbuilt
    // >>> animals in the whole roster. **Built and rostered are now the same
    // >>> number**, which has never been true before and is worth noticing here
    // >>> rather than in a handoff: this assertion and the one above it are the
    // >>> same 320 for the first time, and the next thing that moves either is a
    // >>> collection being added to the roster. Nothing is RELEASED by it — the
    // >>> table above is unchanged, because modelled is still not pushed.
    expect(ROSTER).toHaveLength(320)
    expect(ROSTER.filter(isBuilt)).toHaveLength(320)
  })

  it('has exactly three collections with any frame at all', () => {
    /* The three that can be a PAGE. Everything else is not an album SHE CAN PLAY
     * yet — which since 4 August means pushed rather than merely modelled, so
     * Africa, Night Time and Farm dropped out together. The order is COLLECTIONS'
     * own, and this list grows again the moment Joe pushes one of them. */
    expect(COLLECTIONS.map(c => c.id).filter(id => builtIn(id).length > 0))
      .toEqual(['base', 'garden', 'home-pets'])
  })
})

/* ------------------------------------------------------------------ */

describe('the tripwire: isBuilt cannot drift from the ability to draw', () => {
  it('gives every built species a shape album.ts can actually make', () => {
    /*
     * `album.ts`'s `shapeOf` has three routes and no fourth: an assembly off
     * `parts/assembled/register.ts`, a kit build whose kit is WRITTEN, or the
     * island's own `preview` for the frozen pack. `isBuilt` saying yes to
     * anything else is a blank frame, which is the whole bug this change removed.
     *
     * The kit names are literals above rather than `Object.keys(KITS)`, so
     * declaring a kit without writing it fails here instead of shipping.
     */
    const built = ROSTER.filter(isBuilt)
    expect(built).toHaveLength(320)   // the whole roster is modelled now; see above

    for (const id of built) {
      const record = speciesRecord(id)
      expect(record, `${id} is 'built' with no registry record`).toBeDefined()
      const drawable = record?.assembly !== undefined
        || (record?.build !== undefined && IMPLEMENTED_KITS.includes(record.build.kit))
        || record?.kit === 'kenney'
      expect(drawable, `${id} has no shape album.ts can draw`).toBe(true)
    }
  })

  it('never calls a record built on a kit that throws by name', () => {
    /*
     * `buildSpecies` throws `UnbuiltKitError` for swim, minibeast and bespoke.
     * A record naming one of those and carrying no assembly is precisely the
     * "declared but not built" frame Joe asked to have taken away, so it must
     * not survive the filter — and today no such record exists at all.
     */
    for (const id of ROSTER) {
      const record = speciesRecord(id)
      if (!record?.build || record.assembly) continue
      expect(IMPLEMENTED_KITS, `${id} builds on an unwritten kit`)
        .toContain(record.build.kit)
    }
  })

  it('leaves nothing built outside the roster', () => {
    // `builtIn` walks the roster, so a record whose id the roster never heard of
    // is a frame no page can ever show. The registry and the roster agree today.
    const known = new Set(ROSTER)
    for (const c of COLLECTIONS) for (const id of builtIn(c.id)) expect(known.has(id)).toBe(true)
  })
})
