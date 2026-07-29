/**
 * The primitives sign-off bench: the join, the arithmetic, and the one promise
 * the surface rests on — that a regeneration cannot cost Joe a verdict.
 *
 * PB-036 phase 4. He looked at 72 procedurally-built animals, said they are too
 * square with legs and feet too big and inconsistent eyes, and then said of the
 * fix: *"i'd like to sign off the primitives to be used first."* Every field on
 * a row but two is a MEASUREMENT, rewritten wholesale whenever anyone measures
 * the Kenney pack again. Two are his. If that rewrite can drop one, the sign-off
 * is work a build step can destroy.
 *
 * The viewer is three.js and a DOM and cannot be asserted about from here. What
 * CAN be, and is what matters, is everything underneath it: which rows are
 * benched and in what order, how "3 of 8 signed off" is counted, what happens to
 * a verdict nobody understands, and whether the two models each row stands on
 * the turntable are real. `primitives.ts` is deliberately free of three.js so
 * that this file can exist.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  primitivesBench, primitivesProgress, regenerate, comparisonFor, allComparisons,
  signedOff, struck, PRIMITIVE_GROUPS, PACK_IDS, KIT_IDS, SIGNED_OFF, STRUCK,
  type PrimitiveRow,
} from '../../tools/workbench/public/primitives'
import { speciesRecord } from '../../src/island/species/registry'
import { buildSpecies } from '../../src/island/species/kit'

const REPO = resolve(__dirname, '../..')

/** A measured row, as an agent writes one: everything filled but his two. */
const row = (id: string, group: string, extra: Partial<PrimitiveRow> = {}): PrimitiveRow => ({
  id,
  group,
  title: `the title of ${id}`,
  question: `is ${id} right?`,
  packSays: `the pack says something about ${id}`,
  kitSays: `the kits do something else about ${id}`,
  gap: `they disagree about ${id}`,
  proposal: `change ${id}`,
  evidence: `some/file.ts:1-2`,
  signoff: '',
  note: '',
  ...extra,
})

describe('the bench is the rows, in the order he reads them', () => {
  it('groups in PRIMITIVE_GROUPS order, and keeps the file order inside a group', () => {
    /* Written to the bench deliberately out of order. Group order is this
     * build's; order WITHIN a group is the file's and is never touched, because
     * a row that moves under the cursor takes his place with it. */
    const bench = primitivesBench([
      row('limb-b', 'Limbs'), row('face-a', 'Face'), row('limb-a', 'Limbs'),
      row('edge-a', 'Edges'), row('face-b', 'Face'),
    ])
    /* `limb-b` before `limb-a` is the assertion, not a slip: the file put it
     * there, and inside a group the file's order is the only order. Sorting by
     * id here would look tidier and would move a row under his cursor. */
    expect(bench.map(p => p.id)).toEqual(['face-a', 'face-b', 'edge-a', 'limb-b', 'limb-a'])
  })

  it('benches a group this build has never heard of, last and marked', () => {
    const bench = primitivesBench([row('later', 'Snouts'), row('face-a', 'Face')])
    expect(bench.map(p => p.id)).toEqual(['face-a', 'later'])
    expect(bench[1]).toMatchObject({ group: 'Snouts', known: false, compare: null })
    /* Present, not hidden: the rows are written by agents that land ahead of the
     * viewer, so this is a real and temporary state, and dropping the row would
     * make the progress count a lie about how much is left. */
    expect(primitivesProgress(bench).ungrouped).toBe(1)
    expect(primitivesProgress(bench).total).toBe(2)
  })

  it('drops a row with no id at all — there is nothing a verdict could key to', () => {
    expect(primitivesBench([{ id: '' }, { id: '   ' }, row('face-a', 'Face')]).map(p => p.id))
      .toEqual(['face-a'])
  })

  it('carries every measured field across untouched, and trims nothing else', () => {
    const only = primitivesBench([row('face-a', 'Face', { signoff: SIGNED_OFF, note: 'his words' })])[0]!
    expect(only).toMatchObject({
      id: 'face-a', group: 'Face', known: true,
      title: 'the title of face-a', question: 'is face-a right?',
      packSays: 'the pack says something about face-a',
      kitSays: 'the kits do something else about face-a',
      gap: 'they disagree about face-a', proposal: 'change face-a',
      evidence: 'some/file.ts:1-2', signoff: SIGNED_OFF, note: 'his words', odd: false,
    })
  })
})

