/**
 * @vitest-environment jsdom
 *
 * Joe, playing: "drop shadow location and shape is inconsistent with single
 * point sun light source."
 *
 * It was. There are no shadow maps anywhere in this build — no
 * `renderer.shadowMap`, no `castShadow` flag on a single object — so every
 * shadow on the island is a blob decal, and every blob was a CIRCLE drawn
 * CONCENTRICALLY under its object. That is the shadow you get from a lamp
 * directly overhead. The rig's sun (lighting brief §2.2, and the only shadow
 * caster it permits) sits at 35° elevation and 40° azimuth.
 *
 * These tests pin the two properties that were missing: a shadow is thrown
 * AWAY from the sun in proportion to how high its caster is, and it is
 * STRETCHED along that same direction. Both come from the preset, so nothing
 * here hardcodes a light — which is itself a lighting-brief §7 sin.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'

/*
 * The loader is the only thing mocked, and it is mocked because it is I/O.
 * Everything asserted below is read off the scene graph `props.ts` really
 * builds — HANDOFF §5's rule, after four features that were declared, read and
 * assigned by nothing while every mock-based test passed.
 *
 * The stand-in shapes match the measured ASPECT RATIOS of the packs, which is
 * all that matters once `fitInto` has normalised the size: a forest tree is
 * tall and thin, ground cover is low and wide, a hexagon-pack feature is about
 * as tall as it is broad.
 */
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await import('three')
  class GLTFLoader {
    async loadAsync(url: string): Promise<{ scene: THREE.Group }> {
      const name = (url.split('/').pop() ?? '').replace(/\.gltf$/, '')
      const [w, h] = /^Tree_/.test(name) ? [0.5, 2.4]
        : /^(Grass|Bush|Rock)_/.test(name) ? [0.9, 0.5]
          : [1.4, 1.3]
      const mesh = new T.Mesh(new T.BoxGeometry(w, h, w), new T.MeshStandardMaterial())
      mesh.position.y = h / 2
      const scene = new T.Group()
      scene.name = name
      scene.add(mesh)
      return { scene }
    }
  }
  return { GLTFLoader }
})
import { createLighting, sunShadow } from '../../src/island/lighting'
import type { LightingPreset } from '../../src/island/lighting'
import { createBlobShadow, castShadow, SHADOW_LIFT } from '../../src/island/juice'
import {
  shadowUnder, createPropField, fitInto, FITS, VARY, varyMax, varyMin,
  SHADOW_MIN_HEIGHT, SHADOW_MIN_REACH,
} from '../../src/island/world/props'
import type { Surface } from '../../src/island/world/tiles'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'

const MEADOW = meadowDay as LightingPreset

/** A preset that differs only in where the sun is. */
const sunAt = (elevation: number, azimuth: number): LightingPreset =>
  ({ ...MEADOW, sun: { ...MEADOW.sun, elevation, azimuth } })

/** Where the sun itself sits on the horizon ring, per the rig's own maths. */
const sunBearing = (azimuthDeg: number): { x: number; z: number } => {
  const az = (azimuthDeg * Math.PI) / 180
  return { x: Math.sin(az), z: Math.cos(az) }
}

describe('sunShadow — one sun, one answer', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  it('throws the shadow AWAY from the sun', () => {
    const s = sunShadow()
    expect(s).not.toBeNull()
    const sun = sunBearing(MEADOW.sun.azimuth)
    // Directly opposite: the dot product of two opposed unit vectors is -1.
    expect((s as NonNullable<typeof s>).x * sun.x
      + (s as NonNullable<typeof s>).z * sun.z).toBeCloseTo(-1, 6)
  })

  it('reaches cot(elevation) of ground per unit of height', () => {
    // The preset's 35° sun: 1.428 units of ground for every unit up.
    expect((sunShadow() as { reach: number }).reach)
      .toBeCloseTo(1 / Math.tan((35 * Math.PI) / 180), 6)
  })

  it('stretches a round caster by 1/sin(elevation)', () => {
    expect((sunShadow() as { stretch: number }).stretch)
      .toBeCloseTo(1 / Math.sin((35 * Math.PI) / 180), 6)
  })

  it('follows the preset rather than a number written here', () => {
    createLighting(null, sunAt(35, 220))
    const s = sunShadow() as { x: number; z: number }
    const sun = sunBearing(220)
    expect(s.x * sun.x + s.z * sun.z).toBeCloseTo(-1, 6)
  })

  it('floors the elevation, so a low sun cannot throw a blob to the horizon', () => {
    /*
     * cot(elevation) runs away at the horizon — a 2° sun would put a pet's
     * shadow twenty-nine times its own height across the island, which is
     * neither readable nor a blob. Nothing in the presets goes near it and the
     * floor means nothing can.
     */
    createLighting(null, sunAt(2, 40))
    expect((sunShadow() as { reach: number }).reach)
      .toBeCloseTo(1 / Math.tan((10 * Math.PI) / 180), 6)
  })
})

