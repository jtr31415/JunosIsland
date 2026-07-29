/**
 * Taking one pack animal apart, and being honest about which names are Kenney's.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Joe asked for "one example of an original animal, ripped apart in the viewer
 * with a label against each part", because he has been reasoning about the art
 * from screenshots of finished animals and wants the real anatomy in front of
 * him. Two things he has asserted are meant to be judged here with his own eyes
 * rather than taken on trust:
 *
 *   HEAD = BODY. A Kenney pet is ONE form, not a torso with a head sat on it.
 *   The file agrees at the node level — there is no `head` node anywhere in the
 *   24 — but that is weak evidence, because a node can hold anything. The strong
 *   evidence is one level down: split the `body` mesh into disjoint shells and
 *   the biggest shell is torso AND neck AND head AND cheeks in a single hull,
 *   184 of the fox's 298 body triangles. There is no seam to find.
 *
 *   ALL EYES ARE FLAT. Each eye comes out as its own shell with a bounding box
 *   whose z is exactly 0 — a cut-out card, not a dome. That is a measurement,
 *   printed beside the part, not a claim in a document.
 *
 * ## Two levels, and why the second one needs a warning label
 *
 * The NODE level is the file's own vocabulary: `body`, `tail`, `leg-front-left`,
 * `wing-right`, `Group`. Kenney typed those. The COMPONENT level inside `body`
 * has no vocabulary at all — the mesh is one mesh with one name — so every name
 * this module puts against a component is OURS, a guess made from a shape's size
 * and where it sits. The viewer prints ours in a different colour behind `our
 * name:` so that measured fact and our interpretation can never be confused at a
 * glance. This module carries that distinction in the data (`ours: boolean`)
 * rather than leaving it to the presentation, because it is the whole point.
 *
 * ## Nothing here knows about three.js
 *
 * Same discipline as `primitives.ts`: the split, the ordering and the name
 * lookup are arithmetic over plain arrays, so `tests/tools/anatomy.test.ts` can
 * assert every one of them — including against the real fox GLB read off disk —
 * without a WebGL context. `viewer.ts` does the geometry-building and the
 * screen-space labels and nothing else.
 */
import { COMPONENT_NAMES, type NamedComponent } from './anatomy-names'

/**
 * The 24 authored pack animals, which is the roster this gallery is about.
 *
 * Written out rather than imported from `SPECIES` on purpose: `SPECIES` is the
 * game's dealing table and will grow to include animals the kits BUILD, which
 * have no GLB to take apart. This list is "what is on disk in
 * `src/island/public/pets/`", and the test asserts a file exists for each.
 */
export const ANATOMY_SPECIES = [
  'beaver', 'bee', 'bunny', 'cat', 'caterpillar', 'chick', 'cow', 'crab',
  'deer', 'dog', 'elephant', 'fish', 'fox', 'giraffe', 'hog', 'koala',
  'lion', 'monkey', 'panda', 'parrot', 'penguin', 'pig', 'polar', 'tiger',
] as const

export type AnatomySpecies = typeof ANATOMY_SPECIES[number]

/**
 * The id the LOADER wants, from the id the CENSUS keyed on.
 *
 * Two vocabularies meet here and they are one prefix apart: the game deals
 * `animal-fox` (that is what is in `SPECIES`, and `pets/animal-fox.glb` is the
 * file), while the component census — and therefore the name table — is keyed
 * on `fox`. Named rather than inlined because getting it wrong is silent: the
 * loader is handed `pets/fox.glb`, the dev server answers with index.html, and
 * the only thing on screen is a JSON parse error about a `<`.
 */
export const petIdOf = (species: string): string => `animal-${species}`

/** The one mesh that is worth taking apart. Every other node is already a part. */
export const SPLIT_NODE = 'body'

/** The default, because it is the roster's reference animal and comes apart cleanly. */
export const DEFAULT_SPECIES: AnatomySpecies = 'fox'

/**
 * How near two positions must be to count as the same point.
 *
 * The exporter writes a cube's corner once per face, so a shell that is plainly
 * one solid arrives as loose triangles that share no vertex INDEX at all. Weld
 * by position or every box is eight disconnected triangles and the split says
 * nothing.
 */
export const WELD_TOLERANCE = 1e-5

/** What a component measures, in the model's own units. */
export interface ComponentFacts {
  /** Triangles in this shell. */
  tris: number
  /** Vertices in this shell, counted BEFORE welding — the file's own count. */
  verts: number
  min: readonly [number, number, number]
  max: readonly [number, number, number]
  /** `max - min`. For an eye card one of these is exactly 0, which is the point. */
  size: readonly [number, number, number]
  /** Mean of the welded vertex positions — where the label is hung and where the explode pushes from. */
  centroid: readonly [number, number, number]
}

/** A name, and the only thing about it that matters: whose name it is. */
export interface PartName {
  name: string
  /** True when WE made it up. Kenney's node names are false. */
  ours: boolean
}