describe('the verdict, and the values that are not one', () => {
  it("counts only 'ok', and a refusal as the answer it is", () => {
    const p = primitivesProgress(primitivesBench([
      row('a', 'Face', { signoff: SIGNED_OFF }),
      row('b', 'Face', { signoff: STRUCK }),
      row('c', 'Face'),
      row('d', 'Face'),
    ]))
    /* A rejection is a decision he has made. Rolling it into "to go" would leave
     * the bench looking unfinished forever over questions he has answered. */
    expect(p).toMatchObject({ done: 1, struck: 1, total: 4, left: 2, label: '1 of 4 signed off' })
  })

  it('NEVER treats an unknown value as a tick, and says so out loud', () => {
    /* The file is hand-editable and is written by agents. `signoff: "yes"` must
     * not read as a sign-off, and it must not read as untouched either — both
     * are lies about what he has said. */
    const bench = primitivesBench([
      row('a', 'Face', { signoff: 'yes' }),
      row('b', 'Face', { signoff: 'OK' }),
      row('c', 'Face', { signoff: 'signed' }),
      row('d', 'Face', { signoff: SIGNED_OFF }),
    ])
    for (const id of ['a', 'b', 'c']) {
      const found = bench.find(p => p.id === id)!
      expect(signedOff(found), `${found.signoff} was counted as a sign-off`).toBe(false)
      expect(struck(found)).toBe(false)
      expect(found.odd, `${found.signoff} passed as an ordinary state`).toBe(true)
    }
    const p = primitivesProgress(bench)
    expect(p.done).toBe(1)
    expect(p.odd).toBe(3)
    /* And they are still outstanding work, not quietly finished. */
    expect(p.left).toBe(3)
  })

  it("'' is not odd — it is the state every row is born in", () => {
    const bench = primitivesBench([row('a', 'Face'), row('b', 'Face', { signoff: undefined })])
    expect(bench.every(p => p.odd)).toBe(false)
    expect(primitivesProgress(bench).odd).toBe(0)
    expect(primitivesProgress(bench).left).toBe(2)
  })
})

/*
 * THE CONTRACT. Every other test in this file is about the surface; this one is
 * about whether the surface is worth using.
 *
 * The measured fields are regenerated wholesale by whichever agent last went and
 * measured the pack. His `signoff` and his `note` must survive that, by `id`,
 * every time — the same promise `joe/names-audit.json` makes and the reason
 * `merge.mjs` exists at all. Here it is held for the path that does not go
 * through the API: an agent rewriting the file with `writeFileSync`, which is
 * how it really happens.
 */
