/**
 * The gallery of animals ASSEMBLED FROM PACK PARTS, and the labelling that is
 * the whole reason it is a separate gallery rather than a second list.
 *
 * `docs/building-animals-from-parts.md`, "The viewer must never let him compare
 * the wrong thing":
 *
 * > Animals built under this method are labelled distinctly and unmistakably
 * > from the scrapped kit builds, in the list and on the model. He has already
 * > been burned by a stale page once and by a gallery listing props once. An
 * > unlabelled side-by-side is worse than no side-by-side.
 *
 * That sentence is a testable claim and this file is where it is tested. Three
 * kinds of thing are asserted and they fail for three different reasons:
 *
 *   THE JOIN. `assembledRows` is the only place the assembler's output meets the
 *   roster's collection names, and it is fed fixtures here rather than the real
 *   bank, so the arithmetic is provable before a single animal has been built.
 *
 *   THE LABELS. `NEW_METHOD_MARK` and `KENNEY_NOTE` must not merely differ —
 *   neither may contain the other, in either direction, and neither may sit on
 *   the wrong half of the pair, because a label he can misread at a glance is no
 *   label at all. That is what "unmistakably" means when written down as an
 *   assertion. The pair it once guarded was assembled against the scrapped kit
 *   builds; those have no gallery now, so it guards the pair still on the
 *   turntable — ours against the pack's.
 *
 *   THE WIRING. The same guard `gallery-source.test.ts` and `anatomy.test.ts`
 *   keep: a gallery in the union with no `packsFor` arm, no tab, or another
 *   gallery's disk pack. This one is the hardest case that rule has faced — half
 *   of what it puts on the turntable IS `pets/animal-fox.glb` — so it claiming
 *   `pets` would look correct and would still be wrong.
 *
 * Nothing here imports `src/island/species/parts`. That module is written by the
 * assembly run and lands one species at a time; a test that could not run until
 * it existed would be a test that tells you nothing on the day you need it.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  assembledRows, filterRows, groupRows, groupHeading, countLabel, rowTitle,
  pairCard, flagNote, referenceOr,
  REFERENCE_ANIMALS, DEFAULT_REFERENCE, NEW_METHOD_MARK, NEW_METHOD_SHORT,
  APPROVER_TAB, KENNEY_NOTE,
  NOTHING_YET, FLAG_HEADING, FLAG_PREAMBLE, FLAG_GLYPH, OURS_PREFIX,
  type AssembledEntry,
} from '../../tools/workbench/public/assembled'
import { GALLERIES, packsFor, type Gallery, type Pack } from '../../tools/workbench/public/registry'
import { ANATOMY_SPECIES, petIdOf } from '../../tools/workbench/public/anatomy'
import { COLLECTIONS } from '../../src/island/species/roster'

const REPO = resolve(__dirname, '../..')

/** A collection id the roster really has, so the join has something to find. */
const GARDEN = COLLECTIONS.find(c => c.id === 'garden') ?? COLLECTIONS[0]!

const entry = (id: string, name: string, flag?: string): AssembledEntry =>
  ({ id, name, collection: GARDEN.id, ...(flag === undefined ? {} : { flag }) })

