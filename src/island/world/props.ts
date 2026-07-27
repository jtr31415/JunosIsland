/**
 * Scenery on the tiles: hills, mountains, trees, rocks — and clouds above.
 *
 * KayKit ships these pre-assembled, so an island gets its planted, hilly look
 * without per-object placement logic. Using the BREADTH of the pack is the
 * point: a field of identical small pine clumps reads as wallpaper, whereas a
 * mountain here, a wooded hill there and bare ground between them reads as a
 * place. Elevation does most of that work — a flat plane of hexes has no
 * silhouette under an orbit camera, and silhouette is what makes a diorama.
 *
 * Which prop a tile gets is DERIVED from its coordinate, never random: the
 * same hex must grow the same thing every time the island loads, or the world
 * rearranges itself behind the child's back between sessions.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { flattenImported } from '../lighting'
import { createBlobShadow } from '../juice'
import { toWorld } from './hex'
import type { Axial } from './hex'
import type { Island } from './grid'
import type { Surface, Ground } from './tiles'

/**
 * WHAT KIND OF PLACE a tile is.
 *
 * Tiles used to draw their feature and their ground cover from one global
 * weighted list, which gave every hex the same even sprinkle of everything.
 * Uniform variety is its own kind of uniform: two tiles side by side looked
 * interchangeable, and the island read as wallpaper.
 *
 * A character is picked per REGION rather than per tile, so neighbours tend to
 * agree and the island grows in patches — a wood here, a stony shoulder there,
 * highlands rising together into a range instead of one lonely peak per
 * hillside. That patchiness is what the KayKit reference renders have and a
 * per-tile roll cannot produce.
 */
export type Character = 'meadow' | 'wood' | 'rocky' | 'highland'

/*
 * Woods are the commonest character now, at Joe's request — "higher liklyhood
 * of forest/trees, the environment is just a bit too flat/boring". Rocky ground
 * is the rarest: it is the character with the least in it, so it is the one that
 * reads as empty.
 */
const CHARACTERS: Array<{ kind: Character; weight: number }> = [
  { kind: 'meadow', weight: 3 },
  { kind: 'wood', weight: 6 },
  { kind: 'rocky', weight: 2 },
  { kind: 'highland', weight: 4 },
]

/**
 * The big feature each character grows, weighted within its own kind.
 *
 * `big` pieces are landscape rather than objects — they sit centred, block a
 * wider radius and carry the island's skyline. A flat plane of hexes has no
 * silhouette under an orbit camera, and silhouette is what makes a diorama.
 */
const FEATURES: Record<Character, Array<{ name: string; weight: number; big?: boolean }>> = {
  meadow: [
    /*
     * Open ground was weight 8 of 17 — nearly half of all meadow tiles grew no
     * feature at all, which is a large part of what "too flat and boring" was
     * describing. Still the single commonest outcome, because a landscape with
     * no rests in it is just as tiring, but no longer the majority.
     */
    { name: '', weight: 4 },                       // open ground: the rests
    { name: 'tree_single_A', weight: 3 },
    { name: 'tree_single_B', weight: 3 },
    { name: 'trees_A_small', weight: 2 },
    { name: 'trees_B_small', weight: 2 },
    { name: 'rock_single_A', weight: 2 },
    { name: 'tree_single_A_cut', weight: 1 },
  ],
  wood: [
    { name: 'trees_A_small', weight: 5 },
    { name: 'trees_A_medium', weight: 4 },
    { name: 'trees_B_small', weight: 4 },
    { name: 'trees_B_medium', weight: 3 },
    { name: 'trees_A_large', weight: 2 },
    { name: 'hills_A_trees', weight: 3, big: true },
    { name: 'hills_B_trees', weight: 3, big: true },
    { name: '', weight: 2 },
  ],
  rocky: [
    { name: 'rock_single_A', weight: 3 },
    { name: 'rock_single_B', weight: 3 },
    { name: 'rock_single_C', weight: 2 },
    { name: 'rock_single_D', weight: 2 },
    /*
     * Stony ground gets a skyline of its own, at Joe's "a bit more use of the
     * mountain/rock hexes". It used to be the one character with nothing tall in
     * it but a single hill, which is what made it read as the empty one.
     */
    { name: 'hills_C', weight: 3, big: true },
    { name: 'hills_C_trees', weight: 2, big: true },
    { name: 'mountain_C_grass', weight: 2, big: true },
    { name: '', weight: 2 },
  ],
  highland: [
    { name: 'hills_A', weight: 4, big: true },
    { name: 'hills_B', weight: 4, big: true },
    { name: 'hills_C', weight: 3, big: true },
    { name: 'hills_C_trees', weight: 3, big: true },
    /*
     * The BARE mountain variants are deliberately absent.
     *
     * They carry no grass and sample the atlas's rock swatch, which on a
     * green summer island reads as a sand mesa dropped in from a desert —
     * two of them side by side looked like a bug rather than a mountain.
     * The grass-topped variants say "mountain" without leaving the biome.
     */
    /*
     * Mountains are RARE, even in the highlands.
     *
     * A mountain on every other highland hex is not a range, it is a wall —
     * and the Summer atlas renders their rock tan, so a cluster of them reads
     * as desert on a green island. Hills carry the skyline; a mountain is the
     * exclamation mark at the end of it.
     */
    { name: 'mountain_A_grass', weight: 3, big: true },
    { name: 'mountain_B_grass', weight: 3, big: true },
    { name: 'mountain_C_grass', weight: 3, big: true },
    { name: 'mountain_A_grass_trees', weight: 3, big: true },
    { name: 'mountain_C_grass_trees', weight: 3, big: true },
  ],
}

/**
 * Ground cover from the Forest Nature pack — the small stuff that makes a tile
 * look inhabited rather than decorated.
 *
 * Deliberately a SECOND layer over the features above: the hexagon pack
 * supplies landscape, this supplies undergrowth, and nearly every tile gets
 * some. That two-layer split is what stops the island reading as a tidy
 * arrangement of objects.
 *
 * The pack ships 105 models and this used to place EIGHT of them, so every
 * tile drew its cover from the same handful and the repetition was obvious
 * across any two hexes. The lists below are per character, so a rocky
 * shoulder is stony and a meadow is grassy rather than both being an even mix.
 *
 * It has its OWN texture, not the hexagon atlas.
 */
