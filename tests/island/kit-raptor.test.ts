/**
 * The raptor kit, tested against the CONTRACT rather than against itself.
 *
 * Mirrors `kit-quadruped.test.ts` and `kit-songbird.test.ts` deliberately —
 * every assertion here is something `pets.ts` will actually do to the group, or
 * something roster §1 forbids. No renderer is needed and none is made: the kit
 * builds geometry and the test measures it, which is exactly what
 * `pets.ts:650-660` does before it decides a pet's keep-out radius and shadow.
 *
 * The four things this file proves that the two before it could not:
 *
 *   - THE HOOK IS THIS KIT'S AND NOBODY ELSE'S. `types.ts:172-180` left
 *     `'hooked'` out of `SongbirdBuild.beak` so an owl could not be smuggled in
 *     as a songbird, and a comment saying so is not a test. This file asserts
 *     it in two directions that both actually fail: a `@ts-expect-error` that
 *     breaks the TSC GATE the day `'hooked'` is added to the songbird (an
 *     unused-directive error is a hard failure under `strict`), and a runtime
 *     sweep proving no songbird beak value in existence emits a `beak-hook`
 *     while every raptor beak does.
 *   - THE UNIONS ARE CLOSED AND EXHAUSTIVELY HANDLED. Every list of values in
 *     this file is derived from a `Record<Union, true>` rather than written out
 *     as an array, so ADDING a value to `RaptorExtra` (or to `beak`, `wings`,
 *     `tail`) fails to compile here until it is listed — and then fails at
 *     runtime until the kit actually builds something for it. HANDOFF §6
 *     records the failure this closes: widening a value union is invisible to
 *     the compiler and surfaces as a creature that renders as nothing.
 *   - `talons` IS A DIAL AND NOT A FLAG. `types.ts` claims a boolean would give
 *     an osprey and a kestrel the same feet. That is a claim about geometry, so
 *     it is measured.
 *   - `fitRig`'S CONTRACT, restated for the part that could break it: ear tufts
 *     raise the raw silhouette, and the bird must still stand exactly
 *     `spec.height` tall with its feet on y = 0 and its centre on x and z.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildRaptor } from '../../src/island/species/kits/raptor'
import { buildSongbird } from '../../src/island/species/kits/songbird'
import { buildSpecies, KITS, paletteFor, UnbuiltKitError } from '../../src/island/species/kit'
import type {
  BuildSpec, KitPalette, RaptorBuild, RaptorExtra, SongbirdBuild,
} from '../../src/island/species/types'
import { flattenImported } from '../../src/island/lighting/index'
import type { SetPalette } from '../../src/island/variants/recolour'

/** Buzzard colours: brown back, cream barred front, yellow cere and feet. */
const PALETTE: KitPalette = { coat: 0x6b5240, belly: 0xf2e6d2, detail: 0xe0b23c, accent: 0x3a2c20 }

const spec = (over: Partial<RaptorBuild> = {}): RaptorBuild => ({
  kit: 'raptor',
  height: 1.9,
  body: 1,
  head: 1,
  legs: 1,
  beak: 'deep-hook',
  wings: 'broad',
  tail: 'fan',
  talons: 1,
  palette: PALETTE,
  ...over,
})

/*
 * EVERY UNION, WRITTEN AS A TOTAL RECORD RATHER THAN AS AN ARRAY.
 *
 * This is the difference between a test that notices a widened union and one
 * that does not. `RaptorExtra[]` written out by hand stays green forever when
 * an eleventh extra is added and never built — the exact failure HANDOFF §6
 * describes. `Record<RaptorExtra, true>` does not compile until the new value
 * is listed here, and once it is listed every test below runs against it, so
 * "declared but silently ignored" cannot survive both gates.
 */
const EVERY_BEAK: Record<RaptorBuild['beak'], true> = {
  'deep-hook': true, 'notched-hook': true, 'small-hook': true,
}
const EVERY_WING: Record<RaptorBuild['wings'], true> = {
  broad: true, pointed: true, rounded: true,
}
const EVERY_TAIL: Record<RaptorBuild['tail'], true> = {
  fan: true, square: true, long: true, wedge: true, forked: true,
}
const EVERY_EXTRA: Record<RaptorExtra, true> = {
  'facial-disc': true, 'ear-tufts': true, brow: true, crest: true, hood: true,
  moustache: true, 'barred-breast': true, 'tail-bands': true, speckles: true,
  trousers: true,
}

const ALL_BEAKS = Object.keys(EVERY_BEAK) as RaptorBuild['beak'][]
const ALL_WINGS = Object.keys(EVERY_WING) as RaptorBuild['wings'][]
const ALL_TAILS = Object.keys(EVERY_TAIL) as RaptorBuild['tail'][]
const ALL_EXTRAS = Object.keys(EVERY_EXTRA) as RaptorExtra[]

/** The songbird's own beak list, for the "the hook is not yours" sweep below. */
const SONGBIRD_BEAKS: Record<SongbirdBuild['beak'], true> = {
  fine: true, short: true, stout: true, long: true, flat: true, dagger: true,
}