describe('castShadow — location', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  const offsetOf = (blob: THREE.Mesh, ax = 0, az = 0): { x: number; z: number } =>
    ({ x: blob.position.x - ax, z: blob.position.z - az })

  it('does not sit concentrically under a body standing on the ground', () => {
    /*
     * THE BUG, in one assertion. A creature 0.25 tall lit from 35° above
     * throws a shadow that reaches out from its feet; it does not stand in the
     * middle of a disc.
     */
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0, 3, -2)
    const off = offsetOf(blob, 3, -2)
    expect(Math.hypot(off.x, off.z)).toBeGreaterThan(0.1)
  })

  it('moves along the sun direction, by mid-height times reach', () => {
    const s = sunShadow() as { x: number; z: number; reach: number }
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0.4, 3, -2)
    const want = (0.4 + 0.25 / 2) * s.reach
    expect(blob.position.x - 3).toBeCloseTo(s.x * want, 6)
    expect(blob.position.z + 2).toBeCloseTo(s.z * want, 6)
  })

  it('keeps the blob flat on the ground however far it is thrown', () => {
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 2, 0, 0)
    expect(blob.position.y).toBeCloseTo(SHADOW_LIFT, 9)
  })

  it('throws two casters at different heights in the SAME direction', () => {
    // The property Joe's note is really about: one light source, one bearing,
    // whatever is casting and wherever it stands.
    const low = createBlobShadow(0.17, 0.25)
    const high = createBlobShadow(0.4, 1.2)
    castShadow(low, 0.1, -4, 7)
    castShadow(high, 1.6, 11, 0.5)
    const a = offsetOf(low, -4, 7)
    const b = offsetOf(high, 11, 0.5)
    const dot = (a.x * b.x + a.z * b.z) / (Math.hypot(a.x, a.z) * Math.hypot(b.x, b.z))
    expect(dot).toBeCloseTo(1, 6)
    // ...and the higher one is thrown further, which is the other half of it.
    expect(Math.hypot(b.x, b.z)).toBeGreaterThan(Math.hypot(a.x, a.z))
  })

  it('ignores which way its owner is facing', () => {
    /*
     * Fred's blob hangs under a group that turns to face wherever he last
     * hopped. Offsetting in the blob's own space would swing his shadow round
     * with him — an animated version of the very complaint, and the reason
     * castShadow converts the sun into the parent's frame.
     */
    const still = new THREE.Group()
    const turned = new THREE.Group()
    turned.rotation.y = 1.1
    const a = createBlobShadow(0.16, 0.36)
    const b = createBlobShadow(0.16, 0.36)
    still.add(a)
    turned.add(b)
    castShadow(a, 0)
    castShadow(b, 0)

    const inWorld = (blob: THREE.Mesh): THREE.Vector3 => {
      blob.updateMatrixWorld(true)
      return blob.getWorldPosition(new THREE.Vector3())
    }
    const wa = inWorld(a)
    const wb = inWorld(b)
    expect(wb.x).toBeCloseTo(wa.x, 6)
    expect(wb.z).toBeCloseTo(wa.z, 6)
  })

  it('is already pointing the right way the moment it is made', () => {
    /*
     * Not everything animates its blob — the egg's is created and then left
     * alone for the rest of the game. A shadow that only turned to face the
     * sun once something moved would leave the most-tapped object on the
     * island as the one thing lit from overhead.
     */
    const blob = createBlobShadow(0.28)
    expect(Math.hypot(blob.position.x, blob.position.z)).toBeGreaterThan(0.1)
  })
})