/* -------------------------------------------------------------- the split */

/** Union-find over welded vertex ids. Path-halving; small enough not to rank. */
function makeSets(n: number): { find: (a: number) => number; union: (a: number, b: number) => void } {
  const parent = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i
  const find = (a: number): number => {
    let x = a
    while (parent[x] !== x) { parent[x] = parent[parent[x]!]!; x = parent[x]! }
    return x
  }
  return {
    find,
    union: (a, b) => { const ra = find(a); const rb = find(b); if (ra !== rb) parent[ra] = rb },
  }
}

/**
 * Split a triangle soup into position-welded connected components.
 *
 * Vertices whose positions agree to `tolerance` become one welded point; two
 * triangles that share a welded point are in the same component; components are
 * what falls out. The quantisation is a plain grid — a rounded key per axis —
 * which is exact for the case that actually occurs (an exporter emitting the
 * same corner several times, bit for bit) and does not pretend to be a general
 * proximity merge.
 *
 * Returns triangle ORDINALS — the nth triangle of the buffer, not vertex
 * indices — grouped, each group ascending, groups ordered by their first
 * triangle. That is a deterministic order but it is not the DISPLAY order; see
 * `orderComponents`.
 */
export function weldedComponents(
  positions: ArrayLike<number>,
  index: ArrayLike<number> | null,
  tolerance: number = WELD_TOLERANCE,
): number[][] {
  const vertexCount = Math.floor(positions.length / 3)
  const corners = index ? index.length : vertexCount
  const triangles = Math.floor(corners / 3)
  if (triangles === 0) return []

  /* Weld: a rounded position is a key, and equal keys are one point. */
  const weldOf = new Int32Array(vertexCount).fill(-1)
  const seen = new Map<string, number>()
  let welded = 0
  const scale = 1 / tolerance
  for (let v = 0; v < vertexCount; v++) {
    /* `+ 0` normalises -0 to 0, so a mirrored half does not weld to nothing. */
    const key = `${Math.round(positions[v * 3]! * scale) + 0},`
      + `${Math.round(positions[v * 3 + 1]! * scale) + 0},`
      + `${Math.round(positions[v * 3 + 2]! * scale) + 0}`
    const hit = seen.get(key)
    if (hit === undefined) { seen.set(key, welded); weldOf[v] = welded++ }
    else weldOf[v] = hit
  }

  const sets = makeSets(welded)
  const cornerAt = (c: number): number => (index ? index[c]! : c)
  for (let t = 0; t < triangles; t++) {
    const a = weldOf[cornerAt(t * 3)]!
    const b = weldOf[cornerAt(t * 3 + 1)]!
    const c = weldOf[cornerAt(t * 3 + 2)]!
    sets.union(a, b)
    sets.union(b, c)
  }

  const groups = new Map<number, number[]>()
  for (let t = 0; t < triangles; t++) {
    const root = sets.find(weldOf[cornerAt(t * 3)]!)
    const bucket = groups.get(root)
    if (bucket) bucket.push(t)
    else groups.set(root, [t])
  }
  return [...groups.values()]
}

/**
 * Measure one component: its box, its size, its centroid, its counts.
 *
 * `verts` counts DISTINCT buffer vertices, not welded points, because that is
 * the number the file would report and the number the census recorded; summed
 * over a body's components it comes back to the mesh's own vertex count.
 *
 * `centroid` is the mean of those same distinct vertices. Two other definitions
 * were available and both were rejected for the same reason: the census took it
 * this way, and `namesFor` pairs a left ear to a right one by comparing this
 * number against the census's, so the two must be the SAME quantity and not
 * merely a similar one. (Averaging welded points instead moves the fox's hull
 * centroid by 0.004 units; averaging triangle corners, which counts a shared
 * corner once per face, moves it by 0.009.)
 */
export function componentFacts(
  positions: ArrayLike<number>,
  index: ArrayLike<number> | null,
  triangles: readonly number[],
): ComponentFacts {
  const cornerAt = (c: number): number => (index ? index[c]! : c)
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  const vertices = new Set<number>()

  for (const t of triangles) {
    for (let k = 0; k < 3; k++) {
      const v = cornerAt(t * 3 + k)
      vertices.add(v)
      const x = positions[v * 3]!, y = positions[v * 3 + 1]!, z = positions[v * 3 + 2]!
      if (x < min[0]) min[0] = x; if (x > max[0]) max[0] = x
      if (y < min[1]) min[1] = y; if (y > max[1]) max[1] = y
      if (z < min[2]) min[2] = z; if (z > max[2]) max[2] = z
    }
  }

  let cx = 0, cy = 0, cz = 0
  for (const v of vertices) { cx += positions[v * 3]!; cy += positions[v * 3 + 1]!; cz += positions[v * 3 + 2]! }
  const n = Math.max(1, vertices.size)

  return {
    tris: triangles.length,
    verts: vertices.size,
    min, max,
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    centroid: [cx / n, cy / n, cz / n],
  }
}

