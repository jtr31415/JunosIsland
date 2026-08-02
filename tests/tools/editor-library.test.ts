/**
 * The parts-library picker's model, pinned where it can go quietly wrong.
 *
 * Two faults this repo has actually shipped are the reason for four of the seven
 * blocks below:
 *
 *   THE UNNAMED ELSE. A gallery once inherited another gallery's source because
 *   nothing asserted it was exhaustive over its union — `gallery-source.test.ts`
 *   holds that story. `ALL_SHAPES` is the same shape of risk with two sources
 *   instead of four, so the count is asserted against `PARTS_BANK.length +
 *   AUTHORED_PARTS.length` rather than against a number typed here. A shape added
 *   to either source is either in the picker or this file is red; there is no
 *   third outcome.
 *
 *   `form` AS A FILTER. It was measured NOT to discriminate and `query.ts`
 *   deleted it. The test that matters is not "form is absent from the code" —
 *   that is a grep, and a grep passes the day someone adds a default-on
 *   dropdown. It is that a filter on the REAL axes returns rows of MIXED forms,
 *   which is the same claim stated as behaviour and is what fails if the axes
 *   ever quietly collapse back onto the bucket.
 */
import { describe, it, expect } from 'vitest'
import {
  ALL_SHAPES, HULL_SHAPES, AXES, shapeRow, filterShapes, groupShapes, summarise,
  type ShapeRow,
} from '../../tools/workbench/public/editor/library'
import { PARTS_BANK } from '../../src/island/species/parts/bank.generated'
import { AUTHORED_PARTS } from '../../src/island/species/parts/authored'
import { OTHER_HULLS } from '../../src/island/species/parts/hulls'

describe('ALL_SHAPES is exhaustive over its union', () => {
  it('holds every bank shape and every authored shape, and nothing else', () => {
    expect(ALL_SHAPES.length,
      `${PARTS_BANK.length} bank + ${AUTHORED_PARTS.length} authored`)
      .toBe(PARTS_BANK.length + AUTHORED_PARTS.length)
  })

  it('reaches every id the bank can reach', () => {
    const listed = new Set(ALL_SHAPES.map(r => r.id))
    const missing = PARTS_BANK.map(p => p.id).filter(id => !listed.has(id))
    expect(missing, 'bank ids the picker would never show').toEqual([])
  })

  it('reaches every authored id', () => {
    const listed = new Set(ALL_SHAPES.map(r => r.id))
    const missing = AUTHORED_PARTS.map(p => p.id).filter(id => !listed.has(id))
    expect(missing, 'authored ids the picker would never show').toEqual([])
  })

  it('lists no id twice', () => {
    const ids = ALL_SHAPES.map(r => r.id)
    expect(new Set(ids).size, 'duplicate rows in the gallery').toBe(ids.length)
  })

  it('flags exactly the authored shapes as authored', () => {
    const authored = ALL_SHAPES.filter(r => r.authored).map(r => r.id).sort()
    expect(authored).toEqual(AUTHORED_PARTS.map(p => p.id).slice().sort())
    for (const id of authored) expect(id.startsWith('bespoke-'), id).toBe(true)
  })
})

describe('HULL_SHAPES offers every torso, not the default one', () => {
  it('is the full union, and the count is reported', () => {
    const ids = HULL_SHAPES.map(r => r.id)
    expect(ids.length,
      `torso options offered: ${ids.length} — ${ids.join(', ')}`)
      .toBe(new Set(ids).size)
    expect(ids.length,
      `a picker offering fewer than two torsos is not a picker: ${ids.join(', ')}`)
      .toBeGreaterThan(1)
  })

  it('contains the default cube', () => {
    expect(HULL_SHAPES.map(r => r.id)).toContain('box-03')
  })

  it('contains every member of OTHER_HULLS', () => {
    const ids = new Set(HULL_SHAPES.map(r => r.id))
    for (const [why, id] of Object.entries(OTHER_HULLS)) {
      expect(ids.has(id), `${why} hull ${id} is not offered`).toBe(true)
    }
  })

  it('contains every bank shape the pack used as a hull', () => {
    const fromBank = PARTS_BANK.filter(p => p.roles.includes('hull')).map(p => p.id)
    const ids = new Set(HULL_SHAPES.map(r => r.id))
    const missing = fromBank.filter(id => !ids.has(id))
    expect(missing, `hulls in the bank the picker drops (of ${fromBank.length})`).toEqual([])
  })

  it('marks every row a hull', () => {
    for (const r of HULL_SHAPES) expect(r.isHull, `${r.id} is offered as a torso`).toBe(true)
  })

  /**
   * `sink` is 0 for a shape with NO attachment, which is nine of the ten hulls.
   *
   * The tenth is `box-03`, and the exception is the classification working
   * rather than failing: `box-03` is `roles: ["hull", "oddment"]`, so the pack
   * both used the 1.250 cube as a torso and stacked a copy of it on something
   * else, sunk 0.472222. A shape is named for what it IS, and the same shape
   * doing two jobs carries the evidence of both. A picker that zeroed the sink
   * on every hull would be throwing that measurement away.
   */
  it('reads sink off the attachment, and 0 only where there is none', () => {
    const attached = new Map(PARTS_BANK.map(p => [p.id, p.attachment]))
    for (const r of HULL_SHAPES) {
      const a = attached.get(r.id) ?? null
      expect(r.sink, r.id).toBe(a === null ? 0 : a.sunkFractionMean)
    }
    const zeroed = HULL_SHAPES.filter(r => r.sink === 0).map(r => r.id)
    expect(zeroed.length,
      `hulls the pack never buried: ${zeroed.join(', ')}`)
      .toBe(HULL_SHAPES.length - 1)
    expect(shapeRow('box-03')!.sink, 'box-03 is also an oddment, and was sunk').toBe(0.472222)
  })
})