describe('castShadow — shape', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  it('is an ellipse, not a circle', () => {
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0)
    expect(blob.scale.x).toBeGreaterThan(blob.scale.y * 1.5)
  })

  it('is stretched ALONG the direction it is thrown, not across it', () => {
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0, 0, 0)
    /*
     * The circle lies in the blob's local xy plane after the -90° x rotation,
     * so the major axis is local +x. Push it through the blob's own matrix and
     * it must come out parallel to the offset.
     */
    blob.updateMatrixWorld(true)
    const major = new THREE.Vector3(1, 0, 0)
      .transformDirection(blob.matrixWorld).normalize()
    const along = new THREE.Vector3(blob.position.x, 0, blob.position.z).normalize()
    expect(major.dot(along)).toBeCloseTo(1, 5)
  })

  it('stretches further for a taller body', () => {
    const short = createBlobShadow(0.17, 0.25)
    const tall = createBlobShadow(0.17, 0.9)
    castShadow(short, 0)
    castShadow(tall, 0)
    expect(tall.scale.x).toBeGreaterThan(short.scale.x)
    expect(tall.scale.y).toBeCloseTo(short.scale.y, 9)
  })

  it('still shrinks and fades with height (brief §3, airborne = smaller)', () => {
    const low = createBlobShadow(0.17, 0.25)
    const high = createBlobShadow(0.17, 0.25)
    castShadow(low, 0)
    castShadow(high, 1)
    expect(high.scale.y).toBeLessThan(low.scale.y)
    expect((high.material as THREE.MeshBasicMaterial).opacity)
      .toBeLessThan((low.material as THREE.MeshBasicMaterial).opacity)
  })
})

/**
 * Joe, carded: *"shadows from larger props"*.
 *
 * Lighting brief §3 asks for a blob under "every pet and loose prop". The pets
 * and Fred had one; the scenery had none, so on any tile with an animal on it
 * the trees and boulders were the only things floating.
 *
 * The interesting half is the word "larger", because a tile scatters five to
 * nine pieces of ground cover around its one feature and a blob under each is
 * litter on the grass and nine more draw calls on a tablet. So there is a
 * threshold, and these tests pin it against the FITS table it was derived from
 * rather than against the models that happen to be in the lists today.
 */

/** A box of the given size standing on the ground, like a fitted prop. */
const piece = (w: number, h: number, d = w): THREE.Object3D => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d))
  mesh.position.y = h / 2
  const holder = new THREE.Group()
  holder.add(mesh)
  return holder
}

/** Plant it in a group and hand back whatever blob it earned. */
const plant = (o: THREE.Object3D, at?: THREE.Vector3): {
  group: THREE.Group; holder: THREE.Object3D | null
} => {
  const group = new THREE.Group()
  if (at) o.position.copy(at)
  group.add(o)
  return { group, holder: shadowUnder(o, group) }
}