describe('ours and the pack are labelled so they cannot be confused', () => {
  /*
   * WHAT THIS BLOCK BECAME, AND WHY IT DID NOT SIMPLY SHRINK.
   *
   * It used to hold the two METHODS apart — assembled against the kit builds —
   * with a substring test in both directions, because 'ASSEMBLED' beside
   * 'ASSEMBLED (old)' is the sort of pair a tired eye reads as one word. There is
   * one method left: the seventy-two are scrapped and have no gallery, which
   * `gallery-source.test.ts` holds down.
   *
   * The requirement did not go with them. Joe: *"i like the side by side
   * comparison with an original animal, keep that."* Two models are still on that
   * turntable and one of them is Kenney's — so the pair that must never be
   * confused is now OURS against THE PACK's, and it is a harder pair than the one
   * this block started with, because both halves are on screen at once.
   */
  it('says what the live method IS, in a word, not merely that it is ours', () => {
    expect(NEW_METHOD_MARK).toMatch(/ASSEMBLED/)
    expect(NEW_METHOD_SHORT).toBe('ASSEMBLED')
  })

  /* The tab names the ACT, because the method is no longer a choice he is being
   * asked about: there is one kind of animal left and one thing to do with it. */
  it('names the tab for the act he is there to perform', () => {
    expect(APPROVER_TAB).toBe('Animals — approve')
    expect(APPROVER_TAB).toMatch(/approve/)
  })

  it('marks ours as ours, the way the anatomy view already does', () => {
    expect(OURS_PREFIX).toMatch(/OURS/)
    const [row] = assembledRows([entry('animal-hedgehog', 'hedgehog')])
    const card = pairCard(row!, DEFAULT_REFERENCE)
    /* Kenney's own name, PLAIN — no prefix, no decoration. It is a measurement. */
    expect(card.left).toBe(DEFAULT_REFERENCE)
    expect(card.left.startsWith(OURS_PREFIX)).toBe(false)
    /* Ours, marked. */
    expect(card.right).toBe(`${OURS_PREFIX}hedgehog`)
    expect(card.rightMeta).toContain(NEW_METHOD_MARK)
  })

  /*
   * AND THE TWO MARKS ARE DISJOINT, which is the assertion inherited from the
   * pair this block used to guard, pointed at the pair that is actually on screen.
   *
   * `not.toBe` would not do it: it passes for 'OURS' against 'OURS (ref)'.
   * Neither label may contain the other in either direction, or a glance at the
   * wrong half of the turntable is a glance he has no way to catch.
   */
  it('shares no substring between our mark and the pack own note', () => {
    expect(NEW_METHOD_MARK.toLowerCase().includes(KENNEY_NOTE.toLowerCase())).toBe(false)
    expect(KENNEY_NOTE.toLowerCase().includes(NEW_METHOD_MARK.toLowerCase())).toBe(false)
    expect(KENNEY_NOTE.includes(OURS_PREFIX)).toBe(false)
    expect(KENNEY_NOTE).toMatch(/Kenney/)
  })

  /*
   * The one that would actually catch a swap: the notes must be on the correct
   * halves. A card that puts Kenney's note under our model, or ours under his, is
   * wrong in the single way the whole side-by-side exists to prevent — and every
   * string in it would still be individually correct.
   */
  it('puts the pack note on the left half and ours on the right, never crossed', () => {
    const [row] = assembledRows([entry('animal-hedgehog', 'hedgehog')])
    const card = pairCard(row!, DEFAULT_REFERENCE)
    expect(card.leftMeta).toContain(KENNEY_NOTE)
    expect(card.leftMeta).toContain(`pets/${DEFAULT_REFERENCE}.glb`)
    expect(card.leftMeta).not.toContain(NEW_METHOD_MARK)
    expect(card.rightMeta).toContain(NEW_METHOD_MARK)
    expect(card.rightMeta).not.toContain(KENNEY_NOTE)
  })
})

describe('the rows: the assembler output joined to the roster', () => {
  it('resolves a collection id to the album page title', () => {
    const [row] = assembledRows([entry('animal-hedgehog', 'hedgehog')])
    expect(row!.collection).toBe(GARDEN.id)
    expect(row!.collectionName).toBe(GARDEN.name)
    expect(row!.unknownCollection).toBe(false)
  })

  /*
   * A build filed under a collection that does not exist is SHOWN and marked,
   * never dropped. Same rule as `approver.ts` benching a creature the audit file
   * has never heard of: hiding a real mistake makes every count on the page a lie.
   */
  it('shows a build filed under an unknown collection, and says so', () => {
    const [row] = assembledRows([{ id: 'animal-x', name: 'x', collection: 'no-such-collection' }])
    expect(row!.unknownCollection).toBe(true)
    expect(row!.collectionName).toBe('no-such-collection')
    expect(rowTitle(row!)).toMatch(/no collection the roster knows/)
  })

  it('keeps the assembler own order, because that is where his place is kept', () => {
    const rows = assembledRows([
      entry('animal-squirrel', 'squirrel'), entry('animal-hedgehog', 'hedgehog'),
    ])
    expect(rows.map(r => r.id)).toEqual(['animal-squirrel', 'animal-hedgehog'])
  })

  it('is empty without complaint, because that is the pilot normal state', () => {
    expect(assembledRows([])).toEqual([])
    expect(NOTHING_YET).toMatch(/one species at a time|one species/i)
    /* And it must say the list is honest rather than stale — the fault he reported. */
    expect(NOTHING_YET).toMatch(/not that the page is stale/)
  })
})