describe('a regeneration cannot cost him a verdict', () => {
  const his = [
    row('eye-size', 'Face', { signoff: SIGNED_OFF, note: 'yes, but watch the small heads' }),
    row('eye-relief', 'Face', { signoff: STRUCK, note: 'not until the third geometry type is ruled on' }),
    row('leg-adopt', 'Limbs'),
  ]

  /** The same ids, every measured field rewritten, his two blank as generated. */
  const fresh = [
    row('eye-size', 'Face', { packSays: 'RE-MEASURED: 0.401 × 0.321', gap: 'RE-WORDED' }),
    row('eye-relief', 'Face', { packSays: 'RE-MEASURED', proposal: 'RE-WORDED' }),
    row('leg-adopt', 'Limbs', { evidence: 'RE-CITED' }),
    row('edge-bevel', 'Edges'),
  ]

  it('carries his two fields across by id while every other field changes', () => {
    const out = regenerate(fresh, his)
    const at = (id: string) => out.find(r => r.id === id)!

    expect(at('eye-size').signoff).toBe(SIGNED_OFF)
    expect(at('eye-size').note).toBe('yes, but watch the small heads')
    expect(at('eye-relief').signoff).toBe(STRUCK)
    expect(at('eye-relief').note).toBe('not until the third geometry type is ruled on')

    /* And the measurement really did move underneath them — otherwise this test
     * would pass against a regeneration that changed nothing at all. */
    expect(at('eye-size').packSays).toBe('RE-MEASURED: 0.401 × 0.321')
    expect(at('eye-size').gap).toBe('RE-WORDED')
    expect(at('eye-relief').proposal).toBe('RE-WORDED')
    expect(at('leg-adopt').evidence).toBe('RE-CITED')
    /* A row the measurement has only just produced arrives unjudged. */
    expect(at('edge-bevel')).toMatchObject({ signoff: '', note: '' })
  })

  it('ignores a signoff or a note an agent put in a generated row', () => {
    /* An agent has no business having an opinion about either, so a non-empty
     * one in a fresh row is a bug rather than an instruction — and it must not
     * be able to tick something on his behalf. */
    const forged = [row('eye-size', 'Face', { signoff: SIGNED_OFF, note: 'an agent decided' })]
    const out = regenerate(forged, [row('eye-size', 'Face', { signoff: '', note: '' })])
    expect(out[0]).toMatchObject({ signoff: '', note: '' })
  })

  it('keeps a judged row the fresh measurement has never heard of', () => {
    /* KEEP, the same rule `merge.mjs` applies, and the two must agree or the
     * answer depends on which route the writer took. A primitive that stopped
     * being measured has not stopped having been judged. */
    const out = regenerate([row('edge-bevel', 'Edges')], his)
    expect(out.map(r => r.id)).toEqual(['edge-bevel', 'eye-size', 'eye-relief', 'leg-adopt'])
    expect(out.find(r => r.id === 'eye-size')!.signoff).toBe(SIGNED_OFF)
    expect(out.find(r => r.id === 'eye-relief')!.note)
      .toBe('not until the third geometry type is ruled on')
  })

  it('survives being run twice, which is what actually happens', () => {
    const once = regenerate(fresh, his)
    const twice = regenerate(fresh, once)
    expect(twice).toEqual(once)
  })
})

/*
 * The side-by-side, which is the other half of the requirement.
 *
 * "The comparison must be VISIBLE, not just tabulated" — a number in a table is
 * not a thing anyone can sign off on. These assertions cannot see the canvas,
 * but they can prove the thing that would actually go wrong: a comparison naming
 * a species that does not exist, which at his review hour is a blank turntable
 * and a status line nobody can act on.
 */