describe('the shadow threshold sits in the measured gaps', () => {
  /*
   * The assertions that stop the threshold rotting. Every ceiling below is
   * ARITHMETIC — a FITS entry times the largest multiplier its variation can
   * produce — so it holds for a model added to the lists next year as well as
   * for the ones measured today.
   */

  it('cannot be reached by ground cover, however the variation rolls', () => {
    const most = varyMax(VARY.cover)
    expect(FITS.cover[1] * most).toBeLessThan(SHADOW_MIN_HEIGHT)
    expect((FITS.cover[0] * most) / 2).toBeLessThan(SHADOW_MIN_REACH)
  })

  it('cannot be reached by a reed or a lily either', () => {
    // Water pieces are not shadowed at all, but a threshold that would admit
    // them is a threshold too low for the grass as well.
    const most = varyMax(VARY.cover)
    expect(FITS.reed[1] * most).toBeLessThan(SHADOW_MIN_HEIGHT)
    expect(FITS.lily[1] * most).toBeLessThan(SHADOW_MIN_HEIGHT)
  })

  it('is cleared by the shortest live tree there can ever be', () => {
    /*
     * Height binds on a tree — it is fitted taller than it is wide — so the
     * question is only whether the SMALLEST roll clears the arm. `varyMin`, not
     * `VARY.tree.min`: the floor is 0.51, not 0.95. It clears anyway, at 0.536.
     */
    expect(FITS.tree[1] * varyMin(VARY.tree)).toBeGreaterThan(SHADOW_MIN_HEIGHT)
  })

  it('is NOT cleared by the smallest dead trunk, and that is correct — PB-009', () => {
    /*
     * THE CARD, AND WHY THE TEST WAS THE DEFECT RATHER THAN THE PRODUCT.
     *
     * This assertion used to read `FITS.bare[1] * VARY.cover.min >
     * SHADOW_MIN_HEIGHT` and pass at 0.560, which certified that every dead
     * trunk on the island earns a blob. It does not. `VARY.cover.min` is not a
     * floor (see `varyMin`), the real floor is 0.36, and measured over 15,129
     * pieces 24.5% of dead trunks come out too small for either arm — which is
     * the "quarter of dead trunks flicker shadowless" the card reports.
     *
     * They are not flickering. A piece's size is a pure function of its hash, so
     * a given trunk is that size for the life of the save; what varies is which
     * trunk, not one trunk over time.
     *
     * And the rule is right. The shadow threshold is a rule about SIZE, not
     * about kind — deliberately, per the header above, so a model added next
     * year is judged the same way as the ones measured today. The smallest dead
     * trunk is 0.252 tall and 0.081 across: SHORTER than the reed at 0.322 and
     * NARROWER than the tuft at 0.260, both of which are excluded on purpose.
     * Giving it a blob because of what it is called, while the taller reed
     * beside it has none, would be less consistent on screen, not more.
     *
     * So the fix is here rather than in `shadowUnder`, and the numbers are
     * asserted from BOTH sides: the smallest is genuinely below, the trunk at
     * its nominal fit is genuinely above, and nobody may re-justify the
     * threshold against a floor that does not exist again.
     */
    const smallest = varyMin(VARY.cover)
    expect(FITS.bare[1] * smallest).toBeLessThan(SHADOW_MIN_HEIGHT)
    expect((FITS.bare[0] * smallest) / 2).toBeLessThan(SHADOW_MIN_REACH)
    // Smaller than the two things the threshold excludes on purpose.
    expect(FITS.bare[1] * smallest).toBeLessThan(FITS.reed[1] * varyMax(VARY.cover))
    expect((FITS.bare[0] * smallest) / 2)
      .toBeLessThan((FITS.cover[0] * varyMax(VARY.cover)) / 2)
    // A trunk at its unvaried fit, and every larger roll, still earns its blob.
    expect(FITS.bare[1]).toBeGreaterThan(SHADOW_MIN_HEIGHT)
    expect(FITS.bare[1] * varyMax(VARY.cover)).toBeGreaterThan(SHADOW_MIN_HEIGHT)
  })

  it('is cleared by the widest thing a grown plot can plant', () => {
    /*
     * The tight edge, and the reason the rule has a reach arm at all. A flat
     * boulder on a plot the child built is 0.144 tall — well under the height
     * arm — and is saved only by being FITS.grown wide. If that entry ever
     * narrows, this fails rather than the boulder quietly starting to float.
     */
    expect(FITS.grown[0] / 2).toBeGreaterThanOrEqual(SHADOW_MIN_REACH)
    // `varyMin`, not `VARY.feature.min` — the same false floor PB-009 was
    // about. Both still clear it, at 0.315 and 0.536, but on the real number.
    expect((FITS.feature[0] * varyMin(VARY.feature)) / 2).toBeGreaterThan(SHADOW_MIN_REACH)
    expect((FITS.big[0] * varyMin(VARY.feature)) / 2).toBeGreaterThan(SHADOW_MIN_REACH)
  })
})