describe('the flag: the escape clause, made visible', () => {
  it('is set only when the build actually raised one', () => {
    const rows = assembledRows([
      entry('animal-hedgehog', 'hedgehog'),
      entry('animal-mole', 'mole', 'rule 3 (one mass): the snout is a second form.'),
      entry('animal-vole', 'vole', '   '),
    ])
    expect(rows[0]!.flagged).toBe(false)
    expect(rows[0]!.flag).toBe('')
    expect(rows[1]!.flagged).toBe(true)
    /* Whitespace is not an explanation, so it is not a flag. */
    expect(rows[2]!.flagged).toBe(false)
  })

  it('carries the build own words through unedited', () => {
    const words = 'rule 3 (one mass): the snout had to be a second form.'
    const [row] = assembledRows([entry('animal-mole', 'mole', words)])
    expect(flagNote(row!)).toContain(words)
    expect(flagNote(row!)).toContain(FLAG_PREAMBLE)
  })

  it('says nothing at all when there is nothing to say', () => {
    const [row] = assembledRows([entry('animal-hedgehog', 'hedgehog')])
    expect(flagNote(row!)).toBe('')
  })

  /*
   * It must read as a NOTE. The heading says so in as many words, because the
   * escape clause is the method working — *"build the best attempt and flag it"* —
   * and a flag dressed as a fault is one he learns to click past.
   */
  it('is worded as a deliberate note rather than an error', () => {
    expect(FLAG_HEADING).toMatch(/not an error/i)
    expect(FLAG_PREAMBLE).toMatch(/escape clause/i)
    expect(FLAG_GLYPH).toBe('⚑')
  })

  it('reaches the rail, the model and the heading, not just the card', () => {
    const rows = assembledRows([entry('animal-mole', 'mole', 'strained rule 3.')])
    expect(rowTitle(rows[0]!)).toContain(FLAG_GLYPH)
    expect(pairCard(rows[0]!, DEFAULT_REFERENCE).rightMeta).toContain(FLAG_GLYPH)
    expect(groupHeading(groupRows(rows)[0]!)).toContain(FLAG_GLYPH)
  })
})

