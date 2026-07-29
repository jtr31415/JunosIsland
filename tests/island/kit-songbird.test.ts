/**
 * The songbird kit, tested against the CONTRACT rather than against itself.
 *
 * Mirrors `kit-quadruped.test.ts` deliberately — every assertion here is
 * something `pets.ts` will actually do to the group, or something roster §1
 * forbids. No renderer is needed and none is made: the kit builds geometry and
 * the test measures it, which is exactly what `pets.ts:650-660` does before it
 * decides a pet's keep-out radius and shadow.
 *
 * The four assertions worth defending, over and above the quadruped's:
 *
 *   - THE NECK AXIS. `types.ts` makes `neck` a proportion rather than an extra
 *     part because this one kit has to stretch from a wren to a flamingo. That
 *     is a claim about what the geometry does, so it is measured: a long-necked
 *     bird carries its head visibly higher up its own body AND still stands
 *     exactly `spec.height` tall, because the fit is uniform and solves for
 *     height.
 *   - THE `wing-` PREFIX, which `pets.ts:690` matches and `pets.ts:858` then
 *     drives. Exactly two nodes may carry it, left before right, and neither
 *     may author a `rotation.z` that the flap would silently discard.
 *   - TWO CALIBRATED REFERENCE POINTS at opposite ends of the kit — a robin and
 *     a swan — with their measured keep-out written in as literals, so the
 *     species agents that come after this one are tuning against numbers rather
 *     than against intuition.
 *   - THE VOCABULARY. No ConeGeometry, CylinderGeometry or CapsuleGeometry
 *     anywhere in `src/`, and a beak is the part that most tempts one. Asserted
 *     on the built geometry rather than trusted to a code review.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildSongbird } from '../../src/island/species/kits/songbird'
import { buildSpecies, KITS, paletteFor, UnbuiltKitError } from '../../src/island/species/kit'
import type { BuildSpec, KitPalette, SongbirdBuild, SongbirdExtra } from '../../src/island/species/types'
import { flattenImported } from '../../src/island/lighting/index'
import type { SetPalette } from '../../src/island/variants/recolour'

/** Robin colours: brown back, cream underside, dark legs, a red breast. */
const PALETTE: KitPalette = { coat: 0x8a5a3b, belly: 0xfff2e0, detail: 0x2f2620, accent: 0xc4442f }

const spec = (over: Partial<SongbirdBuild> = {}): SongbirdBuild => ({
  kit: 'songbird',
  height: 1.6,
  body: 1,
  head: 1,
  legs: 1,
  neck: 0,
  beak: 'fine',
  tail: 'fan',
  wings: 'folded',
  palette: PALETTE,
  ...over,
})