const measure = (g: THREE.Object3D): THREE.Box3 => {
  g.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(g)
}

const dims = (g: THREE.Object3D): [number, number, number] => {
  const b = measure(g)
  return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]
}

/** What `pets.ts:652` will charge this bird: `max(width, depth) / 2`. */
const keepOut = (g: THREE.Object3D): number => {
  const [w, , d] = dims(g)
  return Math.max(w as number, d as number) / 2
}

const names = (g: THREE.Object3D): Set<string> => {
  const out = new Set<string>()
  g.traverse(n => out.add(n.name))
  return out
}

const part = (g: THREE.Object3D, name: string): THREE.Box3 => {
  let hit: THREE.Object3D | undefined
  g.traverse(n => { if (n.name === name) hit = n })
  if (!hit) throw new Error(`no part named ${name}`)
  return measure(hit)
}

/**
 * Enough of a built group to tell two of them apart.
 *
 * Vertex count AND names AND measurements together, because any one alone can
 * collide: two beak shapes can share a vertex count, and the height fit means
 * every variant ends up exactly `spec.height` tall so height alone proves
 * nothing at all.
 */
const signature = (g: THREE.Object3D): string => {
  let verts = 0
  const found: string[] = []
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) {
      const geo = (n as THREE.Mesh).geometry
      verts += geo.getAttribute('position').count
      found.push(n.name)
    }
  })
  return `${verts}|${found.sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

describe('the built group survives what pets.ts does to it', () => {
  it('is finite, non-empty, feet on the ground and centred on x/z', () => {
    const box = measure(buildRaptor(spec()))
    for (const v of [box.min, box.max]) {
      for (const n of [v.x, v.y, v.z]) expect(Number.isFinite(n)).toBe(true)
    }
    expect(box.isEmpty()).toBe(false)
    expect(box.min.y).toBeCloseTo(0, 6)
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(0, 6)
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(0, 6)
  })

  it('holds fitRig\'s contract with every tail, wing, talon and extra it owns', () => {
    /*
     * `fitRig` promises three things at once — feet on y = 0, centred on x and
     * z, and exactly `height` tall INCLUDING whatever the parts added — and the
     * parts that could break each are different. Ear tufts and a hard-cocked
     * tail raise the top; big talons and a low stance move the bottom; a
     * splayed forked tail and a one-sided part move the centre. So the promise
     * is checked across the whole cross-product rather than on one bird.
     */
    const cases: RaptorBuild[] = [
      spec({ extras: ['ear-tufts'] }),
      spec({ tail: 'long', talons: 2.2, legs: 2, extras: ['ear-tufts', 'crest', 'trousers'] }),
      spec({ tail: 'forked', wings: 'pointed', talons: 0.2, legs: 0.3 }),
      spec({ height: 2.6, head: 1.7, extras: ['facial-disc', 'hood', 'tail-bands'] }),
      spec({ height: 1.2, body: 0.6, head: 0.6, extras: ['speckles', 'moustache', 'brow'] }),
    ]
    for (const [i, s] of cases.entries()) {
      const b = measure(buildRaptor(s))
      expect(b.min.y, `case ${i} feet`).toBeCloseTo(0, 6)
      expect((b.min.x + b.max.x) / 2, `case ${i} x centre`).toBeCloseTo(0, 6)
      expect((b.min.z + b.max.z) / 2, `case ${i} z centre`).toBeCloseTo(0, 6)
      expect(b.max.y - b.min.y, `case ${i} height`).toBeCloseTo(s.height, 6)
    }
  })

  it('stands exactly as tall as the spec asks, tufts and all', () => {
    for (const h of [1.2, 1.45, 1.9, 2.2, 2.6]) {
      expect(dims(buildRaptor(spec({ height: h })))[1]).toBeCloseTo(h, 6)
      // The same height WITH ear tufts on: the tufts raise the raw silhouette,
      // so the fit scale must drop to pay for them rather than the bird growing.
      expect(dims(buildRaptor(spec({ height: h, extras: ['ear-tufts'] })))[1]).toBeCloseTo(h, 6)
    }
    // And the tufts really did cost something — a taller raw silhouette at the
    // same fitted height means a SMALLER bird under the tufts, which is the
    // whole point of `fitRig` being uniform.
    const plain = dims(buildRaptor(spec({ height: 1.9 })))
    const tufted = dims(buildRaptor(spec({ height: 1.9, extras: ['ear-tufts'] })))
    expect(tufted[0]).toBeLessThan(plain[0] as number)
  })

  it('clamps a mad spec instead of building a monument', () => {
    const mad = buildRaptor(spec({ height: 100, body: 100, head: 100, legs: 100, talons: 100 }))
    const [w, h] = dims(mad)
    expect(h).toBeCloseTo(2.6, 6)
    expect(w).toBeLessThan(h as number)
    // Clamped proportions, not just a clamped height. `pets.ts:652` is what
    // this protects: a keep-out of 50 is a pet that can never path anywhere.
    expect(keepOut(mad)).toBeLessThan(1.6)

    // Negative is the other half of the same fault, and a negative scale is
    // worse than a big one: it inverts a mesh's winding.
    const negative = buildRaptor(spec({ height: -5, body: -5, head: -5, legs: -5, talons: -5 }))
    for (const n of dims(negative)) expect(n).toBeGreaterThan(0)
    expect(dims(negative)[1]).toBeCloseTo(1.2, 6)
    negative.traverse(n => {
      for (const v of [n.scale.x, n.scale.y, n.scale.z]) expect(v).toBeGreaterThan(0)
    })

    // NaN in the data must not reach a transform — pets.ts measures a Box3 off
    // this and a NaN there poisons the keep-out radius for the whole field.
    const broken = dims(buildRaptor(spec({
      height: Number.NaN, body: Number.NaN, head: Number.NaN, talons: Number.NaN,
    })))
    for (const n of broken) expect(Number.isFinite(n)).toBe(true)
  })

  it('names exactly two nodes wing-, left then right, with no authored roll', () => {
    /*
     * `pets.ts:690` collects flap targets with `/^wing-/` and `pets.ts:858`
     * then sets `wing.rotation.z = (i % 2 ? -1 : 1) * beat * 0.5` on each, BY
     * TRAVERSAL INDEX. A third matching node shifts the parity and makes the
     * right wing beat with the left; any `rotation.z` this kit authors on a
     * wing is thrown away on the first animated frame.
     *
     * The songbird kit had to rename its `wing-bar` extra to `wingbar-*` to
     * honour this, and that near-miss cost phase 3 a red test. This kit has no
     * part whose natural name begins `wing-` at all, which is the cheaper fix,
     * and this assertion is what keeps it that way — including across every
     * extra, since an extra is where the next one would come from.
     */
    for (const wings of ALL_WINGS) {
      const found: string[] = []
      buildRaptor(spec({ wings, extras: ALL_EXTRAS.slice(0, 3) }))
        .traverse(n => { if (/^wing-/.test(n.name)) found.push(n.name) })
      expect(found, `wings '${wings}'`).toEqual(['wing-left', 'wing-right'])
    }
    for (const e of ALL_EXTRAS) {
      const found: string[] = []
      buildRaptor(spec({ extras: [e] })).traverse(n => { if (/^wing-/.test(n.name)) found.push(n.name) })
      expect(found, `extra '${e}' added a flap target`).toEqual(['wing-left', 'wing-right'])
    }
    const g = buildRaptor(spec({ wings: 'pointed' }))
    g.traverse(n => { if (/^wing-/.test(n.name)) expect(n.rotation.z).toBe(0) })
  })

  it('is made of boxes and lumps and nothing else', () => {
    // `src/` contains no ConeGeometry, CylinderGeometry or CapsuleGeometry
    // anywhere, and a HOOKED beak is the part that most invites the first one.
    // The chunky flat Kenney read is the whole reason.
    for (const beak of ALL_BEAKS) {
      buildRaptor(spec({ beak, extras: ['facial-disc', 'ear-tufts', 'crest'] })).traverse(n => {
        const geo = (n as THREE.Mesh).geometry
        if (!geo) return
        expect(['BoxGeometry', 'SphereGeometry'], `${n.name} is a ${geo.type}`).toContain(geo.type)
      })
    }
  })

  it('leaves the returned root at identity — pets.ts:643 owns its scale', () => {
    const root = buildRaptor(spec({ height: 2.2 }))
    expect(root.name).toBe('raptor')
    expect(root.scale.toArray()).toEqual([1, 1, 1])
    expect(root.position.toArray()).toEqual([0, 0, 0])
  })

  it('sets userData.pick on nothing — pets.ts:663 owns it', () => {
    buildRaptor(spec({ extras: ['facial-disc', 'hood', 'crest'] })).traverse(n => {
      expect(n.userData.pick).toBeUndefined()
    })
  })

  it('gives its parts stable, findable names', () => {
    /*
     * THE NAMES ARE THE INTERFACE. The collection agent reads them to reason
     * about a species, `pets.ts:690` reads `wing-*`, and the songbird kit's
     * `wingbar-*` / `wing-bar-*` mix-up cost phase 3 a red test — so the whole
     * emitted vocabulary is pinned here rather than left to be discovered.
     */
    const found = names(buildRaptor(spec({ beak: 'notched-hook' })))
    for (const want of [
      'raptor', 'rig', 'body', 'breast', 'head',
      'beak', 'beak-hook', 'beak-tooth',
      'eye-left', 'eye-right', 'pupil-left', 'pupil-right',
      'leg-left', 'leg-right', 'foot-left', 'foot-right',
      'talon-left-1', 'talon-left-2', 'talon-left-3',
      'talon-right-1', 'talon-right-2', 'talon-right-3',
      'wing-left', 'wing-right', 'tail', 'tail-tip',
    ]) expect(found.has(want), `missing '${want}'`).toBe(true)

    // `beak-tooth` is the falcon's alone and must not appear on a hawk.
    expect(names(buildRaptor(spec({ beak: 'deep-hook' }))).has('beak-tooth')).toBe(false)
    expect(names(buildRaptor(spec({ beak: 'small-hook' }))).has('beak-tooth')).toBe(false)

    // The forked tail is the one that splits into two named blades.
    const kite = names(buildRaptor(spec({ tail: 'forked' })))
    expect(kite.has('tail-left') && kite.has('tail-right')).toBe(true)
    expect(kite.has('tail')).toBe(false)
  })

  it('leaves no part buried inside another part', () => {
    /*
     * THE BUG THIS EXISTS FOR, inherited from the quadruped kit: the first
     * build there put both eye whites entirely inside the skull, and every
     * other assertion passed — finite, centred, the right height, the right
     * materials — while the pet had no face. The songbird kit then found the
     * same fault twice more.
     *
     * Run at both head extremes because this kit's head moves a long way: an
     * owl at `head: 1.7` swallows parts that clear a sparrowhawk's skull.
     */
    for (const head of [0.6, 1, 1.7]) {
      const g = buildRaptor(spec({ head, talons: 1 }))
      const pairs: [string, string][] = [
        ['eye-left', 'head'], ['eye-right', 'head'], ['pupil-left', 'head'],
        ['beak', 'head'], ['beak-hook', 'head'], ['beak-hook', 'beak'],
        ['breast', 'body'], ['tail', 'body'],
        ['wing-left', 'body'], ['wing-right', 'body'],
        ['foot-left', 'leg-left'], ['foot-right', 'leg-right'],
        ['talon-left-1', 'foot-left'], ['talon-right-3', 'foot-right'],
      ]
      for (const [inner, outer] of pairs) {
        expect(
          part(g, outer).containsBox(part(g, inner)),
          `head ${head}: ${inner} is inside ${outer}`,
        ).toBe(false)
      }
      /*
       * And the face clears the TORSO, not just the skull. This is the check
       * that caught the real defect while this kit was being built: at
       * `head: 0.6` the head sat low and short enough that the whole face fell
       * inside the merged box of the body and the breast, so the beak and the
       * eyes were real geometry no camera could reach — and every other
       * assertion in this file still passed.
       */
      const torso = part(g, 'body').clone().union(part(g, 'breast'))
      for (const n of ['head', 'beak', 'beak-hook', 'eye-left', 'pupil-right']) {
        expect(torso.containsBox(part(g, n)), `head ${head}: ${n} is inside the torso`).toBe(false)
      }
    }
  })
})

describe('the hook belongs to this kit and to no other', () => {
  /*
   * `types.ts:172-180`: "`'hooked'` is deliberately absent [from
   * `SongbirdBuild`]. A hooked beak is the single strongest read of a bird of
   * prey, and the raptor kit is the one that owns it. Adding it here would let
   * an owl be built as a songbird with a hook on."
   *
   * A comment is not a test, and this decision is only worth anything if
   * breaking it turns something red. So it is asserted three ways.
   */

  it('will not compile if `hooked` is ever added to SongbirdBuild', () => {
    /*
     * A TSC-GATE ASSERTION, not a runtime one. `@ts-expect-error` requires an
     * error on the next line; the day someone widens `SongbirdBuild['beak']` to
     * include `'hooked'`, the error disappears and TypeScript reports "Unused
     * '@ts-expect-error' directive", which fails `npx tsc --noEmit`.
     *
     * This is the only mechanism available that fails on a WIDENING. HANDOFF §6
     * is explicit that widening a value union is otherwise invisible to the
     * compiler.
     */
    // @ts-expect-error 'hooked' belongs to RaptorBuild, never to SongbirdBuild
    const smuggled: SongbirdBuild['beak'] = 'hooked'
    expect(smuggled).toBe('hooked')
  })

  it('emits a beak-hook for every raptor beak and for no songbird beak', () => {
    for (const beak of ALL_BEAKS) {
      expect(names(buildRaptor(spec({ beak }))).has('beak-hook'), `raptor '${beak}'`).toBe(true)
    }
    const songbird = (beak: SongbirdBuild['beak']): Set<string> => names(buildSongbird({
      kit: 'songbird', height: 1.6, body: 1, head: 1, legs: 1, neck: 0,
      beak, tail: 'fan', wings: 'folded', palette: PALETTE,
    }))
    for (const beak of Object.keys(SONGBIRD_BEAKS) as SongbirdBuild['beak'][]) {
      const found = songbird(beak)
      expect(found.has('beak-hook'), `songbird '${beak}' grew a hook`).toBe(false)
      expect(found.has('beak-tooth'), `songbird '${beak}' grew a tooth`).toBe(false)
      // And it does have a plain beak, so the check above is not passing
      // vacuously on a bird with no beak at all.
      expect(found.has('beak'), `songbird '${beak}' has no beak`).toBe(true)
    }
  })

  it('hangs the hook BELOW and BEYOND the beak, which is what makes it a hook', () => {
    /*
     * Name-checking `beak-hook` proves a node exists; it does not prove the
     * node is a hook. A box sitting flush on the end of the beak would pass
     * every assertion above and read as a longer straight beak — which is a
     * gannet, not an eagle. So the geometry is measured: the hook's lowest
     * point is below the beak's, and its furthest point is in front of the
     * beak's.
     */
    for (const beak of ALL_BEAKS) {
      const g = buildRaptor(spec({ beak }))
      const base = part(g, 'beak')
      const hook = part(g, 'beak-hook')
      expect(hook.min.y, `'${beak}' hook does not drop below the beak`).toBeLessThan(base.min.y)
      expect(hook.max.z, `'${beak}' hook does not reach past the beak`).toBeGreaterThan(base.max.z)
      // And the hook overlaps the base rather than floating off it, or the two
      // boxes read as a beak and a crumb rather than as one curve.
      expect(hook.min.z).toBeLessThan(base.max.z)
    }
  })
})

describe('no part of the data is a silent no-op', () => {
  it('builds a distinguishable raptor for every beak value', () => {
    const seen = new Map<string, string>()
    for (const beak of ALL_BEAKS) {
      const sig = signature(buildRaptor(spec({ beak })))
      expect(seen.has(sig), `beak '${beak}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, beak)
    }
  })

  it('builds a distinguishable raptor for every wings value', () => {
    const seen = new Map<string, string>()
    for (const wings of ALL_WINGS) {
      const sig = signature(buildRaptor(spec({ wings })))
      expect(seen.has(sig), `wings '${wings}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, wings)
    }
  })

  it('builds a distinguishable raptor for every tail value', () => {
    const seen = new Map<string, string>()
    for (const tail of ALL_TAILS) {
      const sig = signature(buildRaptor(spec({ tail })))
      expect(seen.has(sig), `tail '${tail}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, tail)
    }
  })

  it('builds NEW, NAMED geometry for every one of the extras, and nothing twice', () => {
    /*
     * THE ASSERTION HANDOFF §6 ASKS FOR, and the reason `ALL_EXTRAS` is derived
     * from a total `Record` at the top of this file rather than typed out.
     *
     * A widened union is invisible to the compiler; the failure surfaces weeks
     * later as a creature that renders as nothing. Two gates close it: the
     * `Record<RaptorExtra, true>` does not compile until a new value is listed,
     * and this test then fails until the kit's `switch` actually builds
     * something for it — checked on the NAMES that appeared, not only on a
     * signature, because a silently-dropped part changes neither if it happens
     * to collide.
     */
    const bare = names(buildRaptor(spec()))
    const seen = new Map<string, string>([[signature(buildRaptor(spec())), 'no extras']])
    for (const e of ALL_EXTRAS) {
      const g = buildRaptor(spec({ extras: [e] }))
      const added = [...names(g)].filter(n => !bare.has(n))
      expect(added.length, `extra '${e}' added no named part — is it in the switch?`)
        .toBeGreaterThan(0)
      const sig = signature(g)
      expect(seen.has(sig), `extra '${e}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, e)
    }
    expect(ALL_EXTRAS).toHaveLength(10)
  })

  it('composes three extras rather than letting the last one win', () => {
    // Roster §1's "two or three detail parts" is a plural, so a species that
    // asks for three must get three.
    const three = names(buildRaptor(spec({ extras: ['facial-disc', 'ear-tufts', 'trousers'] })))
    for (const want of [
      'facial-disc', 'ear-tuft-left', 'ear-tuft-right', 'trouser-left', 'trouser-right',
    ]) expect(three.has(want), `missing '${want}'`).toBe(true)

    const composed = signature(buildRaptor(spec({ extras: ['facial-disc', 'ear-tufts', 'trousers'] })))
    for (const e of ['facial-disc', 'ear-tufts', 'trousers'] as const) {
      expect(composed).not.toBe(signature(buildRaptor(spec({ extras: [e] }))))
    }
  })

  it('puts every extra somewhere a camera can see it', () => {
    /*
     * The same fault as the buried eyes, one level up. Checked against the head
     * and against the body and breast MERGED, because the merged box
     * over-approximates their union — the stricter direction, and what a torso
     * actually looks like from outside.
     *
     * Run at BOTH head extremes: an owl's skull at `head: 1.7` is most of the
     * bird and swallows anything tuned against a sparrowhawk's.
     */
    for (const head of [0.6, 1.7]) {
      const base = names(buildRaptor(spec({ head })))
      for (const e of ALL_EXTRAS) {
        const g = buildRaptor(spec({ head, extras: [e] }))
        const boxes = new Map<string, THREE.Box3>()
        const added: { name: string; box: THREE.Box3 }[] = []
        g.updateMatrixWorld(true)
        g.traverse(n => {
          if (!(n as THREE.Mesh).isMesh) return
          const b = new THREE.Box3().setFromObject(n)
          boxes.set(n.name, b)
          if (!base.has(n.name)) added.push({ name: n.name, box: b })
        })
        expect(added.length, `extra '${e}' added no mesh`).toBeGreaterThan(0)
        const torso = (boxes.get('body') as THREE.Box3).clone()
          .union(boxes.get('breast') as THREE.Box3)
        const hosts: [string, THREE.Box3][] = [
          ['the torso', torso], ['the head', boxes.get('head') as THREE.Box3],
        ]
        for (const a of added) {
          for (const [label, h] of hosts) {
            expect(h.containsBox(a.box), `head ${head}: ${a.name} is buried in ${label}`).toBe(false)
          }
        }
      }
    }
  })

  it('does not let an extra run away with the keep-out radius', () => {
    // pets.ts:652 takes radius from max(width, depth)/2, so a decorative part
    // that doubles either is a part every tree on the island has to make room
    // for. Roster §1's "no bespoke sculpting" is also a size discipline.
    const bare = dims(buildRaptor(spec()))
    for (const e of ALL_EXTRAS) {
      const [w, , d] = dims(buildRaptor(spec({ extras: [e] })))
      expect(w, `${e} width`).toBeLessThan((bare[0] as number) * 1.4)
      expect(d, `${e} depth`).toBeLessThan((bare[2] as number) * 1.4)
    }
  })
})

describe('talons are a dial and not a flag', () => {
  /*
   * `types.ts` puts `talons` in the build spec as a NUMBER rather than in the
   * closed extras list as a flag, and the justification is that every raptor
   * has them — so a boolean would be true sixteen times out of sixteen and
   * would hand an osprey and a kestrel the same feet. That is a claim about
   * geometry, so it gets measured.
   */
  const talonReach = (g: THREE.Object3D): number => {
    const b = part(g, 'talon-left-2')
    return b.max.z - b.min.z
  }

  it('gives an osprey visibly more foot than a kestrel', () => {
    const kestrel = buildRaptor(spec({ talons: 0.6 }))
    const osprey = buildRaptor(spec({ talons: 2 }))
    expect(talonReach(osprey)).toBeGreaterThan(talonReach(kestrel) * 2)
  })

  it('builds six claws at every setting, including the smallest', () => {
    // The floor is 0.2, "a kestrel's", not "none": there is no bird of prey
    // with no feet, so the dial must never build the empty case.
    for (const t of [0.2, 0.6, 1, 2.2, -5, Number.NaN]) {
      const found = [...names(buildRaptor(spec({ talons: t })))].filter(n => n.startsWith('talon-'))
      expect(found.sort(), `talons ${t}`).toEqual([
        'talon-left-1', 'talon-left-2', 'talon-left-3',
        'talon-right-1', 'talon-right-2', 'talon-right-3',
      ])
    }
  })

  it('keeps the claws on the ground with the feet, at every size', () => {
    // A claw that hangs in the air is a bird standing on tiptoe; a claw that
    // drops below the foot levers the whole bird up off y = 0 when `fitRig`
    // recentres. Both are invisible in a signature and obvious on screen.
    for (const t of [0.2, 1, 2.2]) {
      const g = buildRaptor(spec({ talons: t }))
      const floor = measure(g).min.y
      expect(part(g, 'talon-left-2').min.y, `talons ${t}`).toBeCloseTo(floor, 6)
      expect(part(g, 'foot-left').min.y, `talons ${t}`).toBeCloseTo(floor, 6)
    }
  })

  it('costs almost nothing in keep-out, which is what makes the dial affordable', () => {
    // The kit header's claim: talons are low and forward, so they land in the
    // shadow of the beak on the depth axis. If that stopped being true the dial
    // would have to become a flag, so it is asserted rather than asserted-in-prose.
    const small = keepOut(buildRaptor(spec({ talons: 0.2 })))
    const huge = keepOut(buildRaptor(spec({ talons: 2.2 })))
    expect(huge / small).toBeLessThan(1.08)
  })
})

describe('three calibrated reference points, for the agents that come next', () => {
  /*
   * READ THIS BEFORE TUNING A SPECIES ON THIS KIT.
   *
   * Three worked birds spanning what the raptor kit is asked to do, with the
   * numbers `pets.ts` will actually read off them written in as literals. They
   * are REFERENCE POINTS, not limits: a species that measures far outside them
   * is not automatically wrong, but it is a species worth looking at, and a
   * change to `REF`, `LIMIT`, `WING` or `TAIL` that moves these three is a
   * change that moves every bird in the Raptors collection.
   *
   * For scale: the live 24 GLBs measure 1.25 to 2.34 wide and 1.26 to 2.31
   * deep, so the PACK'S OWN WORST keep-out is 1.17 (`animal-fox`), and
   * `species-silhouette.test.ts` caps anything at 1.6. The songbird kit's two
   * reference birds measure 0.781 (robin) and 0.918 (swan).
   */
  const BUZZARD = spec({
    height: 1.9, body: 1, head: 1, legs: 1,
    beak: 'deep-hook', wings: 'broad', tail: 'fan', talons: 1,
  })
  const PEREGRINE = spec({
    height: 1.75, body: 0.9, head: 1, legs: 0.9,
    beak: 'notched-hook', wings: 'pointed', tail: 'square', talons: 1,
    extras: ['moustache', 'barred-breast', 'brow'],
  })
  const TAWNY_OWL = spec({
    height: 1.7, body: 0.8, head: 1.5, legs: 0.6,
    beak: 'small-hook', wings: 'broad', tail: 'fan', talons: 1,
    extras: ['facial-disc', 'speckles'],
  })

  it('the reference buzzard measures keep-out 0.790 at W/H 0.786', () => {
    const g = buildRaptor(BUZZARD)
    const [w, h, d] = dims(g)
    expect(h).toBeCloseTo(1.9, 6)
    expect(keepOut(g)).toBeCloseTo(0.7901, 3)
    expect((w as number) / (h as number)).toBeCloseTo(0.786, 2)
    expect((d as number) / (h as number)).toBeCloseTo(0.832, 2)
    // Comfortably inside the pack's own worst keep-out of 1.17, and closer to
    // the pack's mean W/H of 0.97 than the songbird's robin at 0.726 — a
    // buzzard IS chunkier than a robin, and roster §1 asks it to look it.
    expect(keepOut(g)).toBeLessThan(1.17)
  })

  it('a plausible peregrine measures keep-out 0.698 at W/H 0.667', () => {
    const g = buildRaptor(PEREGRINE)
    const [w, h, d] = dims(g)
    expect(h).toBeCloseTo(1.75, 6)
    expect(keepOut(g)).toBeCloseTo(0.6975, 3)
    expect((w as number) / (h as number)).toBeCloseTo(0.667, 2)
    expect((d as number) / (h as number)).toBeCloseTo(0.797, 2)
    expect(keepOut(g)).toBeLessThan(1.17)
  })

  it('a plausible tawny owl measures keep-out 0.590 at W/H 0.694', () => {
    const g = buildRaptor(TAWNY_OWL)
    const [w, h, d] = dims(g)
    expect(h).toBeCloseTo(1.7, 6)
    expect(keepOut(g)).toBeCloseTo(0.5897, 3)
    expect((w as number) / (h as number)).toBeCloseTo(0.694, 2)
    expect((d as number) / (h as number)).toBeCloseTo(0.679, 2)
    expect(keepOut(g)).toBeLessThan(1.17)
  })

  it('reads as three different birds and not one bird three times', () => {
    /*
     * Roster §4: the confusable groups "will read as duplicates unless size,
     * palette and marking are deliberately separated". Proportion has to carry
     * its share BEFORE any palette is applied, and these three are the kit's
     * own claim that it can.
     */
    const b = buildRaptor(BUZZARD)
    const p = buildRaptor(PEREGRINE)
    const o = buildRaptor(TAWNY_OWL)
    for (const [x, y] of [[b, p], [b, o], [p, o]] as const) {
      expect(signature(x)).not.toBe(signature(y))
    }
    // The owl is the one that is nearly all head.
    const headShare = (g: THREE.Object3D): number => {
      const box = part(g, 'head')
      return (box.max.y - box.min.y) / (dims(g)[1] as number)
    }
    // A RATCHET on a measured fact, rounded down from what the three currently
    // hold (0.077 and 0.089), in the style of `species-silhouette.test.ts`'s
    // WATCHED pairs: if a retune closes this gap, that is the moment to look at
    // an owl beside a buzzard in the bench, not the moment to lower the number.
    expect(headShare(o) - headShare(b)).toBeGreaterThan(0.07)
    expect(headShare(o) - headShare(p)).toBeGreaterThan(0.07)
    // The peregrine is the narrow one: pointed wings tuck in where broad ones
    // stand out, so the same kit gives a falcon a slimmer footprint.
    expect(dims(p)[0] as number / (dims(p)[1] as number))
      .toBeLessThan(dims(b)[0] as number / (dims(b)[1] as number))
  })
})

describe('materials', () => {
  const materials = (g: THREE.Object3D): THREE.Material[] => {
    const out: THREE.Material[] = []
    g.traverse(n => {
      const m = (n as THREE.Mesh).material
      if (!m) return
      for (const one of Array.isArray(m) ? m : [m]) out.push(one)
    })
    return out
  }

  it('is Standard, unlit-safe and metalness 0 throughout', () => {
    const mats = materials(buildRaptor(spec({ extras: ['facial-disc', 'trousers'] })))
    expect(mats.length).toBeGreaterThan(0)
    for (const m of mats) {
      expect(m).toBeInstanceOf(THREE.MeshStandardMaterial)
      expect((m as THREE.MeshStandardMaterial).metalness).toBe(0)
      expect((m as THREE.MeshStandardMaterial).roughness).toBe(1)
    }
  })

  it('shares one material per colour, because a clone shares materials', () => {
    // `pets.ts:592` hands out `.clone(true)`; the fewer distinct materials a
    // species has, the fewer objects exist per hundred pets.
    const built = buildRaptor(spec({ extras: ['speckles', 'hood', 'tail-bands'] }))
    const seen = new Map<number, THREE.Material>()
    for (const m of materials(built)) {
      const s = m as THREE.MeshStandardMaterial
      const hit = seen.get(s.color.getHex())
      if (hit) expect(hit).toBe(s)
      else seen.set(s.color.getHex(), s)
    }
    expect(seen.size).toBeGreaterThan(2)
  })

  it('survives flattenImported unchanged — it is a genuine no-op here', () => {
    const built = buildRaptor(spec({ extras: ['brow'] }))
    const before = materials(built).map(m => {
      const s = m as THREE.MeshStandardMaterial
      return { m, colour: s.color.getHex(), metal: s.metalness, rough: s.roughness }
    })
    flattenImported(built)
    const after = materials(built)
    expect(after.length).toBe(before.length)
    for (const [i, was] of before.entries()) {
      const now = after[i] as THREE.MeshStandardMaterial
      expect(now).toBe(was.m)
      expect(now.color.getHex()).toBe(was.colour)
      expect(now.metalness).toBe(was.metal)
      expect(now.roughness).toBe(was.rough)
    }
  })

  it('builds from a palette with only a coat, inventing the other three', () => {
    // `types.ts` makes belly, detail and accent optional and the kit's own
    // `coatsOf` decides what an absent one looks like. A species record that
    // authored one colour must still build a whole bird.
    const sparse = buildRaptor(spec({ palette: { coat: 0x445566 }, extras: ['hood', 'brow'] }))
    expect(dims(sparse)[1]).toBeCloseTo(1.9, 6)
    const colours = new Set<number>()
    sparse.traverse(n => {
      const m = (n as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (m?.color) colours.add(m.color.getHex())
    })
    // Coat, belly, detail, accent, the darkened hook, and the two eye colours.
    expect(colours.size).toBeGreaterThanOrEqual(6)
  })
})

describe('the kit is deterministic and reachable through the real registry', () => {
  it('builds the same measurements twice — no Math.random anywhere', () => {
    const s = spec({
      height: 2.05, body: 1.15, head: 0.85, legs: 1.3, talons: 1.4,
      beak: 'notched-hook', wings: 'pointed', tail: 'forked',
      extras: ['moustache', 'tail-bands', 'speckles'],
    })
    expect(signature(buildRaptor(s))).toBe(signature(buildRaptor(s)))
    expect(dims(buildRaptor(s))).toEqual(dims(buildRaptor(s)))
  })

  it('builds a raptor through buildSpecies, not through the builder directly', () => {
    /*
     * THE REAL PATH. `pets.ts` will call `buildSpecies(spec)` and nothing else,
     * so a kit that works when called directly and is unreachable through the
     * registry is a kit that ships as an empty island. This is the assertion
     * that replaces `kit-songbird.test.ts:620`'s listing of `raptor` among the
     * kits the registry refuses.
     */
    const s = spec({ height: 2.1, beak: 'deep-hook', extras: ['hood', 'brow', 'trousers'] })
    expect(() => buildSpecies(s)).not.toThrow()
    const built = buildSpecies(s)
    expect(built.name).toBe('raptor')
    expect(dims(built)[1]).toBeCloseTo(2.1, 6)
    expect(names(built).has('beak-hook')).toBe(true)
    const box = measure(built)
    expect(box.min.y).toBeCloseTo(0, 6)
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(0, 6)
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(0, 6)
  })

  it('still refuses the three kits that really are unbuilt', () => {
    for (const kit of ['swim', 'minibeast', 'bespoke'] as const) {
      const pending = { kit, height: 1.6, palette: PALETTE } as BuildSpec
      expect(() => buildSpecies(pending)).toThrow(UnbuiltKitError)
      expect(() => buildSpecies(pending)).toThrow(new RegExp(kit))
    }
  })

  it('refuses another kit spec handed straight to the raptor builder', () => {
    /*
     * Reached through the registry entry rather than through `buildSpecies`,
     * which would have dispatched on `kit` one step earlier and proved nothing
     * about this guard. It bites hardest for this kit: a `SongbirdBuild` is
     * structurally close enough to a `RaptorBuild` that a mis-typed record
     * would otherwise build a hookless, talonless bird rather than fail.
     */
    const raptor = KITS.raptor
    expect(raptor).toBeDefined()
    const wrong = {
      kit: 'songbird', height: 1.6, body: 1, head: 1, legs: 1, neck: 0,
      beak: 'fine', tail: 'fan', wings: 'folded', palette: PALETTE,
    } as BuildSpec
    expect(() => (raptor as { build(s: BuildSpec): THREE.Group }).build(wrong)).toThrow(UnbuiltKitError)
  })

  it('builds happily from a set palette', () => {
    // Built pets take their set colour as material colour, not as a map —
    // `kit.ts` `paletteFor`. A raptor must survive the same trip a fox does.
    const berry: SetPalette = { hue: 320, sat: 0.7, light: 1 }
    const dressed = buildRaptor(spec({ palette: paletteFor(PALETTE, berry), extras: ['facial-disc'] }))
    expect(dims(dressed)[1]).toBeCloseTo(1.9, 6)
    // And the natural set is still a true no-op on the way in.
    expect(paletteFor(PALETTE, { hue: 0, sat: -1, light: 1 })).toBe(PALETTE)
  })
})