/**
 * The display order, and the reason it is spelled out rather than left to chance.
 *
 * Triangles descending puts the big hull first, which is what he is looking at.
 * The rest is only there to make the order TOTAL: a fox has two eye cards of 27
 * triangles each and something has to decide which is first, or the same model
 * could label them differently on two loads. Centroid x descending then y then z
 * settles it, and `anatomy-names.mjs` sorts the emitted table by exactly this,
 * so an ordinal means the same thing on both sides.
 */
export function orderComponents<T extends { facts: ComponentFacts }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    b.facts.tris - a.facts.tris
    || b.facts.centroid[0] - a.facts.centroid[0]
    || b.facts.centroid[1] - a.facts.centroid[1]
    || b.facts.centroid[2] - a.facts.centroid[2])
}

/* --------------------------------------------------------------- the names */

/** What we say when the table cannot be trusted for this model. */
export const unnamed = (ordinal: number): PartName => ({ name: `unnamed component ${ordinal + 1}`, ours: true })

const distance = (a: readonly number[], b: NamedComponent['c']): number => {
  const dx = a[0]! - b[0], dy = a[1]! - b[1], dz = a[2]! - b[2]
  return dx * dx + dy * dy + dz * dz
}

/**
 * Our names for one body's components, or honest silence.
 *
 * Called with the components ALREADY in `orderComponents` order, which is the
 * order the table is written in, so the nth of one is the nth of the other. The
 * check before any name is used is deliberately blunt: same number of
 * components, and the same triangle count at every ordinal. If the pack is ever
 * re-exported, or the weld tolerance is changed, or a species is added, that
 * disagrees immediately and every part comes back `unnamed component N`. A
 * wrong label on a picture Joe is reading anatomy off is worse than no label,
 * and it is worse in a way he cannot see.
 *
 * Within a run of components that have the SAME triangle count the ordinal is
 * not enough — a left ear and a right ear are 92 triangles each, and calling
 * them the wrong way round is exactly the sort of quiet error this gallery
 * exists to prevent — so those are paired to the table by nearest centroid
 * instead, closest pair first.
 */
export function namesFor(species: string, ordered: readonly ComponentFacts[]): PartName[] {
  const table = COMPONENT_NAMES[species]
  if (!table || table.length !== ordered.length) return ordered.map((_, i) => unnamed(i))
  for (let i = 0; i < ordered.length; i++) {
    if (table[i]!.tris !== ordered[i]!.tris) return ordered.map((_, k) => unnamed(k))
  }

  const out: PartName[] = ordered.map((_, i) => unnamed(i))
  let run = 0
  while (run < ordered.length) {
    let end = run + 1
    while (end < ordered.length && ordered[end]!.tris === ordered[run]!.tris) end++

    /* One component of this size: the ordinal is the answer. */
    if (end - run === 1) {
      out[run] = { name: table[run]!.name, ours: true }
      run = end
      continue
    }

    /* Several of this size: pair them off by nearest centroid, closest first. */
    const mine = [...Array(end - run).keys()].map(k => run + k)
    const theirs = new Set(mine)
    while (mine.length) {
      let best = Infinity, bestMine = 0, bestTheirs = -1
      for (const i of mine) {
        for (const j of theirs) {
          const d = distance(ordered[i]!.centroid, table[j]!.c)
          if (d < best) { best = d; bestMine = i; bestTheirs = j }
        }
      }
      if (bestTheirs < 0) break
      out[bestMine] = { name: table[bestTheirs]!.name, ours: true }
      mine.splice(mine.indexOf(bestMine), 1)
      theirs.delete(bestTheirs)
    }
    run = end
  }
  return out
}

/* ------------------------------------------------------------- the explode */

/**
 * Where a part sits at explode `t`, pushed out from the model's middle along its
 * own centroid's direction.
 *
 * A part sitting exactly at the centre has no direction to go and stays put,
 * which is right: that part is the hull everything else comes off.
 */
export function explodeOffset(
  centroid: readonly [number, number, number],
  centre: readonly [number, number, number],
  reach: number,
  t: number,
): [number, number, number] {
  const dx = centroid[0] - centre[0], dy = centroid[1] - centre[1], dz = centroid[2] - centre[2]
  const length = Math.hypot(dx, dy, dz)
  if (length < 1e-9 || t === 0) return [0, 0, 0]
  const k = (reach * t) / length
  return [dx * k, dy * k, dz * k]
}

/** `1.250 × 1.505 × 1.560`, the way it is printed beside a part. */
export const sizeLabel = (size: readonly [number, number, number]): string =>
  `${size[0].toFixed(3)} × ${size[1].toFixed(3)} × ${size[2].toFixed(3)}`