describe('the rail: filtering, grouping and the counts', () => {
  const rows = assembledRows([
    entry('animal-hedgehog', 'hedgehog'),
    entry('animal-squirrel', 'squirrel', 'the brush tail arrived with its own node transform.'),
    { id: 'animal-goose', name: 'goose', collection: 'birds' },
  ])

  it('searches the id, the name, the collection and the flag', () => {
    expect(filterRows(rows, 'hedge').map(r => r.id)).toEqual(['animal-hedgehog'])
    expect(filterRows(rows, 'brush tail').map(r => r.id)).toEqual(['animal-squirrel'])
    expect(filterRows(rows, GARDEN.name.toLowerCase()).length).toBe(2)
    expect(filterRows(rows, '').length).toBe(rows.length)
  })

  it('groups by collection in first-seen order, counting the flags', () => {
    const groups = groupRows(rows)
    expect(groups.map(g => g.collection)).toEqual([GARDEN.id, 'birds'])
    expect(groups[0]!.items.length).toBe(2)
    expect(groups[0]!.flagged).toBe(1)
    expect(groups[1]!.flagged).toBe(0)
  })

  /* The heading wears the method's name, so the RAIL alone tells him which of
   * the two animal galleries he is in without reading the tab. */
  it('puts the method name in every group heading', () => {
    for (const group of groupRows(rows)) {
      expect(groupHeading(group)).toContain(NEW_METHOD_SHORT)
    }
  })

  /* Over the whole bench and never the filtered view — `drawProgress`'s rule:
   * a number that shrinks when he types cannot tell him how much there is. */
  it('counts the filtered view against the whole bench, not against itself', () => {
    /* Filtering the flagged animal off the screen does NOT take it out of the
     * flag count, which is the same rule `drawProgress` keeps about "to go". */
    expect(countLabel(rows, filterRows(rows, 'hedge'))).toBe(`1 of 3 assembled · 1 ${FLAG_GLYPH} flagged`)
    expect(countLabel(rows, rows)).toBe(`3 of 3 assembled · 1 ${FLAG_GLYPH} flagged`)
    expect(countLabel(rows.slice(0, 1), rows.slice(0, 1))).toBe('1 of 1 assembled')
  })
})

describe('the reference animal it stands beside', () => {
  it('is the fox by default, because that is the sentence the method is judged on', () => {
    expect(DEFAULT_REFERENCE).toBe('animal-fox')
    expect(REFERENCE_ANIMALS).toContain(DEFAULT_REFERENCE)
  })

  it('offers all 24 originals, each with a file actually on disk', () => {
    expect(REFERENCE_ANIMALS.length).toBe(ANATOMY_SPECIES.length)
    expect(new Set(REFERENCE_ANIMALS).size).toBe(REFERENCE_ANIMALS.length)
    for (const id of REFERENCE_ANIMALS) {
      expect(id.startsWith('animal-'), `${id} is not a loader id`).toBe(true)
      expect(existsSync(resolve(REPO, `src/island/public/pets/${id}.glb`)), `no GLB for ${id}`).toBe(true)
    }
    /* Derived from the anatomy list rather than typed again — two hand-kept
     * copies of a roster is the fault `registry.ts` opens by describing. */
    expect([...REFERENCE_ANIMALS]).toEqual(ANATOMY_SPECIES.map(petIdOf))
  })

  /*
   * A reference the loader cannot open falls back to the fox rather than 404ing.
   * Getting this wrong is SILENT: the dev server answers a missing GLB with
   * index.html and the only thing on screen is a JSON parse error about a `<`.
   */
  it('falls back to the fox for anything it cannot open', () => {
    expect(referenceOr('animal-panda')).toBe('animal-panda')
    expect(referenceOr('')).toBe(DEFAULT_REFERENCE)
    expect(referenceOr(null)).toBe(DEFAULT_REFERENCE)
    expect(referenceOr('fox')).toBe(DEFAULT_REFERENCE)          // the census id, not the loader's
    expect(referenceOr('animal-hedgehog')).toBe(DEFAULT_REFERENCE)  // ours, not the pack's
  })
})

describe('the card beside the canvas says which side is which', () => {
  const [row] = assembledRows([entry('animal-hedgehog', 'hedgehog')])

  it('names LEFT as the pack and RIGHT as ours, in those words', () => {
    const card = pairCard(row!, 'animal-panda')
    expect(card.why).toMatch(/LEFT is the pack — animal-panda/)
    expect(card.why).toMatch(/RIGHT is OURS — hedgehog \(animal-hedgehog\)/)
    expect(card.leftMeta).toContain('pets/animal-panda.glb')
  })

  /* The claim that makes the whole surface worth looking at, and the one the
   * viewer header argues at length: a baked preview is a copy, and a copy drifts.
   *
   * The scale claim is asserted here because it is the sentence that went FALSE
   * once `viewer.ts` stopped normalising: the card said both halves were scaled to
   * one unit tall long after both halves were being drawn at `SHARED_SCALE`, which
   * is the worst kind of stale — a page that looks right and reads wrong. So the
   * card must promise the shared scale and must NOT promise matched height. */
  it('promises nothing is baked, and says what the match actually is', () => {
    const card = pairCard(row!, DEFAULT_REFERENCE)
    expect(card.why).toMatch(/NOTHING IS BAKED/)
    expect(card.why).toMatch(/ONE shared scale/)
    expect(card.why).not.toMatch(/one unit tall/)
    expect(card.why).toMatch(/without looking like a guest/)
  })

  it('cannot be asked to stand something beside a model that is not there', () => {
    expect(pairCard(row!, 'animal-nonesuch').left).toBe(DEFAULT_REFERENCE)
  })
})