describe('the two models each row stands side by side are real', () => {
  it('names a pack species the game actually deals a GLB for', () => {
    expect(PACK_IDS).toContain('animal-fox')
    for (const c of allComparisons()) {
      expect(PACK_IDS, `${c.packSpecies} is not in SPECIES`).toContain(c.packSpecies)
    }
  })

  it('names a kit species the registry actually BUILDS, and builds it', () => {
    for (const c of allComparisons()) {
      expect(KIT_IDS, `${c.kitSpecies} is not a built species`).toContain(c.kitSpecies)
      /* The real kit, called for real — the same claim the built bench rests on.
       * A record with no geometry in it is a blank right-hand side. */
      const record = speciesRecord(c.kitSpecies)!
      expect(record.build, `${c.kitSpecies} has no build spec`).toBeDefined()
      expect(buildSpecies(record.build!).children.length).toBeGreaterThan(0)
    }
  })

  it('lifts only parts the kit really names, so a leg is the same part both sides', () => {
    /* The whole force of the Limbs picture is that `leg-front-left` is a real
     * node in the pack AND the name the quadruped kit gives its own leg. If the
     * kit ever renames its parts, this fails here rather than at his review. */
    for (const c of allComparisons()) {
      if (!c.kitParts.length) continue
      const built = buildSpecies(speciesRecord(c.kitSpecies)!.build!)
      const names = new Set<string>()
      built.traverse(n => { if (n.name) names.add(n.name) })
      for (const part of c.kitParts) {
        expect(names.has(part), `${c.kitSpecies} has no part named ${part}`).toBe(true)
      }
    }
  })

  it('every group has a pair, so no group inherits another group data', () => {
    /* The `packsFor` lesson, one level down: three arms for four cases is how
     * the Built gallery ended up listing the props. */
    for (const group of PRIMITIVE_GROUPS) {
      expect(comparisonFor({ id: 'nothing-by-this-id', group }), `${group} has no comparison`)
        .not.toBeNull()
    }
    expect(comparisonFor({ id: 'nothing-by-this-id', group: 'Snouts' })).toBeNull()
  })

  it('says which side is which, in the same words the canvas is arranged in', () => {
    /* LEFT is the pack and RIGHT is the kit, always. The card prints `why`
     * verbatim, so if these two ever disagreed he would be reading the wrong
     * half of the picture and nothing would look wrong. */
    for (const c of allComparisons()) {
      expect(c.why).toMatch(/LEFT is the pack/)
      expect(c.why).toMatch(/RIGHT is the kit/)
    }
  })
})

/*
 * The rows as they ship, read off the seeder rather than retyped.
 *
 * `seed.mjs` holds the only copy of them — a `joe/primitives-audit.json`
 * committed beside a list in the seeder would be two copies of the same eight
 * rows and they would drift. So the seeder is what this asserts against, and a
 * row that loses its evidence or its group fails here.
 */
describe('the eight rows that ship', () => {
  const source = readFileSync(resolve(REPO, 'tools/workbench/seed.mjs'), 'utf8')
  const block = source.slice(source.indexOf('const PRIMITIVES ='), source.indexOf('const VOICES ='))

  it('seeds the file, so the bench opens with no agent and no manager running', () => {
    expect(source).toContain("put('joe/primitives-audit.json'")
    expect(source).toMatch(/schemaVersion: 1, rows: PRIMITIVES/)
  })

  it('carries the three face rows, the two edge rows and the three limb rows', () => {
    for (const id of [
      'eye-size', 'eye-relief', 'eye-collisions',
      'edge-shading', 'edge-bevel',
      'leg-adopt', 'tail-wing-adopt', 'body-stays-procedural',
    ]) {
      expect(block, `${id} is not seeded`).toContain(`id: '${id}'`)
    }
  })

  it('puts every row in a group this build has a heading and a picture for', () => {
    const groups = [...block.matchAll(/group: '([^']+)'/g)].map(m => m[1]!)
    expect(groups).toHaveLength(8)
    for (const g of groups) expect(PRIMITIVE_GROUPS as readonly string[]).toContain(g)
  })

  it('seeds every row unjudged — a seed that ticked something would be a forgery', () => {
    const verdicts = [...block.matchAll(/signoff: (.+),/g)].map(m => m[1])
    expect(verdicts).toHaveLength(8)
    expect(verdicts.every(v => v === "''")).toBe(true)
    expect([...block.matchAll(/note: (.+),/g)].every(m => m[1] === "''")).toBe(true)
  })

  it('cites its provenance on every row, because a number with no file:line is unauditable', () => {
    expect([...block.matchAll(/evidence: '/g)]).toHaveLength(8)
  })

  it('does NOT invent the rows nobody has measured yet', () => {
    /* Absent is the honest state. Leg length, leg thickness, foot size and
     * head:body have not been measured, and a plausible number in front of Joe
     * is the single worst thing this bench could contain, because he would sign
     * it off. */
    for (const id of ['leg-length', 'leg-thickness', 'foot-size', 'head-body']) {
      expect(block, `${id} was invented`).not.toContain(`id: '${id}'`)
    }
  })
})