describe('filterShapes', () => {
  it('returns everything for an empty filter — the default view hides nothing', () => {
    const all = filterShapes(ALL_SHAPES, {})
    expect(all.length).toBe(ALL_SHAPES.length)
    expect(all.map(r => r.id)).toEqual(ALL_SHAPES.map(r => r.id))
  })

  it('is identity at the full range of every axis', () => {
    const all = filterShapes(ALL_SHAPES, {
      minTaper: AXES.taper[0], maxTaper: AXES.taper[1],
      minSink: AXES.sink[0], maxSink: AXES.sink[1],
      minLongest: AXES.longest[0], maxLongest: AXES.longest[1],
    })
    expect(all.length, 'sliders parked at full range excluded a row').toBe(ALL_SHAPES.length)
  })

  /**
   * THE POINT OF THE WHOLE FILE. `docs`' §3.2 acceptance query, restated on this
   * module's axes: small, tapering, and demonstrably buried. It must return the
   * hog's tusk (a `wedge`) and the hog's ear (a `cone`) together, which it can
   * only do because no arm of the filter consults `form`.
   */
  it('never consults form unless form is set — the real axes return MIXED forms', () => {
    const rows = filterShapes(ALL_SHAPES, { maxLongest: 0.5, maxTaper: 0.65, minSink: 0.1 })
    const forms = [...new Set(rows.map(r => r.form))].sort()
    expect(rows.length, 'the acceptance query returned nothing').toBeGreaterThan(1)
    expect(forms.length,
      `taper+sink+size returned one form only (${forms.join(', ')}) — form has crept back in`)
      .toBeGreaterThan(1)
  })

  it('narrows to one form only when form is explicitly set', () => {
    const axes = { maxLongest: 0.5, maxTaper: 0.65, minSink: 0.1 }
    const mixed = filterShapes(ALL_SHAPES, axes)
    const oneForm = mixed[0]!.form
    const narrowed = filterShapes(ALL_SHAPES, { ...axes, form: oneForm })
    expect(new Set(narrowed.map(r => r.form)).size).toBe(1)
    expect(narrowed.length,
      'setting form must LOSE rows — that is why it is off by default')
      .toBeLessThan(mixed.length)
  })

  it('matches text against the id and the donor species', () => {
    const byId = filterShapes(ALL_SHAPES, { text: 'box-03' })
    expect(byId.map(r => r.id)).toContain('box-03')

    const species = ALL_SHAPES.find(r => r.usedBy.length > 0)!.usedBy[0]!
    const bySpecies = filterShapes(ALL_SHAPES, { text: species })
    expect(bySpecies.length, `nothing matched the donor "${species}"`).toBeGreaterThan(0)
    for (const r of bySpecies) {
      const hit = r.id.includes(species) || r.usedBy.includes(species)
      expect(hit, `${r.id} matched "${species}" for no reason`).toBe(true)
    }
  })

  it('filters by role as a lookup into provenance', () => {
    const hulls = filterShapes(ALL_SHAPES, { role: 'hull' })
    expect(hulls.length).toBe(ALL_SHAPES.filter(r => r.isHull).length)
  })

  it('filters by symmetry, so a handed row can be found and mirrored', () => {
    for (const sym of ['mirror', 'radial', 'handed'] as const) {
      const rows = filterShapes(ALL_SHAPES, { symmetry: sym })
      for (const r of rows) expect(r.symmetry).toBe(sym)
    }
  })
})