describe('the assembled gallery is registered, and claims nobody else pack', () => {
  it('is in the one list of galleries there is', () => {
    expect(GALLERIES).toContain('assembled')
  })

  /*
   * THE HARDEST CASE THIS RULE HAS FACED.
   *
   * Half of what this gallery puts on the turntable is `pets/animal-fox.glb`, a
   * real file in a real pack, so claiming `pets` would look obviously correct. It
   * is still wrong: the species gallery owns that pack and is where a missing or
   * unused pet file is reported ONCE. A second claim reports all 24 twice and
   * trips the cross-gallery guard below. This gallery borrows the fox to stand
   * something next to; it is not a listing of foxes.
   */
  it('draws from no disk pack of its own, though it shows a real pack file', () => {
    expect(packsFor('assembled' as Gallery)).toEqual([])
  })

  it('leaves the other four exactly as they were', () => {
    expect(packsFor('species')).toEqual(['pets'])
    expect(packsFor('tiles')).toEqual(['tiles'])
    expect(packsFor('props')).toEqual(['props', 'forest'])
    expect(packsFor('anatomy')).toEqual([])
  })

  it('never reaches another gallery data', () => {
    const seen = new Map<Pack, Gallery>()
    for (const gallery of GALLERIES) {
      for (const pack of packsFor(gallery)) {
        expect(seen.has(pack), `${pack} is claimed by ${seen.get(pack)} and ${gallery}`).toBe(false)
        seen.set(pack, gallery)
      }
    }
  })
})

describe('the chrome can reach it, and says which tab is which', () => {
  const html = (): string => readFileSync(resolve(REPO, 'tools/workbench/public/viewer.html'), 'utf8')

  /*
   * The card is `#creature` and not `#assembled`, which is worth a sentence
   * because the name does not match the gallery. It is the approver panel —
   * the name, the fact and the verdict — and `viewer.ts drawDetail()` routes
   * this gallery straight into `drawCreature()`. Naming the element the test
   * looks for after the gallery would have been tidier and would have asserted
   * the existence of something nothing draws into.
   */
  it('has a tab, a reference picker and a card to draw into', () => {
    expect(html()).toContain('data-gallery="assembled"')
    expect(html()).toContain('id="besidePick"')
    expect(html()).toContain('id="besideSelect"')
    expect(html()).toContain('id="creature"')
  })

  /*
   * THE LABELLING REQUIREMENT, ASSERTED AGAINST THE PAGE ITSELF.
   *
   * ONE tab of animals and one live method, which is the state the consolidation
   * of 29 July left behind. The caption quotes `APPROVER_TAB` rather than a
   * string typed here, so the page and the module cannot drift apart, and the two
   * captions that would mean he is looking at scrap are asserted ABSENT: the rule
   * is that he can never be looking at the scrapped seventy-two believing they are
   * the new work, and the cheapest way to guarantee that is that there is no
   * second animal tab to be looking at.
   */
  it('captions the one animal tab for the act, and offers no scrapped one', () => {
    expect(html()).toContain(`>${APPROVER_TAB}<`)
    /* The old captions are gone, not merely joined by a new one. */
    expect(html()).not.toContain('>Built animals<')
    expect(html()).not.toContain('SCRAPPED')
  })
})