export const COVER: Record<Character, readonly string[]> = {
  meadow: [
    'Grass_1_A_Color1', 'Grass_1_B_Color1', 'Grass_1_C_Color1', 'Grass_1_D_Color1',
    'Grass_2_A_Color1', 'Grass_2_B_Color1', 'Grass_2_C_Color1', 'Grass_2_D_Color1',
    'Bush_1_A_Color1', 'Bush_1_C_Color1', 'Bush_2_B_Color1', 'Bush_3_A_Color1',
    'Rock_1_C_Color1', 'Rock_2_D_Color1',
  ],
  wood: [
    'Bush_1_A_Color1', 'Bush_1_B_Color1', 'Bush_1_D_Color1', 'Bush_1_F_Color1',
    'Bush_2_A_Color1', 'Bush_2_C_Color1', 'Bush_2_E_Color1',
    'Bush_4_A_Color1', 'Bush_4_C_Color1', 'Bush_4_E_Color1',
    'Grass_1_B_Color1', 'Grass_2_C_Color1',
    'Rock_1_H_Color1', 'Rock_3_D_Color1',
  ],
  rocky: [
    'Rock_1_A_Color1', 'Rock_1_D_Color1', 'Rock_1_G_Color1', 'Rock_1_K_Color1',
    'Rock_1_N_Color1', 'Rock_2_A_Color1', 'Rock_2_C_Color1', 'Rock_2_F_Color1',
    'Rock_3_A_Color1', 'Rock_3_E_Color1', 'Rock_3_J_Color1', 'Rock_3_M_Color1',
    'Rock_3_Q_Color1', 'Grass_1_C_Color1', 'Bush_3_B_Color1',
  ],
  highland: [
    'Rock_1_B_Color1', 'Rock_1_I_Color1', 'Rock_1_P_Color1',
    'Rock_2_B_Color1', 'Rock_2_G_Color1', 'Rock_3_C_Color1', 'Rock_3_H_Color1',
    'Rock_3_O_Color1', 'Grass_1_D_Color1', 'Grass_2_B_Color1',
    'Bush_3_C_Color1', 'Bush_4_F_Color1',
  ],
}

/**
 * A dead tree among live ones, occasionally.
 *
 * The cheapest way to stop a wood looking planted: real woods have one.
 */
/**
 * The Forest Nature pack's LEAFY trees — fifteen of them, and until now not one
 * was used.
 *
 * Joe: *"i'd also like to see more trees from the nature/forest kay pack. also
 * higher liklyhood of forest/trees, the environment is just a bit too
 * flat/boring."* Measured against the folder, he is describing an omission
 * rather than a tuning problem: the pack ships `Tree_1_A..C`, `Tree_2_A..E`,
 * `Tree_3_A..C` and `Tree_4_A..C`, and the only trees the island ever planted
 * from it were the six BARE ones below, as an occasional dead trunk.
 *
 * They go in as COVER rather than as tile features, which is the point. A
 * feature is one big thing per hex; cover is the five-to-nine small things
 * scattered round it, so drawing trees from here is what makes a wood look like
 * a wood instead of one tree standing in a field.
 */
export const LEAFY_TREES = [
  'Tree_1_A_Color1', 'Tree_1_B_Color1', 'Tree_1_C_Color1',
  'Tree_2_A_Color1', 'Tree_2_B_Color1', 'Tree_2_C_Color1',
  'Tree_2_D_Color1', 'Tree_2_E_Color1',
  'Tree_3_A_Color1', 'Tree_3_B_Color1', 'Tree_3_C_Color1',
  'Tree_4_A_Color1', 'Tree_4_B_Color1', 'Tree_4_C_Color1',
] as const

/**
 * How often a piece of ground cover is a tree instead, per character.
 *
 * One in N, against the five-to-nine pieces a tile scatters. A wood therefore
 * grows two or three, which reads as woodland; a meadow gets one now and then,
 * which reads as a meadow with a tree in it. Rocky ground stays nearly bare on
 * purpose — the contrast is what makes the wooded tiles look wooded.
 */
export const TREE_EVERY: Record<Character, number> = {
  wood: 3,
  highland: 5,
  meadow: 8,
  rocky: 13,
}

export const BARE_TREES = [
  'Tree_Bare_1_A_Color1', 'Tree_Bare_1_B_Color1', 'Tree_Bare_1_C_Color1',
  'Tree_Bare_2_A_Color1', 'Tree_Bare_2_B_Color1', 'Tree_Bare_2_C_Color1',
]

/** What grows on water. The same set the growing plot builds a pond from. */
const WATER_PIECES = [
  'waterlily_A', 'waterlily_B', 'waterplant_A', 'waterplant_B', 'waterplant_C',
]

/** World centre of a hex — a local alias so scatter can be called early. */
const w0 = (a: Axial, hexSize: number): { x: number; z: number } => toWorld(a, hexSize)

/** Pull q and r back out of a tile key. */
const parts0 = (k: string): number => Number(k.split(',')[0])
const parts1 = (k: string): number => Number(k.split(',')[1])

/**
 * What ground a piece is willing to stand on.
 *
 * Trees, bushes and grass need soil, so they keep to the green. Stone does
 * not care — a rock on a beach is a rock on a beach — so rocks may also sit
 * on the sand of a coast ramp. Nothing may stand over open water, which on a
 * coast tile means the part of the hex that has been cut away entirely.
 */
const ROCKY = /rock/i
const allows = (name: string, ground: Ground): boolean =>
  ground === 'green' || (ground === 'sand' && ROCKY.test(name))

/**
 * Scale an object to fit inside a box, without distorting it.
 *
 * ONE function, because fitting by a single dimension is a bug generator and
 * this project produced three of them in an afternoon. Fit by height and a
 * lily pad — 0.02 units tall and nearly a metre across — is blown up to a
 * hex-sized tan disc. Fit by width and a tall thin tree is squashed to a
 * shrub. Neither dimension is "the" one: the piece has to fit both.
 *
 * These packs disagree about scale by up to ninefold WITHIN a single family
 * (Forest Nature's Rock_1 runs 0.54 to 4.58 units tall), so nothing here may
 * use a fixed multiplier. Everything is measured and fitted, and any model
 * added later is normalised for free.
 */