describe('shadowUnder — which props are larger', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  it('gives a tree a blob', () => {
    const tree = piece(0.4, 1.0)
    fitInto(tree, ...FITS.tree)
    expect(plant(tree).holder).not.toBeNull()
  })

  it('gives a grass tuft nothing', () => {
    /*
     * At the preset's sun a tuft's blob would be two and a half times its own
     * width and would start outside its base. Five to nine of those per hex is
     * litter, not grounding.
     */
    const tuft = piece(0.3, 0.35)
    fitInto(tuft, ...FITS.cover)
    expect(plant(tuft).holder).toBeNull()
  })

  it('gives the widest tuft the variation can produce nothing either', () => {
    const most = varyMax(VARY.cover)
    const bush = piece(1, 0.4)
    fitInto(bush, FITS.cover[0] * most, FITS.cover[1] * most)
    expect(plant(bush).holder).toBeNull()
  })

  it('gives a low WIDE boulder a blob, which height alone would miss', () => {
    /*
     * `rock_single_A` measures 0.204 tall and 0.88 across as a tile feature —
     * shorter than some ground cover is allowed to be, and the size of half a
     * hex. A height-only rule would leave the biggest flat thing on the tile
     * as the one piece stuck to nothing.
     */
    const slab = piece(4, 1)
    fitInto(slab, ...FITS.feature)
    const box = new THREE.Box3().setFromObject(slab)
    expect(box.max.y - box.min.y).toBeLessThan(SHADOW_MIN_HEIGHT)
    expect(plant(slab).holder).not.toBeNull()
  })

  it('shadows nothing at all that has no geometry', () => {
    expect(plant(new THREE.Group()).holder).toBeNull()
  })
})

describe('shadowUnder — where the blob lands', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  it('is a real blob from juice.ts, not a second mechanism', () => {
    const tree = piece(0.4, 1.0)
    const { holder } = plant(tree)
    const blob = holder?.children[0] as THREE.Mesh
    expect(blob?.name).toBe('blobShadow')
    expect(blob.material).toBeInstanceOf(THREE.MeshBasicMaterial)
  })

  it('sits on the ground the piece stands on, not at y = 0', () => {
    /*
     * Props are planted at `surface.heightAt(x, z)`, and a coast ramp slopes.
     * `castShadow` writes y = SHADOW_LIFT in its PARENT's frame, so the holder
     * is what has to carry the ground height — a blob dropped straight into
     * the props group would hang above every tree standing on a beach.
     */
    const tree = piece(0.4, 1.0)
    const { holder } = plant(tree, new THREE.Vector3(1.4, -0.37, 2.1))
    const blob = holder?.children[0] as THREE.Mesh
    blob.updateMatrixWorld(true)
    expect(blob.getWorldPosition(new THREE.Vector3()).y)
      .toBeCloseTo(-0.37 + SHADOW_LIFT, 6)
  })

  it('agrees with the sun rather than sitting concentrically under the tree', () => {
    const sun = sunShadow() as { x: number; z: number }
    const tree = piece(0.4, 1.0)
    const { holder } = plant(tree, new THREE.Vector3(1.4, 0, 2.1))
    const blob = holder?.children[0] as THREE.Mesh
    const off = new THREE.Vector3(blob.position.x, 0, blob.position.z)
    expect(off.length()).toBeGreaterThan(0.1)
    expect(off.normalize().dot(new THREE.Vector3(sun.x, 0, sun.z))).toBeCloseTo(1, 5)
  })

  it('scales the blob to the piece, not to a fixed radius', () => {
    const small = piece(0.4, 1.0)
    const large = piece(1.6, 1.6)
    const a = plant(small).holder?.children[0] as THREE.Mesh
    const b = plant(large).holder?.children[0] as THREE.Mesh
    expect(b.userData.radius as number).toBeGreaterThan(a.userData.radius as number)
  })

  it('lands under the piece even when its model origin is off to one side', () => {
    /*
     * Several KayKit models are not centred on their own origin. Measuring the
     * BOX rather than trusting `position` is what keeps the shadow under the
     * thing rather than beside it.
     */
    const lopsided = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.5))
    mesh.position.set(0.9, 0.5, 0)
    lopsided.add(mesh)
    const { holder } = plant(lopsided)
    expect(holder?.position.x).toBeCloseTo(0.9, 6)
  })
})