/**
 * GROUPING IS NOT FILTERING.
 *
 * `form` was measured not to discriminate, so an `<optgroup>` over it is only
 * allowed to exist because it EXCLUDES NOTHING — the header block above says the
 * test that matters is behavioural, not a grep, and this is that test for the
 * dropdown: what goes in comes out, every row, once. Every count below is derived
 * from the data rather than typed here, so a form added to the bank tomorrow gets
 * a header instead of falling out of the list.
 */
describe('groupShapes gives the dropdown headers without losing a row', () => {
  const flat = (rows: readonly ShapeRow[]): ShapeRow[] => groupShapes(rows).flatMap(g => [...g.rows])

  /* Headers are ROLES now, on Joe's JT-038 ruling. The property below is
   * therefore no longer "a permutation of the input": three of the ninety-five
   * shapes carry two roles and appear under both, deliberately, because a shape
   * that is an ear AND a horn must be findable as either. So: every row at
   * least once, and once per role it holds. */
  it('loses no row, and repeats one only where the pack gave it two roles', () => {
    const out = flat(ALL_SHAPES)
    const seen = new Set(out.map(r => r.id))
    expect([...seen].sort(), 'a row reached no group at all')
      .toEqual(ALL_SHAPES.map(r => r.id).slice().sort())

    const expected = ALL_SHAPES.reduce((n, r) => n + Math.max(1, r.roles.length), 0)
    expect(out.length, 'a row appeared a different number of times than it has roles')
      .toBe(expected)

    /* The rows themselves, not copies of them — a group holds what it was given. */
    for (const r of out) expect(ALL_SHAPES.includes(r), r.id).toBe(true)
  })

  it('is exhaustive over the torso shells too', () => {
    const out = flat(HULL_SHAPES)
    expect([...new Set(out.map(r => r.id))].sort())
      .toEqual(HULL_SHAPES.map(r => r.id).slice().sort())
  })

  /* Asserted against the ROWS, never by parsing the label — a header is prose
   * ("Teeth", not "Tooths") and prose is not a key. Deriving the expectation
   * from the data means a role added to the bank is covered automatically. */
  it('gives each role exactly one group holding exactly that role\'s rows', () => {
    const groups = groupShapes(ALL_SHAPES)
    const roles = [...new Set(ALL_SHAPES.flatMap(r => r.roles))]
    for (const role of roles) {
      const want = ALL_SHAPES.filter(r => r.roles.includes(role)).map(r => r.id).sort()
      const matching = groups.filter(g =>
        JSON.stringify(g.rows.map(r => r.id).slice().sort()) === JSON.stringify(want))
      expect(matching.length, `role "${role}" has ${matching.length} groups, not 1`).toBe(1)
    }
    expect(groups.length, 'one group per role the data actually has').toBe(roles.length)
  })

  it('emits no empty group — a header over nothing is a drawer he cannot open', () => {
    for (const g of groupShapes(ALL_SHAPES)) {
      expect(g.rows.length, `"${g.label}" is a header over nothing`).toBeGreaterThan(0)
    }
  })

  it('orders the groups alphabetically by role, which needs no judgement call', () => {
    const labels = groupShapes(ALL_SHAPES).map(g => g.label.split(' (')[0]!)
    expect(labels).toEqual(labels.slice().sort())
  })

  it('heads each group with a plural and the count, so Joe knows the scroll', () => {
    for (const g of groupShapes(ALL_SHAPES)) {
      expect(g.label, `"${g.label}" does not carry its count`).toContain(`(${g.rows.length})`)
      expect(g.label[0], `"${g.label}" is not capitalised`).toBe(g.label[0]!.toUpperCase())
    }
    /* Headers are roles now (JT-038). Derived from the data, not typed here, so
     * a role added to the bank gets a header rather than failing this test. */
    const noses = ALL_SHAPES.filter(r => r.roles.includes('nose')).length
    expect(groupShapes(ALL_SHAPES).map(g => g.label)).toContain(`Noses (${noses})`)
    /* One row of a role is one row, and the header says so rather than "1 Noss". */
    const one = ALL_SHAPES.filter(r => r.roles.length === 1 && r.roles[0] === 'nose').slice(0, 1)
    expect(groupShapes(one)[0]!.label).toBe('Nose (1)')
  })

  it('sorts within a group by id NUMERICALLY: box-9 before box-10', () => {
    for (const g of groupShapes(ALL_SHAPES)) {
      const ids = g.rows.map(r => r.id)
      expect(ids, `"${g.label}" is out of order`).toEqual(ids.slice().sort())
    }

    /* The ids are zero-padded today, so the assertion above passes under a plain
     * string sort as well. Unpadded is where the two disagree, and the picker
     * must survive the day one is authored. */
    const box = ALL_SHAPES.find(r => r.form === 'box')!
    const unpadded = ['box-10', 'box-1', 'box-9'].map(id => ({ ...box, id }))
    expect(groupShapes(unpadded)[0]!.rows.map(r => r.id)).toEqual(['box-1', 'box-9', 'box-10'])
    expect(unpadded.map(r => r.id).sort(),
      'a plain string sort would have agreed, so this case proves nothing')
      .not.toEqual(['box-1', 'box-9', 'box-10'])
  })
})