export function fitInto(o: THREE.Object3D, maxWidth: number, maxHeight: number): void {
  o.scale.setScalar(1)
  /*
   * Refresh the world matrices FIRST. Box3.setFromObject reads matrixWorld,
   * and for an object not yet in the scene those are stale — several KayKit
   * models carry a transform on the node above the mesh, so measuring them
   * cold reports the wrong size and the correction goes wild.
   */
  o.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(o)
  const width = Math.max(box.max.x - box.min.x, box.max.z - box.min.z)
  const height = box.max.y - box.min.y
  const fit = Math.min(
    width > 1e-4 ? maxWidth / width : Infinity,
    height > 1e-4 ? maxHeight / height : Infinity,
  )
  if (Number.isFinite(fit) && fit > 0) o.scale.setScalar(fit)
}

/** A circle of ground something solid already stands on. */
export interface Footprint { x: number; z: number; r: number }

/**
 * Half the widest horizontal extent of an object, AS FITTED.
 *
 * Measured, never assumed, for the same reason `fitInto` exists: the packs
 * disagree about scale by up to ninefold within one family, so a nominal
 * keep-out radius would be far too generous for a pebble and far too mean for
 * a boulder. Refreshes world matrices first — several KayKit models carry a
 * transform on the node above the mesh, and measuring them cold lies.
 */
export function footprintOf(o: THREE.Object3D): number {
  o.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(o)
  return Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2
}

/**
 * How tall a thing has to be to be in a pet's way.
 *
 * A pet stands about 0.24 units and Fred about 0.35, so anything measured
 * below this is what a walking creature can actually bump into.
 */
export const WALKING_HEIGHT = 0.3

/**
 * The widest horizontal reach of an object BELOW a given height, as fitted.
 *
 * The difference between this and `footprintOf` is a tree. Its canopy is the
 * widest part of it and a pet walking under a canopy has not clipped
 * anything — blocking the full width would have pets swerving around thin air
 * while still, at the trunk, being free to walk through the bit that is
 * solid. Measuring at walking height asks the question that matters: what is
 * in the way of something moving along the ground?
 *
 * Hills and mountains are solid all the way down, so for them this returns
 * very nearly the full footprint, which is the point — that is where pets were
 * walking into the scenery.
 */
export function footprintBelow(o: THREE.Object3D, height: number): number {
  o.updateMatrixWorld(true)
  const whole = new THREE.Box3().setFromObject(o)
  if (!Number.isFinite(whole.min.y)) return 0
  const ceiling = whole.min.y + height
  const centre = new THREE.Vector3(
    (whole.min.x + whole.max.x) / 2, 0, (whole.min.z + whole.max.z) / 2)

  let reach = 0
  const v = new THREE.Vector3()
  o.traverse(node => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh) return
    const pos = mesh.geometry?.getAttribute('position')
    if (!pos) return
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos as THREE.BufferAttribute, i).applyMatrix4(mesh.matrixWorld)
      if (v.y > ceiling) continue
      reach = Math.max(reach, Math.hypot(v.x - centre.x, v.z - centre.z))
    }
  })
  /*
   * Nothing down there at all — a cloud, or a piece floating clear of the
   * ground. Nothing to walk into, so nothing to walk around.
   */
  return reach
}

/**
 * Would a piece of radius `r` centred at (x, z) stand inside something solid?
 *
 * Circles rather than boxes, and touching counts as clear: two pieces whose
 * footprints just kiss look like two things next to each other, which is what
 * a wood is. It is the overlap that reads as a mistake.
 */
export function standsInside(
  x: number, z: number, r: number, solid: readonly Footprint[],
): boolean {
  return solid.some(f => Math.hypot(f.x - x, f.z - z) < f.r + r)
}

/**
 * The first of several candidate spots that a piece of radius `r` can actually
 * stand in: on ground it accepts, and clear of everything solid already there.
 *
 * Candidates are supplied in preference order and the FIRST acceptable one
 * wins, which is what keeps the island still. Every candidate is derived from
 * the tile's hash, so a piece that was already standing clear is offered its
 * old spot first and does not move; only the pieces that were inside a rock go
 * looking. Nothing here may consult a random number — the same hex must grow
 * the same thing in the same place every time the island loads.
 *
 * Returning null is a real answer, and the right one. A slightly barer tile
 * looks finished; a tree standing inside a boulder looks broken.
 */
export function firstClear<T extends { x: number; z: number }>(
  candidates: readonly T[],
  r: number,
  onGround: (x: number, z: number) => boolean,
  solid: readonly Footprint[],
): T | null {
  for (const c of candidates) {
    if (!onGround(c.x, c.z)) continue
    if (standsInside(c.x, c.z, r, solid)) continue
    return c
  }
  return null
}

/**
 * How much room each kind of thing may take, as [width, height] in world
 * units — width relative to the hex, height against a PET.
 *
 * A pet is about 0.24 units tall and Fred about 0.35, so ground cover
 * reaching a pet's knee registers as ground cover, and a hill has to clear
 * both to read as landscape rather than as an object left lying there.
 */
export const FITS = {
  /** Tufts, stones, undergrowth. */
  cover: [0.42, 0.16] as const,
  /** A dead tree standing among live ones. */
  bare: [0.45, 0.7] as const,
  /**
   * A LIVE tree from the Forest Nature pack.
   *
   * Joe: *"the trees need to be a bit bigger, or at least spawn fewer small ones
   * in favour of bigger ones."* Both halves are here — this is larger than the
   * dead-trunk fit it borrowed at first, and the per-piece variation that
   * multiplies it starts higher for trees, so the small end of the range is
   * simply gone rather than merely rarer.
   *
   * Taller than it is wide, unlike everything else in this table, because that
   * is what distinguishes a tree from a bush at a glance — and height is free
   * here: a canopy well above WALKING_HEIGHT is not an obstacle a pet can clip.
   */
  tree: [0.58, 1.05] as const,
  /** Single trees and small clumps. */
  feature: [1.0, 0.95] as const,
  /**
   * The same pieces, GROWN on a plot rather than planted as a tile's feature.
   *
   * Smaller, and it has to be: props.ts plants ONE feature on a hex, while the
   * growing plot arranges EIGHT of them on the same hex. Eight pieces a hex
   * wide do not fit round a hex — that is arithmetic, not taste, and it is why
   * a tree kept ending up inside a rock on the tiles she built herself.
   *
   * Measured rather than guessed: across four thousand seeded plots, feature
   * pieces at full size can only be placed 74% of the time without
   * overlapping; at this size, 94%.
   */
  grown: [0.62, 0.6] as const,
  /**
   * A forest tree on a GROWN plot.
   *
   * Same bargain as `grown` — eight pieces round one hex, so nothing may be as
   * big as it would be planted on its own — but not as short. A tree squashed to
   * the general grown height reads as a bush, which defeats the point of putting
   * trees on the tiles she builds.
   */
  grownTree: [0.5, 0.86] as const,
  /**
   * Hills and mountains. These carry their own hex base, so at full width
   * they cover the tile and read as REPLACING it; a green rim around the base
   * is what turns a mountain back into a feature of the meadow it rose from.
   */
  big: [1.7, 1.7] as const,
  /** Lily pads: flat and wide, so width is what binds. */
  lily: [0.5, 0.12] as const,
  /** Reeds: the opposite. */
  reed: [0.3, 0.26] as const,
} as const

