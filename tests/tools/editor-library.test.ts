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
  ALL_SHAPES, HULL_SHAPES, AXES, shapeRow, filterShapes, summarise,
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