describe('the tiles the island GROWS get shadows', () => {
  /*
   * The main path, driven end to end: a real `sync()` over a real island,
   * planting through the real hash, `fitInto`, `firstClear` and `scatter`.
   * Only the two loaders are stubbed, and they are the I/O.
   */
  const flat: Surface = { heightAt: () => 0, groundAt: () => 'green' }
  const island = {
    tiles: new Map<string, 'grass' | 'water'>([
      ['0,0', 'grass'], ['1,0', 'grass'], ['0,1', 'grass'],
      ['-1,1', 'grass'], ['1,-1', 'grass'], ['-1,0', 'grass'],
    ]),
  }

  beforeEach(() => {
    createLighting(null, MEADOW)
    vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync')
      .mockResolvedValue(new THREE.Texture())
  })

  /** Every blob holder the field has planted, wherever it planted it. */
  const blobsIn = (group: THREE.Object3D): THREE.Object3D[] => {
    const out: THREE.Object3D[] = []
    group.traverse(o => { if (o.name === 'prop-shadow') out.push(o) })
    return out
  }

  it('plants blobs under the scenery it grows', async () => {
    const props = createPropField()
    await props.sync(island, 1.15, flat)
    expect(blobsIn(props.group).length).toBeGreaterThan(0)
  })

  it('plants FAR fewer blobs than pieces — the tufts get none', async () => {
    /*
     * The whole point of the threshold. Six tiles scatter five to nine pieces
     * of cover each on top of their features; if every one of them cast, the
     * counts would be equal and the grass would be covered in ellipses.
     */
    const props = createPropField()
    await props.sync(island, 1.15, flat)
    const blobs = blobsIn(props.group).length
    const pieces = props.group.children.filter(
      c => c.name !== 'prop-shadow' && !/^cloud/.test(c.name)).length
    expect(blobs).toBeGreaterThan(0)
    expect(blobs).toBeLessThan(pieces / 2)
  })

  it('never puts one on a cloud', async () => {
    // They are 15 units up and 34 out. A blob under one would be a dark disc
    // sitting on the open sea.
    const props = createPropField()
    await props.sync(island, 1.15, flat)
    for (const blob of blobsIn(props.group)) {
      expect(blob.position.y).toBeLessThan(1)
    }
  })

  it('leaves a pond alone', async () => {
    /*
     * Water pieces are placed at y = 0 while the water hex's own surface sits
     * at -0.2, so a blob at their feet would hang above the pond. A lily's
     * shadow is under the lily in any case.
     */
    const props = createPropField()
    await props.sync({ tiles: new Map([['0,0', 'water'], ['1,0', 'water']]) }, 1.15, flat)
    expect(blobsIn(props.group)).toHaveLength(0)
  })
})

describe('the tiles they BUILD get shadows too', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  /*
   * There are two placement paths and fixing one is not fixing the other:
   * `props.ts` dresses tiles the island grows, `world/increments.ts` grows the
   * ones the child builds. Trees-inside-rocks was reported TWICE for exactly
   * this reason (HANDOFF §6). Shadowing only the first would be the worst
   * possible split: the floating tiles would be the ones the child made.
   *
   * The seam is `adopt()`, which is where a grown plot stops moving and
   * becomes that tile's own scenery. A blob living inside the plot itself
   * would hang in mid-air for the whole build, because the plot hovers.
   */
  const grownPlot = (): THREE.Group => {
    const grown = new THREE.Group()
    grown.position.set(3.2, 0, -2.4)     // at its socket, not at the origin
    const tree = piece(0.4, 1.0)
    tree.position.set(0.3, 0, 0.2)
    const tuft = piece(0.3, 0.14)
    tuft.position.set(-0.35, 0, 0.1)
    grown.add(tree, tuft)
    return grown
  }

  it('shadows the pieces they grew, by the same rule', () => {
    const props = createPropField()
    const grown = grownPlot()
    props.adopt({ q: 1, r: 0 }, grown, 1.15)
    const holders = grown.children.filter(c => c.name === 'prop-shadow')
    expect(holders).toHaveLength(1)          // the tree, not the tuft
  })

  it('does not shadow the shadows', () => {
    /*
     * A blob is a wide flat disc, so it clears the reach arm easily — and
     * `adopt` adds each holder to the very list of children it is walking. A
     * live iteration would shadow the shadow, then shadow THAT, and never
     * return. The snapshot is what stops it and the count is what proves it.
     */
    const props = createPropField()
    const grown = grownPlot()
    props.adopt({ q: 1, r: 0 }, grown, 1.15)
    expect(grown.children).toHaveLength(3)   // two pieces and one blob holder
  })

  it('keeps the grown shadow on the ground under its own socket', () => {
    const props = createPropField()
    const grown = grownPlot()
    props.adopt({ q: 1, r: 0 }, grown, 1.15)
    const holder = grown.children.find(c => c.name === 'prop-shadow') as THREE.Object3D
    const blob = holder.children[0] as THREE.Mesh
    grown.updateMatrixWorld(true)
    expect(blob.getWorldPosition(new THREE.Vector3()).y).toBeCloseTo(SHADOW_LIFT, 6)
  })
})