/**
 * Per-piece size variation, as a multiplier on the FITS entry above.
 *
 * Per PIECE and never per tile, or a tile reads as one stamped set. Written
 * down here rather than left inline because the MAXIMUM is what decides
 * whether a piece of ground cover can ever grow big enough to cross the shadow
 * threshold below — and a ceiling copied by hand into a comment is exactly the
 * kind of claim this project has watched go stale. `varyMax` derives it: the
 * largest value of `h % span` is `span - 1`.
 *
 * The arithmetic is unchanged from when these numbers were inline, and it has
 * to be: `vary` feeds `fitInto`, which feeds `footprintOf`, which decides where
 * a piece stands. A different multiplier would rearrange every tile on the
 * island behind the child's back.
 */
export const VARY = {
  /** Tufts, stones, undergrowth, dead trunks, water plants. */
  cover: { min: 0.8, span: 45 },
  /**
   * Live trees start higher. Joe asked for "fewer small ones in favour of
   * bigger ones", and raising the floor removes the small end rather than
   * merely making it less likely.
   */
  tree: { min: 0.95, span: 45 },
  /** Tile features and landscape. */
  feature: { min: 0.88, span: 26 },
} as const

/** The largest multiplier a given variation can produce. */
export const varyMax = (v: { min: number; span: number }): number =>
  v.min + (v.span - 1) / 100

/* ---------- which props are "larger", and therefore cast ----------
 *
 * Lighting brief §3 wants a blob under "every pet and loose prop", and the
 * pets have had one for a while — so on any tile with animals on it the
 * scenery was the only thing floating. But a tile scatters FIVE TO NINE pieces
 * of ground cover around its one feature, and a tuft is not a prop in the sense
 * §3 means: at the preset's 35° sun a 0.198-tall tuft measuring 0.095 across
 * throws an ellipse 0.47 long — two and a half times its own width — starting
 * 0.14 out from its base. Nine of those per hex is not grounding, it is litter,
 * and it is nine more draw calls and nine more transparent quads of overdraw on
 * a tablet.
 *
 * So there is a threshold, and it is taken from the measured pack rather than
 * chosen. Every piece goes through `fitInto` before it is planted, so its size
 * is bounded by the FITS entry it was fitted to times the per-piece variation
 * `scatter`/`sync` apply — which makes these ceilings ARITHMETIC rather than a
 * property of the 49 cover models that happen to be in the lists today. Every
 * number below was measured off the `.gltf` files, at the size each piece is
 * actually planted:
 *
 *                              fitted height     fitted reach (half-width)
 *   ground cover  (5-9/tile)   0.128 .. 0.198    0.018 .. 0.260
 *   water reeds                0.147 .. 0.322    0.065 .. 0.186
 *   water lilies               0.032 .. 0.073    0.200 .. 0.310
 *   grown-plot cover           0.128 .. 0.160    0.018 .. 0.210
 *   grown-plot rock slabs      0.144 .. 0.352    0.310
 *   grown-plot trees           0.479 .. 0.860    0.144 .. 0.310
 *   bare trees                 0.506 .. 0.868    0.058 .. 0.279
 *   live trees                 0.567 .. 1.460    0.173 .. 0.403
 *   tile features              0.204 .. 1.073    0.201 .. 0.565
 *   hills and mountains        0.337 .. 1.921    0.645 .. 0.961
 *
 * TWO arms, because one is provably not enough. A height-only rule loses
 * `rock_single_A` — a slab 0.88 across and 0.20 tall, exactly the sort of thing
 * that reads as stuck to nothing — and worse, its height straddles any line
 * drawn near the cover ceiling, so the SAME model would gain and lose its
 * shadow depending on the tile's hash. A reach-only rule cannot separate a
 * bushy tuft (0.260) from a thin bare trunk (0.058).
 *
 * Each number is the middle of a measured GAP rather than a taste:
 *
 *   height  must exclude reeds at 0.322 and admit the shortest bare tree at
 *           0.506. Gap (0.322, 0.506); 0.40 sits 24% above and 21% below.
 *   reach   must exclude cover at 0.260 and admit a grown rock slab at 0.310
 *           — which is FITS.grown's own half-width, so it is a constant and
 *           not a model. Gap (0.260, 0.310); 0.29 sits 11% above and 7% below.
 *
 * Both edges are pinned against the FITS table by tests, so a future change to
 * how big anything is fitted fails the suite rather than quietly putting nine
 * shadows on every hex or taking the shadow off every boulder.
 */
export const SHADOW_MIN_HEIGHT = 0.4
export const SHADOW_MIN_REACH = 0.29

/**
 * Give a piece of planted scenery its blob, if it is big enough to want one.
 *
 * Uses `createBlobShadow` and nothing else — the sun already lives inside it
 * (juice.ts `castShadow` offsets by cot(elevation) and stretches along that
 * axis), so a second mechanism here would be a second answer to a question
 * that already has one.
 *
 * The blob goes in a HOLDER at the piece's feet rather than under the piece
 * itself, for two measured reasons. `castShadow` writes `position.y =
 * SHADOW_LIFT` in its parent's frame, so its parent has to be the ground: a
 * blob dropped straight into the props group would sit at y = 0.02 while its
 * tree stands on a coast ramp half a unit lower. And parenting it to the piece
 * would scale it by that piece's fit — `fitInto` leaves scales anywhere from
 * 0.05 to 4 — taking the lift and the soft edge with it.
 *
 * Returns the holder, or null when the piece is too small to bother. `into`
 * must already be this piece's ancestor, because everything here is measured
 * off world matrices.
 */