const ALL_BEAKS: SongbirdBuild['beak'][] = ['fine', 'short', 'stout', 'long', 'flat', 'dagger']
const ALL_TAILS: SongbirdBuild['tail'][] = ['fan', 'short', 'long', 'forked', 'pointed', 'none']
const ALL_WINGS: SongbirdBuild['wings'][] = ['folded', 'broad', 'pointed', 'tiny']
const ALL_EXTRAS: SongbirdExtra[] = [
  'crest', 'plume', 'eye-stripe', 'cheek-patch', 'throat-bib', 'collar',
  'wing-bar', 'speckles', 'ruff', 'tail-streamer', 'webbed-feet', 'wattle',
]

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
  const names: string[] = []
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) {
      const geo = (n as THREE.Mesh).geometry
      verts += geo.getAttribute('position').count
      names.push(n.name)
    }
  })
  return `${verts}|${names.sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

describe('the built group survives what pets.ts does to it', () => {
  it('is finite, non-empty, feet on the ground and centred on x/z', () => {
    const box = measure(buildSongbird(spec()))
    for (const v of [box.min, box.max]) {
      for (const n of [v.x, v.y, v.z]) expect(Number.isFinite(n)).toBe(true)
    }
    expect(box.isEmpty()).toBe(false)
    expect(box.min.y).toBeCloseTo(0, 6)
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(0, 6)
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(0, 6)
  })

  it('keeps its feet on the ground with every neck, leg and tail it owns', () => {
    // The fit recentres off a measured box, so a part that escapes downward
    // moves the feet. A flamingo's legs and a swallow's streamers are the two
    // that could.
    for (const s of [
      spec({ neck: 2.2, legs: 3 }),
      spec({ neck: 0, legs: 0.15, tail: 'long', extras: ['tail-streamer', 'webbed-feet'] }),
    ]) {
      const b = measure(buildSongbird(s))
      expect(b.min.y).toBeCloseTo(0, 6)
      expect((b.min.x + b.max.x) / 2).toBeCloseTo(0, 6)
      expect((b.min.z + b.max.z) / 2).toBeCloseTo(0, 6)
    }
  })

  it('stands exactly as tall as the spec asks', () => {
    for (const h of [1.2, 1.45, 1.6, 1.95, 2.6]) {
      expect(dims(buildSongbird(spec({ height: h })))[1]).toBeCloseTo(h, 6)
    }
  })

  it('holds the fit for a wren, a robin and a heron — three worked examples', () => {
    /*
     * Three real specs with real numbers, at the two ends of the kit and the
     * middle, because the fit is the one promise `pets.ts` measures directly:
     * `standing = max.y - min.y` at `pets.ts:658` sizes the blob shadow, so a
     * bird that is not exactly as tall as it said gets the wrong shadow.
     *
     * A WREN: small, round, no neck at all, stubby wings, tail cocked.
     * A ROBIN: the reference silhouette, near enough every multiplier at 1.
     * A HERON: long boat of a body, long legs, long neck, dagger beak — the
     * furthest this kit is asked to reach, and the reason `neck` is a number.
     */
    const worked: [string, SongbirdBuild, number][] = [
      ['wren', spec({ height: 1.25, body: 0.6, head: 1.25, legs: 0.55, neck: 0, beak: 'fine', tail: 'fan', wings: 'tiny' }), 1.25],
      ['robin', spec({ height: 1.5, body: 0.95, head: 1.05, legs: 0.8, neck: 0, beak: 'fine', tail: 'fan', wings: 'folded' }), 1.5],
      ['heron', spec({ height: 2.55, body: 1.45, head: 0.7, legs: 2.2, neck: 1.5, beak: 'dagger', tail: 'short', wings: 'broad' }), 2.55],
    ]
    for (const [name, s, want] of worked) {
      const b = measure(buildSongbird(s))
      expect(b.max.y - b.min.y, `${name} height`).toBeCloseTo(want, 6)
      expect(b.min.y, `${name} feet`).toBeCloseTo(0, 6)
    }
  })

  it('clamps a mad spec instead of building a monument', () => {
    const mad = buildSongbird(spec({ height: 100, body: 100, head: 100, legs: 100, neck: 100 }))
    const [w, h, d] = dims(mad)
    expect(h).toBeCloseTo(2.6, 6)
    // Clamped proportions, not just a clamped height: a head multiplier of 100
    // left unchecked is a bird the size of a tree in a child's garden.
    expect(w).toBeLessThan(h)
    expect(d).toBeLessThan(h)
    expect(keepOut(mad)).toBeLessThan(2)

    // Negative is the other half of the same fault, and a negative scale is
    // worse than a big one: it inverts a mesh's winding.
    const negative = buildSongbird(spec({ height: -5, body: -5, head: -5, legs: -5, neck: -5 }))
    const neg = dims(negative)
    for (const n of neg) expect(n).toBeGreaterThan(0)
    expect(neg[1]).toBeCloseTo(1.2, 6)
    negative.traverse(n => {
      for (const v of [n.scale.x, n.scale.y, n.scale.z]) expect(v).toBeGreaterThan(0)
    })

    // NaN in the data must not reach a transform — pets.ts measures a Box3 off
    // this and a NaN there poisons the keep-out radius for the whole field.
    const broken = dims(buildSongbird(spec({ height: Number.NaN, body: Number.NaN, neck: Number.NaN })))
    for (const n of broken) expect(Number.isFinite(n)).toBe(true)
  })

  it('sets userData.pick on nothing — pets.ts:663 owns it', () => {
    buildSongbird(spec({ extras: ['crest', 'collar', 'wing-bar'] })).traverse(n => {
      expect(n.userData.pick).toBeUndefined()
    })
  })

  it('names exactly two nodes wing-, left then right, with no authored roll', () => {
    /*
     * THE DECISION, and the reason it is asserted rather than commented.
     *
     * `pets.ts:690` collects flap targets with `/^wing-/` and `pets.ts:858`
     * then sets `wing.rotation.z = (i % 2 ? -1 : 1) * beat * 0.5` on each of
     * them, by TRAVERSAL INDEX. Two consequences:
     *
     *   1. A third matching node — a `wing-bar-left`, say — shifts the parity
     *      and makes the right wing beat with the left. So the `wing-bar` extra
     *      builds nodes called `wingbar-*`, which that regex does not match.
     *   2. Any `rotation.z` this kit authors on a wing is thrown away on the
     *      first animated frame. So none is authored, and the wings' lean lives
     *      in `rotation.x`.
     *
     * None of it fires today: flapping is gated on `FLYERS` (`pets.ts:47`), an
     * explicit list of two species ids, and no songbird is in it. This is the
     * kit being ready for the day one is, rather than the kit relying on never
     * being asked.
     */
    const g = buildSongbird(spec({ wings: 'broad', extras: ['wing-bar', 'plume', 'tail-streamer'] }))
    const flapTargets: THREE.Object3D[] = []
    g.traverse(n => { if (/^wing-/.test(n.name)) flapTargets.push(n) })
    expect(flapTargets.map(n => n.name)).toEqual(['wing-left', 'wing-right'])
    for (const w of flapTargets) expect(w.rotation.z).toBe(0)

    // And the extra really is present under its non-matching name.
    const named = new Set<string>()
    g.traverse(n => named.add(n.name))
    expect(named.has('wingbar-left')).toBe(true)
    expect(named.has('wingbar-right')).toBe(true)

    // Every wing style, not just the one above.
    for (const wings of ALL_WINGS) {
      const found: string[] = []
      buildSongbird(spec({ wings })).traverse(n => { if (/^wing-/.test(n.name)) found.push(n.name) })
      expect(found, `wings '${wings}'`).toEqual(['wing-left', 'wing-right'])
    }
  })

  it('is made of boxes and lumps and nothing else', () => {
    // `src/` contains no ConeGeometry, CylinderGeometry or CapsuleGeometry
    // anywhere, and a beak is the part that most invites the first one. The
    // chunky flat Kenney read is the whole reason.
    for (const beak of ALL_BEAKS) {
      buildSongbird(spec({ beak, extras: ['crest', 'plume', 'wattle'] })).traverse(n => {
        const geo = (n as THREE.Mesh).geometry
        if (!geo) return
        expect(['BoxGeometry', 'SphereGeometry'], `${n.name} is a ${geo.type}`).toContain(geo.type)
      })
    }
  })

  it('leaves the returned root at identity — pets.ts:643 owns its scale', () => {
    const root = buildSongbird(spec({ height: 2.2 }))
    expect(root.name).toBe('songbird')
    expect(root.scale.toArray()).toEqual([1, 1, 1])
    expect(root.position.toArray()).toEqual([0, 0, 0])
  })

  it('leaves no detail part buried inside another part', () => {
    /*
     * THE BUG THIS EXISTS FOR, inherited from the quadruped kit: the first
     * build there put both eye whites entirely inside the skull, and every
     * other assertion passed — finite, centred, the right height, the right
     * materials — while the pet had no face.
     *
     * This kit found the same fault twice while being built: the `collar` sat
     * inside the body of any bird with `neck: 0` (which is every robin and
     * every wren), and the leading `speckle` sat inside the skull of the same
     * birds. Both built real geometry and changed the vertex count.
     */
    for (const neck of [0, 1.4]) {
      const g = buildSongbird(spec({ neck, tail: 'fan', wings: 'folded' }))
      const pairs: [string, string][] = [
        ['eye-left', 'head'], ['eye-right', 'head'], ['pupil-left', 'head'],
        ['beak', 'head'], ['beak-tip', 'head'],
        ['breast', 'body'], ['tail', 'body'], ['wing-left', 'body'], ['wing-right', 'body'],
        ['foot-left', 'leg-left'], ['foot-right', 'leg-right'],
      ]
      if (neck > 0) pairs.push(['neck', 'body'], ['head', 'body'])
      for (const [inner, outer] of pairs) {
        expect(
          part(g, outer).containsBox(part(g, inner)),
          `neck ${neck}: ${inner} is inside ${outer}`,
        ).toBe(false)
      }
    }
  })

  it('gives its parts stable, findable names', () => {
    const found = new Set<string>()
    buildSongbird(spec({ neck: 1 })).traverse(n => found.add(n.name))
    for (const want of [
      'songbird', 'rig', 'body', 'breast', 'head', 'neck', 'beak', 'beak-tip',
      'tail', 'wing-left', 'wing-right',
      'leg-left', 'leg-right', 'foot-left', 'foot-right',
      'eye-left', 'eye-right', 'pupil-left', 'pupil-right',
    ]) expect(found.has(want), `missing '${want}'`).toBe(true)
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
    const built = buildSongbird(spec({ extras: ['crest', 'webbed-feet'] }))
    const mats = materials(built)
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
    const built = buildSongbird(spec({ extras: ['speckles', 'collar', 'wing-bar'] }))
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
    const built = buildSongbird(spec({ extras: ['ruff'] }))
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
})

describe('no part of the data is a silent no-op', () => {
  it('builds a distinguishable bird for every beak value', () => {
    const seen = new Map<string, string>()
    for (const beak of ALL_BEAKS) {
      const sig = signature(buildSongbird(spec({ beak })))
      expect(seen.has(sig), `beak '${beak}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, beak)
    }
  })

  it('builds a distinguishable bird for every tail value', () => {
    const seen = new Map<string, string>()
    for (const tail of ALL_TAILS) {
      const sig = signature(buildSongbird(spec({ tail })))
      expect(seen.has(sig), `tail '${tail}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, tail)
    }
  })

  it('builds a distinguishable bird for every wings value', () => {
    const seen = new Map<string, string>()
    for (const wings of ALL_WINGS) {
      const sig = signature(buildSongbird(spec({ wings })))
      expect(seen.has(sig), `wings '${wings}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, wings)
    }
  })

  it('builds something for every one of the twelve extras, and nothing twice', () => {
    const bare = signature(buildSongbird(spec()))
    const seen = new Map<string, string>([[bare, 'no extras']])
    for (const e of ALL_EXTRAS) {
      const sig = signature(buildSongbird(spec({ extras: [e] })))
      expect(seen.has(sig), `extra '${e}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, e)
    }
  })

  it('composes extras rather than letting the last one win', () => {
    // Roster §1's "two or three detail parts" is a plural, so a species that
    // asks for three must get three. The names are checked as well as the
    // signature: a silently-dropped part changes neither if it collides.
    const names = (s: SongbirdBuild): Set<string> => {
      const out = new Set<string>()
      buildSongbird(s).traverse(n => out.add(n.name))
      return out
    }
    const bare = names(spec())
    const three = names(spec({ extras: ['crest', 'throat-bib', 'webbed-feet'] }))
    for (const want of ['crest-1', 'throat-bib', 'web-left', 'web-right']) {
      expect(three.has(want), `missing '${want}'`).toBe(true)
    }
    expect(three.size).toBeGreaterThan(bare.size)

    // And a three-extra bird differs from every one-extra bird.
    const composed = signature(buildSongbird(spec({ extras: ['crest', 'throat-bib', 'webbed-feet'] })))
    for (const e of ['crest', 'throat-bib', 'webbed-feet'] as const) {
      expect(composed).not.toBe(signature(buildSongbird(spec({ extras: [e] }))))
    }
  })

  it('puts every extra somewhere a camera can see it', () => {
    /*
     * The same fault as the buried eyes, one level up. Checked against the head
     * and against the body and breast MERGED, because the merged box
     * over-approximates their union — which is the stricter direction and is
     * what a torso actually looks like from outside. `kit-quadruped.test.ts`
     * learned that the hard way when a buried pouch escaped three separate
     * boxes while sitting inside all of them together.
     *
     * Run at BOTH neck extremes: the head moves a long way up and back as the
     * neck grows, so a part that clears the skull on a heron can sit inside it
     * on a robin. That is exactly how the `collar` and the leading `speckle`
     * were caught.
     */
    for (const neck of [0, 1.4]) {
      const base = new Set<string>()
      buildSongbird(spec({ neck })).traverse(n => base.add(n.name))
      for (const e of ALL_EXTRAS) {
        const g = buildSongbird(spec({ neck, extras: [e] }))
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
            expect(h.containsBox(a.box), `neck ${neck}: ${a.name} is buried in ${label}`).toBe(false)
          }
        }
      }
    }
  })

  it('does not let an extra run away with the keep-out radius', () => {
    // pets.ts:652 takes radius from max(width, depth)/2, so a decorative part
    // that doubles either is a part every tree on the island has to make room
    // for. Roster §1's "no bespoke sculpting" is also a size discipline.
    const bare = dims(buildSongbird(spec()))
    for (const e of ALL_EXTRAS) {
      const [w, , d] = dims(buildSongbird(spec({ extras: [e] })))
      expect(w, `${e} width`).toBeLessThan((bare[0] as number) * 1.4)
      expect(d, `${e} depth`).toBeLessThan((bare[2] as number) * 1.4)
    }
  })
})

describe('the neck is a proportion, and it earns being one', () => {
  /*
   * `types.ts` puts `neck` in the build spec as a NUMBER rather than in the
   * closed extras list as a flag, and the justification is that this one kit
   * carries roster §4's hardest confusable group — swan against stork against
   * heron against pelican against flamingo — which no single boolean could
   * separate. That is a claim about geometry, so it gets measured.
   */
  const headLift = (s: SongbirdBuild): number => {
    const g = buildSongbird(s)
    const h = dims(g)[1] as number
    // How far up its own height the bird carries the bottom of its skull. A
    // long neck raises it; nothing else in the kit does, because the fit
    // normalises the total height away.
    return part(g, 'head').min.y / h
  }

  it('carries the head visibly higher at neck 1.2 than at neck 0', () => {
    const flat = headLift(spec({ neck: 0 }))
    const tall = headLift(spec({ neck: 1.2 }))
    expect(tall - flat, `neck 0 lift ${flat}, neck 1.2 lift ${tall}`).toBeGreaterThan(0.05)
  })

  it('leaves both of them exactly as tall as they asked to be', () => {
    // The point of the fit: a swan and a robin are the same height on demand,
    // and the neck spends itself on PROPORTION rather than on size. Anything
    // else and `pets.ts:658` gives the swan the wrong shadow.
    for (const neck of [0, 0.6, 1.2, 2.2]) {
      expect(dims(buildSongbird(spec({ height: 1.6, neck })))[1]).toBeCloseTo(1.6, 6)
    }
  })

  it('makes a long-necked bird narrower, not wider — the fit is uniform', () => {
    /*
     * The trap that caught three collections on the quadruped kit, restated
     * here where it bites hardest. The fit solves for HEIGHT, so a neck raises
     * the raw silhouette, which LOWERS the fit scale, which shrinks the body in
     * world units. A heron is therefore slim and CHEAPER on keep-out than a
     * wren of the same height — the opposite of the intuition that a longer
     * animal costs more room.
     */
    const flat = dims(buildSongbird(spec({ neck: 0 })))
    const tall = dims(buildSongbird(spec({ neck: 1.2 })))
    expect(tall[0]).toBeLessThan(flat[0] as number)
    expect(keepOut(buildSongbird(spec({ neck: 1.2 })))).toBeLessThan(keepOut(buildSongbird(spec({ neck: 0 }))))
  })

  it('builds no neck mesh at neck 0, and one at every neck above it', () => {
    // `neck: 0` is a real value, not a degenerate one — it is the commonest in
    // the kit and it means a robin with its head on its shoulders.
    const has = (neck: number): boolean => {
      let found = false
      buildSongbird(spec({ neck })).traverse(n => { if (n.name === 'neck') found = true })
      return found
    }
    expect(has(0)).toBe(false)
    expect(has(-3)).toBe(false)
    for (const n of [0.2, 1, 2.2]) expect(has(n), `neck ${n}`).toBe(true)
  })
})

describe('two calibrated reference points, for the agents that come next', () => {
  /*
   * READ THIS BEFORE TUNING A SPECIES ON THIS KIT.
   *
   * Two worked birds at opposite ends of what the songbird kit is asked to do,
   * with the numbers `pets.ts` will actually read off them written in as
   * literals. They are REFERENCE POINTS, not limits: a species that measures
   * far outside this pair is not automatically wrong, but it is a species worth
   * looking at, and a change to `REF` or `LIMIT` that moves these two is a
   * change that moves every bird in the roster.
   *
   * For scale: the live 24 GLBs measure 1.25 to 2.34 wide and 1.26 to 2.31
   * deep, so the PACK'S OWN WORST keep-out is 1.17, and the plain quadrupeds
   * run W/H 0.74 (fox) to 0.83 (polar bear).
   */
  const ROBIN = spec({
    height: 1.5, body: 0.95, head: 1.05, legs: 0.8, neck: 0,
    beak: 'fine', tail: 'fan', wings: 'folded', extras: ['throat-bib', 'eye-stripe'],
  })
  const SWAN = spec({
    height: 2.5, body: 1.5, head: 0.75, legs: 0.6, neck: 1.6,
    beak: 'flat', tail: 'short', wings: 'broad', extras: ['webbed-feet'],
  })

  it('a plausible robin measures keep-out 0.781 at W/H 0.726', () => {
    const g = buildSongbird(ROBIN)
    const [w, h, d] = dims(g)
    expect(h).toBeCloseTo(1.5, 6)
    expect(keepOut(g)).toBeCloseTo(0.7811, 3)
    expect((w as number) / (h as number)).toBeCloseTo(0.726, 2)
    expect((d as number) / (h as number)).toBeCloseTo(1.041, 2)
    // Comfortably inside the pack's own worst keep-out of 1.17.
    expect(keepOut(g)).toBeLessThan(1.17)
  })

  it('a plausible swan measures keep-out 0.918 at W/H 0.552', () => {
    const g = buildSongbird(SWAN)
    const [w, h, d] = dims(g)
    expect(h).toBeCloseTo(2.5, 6)
    expect(keepOut(g)).toBeCloseTo(0.9182, 3)
    expect((w as number) / (h as number)).toBeCloseTo(0.552, 2)
    expect((d as number) / (h as number)).toBeCloseTo(0.735, 2)
    expect(keepOut(g)).toBeLessThan(1.17)
  })

  it('reads as two different birds and not one bird twice', () => {
    // Roster §4: the confusable groups "will read as duplicates unless size,
    // palette and marking are deliberately separated". Proportion has to carry
    // its share, before any palette is applied.
    const robin = buildSongbird(ROBIN)
    const swan = buildSongbird(SWAN)
    const rh = dims(robin)[1] as number
    const sh = dims(swan)[1] as number
    expect(sh - rh).toBeGreaterThan(0.5)
    // The swan is the one carrying its head up a long neck.
    expect(part(swan, 'head').min.y / sh - part(robin, 'head').min.y / rh).toBeGreaterThan(0.1)
    // The robin is the one with the big head for its size.
    const headOf = (g: THREE.Object3D, h: number): number => {
      const b = part(g, 'head')
      return (b.max.y - b.min.y) / h
    }
    expect(headOf(robin, rh) - headOf(swan, sh)).toBeGreaterThan(0.05)
  })
})

describe('the kit is deterministic and reachable', () => {
  it('builds the same measurements twice — no Math.random anywhere', () => {
    const s = spec({
      height: 1.93, body: 1.3, head: 0.8, legs: 1.4, neck: 0.85,
      beak: 'dagger', tail: 'forked', wings: 'pointed',
      extras: ['crest', 'collar', 'speckles'],
    })
    expect(signature(buildSongbird(s))).toBe(signature(buildSongbird(s)))
    expect(dims(buildSongbird(s))).toEqual(dims(buildSongbird(s)))
  })

  it('no longer throws UnbuiltKitError for songbird — the kit is registered', () => {
    /*
     * The negative test, and the one that has to change the day a kit lands.
     * `kit-quadruped.test.ts` used to list `songbird` among the kits the
     * registry refuses; it does not any more, and this is the assertion that
     * replaces it.
     */
    const s = spec({ height: 1.7 })
    expect(() => buildSpecies(s)).not.toThrow()
    const built = buildSpecies(s)
    expect(built.name).toBe('songbird')
    expect(dims(built)[1]).toBeCloseTo(1.7, 6)
  })

  it('still refuses the three kits that really are unbuilt', () => {
    // `raptor` left this list when PB-036 phase 4 built it. The assertion that
    // it no longer throws lives at `kit-raptor.test.ts`.
    for (const kit of ['swim', 'minibeast', 'bespoke'] as const) {
      const pending = { kit, height: 1.6, palette: PALETTE } as BuildSpec
      expect(() => buildSpecies(pending)).toThrow(UnbuiltKitError)
      expect(() => buildSpecies(pending)).toThrow(new RegExp(kit))
    }
  })

  it('refuses another kit spec handed straight to the songbird builder', () => {
    // Reached through the registry entry rather than through `buildSpecies`,
    // which would have refused a raptor one step earlier and proved nothing
    // about this guard. A mismatch here is a data fault worth hearing about.
    const songbird = KITS.songbird
    expect(songbird).toBeDefined()
    const wrong = { kit: 'quadruped', height: 1.6, body: 1, head: 1, legs: 1, ears: 'round', tail: 'stub', palette: PALETTE } as BuildSpec
    expect(() => (songbird as { build(s: BuildSpec): THREE.Group }).build(wrong)).toThrow(UnbuiltKitError)
  })

  it('builds happily from a set palette', () => {
    // Built pets take their set colour as material colour, not as a map —
    // `kit.ts` `paletteFor`. A bird must survive the same trip a fox does.
    const berry: SetPalette = { hue: 320, sat: 0.7, light: 1 }
    const dressed = buildSongbird(spec({ palette: paletteFor(PALETTE, berry), extras: ['crest'] }))
    expect(dims(dressed)[1]).toBeCloseTo(1.6, 6)
    // And the natural set is still a true no-op on the way in.
    expect(paletteFor(PALETTE, { hue: 0, sat: -1, light: 1 })).toBe(PALETTE)
  })

  it('builds from a palette with only a coat, inventing the other three', () => {
    // `types.ts` makes belly, detail and accent optional and the kit's own
    // `coatsOf` decides what an absent one looks like. A species record that
    // authored one colour must still build a whole bird.
    const sparse = buildSongbird(spec({ palette: { coat: 0x445566 }, extras: ['collar', 'wattle'] }))
    expect(dims(sparse)[1]).toBeCloseTo(1.6, 6)
    const colours = new Set<number>()
    sparse.traverse(n => {
      const m = (n as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (m?.color) colours.add(m.color.getHex())
    })
    // Coat, belly, detail, accent, the darkened beak tip, and two eye colours.
    expect(colours.size).toBeGreaterThanOrEqual(6)
  })
})