describe('the shadow never starts in front of the prop — Joe, 28 July', () => {
  /*
   * *"shadown needs to be pulled away from the sun, most places show it staring
   * in front of the prop. good rule may be the edge of the elipse sits on the
   * centre of the prop."*
   *
   * The mid-height projection alone puts the near edge at `air*reach - radius`,
   * so anything on the ground had a whole caster-radius of shadow reaching back
   * toward the sun. Physically that is correct — a cylinder's silhouette does
   * extend past its contact point — but a soft blob decal is read as the patch
   * BELONGING to an object rather than as its silhouette, so a dark smear in
   * front of a tree reads as a second object.
   *
   * The rule is therefore a readability choice, and asserted as one: the near
   * edge sits AT OR BEYOND the anchor, and nothing that was already further out
   * gets pulled in.
   */
  beforeEach(() => { createLighting(null, MEADOW) })

  /** How far along the sun's ground direction the ellipse's near edge falls. */
  const nearEdge = (blob: THREE.Mesh): number => {
    const s = sunShadow() as { x: number; z: number }
    const len = Math.hypot(s.x, s.z) || 1
    // Distance of the centre along the sun direction, minus the semi-major.
    const along = (blob.position.x * s.x + blob.position.z * s.z) / len
    const radius = blob.userData.radius as number
    return along - radius * blob.scale.x
  }

  it('puts the near edge at the prop centre for a tree standing on the ground', () => {
    // The case Joe measured by eye: tall body, narrow trunk.
    const blob = createBlobShadow(0.3, 1.0)
    castShadow(blob, 0)
    expect(nearEdge(blob)).toBeGreaterThan(-1e-6)
    expect(nearEdge(blob)).toBeLessThan(0.02)
  })

  it('holds for squat and for tall casters alike', () => {
    for (const [radius, body] of [[0.42, 0.24], [0.3, 1.0], [0.6, 1.8], [0.15, 0.5]] as const) {
      const blob = createBlobShadow(radius, body)
      castShadow(blob, 0)
      expect(nearEdge(blob), `r=${radius} h=${body}`).toBeGreaterThan(-1e-6)
    }
  })

  it('leaves a hovering caster its honest physical offset', () => {
    /*
     * The other half, and the reason this is a MAX rather than an assignment. A
     * bee at tree height is already thrown far past the floor; clamping it would
     * drag its shadow back under it and undo the flyer work.
     */
    const low = createBlobShadow(0.3, 0.4)
    castShadow(low, 0)
    const high = createBlobShadow(0.3, 0.4)
    castShadow(high, 2.4)
    const s = sunShadow() as { x: number; z: number; reach: number }
    const len = Math.hypot(s.x, s.z) || 1
    const alongOf = (b: THREE.Mesh): number =>
      (b.position.x * s.x + b.position.z * s.z) / len
    expect(alongOf(high)).toBeGreaterThan(alongOf(low) * 2)
    // ...and it is the physical projection, not the floor.
    expect(alongOf(high)).toBeCloseTo((2.4 + 0.4 / 2) * s.reach, 5)
  })

  it('still throws the shadow AWAY from the sun, not toward it', () => {
    const blob = createBlobShadow(0.3, 1.0)
    castShadow(blob, 0)
    const s = sunShadow() as { x: number; z: number }
    // Same half-plane as the sun's ground direction.
    expect(blob.position.x * s.x + blob.position.z * s.z).toBeGreaterThan(0)
  })
})