export function shadowUnder(
  o: THREE.Object3D, into: THREE.Object3D,
): THREE.Object3D | null {
  o.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(o)
  if (!Number.isFinite(box.min.y)) return null

  const height = box.max.y - box.min.y
  /*
   * Half the widest horizontal extent, exactly as `footprintOf` measures it —
   * the FULL width, not `footprintBelow`'s walking-height slice. A canopy is
   * not in a pet's way, but it is very much in the sun's.
   */
  const reach = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2
  if (height < SHADOW_MIN_HEIGHT && reach < SHADOW_MIN_REACH) return null

  // Where it touches down: the middle of its footprint, at the bottom of it.
  const feet = new THREE.Vector3(
    (box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2)
  into.updateMatrixWorld(true)
  into.worldToLocal(feet)

  const holder = new THREE.Group()
  holder.name = 'prop-shadow'
  holder.position.copy(feet)
  holder.add(createBlobShadow(reach, height))
  into.add(holder)
  return holder
}

/**
 * Stable per-coordinate hash, so a tile's scenery never changes.
 *
 * Exported so tests can drive `coverPiece` with the numbers the island really
 * produces. UNSIGNED, which is the whole point of the `>>> 0` — and the reason
 * every consumer of it must use `>>>` rather than `>>` when it shifts.
 */
export function hash(a: Axial): number {
  let h = (a.q * 73856093) ^ (a.r * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  return h
}

/** Weighted choice from a list, driven by a hash rather than by chance. */
function pick<T extends { weight: number }>(list: readonly T[], h: number): T {
  const total = list.reduce((n, x) => n + x.weight, 0)
  let r = h % total
  for (const x of list) {
    r -= x.weight
    if (r < 0) return x
  }
  return list[0] as T
}

/**
 * What kind of place this tile is.
 *
 * Derived from a COARSE coordinate — neighbouring hexes usually fall in the
 * same cell and so share a character. That is what makes highlands cluster
 * into a range and woods into a wood, instead of every tile rolling
 * independently and the whole island averaging out to the same texture.
 *
 * The blend with the tile's own hash keeps region edges ragged; without it
 * the patches are visibly rectangular.
 */
function characterOf(a: Axial): Character {
  const region = hash({ q: Math.floor(a.q / 2), r: Math.floor(a.r / 2) })
  const jitter = hash(a) % 5 === 0 ? hash({ q: a.r, r: a.q }) : 0
  return pick(CHARACTERS, (region ^ jitter) >>> 0).kind
}

/**
 * Which piece one scattered slot grows, from that slot's own hash.
 *
 * Pulled out of `scatter` because it produced a MODEL NAME THAT DID NOT EXIST,
 * and a bug that names a file wants a test that can name every file.
 *
 * `hash` is unsigned 32-bit, so half of all hashes have the top bit set — and
 * `>>` is the SIGNED shift, so for those it goes negative. A negative index
 * into `LEAFY_TREES` is `undefined`; `forestModel(undefined)` fetches
 * `forest/undefined.gltf`; the dev server answers with index.html; GLTFLoader
 * throws on the `<`; and the rejection escapes `sync()`, which is a loop over
 * EVERY tile on the island. So one bad tree left every hex after it bare, and
 * `void props.sync(...)` swallowed the reason. Found in the browser, in the
 * network log, on an island of nineteen hexes of which exactly ONE had any
 * scenery on it. Measured across a 13x13 field: 8.4% of scattered pieces
 * resolved to `undefined`, in 237 of 676 tile-and-character combinations.
 *
 * `>>>` fixes it and moves nothing that worked: the two shifts are identical
 * for every hash below 2^31, which is every case that was not already
 * throwing. The other shifts in this file feed angles, rotations and size
 * multipliers, where a negative value is survivable; this is the only one that
 * indexes an array.
 */
export function coverPiece(
  character: Character, dh: number,
): { name: string; kind: 'cover' | 'tree' | 'bare' } {
  /*
   * One dead tree now and then, in woods and highlands. The cheapest way to
   * stop a wood looking planted: real woods have one.
   */
  if ((character === 'wood' || character === 'highland') && dh % 23 === 0) {
    return { name: BARE_TREES[dh % BARE_TREES.length] as string, kind: 'bare' }
  }
  /*
   * ...and a LIVE tree rather more often than that. Checked after the dead
   * trunk, so that keeps its old rarity rather than competing with this.
   */
  if (dh % (TREE_EVERY[character] as number) === 0) {
    return {
      name: LEAFY_TREES[(dh >>> 5) % LEAFY_TREES.length] as string, kind: 'tree',
    }
  }
  const palette = COVER[character]
  return { name: palette[dh % palette.length] as string, kind: 'cover' }
}

export interface PropField {
  group: THREE.Group
  sync(island: Island, hexSize: number, surface: Surface): Promise<void>
  /** Where scenery stands, so pets walk around it rather than through. */
  obstacles(): Array<{ x: number; z: number; r: number }>
  /**
   * Load one scenery piece by name, textured and ready to add.
   *
   * Shared with the growing plot so a tile under construction grows the SAME
   * trees and rocks it will keep once finished — building it out of stand-in
   * primitives and swapping them at the end would make completion a visual
   * discontinuity rather than the last step of a sequence.
   */
  load(name: string): Promise<THREE.Object3D>
  /**
   * Take over the scenery a plot grew, as that tile's own.
   *
   * She watched those eight things arrive one at a time. Disposing them at
   * touchdown and planting a different eight from the hash means the tile she
   * built is not the tile she gets — the trees move and change species in the
   * frame the scaffolding disappears. So the plot's group becomes the tile's
   * scenery, and sync() leaves that hex alone forever after.
   */
  adopt(a: Axial, grown: THREE.Object3D, hexSize: number): void
  /**
   * EVERYTHING standing on the ground, ground cover included.
   *
   * Distinct from obstacles() on purpose. A pet steps over a grass tuft, so a
   * tuft is no obstacle — but an egg sitting in one is half-buried and cannot
   * be tapped cleanly, and the egg is the single most important thing on the
   * island to be able to tap. So the egg avoids all of this; pets avoid only
   * what they would actually walk into.
   */
  clutter(): Array<{ x: number; z: number; r: number }>
  update(dt: number, t: number): void
}

export function createPropField(base = ''): PropField {
  const group = new THREE.Group()
  group.name = 'props'
  const loader = new GLTFLoader()
  const cache = new Map<string, THREE.Object3D>()
  const placed = new Set<string>()
  const blocks: Array<{ x: number; z: number; r: number }> = []
  const decor: Array<{ x: number; z: number; r: number }> = []

  /**
   * Where solid scenery already stands, at its MEASURED size.
   *
   * A third list, and deliberately not one of the two above, because it
   * answers a different question. `blocks` is what a pet must walk round and
   * `decor` is what the egg must not stand in; this is what a new piece of
   * scenery must not be planted inside. Joe, playing: "trees are clipping into
   * the larger rock pieces, looks odd." They were — `scatter` ran immediately
   * after the tile's big feature was added and knew nothing about it, while
   * the feature blocks a radius of half a hex and cover starts scattering at
   * 0.18 of one. Roughly the inner half of every tile's undergrowth was
   * planted inside its own rock.
   *
   * Measured rather than assumed, because these packs vary ninefold within a
   * family and a nominal radius would be wrong in both directions.
   */
  const footprints: Footprint[] = []

  const clouds: THREE.Object3D[] = []
  let atlas: THREE.Texture | null = null
  let forestTex: THREE.Texture | null = null

  async function sharedAtlas(): Promise<THREE.Texture> {
    if (atlas) return atlas
    const t = await new THREE.TextureLoader().loadAsync(
      `${base}props/hexagons_medieval_Summer.png`)
    t.colorSpace = THREE.SRGBColorSpace
    t.flipY = false
    // Same gradient-atlas treatment as the tiles: mips bleed one swatch into
    // the next, which turns green trees muddy at distance.
    t.generateMipmaps = false
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    atlas = t
    return t
  }

  async function forestTexture(): Promise<THREE.Texture> {
    if (forestTex) return forestTex
    const t = await new THREE.TextureLoader().loadAsync(`${base}forest/forest_texture.png`)
    t.colorSpace = THREE.SRGBColorSpace
    t.flipY = false
    forestTex = t
    return t
  }

  /** Forest Nature pack piece — its own folder and its own texture. */
  async function forestModel(name: string): Promise<THREE.Object3D> {
    const hit = cache.get('forest:' + name)
    if (hit) return hit.clone(true)
    const gltf = await loader.loadAsync(`${base}forest/${name}.gltf`)
    flattenImported(gltf.scene)
    const tex = await forestTexture()
    gltf.scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) (m.material as THREE.MeshStandardMaterial).map = tex
    })
    cache.set('forest:' + name, gltf.scene)
    return gltf.scene.clone(true)
  }

  async function model(name: string): Promise<THREE.Object3D> {
    const hit = cache.get(name)
    if (hit) return hit.clone(true)
    const gltf = await loader.loadAsync(`${base}props/${name}.gltf`)
    flattenImported(gltf.scene)
    const tex = await sharedAtlas()
    gltf.scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) (m.material as THREE.MeshStandardMaterial).map = tex
    })
    cache.set(name, gltf.scene)
    return gltf.scene.clone(true)
  }

  /**
   * Ground cover around whatever the tile grew: tufts, stones, undergrowth.
   *
   * Sized against a PET, not the tile. The forest pieces are 0.23-0.58 units
   * tall, so the first attempt at 0.16 scale rendered them at about 0.05 —
   * invisible beside a 0.24-tall pet. Ground cover has to come up to roughly
   * a pet's knee to register as ground cover at all.
   *
   * Small enough that pets walk over it, so it adds no obstacles — but it IS
   * counted as clutter, because an egg standing in a bush cannot be tapped.
   */
  async function scatter(
    a: Axial, w: { x: number; z: number }, character: Character,
    h: number, hexSize: number, surface: Surface,
    /** Keep everything at least this far out, leaving the middle clear. */
    innerClear = 0,
  ): Promise<void> {
    const count = 5 + (h % 5)
    for (let d = 0; d < count; d++) {
      const dh = hash({ q: a.q * 31 + d, r: a.r * 17 - d })
      const { name, kind } = coverPiece(character, dh)
      const bare = kind === 'bare'
      const leafy = kind === 'tree'

      /*
       * Size it BEFORE siting it. The piece has to know how much room it
       * takes before it can be asked whether it fits anywhere, and fitInto
       * does not care where the object is.
       *
       * A piece that will not load costs a piece, not the island.
       *
       * The other half of the `undefined.gltf` fault above: the throw escaped
       * `sync()`, which is a loop over every tile, so ONE unloadable model left
       * every remaining hex bare. `increments.ts` already has this rule in as
       * many words — "a missing piece leaves a gap, never a broken build" — and
       * this is the path that did not. Not marked placed, so a tile that lost a
       * piece to a flaky fetch is dressed properly on the next sync.
       */
      const bit = await forestModel(name).catch(() => null)
      if (!bit) continue
      // Vary per PIECE, not per tile, or a tile reads as one stamped set.
      // A tree gets a tree's room, live or dead; everything else is undergrowth.
      const [cw, ch] = leafy ? FITS.tree : bare ? FITS.bare : FITS.cover
      // Per-PIECE variation, never per tile — see VARY.
      const vary = (leafy ? VARY.tree.min : VARY.cover.min)
        + ((dh >> 13) % VARY.cover.span) / 100
      fitInto(bit, cw * vary, ch * vary)
      const r = footprintOf(bit)

      /*
       * Try the derived spot first, then a few deterministic alternatives.
       *
       * Attempt zero reproduces exactly where this piece used to go, so
       * nothing that was already standing clear moves; only the pieces that
       * were inside a rock go looking for somewhere else. Every alternative
       * comes from the hash, never from a random number: the same hex must
       * grow the same thing in the same place every time the island loads, or
       * the world rearranges itself behind the child's back.
       */
      const candidates = Array.from({ length: 8 }, (_, attempt) => {
        const ah = attempt === 0
          ? dh
          : hash({ q: a.q * 31 + d, r: a.r * 17 - d - attempt * 977 })
        const ang = ((ah >> 4) % 360) * Math.PI / 180
        const rad = hexSize * Math.max(innerClear, 0.18 + ((ah >> 7) % 55) / 100)
        return { x: w.x + Math.cos(ang) * rad, z: w.z + Math.sin(ang) * rad }
      })
      // Tufts over the sea used to float; stones on the beach are fine.
      const spot = firstClear(candidates, r,
        (x, z) => allows(name, surface.groundAt(x, z)), footprints)
      if (!spot) continue
      const { x, z } = spot

      bit.position.set(x, surface.heightAt(x, z) ?? 0, z)
      bit.rotation.y = ((dh >> 11) % 360) * Math.PI / 180
      group.add(bit)
      /*
       * The trees and the dead trunks get a shadow; the tufts and pebbles do
       * not. `shadowUnder` decides on the MEASURED piece rather than on which
       * branch of the `leafy`/`bare` choice above put it here, so a model that
       * turns out bigger than its list suggests is still anchored.
       */
      shadowUnder(bit, group)
      decor.push({ x, z, r: hexSize * 0.10 })
      /*
       * Only the bare tree is solid enough to keep others out. Tufts and
       * pebbles are meant to grow into each other — undergrowth that observes
       * a personal space reads as a flower bed.
       */
      if (bare) {
        blocks.push({ x, z, r: hexSize * 0.14 })
        footprints.push({ x, z, r })
      }
    }
  }

  return {
    group,

    async sync(island, hexSize, surface) {
      // Clouds, once. They give the sky something to be other than a gradient,
      // and drifting cloud is a cheap way to keep the world alive while the
      // child is thinking about a word.
      if (!clouds.length) {
        /*
         * HIGH and FAR. At the first attempt they sat at head height a few
         * metres out and filled half the frame — the orbit camera flew
         * straight through them and the island vanished behind a wall of
         * white. Clouds belong in the distance, above the camera's reach.
         */
        for (let i = 0; i < 6; i++) {
          const c = await model(i % 2 ? 'cloud_big' : 'cloud_small')
          const a = (i / 6) * Math.PI * 2
          const r = 34 + (i % 3) * 7
          c.position.set(Math.cos(a) * r, 15 + (i % 3) * 3.5, Math.sin(a) * r)
          c.scale.setScalar(2.2 + (i % 3) * 0.7)
          c.userData.drift = 0.35 + (i % 4) * 0.12
          c.userData.ring = r
          clouds.push(c)
          group.add(c)
        }
      }

      for (const [k, type] of island.tiles) {
        if (placed.has(k)) continue

        /*
         * Water gets lilies and reeds rather than nothing.
         *
         * It used to be skipped entirely, which meant a child who built a
         * pond watched eight water plants grow on it during the build and
         * then saw a bare blue hex the moment it completed. Losing what she
         * had just made is precisely what brief §19 forbids.
         */
        if (type === 'water') {
          const wh = hash({ q: parts0(k), r: parts1(k) })
          const w = toWorld({ q: parts0(k), r: parts1(k) }, hexSize)
          const count = 2 + (wh % 3)
          for (let i = 0; i < count; i++) {
            const ih = hash({ q: parts0(k) * 13 + i, r: parts1(k) * 7 - i })
            const name = WATER_PIECES[ih % WATER_PIECES.length] as string
            const bit = await model(name)
            const ang = ((ih >> 4) % 360) * Math.PI / 180
            const rad = hexSize * (0.15 + ((ih >> 7) % 45) / 100)
            bit.position.set(w.x + Math.cos(ang) * rad, 0, w.z + Math.sin(ang) * rad)
            bit.rotation.y = ((ih >> 11) % 360) * Math.PI / 180
            /*
             * A lily is 0.02 units tall and a reed 0.25 — and a lily is WIDE.
             * Fitting these by height alone blew each pad up into a tan disc
             * the size of a hex, sitting beside every pond.
             */
            const [ww, wh] = name.startsWith('waterlily') ? FITS.lily : FITS.reed
            const wv = VARY.cover.min + ((ih >> 13) % VARY.cover.span) / 100
            fitInto(bit, ww * wv, wh * wv)
            group.add(bit)
            /*
             * NO blob on water, deliberately, and it is not the threshold
             * doing it — the widest lily reaches 0.310 and would clear
             * SHADOW_MIN_REACH. A blob is a decal on the GROUND, and these
             * pieces are placed at y = 0 while the water hex's own surface
             * sits at -0.2, so a shadow drawn at their feet would hang a fifth
             * of a unit above the pond it belongs to. A lily's shadow is under
             * the lily anyway: at the preset's 35° sun a 0.05-tall pad throws
             * its ellipse 0.036 units, which never leaves the pad.
             */
            decor.push({ x: bit.position.x, z: bit.position.z, r: hexSize * 0.14 })
          }
          placed.add(k)
          continue
        }
        if (type !== 'grass') continue
        const parts = k.split(',').map(Number)
        const a: Axial = { q: parts[0] as number, r: parts[1] as number }
        const h = hash(a)

        /*
         * Is this tile actually THERE yet?
         *
         * Everything below asks the surface — a raycast against the tile
         * meshes — where it may plant. If the tile field has not been synced
         * with this hex, every probe says "no ground", every piece is
         * rejected, and marking the tile done would leave it permanently
         * bare: a tile that lost its one chance to a render-order mistake.
         *
         * So a tile with no ground under its own centre is simply left for
         * next time, and the next sync dresses it properly.
         */
        const home = toWorld(a, hexSize)
        if (surface.groundAt(home.x, home.z) === 'none') continue

        /*
         * The home rock is DRESSED, not skipped.
         *
         * It used to grow nothing at all, so while every other tile had cover
         * the one the child looks at most was bare grass. The centre still
         * stays clear — Fred, her signpost, the egg and the first pet all
         * live there — but the rim gets a ring of undergrowth, which is the
         * difference between "kept clear" and "unfinished".
         */
        if (a.q === 0 && a.r === 0) {
          placed.add(k)
          await scatter(a, w0(a, hexSize), 'meadow', hash(a), hexSize, surface, 0.62)
          continue
        }

        /*
         * What kind of place this is, and therefore what grows on it.
         *
         * Open ground is now an ENTRY in each character's feature table
         * rather than a blanket "one tile in three": a meadow is mostly open,
         * a highland almost never is. That keeps the breathing space pets
         * wander in without flattening the difference between a wood and a
         * field.
         */
        const character = characterOf(a)
        const spec = pick(FEATURES[character], h)
        const w = home

        if (!spec.name) {
          placed.add(k)
          await scatter(a, w, character, h, hexSize, surface)
          continue
        }
        // Big features sit centred — a mountain half off its hex looks broken.
        // Small ones scatter, so a wood does not look like a plantation.
        const spread = spec.big ? 0.12 : 0.5

        /*
         * Find ground it can actually stand on, trying the derived spot first
         * and then working inward. On a coast tile most of the offsets a plain
         * hex would allow are over open sea, so the first choice frequently
         * has to be given up — and a tile with nowhere green left simply grows
         * nothing, which is what a beach looks like anyway.
         */
        // Same rule as the cover above: a feature that will not load leaves
        // this hex for the next sync rather than every hex after it bare.
        const obj = await model(spec.name).catch(() => null)
        if (!obj) continue
        /*
         * Landscape is fitted by FOOTPRINT and objects by HEIGHT.
         *
         * A hill has to match the hex it sits on and may be any height it
         * likes — that variation is the skyline. A tree has to stand the
         * right height beside a pet and may be any width it likes.
         */
        const [fw, fh] = spec.big ? FITS.big : FITS.feature
        const vary = VARY.feature.min + ((h >> 11) % VARY.feature.span) / 100
        fitInto(obj, fw * vary, fh * vary)
        const r = footprintOf(obj)

        /*
         * A feature also has to clear its NEIGHBOURS' features. Tiles are
         * dressed one at a time and a tree sited near the rim of its own hex
         * has no idea a mountain rose on the hex next door — which is the
         * other half of the clipping Joe saw. Big pieces are exempt from the
         * test against smaller ones only in the sense that they are placed
         * centred and rarely reach that far.
         */
        const tries = Array.from({ length: 6 }, (_, attempt) => {
          const pull = 1 - attempt / 6                     // ... inward
          const ox = (((h >> 3) % 100) / 100 - 0.5) * hexSize * spread * pull
          const oz = (((h >> 9) % 100) / 100 - 0.5) * hexSize * spread * pull
          return { x: w.x + ox, z: w.z + oz }
        })
        const at = firstClear(tries, r,
          (x, z) => allows(spec.name, surface.groundAt(x, z)), footprints)
        if (!at) { placed.add(k); continue }
        const spot = { x: at.x, z: at.z, y: surface.heightAt(at.x, at.z) ?? 0 }

        // Sit ON the ground, not at y = 0 — coast ramps slope, and later
        // elevation will too.
        obj.position.set(spot.x, spot.y, spot.z)
        obj.rotation.y = ((h >> 5) % 6) * (Math.PI / 3)   // snap to hex facings
        group.add(obj)
        // Every feature clears the threshold — the smallest is a slab 0.88
        // across — so this is one blob per dressed tile, plus its trees.
        shadowUnder(obj, group)
        placed.add(k)
        /*
         * What a pet must walk round, MEASURED at walking height.
         *
         * This used to be `hexSize * (big ? 0.5 : 0.3)` — a guess, and a
         * consistently low one. A mountain fitted to FITS.big measures about
         * 0.9 across and was declaring 0.58, so pets walked a third of a unit
         * into the rock face and the egg could be sited inside a hillside.
         * Joe, playing: "frog, egg, animals into mountains… there should be a
         * hard collision on surfaces of any moving object."
         *
         * Measured below walking height rather than overall, so a pet may
         * still walk under a tree's canopy — which is not clipping, it is
         * shade.
         */
        blocks.push({
          x: obj.position.x, z: obj.position.z,
          r: footprintBelow(obj, WALKING_HEIGHT),
        })
        footprints.push({ x: obj.position.x, z: obj.position.z, r })

        await scatter(a, w, character, h, hexSize, surface)
      }
    },

    adopt(a, grown, hexSize) {
      placed.add(`${a.q},${a.r}`)
      group.add(grown)
      // Everything on it counts as clutter, so the egg is never sited inside
      // what she just planted; nothing counts as an obstacle, because these
      // are the same knee-high pieces pets have always walked over.
      const w = toWorld(a, hexSize)
      decor.push({ x: w.x, z: w.z, r: hexSize * 0.55 })

      /*
       * ...and the pieces she grew are SOLID to anything planted later.
       *
       * The other half of the trees-inside-rocks report. A grown tile arrives
       * here fully formed and used to register only as clutter, so when the
       * next tile along was dressed, its own feature — a hill or a boulder,
       * blocking half a hex — could be sited straight through the scenery she
       * had just built. Each piece is measured where it actually stands rather
       * than covered by one circle over the tile, because a single hex-wide
       * keep-out would sterilise the whole neighbourhood.
       */
      grown.updateMatrixWorld(true)
      /*
       * A SNAPSHOT, because the loop below adds to `grown.children` as it goes
       * — and a shadow holder measured as a footprint would sterilise the
       * ground its own tree is standing on.
       */
      const pieces = [...grown.children]
      for (const child of pieces) {
        const box = new THREE.Box3().setFromObject(child)
        if (!Number.isFinite(box.min.x)) continue
        const size = box.getSize(new THREE.Vector3())
        const at = box.getCenter(new THREE.Vector3())
        const r = Math.max(size.x, size.z) / 2
        if (r > 1e-3) footprints.push({ x: at.x, z: at.z, r })
        /*
         * ...and the tiles she BUILDS get shadows too.
         *
         * The second placement path, and the one that gets forgotten — trees
         * inside rocks was reported twice for exactly this reason (HANDOFF §6).
         * Skipping it would be the worst possible split, because the tiles she
         * would be looking at are the ones she made: hers floating, the ones
         * the island grew on its own anchored.
         *
         * Here rather than in `increments.ts` on purpose. A plot HOVERS while
         * she builds it and squashes when it lands, so a blob living inside it
         * would be a shadow hanging in mid-air for the whole build. By the time
         * `adopt` is called the pieces have touched down and stopped moving,
         * which is exactly when a shadow starts being true.
         */
        shadowUnder(child, grown)
      }
    },

    load: (name: string) => (/^[A-Z]/.test(name) ? forestModel(name) : model(name)),

    obstacles: () => blocks,

    clutter: () => [...blocks, ...decor],

    update(dt, t) {
      // Drift around the island rather than across it, so none ever crosses
      // between the camera and the world.
      for (const c of clouds) {
        const r = c.userData.ring as number
        const ang = Math.atan2(c.position.z, c.position.x) + (c.userData.drift as number) * dt * 0.06
        c.position.x = Math.cos(ang) * r
        c.position.z = Math.sin(ang) * r
        c.position.y += Math.sin(t * 0.3 + r) * dt * 0.08
      }
    },
  }
}