describe('AXES span the data', () => {
  const trueSpan = (pick: (r: ShapeRow) => number): [number, number] => {
    const vs = ALL_SHAPES.map(pick)
    return [Math.min(...vs), Math.max(...vs)]
  }

  it('taper matches the true min and max', () => {
    expect(AXES.taper).toEqual(trueSpan(r => r.taper))
  })

  it('sink matches the true min and max', () => {
    expect(AXES.sink).toEqual(trueSpan(r => r.sink))
  })

  it('longest matches the true min and max', () => {
    expect(AXES.longest).toEqual(trueSpan(r => r.longest))
  })

  it('is a real interval on every axis, so a slider has somewhere to go', () => {
    for (const [name, [lo, hi]] of Object.entries(AXES)) {
      expect(hi, `${name} has no range at all`).toBeGreaterThan(lo)
    }
  })
})

describe('shapeRow', () => {
  it('resolves every id in ALL_SHAPES', () => {
    for (const r of ALL_SHAPES) {
      expect(shapeRow(r.id), `${r.id} is listed but not resolvable`).toBe(r)
    }
  })

  it('returns null rather than guessing', () => {
    expect(shapeRow('box-9999')).toBeNull()
    expect(shapeRow('')).toBeNull()
  })
})

describe('summarise', () => {
  it('reads as one line for every row', () => {
    for (const r of ALL_SHAPES) {
      const line = summarise(r)
      expect(line.includes('\n'), r.id).toBe(false)
      expect(line.startsWith(`${r.id} · `), line).toBe(true)
    }
  })

  it('calls the default cube a cube, untapered, a hull', () => {
    const line = summarise(shapeRow('box-03')!)
    expect(line).toContain('1.25 cube')
    expect(line).toContain('no taper')
    expect(line).toContain('hull')
    expect(line).toContain('seen on ')
  })

  it('says an authored shape has no donor', () => {
    const line = summarise(shapeRow('bespoke-sphere-01')!)
    expect(line).toContain('authored')
  })
})

/**
 * Headers became ROLES on JT-038, and the bank has a `tooth` role, so the
 * dropdown read "Tooths (8)" the moment the ruling shipped. This project's
 * whole subject is a child learning to read words; an invented plural on the
 * screen she is taught from is worse here than it would be anywhere else.
 */
describe('the headers are spelled the way a reading child would be taught', () => {
  it('says Teeth, not Tooths', () => {
    const labels = groupShapes(ALL_SHAPES).map(g => g.label)
    expect(labels.some(l => l.startsWith('Teeth ('))).toBe(true)
    expect(labels.some(l => l.startsWith('Tooths'))).toBe(false)
  })

  /* A shape whose ONLY role is tooth, so the single group is the tooth group.
   * Picking any shape with `tooth` among its roles is not enough: three of the
   * ninety-five carry two, and `ear` sorts first. */
  it('still says Tooth for exactly one', () => {
    const one = ALL_SHAPES.filter(r => r.roles.length === 1 && r.roles[0] === 'tooth').slice(0, 1)
    expect(one.length, 'no single-role tooth to test with').toBe(1)
    expect(groupShapes(one)[0]!.label).toBe('Tooth (1)')
  })

  it('leaves the regular spellings alone', () => {
    const labels = groupShapes(ALL_SHAPES).map(g => g.label.split(' (')[0])
    expect(labels).toContain('Noses')
    expect(labels).toContain('Ears')
    expect(labels).toContain('Tails')
  })
})
