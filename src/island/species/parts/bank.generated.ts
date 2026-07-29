/**
 * The distinct part shapes of the 24 Kenney pack pets, as real geometry.
 *
 * GENERATED — never hand-edit. Run `npm run pets:parts`
 * (`tools/pets/parts-bank.ts`) to rebuild it from the `.glb` files in
 * `src/island/public/pets/`. Every number below was copied out of one of those
 * files; nothing here is authored.
 *
 * A kit assembles an animal by picking records out of `PARTS_BANK` and placing
 * them, synchronously, with no GLTFLoader and no async load — which is the whole
 * reason the bank exists.
 *
 * ## A shape is named for what it IS, never for what it was
 *
 * `id` and `shape` describe the FORM — `spike-02`, `plate-01` — and are derived
 * from the geometry's own proportions, taper and symmetry. They deliberately say
 * nothing about the animal it came from, because the same shape does several
 * jobs: the hog's ear is also a hedgehog's spike, a dragon's back ridge and a
 * crocodile's scute, and a record filed under `ear` would never be reached for
 * when a kit wants a row of spikes. What a part WAS lives in `roles` and
 * `provenance`, where it is measurement rather than a label.
 *
 * The classification is meant to be QUERIED, not read. `findParts` at the bottom
 * answers things like "small tapering spikes I can repeat and sink" without the
 * caller knowing a single species name — which is what lets a kit build an
 * animal nobody has personally thought about.
 *
 * Two parts are the SAME SHAPE when their vertex position sets are equal after
 * translation, to 1e-4 — a tolerance three orders of magnitude above the
 * exporter's float32 noise (3e-8) and nearly three below the smallest genuine
 * difference in the pack (0.045). A shape appears ONCE however many species and
 * however many roles donate it, and roles are not part of the key: where an ear
 * and a horn are one shape, that is one record with two roles.
 *
 * Geometry is origin-centred on its own bounding-box centre, on every axis and
 * for every shape; `offset` is the world-space point that centre was moved from,
 * so placement stays recoverable (a leg's foot is `offset[1] - size[1] / 2`).
 *
 * `bands[t]` is the atlas swatch COLUMN, 0..15, that triangle `t`'s original UVs
 * point at — the palette band. Measured over the pack, no triangle's three
 * corners ever land in two different columns, so this is exact rather than a
 * majority vote. Group a part's triangles by band to split a two-tone part into
 * texture regions.
 *
 * Normals are the file's own smooth-shaded normals, copied and never recomputed.
 */

/** What a part was in the animal it came out of. Provenance, not a label. */
export type PartRole =
  | 'hull' | 'leg' | 'ear' | 'tail' | 'wing' | 'eye' | 'nose' | 'horn'
  | 'tooth' | 'claw' | 'band' | 'card' | 'oddment'

/** Where one instance of a shape was found. `name` is ours for body components. */
export interface PartProvenance {
  species: string
  /** The GLB node it came out of — Kenney's own name. */
  node: string
  /** Its index in `orderComponents` order, or -1 for a whole-node part. */
  ordinal: number
  name: string
  role: PartRole
}

/**
 * What a shape IS, measured off its own vertices. Never consults the role.
 *
 * `taper` is the load-bearing one: cross-section at the narrow end over the wide
 * end along the long axis, 0 for a point and 1 for a bar. It is what separates a
 * tusk from a peg when both are the same size and proportion.
 */
export interface PartShape {
  form: 'plate' | 'spike' | 'cone' | 'blade' | 'wedge' | 'tube' | 'box'
  /** Bounding box over its own longest extent: [1, mid, thin], descending. */
  aspect: readonly [number, number, number]
  taper: number
  /** A search for a right ear must not return a left one; handed parts say so. */
  symmetry: 'mirror' | 'radial' | 'handed'
  /** Absolute extent in model units — the pack is authored at one scale. */
  size: readonly [number, number, number]
  longest: number
}

/**
 * How the pack joined this shape on, as a RANGE over every donor.
 *
 * `sunkFraction*` is the share of the part's own extent buried in the hull. A
 * range rather than a number on purpose: burial depth is a parameter to choose,
 * not a rule to obey, and it is what tells a kit how far to sink a spike.
 */
export interface PartAttachment {
  axis: 'x' | 'y' | 'z'
  dir: 1 | -1
  sunkUnitsMin: number; sunkUnitsMean: number; sunkUnitsMax: number
  sunkFractionMin: number; sunkFractionMean: number; sunkFractionMax: number
  n: number
}

/** One distinct part shape, ready to build a BufferGeometry from. */
export interface BakedPart {
  /** `<form>-<ordinal>`. Describes the form; says nothing about a role. */
  id: string
  /** The measured classification. */
  shape: PartShape
  /** Measured attachment, or null for the hulls, which attach to nothing. */
  attachment: PartAttachment | null
  /** Every role the pack put this shape to — often more than one. */
  roles: readonly PartRole[]
  /** Every place this shape occurs in the pack; the first donated the geometry. */
  provenance: readonly PartProvenance[]
  /** Origin-centred, three floats per vertex. */
  positions: readonly number[]
  /** Verbatim from the file, three floats per vertex. */
  normals: readonly number[]
  /** Three per triangle, into `positions`. */
  indices: readonly number[]
  /**
   * Every triangle count the pack gives this shape. More than one means the same
   * welded hull is triangulated two ways — three of the 86 legs carry two extra
   * faces over the identical 24 points. The baked geometry is the first donor's.
   */
  triVariants: readonly number[]
  /** One atlas swatch column per triangle. */
  bands: readonly number[]
  /** Bounding-box size. */
  size: readonly [number, number, number]
  tris: number
  verts: number
  /** World-space point the bbox centre was translated from. */
  offset: readonly [number, number, number]
}

export const PARTS_BANK: readonly BakedPart[] = [
  {
    id: "blade-01",
    shape: {
      form: "blade", taper: 1, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.64944, 0.2944],
      size: [0.4, 0.259776, 0.11776],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 25,
    verts: 45,
    triVariants: [25],
    size: [0.4, 0.259776, 0.11776],
    offset: [0, 0.763862, 0.68388],
    provenance: [
      { species: "beaver", node: "body", ordinal: 7, role: "nose", name: "nose-tip" },
    ],
    positions: [-0.1166,-0.1299,0.0589,0.1166,-0.1299,-0.0589,0.1166,-0.1299,0.0589,-0.1166,-0.1299,-0.0589,-0.1914,-0.0894,0.0589,-0.1166,-0.1299,-0.0589,-0.1166,-0.1299,0.0589,-0.1914,-0.0894,-0.0589,0.1166,-0.1299,0.0589,0.1914,-0.0894,-0.0589,0.1914,-0.0894,0.0589,0.1166,-0.1299,-0.0589,0.1914,-0.0894,0.0589,-0.1166,-0.1299,0.0589,0.1166,-0.1299,0.0589,-0.1914,-0.0894,0.0589,0.2,-0.0321,0.0589,-0.2,-0.0321,0.0589,0.1414,0.0824,0.0589,-0.1414,0.0824,0.0589,0,0.1299,0.0589,0.1414,0.0824,-0.0589,0,0.1299,0.0589,0.1414,0.0824,0.0589,0,0.1299,-0.0589,0.2,-0.0321,0.0589,0.1914,-0.0894,-0.0589,0.2,-0.0321,-0.0589,0.1914,-0.0894,0.0589,-0.2,-0.0321,-0.0589,-0.1414,0.0824,0.0589,-0.1414,0.0824,-0.0589,-0.2,-0.0321,0.0589,0.1414,0.0824,-0.0589,0.2,-0.0321,0.0589,0.2,-0.0321,-0.0589,0.1414,0.0824,0.0589,0,0.1299,-0.0589,-0.1414,0.0824,0.0589,0,0.1299,0.0589,-0.1414,0.0824,-0.0589,-0.1914,-0.0894,0.0589,-0.2,-0.0321,-0.0589,-0.1914,-0.0894,-0.0589,-0.2,-0.0321,0.0589],
    normals: [-0.1853,-0.7318,0.6558,0.2455,-0.9694,0,0.1853,-0.7318,0.6558,-0.2455,-0.9694,0,-0.643,-0.451,0.619,-0.2455,-0.9694,0,-0.1853,-0.7318,0.6558,-0.8187,-0.5743,0,0.1853,-0.7318,0.6558,0.8187,-0.5743,0,0.643,-0.451,0.619,0.2455,-0.9694,0,0.643,-0.451,0.619,-0.1853,-0.7318,0.6558,0.1853,-0.7318,0.6558,-0.643,-0.451,0.619,0.7547,0.1234,0.6443,-0.7547,0.1234,0.6443,0.5061,0.5878,0.6312,-0.5061,0.5878,0.6312,0,0.7667,0.642,0.6525,0.7578,0,0,0.7667,0.642,0.5061,0.5878,0.6312,0,1,0,0.7547,0.1234,0.6443,0.8187,-0.5743,0,0.9869,0.1613,0,0.643,-0.451,0.619,-0.9869,0.1613,0,-0.5061,0.5878,0.6312,-0.6525,0.7578,0,-0.7547,0.1234,0.6443,0.6525,0.7578,0,0.7547,0.1234,0.6443,0.9869,0.1613,0,0.5061,0.5878,0.6312,0,1,0,-0.5061,0.5878,0.6312,0,0.7667,0.642,-0.6525,0.7578,0,-0.643,-0.451,0.619,-0.9869,0.1613,0,-0.8187,-0.5743,0,-0.7547,0.1234,0.6443],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,15,12,16,15,16,17,17,16,18,17,18,19,19,18,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "blade-02",
    shape: {
      form: "blade", taper: 1, symmetry: "mirror", longest: 0.40172,
      aspect: [1, 0.672122, 0.124465],
      size: [0.40172, 0.270005, 0.05],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 28,
    verts: 48,
    triVariants: [28],
    size: [0.40172, 0.270005, 0.05],
    offset: [0, 0.679459, 0.65],
    provenance: [
      { species: "bunny", node: "body", ordinal: 6, role: "nose", name: "nose-tip" },
    ],
    positions: [0.093,-0.0926,0.025,-0.093,-0.0926,0.025,0,-0.1148,0.025,0.1707,0.0014,0.025,-0.1707,0.0014,0.025,0.1207,0.0953,0.025,-0.1207,0.0953,0.025,0,0.1148,0.025,-0.1094,-0.1089,-0.025,0.1094,-0.1089,-0.025,0,-0.135,-0.025,-0.2009,0.0016,-0.025,0.2009,0.0016,-0.025,-0.142,0.1121,-0.025,0.142,0.1121,-0.025,0,0.135,-0.025,-0.2009,0.0016,-0.025,-0.1207,0.0953,0.025,-0.142,0.1121,-0.025,-0.1707,0.0014,0.025,0.142,0.1121,-0.025,0.1707,0.0014,0.025,0.2009,0.0016,-0.025,0.1207,0.0953,0.025,-0.093,-0.0926,0.025,0,-0.135,-0.025,0,-0.1148,0.025,-0.1094,-0.1089,-0.025,0,0.135,-0.025,-0.1207,0.0953,0.025,0,0.1148,0.025,-0.142,0.1121,-0.025,0.1707,0.0014,0.025,0.1094,-0.1089,-0.025,0.2009,0.0016,-0.025,0.093,-0.0926,0.025,0.093,-0.0926,0.025,0,-0.135,-0.025,0.1094,-0.1089,-0.025,0,-0.1148,0.025,0,0.135,-0.025,0.1207,0.0953,0.025,0.142,0.1121,-0.025,0,0.1148,0.025,-0.093,-0.0926,0.025,-0.2009,0.0016,-0.025,-0.1094,-0.1089,-0.025,-0.1707,0.0014,0.025],
    normals: [0.3298,-0.5616,0.7588,-0.3298,-0.5616,0.7588,0,-0.6713,0.7412,0.5882,-0.0824,0.8045,-0.5882,-0.0824,0.8045,0.3439,0.5514,0.7601,-0.3439,0.5514,0.7601,0,0.6536,0.7568,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,-0.8537,-0.0838,0.514,-0.3439,0.5514,0.7601,-0.4944,0.7382,0.4589,-0.5882,-0.0824,0.8045,0.4944,0.7382,0.4589,0.5882,-0.0824,0.8045,0.8537,-0.0838,0.514,0.3439,0.5514,0.7601,-0.3298,-0.5616,0.7588,0,-0.9269,0.3754,0,-0.6713,0.7412,-0.4678,-0.7833,0.4094,0,0.9269,0.3754,-0.3439,0.5514,0.7601,0,0.6536,0.7568,-0.4944,0.7382,0.4589,0.5882,-0.0824,0.8045,0.4678,-0.7833,0.4094,0.8537,-0.0838,0.514,0.3298,-0.5616,0.7588,0.3298,-0.5616,0.7588,0,-0.9269,0.3754,0.4678,-0.7833,0.4094,0,-0.6713,0.7412,0,0.9269,0.3754,0.3439,0.5514,0.7601,0.4944,0.7382,0.4589,0,0.6536,0.7568,-0.3298,-0.5616,0.7588,-0.8537,-0.0838,0.514,-0.4678,-0.7833,0.4094,-0.5882,-0.0824,0.8045],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,4,5,6,6,5,7,8,9,10,9,8,11,9,11,12,12,11,13,12,13,14,14,13,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "blade-03",
    shape: {
      form: "blade", taper: 1, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.801778, 0.25],
      size: [0.4, 0.320711, 0.1],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 25,
    verts: 45,
    triVariants: [25],
    size: [0.4, 0.320711, 0.1],
    offset: [0, 0.733395, 0.675],
    provenance: [
      { species: "dog", node: "body", ordinal: 6, role: "nose", name: "nose" },
    ],
    positions: [-0.1166,-0.1604,0.05,0.1166,-0.1604,-0.05,0.1166,-0.1604,0.05,-0.1166,-0.1604,-0.05,-0.1914,-0.1104,0.05,-0.1166,-0.1604,-0.05,-0.1166,-0.1604,0.05,-0.1914,-0.1104,-0.05,0.1166,-0.1604,0.05,0.1914,-0.1104,-0.05,0.1914,-0.1104,0.05,0.1166,-0.1604,-0.05,0.1166,-0.1604,0.05,-0.1914,-0.1104,0.05,-0.1166,-0.1604,0.05,0.1914,-0.1104,0.05,0.2,-0.0396,0.05,-0.2,-0.0396,0.05,0.1414,0.1018,0.05,-0.1414,0.1018,0.05,0,0.1604,0.05,0.1414,0.1018,-0.05,0,0.1604,0.05,0.1414,0.1018,0.05,0,0.1604,-0.05,0.2,-0.0396,0.05,0.1914,-0.1104,-0.05,0.2,-0.0396,-0.05,0.1914,-0.1104,0.05,-0.2,-0.0396,-0.05,-0.1414,0.1018,0.05,-0.1414,0.1018,-0.05,-0.2,-0.0396,0.05,0.1414,0.1018,-0.05,0.2,-0.0396,0.05,0.2,-0.0396,-0.05,0.1414,0.1018,0.05,0,0.1604,-0.05,-0.1414,0.1018,0.05,0,0.1604,0.05,-0.1414,0.1018,-0.05,-0.1914,-0.1104,0.05,-0.2,-0.0396,-0.05,-0.1914,-0.1104,-0.05,-0.2,-0.0396,0.05],
    normals: [-0.2213,-0.7295,0.6472,0.2903,-0.9569,0,0.2213,-0.7295,0.6472,-0.2903,-0.9569,0,-0.6656,-0.4092,0.6241,-0.2903,-0.9569,0,-0.2213,-0.7295,0.6472,-0.8519,-0.5237,0,0.2213,-0.7295,0.6472,0.8519,-0.5237,0,0.6656,-0.4092,0.6241,0.2903,-0.9569,0,0.2213,-0.7295,0.6472,-0.6656,-0.4092,0.6241,-0.2213,-0.7295,0.6472,0.6656,-0.4092,0.6241,0.7494,0.1025,0.6542,-0.7494,0.1025,0.6542,0.549,0.549,0.6303,-0.549,0.549,0.6303,0,0.7764,0.6303,0.7071,0.7071,0,0,0.7764,0.6303,0.549,0.549,0.6303,0,1,0,0.7494,0.1025,0.6542,0.8519,-0.5237,0,0.9908,0.1356,0,0.6656,-0.4092,0.6241,-0.9908,0.1356,0,-0.549,0.549,0.6303,-0.7071,0.7071,0,-0.7494,0.1025,0.6542,0.7071,0.7071,0,0.7494,0.1025,0.6542,0.9908,0.1356,0,0.549,0.549,0.6303,0,1,0,-0.549,0.549,0.6303,0,0.7764,0.6303,-0.7071,0.7071,0,-0.6656,-0.4092,0.6241,-0.9908,0.1356,0,-0.8519,-0.5237,0,-0.7494,0.1025,0.6542],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,13,15,16,13,16,17,17,16,18,17,18,19,19,18,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "blade-04",
    shape: {
      form: "blade", taper: 1, symmetry: "radial", longest: 0.4,
      aspect: [1, 1, 0.25],
      size: [0.4, 0.4, 0.1],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 28,
    verts: 48,
    triVariants: [28],
    size: [0.4, 0.4, 0.1],
    offset: [0, 0.69375, 0.675],
    provenance: [
      { species: "lion", node: "body", ordinal: 5, role: "nose", name: "nose-tip" },
    ],
    positions: [0,-0.2,0.05,0.1414,-0.1414,-0.05,0.1414,-0.1414,0.05,0,-0.2,-0.05,-0.1414,-0.1414,0.05,0,-0.2,-0.05,0,-0.2,0.05,-0.1414,-0.1414,-0.05,-0.1414,-0.1414,-0.05,0.1414,-0.1414,-0.05,0,-0.2,-0.05,-0.2,0,-0.05,0.2,0,-0.05,-0.1414,0.1414,-0.05,0.1414,0.1414,-0.05,0,0.2,-0.05,-0.2,0,-0.05,-0.1414,0.1414,0.05,-0.1414,0.1414,-0.05,-0.2,0,0.05,0.1414,-0.1414,0.05,-0.1414,-0.1414,0.05,0,-0.2,0.05,-0.2,0,0.05,0.2,0,0.05,0.1414,0.1414,0.05,-0.1414,0.1414,0.05,0,0.2,0.05,0.2,0,0.05,0.1414,-0.1414,-0.05,0.2,0,-0.05,0.1414,-0.1414,0.05,0.1414,0.1414,-0.05,0,0.2,0.05,0.1414,0.1414,0.05,0,0.2,-0.05,-0.1414,-0.1414,0.05,-0.2,0,-0.05,-0.1414,-0.1414,-0.05,-0.2,0,0.05,0.1414,0.1414,-0.05,0.2,0,0.05,0.2,0,-0.05,0.1414,0.1414,0.05,0,0.2,-0.05,-0.1414,0.1414,0.05,0,0.2,0.05,-0.1414,0.1414,-0.05],
    normals: [0,-0.7764,0.6303,0.7071,-0.7071,0,0.549,-0.549,0.6303,0,-1,0,-0.549,-0.549,0.6303,0,-1,0,0,-0.7764,0.6303,-0.7071,-0.7071,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,-1,0,0,-0.549,0.549,0.6303,-0.7071,0.7071,0,-0.7764,0,0.6303,0.549,-0.549,0.6303,-0.549,-0.549,0.6303,0,-0.7764,0.6303,-0.7764,0,0.6303,0.7764,0,0.6303,0.549,0.549,0.6303,-0.549,0.549,0.6303,0,0.7764,0.6303,0.7764,0,0.6303,0.7071,-0.7071,0,1,0,0,0.549,-0.549,0.6303,0.7071,0.7071,0,0,0.7764,0.6303,0.549,0.549,0.6303,0,1,0,-0.549,-0.549,0.6303,-1,0,0,-0.7071,-0.7071,0,-0.7764,0,0.6303,0.7071,0.7071,0,0.7764,0,0.6303,1,0,0,0.549,0.549,0.6303,0,1,0,-0.549,0.549,0.6303,0,0.7764,0.6303,-0.7071,0.7071,0],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,9,11,12,12,11,13,12,13,14,14,13,15,16,17,18,17,16,19,20,21,22,21,20,23,23,20,24,23,24,25,23,25,26,26,25,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "blade-05",
    shape: {
      form: "blade", taper: 1, symmetry: "mirror", longest: 1,
      aspect: [1, 1, 0.125],
      size: [1, 1, 0.125],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 18,
    verts: 28,
    triVariants: [18],
    size: [1, 1, 0.125],
    offset: [0, 0.80625, 0.5625],
    provenance: [
      { species: "lion", node: "body", ordinal: 8, role: "nose", name: "muzzle/snout" },
    ],
    positions: [0.5,-0.375,-0.0625,0.3125,-0.3125,0.0625,0.4531,-0.4531,-0.0312,0.5,0.375,-0.0625,0.3125,0.3125,0.0625,0.4531,0.4531,-0.0312,-0.3125,-0.3125,0.0625,-0.5,-0.375,-0.0625,-0.4531,-0.4531,-0.0312,-0.5,0.375,-0.0625,-0.3125,0.3125,0.0625,-0.4531,0.4531,-0.0312,0.3125,0.3125,0.0625,-0.3125,-0.3125,0.0625,0.3125,-0.3125,0.0625,-0.3125,0.3125,0.0625,0.4531,0.4531,-0.0312,-0.3125,0.3125,0.0625,0.3125,0.3125,0.0625,-0.4531,0.4531,-0.0312,0.375,0.5,-0.0625,-0.375,0.5,-0.0625,0.375,-0.5,-0.0625,-0.4531,-0.4531,-0.0312,-0.375,-0.5,-0.0625,0.4531,-0.4531,-0.0312,-0.3125,-0.3125,0.0625,0.3125,-0.3125,0.0625],
    normals: [0.5547,0,0.8321,0.2232,-0.2232,0.9489,0.3015,-0.3015,0.9045,0.5547,0,0.8321,0.2232,0.2232,0.9489,0.3015,0.3015,0.9045,-0.2232,-0.2232,0.9489,-0.5547,0,0.8321,-0.3015,-0.3015,0.9045,-0.5547,0,0.8321,-0.2232,0.2232,0.9489,-0.3015,0.3015,0.9045,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,0.3015,0.3015,0.9045,-0.2232,0.2232,0.9489,0.2232,0.2232,0.9489,-0.3015,0.3015,0.9045,0,0.5547,0.8321,0,0.5547,0.8321,0,-0.5547,0.8321,-0.3015,-0.3015,0.9045,0,-0.5547,0.8321,0.3015,-0.3015,0.9045,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,6,7,8,7,6,9,9,6,10,9,10,11,12,13,14,13,12,15,16,17,18,17,16,19,19,16,20,19,20,21,22,23,24,23,22,25,23,25,26,26,25,27],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,5,5,5,5],
  },
  {
    id: "box-01",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.375,
      aspect: [1, 1, 0.816667],
      size: [0.375, 0.30625, 0.375],
    },
    attachment: {
      axis: "y", dir: -1, n: 86,
      sunkUnitsMin: 0, sunkUnitsMean: 0.119186, sunkUnitsMax: 0.125,
      sunkFractionMin: 0, sunkFractionMean: 0.389179, sunkFractionMax: 0.408163,
    },
    roles: ["leg"],
    tris: 44,
    verts: 80,
    triVariants: [44, 46],
    size: [0.375, 0.30625, 0.375],
    offset: [0.25, 0.153125, -0.25],
    provenance: [
      { species: "beaver", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "beaver", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "beaver", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "beaver", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "bee", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "bee", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "bee", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "bee", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "bunny", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "bunny", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "bunny", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "bunny", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "cat", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "cat", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "cat", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "cat", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "caterpillar", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "caterpillar", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "caterpillar", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "caterpillar", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "chick", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "chick", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "cow", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "cow", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "cow", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "cow", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "crab", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "crab", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "crab", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "crab", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "deer", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "deer", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "deer", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "deer", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "dog", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "dog", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "dog", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "dog", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "elephant", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "elephant", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "elephant", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "elephant", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "fox", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "fox", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "fox", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "fox", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "giraffe", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "giraffe", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "giraffe", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "giraffe", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "hog", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "hog", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "hog", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "hog", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "koala", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "koala", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "koala", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "koala", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "lion", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "lion", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "lion", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "lion", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "monkey", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "monkey", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "monkey", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "monkey", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "panda", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "panda", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "panda", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "panda", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "parrot", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "parrot", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "penguin", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "penguin", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "pig", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "pig", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "pig", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "pig", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "polar", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "polar", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "polar", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
      { species: "polar", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "tiger", node: "leg-front-right", ordinal: -1, role: "leg", name: "leg-front-right" },
      { species: "tiger", node: "leg-back-left", ordinal: -1, role: "leg", name: "leg-back-left" },
      { species: "tiger", node: "leg-back-right", ordinal: -1, role: "leg", name: "leg-back-right" },
      { species: "tiger", node: "leg-front-left", ordinal: -1, role: "leg", name: "leg-front-left" },
    ],
    positions: [0.125,-0.0906,0.1875,0.15,0.1531,0.1,0.1,0.1531,0.15,0.1875,-0.0906,0.125,0.125,-0.0906,0.1875,-0.1,0.1531,0.15,-0.125,-0.0906,0.1875,0.1,0.1531,0.15,0.15,0.1531,-0.1,0.125,-0.0906,-0.1875,0.1,0.1531,-0.15,0.1875,-0.0906,-0.125,-0.125,-0.0906,0.1875,-0.15,0.1531,0.1,-0.1875,-0.0906,0.125,-0.1,0.1531,0.15,0.125,-0.1531,-0.0991,-0.0991,-0.1531,-0.125,0.0991,-0.1531,-0.125,-0.125,-0.1531,-0.0991,0.125,-0.1531,0.0991,-0.125,-0.1531,0.0991,0.0991,-0.1531,0.125,-0.0991,-0.1531,0.125,0.125,-0.0906,-0.1875,-0.0991,-0.1531,-0.125,-0.125,-0.0906,-0.1875,0.0991,-0.1531,-0.125,-0.0991,-0.1531,-0.125,-0.1875,-0.0906,-0.125,-0.125,-0.0906,-0.1875,-0.125,-0.1531,-0.0991,0.1875,-0.0906,0.125,0.0991,-0.1531,0.125,0.125,-0.1531,0.0991,0.125,-0.0906,0.1875,-0.0991,-0.1531,0.125,0.125,-0.0906,0.1875,-0.125,-0.0906,0.1875,0.0991,-0.1531,0.125,-0.1875,-0.0906,0.125,-0.125,-0.1531,-0.0991,-0.125,-0.1531,0.0991,-0.1875,-0.0906,-0.125,-0.15,0.1531,-0.1,-0.125,-0.0906,-0.1875,-0.1875,-0.0906,-0.125,-0.1,0.1531,-0.15,0.15,0.1531,-0.1,0.1875,-0.0906,0.125,0.1875,-0.0906,-0.125,0.15,0.1531,0.1,0.1875,-0.0906,-0.125,0.125,-0.1531,0.0991,0.125,-0.1531,-0.0991,0.1875,-0.0906,0.125,-0.1,0.1531,-0.15,0.125,-0.0906,-0.1875,-0.125,-0.0906,-0.1875,0.1,0.1531,-0.15,-0.15,0.1531,-0.1,0.1,0.1531,-0.15,-0.1,0.1531,-0.15,0.15,0.1531,-0.1,0.15,0.1531,0.1,-0.15,0.1531,0.1,-0.1,0.1531,0.15,0.1,0.1531,0.15,-0.0991,-0.1531,0.125,-0.1875,-0.0906,0.125,-0.125,-0.1531,0.0991,-0.125,-0.0906,0.1875,0.1875,-0.0906,-0.125,0.0991,-0.1531,-0.125,0.125,-0.0906,-0.1875,0.125,-0.1531,-0.0991,-0.15,0.1531,0.1,-0.1875,-0.0906,-0.125,-0.1875,-0.0906,0.125,-0.15,0.1531,-0.1],
    normals: [0.3711,-0.2865,0.8833,0.9125,0.1782,0.3682,0.3682,0.1782,0.9125,0.8833,-0.2865,0.3711,0.3711,-0.2865,0.8833,-0.3682,0.1782,0.9125,-0.3711,-0.2865,0.8833,0.3682,0.1782,0.9125,0.9125,0.1782,-0.3682,0.3711,-0.2865,-0.8833,0.3682,0.1782,-0.9125,0.8833,-0.2865,-0.3711,-0.3711,-0.2865,0.8833,-0.9125,0.1782,0.3682,-0.8833,-0.2865,0.3711,-0.3682,0.1782,0.9125,0.4044,-0.8991,-0.1675,-0.1675,-0.8991,-0.4044,0.1675,-0.8991,-0.4044,-0.4044,-0.8991,-0.1675,0.4044,-0.8991,0.1675,-0.4044,-0.8991,0.1675,0.1675,-0.8991,0.4044,-0.1675,-0.8991,0.4044,0.3711,-0.2865,-0.8833,-0.1675,-0.8991,-0.4044,-0.3711,-0.2865,-0.8833,0.1675,-0.8991,-0.4044,-0.1675,-0.8991,-0.4044,-0.8833,-0.2865,-0.3711,-0.3711,-0.2865,-0.8833,-0.4044,-0.8991,-0.1675,0.8833,-0.2865,0.3711,0.1675,-0.8991,0.4044,0.4044,-0.8991,0.1675,0.3711,-0.2865,0.8833,-0.1675,-0.8991,0.4044,0.3711,-0.2865,0.8833,-0.3711,-0.2865,0.8833,0.1675,-0.8991,0.4044,-0.8833,-0.2865,0.3711,-0.4044,-0.8991,-0.1675,-0.4044,-0.8991,0.1675,-0.8833,-0.2865,-0.3711,-0.9125,0.1782,-0.3682,-0.3711,-0.2865,-0.8833,-0.8833,-0.2865,-0.3711,-0.3682,0.1782,-0.9125,0.9125,0.1782,-0.3682,0.8833,-0.2865,0.3711,0.8833,-0.2865,-0.3711,0.9125,0.1782,0.3682,0.8833,-0.2865,-0.3711,0.4044,-0.8991,0.1675,0.4044,-0.8991,-0.1675,0.8833,-0.2865,0.3711,-0.3682,0.1782,-0.9125,0.3711,-0.2865,-0.8833,-0.3711,-0.2865,-0.8833,0.3682,0.1782,-0.9125,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,-0.1675,-0.8991,0.4044,-0.8833,-0.2865,0.3711,-0.4044,-0.8991,0.1675,-0.3711,-0.2865,0.8833,0.8833,-0.2865,-0.3711,0.1675,-0.8991,-0.4044,0.3711,-0.2865,-0.8833,0.4044,-0.8991,-0.1675,-0.9125,0.1782,0.3682,-0.8833,-0.2865,-0.3711,-0.8833,-0.2865,0.3711,-0.9125,0.1782,-0.3682],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,19,16,20,19,20,21,21,20,22,21,22,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,63,60,64,64,60,65,64,65,66,64,66,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-02",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 0.315,
      aspect: [1, 1, 0.650794],
      size: [0.315, 0.315, 0.205],
    },
    attachment: {
      axis: "y", dir: 1, n: 4,
      sunkUnitsMin: 0.245, sunkUnitsMean: 0.245, sunkUnitsMax: 0.245,
      sunkFractionMin: 0.777778, sunkFractionMean: 0.777778, sunkFractionMax: 0.777778,
    },
    roles: ["ear"],
    tris: 92,
    verts: 168,
    triVariants: [92],
    size: [0.315, 0.315, 0.205],
    offset: [0.4475, 1.34375, 0.2475],
    provenance: [
      { species: "beaver", node: "body", ordinal: 0, role: "ear", name: "ear-right" },
      { species: "beaver", node: "body", ordinal: 1, role: "ear", name: "ear-left" },
      { species: "polar", node: "body", ordinal: 0, role: "ear", name: "ear-right" },
      { species: "polar", node: "body", ordinal: 1, role: "ear", name: "ear-left" },
    ],
    positions: [0.0916,-0.0529,-0.1025,0.1575,0,-0.0525,0.1364,-0.0787,-0.0525,0.1057,0,-0.1025,0.0529,0.0916,-0.1025,0.1364,0.0788,-0.0525,0.0916,0.0529,-0.1025,0.0787,0.1364,-0.0525,-0.1364,-0.0787,-0.0525,-0.0529,-0.0916,-0.1025,-0.0788,-0.1364,-0.0525,-0.0916,-0.0529,-0.1025,-0.0529,-0.0916,-0.1025,0.0529,-0.0916,-0.1025,0,-0.1057,-0.1025,0.0916,-0.0529,-0.1025,-0.0916,-0.0529,-0.1025,0.1057,0,-0.1025,-0.1057,0,-0.1025,-0.0916,0.0529,-0.1025,0.0916,0.0529,-0.1025,-0.0529,0.0916,-0.1025,0.0529,0.0916,-0.1025,0,0.1057,-0.1025,-0.0788,0.1364,-0.0525,0,0.1057,-0.1025,-0.0529,0.0916,-0.1025,0,0.1575,-0.0525,-0.1575,0,-0.0525,-0.0916,0.0529,-0.1025,-0.1057,0,-0.1025,-0.1364,0.0788,-0.0525,0,0.1057,-0.1025,0.0787,0.1364,-0.0525,0.0529,0.0916,-0.1025,0,0.1575,-0.0525,-0.1575,0,-0.0525,-0.0916,-0.0529,-0.1025,-0.1364,-0.0787,-0.0525,-0.1057,0,-0.1025,-0.1364,0.0788,-0.0525,-0.0529,0.0916,-0.1025,-0.0916,0.0529,-0.1025,-0.0788,0.1364,-0.0525,-0.0788,-0.1364,-0.0525,0,-0.1057,-0.1025,0,-0.1575,-0.0525,-0.0529,-0.0916,-0.1025,0,-0.1057,-0.1025,0.0787,-0.1364,-0.0525,0,-0.1575,-0.0525,0.0529,-0.0916,-0.1025,0.0529,-0.0916,-0.1025,0.1364,-0.0787,-0.0525,0.0787,-0.1364,-0.0525,0.0916,-0.0529,-0.1025,0.0916,0.0529,-0.1025,0.1575,0,-0.0525,0.1057,0,-0.1025,0.1364,0.0788,-0.0525,0.1575,0,0.0525,0.1364,-0.0787,-0.0525,0.1575,0,-0.0525,0.1364,-0.0787,0.0525,0.0787,-0.1364,0.0525,0.1364,-0.0787,-0.0525,0.1364,-0.0787,0.0525,0.0787,-0.1364,-0.0525,-0.0788,-0.1364,0.0525,0,-0.1575,-0.0525,0,-0.1575,0.0525,-0.0788,-0.1364,-0.0525,-0.0788,0.1364,-0.0525,0,0.1575,0.0525,0,0.1575,-0.0525,-0.0788,0.1364,0.0525,0.1364,0.0788,0.0525,0.1575,0,-0.0525,0.1364,0.0788,-0.0525,0.1575,0,0.0525,0.0787,0.1364,0.0525,0.1364,0.0788,-0.0525,0.0787,0.1364,-0.0525,0.1364,0.0788,0.0525,-0.1364,0.0788,-0.0525,-0.0788,0.1364,0.0525,-0.0788,0.1364,-0.0525,-0.1364,0.0788,0.0525,-0.1364,-0.0787,0.0525,-0.0788,-0.1364,-0.0525,-0.0788,-0.1364,0.0525,-0.1364,-0.0787,-0.0525,-0.1364,-0.0787,-0.0525,-0.1575,0,0.0525,-0.1575,0,-0.0525,-0.1364,-0.0787,0.0525,-0.1575,0,-0.0525,-0.1364,0.0788,0.0525,-0.1364,0.0788,-0.0525,-0.1575,0,0.0525,0,-0.1575,0.0525,0.0787,-0.1364,-0.0525,0.0787,-0.1364,0.0525,0,-0.1575,-0.0525,0,-0.1057,0.1025,-0.0788,-0.1364,0.0525,0,-0.1575,0.0525,-0.0529,-0.0916,0.1025,0,0.1575,-0.0525,0.0787,0.1364,0.0525,0.0787,0.1364,-0.0525,0,0.1575,0.0525,-0.0529,0.0916,0.1025,-0.1364,0.0788,0.0525,-0.0916,0.0529,0.1025,-0.0788,0.1364,0.0525,0,0.1057,0.1025,-0.0788,0.1364,0.0525,-0.0529,0.0916,0.1025,0,0.1575,0.0525,0.1364,-0.0787,0.0525,0.0529,-0.0916,0.1025,0.0787,-0.1364,0.0525,0.0916,-0.0529,0.1025,0.1575,0,0.0525,0.0916,-0.0529,0.1025,0.1364,-0.0787,0.0525,0.1057,0,0.1025,-0.0916,-0.0529,0.1025,-0.1575,0,0.0525,-0.1364,-0.0787,0.0525,-0.1057,0,0.1025,-0.0529,-0.0916,0.1025,-0.1364,-0.0787,0.0525,-0.0788,-0.1364,0.0525,-0.0916,-0.0529,0.1025,0.1364,0.0788,0.0525,0.1057,0,0.1025,0.1575,0,0.0525,0.0916,0.0529,0.1025,-0.1057,0,0.1025,-0.1364,0.0788,0.0525,-0.1575,0,0.0525,-0.0916,0.0529,0.1025,0.0787,-0.1364,0.0525,0,-0.1057,0.1025,0,-0.1575,0.0525,0.0529,-0.0916,0.1025,0.0787,0.1364,0.0525,0,0.1057,0.1025,0.0529,0.0916,0.1025,0,0.1575,0.0525,0.1364,0.0788,0.0525,0.0529,0.0916,0.1025,0.0916,0.0529,0.1025,0.0787,0.1364,0.0525,0.0529,-0.0916,0.1025,-0.0529,-0.0916,0.1025,0,-0.1057,0.1025,0.0916,-0.0529,0.1025,-0.0916,-0.0529,0.1025,0.1057,0,0.1025,-0.1057,0,0.1025,0.0916,0.0529,0.1025,-0.0916,0.0529,0.1025,-0.0529,0.0916,0.1025,0.0529,0.0916,0.1025,0,0.1057,0.1025],
    normals: [0.3687,-0.2129,-0.9049,0.9293,0,-0.3692,0.8048,-0.4647,-0.3692,0.4257,0,-0.9049,0.2129,0.3687,-0.9049,0.8048,0.4647,-0.3692,0.3687,0.2129,-0.9049,0.4647,0.8048,-0.3692,-0.8048,-0.4647,-0.3692,-0.2129,-0.3687,-0.9049,-0.4647,-0.8048,-0.3692,-0.3687,-0.2129,-0.9049,-0.2129,-0.3687,-0.9049,0.2129,-0.3687,-0.9049,0,-0.4257,-0.9049,0.3687,-0.2129,-0.9049,-0.3687,-0.2129,-0.9049,0.4257,0,-0.9049,-0.4257,0,-0.9049,-0.3687,0.2129,-0.9049,0.3687,0.2129,-0.9049,-0.2129,0.3687,-0.9049,0.2129,0.3687,-0.9049,0,0.4257,-0.9049,-0.4647,0.8048,-0.3692,0,0.4257,-0.9049,-0.2129,0.3687,-0.9049,0,0.9293,-0.3692,-0.9293,0,-0.3692,-0.3687,0.2129,-0.9049,-0.4257,0,-0.9049,-0.8048,0.4647,-0.3692,0,0.4257,-0.9049,0.4647,0.8048,-0.3692,0.2129,0.3687,-0.9049,0,0.9293,-0.3692,-0.9293,0,-0.3692,-0.3687,-0.2129,-0.9049,-0.8048,-0.4647,-0.3692,-0.4257,0,-0.9049,-0.8048,0.4647,-0.3692,-0.2129,0.3687,-0.9049,-0.3687,0.2129,-0.9049,-0.4647,0.8048,-0.3692,-0.4647,-0.8048,-0.3692,0,-0.4257,-0.9049,0,-0.9293,-0.3692,-0.2129,-0.3687,-0.9049,0,-0.4257,-0.9049,0.4647,-0.8048,-0.3692,0,-0.9293,-0.3692,0.2129,-0.3687,-0.9049,0.2129,-0.3687,-0.9049,0.8048,-0.4647,-0.3692,0.4647,-0.8048,-0.3692,0.3687,-0.2129,-0.9049,0.3687,0.2129,-0.9049,0.9293,0,-0.3692,0.4257,0,-0.9049,0.8048,0.4647,-0.3692,0.9293,0,0.3692,0.8048,-0.4647,-0.3692,0.9293,0,-0.3692,0.8048,-0.4647,0.3692,0.4647,-0.8048,0.3692,0.8048,-0.4647,-0.3692,0.8048,-0.4647,0.3692,0.4647,-0.8048,-0.3692,-0.4647,-0.8048,0.3692,0,-0.9293,-0.3692,0,-0.9293,0.3692,-0.4647,-0.8048,-0.3692,-0.4647,0.8048,-0.3692,0,0.9293,0.3692,0,0.9293,-0.3692,-0.4647,0.8048,0.3692,0.8048,0.4647,0.3692,0.9293,0,-0.3692,0.8048,0.4647,-0.3692,0.9293,0,0.3692,0.4647,0.8048,0.3692,0.8048,0.4647,-0.3692,0.4647,0.8048,-0.3692,0.8048,0.4647,0.3692,-0.8048,0.4647,-0.3692,-0.4647,0.8048,0.3692,-0.4647,0.8048,-0.3692,-0.8048,0.4647,0.3692,-0.8048,-0.4647,0.3692,-0.4647,-0.8048,-0.3692,-0.4647,-0.8048,0.3692,-0.8048,-0.4647,-0.3692,-0.8048,-0.4647,-0.3692,-0.9293,0,0.3692,-0.9293,0,-0.3692,-0.8048,-0.4647,0.3692,-0.9293,0,-0.3692,-0.8048,0.4647,0.3692,-0.8048,0.4647,-0.3692,-0.9293,0,0.3692,0,-0.9293,0.3692,0.4647,-0.8048,-0.3692,0.4647,-0.8048,0.3692,0,-0.9293,-0.3692,0,-0.4257,0.9049,-0.4647,-0.8048,0.3692,0,-0.9293,0.3692,-0.2129,-0.3687,0.9049,0,0.9293,-0.3692,0.4647,0.8048,0.3692,0.4647,0.8048,-0.3692,0,0.9293,0.3692,-0.2129,0.3687,0.9049,-0.8048,0.4647,0.3692,-0.3687,0.2129,0.9049,-0.4647,0.8048,0.3692,0,0.4257,0.9049,-0.4647,0.8048,0.3692,-0.2129,0.3687,0.9049,0,0.9293,0.3692,0.8048,-0.4647,0.3692,0.2129,-0.3687,0.9049,0.4647,-0.8048,0.3692,0.3687,-0.2129,0.9049,0.9293,0,0.3692,0.3687,-0.2129,0.9049,0.8048,-0.4647,0.3692,0.4257,0,0.9049,-0.3687,-0.2129,0.9049,-0.9293,0,0.3692,-0.8048,-0.4647,0.3692,-0.4257,0,0.9049,-0.2129,-0.3687,0.9049,-0.8048,-0.4647,0.3692,-0.4647,-0.8048,0.3692,-0.3687,-0.2129,0.9049,0.8048,0.4647,0.3692,0.4257,0,0.9049,0.9293,0,0.3692,0.3687,0.2129,0.9049,-0.4257,0,0.9049,-0.8048,0.4647,0.3692,-0.9293,0,0.3692,-0.3687,0.2129,0.9049,0.4647,-0.8048,0.3692,0,-0.4257,0.9049,0,-0.9293,0.3692,0.2129,-0.3687,0.9049,0.4647,0.8048,0.3692,0,0.4257,0.9049,0.2129,0.3687,0.9049,0,0.9293,0.3692,0.8048,0.4647,0.3692,0.2129,0.3687,0.9049,0.3687,0.2129,0.9049,0.4647,0.8048,0.3692,0.2129,-0.3687,0.9049,-0.2129,-0.3687,0.9049,0,-0.4257,0.9049,0.3687,-0.2129,0.9049,-0.3687,-0.2129,0.9049,0.4257,0,0.9049,-0.4257,0,0.9049,0.3687,0.2129,0.9049,-0.3687,0.2129,0.9049,-0.2129,0.3687,0.9049,0.2129,0.3687,0.9049,0,0.4257,0.9049],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,15,12,16,15,16,17,17,16,18,17,18,19,17,19,20,20,19,21,20,21,22,22,21,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,157,159,160,160,159,161,160,161,162,162,161,163,162,163,164,164,163,165,165,163,166,165,166,167],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "box-03",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 1.25,
      aspect: [1, 1, 1],
      size: [1.25, 1.25, 1.25],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.590278, sunkUnitsMean: 0.590278, sunkUnitsMax: 0.590278,
      sunkFractionMin: 0.472222, sunkFractionMean: 0.472222, sunkFractionMax: 0.472222,
    },
    roles: ["hull", "oddment"],
    tris: 60,
    verts: 120,
    triVariants: [60],
    size: [1.25, 1.25, 1.25],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "beaver", node: "body", ordinal: 2, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "bee", node: "body", ordinal: 1, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "bunny", node: "body", ordinal: 1, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "cat", node: "body", ordinal: 2, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "caterpillar", node: "body", ordinal: 1, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "chick", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "crab", node: "Group", ordinal: -1, role: "oddment", name: "Group" },
      { species: "dog", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "elephant", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "giraffe", node: "body", ordinal: 1, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "hog", node: "body", ordinal: 4, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "koala", node: "body", ordinal: 2, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "parrot", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "pig", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "polar", node: "body", ordinal: 2, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [-0.5,-0.5,0.5,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,-0.5,-0.5,-0.5,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,0.3125,-0.3125,0.625,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.3125,-0.3125,0.625,-0.3125,-0.3125,-0.625,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.3125,-0.3125,-0.625,-0.5,0.5,-0.5,0.3125,0.625,-0.3125,0.5,0.5,-0.5,-0.3125,0.625,-0.3125,-0.3125,0.625,-0.3125,-0.5,0.5,0.5,-0.3125,0.625,0.3125,-0.5,0.5,-0.5,0.5,0.5,0.5,0.625,0.3125,-0.3125,0.5,0.5,-0.5,0.625,0.3125,0.3125,-0.5,-0.5,0.5,0.3125,-0.625,0.3125,0.5,-0.5,0.5,-0.3125,-0.625,0.3125,-0.5,0.5,-0.5,-0.3125,-0.3125,-0.625,-0.5,-0.5,-0.5,-0.3125,0.3125,-0.625,0.5,-0.5,0.5,0.3125,-0.625,-0.3125,0.5,-0.5,-0.5,0.3125,-0.625,0.3125,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,-0.5,-0.5,0.5,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.5,0.5,0.5,0.5,0.5,0.5,0.625,-0.3125,0.3125,0.625,0.3125,0.3125,0.5,-0.5,0.5,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.625,-0.625,0.3125,-0.3125,-0.5,0.5,0.5,-0.5,0.5,-0.5,-0.625,0.3125,0.3125,0.5,0.5,0.5,-0.3125,0.3125,0.625,0.3125,0.3125,0.625,-0.5,0.5,0.5,0.625,-0.3125,-0.3125,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.625,-0.3125,0.3125,0.5,0.5,0.5,0.3125,-0.3125,0.625,0.5,-0.5,0.5,0.3125,0.3125,0.625,0.3125,-0.3125,-0.625,0.5,0.5,-0.5,0.5,-0.5,-0.5,0.3125,0.3125,-0.625,-0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.625,0.3125,-0.3125,0.625,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.3125,-0.625,-0.3125,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.3125,-0.625,-0.3125,-0.5,-0.5,0.5,-0.625,-0.3125,-0.3125,-0.5,-0.5,-0.5,-0.625,-0.3125,0.3125,0.3125,0.625,0.3125,-0.5,0.5,0.5,0.5,0.5,0.5,-0.3125,0.625,0.3125,0.625,0.3125,-0.3125,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.5,0.5,-0.5,-0.3125,-0.3125,0.625,-0.5,0.5,0.5,-0.5,-0.5,0.5,-0.3125,0.3125,0.625,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,0.3125,0.625,-0.3125,0.5,0.5,0.5,0.5,0.5,-0.5,0.3125,0.625,0.3125],
    normals: [-0.5774,-0.5774,0.5774,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,-0.5774,-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,0.2232,-0.2232,0.9489,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.2232,-0.2232,0.9489,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,-0.2232,0.9489,-0.2232,-0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.5774,0.5774,-0.5774,0.5774,0.5774,0.5774,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9489,0.2232,0.2232,-0.5774,-0.5774,0.5774,0.2232,-0.9489,0.2232,0.5774,-0.5774,0.5774,-0.2232,-0.9489,0.2232,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.5774,-0.5774,0.5774,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.5774,-0.5774,0.5774,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,0.9489,-0.2232,0.2232,0.9489,0.2232,0.2232,0.5774,-0.5774,0.5774,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,-0.9489,0.2232,-0.2232,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.9489,0.2232,0.2232,0.5774,0.5774,0.5774,-0.2232,0.2232,0.9489,0.2232,0.2232,0.9489,-0.5774,0.5774,0.5774,0.9489,-0.2232,-0.2232,0.5774,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,0.5774,0.5774,0.5774,0.2232,-0.2232,0.9489,0.5774,-0.5774,0.5774,0.2232,0.2232,0.9489,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,-0.5774,-0.5774,0.5774,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,0.2232,0.9489,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,-0.2232,-0.2232,0.9489,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.2232,0.2232,0.9489,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,0.2232,0.9489,-0.2232,0.5774,0.5774,0.5774,0.5774,0.5774,-0.5774,0.2232,0.9489,0.2232],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-04",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 1.335,
      aspect: [1, 1, 0.341573],
      size: [1.335, 1.335, 0.456],
    },
    attachment: {
      axis: "x", dir: 1, n: 1,
      sunkUnitsMin: 1.2925, sunkUnitsMean: 1.2925, sunkUnitsMax: 1.2925,
      sunkFractionMin: 0.968165, sunkFractionMean: 0.968165, sunkFractionMax: 0.968165,
    },
    roles: ["band"],
    tris: 92,
    verts: 168,
    triVariants: [92],
    size: [1.335, 1.335, 0.456],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "bee", node: "body", ordinal: 0, role: "band", name: "abdomen-segment (torso shell-ring)" },
    ],
    positions: [0.6675,-0.3337,0.178,0.534,-0.534,-0.178,0.6675,-0.3337,-0.178,0.534,-0.534,0.178,-0.6675,0.3338,0.178,-0.534,0.534,-0.178,-0.6675,0.3338,-0.178,-0.534,0.534,0.178,-0.6675,-0.3337,-0.178,-0.6675,0.3338,0.178,-0.6675,0.3338,-0.178,-0.6675,-0.3337,0.178,0.534,0.534,-0.178,0.6675,0.3338,0.178,0.6675,0.3338,-0.178,0.534,0.534,0.178,-0.4979,-0.4979,-0.228,0.3186,-0.6175,-0.228,-0.3186,-0.6175,-0.228,0.4979,-0.4979,-0.228,0.6175,-0.3186,-0.228,-0.6175,-0.3186,-0.228,0.6175,0.3186,-0.228,-0.6175,0.3186,-0.228,-0.4979,0.4979,-0.228,0.4979,0.4979,-0.228,0.3186,0.6175,-0.228,-0.3186,0.6175,-0.228,-0.6675,0.3338,-0.178,-0.4979,0.4979,-0.228,-0.6175,0.3186,-0.228,-0.534,0.534,-0.178,-0.3337,-0.6675,-0.178,0.3186,-0.6175,-0.228,0.3337,-0.6675,-0.178,-0.3186,-0.6175,-0.228,-0.6175,-0.3186,-0.228,-0.6675,0.3338,-0.178,-0.6175,0.3186,-0.228,-0.6675,-0.3337,-0.178,-0.6675,-0.3337,-0.178,-0.4979,-0.4979,-0.228,-0.534,-0.534,-0.178,-0.6175,-0.3186,-0.228,0.3186,0.6175,-0.228,-0.3338,0.6675,-0.178,0.3337,0.6675,-0.178,-0.3186,0.6175,-0.228,0.4979,0.4979,-0.228,0.6675,0.3338,-0.178,0.6175,0.3186,-0.228,0.534,0.534,-0.178,0.6675,0.3338,-0.178,0.6175,-0.3186,-0.228,0.6175,0.3186,-0.228,0.6675,-0.3337,-0.178,0.4979,-0.4979,-0.228,0.6675,-0.3337,-0.178,0.534,-0.534,-0.178,0.6175,-0.3186,-0.228,0.3186,0.6175,-0.228,0.534,0.534,-0.178,0.4979,0.4979,-0.228,0.3337,0.6675,-0.178,0.3186,-0.6175,-0.228,0.534,-0.534,-0.178,0.3337,-0.6675,-0.178,0.4979,-0.4979,-0.228,-0.534,-0.534,-0.178,-0.3186,-0.6175,-0.228,-0.3337,-0.6675,-0.178,-0.4979,-0.4979,-0.228,-0.534,0.534,-0.178,-0.3186,0.6175,-0.228,-0.4979,0.4979,-0.228,-0.3338,0.6675,-0.178,0.6675,0.3338,0.178,0.6675,-0.3337,-0.178,0.6675,0.3338,-0.178,0.6675,-0.3337,0.178,0.3337,-0.6675,0.178,0.534,-0.534,-0.178,0.534,-0.534,0.178,0.3337,-0.6675,-0.178,-0.3338,0.6675,-0.178,0.3337,0.6675,0.178,0.3337,0.6675,-0.178,-0.3338,0.6675,0.178,-0.534,-0.534,0.178,-0.6675,-0.3337,-0.178,-0.534,-0.534,-0.178,-0.6675,-0.3337,0.178,-0.534,-0.534,0.178,-0.3337,-0.6675,-0.178,-0.3337,-0.6675,0.178,-0.534,-0.534,-0.178,-0.3337,-0.6675,0.178,0.3337,-0.6675,-0.178,0.3337,-0.6675,0.178,-0.3337,-0.6675,-0.178,0.3337,0.6675,-0.178,0.534,0.534,0.178,0.534,0.534,-0.178,0.3337,0.6675,0.178,0.3186,-0.6175,0.228,-0.4979,-0.4979,0.228,-0.3186,-0.6175,0.228,0.4979,-0.4979,0.228,0.6175,-0.3186,0.228,-0.6175,-0.3186,0.228,0.6175,0.3186,0.228,-0.6175,0.3186,0.228,-0.4979,0.4979,0.228,0.4979,0.4979,0.228,0.3186,0.6175,0.228,-0.3186,0.6175,0.228,-0.534,0.534,-0.178,-0.3338,0.6675,0.178,-0.3338,0.6675,-0.178,-0.534,0.534,0.178,0.6175,0.3186,0.228,0.6675,-0.3337,0.178,0.6675,0.3338,0.178,0.6175,-0.3186,0.228,-0.6675,-0.3337,0.178,-0.6175,0.3186,0.228,-0.6675,0.3338,0.178,-0.6175,-0.3186,0.228,-0.4979,-0.4979,0.228,-0.6675,-0.3337,0.178,-0.534,-0.534,0.178,-0.6175,-0.3186,0.228,-0.3338,0.6675,0.178,0.3186,0.6175,0.228,0.3337,0.6675,0.178,-0.3186,0.6175,0.228,0.6675,0.3338,0.178,0.4979,0.4979,0.228,0.6175,0.3186,0.228,0.534,0.534,0.178,-0.3186,-0.6175,0.228,-0.534,-0.534,0.178,-0.3337,-0.6675,0.178,-0.4979,-0.4979,0.228,0.6675,-0.3337,0.178,0.4979,-0.4979,0.228,0.534,-0.534,0.178,0.6175,-0.3186,0.228,0.534,-0.534,0.178,0.3186,-0.6175,0.228,0.3337,-0.6675,0.178,0.4979,-0.4979,0.228,0.534,0.534,0.178,0.3186,0.6175,0.228,0.4979,0.4979,0.228,0.3337,0.6675,0.178,-0.4979,0.4979,0.228,-0.6675,0.3338,0.178,-0.6175,0.3186,0.228,-0.534,0.534,0.178,-0.3186,0.6175,0.228,-0.534,0.534,0.178,-0.4979,0.4979,0.228,-0.3338,0.6675,0.178,0.3186,-0.6175,0.228,-0.3337,-0.6675,0.178,0.3337,-0.6675,0.178,-0.3186,-0.6175,0.228],
    normals: [0.8821,-0.2671,0.3879,0.6515,-0.6515,-0.3888,0.8821,-0.2671,-0.3879,0.6515,-0.6515,0.3888,-0.8821,0.2671,0.3879,-0.6515,0.6515,-0.3888,-0.8821,0.2671,-0.3879,-0.6515,0.6515,0.3888,-0.8821,-0.2671,-0.3879,-0.8821,0.2671,0.3879,-0.8821,0.2671,-0.3879,-0.8821,-0.2671,0.3879,0.6515,0.6515,-0.3888,0.8821,0.2671,0.3879,0.8821,0.2671,-0.3879,0.6515,0.6515,0.3888,-0.2811,-0.2811,-0.9176,0.1187,-0.392,-0.9123,-0.1187,-0.392,-0.9123,0.2811,-0.2811,-0.9176,0.392,-0.1187,-0.9123,-0.392,-0.1187,-0.9123,0.392,0.1187,-0.9123,-0.392,0.1187,-0.9123,-0.2811,0.2811,-0.9176,0.2811,0.2811,-0.9176,0.1187,0.392,-0.9123,-0.1187,0.392,-0.9123,-0.8821,0.2671,-0.3879,-0.2811,0.2811,-0.9176,-0.392,0.1187,-0.9123,-0.6515,0.6515,-0.3888,-0.2671,-0.8821,-0.3879,0.1187,-0.392,-0.9123,0.2671,-0.8821,-0.3879,-0.1187,-0.392,-0.9123,-0.392,-0.1187,-0.9123,-0.8821,0.2671,-0.3879,-0.392,0.1187,-0.9123,-0.8821,-0.2671,-0.3879,-0.8821,-0.2671,-0.3879,-0.2811,-0.2811,-0.9176,-0.6515,-0.6515,-0.3888,-0.392,-0.1187,-0.9123,0.1187,0.392,-0.9123,-0.2671,0.8821,-0.3879,0.2671,0.8821,-0.3879,-0.1187,0.392,-0.9123,0.2811,0.2811,-0.9176,0.8821,0.2671,-0.3879,0.392,0.1187,-0.9123,0.6515,0.6515,-0.3888,0.8821,0.2671,-0.3879,0.392,-0.1187,-0.9123,0.392,0.1187,-0.9123,0.8821,-0.2671,-0.3879,0.2811,-0.2811,-0.9176,0.8821,-0.2671,-0.3879,0.6515,-0.6515,-0.3888,0.392,-0.1187,-0.9123,0.1187,0.392,-0.9123,0.6515,0.6515,-0.3888,0.2811,0.2811,-0.9176,0.2671,0.8821,-0.3879,0.1187,-0.392,-0.9123,0.6515,-0.6515,-0.3888,0.2671,-0.8821,-0.3879,0.2811,-0.2811,-0.9176,-0.6515,-0.6515,-0.3888,-0.1187,-0.392,-0.9123,-0.2671,-0.8821,-0.3879,-0.2811,-0.2811,-0.9176,-0.6515,0.6515,-0.3888,-0.1187,0.392,-0.9123,-0.2811,0.2811,-0.9176,-0.2671,0.8821,-0.3879,0.8821,0.2671,0.3879,0.8821,-0.2671,-0.3879,0.8821,0.2671,-0.3879,0.8821,-0.2671,0.3879,0.2671,-0.8821,0.3879,0.6515,-0.6515,-0.3888,0.6515,-0.6515,0.3888,0.2671,-0.8821,-0.3879,-0.2671,0.8821,-0.3879,0.2671,0.8821,0.3879,0.2671,0.8821,-0.3879,-0.2671,0.8821,0.3879,-0.6515,-0.6515,0.3888,-0.8821,-0.2671,-0.3879,-0.6515,-0.6515,-0.3888,-0.8821,-0.2671,0.3879,-0.6515,-0.6515,0.3888,-0.2671,-0.8821,-0.3879,-0.2671,-0.8821,0.3879,-0.6515,-0.6515,-0.3888,-0.2671,-0.8821,0.3879,0.2671,-0.8821,-0.3879,0.2671,-0.8821,0.3879,-0.2671,-0.8821,-0.3879,0.2671,0.8821,-0.3879,0.6515,0.6515,0.3888,0.6515,0.6515,-0.3888,0.2671,0.8821,0.3879,0.1187,-0.392,0.9123,-0.2811,-0.2811,0.9176,-0.1187,-0.392,0.9123,0.2811,-0.2811,0.9176,0.392,-0.1187,0.9123,-0.392,-0.1187,0.9123,0.392,0.1187,0.9123,-0.392,0.1187,0.9123,-0.2811,0.2811,0.9176,0.2811,0.2811,0.9176,0.1187,0.392,0.9123,-0.1187,0.392,0.9123,-0.6515,0.6515,-0.3888,-0.2671,0.8821,0.3879,-0.2671,0.8821,-0.3879,-0.6515,0.6515,0.3888,0.392,0.1187,0.9123,0.8821,-0.2671,0.3879,0.8821,0.2671,0.3879,0.392,-0.1187,0.9123,-0.8821,-0.2671,0.3879,-0.392,0.1187,0.9123,-0.8821,0.2671,0.3879,-0.392,-0.1187,0.9123,-0.2811,-0.2811,0.9176,-0.8821,-0.2671,0.3879,-0.6515,-0.6515,0.3888,-0.392,-0.1187,0.9123,-0.2671,0.8821,0.3879,0.1187,0.392,0.9123,0.2671,0.8821,0.3879,-0.1187,0.392,0.9123,0.8821,0.2671,0.3879,0.2811,0.2811,0.9176,0.392,0.1187,0.9123,0.6515,0.6515,0.3888,-0.1187,-0.392,0.9123,-0.6515,-0.6515,0.3888,-0.2671,-0.8821,0.3879,-0.2811,-0.2811,0.9176,0.8821,-0.2671,0.3879,0.2811,-0.2811,0.9176,0.6515,-0.6515,0.3888,0.392,-0.1187,0.9123,0.6515,-0.6515,0.3888,0.1187,-0.392,0.9123,0.2671,-0.8821,0.3879,0.2811,-0.2811,0.9176,0.6515,0.6515,0.3888,0.1187,0.392,0.9123,0.2811,0.2811,0.9176,0.2671,0.8821,0.3879,-0.2811,0.2811,0.9176,-0.8821,0.2671,0.3879,-0.392,0.1187,0.9123,-0.6515,0.6515,0.3888,-0.1187,0.392,0.9123,-0.6515,0.6515,0.3888,-0.2811,0.2811,0.9176,-0.2671,0.8821,0.3879,0.1187,-0.392,0.9123,-0.2671,-0.8821,0.3879,0.2671,-0.8821,0.3879,-0.1187,-0.392,0.9123],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,19,16,20,20,16,21,20,21,22,22,21,23,22,23,24,22,24,25,25,24,26,26,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,105,107,108,105,108,109,109,108,110,109,110,111,111,110,112,112,110,113,112,113,114,112,114,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-05",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 0.232,
      aspect: [1, 0.951056, 0.823638],
      size: [0.220645, 0.232, 0.191084],
    },
    attachment: {
      axis: "y", dir: 1, n: 4,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["ear"],
    tris: 48,
    verts: 108,
    triVariants: [48],
    size: [0.220645, 0.232, 0.191084],
    offset: [0.227581, 1.630606, 0.572516],
    provenance: [
      { species: "bee", node: "body", ordinal: 2, role: "ear", name: "ear-right" },
      { species: "bee", node: "body", ordinal: 3, role: "ear", name: "ear-left" },
      { species: "caterpillar", node: "body", ordinal: 2, role: "ear", name: "ear-right" },
      { species: "caterpillar", node: "body", ordinal: 3, role: "ear", name: "ear-left" },
    ],
    positions: [-0.0341,-0.0938,-0.059,0.0341,-0.0938,-0.059,0,-0.116,0,0,0.116,0,0.0682,0.0938,0,0.0341,0.0938,-0.059,-0.0341,0.0938,-0.059,0,0.116,0,0.0341,0.0938,-0.059,-0.0341,0.0938,0.059,0.0341,0.0938,0.059,0,0.116,0,-0.0682,0.0938,0,-0.0341,0.0938,0.059,0,0.116,0,0,0.116,0,0.0341,0.0938,0.059,0.0682,0.0938,0,-0.0682,-0.0938,0,0,-0.116,0,-0.0341,-0.0938,0.059,-0.0341,-0.0938,0.059,0,-0.116,0,0.0341,-0.0938,0.059,0,-0.116,0,0.0682,-0.0938,0,0.0341,-0.0938,0.059,0,-0.116,0,0.0341,-0.0938,-0.059,0.0682,-0.0938,0,-0.0682,-0.0938,0,-0.0341,-0.0938,-0.059,0,-0.116,0,-0.0682,0.0938,0,0,0.116,0,-0.0341,0.0938,-0.059,0.0341,0.0938,0.059,0.1103,0.0358,0,0.0682,0.0938,0,0.0552,0.0358,0.0955,0.1103,0.0358,0,0.0552,-0.0358,-0.0955,0.0552,0.0358,-0.0955,0.1103,-0.0358,0,-0.0341,0.0938,-0.059,0.0552,0.0358,-0.0955,-0.0552,0.0358,-0.0955,0.0341,0.0938,-0.059,-0.0552,-0.0358,0.0955,-0.1103,0.0358,0,-0.1103,-0.0358,0,-0.0552,0.0358,0.0955,-0.1103,0.0358,0,-0.0341,0.0938,-0.059,-0.0552,0.0358,-0.0955,-0.0682,0.0938,0,-0.0552,0.0358,0.0955,-0.0682,0.0938,0,-0.1103,0.0358,0,-0.0341,0.0938,0.059,0.0552,0.0358,0.0955,-0.0552,-0.0358,0.0955,0.0552,-0.0358,0.0955,-0.0552,0.0358,0.0955,-0.0552,-0.0358,-0.0955,0.0341,-0.0938,-0.059,-0.0341,-0.0938,-0.059,0.0552,-0.0358,-0.0955,0.0552,-0.0358,0.0955,0.0682,-0.0938,0,0.1103,-0.0358,0,0.0341,-0.0938,0.059,-0.0341,-0.0938,-0.059,-0.1103,-0.0358,0,-0.0552,-0.0358,-0.0955,-0.0682,-0.0938,0,0.0552,0.0358,0.0955,0.1103,-0.0358,0,0.1103,0.0358,0,0.0552,-0.0358,0.0955,0.1103,-0.0358,0,0.0341,-0.0938,-0.059,0.0552,-0.0358,-0.0955,0.0682,-0.0938,0,0.0341,0.0938,0.059,-0.0552,0.0358,0.0955,0.0552,0.0358,0.0955,-0.0341,0.0938,0.059,-0.0552,0.0358,-0.0955,0.0552,-0.0358,-0.0955,-0.0552,-0.0358,-0.0955,0.0552,0.0358,-0.0955,0.0552,-0.0358,0.0955,-0.0341,-0.0938,0.059,0.0341,-0.0938,0.059,-0.0552,-0.0358,0.0955,-0.1103,-0.0358,0,-0.0552,0.0358,-0.0955,-0.0552,-0.0358,-0.0955,-0.1103,0.0358,0,-0.0341,-0.0938,0.059,-0.1103,-0.0358,0,-0.0682,-0.0938,0,-0.0552,-0.0358,0.0955,0.0341,0.0938,-0.059,0.1103,0.0358,0,0.0552,0.0358,-0.0955,0.0682,0.0938,0],
    normals: [-0.3233,-0.7628,-0.56,0.3233,-0.7628,-0.56,0,-1,0,0,1,0,0.6466,0.7628,0,0.3233,0.7628,-0.56,-0.3233,0.7628,-0.56,0,1,0,0.3233,0.7628,-0.56,-0.3233,0.7628,0.56,0.3233,0.7628,0.56,0,1,0,-0.6466,0.7628,0,-0.3233,0.7628,0.56,0,1,0,0,1,0,0.3233,0.7628,0.56,0.6466,0.7628,0,-0.6466,-0.7628,0,0,-1,0,-0.3233,-0.7628,0.56,-0.3233,-0.7628,0.56,0,-1,0,0.3233,-0.7628,0.56,0,-1,0,0.6466,-0.7628,0,0.3233,-0.7628,0.56,0,-1,0,0.3233,-0.7628,-0.56,0.6466,-0.7628,0,-0.6466,-0.7628,0,-0.3233,-0.7628,-0.56,0,-1,0,-0.6466,0.7628,0,0,1,0,-0.3233,0.7628,-0.56,0.3233,0.7628,0.56,0.959,0.2834,0,0.6466,0.7628,0,0.4795,0.2834,0.8305,0.959,0.2834,0,0.4795,-0.2834,-0.8305,0.4795,0.2834,-0.8305,0.959,-0.2834,0,-0.3233,0.7628,-0.56,0.4795,0.2834,-0.8305,-0.4795,0.2834,-0.8305,0.3233,0.7628,-0.56,-0.4795,-0.2834,0.8305,-0.959,0.2834,0,-0.959,-0.2834,0,-0.4795,0.2834,0.8305,-0.959,0.2834,0,-0.3233,0.7628,-0.56,-0.4795,0.2834,-0.8305,-0.6466,0.7628,0,-0.4795,0.2834,0.8305,-0.6466,0.7628,0,-0.959,0.2834,0,-0.3233,0.7628,0.56,0.4795,0.2834,0.8305,-0.4795,-0.2834,0.8305,0.4795,-0.2834,0.8305,-0.4795,0.2834,0.8305,-0.4795,-0.2834,-0.8305,0.3233,-0.7628,-0.56,-0.3233,-0.7628,-0.56,0.4795,-0.2834,-0.8305,0.4795,-0.2834,0.8305,0.6466,-0.7628,0,0.959,-0.2834,0,0.3233,-0.7628,0.56,-0.3233,-0.7628,-0.56,-0.959,-0.2834,0,-0.4795,-0.2834,-0.8305,-0.6466,-0.7628,0,0.4795,0.2834,0.8305,0.959,-0.2834,0,0.959,0.2834,0,0.4795,-0.2834,0.8305,0.959,-0.2834,0,0.3233,-0.7628,-0.56,0.4795,-0.2834,-0.8305,0.6466,-0.7628,0,0.3233,0.7628,0.56,-0.4795,0.2834,0.8305,0.4795,0.2834,0.8305,-0.3233,0.7628,0.56,-0.4795,0.2834,-0.8305,0.4795,-0.2834,-0.8305,-0.4795,-0.2834,-0.8305,0.4795,0.2834,-0.8305,0.4795,-0.2834,0.8305,-0.3233,-0.7628,0.56,0.3233,-0.7628,0.56,-0.4795,-0.2834,0.8305,-0.959,-0.2834,0,-0.4795,0.2834,-0.8305,-0.4795,-0.2834,-0.8305,-0.959,0.2834,0,-0.3233,-0.7628,0.56,-0.959,-0.2834,0,-0.6466,-0.7628,0,-0.4795,-0.2834,0.8305,0.3233,0.7628,-0.56,0.959,0.2834,0,0.4795,0.2834,-0.8305,0.6466,0.7628,0],
    indices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-06",
    shape: {
      form: "box", taper: 0.849275, symmetry: "handed", longest: 0.913298,
      aspect: [1, 0.52773, 0.33487],
      size: [0.481975, 0.913298, 0.305836],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.334504, sunkUnitsMean: 0.334504, sunkUnitsMax: 0.334504,
      sunkFractionMin: 0.366259, sunkFractionMean: 0.366259, sunkFractionMax: 0.366259,
    },
    roles: ["ear"],
    tris: 60,
    verts: 132,
    triVariants: [60],
    size: [0.481975, 0.913298, 0.305836],
    offset: [0.286975, 1.553396, 0.347082],
    provenance: [
      { species: "bunny", node: "body", ordinal: 0, role: "ear", name: "ear-right" },
    ],
    positions: [0.0305,-0.3182,0.1529,-0.2039,-0.2554,0.1529,-0.0066,-0.4566,0.0134,-0.241,-0.3938,0.0134,0.1826,0.4162,0.0134,0.0317,0.4566,0.0134,0.1455,0.2778,0.1529,-0.0054,0.3182,0.1529,0.1826,0.4162,0.0134,0.2326,0.3528,-0.0151,0.0317,0.4566,0.0134,-0.0434,0.4268,-0.0151,0.241,0.2521,-0.0711,-0.101,0.3438,-0.0711,0.2321,0.149,-0.1311,-0.1448,0.25,-0.1311,0.223,0.1132,-0.1529,-0.1548,0.2144,-0.1529,0.1251,-0.1997,-0.1529,-0.0066,-0.4566,0.0134,-0.2265,-0.1055,-0.1529,-0.241,-0.3938,0.0134,0.223,0.1132,-0.1529,0.2025,0.0335,-0.1529,-0.1548,0.2144,-0.1529,-0.177,0.1352,-0.1529,0.1251,-0.1997,-0.1529,-0.2265,-0.1055,-0.1529,-0.177,0.1352,-0.1529,-0.2265,-0.1055,-0.1529,-0.1837,0.1099,0.04,-0.1548,0.2144,-0.1529,-0.177,0.1352,-0.1529,-0.1837,0.1099,0.04,-0.101,0.3438,-0.0711,-0.1448,0.25,-0.1311,-0.1261,0.2498,0.0956,0.241,0.2521,-0.0711,0.2326,0.3528,-0.0151,0.1996,0.2294,0.1336,0.2326,0.3528,-0.0151,0.1826,0.4162,0.0134,0.1996,0.2294,0.1336,0.1455,0.2778,0.1529,0.1996,0.2294,0.1336,0.1826,0.4162,0.0134,0.1957,0.0082,0.04,0.2025,0.0335,-0.1529,0.2093,0.0624,0.04,0.0317,0.4566,0.0134,-0.0434,0.4268,-0.0151,-0.0765,0.3033,0.1336,-0.0434,0.4268,-0.0151,-0.101,0.3438,-0.0711,-0.0765,0.3033,0.1336,-0.0066,-0.4566,0.0134,0.1251,-0.1997,-0.1529,0.1387,-0.1489,0.04,0.1387,-0.1489,0.04,0.1251,-0.1997,-0.1529,0.1957,0.0082,0.04,-0.0066,-0.4566,0.0134,0.1387,-0.1489,0.04,0.0305,-0.3182,0.1529,0.2321,0.149,-0.1311,0.241,0.2521,-0.0711,0.2158,0.1582,0.0956,0.2158,0.1582,0.0956,0.241,0.2521,-0.0711,0.1996,0.2294,0.1336,0.2093,0.0624,0.04,0.223,0.1132,-0.1529,0.2154,0.0867,0.0548,0.2154,0.0867,0.0548,0.2321,0.149,-0.1311,0.2158,0.1582,0.0956,0.2025,0.0335,-0.1529,0.223,0.1132,-0.1529,0.2093,0.0624,0.04,-0.1448,0.25,-0.1311,-0.1548,0.2144,-0.1529,-0.1615,0.1877,0.0548,0.223,0.1132,-0.1529,0.2321,0.149,-0.1311,0.2154,0.0867,0.0548,-0.0765,0.3033,0.1336,-0.0054,0.3182,0.1529,0.0317,0.4566,0.0134,0.1251,-0.1997,-0.1529,0.2025,0.0335,-0.1529,0.1957,0.0082,0.04,-0.2265,-0.1055,-0.1529,-0.2129,-0.0547,0.04,-0.1837,0.1099,0.04,-0.1548,0.2144,-0.1529,-0.1684,0.1636,0.04,-0.1615,0.1877,0.0548,-0.1448,0.25,-0.1311,-0.1615,0.1877,0.0548,-0.1261,0.2498,0.0956,-0.101,0.3438,-0.0711,-0.1261,0.2498,0.0956,-0.0765,0.3033,0.1336,-0.2265,-0.1055,-0.1529,-0.241,-0.3938,0.0134,-0.2129,-0.0547,0.04,-0.1548,0.2144,-0.1529,-0.1837,0.1099,0.04,-0.1684,0.1636,0.04,-0.2129,-0.0547,0.04,-0.241,-0.3938,0.0134,-0.2039,-0.2554,0.1529,0.2093,0.0624,0.04,-0.1684,0.1636,0.04,0.1957,0.0082,0.04,-0.1837,0.1099,0.04,0.1387,-0.1489,0.04,-0.2129,-0.0547,0.04,0.1387,-0.1489,0.04,-0.2129,-0.0547,0.04,0.0305,-0.3182,0.1529,-0.2039,-0.2554,0.1529,0.1455,0.2778,0.1529,-0.0054,0.3182,0.1529,0.1996,0.2294,0.1336,-0.0765,0.3033,0.1336,0.2158,0.1582,0.0956,-0.1261,0.2498,0.0956,0.2154,0.0867,0.0548,-0.1615,0.1877,0.0548,0.2093,0.0624,0.04,-0.1684,0.1636,0.04],
    normals: [-0.1806,-0.6738,0.7165,-0.1806,-0.6738,0.7165,-0.1806,-0.6738,0.7165,-0.1806,-0.6738,0.7165,0.4715,0.5801,0.6642,-0.1182,0.7381,0.6642,0.4303,0.581,0.6908,-0.0822,0.7184,0.6908,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.1314,0.4904,-0.8615,0.0676,0.2524,-0.9652,0.0676,0.2524,-0.9652,-0.0626,-0.2337,-0.9703,-0.1314,-0.4904,-0.8615,-0.0626,-0.2337,-0.9703,-0.1314,-0.4904,-0.8615,0.0676,0.2524,-0.9652,0,0,-1,0.0676,0.2524,-0.9652,0,0,-1,-0.0626,-0.2337,-0.9703,-0.0626,-0.2337,-0.9703,-0.9711,0.2385,-0.0029,-0.9906,0.1342,0.028,-0.9736,0.2282,0.0045,-0.963,0.2696,0.0028,-0.9711,0.2385,-0.0029,-0.9736,0.2282,0.0045,-0.8868,0.4411,0.1381,-0.9441,0.3279,0.0351,-0.8485,0.5096,0.1428,0.9885,-0.0613,0.1381,0.9036,0.2086,0.3742,0.88,0.2513,0.4032,0.9036,0.2086,0.3742,0.4715,0.5801,0.6642,0.88,0.2513,0.4032,0.4303,0.581,0.6908,0.88,0.2513,0.4032,0.4715,0.5801,0.6642,0.9574,-0.2886,0.0039,0.9604,-0.2786,-0.0021,0.9697,-0.2443,0.0033,-0.1182,0.7381,0.6642,-0.6782,0.6324,0.3742,-0.6364,0.6576,0.4032,-0.6782,0.6324,0.3742,-0.8868,0.4411,0.1381,-0.6364,0.6576,0.4032,0.8924,-0.4324,0.1287,0.925,-0.379,0.028,0.9201,-0.387,0.0606,0.9201,-0.387,0.0606,0.925,-0.379,0.028,0.9574,-0.2886,0.0039,0.8924,-0.4324,0.1287,0.9201,-0.387,0.0606,0.8803,-0.4325,0.195,0.9815,-0.1881,0.0351,0.9885,-0.0613,0.1381,0.9896,0.0171,0.1428,0.9896,0.0171,0.1428,0.9885,-0.0613,0.1381,0.88,0.2513,0.4032,0.9697,-0.2443,0.0033,0.9686,-0.2485,0.0032,0.9899,-0.1347,0.0433,0.9899,-0.1347,0.0433,0.9815,-0.1881,0.0351,0.9896,0.0171,0.1428,0.9604,-0.2786,-0.0021,0.9686,-0.2485,0.0032,0.9697,-0.2443,0.0033,-0.9441,0.3279,0.0351,-0.963,0.2696,0.0028,-0.9246,0.3783,0.0433,0.9686,-0.2485,0.0032,0.9815,-0.1881,0.0351,0.9899,-0.1347,0.0433,-0.6364,0.6576,0.4032,-0.0822,0.7184,0.6908,-0.1182,0.7381,0.6642,0.925,-0.379,0.028,0.9604,-0.2786,-0.0021,0.9574,-0.2886,0.0039,-0.9906,0.1342,0.028,-0.9903,0.1249,0.0606,-0.9736,0.2282,0.0045,-0.963,0.2696,0.0028,-0.9618,0.2738,0.0042,-0.9246,0.3783,0.0433,-0.9441,0.3279,0.0351,-0.9246,0.3783,0.0433,-0.8485,0.5096,0.1428,-0.8868,0.4411,0.1381,-0.8485,0.5096,0.1428,-0.6364,0.6576,0.4032,-0.9906,0.1342,0.028,-0.9891,0.0717,0.1287,-0.9903,0.1249,0.0606,-0.963,0.2696,0.0028,-0.9736,0.2282,0.0045,-0.9618,0.2738,0.0042,-0.9903,0.1249,0.0606,-0.9891,0.0717,0.1287,-0.9786,0.0656,0.195,-0.0674,-0.2516,0.9655,-0.0674,-0.2516,0.9655,0,0,1,0,0,1,0.06,0.2238,0.9728,0.06,0.2238,0.9728,0.06,0.2238,0.9728,0.06,0.2238,0.9728,0.1314,0.4904,0.8615,0.1314,0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.1314,-0.4904,0.8615,-0.0674,-0.2516,0.9655,-0.0674,-0.2516,0.9655],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,10,9,11,9,12,11,11,12,13,12,14,13,13,14,15,14,16,15,17,15,16,18,19,20,21,20,19,22,23,24,24,23,25,23,26,25,27,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,113,115,114,114,115,116,117,116,115,118,119,120,121,120,119,122,123,124,123,125,124,124,125,126,125,127,126,126,127,128,127,129,128,128,129,130,131,130,129],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-07",
    shape: {
      form: "box", taper: 0.849275, symmetry: "handed", longest: 0.913298,
      aspect: [1, 0.52773, 0.33487],
      size: [0.481975, 0.913298, 0.305836],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.334504, sunkUnitsMean: 0.334504, sunkUnitsMax: 0.334504,
      sunkFractionMin: 0.366259, sunkFractionMean: 0.366259, sunkFractionMax: 0.366259,
    },
    roles: ["ear"],
    tris: 60,
    verts: 132,
    triVariants: [60],
    size: [0.481975, 0.913298, 0.305836],
    offset: [-0.286975, 1.553396, 0.347082],
    provenance: [
      { species: "bunny", node: "body", ordinal: 2, role: "ear", name: "ear-left" },
    ],
    positions: [0.2039,-0.2554,0.1529,-0.0305,-0.3182,0.1529,0.241,-0.3938,0.0134,0.0066,-0.4566,0.0134,-0.0317,0.4566,0.0134,-0.1826,0.4162,0.0134,0.0054,0.3182,0.1529,-0.1455,0.2778,0.1529,-0.0317,0.4566,0.0134,0.0434,0.4268,-0.0151,-0.1826,0.4162,0.0134,-0.2326,0.3528,-0.0151,0.101,0.3438,-0.0711,-0.241,0.2521,-0.0711,0.1448,0.25,-0.1311,-0.2321,0.149,-0.1311,0.1548,0.2144,-0.1529,-0.223,0.1132,-0.1529,0.2265,-0.1055,-0.1529,0.241,-0.3938,0.0134,-0.1251,-0.1997,-0.1529,0.0066,-0.4566,0.0134,0.1548,0.2144,-0.1529,0.177,0.1352,-0.1529,-0.223,0.1132,-0.1529,-0.2025,0.0335,-0.1529,0.2265,-0.1055,-0.1529,-0.1251,-0.1997,-0.1529,0.177,0.1352,-0.1529,0.1548,0.2144,-0.1529,0.1684,0.1636,0.04,-0.1826,0.4162,0.0134,-0.2326,0.3528,-0.0151,-0.1996,0.2294,0.1336,0.1684,0.1636,0.04,0.1548,0.2144,-0.1529,0.1615,0.1877,0.0548,-0.2321,0.149,-0.1311,-0.223,0.1132,-0.1529,-0.2154,0.0867,0.0548,0.1548,0.2144,-0.1529,0.1448,0.25,-0.1311,0.1615,0.1877,0.0548,-0.1996,0.2294,0.1336,-0.1455,0.2778,0.1529,-0.1826,0.4162,0.0134,0.2265,-0.1055,-0.1529,0.177,0.1352,-0.1529,0.1837,0.1099,0.04,0.2129,-0.0547,0.04,0.2265,-0.1055,-0.1529,0.1837,0.1099,0.04,0.0434,0.4268,-0.0151,-0.0317,0.4566,0.0134,0.0765,0.3033,0.1336,0.1261,0.2498,0.0956,0.101,0.3438,-0.0711,0.0765,0.3033,0.1336,-0.1251,-0.1997,-0.1529,-0.1387,-0.1489,0.04,-0.1957,0.0082,0.04,-0.2326,0.3528,-0.0151,-0.241,0.2521,-0.0711,-0.1996,0.2294,0.1336,-0.223,0.1132,-0.1529,-0.2093,0.0624,0.04,-0.2154,0.0867,0.0548,-0.2321,0.149,-0.1311,-0.2154,0.0867,0.0548,-0.2158,0.1582,0.0956,0.1837,0.1099,0.04,0.177,0.1352,-0.1529,0.1684,0.1636,0.04,-0.241,0.2521,-0.0711,-0.2158,0.1582,0.0956,-0.1996,0.2294,0.1336,-0.1251,-0.1997,-0.1529,0.0066,-0.4566,0.0134,-0.1387,-0.1489,0.04,0.241,-0.3938,0.0134,0.2265,-0.1055,-0.1529,0.2129,-0.0547,0.04,-0.223,0.1132,-0.1529,-0.2025,0.0335,-0.1529,-0.1957,0.0082,0.04,-0.223,0.1132,-0.1529,-0.1957,0.0082,0.04,-0.2093,0.0624,0.04,0.241,-0.3938,0.0134,0.2129,-0.0547,0.04,0.2039,-0.2554,0.1529,0.1448,0.25,-0.1311,0.101,0.3438,-0.0711,0.1261,0.2498,0.0956,0.1615,0.1877,0.0548,0.1448,0.25,-0.1311,0.1261,0.2498,0.0956,-0.241,0.2521,-0.0711,-0.2321,0.149,-0.1311,-0.2158,0.1582,0.0956,0.101,0.3438,-0.0711,0.0434,0.4268,-0.0151,0.0765,0.3033,0.1336,-0.2025,0.0335,-0.1529,-0.1251,-0.1997,-0.1529,-0.1957,0.0082,0.04,0.0054,0.3182,0.1529,0.0765,0.3033,0.1336,-0.0317,0.4566,0.0134,-0.1387,-0.1489,0.04,0.0066,-0.4566,0.0134,-0.0305,-0.3182,0.1529,0.0054,0.3182,0.1529,-0.1455,0.2778,0.1529,0.0765,0.3033,0.1336,-0.1996,0.2294,0.1336,0.1261,0.2498,0.0956,-0.2158,0.1582,0.0956,0.1615,0.1877,0.0548,-0.2154,0.0867,0.0548,0.1684,0.1636,0.04,-0.2093,0.0624,0.04,0.2129,-0.0547,0.04,-0.1387,-0.1489,0.04,0.2039,-0.2554,0.1529,-0.0305,-0.3182,0.1529,0.1684,0.1636,0.04,-0.2093,0.0624,0.04,0.1837,0.1099,0.04,-0.1957,0.0082,0.04,0.2129,-0.0547,0.04,-0.1387,-0.1489,0.04],
    normals: [0.1806,-0.6738,0.7165,0.1806,-0.6738,0.7165,0.1806,-0.6738,0.7165,0.1806,-0.6738,0.7165,0.1182,0.7381,0.6642,-0.4715,0.5801,0.6642,0.0822,0.7184,0.6908,-0.4303,0.581,0.6908,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.1314,0.4904,-0.8615,-0.0676,0.2524,-0.9652,-0.0676,0.2524,-0.9652,0.0626,-0.2337,-0.9703,0.1314,-0.4904,-0.8615,0.0626,-0.2337,-0.9703,0.1314,-0.4904,-0.8615,-0.0676,0.2524,-0.9652,0,0,-1,-0.0676,0.2524,-0.9652,0,0,-1,0.0626,-0.2337,-0.9703,0.0626,-0.2337,-0.9703,0.971,0.2389,-0.0021,0.9631,0.2691,0.0032,0.9619,0.2733,0.0033,-0.4715,0.5801,0.6642,-0.9036,0.2086,0.3742,-0.88,0.2513,0.4032,0.9619,0.2733,0.0033,0.9631,0.2691,0.0032,0.9246,0.3783,0.0433,-0.9815,-0.1881,0.0351,-0.9687,-0.248,0.0028,-0.9899,-0.1347,0.0433,0.9631,0.2691,0.0032,0.9441,0.3279,0.0351,0.9246,0.3783,0.0433,-0.88,0.2513,0.4032,-0.4303,0.581,0.6908,-0.4715,0.5801,0.6642,0.9906,0.1342,0.028,0.971,0.2389,-0.0021,0.9735,0.2288,0.0039,0.9903,0.1249,0.0606,0.9906,0.1342,0.028,0.9735,0.2288,0.0039,0.6782,0.6324,0.3742,0.1182,0.7381,0.6642,0.6364,0.6576,0.4032,0.8485,0.5096,0.1428,0.8868,0.4411,0.1381,0.6364,0.6576,0.4032,-0.925,-0.379,0.028,-0.9201,-0.387,0.0606,-0.9573,-0.2892,0.0045,-0.9036,0.2086,0.3742,-0.9885,-0.0613,0.1381,-0.88,0.2513,0.4032,-0.9687,-0.248,0.0028,-0.9698,-0.2437,0.0042,-0.9899,-0.1347,0.0433,-0.9815,-0.1881,0.0351,-0.9899,-0.1347,0.0433,-0.9896,0.0171,0.1428,0.9735,0.2288,0.0039,0.971,0.2389,-0.0021,0.9619,0.2733,0.0033,-0.9885,-0.0613,0.1381,-0.9896,0.0171,0.1428,-0.88,0.2513,0.4032,-0.925,-0.379,0.028,-0.8924,-0.4324,0.1287,-0.9201,-0.387,0.0606,0.9891,0.0717,0.1287,0.9906,0.1342,0.028,0.9903,0.1249,0.0606,-0.9687,-0.248,0.0028,-0.9603,-0.2791,-0.0029,-0.9573,-0.2892,0.0045,-0.9687,-0.248,0.0028,-0.9573,-0.2892,0.0045,-0.9698,-0.2437,0.0042,0.9891,0.0717,0.1287,0.9903,0.1249,0.0606,0.9786,0.0656,0.195,0.9441,0.3279,0.0351,0.8868,0.4411,0.1381,0.8485,0.5096,0.1428,0.9246,0.3783,0.0433,0.9441,0.3279,0.0351,0.8485,0.5096,0.1428,-0.9885,-0.0613,0.1381,-0.9815,-0.1881,0.0351,-0.9896,0.0171,0.1428,0.8868,0.4411,0.1381,0.6782,0.6324,0.3742,0.6364,0.6576,0.4032,-0.9603,-0.2791,-0.0029,-0.925,-0.379,0.028,-0.9573,-0.2892,0.0045,0.0822,0.7184,0.6908,0.6364,0.6576,0.4032,0.1182,0.7381,0.6642,-0.9201,-0.387,0.0606,-0.8924,-0.4324,0.1287,-0.8803,-0.4325,0.195,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.1314,-0.4904,0.8615,0.0674,-0.2516,0.9655,0.0674,-0.2516,0.9655,-0.06,0.2238,0.9728,-0.06,0.2238,0.9728,-0.1314,0.4904,0.8615,-0.1314,0.4904,0.8615,0.0674,-0.2516,0.9655,0.0674,-0.2516,0.9655,0,0,1,0,0,1,-0.06,0.2238,0.9728,-0.06,0.2238,0.9728],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,10,9,11,9,12,11,11,12,13,12,14,13,13,14,15,14,16,15,17,15,16,18,19,20,21,20,19,22,23,24,24,23,25,23,26,25,27,25,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,113,115,114,114,115,116,115,117,116,116,117,118,117,119,118,118,119,120,121,120,119,122,123,124,125,124,123,126,127,128,127,129,128,128,129,130,131,130,129],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-08",
    shape: {
      form: "box", taper: 0.89, symmetry: "mirror", longest: 0.327103,
      aspect: [1, 0.86592, 0.827629],
      size: [0.27072, 0.327103, 0.283245],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.245975, sunkUnitsMean: 0.245975, sunkUnitsMax: 0.245975,
      sunkFractionMin: 0.75198, sunkFractionMean: 0.75198, sunkFractionMax: 0.75198,
    },
    roles: ["nose"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.27072, 0.327103, 0.283245],
    offset: [0, 1.348827, 0.45776],
    provenance: [
      { species: "bunny", node: "body", ordinal: 4, role: "nose", name: "muzzle/snout" },
    ],
    positions: [0,0.1175,0.1155,-0.0629,0.1242,0.0903,0,0.0359,0.1416,-0.0957,0.0462,0.1033,0.0957,0.0462,0.1033,0,0.0359,0.1416,0.0707,-0.156,0.0233,0,-0.1636,0.0516,0,0.106,-0.1199,0.0957,0.0957,-0.0816,0,-0.1118,-0.1416,0.0707,-0.1194,-0.1133,0,0.1636,-0.0565,0.0629,0.1568,-0.0313,0,0.106,-0.1199,0.0957,0.0957,-0.0816,-0.0629,0.1242,0.0903,-0.089,0.1405,0.0295,-0.0957,0.0462,0.1033,-0.1354,0.071,0.0109,0.089,0.1405,0.0295,0.1354,0.071,0.0109,0.0629,0.1568,-0.0313,0.0957,0.0957,-0.0816,0.0629,0.1242,0.0903,0,0.1175,0.1155,0.0957,0.0462,0.1033,0,0.0359,0.1416,-0.0629,0.1568,-0.0313,0,0.1636,-0.0565,-0.0957,0.0957,-0.0816,0,0.106,-0.1199,-0.0957,0.0462,0.1033,-0.1354,0.071,0.0109,-0.0707,-0.156,0.0233,-0.1,-0.1377,-0.045,0.0957,0.0462,0.1033,0.0707,-0.156,0.0233,0.1354,0.071,0.0109,0.1,-0.1377,-0.045,-0.0957,0.0957,-0.0816,0,0.106,-0.1199,-0.0707,-0.1194,-0.1133,0,-0.1118,-0.1416,0.0629,0.1242,0.0903,0.0957,0.0462,0.1033,0.089,0.1405,0.0295,0.1354,0.071,0.0109,-0.1,-0.1377,-0.045,-0.1354,0.071,0.0109,-0.0707,-0.1194,-0.1133,-0.0957,0.0957,-0.0816,0,0.0359,0.1416,-0.0957,0.0462,0.1033,0,-0.1636,0.0516,-0.0707,-0.156,0.0233,-0.089,0.1405,0.0295,-0.0629,0.1568,-0.0313,-0.1354,0.071,0.0109,-0.0957,0.0957,-0.0816,0.1,-0.1377,-0.045,0.0707,-0.1194,-0.1133,0.1354,0.071,0.0109,0.0957,0.0957,-0.0816,0.089,0.1405,0.0295,0.0629,0.1568,-0.0313,0.0629,0.1242,0.0903,0,0.1175,0.1155,0,0.1636,-0.0565,-0.0629,0.1242,0.0903,-0.0629,0.1568,-0.0313,-0.089,0.1405,0.0295],
    normals: [0,0.6549,0.7557,-0.3963,0.6974,0.5971,0,-0.0727,0.9974,-0.6945,0.0018,0.7195,0.6945,0.0018,0.7195,0,-0.0727,0.9974,0.6978,-0.3367,0.6322,0,-0.4115,0.9114,0,0.4358,-0.9001,0.6945,0.3613,-0.6222,0,0.0994,-0.9951,0.6978,0.0246,-0.7159,0,0.945,-0.327,0.3963,0.9025,-0.1685,0,0.4358,-0.9001,0.6945,0.3613,-0.6222,-0.3963,0.6974,0.5971,-0.5605,0.8,0.2143,-0.6945,0.0018,0.7195,-0.9822,0.1815,0.0486,0.5605,0.8,0.2143,0.9822,0.1815,0.0486,0.3963,0.9025,-0.1685,0.6945,0.3613,-0.6222,0.3963,0.6974,0.5971,0,0.6549,0.7557,0.6945,0.0018,0.7195,0,-0.0727,0.9974,-0.3963,0.9025,-0.1685,0,0.945,-0.327,-0.6945,0.3613,-0.6222,0,0.4358,-0.9001,-0.6945,0.0018,0.7195,-0.9822,0.1815,0.0486,-0.6978,-0.3367,0.6322,-0.9869,-0.156,-0.0418,0.6945,0.0018,0.7195,0.6978,-0.3367,0.6322,0.9822,0.1815,0.0486,0.9869,-0.156,-0.0418,-0.6945,0.3613,-0.6222,0,0.4358,-0.9001,-0.6978,0.0246,-0.7159,0,0.0994,-0.9951,0.3963,0.6974,0.5971,0.6945,0.0018,0.7195,0.5605,0.8,0.2143,0.9822,0.1815,0.0486,-0.9869,-0.156,-0.0418,-0.9822,0.1815,0.0486,-0.6978,0.0246,-0.7159,-0.6945,0.3613,-0.6222,0,-0.0727,0.9974,-0.6945,0.0018,0.7195,0,-0.4115,0.9114,-0.6978,-0.3367,0.6322,-0.5605,0.8,0.2143,-0.3963,0.9025,-0.1685,-0.9822,0.1815,0.0486,-0.6945,0.3613,-0.6222,0.9869,-0.156,-0.0418,0.6978,0.0246,-0.7159,0.9822,0.1815,0.0486,0.6945,0.3613,-0.6222,0.5605,0.8,0.2143,0.3963,0.9025,-0.1685,0.3963,0.6974,0.5971,0,0.6549,0.7557,0,0.945,-0.327,-0.3963,0.6974,0.5971,-0.3963,0.9025,-0.1685,-0.5605,0.8,0.2143],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,66,65,67,65,68,67,67,68,69,68,70,69,71,69,70],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-09",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.182434,
      aspect: [1, 0.749997, 0.437555],
      size: [0.182434, 0.136825, 0.079825],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 23,
    verts: 45,
    triVariants: [23],
    size: [0.182434, 0.136825, 0.079825],
    offset: [0, 0.778404, 0.664913],
    provenance: [
      { species: "bunny", node: "body", ordinal: 9, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0456,0.0684,0.02,0.0912,0.0228,-0.0399,0.0456,0.0684,-0.0399,0.0912,0.0228,0.02,-0.0912,0.0228,0.02,-0.0456,0.0684,-0.0399,-0.0912,0.0228,-0.0399,-0.0456,0.0684,0.02,0.0456,0.0684,-0.0399,-0.0456,0.0684,0.02,0.0456,0.0684,0.02,-0.0456,0.0684,-0.0399,0.0912,0.0228,0.02,0,-0.0684,-0.0399,0.0912,0.0228,-0.0399,0,-0.0684,0.02,0.0456,0.0228,0.0399,-0.0456,0.0228,0.0399,0,-0.0228,0.0399,0.0322,0.0362,0.0399,-0.0322,0.0362,0.0399,0,-0.0684,0.02,-0.0912,0.0228,-0.0399,0,-0.0684,-0.0399,-0.0912,0.0228,0.02,0.0456,0.0684,0.02,0.0456,0.0228,0.0399,0.0912,0.0228,0.02,0.0322,0.0362,0.0399,0.0456,0.0684,0.02,-0.0322,0.0362,0.0399,0.0322,0.0362,0.0399,-0.0456,0.0684,0.02,0.0912,0.0228,0.02,0,-0.0228,0.0399,0,-0.0684,0.02,0.0456,0.0228,0.0399,0,-0.0228,0.0399,-0.0912,0.0228,0.02,0,-0.0684,0.02,-0.0456,0.0228,0.0399,-0.0322,0.0362,0.0399,-0.0912,0.0228,0.02,-0.0456,0.0228,0.0399,-0.0456,0.0684,0.02],
    normals: [0.3343,0.807,0.4868,1,0,0,0.3827,0.9239,0,0.868,0,0.4965,-0.868,0,0.4965,-0.3827,0.9239,0,-1,0,0,-0.3343,0.807,0.4868,0.3827,0.9239,0,-0.3343,0.807,0.4868,0.3343,0.807,0.4868,-0.3827,0.9239,0,0.868,0,0.4965,0.7071,-0.7071,0,1,0,0,0,-0.868,0.4965,0.2923,0,0.9563,-0.2923,0,0.9563,0,-0.2923,0.9563,0.1177,0.284,0.9516,-0.1177,0.284,0.9516,0,-0.868,0.4965,-1,0,0,-0.7071,-0.7071,0,-0.868,0,0.4965,0.3343,0.807,0.4868,0.2923,0,0.9563,0.868,0,0.4965,0.1177,0.284,0.9516,0.3343,0.807,0.4868,-0.1177,0.284,0.9516,0.1177,0.284,0.9516,-0.3343,0.807,0.4868,0.868,0,0.4965,0,-0.2923,0.9563,0,-0.868,0.4965,0.2923,0,0.9563,0,-0.2923,0.9563,-0.868,0,0.4965,0,-0.868,0.4965,-0.2923,0,0.9563,-0.1177,0.284,0.9516,-0.868,0,0.4965,-0.2923,0,0.9563,-0.3343,0.807,0.4868],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,17,19,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  {
    id: "box-10",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.182434,
      aspect: [1, 0.749997, 0.601039],
      size: [0.182434, 0.136825, 0.10965],
    },
    attachment: {
      axis: "z", dir: 1, n: 2,
      sunkUnitsMin: 0, sunkUnitsMean: 0.016119, sunkUnitsMax: 0.032238,
      sunkFractionMin: 0, sunkFractionMean: 0.147004, sunkFractionMax: 0.294008,
    },
    roles: ["nose"],
    tris: 23,
    verts: 45,
    triVariants: [23],
    size: [0.182434, 0.136825, 0.10965],
    offset: [0, 0.731404, 0.647588],
    provenance: [
      { species: "cat", node: "body", ordinal: 5, role: "nose", name: "nose-tip" },
      { species: "polar", node: "body", ordinal: 6, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0456,0.0684,-0.0548,0.0912,0.0228,0.0274,0.0912,0.0228,-0.0548,0.0456,0.0684,0.0274,-0.0912,0.0228,0.0274,-0.0456,0.0684,-0.0548,-0.0912,0.0228,-0.0548,-0.0456,0.0684,0.0274,0.0456,0.0684,-0.0548,-0.0456,0.0684,0.0274,0.0456,0.0684,0.0274,-0.0456,0.0684,-0.0548,0.0912,0.0228,0.0274,0,-0.0684,-0.0548,0.0912,0.0228,-0.0548,0,-0.0684,0.0274,0.0456,0.0228,0.0548,-0.0456,0.0228,0.0548,0,-0.0228,0.0548,0.0322,0.0362,0.0548,-0.0322,0.0362,0.0548,0,-0.0684,0.0274,-0.0912,0.0228,-0.0548,0,-0.0684,-0.0548,-0.0912,0.0228,0.0274,0.0456,0.0684,0.0274,0.0456,0.0228,0.0548,0.0912,0.0228,0.0274,0.0322,0.0362,0.0548,0.0456,0.0684,0.0274,-0.0322,0.0362,0.0548,0.0322,0.0362,0.0548,-0.0456,0.0684,0.0274,0.0912,0.0228,0.0274,0,-0.0228,0.0548,0,-0.0684,0.0274,0.0456,0.0228,0.0548,0,-0.0228,0.0548,-0.0912,0.0228,0.0274,0,-0.0684,0.0274,-0.0456,0.0228,0.0548,-0.0322,0.0362,0.0548,-0.0912,0.0228,0.0274,-0.0456,0.0228,0.0548,-0.0456,0.0684,0.0274],
    normals: [0.3827,0.9239,0,0.8943,0,0.4475,1,0,0,0.3468,0.8371,0.423,-0.8943,0,0.4475,-0.3827,0.9239,0,-1,0,0,-0.3468,0.8371,0.423,0.3827,0.9239,0,-0.3468,0.8371,0.423,0.3468,0.8371,0.423,-0.3827,0.9239,0,0.8943,0,0.4475,0.7071,-0.7071,0,1,0,0,0,-0.8943,0.4475,0.3702,0,0.9289,-0.3702,0,0.9289,0,-0.3702,0.9289,0.1463,0.3532,0.924,-0.1463,0.3532,0.924,0,-0.8943,0.4475,-1,0,0,-0.7071,-0.7071,0,-0.8943,0,0.4475,0.3468,0.8371,0.423,0.3702,0,0.9289,0.8943,0,0.4475,0.1463,0.3532,0.924,0.3468,0.8371,0.423,-0.1463,0.3532,0.924,0.1463,0.3532,0.924,-0.3468,0.8371,0.423,0.8943,0,0.4475,0,-0.3702,0.9289,0,-0.8943,0.4475,0.3702,0,0.9289,0,-0.3702,0.9289,-0.8943,0,0.4475,0,-0.8943,0.4475,-0.3702,0,0.9289,-0.1463,0.3532,0.924,-0.8943,0,0.4475,-0.3702,0,0.9289,-0.3468,0.8371,0.423],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,17,19,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-11",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.4445,
      aspect: [1, 0.607047, 0.308642],
      size: [1.4445, 0.87688, 0.445833],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.798197, sunkUnitsMean: 0.798197, sunkUnitsMax: 0.798197,
      sunkFractionMin: 0.910269, sunkFractionMean: 0.910269, sunkFractionMax: 0.910269,
    },
    roles: ["band"],
    tris: 84,
    verts: 154,
    triVariants: [84],
    size: [1.4445, 0.87688, 0.445833],
    offset: [0, 1.071493, 0],
    provenance: [
      { species: "caterpillar", node: "body", ordinal: 0, role: "band", name: "body-segment (torso shell-ring)" },
    ],
    positions: [0.7222,0.0668,0.1159,0.7222,-0.1942,-0.1159,0.7222,0.0668,-0.1159,0.7222,-0.2913,-0.0757,0.7222,-0.3226,0,0.7222,-0.2913,0.0757,0.7222,-0.1942,0.1159,0.6152,-0.2155,0.2229,-0.6152,0.0344,0.2229,-0.6152,-0.2155,0.2229,0.6152,0.0344,0.2229,-0.4964,0.2126,0.2229,0.4964,0.2126,0.2229,0.3182,0.3314,0.2229,-0.3182,0.3314,0.2229,-0.3506,0.4384,-0.1159,0.3506,0.4384,0.1159,0.3506,0.4384,-0.1159,-0.3506,0.4384,0.1159,0.3506,0.4384,-0.1159,0.5736,0.2898,0.1159,0.5736,0.2898,-0.1159,0.3506,0.4384,0.1159,-0.7222,-0.2913,-0.0757,-0.7222,0.0668,-0.1159,-0.7222,-0.1942,-0.1159,-0.7222,0.0668,0.1159,-0.7222,-0.3226,0,-0.7222,-0.2913,0.0757,-0.7222,-0.1942,0.1159,-0.5736,0.2898,-0.1159,-0.3506,0.4384,0.1159,-0.3506,0.4384,-0.1159,-0.5736,0.2898,0.1159,-0.7222,0.0668,0.1159,-0.5736,0.2898,-0.1159,-0.7222,0.0668,-0.1159,-0.5736,0.2898,0.1159,0.5736,0.2898,0.1159,0.7222,0.0668,-0.1159,0.5736,0.2898,-0.1159,0.7222,0.0668,0.1159,0.6152,-0.3731,0.1576,-0.6152,-0.2155,0.2229,-0.6152,-0.3731,0.1576,0.6152,-0.2155,0.2229,0.6152,-0.3731,0.1576,-0.6152,-0.4384,0,0.6152,-0.4384,0,-0.6152,-0.3731,0.1576,-0.6152,-0.4384,0,0.6152,-0.3731,-0.1576,0.6152,-0.4384,0,-0.6152,-0.3731,-0.1576,-0.6152,-0.2155,-0.2229,0.6152,-0.3731,-0.1576,-0.6152,-0.3731,-0.1576,0.6152,-0.2155,-0.2229,-0.6152,0.0344,-0.2229,0.6152,-0.2155,-0.2229,-0.6152,-0.2155,-0.2229,0.6152,0.0344,-0.2229,-0.4964,0.2126,-0.2229,0.4964,0.2126,-0.2229,0.3182,0.3314,-0.2229,-0.3182,0.3314,-0.2229,0.3182,0.3314,-0.2229,0.5736,0.2898,-0.1159,0.4964,0.2126,-0.2229,0.3506,0.4384,-0.1159,0.5736,0.2898,0.1159,0.3182,0.3314,0.2229,0.4964,0.2126,0.2229,0.3506,0.4384,0.1159,-0.7222,-0.1942,-0.1159,-0.6152,0.0344,-0.2229,-0.6152,-0.2155,-0.2229,-0.7222,0.0668,-0.1159,0.3182,0.3314,0.2229,-0.3506,0.4384,0.1159,-0.3182,0.3314,0.2229,0.3506,0.4384,0.1159,-0.3506,0.4384,-0.1159,0.3182,0.3314,-0.2229,-0.3182,0.3314,-0.2229,0.3506,0.4384,-0.1159,-0.4964,0.2126,0.2229,-0.7222,0.0668,0.1159,-0.6152,0.0344,0.2229,-0.5736,0.2898,0.1159,-0.7222,-0.2913,-0.0757,-0.6152,-0.2155,-0.2229,-0.6152,-0.3731,-0.1576,-0.7222,-0.1942,-0.1159,0.4964,0.2126,-0.2229,0.7222,0.0668,-0.1159,0.6152,0.0344,-0.2229,0.5736,0.2898,-0.1159,-0.6152,-0.3731,0.1576,-0.7222,-0.3226,0,-0.6152,-0.4384,0,-0.7222,-0.2913,0.0757,-0.5736,0.2898,-0.1159,-0.3182,0.3314,-0.2229,-0.4964,0.2126,-0.2229,-0.3506,0.4384,-0.1159,-0.3182,0.3314,0.2229,-0.5736,0.2898,0.1159,-0.4964,0.2126,0.2229,-0.3506,0.4384,0.1159,-0.6152,-0.4384,0,-0.7222,-0.2913,-0.0757,-0.6152,-0.3731,-0.1576,-0.7222,-0.3226,0,-0.7222,0.0668,-0.1159,-0.4964,0.2126,-0.2229,-0.6152,0.0344,-0.2229,-0.5736,0.2898,-0.1159,-0.6152,-0.2155,0.2229,-0.7222,-0.2913,0.0757,-0.6152,-0.3731,0.1576,-0.7222,-0.1942,0.1159,-0.6152,0.0344,0.2229,-0.7222,-0.1942,0.1159,-0.6152,-0.2155,0.2229,-0.7222,0.0668,0.1159,0.7222,0.0668,0.1159,0.4964,0.2126,0.2229,0.6152,0.0344,0.2229,0.5736,0.2898,0.1159,0.7222,-0.2913,0.0757,0.6152,-0.2155,0.2229,0.6152,-0.3731,0.1576,0.7222,-0.1942,0.1159,0.7222,-0.2913,0.0757,0.6152,-0.4384,0,0.7222,-0.3226,0,0.6152,-0.3731,0.1576,0.7222,-0.1942,0.1159,0.6152,0.0344,0.2229,0.6152,-0.2155,0.2229,0.7222,0.0668,0.1159,0.7222,-0.2913,-0.0757,0.6152,-0.4384,0,0.6152,-0.3731,-0.1576,0.7222,-0.3226,0,0.6152,0.0344,-0.2229,0.7222,-0.1942,-0.1159,0.6152,-0.2155,-0.2229,0.7222,0.0668,-0.1159,0.6152,-0.2155,-0.2229,0.7222,-0.2913,-0.0757,0.6152,-0.3731,-0.1576,0.7222,-0.1942,-0.1159],
    normals: [0.9209,0.2788,0.2725,0.9501,-0.0574,-0.3066,0.9209,0.2788,-0.2725,0.9279,-0.2592,-0.2679,0.8746,-0.4848,0,0.9279,-0.2592,0.2679,0.9501,-0.0574,0.3066,0.4273,-0.1879,0.8844,-0.4537,0.1374,0.8805,-0.4273,-0.1879,0.8844,0.4537,0.1374,0.8805,-0.3272,0.3272,0.8865,0.3272,0.3272,0.8865,0.1374,0.4537,0.8805,-0.1374,0.4537,0.8805,-0.2788,0.9209,-0.2725,0.2788,0.9209,0.2725,0.2788,0.9209,-0.2725,-0.2788,0.9209,0.2725,0.2788,0.9209,-0.2725,0.6792,0.6792,0.2783,0.6792,0.6792,-0.2783,0.2788,0.9209,0.2725,-0.9279,-0.2592,-0.2679,-0.9209,0.2788,-0.2725,-0.9501,-0.0574,-0.3066,-0.9209,0.2788,0.2725,-0.8746,-0.4848,0,-0.9279,-0.2592,0.2679,-0.9501,-0.0574,0.3066,-0.6792,0.6792,-0.2783,-0.2788,0.9209,0.2725,-0.2788,0.9209,-0.2725,-0.6792,0.6792,0.2783,-0.9209,0.2788,0.2725,-0.6792,0.6792,-0.2783,-0.9209,0.2788,-0.2725,-0.6792,0.6792,0.2783,0.6792,0.6792,0.2783,0.9209,0.2788,-0.2725,0.6792,0.6792,-0.2783,0.9209,0.2788,0.2725,0.4156,-0.716,0.5609,-0.4273,-0.1879,0.8844,-0.4156,-0.716,0.5609,0.4273,-0.1879,0.8844,0.4156,-0.716,0.5609,-0.351,-0.9364,0,0.351,-0.9364,0,-0.4156,-0.716,0.5609,-0.351,-0.9364,0,0.4156,-0.716,-0.5609,0.351,-0.9364,0,-0.4156,-0.716,-0.5609,-0.4273,-0.1879,-0.8844,0.4156,-0.716,-0.5609,-0.4156,-0.716,-0.5609,0.4273,-0.1879,-0.8844,-0.4537,0.1374,-0.8805,0.4273,-0.1879,-0.8844,-0.4273,-0.1879,-0.8844,0.4537,0.1374,-0.8805,-0.3272,0.3272,-0.8865,0.3272,0.3272,-0.8865,0.1374,0.4537,-0.8805,-0.1374,0.4537,-0.8805,0.1374,0.4537,-0.8805,0.6792,0.6792,-0.2783,0.3272,0.3272,-0.8865,0.2788,0.9209,-0.2725,0.6792,0.6792,0.2783,0.1374,0.4537,0.8805,0.3272,0.3272,0.8865,0.2788,0.9209,0.2725,-0.9501,-0.0574,-0.3066,-0.4537,0.1374,-0.8805,-0.4273,-0.1879,-0.8844,-0.9209,0.2788,-0.2725,0.1374,0.4537,0.8805,-0.2788,0.9209,0.2725,-0.1374,0.4537,0.8805,0.2788,0.9209,0.2725,-0.2788,0.9209,-0.2725,0.1374,0.4537,-0.8805,-0.1374,0.4537,-0.8805,0.2788,0.9209,-0.2725,-0.3272,0.3272,0.8865,-0.9209,0.2788,0.2725,-0.4537,0.1374,0.8805,-0.6792,0.6792,0.2783,-0.9279,-0.2592,-0.2679,-0.4273,-0.1879,-0.8844,-0.4156,-0.716,-0.5609,-0.9501,-0.0574,-0.3066,0.3272,0.3272,-0.8865,0.9209,0.2788,-0.2725,0.4537,0.1374,-0.8805,0.6792,0.6792,-0.2783,-0.4156,-0.716,0.5609,-0.8746,-0.4848,0,-0.351,-0.9364,0,-0.9279,-0.2592,0.2679,-0.6792,0.6792,-0.2783,-0.1374,0.4537,-0.8805,-0.3272,0.3272,-0.8865,-0.2788,0.9209,-0.2725,-0.1374,0.4537,0.8805,-0.6792,0.6792,0.2783,-0.3272,0.3272,0.8865,-0.2788,0.9209,0.2725,-0.351,-0.9364,0,-0.9279,-0.2592,-0.2679,-0.4156,-0.716,-0.5609,-0.8746,-0.4848,0,-0.9209,0.2788,-0.2725,-0.3272,0.3272,-0.8865,-0.4537,0.1374,-0.8805,-0.6792,0.6792,-0.2783,-0.4273,-0.1879,0.8844,-0.9279,-0.2592,0.2679,-0.4156,-0.716,0.5609,-0.9501,-0.0574,0.3066,-0.4537,0.1374,0.8805,-0.9501,-0.0574,0.3066,-0.4273,-0.1879,0.8844,-0.9209,0.2788,0.2725,0.9209,0.2788,0.2725,0.3272,0.3272,0.8865,0.4537,0.1374,0.8805,0.6792,0.6792,0.2783,0.9279,-0.2592,0.2679,0.4273,-0.1879,0.8844,0.4156,-0.716,0.5609,0.9501,-0.0574,0.3066,0.9279,-0.2592,0.2679,0.351,-0.9364,0,0.8746,-0.4848,0,0.4156,-0.716,0.5609,0.9501,-0.0574,0.3066,0.4537,0.1374,0.8805,0.4273,-0.1879,0.8844,0.9209,0.2788,0.2725,0.9279,-0.2592,-0.2679,0.351,-0.9364,0,0.4156,-0.716,-0.5609,0.8746,-0.4848,0,0.4537,0.1374,-0.8805,0.9501,-0.0574,-0.3066,0.4273,-0.1879,-0.8844,0.9209,0.2788,-0.2725,0.4273,-0.1879,-0.8844,0.9279,-0.2592,-0.2679,0.4156,-0.716,-0.5609,0.9501,-0.0574,-0.3066],
    indices: [0,1,2,1,0,3,3,0,4,4,0,5,5,0,6,7,8,9,8,7,10,8,10,11,11,10,12,11,12,13,11,13,14,15,16,17,16,15,18,19,20,21,20,19,22,23,24,25,24,23,26,26,23,27,26,27,28,26,28,29,30,31,32,31,30,33,34,35,36,35,34,37,38,39,40,39,38,41,42,43,44,43,42,45,46,47,48,47,46,49,50,51,52,51,50,53,54,55,56,55,54,57,58,59,60,59,58,61,61,58,62,61,62,63,63,62,64,64,62,65,66,67,68,67,66,69,70,71,72,71,70,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,106,107,108,107,106,109,110,111,112,111,110,113,114,115,116,115,114,117,118,119,120,119,118,121,122,123,124,123,122,125,126,127,128,127,126,129,130,131,132,131,130,133,134,135,136,135,134,137,138,139,140,139,138,141,142,143,144,143,142,145,146,147,148,147,146,149,150,151,152,151,150,153],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-12",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.539484,
      aspect: [1, 0.81196, 0.81196],
      size: [1.539484, 1.25, 1.25],
    },
    attachment: null,
    roles: ["hull"],
    tris: 180,
    verts: 112,
    triVariants: [180],
    size: [1.539484, 1.25, 1.25],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "cow", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
      { species: "deer", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [0.7227,0.4662,0.5,0.6729,0.5475,0.4625,0.6619,0.5093,0.5,0.5,0.5,0.5,0.4863,0.5368,0.4625,0.6729,0.5475,0.3875,0.4429,0.4562,0.5,0.7697,0.4788,0.4625,0.4078,0.4765,0.4625,0.434,0.3888,0.5,0.7202,0.3708,0.4625,0.6916,0.3984,0.5,0.5468,0.3255,0.5,0.7697,0.4788,0.3875,0.5533,0.2868,0.4625,0.4754,0.3349,0.5,0.4551,0.2998,0.4625,0.7202,0.3708,0.3875,0.3948,0.3783,0.4625,0.4551,0.2998,0.3875,0.7227,0.4662,0.35,0.3948,0.3783,0.3875,0.5533,0.2868,0.3875,0.6916,0.3984,0.35,0.5468,0.3255,0.35,0.6619,0.5093,0.35,0.4754,0.3349,0.35,0.434,0.3888,0.35,0.4078,0.4765,0.3875,0.4429,0.4562,0.35,0.5,0.5,0.35,0.4863,0.5368,0.3875,-0.7227,0.4662,0.5,-0.7202,0.3708,0.4625,-0.6916,0.3984,0.5,-0.5468,0.3255,0.5,-0.5533,0.2868,0.4625,-0.7202,0.3708,0.3875,-0.4754,0.3349,0.5,-0.7697,0.4788,0.4625,-0.4551,0.2998,0.4625,-0.434,0.3888,0.5,-0.6729,0.5475,0.4625,-0.6619,0.5093,0.5,-0.5,0.5,0.5,-0.7697,0.4788,0.3875,-0.4863,0.5368,0.4625,-0.4429,0.4562,0.5,-0.4078,0.4765,0.4625,-0.6729,0.5475,0.3875,-0.3948,0.3783,0.4625,-0.4078,0.4765,0.3875,-0.7227,0.4662,0.35,-0.3948,0.3783,0.3875,-0.4863,0.5368,0.3875,-0.6619,0.5093,0.35,-0.5,0.5,0.35,-0.6916,0.3984,0.35,-0.4429,0.4562,0.35,-0.434,0.3888,0.35,-0.4551,0.2998,0.3875,-0.4754,0.3349,0.35,-0.5468,0.3255,0.35,-0.5533,0.2868,0.3875,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,-0.3125,0.3125,0.625,-0.5,0.5,0.5,0.5,0.5,0.5,0.3125,0.625,0.3125,0.3125,-0.3125,0.625,0.5,-0.5,0.5,-0.5,-0.5,0.5,-0.625,0.3125,0.3125,-0.3125,0.625,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,-0.3125,-0.5,0.5,-0.5,-0.625,0.3125,-0.3125,-0.625,-0.3125,0.3125,-0.625,-0.3125,-0.3125,0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.3125,-0.625,0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.3125,0.5,-0.5,-0.5,-0.3125,-0.625,-0.3125,-0.3125,-0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,0.625,0.3125,-0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,-0.3125,0.3125,0.4754,0.3349,0.5,0.4429,0.4562,0.5,0.434,0.3888,0.5,0.5,0.5,0.5,0.5468,0.3255,0.5,0.6619,0.5093,0.5,0.6916,0.3984,0.5,0.7227,0.4662,0.5,-0.4429,0.4562,0.5,-0.4754,0.3349,0.5,-0.434,0.3888,0.5,-0.5468,0.3255,0.5,-0.5,0.5,0.5,-0.6916,0.3984,0.5,-0.6619,0.5093,0.5,-0.7227,0.4662,0.5],
    normals: [0.4207,0.1127,0.9002,0.2567,0.8935,0.3685,0.1197,0.4166,0.9012,-0.1498,0.4028,0.9029,-0.324,0.8712,0.3687,0.2567,0.8935,-0.3685,-0.3791,0.2189,0.8991,0.8924,0.2391,0.3828,-0.805,0.4647,0.3689,-0.4228,-0.1133,0.8991,0.6691,-0.6454,0.3685,0.312,-0.301,0.9012,0.0717,-0.4238,0.9029,0.8924,0.2391,-0.3828,0.155,-0.9165,0.3687,-0.2189,-0.3791,0.8991,-0.4647,-0.805,0.3689,0.6691,-0.6454,-0.3685,-0.8978,-0.2406,0.3689,-0.4647,-0.805,-0.3689,0.4207,0.1127,-0.9002,-0.8978,-0.2406,-0.3689,0.155,-0.9165,-0.3687,0.312,-0.301,-0.9012,0.0717,-0.4238,-0.9029,0.1197,0.4166,-0.9012,-0.2189,-0.3791,-0.8991,-0.4228,-0.1133,-0.8991,-0.805,0.4647,-0.3689,-0.3791,0.2189,-0.8991,-0.1498,0.4028,-0.9029,-0.324,0.8712,-0.3687,-0.4207,0.1127,0.9002,-0.6691,-0.6454,0.3685,-0.312,-0.301,0.9012,-0.0717,-0.4238,0.9029,-0.155,-0.9165,0.3687,-0.6691,-0.6454,-0.3685,0.2189,-0.3791,0.8991,-0.8924,0.2391,0.3828,0.4647,-0.805,0.3689,0.4228,-0.1133,0.8991,-0.2567,0.8935,0.3685,-0.1197,0.4166,0.9012,0.1498,0.4028,0.9029,-0.8924,0.2391,-0.3828,0.324,0.8712,0.3687,0.3791,0.2189,0.8991,0.805,0.4647,0.3689,-0.2567,0.8935,-0.3685,0.8978,-0.2406,0.3689,0.805,0.4647,-0.3689,-0.4207,0.1127,-0.9002,0.8978,-0.2406,-0.3689,0.324,0.8712,-0.3687,-0.1197,0.4166,-0.9012,0.1498,0.4028,-0.9029,-0.312,-0.301,-0.9012,0.3791,0.2189,-0.8991,0.4228,-0.1133,-0.8991,0.4647,-0.805,-0.3689,0.2189,-0.3791,-0.8991,-0.0717,-0.4238,-0.9029,-0.155,-0.9165,-0.3687,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,-0.2232,0.2232,0.9489,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,0.2232,0.9489,0.2232,0.2232,-0.2232,0.9489,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.9489,0.2232,0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,-0.2232,-0.5774,0.5774,-0.5774,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,0.2232,-0.9489,-0.2232,-0.2232,0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,-0.2232,-0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,-0.2232,0.2232,-0.2189,-0.3791,0.8991,-0.3791,0.2189,0.8991,-0.4228,-0.1133,0.8991,-0.1498,0.4028,0.9029,0.0717,-0.4238,0.9029,0.1197,0.4166,0.9012,0.312,-0.301,0.9012,0.4207,0.1127,0.9002,0.3791,0.2189,0.8991,0.2189,-0.3791,0.8991,0.4228,-0.1133,0.8991,-0.0717,-0.4238,0.9029,0.1498,0.4028,0.9029,-0.312,-0.301,0.9012,-0.1197,0.4166,0.9012,-0.4207,0.1127,0.9002],
    indices: [0,1,2,1,3,2,3,1,4,5,4,1,4,6,3,1,0,7,7,5,1,6,4,8,8,9,6,0,10,7,10,0,11,12,10,11,5,7,13,10,13,7,10,12,14,15,14,12,9,16,15,14,15,16,13,10,17,14,17,10,16,9,18,9,8,18,19,14,16,18,19,16,20,5,13,17,20,13,8,21,18,19,18,21,17,14,22,14,19,22,20,17,23,24,17,22,17,24,23,23,25,20,5,20,25,24,25,23,26,22,19,22,26,24,27,19,21,19,27,26,21,8,28,28,27,21,29,26,27,26,29,24,27,28,29,24,30,25,30,5,25,24,29,30,8,31,28,31,29,28,29,31,30,5,30,31,31,8,4,4,5,31,32,33,34,33,35,34,35,33,36,37,36,33,36,38,35,33,32,39,39,37,33,38,36,40,40,41,38,32,42,39,42,32,43,44,42,43,37,39,45,42,45,39,42,44,46,47,46,44,41,48,47,46,47,48,45,42,49,46,49,42,48,41,50,41,40,50,51,46,48,50,51,48,52,37,45,49,52,45,40,53,50,51,50,53,49,46,54,46,51,54,52,49,55,56,49,54,49,56,55,55,57,52,37,52,57,56,57,55,58,54,51,54,58,56,59,51,53,51,59,58,53,40,60,60,59,53,61,58,59,58,61,56,59,60,61,56,62,57,62,37,57,56,61,62,40,63,60,63,61,60,61,63,62,37,62,63,63,40,36,36,37,63,64,65,66,67,64,66,66,68,67,68,66,65,69,67,68,70,68,65,65,64,70,68,70,71,72,70,64,64,67,72,70,72,71,73,72,67,67,69,74,75,74,69,68,75,69,76,67,74,74,75,76,67,76,77,75,77,76,78,67,77,67,78,73,78,79,73,72,73,79,79,78,80,77,80,78,80,72,79,75,68,81,77,75,81,72,80,82,80,77,82,72,83,71,83,72,84,84,85,83,85,71,83,85,82,86,71,85,86,72,87,84,85,84,87,82,85,87,87,72,82,77,88,82,88,86,82,88,77,89,77,90,89,90,77,81,89,91,88,91,89,90,86,88,91,81,91,90,91,81,86,92,86,81,68,92,81,93,71,86,86,92,93,92,68,94,94,93,92,71,93,95,95,68,71,93,94,95,68,95,94,96,97,98,97,96,99,99,96,100,99,100,101,101,100,102,101,102,103,104,105,106,105,104,107,107,104,108,107,108,109,109,108,110,109,110,111],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-13",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.347378,
      aspect: [1, 0.989298, 0.334395],
      size: [1.332958, 0.450556, 1.347378],
    },
    attachment: null,
    roles: ["hull"],
    tris: 92,
    verts: 168,
    triVariants: [92],
    size: [1.332958, 0.450556, 1.347378],
    offset: [0, 0.54625, 0],
    provenance: [
      { species: "crab", node: "body", ordinal: 2, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [-0.3235,-0.1058,0.6737,-0.5293,0.1747,0.5201,-0.5293,-0.1137,0.5367,-0.3235,0.1826,0.6571,-0.5293,-0.1747,-0.5201,-0.6665,0.1256,-0.3313,-0.5293,0.1137,-0.5367,-0.6665,-0.1628,-0.3147,0.4937,0.2182,0.4819,0.3235,0.1826,0.6571,0.5293,0.1747,0.5201,0.3086,0.2253,0.6051,-0.3235,0.1058,-0.6737,0.3086,0.1542,-0.627,0.3235,0.1058,-0.6737,-0.3086,0.1542,-0.627,0.3235,0.1058,-0.6737,0.4937,0.1613,-0.5038,0.5293,0.1137,-0.5367,0.3086,0.1542,-0.627,-0.6171,0.2075,0.2971,-0.5293,0.1747,0.5201,-0.4937,0.2182,0.4819,-0.6665,0.1628,0.3147,-0.6665,-0.1628,-0.3147,-0.6665,0.1628,0.3147,-0.6665,0.1256,-0.3313,-0.6665,-0.1256,0.3313,0.3235,0.1058,-0.6737,0.5293,-0.1747,-0.5201,0.3235,-0.1826,-0.6571,0.5293,0.1137,-0.5367,-0.3235,0.1058,-0.6737,-0.4937,0.1613,-0.5038,-0.3086,0.1542,-0.627,-0.5293,0.1137,-0.5367,0.5293,0.1137,-0.5367,0.6171,0.172,-0.319,0.6665,0.1256,-0.3313,0.4937,0.1613,-0.5038,-0.5293,0.1137,-0.5367,-0.6171,0.172,-0.319,-0.4937,0.1613,-0.5038,-0.6665,0.1256,-0.3313,0.6171,0.172,-0.319,0.6665,0.1628,0.3147,0.6665,0.1256,-0.3313,0.6171,0.2075,0.2971,0.4937,-0.2182,-0.4819,0.3235,-0.1826,-0.6571,0.5293,-0.1747,-0.5201,0.3086,-0.2253,-0.6051,0.5293,0.1747,0.5201,0.3235,-0.1058,0.6737,0.5293,-0.1137,0.5367,0.3235,0.1826,0.6571,0.3235,-0.1058,0.6737,0.4937,-0.1613,0.5038,0.5293,-0.1137,0.5367,0.3086,-0.1542,0.627,0.6665,0.1256,-0.3313,0.5293,-0.1747,-0.5201,0.5293,0.1137,-0.5367,0.6665,-0.1628,-0.3147,-0.6665,0.1628,0.3147,-0.6171,0.172,-0.319,-0.6665,0.1256,-0.3313,-0.6171,0.2075,0.2971,0.6171,0.2075,0.2971,0.5293,0.1747,0.5201,0.6665,0.1628,0.3147,0.4937,0.2182,0.4819,0.6171,-0.2075,-0.2971,0.5293,-0.1747,-0.5201,0.6665,-0.1628,-0.3147,0.4937,-0.2182,-0.4819,0.4937,0.1613,-0.5038,0.6171,0.2075,0.2971,0.6171,0.172,-0.319,0.4937,0.2182,0.4819,0.3086,0.1542,-0.627,0.3086,0.2253,0.6051,-0.3086,0.2253,0.6051,-0.3086,0.1542,-0.627,-0.4937,0.2182,0.4819,-0.4937,0.1613,-0.5038,-0.6171,0.2075,0.2971,-0.6171,0.172,-0.319,-0.4937,-0.2182,-0.4819,-0.3235,-0.1826,-0.6571,-0.3086,-0.2253,-0.6051,-0.5293,-0.1747,-0.5201,0.3086,0.2253,0.6051,-0.3235,0.1826,0.6571,0.3235,0.1826,0.6571,-0.3086,0.2253,0.6051,-0.3086,-0.2253,-0.6051,0.3235,-0.1826,-0.6571,0.3086,-0.2253,-0.6051,-0.3235,-0.1826,-0.6571,-0.3235,-0.1826,-0.6571,0.3235,0.1058,-0.6737,0.3235,-0.1826,-0.6571,-0.3235,0.1058,-0.6737,0.3235,0.1826,0.6571,-0.3235,-0.1058,0.6737,0.3235,-0.1058,0.6737,-0.3235,0.1826,0.6571,-0.5293,-0.1747,-0.5201,-0.3235,0.1058,-0.6737,-0.3235,-0.1826,-0.6571,-0.5293,0.1137,-0.5367,-0.4937,0.2182,0.4819,-0.3235,0.1826,0.6571,-0.3086,0.2253,0.6051,-0.5293,0.1747,0.5201,0.4937,-0.1613,0.5038,0.6171,-0.2075,-0.2971,0.6171,-0.172,0.319,0.4937,-0.2182,-0.4819,0.3086,-0.2253,-0.6051,0.3086,-0.1542,0.627,-0.3086,-0.1542,0.627,-0.3086,-0.2253,-0.6051,-0.4937,-0.1613,0.5038,-0.4937,-0.2182,-0.4819,-0.6171,-0.172,0.319,-0.6171,-0.2075,-0.2971,-0.6171,-0.2075,-0.2971,-0.6665,-0.1256,0.3313,-0.6665,-0.1628,-0.3147,-0.6171,-0.172,0.319,-0.6171,-0.2075,-0.2971,-0.5293,-0.1747,-0.5201,-0.4937,-0.2182,-0.4819,-0.6665,-0.1628,-0.3147,0.6665,0.1628,0.3147,0.6665,-0.1628,-0.3147,0.6665,0.1256,-0.3313,0.6665,-0.1256,0.3313,0.6665,-0.1256,0.3313,0.6171,-0.2075,-0.2971,0.6665,-0.1628,-0.3147,0.6171,-0.172,0.319,0.5293,0.1747,0.5201,0.6665,-0.1256,0.3313,0.6665,0.1628,0.3147,0.5293,-0.1137,0.5367,-0.6665,-0.1256,0.3313,-0.5293,0.1747,0.5201,-0.6665,0.1628,0.3147,-0.5293,-0.1137,0.5367,0.3235,-0.1058,0.6737,-0.3086,-0.1542,0.627,0.3086,-0.1542,0.627,-0.3235,-0.1058,0.6737,0.5293,-0.1137,0.5367,0.6171,-0.172,0.319,0.6665,-0.1256,0.3313,0.4937,-0.1613,0.5038,-0.3235,-0.1058,0.6737,-0.4937,-0.1613,0.5038,-0.3086,-0.1542,0.627,-0.5293,-0.1137,0.5367,-0.5293,-0.1137,0.5367,-0.6171,-0.172,0.319,-0.4937,-0.1613,0.5038,-0.6665,-0.1256,0.3313],
    normals: [-0.2637,-0.3637,0.8934,-0.6432,0.4518,0.6182,-0.6432,-0.3777,0.666,-0.2637,0.464,0.8457,-0.6432,-0.4518,-0.6182,-0.871,0.3987,-0.2871,-0.6432,0.3777,-0.666,-0.871,-0.429,-0.2394,0.2628,0.942,0.2089,0.2637,0.464,0.8457,0.6432,0.4518,0.6182,0.111,0.9433,0.313,-0.2637,0.3637,-0.8934,0.111,0.901,-0.4193,0.2637,0.3637,-0.8934,-0.111,0.901,-0.4193,0.2637,0.3637,-0.8934,0.2628,0.9117,-0.3158,0.6432,0.3777,-0.666,0.111,0.901,-0.4193,-0.3667,0.9285,0.0577,-0.6432,0.4518,0.6182,-0.2628,0.942,0.2089,-0.871,0.429,0.2394,-0.871,-0.429,-0.2394,-0.871,0.429,0.2394,-0.871,0.3987,-0.2871,-0.871,-0.3987,0.2871,0.2637,0.3637,-0.8934,0.6432,-0.4518,-0.6182,0.2637,-0.464,-0.8457,0.6432,0.3777,-0.666,-0.2637,0.3637,-0.8934,-0.2628,0.9117,-0.3158,-0.111,0.901,-0.4193,-0.6432,0.3777,-0.666,0.6432,0.3777,-0.666,0.3667,0.9157,-0.164,0.871,0.3987,-0.2871,0.2628,0.9117,-0.3158,-0.6432,0.3777,-0.666,-0.3667,0.9157,-0.164,-0.2628,0.9117,-0.3158,-0.871,0.3987,-0.2871,0.3667,0.9157,-0.164,0.871,0.429,0.2394,0.871,0.3987,-0.2871,0.3667,0.9285,0.0577,0.2628,-0.942,-0.2089,0.2637,-0.464,-0.8457,0.6432,-0.4518,-0.6182,0.111,-0.9433,-0.313,0.6432,0.4518,0.6182,0.2637,-0.3637,0.8934,0.6432,-0.3777,0.666,0.2637,0.464,0.8457,0.2637,-0.3637,0.8934,0.2628,-0.9117,0.3158,0.6432,-0.3777,0.666,0.111,-0.901,0.4193,0.871,0.3987,-0.2871,0.6432,-0.4518,-0.6182,0.6432,0.3777,-0.666,0.871,-0.429,-0.2394,-0.871,0.429,0.2394,-0.3667,0.9157,-0.164,-0.871,0.3987,-0.2871,-0.3667,0.9285,0.0577,0.3667,0.9285,0.0577,0.6432,0.4518,0.6182,0.871,0.429,0.2394,0.2628,0.942,0.2089,0.3667,-0.9285,-0.0577,0.6432,-0.4518,-0.6182,0.871,-0.429,-0.2394,0.2628,-0.942,-0.2089,0.2628,0.9117,-0.3158,0.3667,0.9285,0.0577,0.3667,0.9157,-0.164,0.2628,0.942,0.2089,0.111,0.901,-0.4193,0.111,0.9433,0.313,-0.111,0.9433,0.313,-0.111,0.901,-0.4193,-0.2628,0.942,0.2089,-0.2628,0.9117,-0.3158,-0.3667,0.9285,0.0577,-0.3667,0.9157,-0.164,-0.2628,-0.942,-0.2089,-0.2637,-0.464,-0.8457,-0.111,-0.9433,-0.313,-0.6432,-0.4518,-0.6182,0.111,0.9433,0.313,-0.2637,0.464,0.8457,0.2637,0.464,0.8457,-0.111,0.9433,0.313,-0.111,-0.9433,-0.313,0.2637,-0.464,-0.8457,0.111,-0.9433,-0.313,-0.2637,-0.464,-0.8457,-0.2637,-0.464,-0.8457,0.2637,0.3637,-0.8934,0.2637,-0.464,-0.8457,-0.2637,0.3637,-0.8934,0.2637,0.464,0.8457,-0.2637,-0.3637,0.8934,0.2637,-0.3637,0.8934,-0.2637,0.464,0.8457,-0.6432,-0.4518,-0.6182,-0.2637,0.3637,-0.8934,-0.2637,-0.464,-0.8457,-0.6432,0.3777,-0.666,-0.2628,0.942,0.2089,-0.2637,0.464,0.8457,-0.111,0.9433,0.313,-0.6432,0.4518,0.6182,0.2628,-0.9117,0.3158,0.3667,-0.9285,-0.0577,0.3667,-0.9157,0.164,0.2628,-0.942,-0.2089,0.111,-0.9433,-0.313,0.111,-0.901,0.4193,-0.111,-0.901,0.4193,-0.111,-0.9433,-0.313,-0.2628,-0.9117,0.3158,-0.2628,-0.942,-0.2089,-0.3667,-0.9157,0.164,-0.3667,-0.9285,-0.0577,-0.3667,-0.9285,-0.0577,-0.871,-0.3987,0.2871,-0.871,-0.429,-0.2394,-0.3667,-0.9157,0.164,-0.3667,-0.9285,-0.0577,-0.6432,-0.4518,-0.6182,-0.2628,-0.942,-0.2089,-0.871,-0.429,-0.2394,0.871,0.429,0.2394,0.871,-0.429,-0.2394,0.871,0.3987,-0.2871,0.871,-0.3987,0.2871,0.871,-0.3987,0.2871,0.3667,-0.9285,-0.0577,0.871,-0.429,-0.2394,0.3667,-0.9157,0.164,0.6432,0.4518,0.6182,0.871,-0.3987,0.2871,0.871,0.429,0.2394,0.6432,-0.3777,0.666,-0.871,-0.3987,0.2871,-0.6432,0.4518,0.6182,-0.871,0.429,0.2394,-0.6432,-0.3777,0.666,0.2637,-0.3637,0.8934,-0.111,-0.901,0.4193,0.111,-0.901,0.4193,-0.2637,-0.3637,0.8934,0.6432,-0.3777,0.666,0.3667,-0.9157,0.164,0.871,-0.3987,0.2871,0.2628,-0.9117,0.3158,-0.2637,-0.3637,0.8934,-0.2628,-0.9117,0.3158,-0.111,-0.901,0.4193,-0.6432,-0.3777,0.666,-0.6432,-0.3777,0.666,-0.3667,-0.9157,0.164,-0.2628,-0.9117,0.3158,-0.871,-0.3987,0.2871],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,79,76,80,79,80,81,81,80,82,82,80,83,82,83,84,84,83,85,84,85,86,86,85,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,119,116,120,120,116,121,120,121,122,120,122,123,123,122,124,123,124,125,125,124,126,125,126,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "box-14",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.228845,
      aspect: [1, 0.657685, 0.551111],
      size: [0.228845, 0.150508, 0.126119],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 26,
    verts: 50,
    triVariants: [26],
    size: [0.228845, 0.150508, 0.126119],
    offset: [0, 0.832178, 0.87159],
    provenance: [
      { species: "deer", node: "body", ordinal: 7, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0572,0.0251,0.0631,-0.0572,0.0251,0.0631,0,-0.0251,0.0631,0.0405,0.0398,0.0631,-0.0405,0.0398,0.0631,0.0572,0.0753,0.0315,0.0572,0.0251,0.0631,0.1144,0.0251,0.0315,0.0405,0.0398,0.0631,0.0572,0.0753,0.0315,-0.0405,0.0398,0.0631,0.0405,0.0398,0.0631,-0.0572,0.0753,0.0315,0.1144,0.0251,0.0315,0,-0.0251,0.0631,0,-0.0753,0.0315,0.0572,0.0251,0.0631,0,-0.0251,0.0631,-0.1144,0.0251,0.0315,0,-0.0753,0.0315,-0.0572,0.0251,0.0631,-0.0405,0.0398,0.0631,-0.1144,0.0251,0.0315,-0.0572,0.0251,0.0631,-0.0572,0.0753,0.0315,0.0572,0.0753,0.0315,0.0835,0.0183,-0.0631,0.0418,0.0549,-0.0631,0.1144,0.0251,0.0315,0.1144,0.0251,0.0315,0,-0.0549,-0.0631,0.0835,0.0183,-0.0631,0,-0.0753,0.0315,-0.1144,0.0251,0.0315,-0.0418,0.0549,-0.0631,-0.0835,0.0183,-0.0631,-0.0572,0.0753,0.0315,0.0418,0.0549,-0.0631,-0.0572,0.0753,0.0315,0.0572,0.0753,0.0315,-0.0418,0.0549,-0.0631,0,-0.0753,0.0315,-0.0835,0.0183,-0.0631,0,-0.0549,-0.0631,-0.1144,0.0251,0.0315,-0.0835,0.0183,-0.0631,0.0835,0.0183,-0.0631,0,-0.0549,-0.0631,0.0418,0.0549,-0.0631,-0.0418,0.0549,-0.0631],
    normals: [0.3546,0,0.935,-0.3546,0,0.935,0,-0.397,0.9178,0.1393,0.3836,0.9129,-0.1393,0.3836,0.9129,0.3351,0.9033,0.2678,0.3546,0,0.935,0.9525,0.0213,0.3037,0.1393,0.3836,0.9129,0.3351,0.9033,0.2678,-0.1393,0.3836,0.9129,0.1393,0.3836,0.9129,-0.3351,0.9033,0.2678,0.9525,0.0213,0.3037,0,-0.397,0.9178,0,-0.9544,0.2984,0.3546,0,0.935,0,-0.397,0.9178,-0.9525,0.0213,0.3037,0,-0.9544,0.2984,-0.3546,0,0.935,-0.1393,0.3836,0.9129,-0.9525,0.0213,0.3037,-0.3546,0,0.935,-0.3351,0.9033,0.2678,0.3351,0.9033,0.2678,0.7115,-0.0341,-0.7019,0.2345,0.6727,-0.7018,0.9525,0.0213,0.3037,0.9525,0.0213,0.3037,0,-0.7783,-0.6279,0.7115,-0.0341,-0.7019,0,-0.9544,0.2984,-0.9525,0.0213,0.3037,-0.2345,0.6727,-0.7018,-0.7115,-0.0341,-0.7019,-0.3351,0.9033,0.2678,0.2345,0.6727,-0.7018,-0.3351,0.9033,0.2678,0.3351,0.9033,0.2678,-0.2345,0.6727,-0.7018,0,-0.9544,0.2984,-0.7115,-0.0341,-0.7019,0,-0.7783,-0.6279,-0.9525,0.0213,0.3037,-0.7115,-0.0341,-0.7019,0.7115,-0.0341,-0.7019,0,-0.7783,-0.6279,0.2345,0.6727,-0.7018,-0.2345,0.6727,-0.7018],
    indices: [0,1,2,1,0,3,1,3,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,48,45,49],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "box-15",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.228845,
      aspect: [1, 0.657685, 0.479145],
      size: [0.228845, 0.150508, 0.10965],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 23,
    verts: 45,
    triVariants: [23],
    size: [0.228845, 0.150508, 0.10965],
    offset: [0, 0.832178, 0.697587],
    provenance: [
      { species: "dog", node: "body", ordinal: 7, role: "nose", name: "nose" },
    ],
    positions: [0.0572,0.0753,-0.0548,0.1144,0.0251,0.0274,0.1144,0.0251,-0.0548,0.0572,0.0753,0.0274,-0.1144,0.0251,0.0274,-0.0572,0.0753,-0.0548,-0.1144,0.0251,-0.0548,-0.0572,0.0753,0.0274,0.0572,0.0753,-0.0548,-0.0572,0.0753,0.0274,0.0572,0.0753,0.0274,-0.0572,0.0753,-0.0548,0.1144,0.0251,0.0274,0,-0.0753,-0.0548,0.1144,0.0251,-0.0548,0,-0.0753,0.0274,0.0572,0.0251,0.0548,-0.0572,0.0251,0.0548,0,-0.0251,0.0548,0.0405,0.0398,0.0548,-0.0405,0.0398,0.0548,0,-0.0753,0.0274,-0.1144,0.0251,-0.0548,0,-0.0753,-0.0548,-0.1144,0.0251,0.0274,0.0572,0.0753,0.0274,0.0572,0.0251,0.0548,0.1144,0.0251,0.0274,0.0405,0.0398,0.0548,0.0572,0.0753,0.0274,-0.0405,0.0398,0.0548,0.0405,0.0398,0.0548,-0.0572,0.0753,0.0274,0.1144,0.0251,0.0274,0,-0.0251,0.0548,0,-0.0753,0.0274,0.0572,0.0251,0.0548,0,-0.0251,0.0548,-0.1144,0.0251,0.0274,0,-0.0753,0.0274,-0.0572,0.0251,0.0548,-0.0405,0.0398,0.0548,-0.1144,0.0251,0.0274,-0.0572,0.0251,0.0548,-0.0572,0.0753,0.0274],
    normals: [0.3414,0.9399,0,0.847,0,0.5316,1,0,0,0.3026,0.8331,0.4631,-0.847,0,0.5316,-0.3414,0.9399,0,-1,0,0,-0.3026,0.8331,0.4631,0.3414,0.9399,0,-0.3026,0.8331,0.4631,0.3026,0.8331,0.4631,-0.3414,0.9399,0,0.847,0,0.5316,0.6593,-0.7519,0,1,0,0,0,-0.8761,0.4822,0.3028,0,0.9531,-0.3028,0,0.9531,0,-0.3407,0.9402,0.1184,0.326,0.9379,-0.1184,0.326,0.9379,0,-0.8761,0.4822,-1,0,0,-0.6593,-0.7519,0,-0.847,0,0.5316,0.3026,0.8331,0.4631,0.3028,0,0.9531,0.847,0,0.5316,0.1184,0.326,0.9379,0.3026,0.8331,0.4631,-0.1184,0.326,0.9379,0.1184,0.326,0.9379,-0.3026,0.8331,0.4631,0.847,0,0.5316,0,-0.3407,0.9402,0,-0.8761,0.4822,0.3028,0,0.9531,0,-0.3407,0.9402,-0.847,0,0.5316,0,-0.8761,0.4822,-0.3028,0,0.9531,-0.1184,0.326,0.9379,-0.847,0,0.5316,-0.3028,0,0.9531,-0.3026,0.8331,0.4631],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,17,19,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-16",
    shape: {
      form: "box", taper: 0.889682, symmetry: "handed", longest: 0.339774,
      aspect: [1, 0.894606, 0.76067],
      size: [0.303964, 0.339774, 0.258456],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.258456, sunkUnitsMean: 0.258456, sunkUnitsMax: 0.258456,
      sunkFractionMin: 1, sunkFractionMean: 1, sunkFractionMax: 1,
    },
    roles: ["ear"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.303964, 0.339774, 0.258456],
    offset: [0.171215, 1.167917, 0.494654],
    provenance: [
      { species: "elephant", node: "body", ordinal: 4, role: "ear", name: "ear-right" },
    ],
    positions: [0.1108,0.117,-0.0684,0.1344,0.0879,0.0517,0.1452,0.0916,-0.0154,0.0515,0.1495,-0.0762,0.0848,0.1083,0.0937,0.0018,0.1699,-0.0342,0.0254,0.1408,0.0859,-0.0089,0.1663,0.0329,-0.1399,-0.0778,-0.0746,-0.0825,0.1225,0.0368,-0.0661,0.128,-0.0654,-0.152,-0.0819,0.0009,0.1108,0.117,-0.0684,0.152,0.0089,-0.0368,0.0997,0.0477,-0.1174,0.1452,0.0916,-0.0154,0.1356,0.0034,0.0654,-0.0466,-0.147,0.0692,0.0091,-0.1699,0.022,0.0601,0.0344,0.1292,0.152,0.0089,-0.0368,-0.0174,-0.1372,-0.113,0.0997,0.0477,-0.1174,0.0212,-0.1658,-0.0534,-0.0302,0.0838,0.1174,-0.0089,0.1663,0.0329,-0.0825,0.1225,0.0368,0.0254,0.1408,0.0859,0.0094,0.097,-0.1292,-0.0174,-0.1372,-0.113,-0.0841,-0.1007,-0.1217,0.0997,0.0477,-0.1174,-0.1134,-0.1105,0.0604,-0.0825,0.1225,0.0368,-0.152,-0.0819,0.0009,-0.0302,0.0838,0.1174,0.152,0.0089,-0.0368,0.0091,-0.1699,0.022,0.0212,-0.1658,-0.0534,0.1356,0.0034,0.0654,0.0515,0.1495,-0.0762,0.0997,0.0477,-0.1174,0.0094,0.097,-0.1292,0.1108,0.117,-0.0684,0.0848,0.1083,0.0937,-0.0302,0.0838,0.1174,0.0601,0.0344,0.1292,0.0254,0.1408,0.0859,-0.0825,0.1225,0.0368,0.0018,0.1699,-0.0342,-0.0661,0.128,-0.0654,-0.0089,0.1663,0.0329,0.1452,0.0916,-0.0154,0.1356,0.0034,0.0654,0.152,0.0089,-0.0368,0.1344,0.0879,0.0517,0.0018,0.1699,-0.0342,0.0094,0.097,-0.1292,-0.0661,0.128,-0.0654,0.0515,0.1495,-0.0762,-0.0661,0.128,-0.0654,-0.0841,-0.1007,-0.1217,-0.1399,-0.0778,-0.0746,0.0094,0.097,-0.1292,0.0601,0.0344,0.1292,-0.1134,-0.1105,0.0604,-0.0466,-0.147,0.0692,-0.0302,0.0838,0.1174,0.1344,0.0879,0.0517,0.0601,0.0344,0.1292,0.1356,0.0034,0.0654,0.0848,0.1083,0.0937],
    normals: [0.6529,0.6521,-0.3853,0.8014,0.4689,0.3714,0.8693,0.4916,-0.0515,0.279,0.8565,-0.4343,0.4889,0.5973,0.6358,-0.0335,0.9849,-0.17,0.115,0.8016,0.5867,-0.1014,0.9622,0.2529,-0.8099,0.3125,-0.4963,-0.7635,0.5773,0.2896,-0.6444,0.6171,-0.4516,-0.9295,0.2725,0.2484,0.6529,0.6521,-0.3853,0.9377,-0.2474,-0.2439,0.5585,0.034,-0.8288,0.8693,0.4916,-0.0515,0.8187,-0.2872,0.4973,0.1099,-0.37,0.9225,0.6601,-0.5961,0.457,0.2711,-0.0622,0.9605,0.9377,-0.2474,-0.2439,0.3987,-0.2734,-0.8754,0.5585,0.034,-0.8288,0.7798,-0.5561,-0.2877,-0.3842,0.2959,0.8745,-0.1014,0.9622,0.2529,-0.7635,0.5773,0.2896,0.115,0.8016,0.5867,-0.0968,0.3921,-0.9148,0.3987,-0.2734,-0.8754,-0.2597,0.0864,-0.9618,0.5585,0.034,-0.8288,-0.5485,-0.0102,0.8361,-0.7635,0.5773,0.2896,-0.9295,0.2725,0.2484,-0.3842,0.2959,0.8745,0.9377,-0.2474,-0.2439,0.6601,-0.5961,0.457,0.7798,-0.5561,-0.2877,0.8187,-0.2872,0.4973,0.279,0.8565,-0.4343,0.5585,0.034,-0.8288,-0.0968,0.3921,-0.9148,0.6529,0.6521,-0.3853,0.4889,0.5973,0.6358,-0.3842,0.2959,0.8745,0.2711,-0.0622,0.9605,0.115,0.8016,0.5867,-0.7635,0.5773,0.2896,-0.0335,0.9849,-0.17,-0.6444,0.6171,-0.4516,-0.1014,0.9622,0.2529,0.8693,0.4916,-0.0515,0.8187,-0.2872,0.4973,0.9377,-0.2474,-0.2439,0.8014,0.4689,0.3714,-0.0335,0.9849,-0.17,-0.0968,0.3921,-0.9148,-0.6444,0.6171,-0.4516,0.279,0.8565,-0.4343,-0.6444,0.6171,-0.4516,-0.2597,0.0864,-0.9618,-0.8099,0.3125,-0.4963,-0.0968,0.3921,-0.9148,0.2711,-0.0622,0.9605,-0.5485,-0.0102,0.8361,0.1099,-0.37,0.9225,-0.3842,0.2959,0.8745,0.8014,0.4689,0.3714,0.2711,-0.0622,0.9605,0.8187,-0.2872,0.4973,0.4889,0.5973,0.6358],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,4,5,6,6,5,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  {
    id: "box-17",
    shape: {
      form: "box", taper: 0.889682, symmetry: "handed", longest: 0.339774,
      aspect: [1, 0.894606, 0.76067],
      size: [0.303964, 0.339774, 0.258456],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.258456, sunkUnitsMean: 0.258456, sunkUnitsMax: 0.258456,
      sunkFractionMin: 1, sunkFractionMean: 1, sunkFractionMax: 1,
    },
    roles: ["ear"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.303964, 0.339774, 0.258456],
    offset: [-0.171214, 1.167917, 0.494654],
    provenance: [
      { species: "elephant", node: "body", ordinal: 6, role: "ear", name: "ear-left" },
    ],
    positions: [-0.0848,0.1083,0.0937,-0.1344,0.0879,0.0517,-0.0601,0.0344,0.1292,-0.1356,0.0034,0.0654,0.0302,0.0838,0.1174,-0.0601,0.0344,0.1292,0.1134,-0.1105,0.0604,0.0466,-0.147,0.0692,-0.0094,0.097,-0.1292,0.0661,0.128,-0.0654,0.0841,-0.1007,-0.1217,0.1399,-0.0778,-0.0746,-0.0515,0.1495,-0.0762,-0.0018,0.1699,-0.0342,-0.0094,0.097,-0.1292,0.0661,0.128,-0.0654,-0.1344,0.0879,0.0517,-0.1452,0.0916,-0.0154,-0.1356,0.0034,0.0654,-0.152,0.0089,-0.0368,0.0089,0.1663,0.0329,0.0825,0.1225,0.0368,-0.0018,0.1699,-0.0342,0.0661,0.128,-0.0654,-0.0254,0.1408,0.0859,-0.0848,0.1083,0.0937,0.0302,0.0838,0.1174,-0.0601,0.0344,0.1292,-0.1108,0.117,-0.0684,-0.0515,0.1495,-0.0762,-0.0997,0.0477,-0.1174,-0.0094,0.097,-0.1292,-0.1356,0.0034,0.0654,-0.152,0.0089,-0.0368,-0.0091,-0.1699,0.022,-0.0212,-0.1658,-0.0534,0.0302,0.0838,0.1174,0.1134,-0.1105,0.0604,0.0825,0.1225,0.0368,0.152,-0.0819,0.0009,-0.0997,0.0477,-0.1174,-0.0094,0.097,-0.1292,0.0174,-0.1372,-0.113,0.0841,-0.1007,-0.1217,-0.0254,0.1408,0.0859,0.0302,0.0838,0.1174,0.0089,0.1663,0.0329,0.0825,0.1225,0.0368,-0.0212,-0.1658,-0.0534,-0.152,0.0089,-0.0368,0.0174,-0.1372,-0.113,-0.0997,0.0477,-0.1174,-0.0601,0.0344,0.1292,-0.1356,0.0034,0.0654,0.0466,-0.147,0.0692,-0.0091,-0.1699,0.022,-0.1452,0.0916,-0.0154,-0.1108,0.117,-0.0684,-0.152,0.0089,-0.0368,-0.0997,0.0477,-0.1174,0.152,-0.0819,0.0009,0.1399,-0.0778,-0.0746,0.0825,0.1225,0.0368,0.0661,0.128,-0.0654,0.0089,0.1663,0.0329,-0.0018,0.1699,-0.0342,-0.0254,0.1408,0.0859,-0.0848,0.1083,0.0937,-0.0515,0.1495,-0.0762,-0.1344,0.0879,0.0517,-0.1108,0.117,-0.0684,-0.1452,0.0916,-0.0154],
    normals: [-0.4889,0.5973,0.6358,-0.8014,0.4689,0.3714,-0.2711,-0.0622,0.9605,-0.8187,-0.2872,0.4973,0.3842,0.2959,0.8745,-0.2711,-0.0622,0.9605,0.5485,-0.0102,0.8361,-0.1099,-0.37,0.9225,0.0968,0.3921,-0.9148,0.6444,0.6171,-0.4516,0.2597,0.0864,-0.9618,0.8099,0.3125,-0.4963,-0.279,0.8565,-0.4343,0.0335,0.9849,-0.17,0.0968,0.3921,-0.9148,0.6444,0.6171,-0.4516,-0.8014,0.4689,0.3714,-0.8693,0.4916,-0.0515,-0.8187,-0.2872,0.4973,-0.9377,-0.2474,-0.2439,0.1014,0.9622,0.2529,0.7635,0.5773,0.2896,0.0335,0.9849,-0.17,0.6444,0.6171,-0.4516,-0.115,0.8016,0.5867,-0.4889,0.5973,0.6358,0.3842,0.2959,0.8745,-0.2711,-0.0622,0.9605,-0.6529,0.6521,-0.3853,-0.279,0.8565,-0.4343,-0.5585,0.034,-0.8288,0.0968,0.3921,-0.9148,-0.8187,-0.2872,0.4973,-0.9377,-0.2474,-0.2439,-0.6601,-0.5961,0.457,-0.7798,-0.5561,-0.2877,0.3842,0.2959,0.8745,0.5485,-0.0102,0.8361,0.7635,0.5773,0.2896,0.9295,0.2725,0.2484,-0.5585,0.034,-0.8288,0.0968,0.3921,-0.9148,-0.3987,-0.2734,-0.8754,0.2597,0.0864,-0.9618,-0.115,0.8016,0.5867,0.3842,0.2959,0.8745,0.1014,0.9622,0.2529,0.7635,0.5773,0.2896,-0.7798,-0.5561,-0.2877,-0.9377,-0.2474,-0.2439,-0.3987,-0.2734,-0.8754,-0.5585,0.034,-0.8288,-0.2711,-0.0622,0.9605,-0.8187,-0.2872,0.4973,-0.1099,-0.37,0.9225,-0.6601,-0.5961,0.457,-0.8693,0.4916,-0.0515,-0.6529,0.6521,-0.3853,-0.9377,-0.2474,-0.2439,-0.5585,0.034,-0.8288,0.9295,0.2725,0.2484,0.8099,0.3125,-0.4963,0.7635,0.5773,0.2896,0.6444,0.6171,-0.4516,0.1014,0.9622,0.2529,0.0335,0.9849,-0.17,-0.115,0.8016,0.5867,-0.4889,0.5973,0.6358,-0.279,0.8565,-0.4343,-0.8014,0.4689,0.3714,-0.6529,0.6521,-0.3853,-0.8693,0.4916,-0.0515],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,66,65,67,65,68,67,67,68,69,68,70,69,71,69,70],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  {
    id: "box-18",
    shape: {
      form: "box", taper: 0.994204, symmetry: "mirror", longest: 0.623004,
      aspect: [1, 0.682517, 0.553769],
      size: [0.345, 0.623004, 0.425211],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["tail"],
    tris: 80,
    verts: 164,
    triVariants: [80],
    size: [0.345, 0.623004, 0.425211],
    offset: [0, 0.482248, 0.837606],
    provenance: [
      { species: "elephant", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [-0.0647,-0.2223,0.2126,-0.1725,-0.0186,0.0578,-0.1294,-0.2442,0.1027,0.0647,-0.2223,0.2126,0.1294,-0.2442,0.1027,0.0862,0.025,0.2015,-0.0647,-0.2223,0.2126,-0.0862,0.025,0.2015,-0.1725,-0.0186,0.0578,-0.1294,-0.2442,0.1027,-0.1725,-0.0186,0.0578,-0.0862,-0.0622,-0.0858,-0.1294,-0.2442,0.1027,-0.0862,-0.0622,-0.0858,-0.0647,-0.266,-0.0072,0.0862,0.025,0.2015,0.1294,-0.2442,0.1027,0.1725,-0.0186,0.0578,0.1294,-0.2442,0.1027,0.0647,-0.266,-0.0072,0.1725,-0.0186,0.0578,0.1725,-0.0186,0.0578,0.0647,-0.266,-0.0072,0.0862,-0.0622,-0.0858,-0.0862,0.2544,0.0447,0.0862,0.1489,0.1501,0.0862,0.2544,0.0447,-0.0862,0.1489,0.1501,-0.0647,-0.3006,0.1139,-0.0647,-0.2223,0.2126,-0.1294,-0.2442,0.1027,-0.0323,-0.2896,0.1689,0.0862,0.1489,0.1501,0.1725,-0.0186,0.0578,0.1725,0.0643,0.0235,0.0862,0.025,0.2015,-0.1725,0.1278,-0.04,-0.0862,0.3115,-0.0931,-0.1725,0.1621,-0.1229,-0.0862,0.2544,0.0447,0.1725,0.1278,-0.04,0.0862,-0.0203,-0.1031,0.0862,0.0011,-0.1246,0.1725,0.0643,0.0235,-0.0862,0.0011,-0.1246,0.0862,0.0127,-0.1526,0.0862,0.0011,-0.1246,-0.0862,0.0127,-0.1526,0.0862,0.2544,0.0447,0.1725,0.0643,0.0235,0.1725,0.1278,-0.04,0.0862,0.1489,0.1501,-0.0862,-0.0622,-0.0858,0.0647,-0.266,-0.0072,-0.0647,-0.266,-0.0072,0.0862,-0.0622,-0.0858,-0.0862,0.3115,-0.2126,0.0862,0.3115,-0.0931,0.0862,0.3115,-0.2126,-0.0862,0.3115,-0.0931,0.0647,-0.2223,0.2126,-0.0323,-0.2896,0.1689,0.0323,-0.2896,0.1689,-0.0647,-0.2223,0.2126,0.1725,0.0643,0.0235,0.0862,-0.0622,-0.0858,0.0862,-0.0203,-0.1031,0.1725,-0.0186,0.0578,0.0862,0.1489,0.1501,-0.0862,0.025,0.2015,0.0862,0.025,0.2015,-0.0862,0.1489,0.1501,-0.1725,0.1621,-0.1229,-0.0862,0.3115,-0.2126,-0.1725,0.1621,-0.2126,-0.0862,0.3115,-0.0931,-0.0862,-0.0203,-0.1031,0.0862,-0.0622,-0.0858,-0.0862,-0.0622,-0.0858,0.0862,-0.0203,-0.1031,0.0862,0.025,0.2015,-0.0647,-0.2223,0.2126,0.0647,-0.2223,0.2126,-0.0862,0.025,0.2015,-0.1725,0.0643,0.0235,-0.0862,0.2544,0.0447,-0.1725,0.1278,-0.04,-0.0862,0.1489,0.1501,-0.0862,0.0127,-0.1526,0.0862,0.0127,-0.2126,0.0862,0.0127,-0.1526,-0.0862,0.0127,-0.2126,-0.0862,0.0127,-0.2126,-0.1725,0.1621,-0.1229,-0.1725,0.1621,-0.2126,-0.0862,0.0127,-0.1526,0.0647,-0.2223,0.2126,0.0647,-0.3006,0.1139,0.1294,-0.2442,0.1027,0.0323,-0.2896,0.1689,0.0862,0.3115,-0.2126,0.1725,0.1621,-0.1229,0.1725,0.1621,-0.2126,0.0862,0.3115,-0.0931,-0.1725,-0.0186,0.0578,-0.0862,0.1489,0.1501,-0.1725,0.0643,0.0235,-0.0862,0.025,0.2015,-0.0862,0.0127,-0.2126,0.1725,0.1621,-0.2126,0.0862,0.0127,-0.2126,-0.1725,0.1621,-0.2126,-0.0862,0.3115,-0.2126,0.0862,0.3115,-0.2126,-0.0862,-0.0203,-0.1031,-0.1725,0.1278,-0.04,-0.0862,0.0011,-0.1246,-0.1725,0.0643,0.0235,-0.0862,0.0011,-0.1246,-0.1725,0.1621,-0.1229,-0.0862,0.0127,-0.1526,-0.1725,0.1278,-0.04,-0.0862,-0.0622,-0.0858,-0.1725,0.0643,0.0235,-0.0862,-0.0203,-0.1031,-0.1725,-0.0186,0.0578,0.0323,-0.3115,0.059,-0.0647,-0.266,-0.0072,0.0647,-0.266,-0.0072,-0.0323,-0.3115,0.059,0.1725,0.1621,-0.1229,0.0862,0.0011,-0.1246,0.0862,0.0127,-0.1526,0.1725,0.1278,-0.04,0.0862,0.3115,-0.0931,0.1725,0.1278,-0.04,0.1725,0.1621,-0.1229,0.0862,0.2544,0.0447,0.0323,-0.2896,0.1689,0.0323,-0.3115,0.059,0.0647,-0.3006,0.1139,-0.0323,-0.2896,0.1689,-0.0323,-0.3115,0.059,-0.0647,-0.3006,0.1139,-0.0862,-0.0203,-0.1031,0.0862,0.0011,-0.1246,0.0862,-0.0203,-0.1031,-0.0862,0.0011,-0.1246,0.0647,-0.3006,0.1139,0.0647,-0.266,-0.0072,0.1294,-0.2442,0.1027,0.0323,-0.3115,0.059,-0.0647,-0.3006,0.1139,-0.0647,-0.266,-0.0072,-0.0323,-0.3115,0.059,-0.1294,-0.2442,0.1027,-0.0862,0.3115,-0.0931,0.0862,0.2544,0.0447,0.0862,0.3115,-0.0931,-0.0862,0.2544,0.0447,0.1725,0.1621,-0.1229,0.0862,0.0127,-0.2126,0.1725,0.1621,-0.2126,0.0862,0.0127,-0.1526],
    normals: [-0.4453,-0.2892,0.8474,-0.9957,-0.0764,0.0531,-0.8909,-0.445,0.0905,0.4471,-0.2879,0.8469,0.8925,-0.4421,0.0897,0.4874,0.172,0.8561,-0.4453,-0.2892,0.8474,-0.4867,0.1733,0.8562,-0.9957,-0.0764,0.0531,-0.8909,-0.445,0.0905,-0.9957,-0.0764,0.0531,-0.5109,-0.3405,-0.7893,-0.8909,-0.445,0.0905,-0.5109,-0.3405,-0.7893,-0.4444,-0.5996,-0.6655,0.4874,0.172,0.8561,0.8925,-0.4421,0.0897,0.9954,-0.0791,0.0538,0.8925,-0.4421,0.0897,0.4465,-0.598,-0.6656,0.9954,-0.0791,0.0538,0.9954,-0.0791,0.0538,0.4465,-0.598,-0.6656,0.5118,-0.3418,-0.7882,-0.4782,0.7303,0.4879,0.4782,0.4879,0.7303,0.4782,0.7303,0.4879,-0.4782,0.4879,0.7303,-0.4492,-0.8763,0.1743,-0.4453,-0.2892,0.8474,-0.8909,-0.445,0.0905,-0.2246,-0.8004,0.5558,0.4782,0.4879,0.7303,0.9954,-0.0791,0.0538,0.9981,0.0341,0.051,0.4874,0.172,0.8561,-0.9981,0.051,0.0341,-0.4782,0.8614,0.1713,-0.9981,0.0602,0.012,-0.4782,0.7303,0.4879,0.9981,0.051,0.0341,0.5329,-0.4701,-0.7036,0.5329,-0.7036,-0.4701,0.9981,0.0341,0.051,-0.5329,-0.7036,-0.4701,0.5329,-0.8299,-0.1651,0.5329,-0.7036,-0.4701,-0.5329,-0.8299,-0.1651,0.4782,0.7303,0.4879,0.9981,0.0341,0.051,0.9981,0.051,0.0341,0.4782,0.4879,0.7303,-0.5109,-0.3405,-0.7893,0.4465,-0.598,-0.6656,-0.4444,-0.5996,-0.6655,0.5118,-0.3418,-0.7882,-0.5,0.866,0,0.4782,0.8614,0.1713,0.5,0.866,0,-0.4782,0.8614,0.1713,0.4471,-0.2879,0.8469,-0.2246,-0.8004,0.5558,0.2246,-0.8004,0.5558,-0.4453,-0.2892,0.8474,0.9981,0.0341,0.051,0.5118,-0.3418,-0.7882,0.5329,-0.4701,-0.7036,0.9954,-0.0791,0.0538,0.4782,0.4879,0.7303,-0.4867,0.1733,0.8562,0.4874,0.172,0.8561,-0.4782,0.4879,0.7303,-0.9981,0.0602,0.012,-0.5,0.866,0,-1,0,0,-0.4782,0.8614,0.1713,-0.5329,-0.4701,-0.7036,0.5118,-0.3418,-0.7882,-0.5109,-0.3405,-0.7893,0.5329,-0.4701,-0.7036,0.4874,0.172,0.8561,-0.4453,-0.2892,0.8474,0.4471,-0.2879,0.8469,-0.4867,0.1733,0.8562,-0.9981,0.0341,0.051,-0.4782,0.7303,0.4879,-0.9981,0.051,0.0341,-0.4782,0.4879,0.7303,-0.5329,-0.8299,-0.1651,0.5,-0.866,0,0.5329,-0.8299,-0.1651,-0.5,-0.866,0,-0.5,-0.866,0,-0.9981,0.0602,0.012,-1,0,0,-0.5329,-0.8299,-0.1651,0.4471,-0.2879,0.8469,0.4492,-0.8763,0.1743,0.8925,-0.4421,0.0897,0.2246,-0.8004,0.5558,0.5,0.866,0,0.9981,0.0602,0.012,1,0,0,0.4782,0.8614,0.1713,-0.9957,-0.0764,0.0531,-0.4782,0.4879,0.7303,-0.9981,0.0341,0.051,-0.4867,0.1733,0.8562,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,-0.5329,-0.4701,-0.7036,-0.9981,0.051,0.0341,-0.5329,-0.7036,-0.4701,-0.9981,0.0341,0.051,-0.5329,-0.7036,-0.4701,-0.9981,0.0602,0.012,-0.5329,-0.8299,-0.1651,-0.9981,0.051,0.0341,-0.5109,-0.3405,-0.7893,-0.9981,0.0341,0.051,-0.5329,-0.4701,-0.7036,-0.9957,-0.0764,0.0531,0.2246,-0.9522,-0.2072,-0.4444,-0.5996,-0.6655,0.4465,-0.598,-0.6656,-0.2246,-0.9522,-0.2072,0.9981,0.0602,0.012,0.5329,-0.7036,-0.4701,0.5329,-0.8299,-0.1651,0.9981,0.051,0.0341,0.4782,0.8614,0.1713,0.9981,0.051,0.0341,0.9981,0.0602,0.012,0.4782,0.7303,0.4879,0.2246,-0.8004,0.5558,0.2246,-0.9522,-0.2072,0.4492,-0.8763,0.1743,-0.2246,-0.8004,0.5558,-0.2246,-0.9522,-0.2072,-0.4492,-0.8763,0.1743,-0.5329,-0.4701,-0.7036,0.5329,-0.7036,-0.4701,0.5329,-0.4701,-0.7036,-0.5329,-0.7036,-0.4701,0.4492,-0.8763,0.1743,0.4465,-0.598,-0.6656,0.8925,-0.4421,0.0897,0.2246,-0.9522,-0.2072,-0.4492,-0.8763,0.1743,-0.4444,-0.5996,-0.6655,-0.2246,-0.9522,-0.2072,-0.8909,-0.445,0.0905,-0.4782,0.8614,0.1713,0.4782,0.7303,0.4879,0.4782,0.8614,0.1713,-0.4782,0.7303,0.4879,0.9981,0.0602,0.012,0.5,-0.866,0,1,0,0,0.5329,-0.8299,-0.1651],
    indices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,109,111,112,109,112,113,114,115,116,115,114,117,118,119,120,119,118,121,122,123,124,123,122,125,126,127,128,127,126,129,130,131,132,131,130,133,134,135,136,135,134,137,138,139,140,139,138,141,139,141,142,142,141,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  {
    id: "box-19",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 1.404,
      aspect: [1, 1, 0.37037],
      size: [1.404, 1.404, 0.52],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 1.327, sunkUnitsMean: 1.327, sunkUnitsMax: 1.327,
      sunkFractionMin: 0.945157, sunkFractionMean: 0.945157, sunkFractionMax: 0.945157,
    },
    roles: ["band"],
    tris: 92,
    verts: 144,
    triVariants: [92],
    size: [1.404, 1.404, 0.52],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "fish", node: "body", ordinal: 0, role: "band", name: "body-shell-overlay (torso shell-ring)" },
    ],
    positions: [-0.3407,-0.702,-0.1976,-0.5575,-0.5575,0.1976,-0.5575,-0.5575,-0.1976,-0.702,-0.3407,-0.1976,-0.3407,-0.702,0.1976,-0.702,-0.3407,0.1976,0.3407,-0.702,-0.1976,-0.702,0.3407,-0.1976,0.3407,-0.702,0.1976,-0.702,0.3407,0.1976,0.5575,-0.5575,-0.1976,0.5575,-0.5575,0.1976,0.702,-0.3407,0.1976,0.702,-0.3407,-0.1976,0.702,0.3407,0.1976,0.702,0.3407,-0.1976,-0.5575,0.5575,-0.1976,-0.5575,0.5575,0.1976,-0.3407,0.702,0.1976,-0.3407,0.702,-0.1976,0.3407,0.702,0.1976,0.3407,0.702,-0.1976,0.5575,0.5575,0.1976,0.5575,0.5575,-0.1976,0.325,-0.65,0.26,-0.52,-0.52,0.26,-0.325,-0.65,0.26,0.52,-0.52,0.26,-0.65,-0.325,0.26,0.65,-0.325,0.26,0.65,0.325,0.26,-0.65,0.325,0.26,-0.52,0.52,0.26,0.52,0.52,0.26,0.325,0.65,0.26,-0.325,0.65,0.26,-0.325,0.65,0.26,-0.5575,0.5575,0.1976,-0.52,0.52,0.26,-0.3407,0.702,0.1976,-0.65,-0.325,0.26,-0.702,0.3407,0.1976,-0.702,-0.3407,0.1976,-0.65,0.325,0.26,-0.52,0.52,0.26,-0.702,0.3407,0.1976,-0.65,0.325,0.26,-0.5575,0.5575,0.1976,0.5575,-0.5575,0.1976,0.325,-0.65,0.26,0.3407,-0.702,0.1976,0.52,-0.52,0.26,0.702,-0.3407,0.1976,0.52,-0.52,0.26,0.5575,-0.5575,0.1976,0.65,-0.325,0.26,0.325,0.65,0.26,-0.3407,0.702,0.1976,-0.325,0.65,0.26,0.3407,0.702,0.1976,0.702,0.3407,0.1976,0.65,-0.325,0.26,0.702,-0.3407,0.1976,0.65,0.325,0.26,0.702,0.3407,0.1976,0.52,0.52,0.26,0.65,0.325,0.26,0.5575,0.5575,0.1976,0.3407,-0.702,0.1976,-0.325,-0.65,0.26,-0.3407,-0.702,0.1976,0.325,-0.65,0.26,0.5575,0.5575,0.1976,0.325,0.65,0.26,0.52,0.52,0.26,0.3407,0.702,0.1976,-0.325,-0.65,0.26,-0.5575,-0.5575,0.1976,-0.3407,-0.702,0.1976,-0.52,-0.52,0.26,-0.52,-0.52,0.26,-0.702,-0.3407,0.1976,-0.5575,-0.5575,0.1976,-0.65,-0.325,0.26,-0.52,-0.52,-0.26,0.325,-0.65,-0.26,-0.325,-0.65,-0.26,0.52,-0.52,-0.26,-0.65,-0.325,-0.26,0.65,-0.325,-0.26,0.65,0.325,-0.26,-0.65,0.325,-0.26,-0.52,0.52,-0.26,0.52,0.52,-0.26,0.325,0.65,-0.26,-0.325,0.65,-0.26,0.325,0.65,-0.26,0.5575,0.5575,-0.1976,0.52,0.52,-0.26,0.3407,0.702,-0.1976,-0.3407,0.702,-0.1976,0.325,0.65,-0.26,-0.325,0.65,-0.26,0.3407,0.702,-0.1976,0.325,-0.65,-0.26,0.5575,-0.5575,-0.1976,0.3407,-0.702,-0.1976,0.52,-0.52,-0.26,0.52,0.52,-0.26,0.702,0.3407,-0.1976,0.65,0.325,-0.26,0.5575,0.5575,-0.1976,-0.702,0.3407,-0.1976,-0.65,-0.325,-0.26,-0.702,-0.3407,-0.1976,-0.65,0.325,-0.26,0.65,-0.325,-0.26,0.702,0.3407,-0.1976,0.702,-0.3407,-0.1976,0.65,0.325,-0.26,-0.702,0.3407,-0.1976,-0.52,0.52,-0.26,-0.65,0.325,-0.26,-0.5575,0.5575,-0.1976,-0.5575,0.5575,-0.1976,-0.325,0.65,-0.26,-0.52,0.52,-0.26,-0.3407,0.702,-0.1976,-0.5575,-0.5575,-0.1976,-0.325,-0.65,-0.26,-0.3407,-0.702,-0.1976,-0.52,-0.52,-0.26,-0.325,-0.65,-0.26,0.3407,-0.702,-0.1976,-0.3407,-0.702,-0.1976,0.325,-0.65,-0.26,0.52,-0.52,-0.26,0.702,-0.3407,-0.1976,0.5575,-0.5575,-0.1976,0.65,-0.325,-0.26,-0.702,-0.3407,-0.1976,-0.52,-0.52,-0.26,-0.5575,-0.5575,-0.1976,-0.65,-0.325,-0.26],
    normals: [-0.2803,-0.9258,-0.2538,-0.6831,-0.6831,0.2582,-0.6831,-0.6831,-0.2582,-0.9258,-0.2803,-0.2538,-0.2803,-0.9258,0.2538,-0.9258,-0.2803,0.2538,0.2803,-0.9258,-0.2538,-0.9258,0.2803,-0.2538,0.2803,-0.9258,0.2538,-0.9258,0.2803,0.2538,0.6831,-0.6831,-0.2582,0.6831,-0.6831,0.2582,0.9258,-0.2803,0.2538,0.9258,-0.2803,-0.2538,0.9258,0.2803,0.2538,0.9258,0.2803,-0.2538,-0.6831,0.6831,-0.2582,-0.6831,0.6831,0.2582,-0.2803,0.9258,0.2538,-0.2803,0.9258,-0.2538,0.2803,0.9258,0.2538,0.2803,0.9258,-0.2538,0.6831,0.6831,0.2582,0.6831,0.6831,-0.2582,0.1549,-0.5116,0.8452,-0.3695,-0.3695,0.8526,-0.1549,-0.5116,0.8452,0.3695,-0.3695,0.8526,-0.5116,-0.1549,0.8452,0.5116,-0.1549,0.8452,0.5116,0.1549,0.8452,-0.5116,0.1549,0.8452,-0.3695,0.3695,0.8526,0.3695,0.3695,0.8526,0.1549,0.5116,0.8452,-0.1549,0.5116,0.8452,-0.1549,0.5116,0.8452,-0.6831,0.6831,0.2582,-0.3695,0.3695,0.8526,-0.2803,0.9258,0.2538,-0.5116,-0.1549,0.8452,-0.9258,0.2803,0.2538,-0.9258,-0.2803,0.2538,-0.5116,0.1549,0.8452,-0.3695,0.3695,0.8526,-0.9258,0.2803,0.2538,-0.5116,0.1549,0.8452,-0.6831,0.6831,0.2582,0.6831,-0.6831,0.2582,0.1549,-0.5116,0.8452,0.2803,-0.9258,0.2538,0.3695,-0.3695,0.8526,0.9258,-0.2803,0.2538,0.3695,-0.3695,0.8526,0.6831,-0.6831,0.2582,0.5116,-0.1549,0.8452,0.1549,0.5116,0.8452,-0.2803,0.9258,0.2538,-0.1549,0.5116,0.8452,0.2803,0.9258,0.2538,0.9258,0.2803,0.2538,0.5116,-0.1549,0.8452,0.9258,-0.2803,0.2538,0.5116,0.1549,0.8452,0.9258,0.2803,0.2538,0.3695,0.3695,0.8526,0.5116,0.1549,0.8452,0.6831,0.6831,0.2582,0.2803,-0.9258,0.2538,-0.1549,-0.5116,0.8452,-0.2803,-0.9258,0.2538,0.1549,-0.5116,0.8452,0.6831,0.6831,0.2582,0.1549,0.5116,0.8452,0.3695,0.3695,0.8526,0.2803,0.9258,0.2538,-0.1549,-0.5116,0.8452,-0.6831,-0.6831,0.2582,-0.2803,-0.9258,0.2538,-0.3695,-0.3695,0.8526,-0.3695,-0.3695,0.8526,-0.9258,-0.2803,0.2538,-0.6831,-0.6831,0.2582,-0.5116,-0.1549,0.8452,-0.3695,-0.3695,-0.8526,0.1549,-0.5116,-0.8452,-0.1549,-0.5116,-0.8452,0.3695,-0.3695,-0.8526,-0.5116,-0.1549,-0.8452,0.5116,-0.1549,-0.8452,0.5116,0.1549,-0.8452,-0.5116,0.1549,-0.8452,-0.3695,0.3695,-0.8526,0.3695,0.3695,-0.8526,0.1549,0.5116,-0.8452,-0.1549,0.5116,-0.8452,0.1549,0.5116,-0.8452,0.6831,0.6831,-0.2582,0.3695,0.3695,-0.8526,0.2803,0.9258,-0.2538,-0.2803,0.9258,-0.2538,0.1549,0.5116,-0.8452,-0.1549,0.5116,-0.8452,0.2803,0.9258,-0.2538,0.1549,-0.5116,-0.8452,0.6831,-0.6831,-0.2582,0.2803,-0.9258,-0.2538,0.3695,-0.3695,-0.8526,0.3695,0.3695,-0.8526,0.9258,0.2803,-0.2538,0.5116,0.1549,-0.8452,0.6831,0.6831,-0.2582,-0.9258,0.2803,-0.2538,-0.5116,-0.1549,-0.8452,-0.9258,-0.2803,-0.2538,-0.5116,0.1549,-0.8452,0.5116,-0.1549,-0.8452,0.9258,0.2803,-0.2538,0.9258,-0.2803,-0.2538,0.5116,0.1549,-0.8452,-0.9258,0.2803,-0.2538,-0.3695,0.3695,-0.8526,-0.5116,0.1549,-0.8452,-0.6831,0.6831,-0.2582,-0.6831,0.6831,-0.2582,-0.1549,0.5116,-0.8452,-0.3695,0.3695,-0.8526,-0.2803,0.9258,-0.2538,-0.6831,-0.6831,-0.2582,-0.1549,-0.5116,-0.8452,-0.2803,-0.9258,-0.2538,-0.3695,-0.3695,-0.8526,-0.1549,-0.5116,-0.8452,0.2803,-0.9258,-0.2538,-0.2803,-0.9258,-0.2538,0.1549,-0.5116,-0.8452,0.3695,-0.3695,-0.8526,0.9258,-0.2803,-0.2538,0.6831,-0.6831,-0.2582,0.5116,-0.1549,-0.8452,-0.9258,-0.2803,-0.2538,-0.3695,-0.3695,-0.8526,-0.6831,-0.6831,-0.2582,-0.5116,-0.1549,-0.8452],
    indices: [0,1,2,1,3,2,1,0,4,3,1,5,6,4,0,5,7,3,4,6,8,7,5,9,10,8,6,8,10,11,10,12,11,12,10,13,13,14,12,14,13,15,9,16,7,16,9,17,18,16,17,16,18,19,20,19,18,19,20,21,15,22,14,22,21,20,22,15,23,21,22,23,24,25,26,25,24,27,25,27,28,28,27,29,28,29,30,28,30,31,31,30,32,32,30,33,32,33,34,32,34,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,87,84,88,87,88,89,89,88,90,90,88,91,90,91,92,90,92,93,93,92,94,94,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-20",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 1.25,
      aspect: [1, 1, 1],
      size: [1.25, 1.25, 1.25],
    },
    attachment: null,
    roles: ["hull"],
    tris: 78,
    verts: 140,
    triVariants: [78],
    size: [1.25, 1.25, 1.25],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "fish", node: "body", ordinal: 1, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [0.3125,-0.625,-0.3125,0.5,-0.5,-0.5,0.5,-0.5,-0.3125,0.3125,-0.625,0.3125,0.5,-0.5,0.3125,0.5,-0.5,0.5,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,0.3125,0.625,0.3125,0.5,0.5,0.5,0.5,0.5,0.3125,0.5,0.5,-0.3125,0.3125,0.625,-0.3125,0.5,0.5,-0.5,-0.5,0.5,0.5,-0.3125,0.625,0.3125,-0.5,0.5,0.3125,-0.3125,0.625,-0.3125,-0.5,0.5,-0.3125,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,0.3125,-0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.5,-0.5,-0.3125,-0.5,-0.5,-0.5,-0.3125,-0.3125,-0.625,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.3125,-0.3125,-0.625,0.3125,0.625,0.3125,-0.5,0.5,0.5,0.5,0.5,0.5,-0.3125,0.625,0.3125,0.3125,-0.625,-0.3125,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.3125,-0.625,-0.3125,0.625,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,-0.5,-0.5,0.5,-0.625,-0.3125,0.3125,-0.5,-0.5,0.3125,-0.625,-0.3125,-0.3125,-0.5,-0.5,-0.3125,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.5,0.5,0.5,-0.625,-0.3125,0.3125,-0.625,0.3125,0.3125,-0.5,-0.5,0.5,-0.5,0.5,0.5,0.3125,-0.3125,-0.625,0.5,0.5,-0.5,0.5,-0.5,-0.5,0.3125,0.3125,-0.625,0.3125,-0.3125,0.625,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.3125,-0.3125,0.625,0.5,0.5,0.5,0.625,0.3125,0.3125,0.5,0.5,0.3125,0.5,0.5,-0.3125,0.625,0.3125,-0.3125,0.5,0.5,-0.5,-0.5,0.5,-0.5,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,0.3125,0.625,-0.3125,0.3125,0.5,-0.5,-0.3125,0.625,-0.3125,-0.3125,0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.3125,-0.3125,-0.625,-0.5,-0.5,-0.5,-0.3125,0.3125,-0.625,0.5,0.5,0.5,0.625,-0.3125,0.3125,0.625,0.3125,0.3125,0.5,-0.5,0.5,0.625,0.3125,-0.3125,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.625,-0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.625,0.3125,-0.3125,-0.5,0.5,-0.5,0.3125,0.625,-0.3125,0.5,0.5,-0.5,-0.3125,0.625,-0.3125,0.5,0.5,0.5,0.3125,-0.3125,0.625,0.5,-0.5,0.5,0.3125,0.3125,0.625,0.5,0.5,0.5,-0.3125,0.3125,0.625,0.3125,0.3125,0.625,-0.5,0.5,0.5,-0.625,0.3125,-0.3125,-0.5,0.5,-0.3125,-0.5,0.5,-0.5,-0.5,0.5,0.3125,-0.625,0.3125,0.3125,-0.5,0.5,0.5,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,-0.5,0.5,0.5,-0.5,-0.5,0.5,-0.3125,0.3125,0.625,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,-0.5,-0.5,0.5,0.3125,-0.625,0.3125,0.5,-0.5,0.5,-0.3125,-0.625,0.3125],
    normals: [0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.7071,-0.7071,0,0.2232,-0.9489,0.2232,0.7071,-0.7071,0,0.5774,-0.5774,0.5774,-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,0.2232,0.9489,0.2232,0.5774,0.5774,0.5774,0.7071,0.7071,0,0.7071,0.7071,0,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.7071,0.7071,0,-0.2232,0.9489,-0.2232,-0.7071,0.7071,0,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,0.5774,-0.7071,-0.7071,0,-0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.7071,-0.7071,0,-0.5774,-0.5774,-0.5774,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,0.2232,0.9489,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.5774,-0.5774,0.5774,-0.9489,-0.2232,0.2232,-0.7071,-0.7071,0,-0.9489,-0.2232,-0.2232,-0.7071,-0.7071,0,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.5774,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.5774,0.5774,0.5774,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.2232,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,0.2232,-0.2232,0.9489,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.2232,-0.2232,0.9489,0.5774,0.5774,0.5774,0.9489,0.2232,0.2232,0.7071,0.7071,0,0.7071,0.7071,0,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,0.5774,0.7071,-0.7071,0,0.9489,-0.2232,0.2232,0.7071,-0.7071,0,0.9489,-0.2232,-0.2232,0.5774,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.5774,0.5774,0.5774,0.9489,-0.2232,0.2232,0.9489,0.2232,0.2232,0.5774,-0.5774,0.5774,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,0.5774,0.5774,0.5774,0.2232,-0.2232,0.9489,0.5774,-0.5774,0.5774,0.2232,0.2232,0.9489,0.5774,0.5774,0.5774,-0.2232,0.2232,0.9489,0.2232,0.2232,0.9489,-0.5774,0.5774,0.5774,-0.9489,0.2232,-0.2232,-0.7071,0.7071,0,-0.5774,0.5774,-0.5774,-0.7071,0.7071,0,-0.9489,0.2232,0.2232,-0.5774,0.5774,0.5774,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.2232,0.2232,0.9489,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.5774,-0.5774,0.5774,0.2232,-0.9489,0.2232,0.5774,-0.5774,0.5774,-0.2232,-0.9489,0.2232],
    indices: [0,1,2,2,3,0,3,2,4,3,4,5,6,7,8,7,6,9,10,11,12,13,10,12,10,13,14,14,13,15,16,17,18,19,18,17,18,19,20,20,19,21,22,23,24,23,25,24,25,23,26,26,27,25,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,51,50,49,50,51,52,51,53,52,54,55,56,55,54,57,58,59,60,61,60,59,62,63,64,63,62,65,66,67,68,67,66,69,70,71,72,71,73,72,73,71,74,73,74,75,76,77,78,77,76,79,80,81,82,83,82,81,82,83,84,83,85,84,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,106,107,108,107,106,109,110,111,112,111,110,113,114,115,116,114,117,115,117,114,118,119,117,118,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "box-21",
    shape: {
      form: "box", taper: 0.908, symmetry: "mirror", longest: 1.505075,
      aspect: [1, 0.830523, 0.830523],
      size: [1.25, 1.505075, 1.25],
    },
    attachment: null,
    roles: ["hull"],
    tris: 184,
    verts: 340,
    triVariants: [184],
    size: [1.25, 1.505075, 1.25],
    offset: [0, 0.933788, 0],
    provenance: [
      { species: "fox", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [-0.5,-0.6275,0.5,-0.3125,-0.7525,-0.3125,-0.3125,-0.7525,0.3125,-0.5,-0.6275,-0.5,-0.3125,-0.44,-0.625,0.5,-0.6275,-0.5,-0.5,-0.6275,-0.5,0.3125,-0.44,-0.625,-0.5,0.3725,-0.5,0.3125,0.4975,-0.3125,0.5,0.3725,-0.5,-0.3125,0.4975,-0.3125,-0.3125,0.4975,-0.3125,-0.5,0.3725,0.5,-0.3125,0.4975,0.3125,-0.5,0.3725,-0.5,0.5,0.3725,0.5,0.625,0.185,-0.3125,0.5,0.3725,-0.5,0.625,0.185,0.3125,-0.5,0.3725,-0.5,-0.3125,-0.44,-0.625,-0.5,-0.6275,-0.5,-0.3125,0.185,-0.625,0.5,-0.6275,0.5,0.3125,-0.7525,-0.3125,0.5,-0.6275,-0.5,0.3125,-0.7525,0.3125,0.3125,0.4975,-0.3125,-0.3125,0.4975,0.3125,0.3125,0.4975,0.3125,-0.3125,0.4975,-0.3125,-0.5,-0.6275,0.5,-0.625,0.185,0.3125,-0.625,-0.44,0.3125,-0.5,0.3725,0.5,0.5,0.3725,0.5,0.625,-0.44,0.3125,0.625,0.185,0.3125,0.5,-0.6275,0.5,0.3125,0.185,0.625,-0.3125,-0.44,0.625,0.3125,-0.44,0.625,-0.3125,0.185,0.625,-0.625,0.185,-0.3125,-0.5,0.3725,0.5,-0.5,0.3725,-0.5,-0.625,0.185,0.3125,0.5,0.3725,0.5,-0.3125,0.185,0.625,0.3125,0.185,0.625,-0.5,0.3725,0.5,0.625,-0.44,-0.3125,0.5,-0.6275,0.5,0.5,-0.6275,-0.5,0.625,-0.44,0.3125,0.5,0.3725,0.5,0.3125,-0.44,0.625,0.5,-0.6275,0.5,0.3125,0.185,0.625,0.3125,-0.44,-0.625,0.5,0.3725,-0.5,0.5,-0.6275,-0.5,0.3125,0.185,-0.625,-0.625,-0.44,-0.3125,-0.5,0.3725,-0.5,-0.5,-0.6275,-0.5,-0.625,0.185,-0.3125,0.625,0.185,0.3125,0.625,-0.44,-0.3125,0.625,0.185,-0.3125,0.625,-0.44,0.3125,0.3125,-0.7525,-0.3125,-0.5,-0.6275,-0.5,0.5,-0.6275,-0.5,-0.3125,-0.7525,-0.3125,-0.5,-0.6275,0.5,-0.625,-0.44,-0.3125,-0.5,-0.6275,-0.5,-0.625,-0.44,0.3125,0.3125,0.4975,0.3125,-0.5,0.3725,0.5,0.5,0.3725,0.5,-0.3125,0.4975,0.3125,0.625,0.185,-0.3125,0.5,-0.6275,-0.5,0.5,0.3725,-0.5,0.625,-0.44,-0.3125,-0.5,0.3725,-0.5,0.3125,0.185,-0.625,-0.3125,0.185,-0.625,0.5,0.3725,-0.5,-0.3125,-0.44,0.625,-0.5,0.3725,0.5,-0.5,-0.6275,0.5,-0.3125,0.185,0.625,-0.625,-0.44,0.3125,-0.625,0.185,-0.3125,-0.625,-0.44,-0.3125,-0.625,0.185,0.3125,0.3125,0.4975,-0.3125,0.5,0.3725,0.5,0.5,0.3725,-0.5,0.3125,0.4975,0.3125,-0.3125,0.185,-0.625,0.3125,-0.44,-0.625,-0.3125,-0.44,-0.625,0.3125,0.185,-0.625,0.4033,0.6814,0.359,0.454,0.5944,0.4405,0.454,0.5633,0.3243,0.4033,0.696,0.4133,0.454,0.5633,0.3243,0.4866,0.4855,0.4697,0.4866,0.4365,0.2871,0.454,0.5944,0.4405,0.4866,0.4365,0.2871,0.5,0.3725,0.5,0.5,0.3051,0.2485,0.4866,0.4855,0.4697,0.3616,0.7472,0.3783,0.4033,0.696,0.4133,0.4033,0.6814,0.359,0.3616,0.7525,0.3982,0.3104,0.7472,0.3783,0.3616,0.7525,0.3982,0.3616,0.7472,0.3783,0.3104,0.7525,0.3982,0.218,0.5944,0.4405,0.2687,0.6814,0.359,0.218,0.5633,0.3243,0.2687,0.696,0.4133,0.172,0.3725,0.5,0.1854,0.4365,0.2871,0.172,0.3051,0.2485,0.1854,0.4855,0.4697,0.2687,0.696,0.4133,0.3104,0.7472,0.3783,0.2687,0.6814,0.359,0.3104,0.7525,0.3982,0.1854,0.4855,0.4697,0.218,0.5633,0.3243,0.1854,0.4365,0.2871,0.218,0.5944,0.4405,0.2257,0.4112,0.2268,0.4587,0.2897,0.1911,0.2133,0.2897,0.1911,0.4463,0.4112,0.2268,0.2562,0.5299,0.2616,0.4158,0.5299,0.2616,0.3036,0.6406,0.2941,0.3684,0.6406,0.2941,0.341,0.6836,0.3068,0.331,0.6836,0.3068,0.3684,0.6406,0.2941,0.3616,0.7472,0.3783,0.4033,0.6814,0.359,0.341,0.6836,0.3068,0.4463,0.4112,0.2268,0.5,0.3051,0.2485,0.4587,0.2897,0.1911,0.4866,0.4365,0.2871,0.3036,0.6406,0.2941,0.3104,0.7472,0.3783,0.331,0.6836,0.3068,0.2687,0.6814,0.359,0.2562,0.5299,0.2616,0.2687,0.6814,0.359,0.3036,0.6406,0.2941,0.218,0.5633,0.3243,0.341,0.6836,0.3068,0.3104,0.7472,0.3783,0.3616,0.7472,0.3783,0.331,0.6836,0.3068,0.172,0.3051,0.2485,0.2257,0.4112,0.2268,0.2133,0.2897,0.1911,0.1854,0.4365,0.2871,0.1854,0.4365,0.2871,0.2562,0.5299,0.2616,0.2257,0.4112,0.2268,0.218,0.5633,0.3243,0.4158,0.5299,0.2616,0.4866,0.4365,0.2871,0.4463,0.4112,0.2268,0.454,0.5633,0.3243,0.4158,0.5299,0.2616,0.4033,0.6814,0.359,0.454,0.5633,0.3243,0.3684,0.6406,0.2941,0.4866,0.4855,0.4697,0.4423,0.3725,0.5,0.5,0.3725,0.5,0.3997,0.503,0.465,0.454,0.5944,0.4405,0.336,0.6047,0.4378,0.4033,0.696,0.4133,0.2687,0.696,0.4133,0.3616,0.7525,0.3982,0.3104,0.7525,0.3982,0.218,0.5944,0.4405,0.2723,0.503,0.465,0.1854,0.4855,0.4697,0.2297,0.3725,0.5,0.172,0.3725,0.5,-0.2687,0.6814,0.359,-0.218,0.5944,0.4405,-0.218,0.5633,0.3243,-0.2687,0.696,0.4133,-0.218,0.5633,0.3243,-0.1854,0.4855,0.4697,-0.1854,0.4365,0.2871,-0.218,0.5944,0.4405,-0.1854,0.4365,0.2871,-0.172,0.3725,0.5,-0.172,0.3051,0.2485,-0.1854,0.4855,0.4697,-0.3104,0.7472,0.3783,-0.2687,0.696,0.4133,-0.2687,0.6814,0.359,-0.3104,0.7525,0.3982,-0.3616,0.7472,0.3783,-0.3104,0.7525,0.3982,-0.3104,0.7472,0.3783,-0.3616,0.7525,0.3982,-0.454,0.5944,0.4405,-0.4033,0.6814,0.359,-0.454,0.5633,0.3243,-0.4033,0.696,0.4133,-0.5,0.3725,0.5,-0.4866,0.4365,0.2871,-0.5,0.3051,0.2485,-0.4866,0.4855,0.4697,-0.4033,0.696,0.4133,-0.3616,0.7472,0.3783,-0.4033,0.6814,0.359,-0.3616,0.7525,0.3982,-0.4866,0.4855,0.4697,-0.454,0.5633,0.3243,-0.4866,0.4365,0.2871,-0.454,0.5944,0.4405,-0.4463,0.4112,0.2268,-0.2133,0.2897,0.1911,-0.4587,0.2897,0.1911,-0.2257,0.4112,0.2268,-0.4158,0.5299,0.2616,-0.2562,0.5299,0.2616,-0.3684,0.6406,0.2941,-0.3036,0.6406,0.2941,-0.331,0.6836,0.3068,-0.341,0.6836,0.3068,-0.3036,0.6406,0.2941,-0.3104,0.7472,0.3783,-0.2687,0.6814,0.359,-0.331,0.6836,0.3068,-0.2257,0.4112,0.2268,-0.172,0.3051,0.2485,-0.2133,0.2897,0.1911,-0.1854,0.4365,0.2871,-0.3684,0.6406,0.2941,-0.3616,0.7472,0.3783,-0.341,0.6836,0.3068,-0.4033,0.6814,0.359,-0.4158,0.5299,0.2616,-0.4033,0.6814,0.359,-0.3684,0.6406,0.2941,-0.454,0.5633,0.3243,-0.331,0.6836,0.3068,-0.3616,0.7472,0.3783,-0.3104,0.7472,0.3783,-0.341,0.6836,0.3068,-0.5,0.3051,0.2485,-0.4463,0.4112,0.2268,-0.4587,0.2897,0.1911,-0.4866,0.4365,0.2871,-0.4866,0.4365,0.2871,-0.4158,0.5299,0.2616,-0.4463,0.4112,0.2268,-0.454,0.5633,0.3243,-0.2562,0.5299,0.2616,-0.1854,0.4365,0.2871,-0.2257,0.4112,0.2268,-0.218,0.5633,0.3243,-0.2562,0.5299,0.2616,-0.2687,0.6814,0.359,-0.218,0.5633,0.3243,-0.3036,0.6406,0.2941,-0.1854,0.4855,0.4697,-0.2297,0.3725,0.5,-0.172,0.3725,0.5,-0.2723,0.503,0.465,-0.218,0.5944,0.4405,-0.336,0.6047,0.4378,-0.2687,0.696,0.4133,-0.4033,0.696,0.4133,-0.3104,0.7525,0.3982,-0.3616,0.7525,0.3982,-0.454,0.5944,0.4405,-0.3997,0.503,0.465,-0.4866,0.4855,0.4697,-0.4423,0.3725,0.5,-0.5,0.3725,0.5,0.3125,-0.7525,-0.3125,-0.3125,-0.7525,0.3125,-0.3125,-0.7525,-0.3125,0.3125,-0.7525,0.3125,-0.5,-0.6275,0.5,0.5,-0.6275,0.5,0.3125,-0.44,0.625,-0.3125,-0.44,0.625,0.336,0.4899,0.4141,0.2297,0.3725,0.5,0.4423,0.3725,0.5,0.336,0.4899,0.4141,0.2723,0.503,0.465,0.2297,0.3725,0.5,0.336,0.6047,0.4378,0.2723,0.503,0.465,0.336,0.4899,0.4141,0.336,0.4899,0.4141,0.4423,0.3725,0.5,0.3997,0.503,0.465,0.336,0.6047,0.4378,0.336,0.4899,0.4141,0.3997,0.503,0.465,-0.336,0.4899,0.4141,-0.4423,0.3725,0.5,-0.2297,0.3725,0.5,-0.336,0.4899,0.4141,-0.3997,0.503,0.465,-0.4423,0.3725,0.5,-0.336,0.6047,0.4378,-0.3997,0.503,0.465,-0.336,0.4899,0.4141,-0.336,0.4899,0.4141,-0.2297,0.3725,0.5,-0.2723,0.503,0.465,-0.336,0.6047,0.4378,-0.336,0.4899,0.4141,-0.2723,0.503,0.465],
    normals: [-0.5774,-0.5774,0.5774,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,-0.5774,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,-0.2232,0.9489,-0.2232,-0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.5774,0.5774,-0.5774,0.5774,0.5774,0.5774,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9489,0.2232,0.2232,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.5774,-0.5774,0.5774,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.5774,-0.5774,0.5774,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,0.9489,-0.2232,0.2232,0.9489,0.2232,0.2232,0.5774,-0.5774,0.5774,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,-0.9489,0.2232,-0.2232,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.9489,0.2232,0.2232,0.5774,0.5774,0.5774,-0.2232,0.2232,0.9489,0.2232,0.2232,0.9489,-0.5774,0.5774,0.5774,0.9489,-0.2232,-0.2232,0.5774,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,0.5774,0.5774,0.5774,0.2232,-0.2232,0.9489,0.5774,-0.5774,0.5774,0.2232,0.2232,0.9489,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,-0.5774,-0.5774,0.5774,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,0.2232,0.9489,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,-0.2232,-0.2232,0.9489,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.2232,0.2232,0.9489,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,0.2232,0.9489,-0.2232,0.5774,0.5774,0.5774,0.5774,0.5774,-0.5774,0.2232,0.9489,0.2232,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.7735,0.5073,-0.3798,0.9347,0.3432,-0.092,0.8533,0.383,-0.3538,0.8617,0.4902,-0.1313,0.8533,0.383,-0.3538,0.9808,0.1885,-0.0505,0.9109,0.2487,-0.3292,0.9347,0.3432,-0.092,0.9109,0.2487,-0.3292,0.9935,0.1099,-0.0295,0.8672,0.2197,-0.4469,0.9808,0.1885,-0.0505,0.4578,0.7845,-0.4182,0.8617,0.4902,-0.1313,0.7735,0.5073,-0.3798,0.4987,0.8372,-0.2243,-0.4578,0.7845,-0.4182,0.4987,0.8372,-0.2243,0.4578,0.7845,-0.4182,-0.4987,0.8372,-0.2243,-0.9347,0.3432,-0.092,-0.7735,0.5073,-0.3798,-0.8533,0.383,-0.3538,-0.8617,0.4902,-0.1313,-0.9935,0.1099,-0.0295,-0.9109,0.2487,-0.3292,-0.8672,0.2197,-0.4469,-0.9808,0.1885,-0.0505,-0.8617,0.4902,-0.1313,-0.4578,0.7845,-0.4182,-0.7735,0.5073,-0.3798,-0.4987,0.8372,-0.2243,-0.9808,0.1885,-0.0505,-0.8533,0.383,-0.3538,-0.9109,0.2487,-0.3292,-0.9347,0.3432,-0.092,-0.426,0.3138,-0.8485,0.3633,0.2964,-0.8833,-0.3633,0.2964,-0.8833,0.426,0.3138,-0.8485,-0.3818,0.3686,-0.8476,0.3818,0.3686,-0.8476,-0.3319,0.4145,-0.8474,0.3319,0.4145,-0.8474,0.2067,0.5301,-0.8223,-0.2067,0.5301,-0.8223,0.3319,0.4145,-0.8474,0.4578,0.7845,-0.4182,0.7735,0.5073,-0.3798,0.2067,0.5301,-0.8223,0.426,0.3138,-0.8485,0.8672,0.2197,-0.4469,0.3633,0.2964,-0.8833,0.9109,0.2487,-0.3292,-0.3319,0.4145,-0.8474,-0.4578,0.7845,-0.4182,-0.2067,0.5301,-0.8223,-0.7735,0.5073,-0.3798,-0.3818,0.3686,-0.8476,-0.7735,0.5073,-0.3798,-0.3319,0.4145,-0.8474,-0.8533,0.383,-0.3538,0.2067,0.5301,-0.8223,-0.4578,0.7845,-0.4182,0.4578,0.7845,-0.4182,-0.2067,0.5301,-0.8223,-0.8672,0.2197,-0.4469,-0.426,0.3138,-0.8485,-0.3633,0.2964,-0.8833,-0.9109,0.2487,-0.3292,-0.9109,0.2487,-0.3292,-0.3818,0.3686,-0.8476,-0.426,0.3138,-0.8485,-0.8533,0.383,-0.3538,0.3818,0.3686,-0.8476,0.9109,0.2487,-0.3292,0.426,0.3138,-0.8485,0.8533,0.383,-0.3538,0.3818,0.3686,-0.8476,0.7735,0.5073,-0.3798,0.8533,0.383,-0.3538,0.3319,0.4145,-0.8474,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0.7735,0.5073,-0.3798,0.9347,0.3432,-0.092,0.8533,0.383,-0.3538,0.8617,0.4902,-0.1313,0.8533,0.383,-0.3538,0.9808,0.1885,-0.0505,0.9109,0.2487,-0.3292,0.9347,0.3432,-0.092,0.9109,0.2487,-0.3292,0.9935,0.1099,-0.0295,0.8672,0.2197,-0.4469,0.9808,0.1885,-0.0505,0.4578,0.7845,-0.4182,0.8617,0.4902,-0.1313,0.7735,0.5073,-0.3798,0.4987,0.8372,-0.2243,-0.4578,0.7845,-0.4182,0.4987,0.8372,-0.2243,0.4578,0.7845,-0.4182,-0.4987,0.8372,-0.2243,-0.9347,0.3432,-0.092,-0.7735,0.5073,-0.3798,-0.8533,0.383,-0.3538,-0.8617,0.4902,-0.1313,-0.9935,0.1099,-0.0295,-0.9109,0.2487,-0.3292,-0.8672,0.2197,-0.4469,-0.9808,0.1885,-0.0505,-0.8617,0.4902,-0.1313,-0.4578,0.7845,-0.4182,-0.7735,0.5073,-0.3798,-0.4987,0.8372,-0.2243,-0.9808,0.1885,-0.0505,-0.8533,0.383,-0.3538,-0.9109,0.2487,-0.3292,-0.9347,0.3432,-0.092,-0.426,0.3138,-0.8485,0.3633,0.2964,-0.8833,-0.3633,0.2964,-0.8833,0.426,0.3138,-0.8485,-0.3818,0.3686,-0.8476,0.3818,0.3686,-0.8476,-0.3319,0.4145,-0.8474,0.3319,0.4145,-0.8474,0.2067,0.5301,-0.8223,-0.2067,0.5301,-0.8223,0.3319,0.4145,-0.8474,0.4578,0.7845,-0.4182,0.7735,0.5073,-0.3798,0.2067,0.5301,-0.8223,0.426,0.3138,-0.8485,0.8672,0.2197,-0.4469,0.3633,0.2964,-0.8833,0.9109,0.2487,-0.3292,-0.3319,0.4145,-0.8474,-0.4578,0.7845,-0.4182,-0.2067,0.5301,-0.8223,-0.7735,0.5073,-0.3798,-0.3818,0.3686,-0.8476,-0.7735,0.5073,-0.3798,-0.3319,0.4145,-0.8474,-0.8533,0.383,-0.3538,0.2067,0.5301,-0.8223,-0.4578,0.7845,-0.4182,0.4578,0.7845,-0.4182,-0.2067,0.5301,-0.8223,-0.8672,0.2197,-0.4469,-0.426,0.3138,-0.8485,-0.3633,0.2964,-0.8833,-0.9109,0.2487,-0.3292,-0.9109,0.2487,-0.3292,-0.3818,0.3686,-0.8476,-0.426,0.3138,-0.8485,-0.8533,0.383,-0.3538,0.3818,0.3686,-0.8476,0.9109,0.2487,-0.3292,0.426,0.3138,-0.8485,0.8533,0.383,-0.3538,0.3818,0.3686,-0.8476,0.7735,0.5073,-0.3798,0.8533,0.383,-0.3538,0.3319,0.4145,-0.8474,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.5774,0.2232,-0.2232,0.9489,-0.2232,-0.2232,0.9489,0,0.1174,0.9931,0.2779,0.3902,0.8778,-0.2779,0.3902,0.8778,0,0.1174,0.9931,0.6167,-0.0538,0.7854,0.2779,0.3902,0.8778,0,-0.202,0.9794,0.6167,-0.0538,0.7854,0,0.1174,0.9931,0,0.1174,0.9931,-0.2779,0.3902,0.8778,-0.6167,-0.0538,0.7854,0,-0.202,0.9794,0,0.1174,0.9931,-0.6167,-0.0538,0.7854,0,0.1174,0.9931,0.2779,0.3902,0.8778,-0.2779,0.3902,0.8778,0,0.1174,0.9931,0.6167,-0.0538,0.7854,0.2779,0.3902,0.8778,0,-0.202,0.9794,0.6167,-0.0538,0.7854,0,0.1174,0.9931,0,0.1174,0.9931,-0.2779,0.3902,0.8778,-0.6167,-0.0538,0.7854,0,-0.202,0.9794,0,0.1174,0.9931,-0.6167,-0.0538,0.7854],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,147,144,148,147,148,149,149,148,150,149,150,151,151,150,152,152,150,153,154,155,156,155,154,157,158,159,160,159,158,161,162,163,164,163,162,165,166,167,168,167,166,169,170,171,172,171,170,173,174,175,176,175,174,177,178,179,180,179,178,181,182,183,184,183,182,185,186,187,188,187,186,189,190,191,192,191,190,193,193,190,194,193,194,195,195,194,196,197,195,196,197,196,198,197,198,199,200,195,197,200,201,195,202,201,200,202,203,201,203,202,204,205,206,207,206,205,208,209,210,211,210,209,212,213,214,215,214,213,216,217,218,219,218,217,220,221,222,223,222,221,224,225,226,227,226,225,228,229,230,231,230,229,232,233,234,235,234,233,236,237,238,239,238,237,240,241,242,243,242,241,244,244,241,245,244,245,246,246,245,247,246,247,248,248,247,249,249,247,250,251,252,253,252,251,254,255,256,257,256,255,258,259,260,261,260,259,262,263,264,265,264,263,266,267,268,269,268,267,270,271,272,273,272,271,274,275,276,277,276,275,278,279,280,281,280,279,282,283,284,285,284,283,286,287,288,289,288,287,290,290,287,291,290,291,292,292,291,293,294,292,293,294,293,295,294,295,296,297,292,294,297,298,292,299,298,297,299,300,298,300,299,301,302,303,304,303,302,305,305,306,303,306,305,307,308,306,307,306,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,3,3,3,3,3,3,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-22",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.228845,
      aspect: [1, 0.680386, 0.657685],
      size: [0.228845, 0.150508, 0.155703],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 26,
    verts: 50,
    triVariants: [26],
    size: [0.228845, 0.150508, 0.155703],
    offset: [0, 0.832178, 0.856799],
    provenance: [
      { species: "fox", node: "body", ordinal: 4, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0572,0.0753,0.0389,0.1144,0.0251,-0.0779,0.0572,0.0753,-0.0779,0.1144,0.0251,0.0389,-0.1144,0.0251,0.0389,-0.0572,0.0753,-0.0779,-0.1144,0.0251,-0.0779,-0.0572,0.0753,0.0389,0.0572,0.0753,-0.0779,-0.0572,0.0753,0.0389,0.0572,0.0753,0.0389,-0.0572,0.0753,-0.0779,0.1144,0.0251,0.0389,0,-0.0753,-0.0779,0.1144,0.0251,-0.0779,0,-0.0753,0.0389,0.0572,0.0251,0.0779,-0.0572,0.0251,0.0779,0,-0.0251,0.0779,0.0405,0.0398,0.0779,-0.0405,0.0398,0.0779,0,-0.0753,0.0389,-0.1144,0.0251,-0.0779,0,-0.0753,-0.0779,-0.1144,0.0251,0.0389,0.0572,0.0753,0.0389,0.0572,0.0251,0.0779,0.1144,0.0251,0.0389,0.0405,0.0398,0.0779,0.0572,0.0753,0.0389,-0.0405,0.0398,0.0779,0.0405,0.0398,0.0779,-0.0572,0.0753,0.0389,0.1144,0.0251,0.0389,0,-0.0251,0.0779,0,-0.0753,0.0389,0.0572,0.0251,0.0779,0,-0.0251,0.0779,-0.1144,0.0251,0.0389,0,-0.0753,0.0389,-0.0572,0.0251,0.0779,-0.0405,0.0398,0.0779,-0.1144,0.0251,0.0389,-0.0572,0.0251,0.0779,-0.0572,0.0753,0.0389,-0.1144,0.0251,-0.0779,0.1144,0.0251,-0.0779,0,-0.0753,-0.0779,0.0572,0.0753,-0.0779,-0.0572,0.0753,-0.0779],
    normals: [0.3204,0.8821,0.3453,1,0,0,0.3414,0.9399,0,0.9146,0,0.4043,-0.9146,0,0.4043,-0.3414,0.9399,0,-1,0,0,-0.3204,0.8821,0.3453,0.3414,0.9399,0,-0.3204,0.8821,0.3453,0.3204,0.8821,0.3453,-0.3414,0.9399,0,0.9146,0,0.4043,0.6593,-0.7519,0,1,0,0,0,-0.9324,0.3614,0.4113,0,0.9115,-0.4113,0,0.9115,0,-0.4575,0.8892,0.1587,0.4369,0.8854,-0.1587,0.4369,0.8854,0,-0.9324,0.3614,-1,0,0,-0.6593,-0.7519,0,-0.9146,0,0.4043,0.3204,0.8821,0.3453,0.4113,0,0.9115,0.9146,0,0.4043,0.1587,0.4369,0.8854,0.3204,0.8821,0.3453,-0.1587,0.4369,0.8854,0.1587,0.4369,0.8854,-0.3204,0.8821,0.3453,0.9146,0,0.4043,0,-0.4575,0.8892,0,-0.9324,0.3614,0.4113,0,0.9115,0,-0.4575,0.8892,-0.9146,0,0.4043,0,-0.9324,0.3614,-0.4113,0,0.9115,-0.1587,0.4369,0.8854,-0.9146,0,0.4043,-0.4113,0,0.9115,-0.3204,0.8821,0.3453,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,17,19,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,48,45,49],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-23",
    shape: {
      form: "box", taper: 0.961469, symmetry: "mirror", longest: 0.910248,
      aspect: [1, 1, 0.81736],
      size: [0.744, 0.910248, 0.910248],
    },
    attachment: {
      axis: "z", dir: -1, n: 1,
      sunkUnitsMin: 0.161482, sunkUnitsMean: 0.161482, sunkUnitsMax: 0.161482,
      sunkFractionMin: 0.177404, sunkFractionMean: 0.177404, sunkFractionMax: 0.177404,
    },
    roles: ["tail"],
    tris: 92,
    verts: 176,
    triVariants: [92],
    size: [0.744, 0.910248, 0.910248],
    offset: [0, 0.86875, -0.918642],
    provenance: [
      { species: "fox", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [0.2206,-0.061,0.373,0,-0.243,0.4551,0.1061,-0.2741,0.4241,0,0.0036,0.4376,-0.312,-0.217,0.217,-0.263,0.1891,0.1829,-0.372,0.0031,-0.0031,-0.2206,-0.061,0.373,-0.2121,0.0732,-0.3732,-0.1124,-0.0238,-0.3601,-0.263,-0.1829,-0.1891,0,0.011,-0.4353,0,-0.26,-0.2661,0.263,0.1891,0.1829,0.312,-0.217,0.217,0.372,0.0031,-0.0031,0.2206,-0.061,0.373,-0.2206,-0.373,0.061,-0.372,0.0031,-0.0031,-0.263,-0.1829,-0.1891,-0.312,-0.217,0.217,-0.15,-0.3491,0.3491,-0.2206,-0.061,0.373,-0.312,-0.217,0.217,-0.1061,-0.2741,0.4241,0,-0.243,0.4551,-0.2206,-0.061,0.373,-0.1061,-0.2741,0.4241,0,0.0036,0.4376,-0.1061,-0.4241,0.2741,-0.312,-0.217,0.217,-0.2206,-0.373,0.061,-0.15,-0.3491,0.3491,0.2714,0.2476,-0.0886,0.372,0.0031,-0.0031,0.3,0.2232,-0.2232,0.263,0.1891,0.1829,0.2121,0.3732,-0.0732,0.2121,0.0732,-0.3732,0.372,0.0031,-0.0031,0.263,-0.1829,-0.1891,0.2714,0.0886,-0.2476,0.3,0.2232,-0.2232,0,-0.4376,-0.0036,0.1061,-0.4241,0.2741,0,-0.4551,0.243,0.2206,-0.373,0.061,0.312,-0.217,0.217,0.1061,-0.4241,0.2741,0.2206,-0.373,0.061,0.15,-0.3491,0.3491,0,-0.26,-0.2661,0.2206,-0.373,0.061,0,-0.4376,-0.0036,0.263,-0.1829,-0.1891,-0.2206,-0.373,0.061,0,-0.26,-0.2661,0,-0.4376,-0.0036,-0.263,-0.1829,-0.1891,0.263,0.1891,0.1829,0,0.0036,0.4376,0.2206,-0.061,0.373,0,0.2661,0.26,0.2206,-0.061,0.373,0.15,-0.3491,0.3491,0.312,-0.217,0.217,0.1061,-0.2741,0.4241,0.1061,-0.2741,0.4241,0.1061,-0.4241,0.2741,0.15,-0.3491,0.3491,0,-0.243,0.4551,0,-0.4551,0.243,-0.1061,-0.2741,0.4241,-0.1061,-0.4241,0.2741,-0.15,-0.3491,0.3491,0,0.0036,0.4376,-0.263,0.1891,0.1829,-0.2206,-0.061,0.373,0,0.2661,0.26,0,0.4353,-0.011,-0.1124,0.3601,0.0238,0,0.2661,0.26,-0.2121,0.3732,-0.0732,-0.263,0.1891,0.1829,-0.372,0.0031,-0.0031,-0.2714,0.2476,-0.0886,-0.3,0.2232,-0.2232,-0.263,0.1891,0.1829,-0.2121,0.3732,-0.0732,0,0.011,-0.4353,0.263,-0.1829,-0.1891,0,-0.26,-0.2661,0.1124,-0.0238,-0.3601,0.2121,0.0732,-0.3732,0.372,0.0031,-0.0031,0.2206,-0.373,0.061,0.263,-0.1829,-0.1891,0.312,-0.217,0.217,-0.1061,-0.4241,0.2741,0,-0.4376,-0.0036,0,-0.4551,0.243,-0.2206,-0.373,0.061,-0.372,0.0031,-0.0031,-0.2121,0.0732,-0.3732,-0.263,-0.1829,-0.1891,-0.2714,0.0886,-0.2476,-0.3,0.2232,-0.2232,0.2121,0.3732,-0.0732,0,0.2661,0.26,0.263,0.1891,0.1829,0.1124,0.3601,0.0238,0,0.4353,-0.011,0.2121,0.0732,-0.3732,0.1124,-0.0238,-0.3601,0,0.011,-0.4353,0,0.4353,-0.011,-0.2121,0.3732,-0.0732,-0.1124,0.3601,0.0238,0.2121,0.3732,-0.0732,0.2714,0.2476,-0.0886,0.3,0.2232,-0.2232,-0.2121,0.3732,-0.0732,-0.3,0.2232,-0.2232,-0.2714,0.2476,-0.0886,0.3,0.2232,-0.2232,0.2714,0.0886,-0.2476,0.2121,0.0732,-0.3732,0,0.4353,-0.011,0.1124,0.3601,0.0238,0.2121,0.3732,-0.0732,-0.2121,0.0732,-0.3732,0,0.011,-0.4353,-0.1124,-0.0238,-0.3601,-0.3,0.2232,-0.2232,-0.2121,0.0732,-0.3732,-0.2714,0.0886,-0.2476,0,0.243,-0.4551,0.2121,0.0732,-0.3732,0,0.011,-0.4353,0.1061,0.2741,-0.4241,-0.3,0.2232,-0.2232,-0.1061,0.4241,-0.2741,-0.15,0.3491,-0.3491,-0.2121,0.3732,-0.0732,0.1061,0.2741,-0.4241,0.1061,0.4241,-0.2741,0.15,0.3491,-0.3491,0,0.243,-0.4551,0,0.4551,-0.243,-0.1061,0.2741,-0.4241,-0.1061,0.4241,-0.2741,-0.15,0.3491,-0.3491,-0.3,0.2232,-0.2232,-0.1061,0.2741,-0.4241,-0.2121,0.0732,-0.3732,-0.15,0.3491,-0.3491,0.1061,0.4241,-0.2741,0.3,0.2232,-0.2232,0.15,0.3491,-0.3491,0.2121,0.3732,-0.0732,0.1061,0.2741,-0.4241,0.3,0.2232,-0.2232,0.2121,0.0732,-0.3732,0.15,0.3491,-0.3491,0.1061,0.4241,-0.2741,0,0.4353,-0.011,0.2121,0.3732,-0.0732,0,0.4551,-0.243,-0.2121,0.0732,-0.3732,0,0.243,-0.4551,0,0.011,-0.4353,-0.1061,0.2741,-0.4241,0,0.4353,-0.011,-0.1061,0.4241,-0.2741,-0.2121,0.3732,-0.0732,0,0.4551,-0.243],
    normals: [0.6436,0.1623,0.7479,0,0.0708,0.9975,0.5341,-0.0857,0.841,0,0.3508,0.9364,-0.9102,-0.2928,0.2928,-0.707,0.5124,0.4875,-0.9998,0.0124,-0.0124,-0.6436,0.1623,0.7479,-0.6889,-0.3278,-0.6465,-0.3742,-0.4911,-0.7866,-0.707,-0.4875,-0.5124,0,-0.5296,-0.8483,0,-0.6946,-0.7194,0.707,0.5124,0.4875,0.9102,-0.2928,0.2928,0.9998,0.0124,-0.0124,0.6436,0.1623,0.7479,-0.6436,-0.7479,-0.1623,-0.9998,0.0124,-0.0124,-0.707,-0.4875,-0.5124,-0.9102,-0.2928,0.2928,-0.7554,-0.4634,0.4634,-0.6436,0.1623,0.7479,-0.9102,-0.2928,0.2928,-0.5341,-0.0857,0.841,0,0.0708,0.9975,-0.6436,0.1623,0.7479,-0.5341,-0.0857,0.841,0,0.3508,0.9364,-0.5341,-0.841,0.0857,-0.9102,-0.2928,0.2928,-0.6436,-0.7479,-0.1623,-0.7554,-0.4634,0.4634,0.9035,0.4124,0.1168,0.9998,0.0124,-0.0124,0.9743,0.1594,-0.1594,0.707,0.5124,0.4875,0.6889,0.6465,0.3278,0.6889,-0.3278,-0.6465,0.9998,0.0124,-0.0124,0.707,-0.4875,-0.5124,0.9035,-0.1168,-0.4124,0.9743,0.1594,-0.1594,0,-0.9364,-0.3508,0.5341,-0.841,0.0857,0,-0.9975,-0.0708,0.6436,-0.7479,-0.1623,0.9102,-0.2928,0.2928,0.5341,-0.841,0.0857,0.6436,-0.7479,-0.1623,0.7554,-0.4634,0.4634,0,-0.6946,-0.7194,0.6436,-0.7479,-0.1623,0,-0.9364,-0.3508,0.707,-0.4875,-0.5124,-0.6436,-0.7479,-0.1623,0,-0.6946,-0.7194,0,-0.9364,-0.3508,-0.707,-0.4875,-0.5124,0.707,0.5124,0.4875,0,0.3508,0.9364,0.6436,0.1623,0.7479,0,0.7194,0.6946,0.6436,0.1623,0.7479,0.7554,-0.4634,0.4634,0.9102,-0.2928,0.2928,0.5341,-0.0857,0.841,0,-0.7071,0.7071,0,-0.7071,0.7071,0,-0.7071,0.7071,0,-0.7071,0.7071,0,-0.7071,0.7071,0,-0.7071,0.7071,0,-0.7071,0.7071,0,-0.7071,0.7071,0,0.3508,0.9364,-0.707,0.5124,0.4875,-0.6436,0.1623,0.7479,0,0.7194,0.6946,0,0.8483,0.5296,-0.3742,0.7866,0.4911,0,0.7194,0.6946,-0.6889,0.6465,0.3278,-0.707,0.5124,0.4875,-0.9998,0.0124,-0.0124,-0.9035,0.4124,0.1168,-0.9743,0.1594,-0.1594,-0.707,0.5124,0.4875,-0.6889,0.6465,0.3278,0,-0.5296,-0.8483,0.707,-0.4875,-0.5124,0,-0.6946,-0.7194,0.3742,-0.4911,-0.7866,0.6889,-0.3278,-0.6465,0.9998,0.0124,-0.0124,0.6436,-0.7479,-0.1623,0.707,-0.4875,-0.5124,0.9102,-0.2928,0.2928,-0.5341,-0.841,0.0857,0,-0.9364,-0.3508,0,-0.9975,-0.0708,-0.6436,-0.7479,-0.1623,-0.9998,0.0124,-0.0124,-0.6889,-0.3278,-0.6465,-0.707,-0.4875,-0.5124,-0.9035,-0.1168,-0.4124,-0.9743,0.1594,-0.1594,0.6889,0.6465,0.3278,0,0.7194,0.6946,0.707,0.5124,0.4875,0.3742,0.7866,0.4911,0,0.8483,0.5296,0.6007,-0.0517,-0.7978,0.3742,-0.4911,-0.7866,0,-0.2276,-0.9737,0,0.9737,0.2276,-0.6007,0.7978,0.0517,-0.3742,0.7866,0.4911,0.6007,0.7978,0.0517,0.9035,0.4124,0.1168,0.8495,0.3731,-0.3731,-0.6007,0.7978,0.0517,-0.8495,0.3731,-0.3731,-0.9035,0.4124,0.1168,0.8495,0.3731,-0.3731,0.9035,-0.1168,-0.4124,0.6007,-0.0517,-0.7978,0,0.9737,0.2276,0.3742,0.7866,0.4911,0.6007,0.7978,0.0517,-0.6007,-0.0517,-0.7978,0,-0.2276,-0.9737,-0.3742,-0.4911,-0.7866,-0.8495,0.3731,-0.3731,-0.6007,-0.0517,-0.7978,-0.9035,-0.1168,-0.4124,0,0.2584,-0.966,0.6007,-0.0517,-0.7978,0,-0.2276,-0.9737,0.3538,0.3621,-0.8624,-0.8495,0.3731,-0.3731,-0.3538,0.8624,-0.3621,-0.5003,0.6122,-0.6122,-0.6007,0.7978,0.0517,0.3538,0.3621,-0.8624,0.3538,0.8624,-0.3621,0.5003,0.6122,-0.6122,0,0.2584,-0.966,0,0.966,-0.2584,-0.3538,0.3621,-0.8624,-0.3538,0.8624,-0.3621,-0.5003,0.6122,-0.6122,-0.8495,0.3731,-0.3731,-0.3538,0.3621,-0.8624,-0.6007,-0.0517,-0.7978,-0.5003,0.6122,-0.6122,0.3538,0.8624,-0.3621,0.8495,0.3731,-0.3731,0.5003,0.6122,-0.6122,0.6007,0.7978,0.0517,0.3538,0.3621,-0.8624,0.8495,0.3731,-0.3731,0.6007,-0.0517,-0.7978,0.5003,0.6122,-0.6122,0.3538,0.8624,-0.3621,0,0.9737,0.2276,0.6007,0.7978,0.0517,0,0.966,-0.2584,-0.6007,-0.0517,-0.7978,0,0.2584,-0.966,0,-0.2276,-0.9737,-0.3538,0.3621,-0.8624,0,0.9737,0.2276,-0.3538,0.8624,-0.3621,-0.6007,0.7978,0.0517,0,0.966,-0.2584],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,11,10,9,10,11,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,36,33,37,38,39,40,39,38,41,39,41,42,43,44,45,44,43,46,47,48,49,48,47,50,51,52,53,52,51,54,55,56,57,56,55,58,59,60,61,60,59,62,63,64,65,64,63,66,67,68,69,68,67,70,68,70,71,71,70,72,71,72,73,73,72,74,75,76,77,76,75,78,79,80,81,82,81,80,81,82,83,84,85,86,85,84,87,85,87,88,89,90,91,90,89,92,93,90,92,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,105,102,106,107,108,109,108,107,110,111,108,110,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,145,147,148,148,147,149,148,149,150,150,149,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167,168,169,170,169,168,171,172,173,174,173,172,175],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-24",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.4,
      aspect: [1, 1, 0.5],
      size: [0.4, 0.4, 0.2],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 44,
    verts: 80,
    triVariants: [44],
    size: [0.4, 0.4, 0.2],
    offset: [0, 0.80875, 0.725],
    provenance: [
      { species: "hog", node: "body", ordinal: 5, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0549,0.1502,0.1,0.1223,-0.1223,0.1,0.1714,-0.0037,0.1,0,-0.1729,0.1,0,0.1729,0.1,-0.0549,0.1502,0.1,-0.1223,-0.1223,0.1,-0.1714,-0.0037,0.1,0.0707,0.1707,0.075,0.1714,-0.0037,0.1,0.2,0,0.075,0.0549,0.1502,0.1,0,0.2,0.075,-0.0549,0.1502,0.1,0,0.1729,0.1,-0.0707,0.1707,0.075,-0.1223,-0.1223,0.1,0,-0.2,0.075,0,-0.1729,0.1,-0.1414,-0.1414,0.075,0.1223,-0.1223,0.1,0,-0.2,0.075,0.1414,-0.1414,0.075,0,-0.1729,0.1,-0.0707,0.1707,0.075,-0.1714,-0.0037,0.1,-0.0549,0.1502,0.1,-0.2,0,0.075,0.1714,-0.0037,0.1,0.1414,-0.1414,0.075,0.2,0,0.075,0.1223,-0.1223,0.1,0,0.2,0.075,0.0549,0.1502,0.1,0.0707,0.1707,0.075,0,0.1729,0.1,-0.1714,-0.0037,0.1,-0.1414,-0.1414,0.075,-0.1223,-0.1223,0.1,-0.2,0,0.075,0.2,0,0.075,0.1188,-0.1051,-0.1,0.168,0.0137,-0.1,0.1414,-0.1414,0.075,0,0.1817,-0.1,0.0707,0.1707,0.075,0.0594,0.1571,-0.1,0,0.2,0.075,-0.0594,0.1571,-0.1,0,0.2,0.075,0,0.1817,-0.1,-0.0707,0.1707,0.075,-0.0594,0.1571,-0.1,-0.2,0,0.075,-0.0707,0.1707,0.075,-0.168,0.0137,-0.1,-0.1188,-0.1051,-0.1,-0.2,0,0.075,-0.168,0.0137,-0.1,-0.1414,-0.1414,0.075,0,-0.2,0.075,-0.1188,-0.1051,-0.1,0,-0.1543,-0.1,-0.1414,-0.1414,0.075,0.1414,-0.1414,0.075,0,-0.1543,-0.1,0.1188,-0.1051,-0.1,0,-0.2,0.075,0.2,0,0.075,0.0594,0.1571,-0.1,0.0707,0.1707,0.075,0.168,0.0137,-0.1,0.1188,-0.1051,-0.1,0.0594,0.1571,-0.1,0.168,0.0137,-0.1,0,-0.1543,-0.1,0,0.1817,-0.1,-0.0594,0.1571,-0.1,-0.1188,-0.1051,-0.1,-0.168,0.0137,-0.1],
    normals: [0.2605,0.3372,0.9047,0.3095,-0.3095,0.8991,0.4387,0.0563,0.8969,0,-0.4377,0.8991,0,0.4377,0.8991,-0.2605,0.3372,0.9047,-0.3095,-0.3095,0.8991,-0.4387,0.0563,0.8969,0.5789,0.749,0.3225,0.4387,0.0563,0.8969,0.95,0.1042,0.2943,0.2605,0.3372,0.9047,0,0.9471,0.3209,-0.2605,0.3372,0.9047,0,0.4377,0.8991,-0.5789,0.749,0.3225,-0.3095,-0.3095,0.8991,0,-0.9677,0.2521,0,-0.4377,0.8991,-0.6774,-0.6875,0.2616,0.3095,-0.3095,0.8991,0,-0.9677,0.2521,0.6774,-0.6875,0.2616,0,-0.4377,0.8991,-0.5789,0.749,0.3225,-0.4387,0.0563,0.8969,-0.2605,0.3372,0.9047,-0.95,0.1042,0.2943,0.4387,0.0563,0.8969,0.6774,-0.6875,0.2616,0.95,0.1042,0.2943,0.3095,-0.3095,0.8991,0,0.9471,0.3209,0.2605,0.3372,0.9047,0.5789,0.749,0.3225,0,0.4377,0.8991,-0.4387,0.0563,0.8969,-0.6774,-0.6875,0.2616,-0.3095,-0.3095,0.8991,-0.95,0.1042,0.2943,0.95,0.1042,0.2943,0.501,-0.487,-0.7154,0.7308,0.1192,-0.6721,0.6774,-0.6875,0.2616,0,0.7432,-0.669,0.5789,0.749,0.3225,0.4423,0.5733,-0.6897,0,0.9471,0.3209,-0.4423,0.5733,-0.6897,0,0.9471,0.3209,0,0.7432,-0.669,-0.5789,0.749,0.3225,-0.4423,0.5733,-0.6897,-0.95,0.1042,0.2943,-0.5789,0.749,0.3225,-0.7308,0.1192,-0.6721,-0.501,-0.487,-0.7154,-0.95,0.1042,0.2943,-0.7308,0.1192,-0.6721,-0.6774,-0.6875,0.2616,0,-0.9677,0.2521,-0.501,-0.487,-0.7154,0,-0.6905,-0.7233,-0.6774,-0.6875,0.2616,0.6774,-0.6875,0.2616,0,-0.6905,-0.7233,0.501,-0.487,-0.7154,0,-0.9677,0.2521,0.95,0.1042,0.2943,0.4423,0.5733,-0.6897,0.5789,0.749,0.3225,0.7308,0.1192,-0.6721,0.501,-0.487,-0.7154,0.4423,0.5733,-0.6897,0.7308,0.1192,-0.6721,0,-0.6905,-0.7233,0,0.7432,-0.669,-0.4423,0.5733,-0.6897,-0.501,-0.487,-0.7154,-0.7308,0.1192,-0.6721],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,3,5,6,6,5,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,73,75,76,76,75,77,77,75,78,77,78,79],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-25",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 0.742676,
      aspect: [1, 1, 0.46857],
      size: [0.742676, 0.742676, 0.347996],
    },
    attachment: {
      axis: "x", dir: 1, n: 2,
      sunkUnitsMin: 0.396338, sunkUnitsMean: 0.396338, sunkUnitsMax: 0.396338,
      sunkFractionMin: 0.533662, sunkFractionMean: 0.533662, sunkFractionMax: 0.533662,
    },
    roles: ["ear"],
    tris: 92,
    verts: 168,
    triVariants: [92],
    size: [0.742676, 0.742676, 0.347996],
    offset: [0.6, 1.056956, 0.126002],
    provenance: [
      { species: "koala", node: "body", ordinal: 0, role: "ear", name: "ear-right" },
      { species: "koala", node: "body", ordinal: 1, role: "ear", name: "ear-left" },
    ],
    positions: [0.1246,-0.2159,0.174,-0.1246,-0.2159,0.174,0,-0.2493,0.174,0.2159,-0.1246,0.174,-0.2159,-0.1246,0.174,0.2493,0,0.174,-0.2493,0,0.174,0.2159,0.1246,0.174,-0.2159,0.1246,0.174,-0.1246,0.2159,0.174,0.1246,0.2159,0.174,0,0.2493,0.174,0,0.2493,0.174,-0.1857,0.3216,0.0891,-0.1246,0.2159,0.174,0,0.3713,0.0891,-0.3713,0,-0.0891,-0.3216,0.1857,0.0891,-0.3216,0.1857,-0.0891,-0.3713,0,0.0891,-0.3713,0,-0.0891,-0.2159,-0.1246,-0.174,-0.3216,-0.1857,-0.0891,-0.2493,0,-0.174,-0.3216,0.1857,-0.0891,-0.1857,0.3216,0.0891,-0.1857,0.3216,-0.0891,-0.3216,0.1857,0.0891,0,0.2493,-0.174,0.1857,0.3216,-0.0891,0.1246,0.2159,-0.174,0,0.3713,-0.0891,-0.1246,-0.2159,-0.174,0.1246,-0.2159,-0.174,0,-0.2493,-0.174,-0.2159,-0.1246,-0.174,0.2159,-0.1246,-0.174,0.2493,0,-0.174,-0.2493,0,-0.174,-0.2159,0.1246,-0.174,0.2159,0.1246,-0.174,-0.1246,0.2159,-0.174,0.1246,0.2159,-0.174,0,0.2493,-0.174,0.2159,-0.1246,-0.174,0.3713,0,-0.0891,0.3216,-0.1857,-0.0891,0.2493,0,-0.174,0.3713,0,0.0891,0.3216,-0.1857,-0.0891,0.3713,0,-0.0891,0.3216,-0.1857,0.0891,0,-0.3713,0.0891,0.1857,-0.3216,-0.0891,0.1857,-0.3216,0.0891,0,-0.3713,-0.0891,-0.3216,-0.1857,-0.0891,-0.1246,-0.2159,-0.174,-0.1857,-0.3216,-0.0891,-0.2159,-0.1246,-0.174,-0.3216,-0.1857,0.0891,-0.1857,-0.3216,-0.0891,-0.1857,-0.3216,0.0891,-0.3216,-0.1857,-0.0891,0,-0.2493,-0.174,0.1857,-0.3216,-0.0891,0,-0.3713,-0.0891,0.1246,-0.2159,-0.174,0,-0.2493,0.174,-0.1857,-0.3216,0.0891,0,-0.3713,0.0891,-0.1246,-0.2159,0.174,0.3713,0,0.0891,0.2159,-0.1246,0.174,0.3216,-0.1857,0.0891,0.2493,0,0.174,-0.1246,0.2159,0.174,-0.3216,0.1857,0.0891,-0.2159,0.1246,0.174,-0.1857,0.3216,0.0891,0,0.3713,-0.0891,0.1857,0.3216,0.0891,0.1857,0.3216,-0.0891,0,0.3713,0.0891,-0.1857,-0.3216,-0.0891,0,-0.2493,-0.174,0,-0.3713,-0.0891,-0.1246,-0.2159,-0.174,-0.2159,-0.1246,0.174,-0.3713,0,0.0891,-0.3216,-0.1857,0.0891,-0.2493,0,0.174,-0.1246,-0.2159,0.174,-0.3216,-0.1857,0.0891,-0.1857,-0.3216,0.0891,-0.2159,-0.1246,0.174,0.1857,-0.3216,0.0891,0.3216,-0.1857,-0.0891,0.3216,-0.1857,0.0891,0.1857,-0.3216,-0.0891,-0.2493,0,0.174,-0.3216,0.1857,0.0891,-0.3713,0,0.0891,-0.2159,0.1246,0.174,-0.1857,0.3216,-0.0891,0,0.2493,-0.174,-0.1246,0.2159,-0.174,0,0.3713,-0.0891,-0.3713,0,-0.0891,-0.2159,0.1246,-0.174,-0.2493,0,-0.174,-0.3216,0.1857,-0.0891,-0.1857,0.3216,-0.0891,0,0.3713,0.0891,0,0.3713,-0.0891,-0.1857,0.3216,0.0891,0.3216,0.1857,0.0891,0.3713,0,-0.0891,0.3216,0.1857,-0.0891,0.3713,0,0.0891,0.3216,-0.1857,0.0891,0.1246,-0.2159,0.174,0.1857,-0.3216,0.0891,0.2159,-0.1246,0.174,0.1857,0.3216,0.0891,0,0.2493,0.174,0.1246,0.2159,0.174,0,0.3713,0.0891,-0.1857,-0.3216,0.0891,0,-0.3713,-0.0891,0,-0.3713,0.0891,-0.1857,-0.3216,-0.0891,0.3216,0.1857,0.0891,0.2493,0,0.174,0.3713,0,0.0891,0.2159,0.1246,0.174,0.1246,0.2159,-0.174,0.3216,0.1857,-0.0891,0.2159,0.1246,-0.174,0.1857,0.3216,-0.0891,0.1857,0.3216,0.0891,0.3216,0.1857,-0.0891,0.1857,0.3216,-0.0891,0.3216,0.1857,0.0891,-0.3216,0.1857,-0.0891,-0.1246,0.2159,-0.174,-0.2159,0.1246,-0.174,-0.1857,0.3216,-0.0891,-0.3216,-0.1857,-0.0891,-0.3713,0,0.0891,-0.3713,0,-0.0891,-0.3216,-0.1857,0.0891,0.2159,0.1246,-0.174,0.3713,0,-0.0891,0.2493,0,-0.174,0.3216,0.1857,-0.0891,0.1857,-0.3216,0.0891,0,-0.2493,0.174,0,-0.3713,0.0891,0.1246,-0.2159,0.174,0.1246,-0.2159,-0.174,0.3216,-0.1857,-0.0891,0.1857,-0.3216,-0.0891,0.2159,-0.1246,-0.174,0.3216,0.1857,0.0891,0.1246,0.2159,0.174,0.2159,0.1246,0.174,0.1857,0.3216,0.0891],
    normals: [0.1716,-0.2972,0.9393,-0.1716,-0.2972,0.9393,0,-0.3431,0.9393,0.2972,-0.1716,0.9393,-0.2972,-0.1716,0.9393,0.3431,0,0.9393,-0.3431,0,0.9393,0.2972,0.1716,0.9393,-0.2972,0.1716,0.9393,-0.1716,0.2972,0.9393,0.1716,0.2972,0.9393,0,0.3431,0.9393,0,0.3431,0.9393,-0.4504,0.7801,0.4344,-0.1716,0.2972,0.9393,0,0.9007,0.4344,-0.9007,0,-0.4344,-0.7801,0.4504,0.4344,-0.7801,0.4504,-0.4344,-0.9007,0,0.4344,-0.9007,0,-0.4344,-0.2972,-0.1716,-0.9393,-0.7801,-0.4504,-0.4344,-0.3431,0,-0.9393,-0.7801,0.4504,-0.4344,-0.4504,0.7801,0.4344,-0.4504,0.7801,-0.4344,-0.7801,0.4504,0.4344,0,0.3431,-0.9393,0.4504,0.7801,-0.4344,0.1716,0.2972,-0.9393,0,0.9007,-0.4344,-0.1716,-0.2972,-0.9393,0.1716,-0.2972,-0.9393,0,-0.3431,-0.9393,-0.2972,-0.1716,-0.9393,0.2972,-0.1716,-0.9393,0.3431,0,-0.9393,-0.3431,0,-0.9393,-0.2972,0.1716,-0.9393,0.2972,0.1716,-0.9393,-0.1716,0.2972,-0.9393,0.1716,0.2972,-0.9393,0,0.3431,-0.9393,0.2972,-0.1716,-0.9393,0.9007,0,-0.4344,0.7801,-0.4504,-0.4344,0.3431,0,-0.9393,0.9007,0,0.4344,0.7801,-0.4504,-0.4344,0.9007,0,-0.4344,0.7801,-0.4504,0.4344,0,-0.9007,0.4344,0.4504,-0.7801,-0.4344,0.4504,-0.7801,0.4344,0,-0.9007,-0.4344,-0.7801,-0.4504,-0.4344,-0.1716,-0.2972,-0.9393,-0.4504,-0.7801,-0.4344,-0.2972,-0.1716,-0.9393,-0.7801,-0.4504,0.4344,-0.4504,-0.7801,-0.4344,-0.4504,-0.7801,0.4344,-0.7801,-0.4504,-0.4344,0,-0.3431,-0.9393,0.4504,-0.7801,-0.4344,0,-0.9007,-0.4344,0.1716,-0.2972,-0.9393,0,-0.3431,0.9393,-0.4504,-0.7801,0.4344,0,-0.9007,0.4344,-0.1716,-0.2972,0.9393,0.9007,0,0.4344,0.2972,-0.1716,0.9393,0.7801,-0.4504,0.4344,0.3431,0,0.9393,-0.1716,0.2972,0.9393,-0.7801,0.4504,0.4344,-0.2972,0.1716,0.9393,-0.4504,0.7801,0.4344,0,0.9007,-0.4344,0.4504,0.7801,0.4344,0.4504,0.7801,-0.4344,0,0.9007,0.4344,-0.4504,-0.7801,-0.4344,0,-0.3431,-0.9393,0,-0.9007,-0.4344,-0.1716,-0.2972,-0.9393,-0.2972,-0.1716,0.9393,-0.9007,0,0.4344,-0.7801,-0.4504,0.4344,-0.3431,0,0.9393,-0.1716,-0.2972,0.9393,-0.7801,-0.4504,0.4344,-0.4504,-0.7801,0.4344,-0.2972,-0.1716,0.9393,0.4504,-0.7801,0.4344,0.7801,-0.4504,-0.4344,0.7801,-0.4504,0.4344,0.4504,-0.7801,-0.4344,-0.3431,0,0.9393,-0.7801,0.4504,0.4344,-0.9007,0,0.4344,-0.2972,0.1716,0.9393,-0.4504,0.7801,-0.4344,0,0.3431,-0.9393,-0.1716,0.2972,-0.9393,0,0.9007,-0.4344,-0.9007,0,-0.4344,-0.2972,0.1716,-0.9393,-0.3431,0,-0.9393,-0.7801,0.4504,-0.4344,-0.4504,0.7801,-0.4344,0,0.9007,0.4344,0,0.9007,-0.4344,-0.4504,0.7801,0.4344,0.7801,0.4504,0.4344,0.9007,0,-0.4344,0.7801,0.4504,-0.4344,0.9007,0,0.4344,0.7801,-0.4504,0.4344,0.1716,-0.2972,0.9393,0.4504,-0.7801,0.4344,0.2972,-0.1716,0.9393,0.4504,0.7801,0.4344,0,0.3431,0.9393,0.1716,0.2972,0.9393,0,0.9007,0.4344,-0.4504,-0.7801,0.4344,0,-0.9007,-0.4344,0,-0.9007,0.4344,-0.4504,-0.7801,-0.4344,0.7801,0.4504,0.4344,0.3431,0,0.9393,0.9007,0,0.4344,0.2972,0.1716,0.9393,0.1716,0.2972,-0.9393,0.7801,0.4504,-0.4344,0.2972,0.1716,-0.9393,0.4504,0.7801,-0.4344,0.4504,0.7801,0.4344,0.7801,0.4504,-0.4344,0.4504,0.7801,-0.4344,0.7801,0.4504,0.4344,-0.7801,0.4504,-0.4344,-0.1716,0.2972,-0.9393,-0.2972,0.1716,-0.9393,-0.4504,0.7801,-0.4344,-0.7801,-0.4504,-0.4344,-0.9007,0,0.4344,-0.9007,0,-0.4344,-0.7801,-0.4504,0.4344,0.2972,0.1716,-0.9393,0.9007,0,-0.4344,0.3431,0,-0.9393,0.7801,0.4504,-0.4344,0.4504,-0.7801,0.4344,0,-0.3431,0.9393,0,-0.9007,0.4344,0.1716,-0.2972,0.9393,0.1716,-0.2972,-0.9393,0.7801,-0.4504,-0.4344,0.4504,-0.7801,-0.4344,0.2972,-0.1716,-0.9393,0.7801,0.4504,0.4344,0.1716,0.2972,0.9393,0.2972,0.1716,0.9393,0.4504,0.7801,0.4344],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,4,5,6,6,5,7,6,7,8,8,7,9,9,7,10,9,10,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,33,35,36,36,35,37,37,35,38,37,38,39,37,39,40,40,39,41,40,41,42,42,41,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167],
    bands: [1,1,1,1,1,1,1,1,1,1,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "box-26",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.327651,
      aspect: [1, 0.848464, 0.424232],
      size: [0.278, 0.327651, 0.139],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 44,
    verts: 80,
    triVariants: [44],
    size: [0.278, 0.327651, 0.139],
    offset: [0, 0.729925, 0.6945],
    provenance: [
      { species: "koala", node: "body", ordinal: 3, role: "nose", name: "nose-tip" },
    ],
    positions: [-0.0983,-0.1158,-0.0695,0.0983,-0.1158,-0.0695,0,-0.1638,-0.0695,-0.139,0,-0.0695,0.139,0,-0.0695,-0.0983,0.1158,-0.0695,0.0983,0.1158,-0.0695,0,0.1638,-0.0695,0.139,0,-0.0695,0.0983,-0.1158,0,0.0983,-0.1158,-0.0695,0.139,0,0,0,-0.1638,0,0.0983,-0.1158,-0.0695,0.0983,-0.1158,0,0,-0.1638,-0.0695,-0.0983,-0.1158,0,0,-0.1638,-0.0695,0,-0.1638,0,-0.0983,-0.1158,-0.0695,-0.0983,-0.1158,0,-0.139,0,-0.0695,-0.0983,-0.1158,-0.0695,-0.139,0,0,-0.139,0,0,-0.0983,0.1158,-0.0695,-0.139,0,-0.0695,-0.0983,0.1158,0,0,0.1638,-0.0695,-0.0983,0.1158,0,0,0.1638,0,-0.0983,0.1158,-0.0695,0.0983,0.1158,-0.0695,0,0.1638,0,0.0983,0.1158,0,0,0.1638,-0.0695,0.0983,0.1158,-0.0695,0.139,0,0,0.139,0,-0.0695,0.0983,0.1158,0,0.0393,-0.0777,0.0695,-0.0393,-0.0777,0.0695,0,-0.0969,0.0695,0.0666,0,0.0695,-0.0666,0,0.0695,0.0393,0.0777,0.0695,-0.0393,0.0777,0.0695,0,0.0969,0.0695,0,0.0969,0.0695,-0.0983,0.1158,0,-0.0393,0.0777,0.0695,0,0.1638,0,0.139,0,0,0.0393,-0.0777,0.0695,0.0983,-0.1158,0,0.0666,0,0.0695,0.139,0,0,0.0393,0.0777,0.0695,0.0666,0,0.0695,0.0983,0.1158,0,0.0983,0.1158,0,0,0.0969,0.0695,0.0393,0.0777,0.0695,0,0.1638,0,-0.0393,0.0777,0.0695,-0.139,0,0,-0.0666,0,0.0695,-0.0983,0.1158,0,-0.0393,-0.0777,0.0695,-0.139,0,0,-0.0983,-0.1158,0,-0.0666,0,0.0695,0,-0.0969,0.0695,-0.0983,-0.1158,0,0,-0.1638,0,-0.0393,-0.0777,0.0695,0.0983,-0.1158,0,0,-0.0969,0.0695,0,-0.1638,0,0.0393,-0.0777,0.0695],
    normals: [0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,1,0,0,0.6848,-0.6423,0.3442,0.7294,-0.6841,0,0.9295,0,0.3689,0,-0.9487,0.3163,0.7294,-0.6841,0,0.6848,-0.6423,0.3442,0,-1,0,-0.6848,-0.6423,0.3442,0,-1,0,0,-0.9487,0.3163,-0.7294,-0.6841,0,-0.6848,-0.6423,0.3442,-1,0,0,-0.7294,-0.6841,0,-0.9295,0,0.3689,-0.9295,0,0.3689,-0.7294,0.6841,0,-1,0,0,-0.6848,0.6423,0.3442,0,1,0,-0.6848,0.6423,0.3442,0,0.9487,0.3163,-0.7294,0.6841,0,0.7294,0.6841,0,0,0.9487,0.3163,0.6848,0.6423,0.3442,0,1,0,0.7294,0.6841,0,0.9295,0,0.3689,1,0,0,0.6848,0.6423,0.3442,0.3391,-0.3181,0.8853,-0.3391,-0.3181,0.8853,0,-0.5108,0.8597,0.4282,0,0.9037,-0.4282,0,0.9037,0.3391,0.3181,0.8853,-0.3391,0.3181,0.8853,0,0.5108,0.8597,0,0.5108,0.8597,-0.6848,0.6423,0.3442,-0.3391,0.3181,0.8853,0,0.9487,0.3163,0.9295,0,0.3689,0.3391,-0.3181,0.8853,0.6848,-0.6423,0.3442,0.4282,0,0.9037,0.9295,0,0.3689,0.3391,0.3181,0.8853,0.4282,0,0.9037,0.6848,0.6423,0.3442,0.6848,0.6423,0.3442,0,0.5108,0.8597,0.3391,0.3181,0.8853,0,0.9487,0.3163,-0.3391,0.3181,0.8853,-0.9295,0,0.3689,-0.4282,0,0.9037,-0.6848,0.6423,0.3442,-0.3391,-0.3181,0.8853,-0.9295,0,0.3689,-0.6848,-0.6423,0.3442,-0.4282,0,0.9037,0,-0.5108,0.8597,-0.6848,-0.6423,0.3442,0,-0.9487,0.3163,-0.3391,-0.3181,0.8853,0.6848,-0.6423,0.3442,0,-0.5108,0.8597,0,-0.9487,0.3163,0.3391,-0.3181,0.8853],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,4,5,6,6,5,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,41,43,44,44,43,45,44,45,46,46,45,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-27",
    shape: {
      form: "box", taper: 0.889535, symmetry: "mirror", longest: 0.281309,
      aspect: [1, 0.86592, 0.827627],
      size: [0.232819, 0.281309, 0.243591],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.227316, sunkUnitsMean: 0.227316, sunkUnitsMax: 0.227316,
      sunkFractionMin: 0.933187, sunkFractionMean: 0.933187, sunkFractionMax: 0.933187,
    },
    roles: ["ear"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.232819, 0.281309, 0.243591],
    offset: [0.051481, 1.32216, 0.51948],
    provenance: [
      { species: "koala", node: "body", ordinal: 4, role: "ear", name: "ear-right" },
    ],
    positions: [0,0.101,0.0993,-0.0541,0.1068,0.0777,0,0.0309,0.1218,-0.0823,0.0397,0.0889,0.0823,0.0397,0.0889,0,0.0309,0.1218,0.0608,-0.1341,0.02,0,-0.1407,0.0443,0,0.0912,-0.1031,0.0823,0.0823,-0.0702,0,-0.0961,-0.1218,0.0608,-0.1027,-0.0975,0,0.1407,-0.0486,0.0541,0.1349,-0.0269,0,0.0912,-0.1031,0.0823,0.0823,-0.0702,-0.0541,0.1068,0.0777,-0.0765,0.1208,0.0254,-0.0823,0.0397,0.0889,-0.1164,0.061,0.0094,0.0765,0.1208,0.0254,0.1164,0.061,0.0094,0.0541,0.1349,-0.0269,0.0823,0.0823,-0.0702,0.0541,0.1068,0.0777,0,0.101,0.0993,0.0823,0.0397,0.0889,0,0.0309,0.1218,-0.0541,0.1349,-0.0269,0,0.1407,-0.0486,-0.0823,0.0823,-0.0702,0,0.0912,-0.1031,-0.0823,0.0397,0.0889,-0.1164,0.061,0.0094,-0.0608,-0.1341,0.02,-0.086,-0.1184,-0.0387,0.0823,0.0397,0.0889,0.0608,-0.1341,0.02,0.1164,0.061,0.0094,0.086,-0.1184,-0.0387,-0.0823,0.0823,-0.0702,0,0.0912,-0.1031,-0.0608,-0.1027,-0.0975,0,-0.0961,-0.1218,0.0541,0.1068,0.0777,0.0823,0.0397,0.0889,0.0765,0.1208,0.0254,0.1164,0.061,0.0094,-0.086,-0.1184,-0.0387,-0.1164,0.061,0.0094,-0.0608,-0.1027,-0.0975,-0.0823,0.0823,-0.0702,0,0.0309,0.1218,-0.0823,0.0397,0.0889,0,-0.1407,0.0443,-0.0608,-0.1341,0.02,-0.0765,0.1208,0.0254,-0.0541,0.1349,-0.0269,-0.1164,0.061,0.0094,-0.0823,0.0823,-0.0702,0.086,-0.1184,-0.0387,0.0608,-0.1027,-0.0975,0.1164,0.061,0.0094,0.0823,0.0823,-0.0702,0.0765,0.1208,0.0254,0.0541,0.1349,-0.0269,0.0541,0.1068,0.0777,0,0.101,0.0993,0,0.1407,-0.0486,-0.0541,0.1068,0.0777,-0.0541,0.1349,-0.0269,-0.0765,0.1208,0.0254],
    normals: [0,0.6549,0.7557,-0.3963,0.6974,0.5971,0,-0.0727,0.9974,-0.6945,0.0018,0.7195,0.6945,0.0018,0.7195,0,-0.0727,0.9974,0.6978,-0.3367,0.6322,0,-0.4115,0.9114,0,0.4358,-0.9001,0.6945,0.3613,-0.6222,0,0.0994,-0.9951,0.6978,0.0246,-0.7159,0,0.945,-0.327,0.3963,0.9025,-0.1685,0,0.4358,-0.9001,0.6945,0.3613,-0.6222,-0.3963,0.6974,0.5971,-0.5605,0.8,0.2143,-0.6945,0.0018,0.7195,-0.9822,0.1815,0.0486,0.5605,0.8,0.2143,0.9822,0.1815,0.0486,0.3963,0.9025,-0.1685,0.6945,0.3613,-0.6222,0.3963,0.6974,0.5971,0,0.6549,0.7557,0.6945,0.0018,0.7195,0,-0.0727,0.9974,-0.3963,0.9025,-0.1685,0,0.945,-0.327,-0.6945,0.3613,-0.6222,0,0.4358,-0.9001,-0.6945,0.0018,0.7195,-0.9822,0.1815,0.0486,-0.6978,-0.3367,0.6322,-0.9869,-0.156,-0.0418,0.6945,0.0018,0.7195,0.6978,-0.3367,0.6322,0.9822,0.1815,0.0486,0.9869,-0.156,-0.0418,-0.6945,0.3613,-0.6222,0,0.4358,-0.9001,-0.6978,0.0246,-0.7159,0,0.0994,-0.9951,0.3963,0.6974,0.5971,0.6945,0.0018,0.7195,0.5605,0.8,0.2143,0.9822,0.1815,0.0486,-0.9869,-0.156,-0.0418,-0.9822,0.1815,0.0486,-0.6978,0.0246,-0.7159,-0.6945,0.3613,-0.6222,0,-0.0727,0.9974,-0.6945,0.0018,0.7195,0,-0.4115,0.9114,-0.6978,-0.3367,0.6322,-0.5605,0.8,0.2143,-0.3963,0.9025,-0.1685,-0.9822,0.1815,0.0486,-0.6945,0.3613,-0.6222,0.9869,-0.156,-0.0418,0.6978,0.0246,-0.7159,0.9822,0.1815,0.0486,0.6945,0.3613,-0.6222,0.5605,0.8,0.2143,0.3963,0.9025,-0.1685,0.3963,0.6974,0.5971,0,0.6549,0.7557,0,0.945,-0.327,-0.3963,0.6974,0.5971,-0.3963,0.9025,-0.1685,-0.5605,0.8,0.2143],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,66,65,67,65,68,67,67,68,69,68,70,69,71,69,70],
    bands: [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "box-28",
    shape: {
      form: "box", taper: 0.952875, symmetry: "handed", longest: 0.294773,
      aspect: [1, 0.886815, 0.816008],
      size: [0.261409, 0.294773, 0.240537],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.240536, sunkUnitsMean: 0.240536, sunkUnitsMax: 0.240536,
      sunkFractionMin: 0.999996, sunkFractionMean: 0.999996, sunkFractionMax: 0.999996,
    },
    roles: ["ear"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.261409, 0.294773, 0.240537],
    offset: [-0.095764, 1.25272, 0.462369],
    provenance: [
      { species: "koala", node: "body", ordinal: 5, role: "ear", name: "ear-left" },
    ],
    positions: [-0.0729,0.0678,0.1061,-0.1156,0.0602,0.0667,-0.0517,-0.0015,0.1191,-0.1166,-0.0131,0.0592,0.026,0.0421,0.1203,-0.0517,-0.0015,0.1191,0.0975,-0.1066,0.0297,0.0401,-0.1389,0.0289,-0.0081,0.108,-0.0816,0.0568,0.1196,-0.0217,0.0723,-0.0579,-0.1194,0.1203,-0.0494,-0.0751,-0.0443,0.1398,-0.0259,-0.0016,0.1474,0.0135,-0.0081,0.108,-0.0816,0.0568,0.1196,-0.0217,-0.1156,0.0602,0.0667,-0.1249,0.0781,0.0117,-0.1166,-0.0131,0.0592,-0.1307,0.0142,-0.0244,0.0077,0.1294,0.0685,0.0709,0.0923,0.0619,-0.0016,0.1474,0.0135,0.0568,0.1196,-0.0217,-0.0219,0.0965,0.1068,-0.0729,0.0678,0.1061,0.026,0.0421,0.1203,-0.0517,-0.0015,0.1191,-0.0953,0.1111,-0.0267,-0.0443,0.1398,-0.0259,-0.0858,0.0644,-0.0828,-0.0081,0.108,-0.0816,-0.1166,-0.0131,0.0592,-0.1307,0.0142,-0.0244,-0.0078,-0.1474,-0.0154,-0.0183,-0.1272,-0.0772,0.026,0.0421,0.1203,0.0975,-0.1066,0.0297,0.0709,0.0923,0.0619,0.1307,-0.0696,-0.0134,-0.0858,0.0644,-0.0828,-0.0081,0.108,-0.0816,0.015,-0.0902,-0.1203,0.0723,-0.0579,-0.1194,-0.0219,0.0965,0.1068,0.026,0.0421,0.1203,0.0077,0.1294,0.0685,0.0709,0.0923,0.0619,-0.0183,-0.1272,-0.0772,-0.1307,0.0142,-0.0244,0.015,-0.0902,-0.1203,-0.0858,0.0644,-0.0828,-0.0517,-0.0015,0.1191,-0.1166,-0.0131,0.0592,0.0401,-0.1389,0.0289,-0.0078,-0.1474,-0.0154,-0.1249,0.0781,0.0117,-0.0953,0.1111,-0.0267,-0.1307,0.0142,-0.0244,-0.0858,0.0644,-0.0828,0.1307,-0.0696,-0.0134,0.1203,-0.0494,-0.0751,0.0709,0.0923,0.0619,0.0568,0.1196,-0.0217,0.0077,0.1294,0.0685,-0.0016,0.1474,0.0135,-0.0219,0.0965,0.1068,-0.0729,0.0678,0.1061,-0.0443,0.1398,-0.0259,-0.1156,0.0602,0.0667,-0.0953,0.1111,-0.0267,-0.1249,0.0781,0.0117],
    normals: [-0.4889,0.4124,0.7687,-0.8014,0.3567,0.4801,-0.2711,-0.3086,0.9117,-0.8187,-0.4061,0.406,0.3842,0.0595,0.9213,-0.2711,-0.3086,0.9117,0.5485,-0.2262,0.8049,-0.1099,-0.5961,0.7953,0.0968,0.6155,-0.7822,0.6444,0.713,-0.2765,0.2597,0.3324,-0.9067,0.8099,0.4303,-0.3985,-0.279,0.9397,-0.1979,0.0335,0.9953,0.0907,0.0968,0.6155,-0.7822,0.6444,0.713,-0.2765,-0.8014,0.3567,0.4801,-0.8693,0.4882,0.0775,-0.8187,-0.4061,0.406,-0.9377,-0.1758,-0.2996,0.1014,0.8639,0.4933,0.7635,0.4827,0.4292,0.0335,0.9953,0.0907,0.6444,0.713,-0.2765,-0.115,0.6224,0.7742,-0.4889,0.4124,0.7687,0.3842,0.0595,0.9213,-0.2711,-0.3086,0.9117,-0.6529,0.7296,-0.2033,-0.279,0.9397,-0.1979,-0.5585,0.2473,-0.7918,0.0968,0.6155,-0.7822,-0.8187,-0.4061,0.406,-0.9377,-0.1758,-0.2996,-0.6601,-0.6941,0.2872,-0.7798,-0.4627,-0.4218,0.3842,0.0595,0.9213,0.5485,-0.2262,0.8049,0.7635,0.4827,0.4292,0.9295,0.1989,0.3104,-0.5585,0.2473,-0.7918,0.0968,0.6155,-0.7822,-0.3987,-0.0375,-0.9163,0.2597,0.3324,-0.9067,-0.115,0.6224,0.7742,0.3842,0.0595,0.9213,0.1014,0.8639,0.4933,0.7635,0.4827,0.4292,-0.7798,-0.4627,-0.4218,-0.9377,-0.1758,-0.2996,-0.3987,-0.0375,-0.9163,-0.5585,0.2473,-0.7918,-0.2711,-0.3086,0.9117,-0.8187,-0.4061,0.406,-0.1099,-0.5961,0.7953,-0.6601,-0.6941,0.2872,-0.8693,0.4882,0.0775,-0.6529,0.7296,-0.2033,-0.9377,-0.1758,-0.2996,-0.5585,0.2473,-0.7918,0.9295,0.1989,0.3104,0.8099,0.4303,-0.3985,0.7635,0.4827,0.4292,0.6444,0.713,-0.2765,0.1014,0.8639,0.4933,0.0335,0.9953,0.0907,-0.115,0.6224,0.7742,-0.4889,0.4124,0.7687,-0.279,0.9397,-0.1979,-0.8014,0.3567,0.4801,-0.6529,0.7296,-0.2033,-0.8693,0.4882,0.0775],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,66,65,67,65,68,67,67,68,69,68,70,69,71,69,70],
    bands: [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "box-29",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 1.65,
      aspect: [1, 1, 0.30303],
      size: [1.65, 1.65, 0.5],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.5, sunkUnitsMean: 0.5, sunkUnitsMax: 0.5,
      sunkFractionMin: 1, sunkFractionMean: 1, sunkFractionMax: 1,
    },
    roles: ["band"],
    tris: 124,
    verts: 224,
    triVariants: [124],
    size: [1.65, 1.65, 0.5],
    offset: [0, 0.90625, 0.25],
    provenance: [
      { species: "lion", node: "body", ordinal: 0, role: "band", name: "mane (torso shell-ring)" },
    ],
    positions: [0.349,0.7209,0.25,0,0.6741,0.25,0.5721,0.5721,0.25,-0.349,0.7209,0.25,-0.5721,0.5721,0.25,-0.7209,0.349,0.25,0.7209,0.349,0.25,-0.6741,0,0.25,0.6741,0,0.25,0.7209,-0.349,0.25,-0.7209,-0.349,0.25,0.5721,-0.5721,0.25,-0.5721,-0.5721,0.25,0,-0.6741,0.25,-0.349,-0.7209,0.25,0.349,-0.7209,0.25,-0.6442,-0.6442,0.15,-0.825,-0.3731,-0.15,-0.6442,-0.6442,-0.15,-0.825,-0.3731,0.15,-0.825,-0.3731,0.15,-0.775,0,-0.15,-0.825,-0.3731,-0.15,-0.775,0,0.15,-0.775,0,0.15,-0.825,0.3731,-0.15,-0.775,0,-0.15,-0.825,0.3731,0.15,-0.825,0.3731,0.15,-0.6442,0.6442,-0.15,-0.825,0.3731,-0.15,-0.6442,0.6442,0.15,-0.6442,0.6442,-0.15,-0.3731,0.825,0.15,-0.3731,0.825,-0.15,-0.6442,0.6442,0.15,-0.3731,0.825,-0.15,0,0.775,0.15,0,0.775,-0.15,-0.3731,0.825,0.15,0,0.775,-0.15,0.3731,0.825,0.15,0.3731,0.825,-0.15,0,0.775,0.15,0.3731,0.825,-0.15,0.6442,0.6442,0.15,0.6442,0.6442,-0.15,0.3731,0.825,0.15,0.6442,0.6442,0.15,0.825,0.3731,-0.15,0.6442,0.6442,-0.15,0.825,0.3731,0.15,0.825,0.3731,0.15,0.775,0,-0.15,0.825,0.3731,-0.15,0.775,0,0.15,0.775,0,0.15,0.825,-0.3731,-0.15,0.775,0,-0.15,0.825,-0.3731,0.15,0.825,-0.3731,0.15,0.6442,-0.6442,-0.15,0.825,-0.3731,-0.15,0.6442,-0.6442,0.15,0.3731,-0.825,0.15,0.6442,-0.6442,-0.15,0.6442,-0.6442,0.15,0.3731,-0.825,-0.15,0,-0.775,0.15,0.3731,-0.825,-0.15,0.3731,-0.825,0.15,0,-0.775,-0.15,-0.3731,-0.825,0.15,0,-0.775,-0.15,0,-0.775,0.15,-0.3731,-0.825,-0.15,-0.6442,-0.6442,0.15,-0.3731,-0.825,-0.15,-0.3731,-0.825,0.15,-0.6442,-0.6442,-0.15,-0.5721,-0.5721,-0.25,0,-0.6741,-0.25,-0.349,-0.7209,-0.25,0.5721,-0.5721,-0.25,0.349,-0.7209,-0.25,-0.7209,-0.349,-0.25,0.7209,-0.349,-0.25,-0.6741,0,-0.25,0.6741,0,-0.25,0.7209,0.349,-0.25,-0.7209,0.349,-0.25,0.5721,0.5721,-0.25,-0.5721,0.5721,-0.25,-0.349,0.7209,-0.25,0,0.6741,-0.25,0.349,0.7209,-0.25,0.7209,-0.349,-0.25,0.775,0,-0.15,0.825,-0.3731,-0.15,0.6741,0,-0.25,0.5721,-0.5721,-0.25,0.825,-0.3731,-0.15,0.6442,-0.6442,-0.15,0.7209,-0.349,-0.25,-0.349,-0.7209,-0.25,0,-0.775,-0.15,-0.3731,-0.825,-0.15,0,-0.6741,-0.25,0,-0.775,-0.15,0.349,-0.7209,-0.25,0.3731,-0.825,-0.15,0,-0.6741,-0.25,0.7209,0.349,-0.25,0.775,0,-0.15,0.6741,0,-0.25,0.825,0.3731,-0.15,0.349,0.7209,-0.25,0.6442,0.6442,-0.15,0.5721,0.5721,-0.25,0.3731,0.825,-0.15,0.5721,0.5721,-0.25,0.825,0.3731,-0.15,0.7209,0.349,-0.25,0.6442,0.6442,-0.15,-0.6442,-0.6442,-0.15,-0.349,-0.7209,-0.25,-0.3731,-0.825,-0.15,-0.5721,-0.5721,-0.25,0.349,-0.7209,-0.25,0.6442,-0.6442,-0.15,0.3731,-0.825,-0.15,0.5721,-0.5721,-0.25,0.825,0.3731,0.15,0.6741,0,0.25,0.775,0,0.15,0.7209,0.349,0.25,-0.5721,-0.5721,0.25,-0.825,-0.3731,0.15,-0.6442,-0.6442,0.15,-0.7209,-0.349,0.25,0.349,-0.7209,0.25,0,-0.775,0.15,0.3731,-0.825,0.15,0,-0.6741,0.25,0.825,-0.3731,0.15,0.5721,-0.5721,0.25,0.6442,-0.6442,0.15,0.7209,-0.349,0.25,0.775,0,0.15,0.7209,-0.349,0.25,0.825,-0.3731,0.15,0.6741,0,0.25,-0.349,-0.7209,0.25,-0.6442,-0.6442,0.15,-0.3731,-0.825,0.15,-0.5721,-0.5721,0.25,0.6442,-0.6442,0.15,0.349,-0.7209,0.25,0.3731,-0.825,0.15,0.5721,-0.5721,0.25,0,-0.775,0.15,-0.349,-0.7209,0.25,-0.3731,-0.825,0.15,0,-0.6741,0.25,-0.825,0.3731,-0.15,-0.6741,0,-0.25,-0.775,0,-0.15,-0.7209,0.349,-0.25,-0.825,-0.3731,-0.15,-0.5721,-0.5721,-0.25,-0.6442,-0.6442,-0.15,-0.7209,-0.349,-0.25,-0.7209,-0.349,0.25,-0.775,0,0.15,-0.825,-0.3731,0.15,-0.6741,0,0.25,-0.825,0.3731,-0.15,-0.5721,0.5721,-0.25,-0.7209,0.349,-0.25,-0.6442,0.6442,-0.15,0.349,0.7209,0.25,0,0.775,0.15,0,0.6741,0.25,0.3731,0.825,0.15,-0.349,0.7209,-0.25,0,0.775,-0.15,0,0.6741,-0.25,-0.3731,0.825,-0.15,0,0.775,0.15,-0.349,0.7209,0.25,0,0.6741,0.25,-0.3731,0.825,0.15,-0.6442,0.6442,-0.15,-0.349,0.7209,-0.25,-0.5721,0.5721,-0.25,-0.3731,0.825,-0.15,-0.5721,0.5721,0.25,-0.825,0.3731,0.15,-0.7209,0.349,0.25,-0.6442,0.6442,0.15,0,0.775,-0.15,0.349,0.7209,-0.25,0,0.6741,-0.25,0.3731,0.825,-0.15,0.6442,0.6442,0.15,0.349,0.7209,0.25,0.5721,0.5721,0.25,0.3731,0.825,0.15,0.825,0.3731,0.15,0.5721,0.5721,0.25,0.7209,0.349,0.25,0.6442,0.6442,0.15,-0.349,0.7209,0.25,-0.6442,0.6442,0.15,-0.5721,0.5721,0.25,-0.3731,0.825,0.15,-0.7209,0.349,0.25,-0.775,0,0.15,-0.6741,0,0.25,-0.825,0.3731,0.15,-0.775,0,-0.15,-0.7209,-0.349,-0.25,-0.825,-0.3731,-0.15,-0.6741,0,-0.25],
    normals: [0.0982,0.4242,0.9002,0,0.3524,0.9359,0.2951,0.2951,0.9087,-0.0982,0.4242,0.9002,-0.2951,0.2951,0.9087,-0.4242,0.0982,0.9002,0.4242,0.0982,0.9002,-0.3524,0,0.9359,0.3524,0,0.9359,0.4242,-0.0982,0.9002,-0.4242,-0.0982,0.9002,0.2951,-0.2951,0.9087,-0.2951,-0.2951,0.9087,0,-0.3524,0.9359,-0.0982,-0.4242,0.9002,0.0982,-0.4242,0.9002,-0.6567,-0.6567,0.3709,-0.9057,-0.2096,-0.3686,-0.6567,-0.6567,-0.3709,-0.9057,-0.2096,0.3686,-0.9057,-0.2096,0.3686,-0.9179,0,-0.3968,-0.9057,-0.2096,-0.3686,-0.9179,0,0.3968,-0.9179,0,0.3968,-0.9057,0.2096,-0.3686,-0.9179,0,-0.3968,-0.9057,0.2096,0.3686,-0.9057,0.2096,0.3686,-0.6567,0.6567,-0.3709,-0.9057,0.2096,-0.3686,-0.6567,0.6567,0.3709,-0.6567,0.6567,-0.3709,-0.2096,0.9057,0.3686,-0.2096,0.9057,-0.3686,-0.6567,0.6567,0.3709,-0.2096,0.9057,-0.3686,0,0.9179,0.3968,0,0.9179,-0.3968,-0.2096,0.9057,0.3686,0,0.9179,-0.3968,0.2096,0.9057,0.3686,0.2096,0.9057,-0.3686,0,0.9179,0.3968,0.2096,0.9057,-0.3686,0.6567,0.6567,0.3709,0.6567,0.6567,-0.3709,0.2096,0.9057,0.3686,0.6567,0.6567,0.3709,0.9057,0.2096,-0.3686,0.6567,0.6567,-0.3709,0.9057,0.2096,0.3686,0.9057,0.2096,0.3686,0.9179,0,-0.3968,0.9057,0.2096,-0.3686,0.9179,0,0.3968,0.9179,0,0.3968,0.9057,-0.2096,-0.3686,0.9179,0,-0.3968,0.9057,-0.2096,0.3686,0.9057,-0.2096,0.3686,0.6567,-0.6567,-0.3709,0.9057,-0.2096,-0.3686,0.6567,-0.6567,0.3709,0.2096,-0.9057,0.3686,0.6567,-0.6567,-0.3709,0.6567,-0.6567,0.3709,0.2096,-0.9057,-0.3686,0,-0.9179,0.3968,0.2096,-0.9057,-0.3686,0.2096,-0.9057,0.3686,0,-0.9179,-0.3968,-0.2096,-0.9057,0.3686,0,-0.9179,-0.3968,0,-0.9179,0.3968,-0.2096,-0.9057,-0.3686,-0.6567,-0.6567,0.3709,-0.2096,-0.9057,-0.3686,-0.2096,-0.9057,0.3686,-0.6567,-0.6567,-0.3709,-0.2951,-0.2951,-0.9087,0,-0.3524,-0.9359,-0.0982,-0.4242,-0.9002,0.2951,-0.2951,-0.9087,0.0982,-0.4242,-0.9002,-0.4242,-0.0982,-0.9002,0.4242,-0.0982,-0.9002,-0.3524,0,-0.9359,0.3524,0,-0.9359,0.4242,0.0982,-0.9002,-0.4242,0.0982,-0.9002,0.2951,0.2951,-0.9087,-0.2951,0.2951,-0.9087,-0.0982,0.4242,-0.9002,0,0.3524,-0.9359,0.0982,0.4242,-0.9002,0.4242,-0.0982,-0.9002,0.9179,0,-0.3968,0.9057,-0.2096,-0.3686,0.3524,0,-0.9359,0.2951,-0.2951,-0.9087,0.9057,-0.2096,-0.3686,0.6567,-0.6567,-0.3709,0.4242,-0.0982,-0.9002,-0.0982,-0.4242,-0.9002,0,-0.9179,-0.3968,-0.2096,-0.9057,-0.3686,0,-0.3524,-0.9359,0,-0.9179,-0.3968,0.0982,-0.4242,-0.9002,0.2096,-0.9057,-0.3686,0,-0.3524,-0.9359,0.4242,0.0982,-0.9002,0.9179,0,-0.3968,0.3524,0,-0.9359,0.9057,0.2096,-0.3686,0.0982,0.4242,-0.9002,0.6567,0.6567,-0.3709,0.2951,0.2951,-0.9087,0.2096,0.9057,-0.3686,0.2951,0.2951,-0.9087,0.9057,0.2096,-0.3686,0.4242,0.0982,-0.9002,0.6567,0.6567,-0.3709,-0.6567,-0.6567,-0.3709,-0.0982,-0.4242,-0.9002,-0.2096,-0.9057,-0.3686,-0.2951,-0.2951,-0.9087,0.0982,-0.4242,-0.9002,0.6567,-0.6567,-0.3709,0.2096,-0.9057,-0.3686,0.2951,-0.2951,-0.9087,0.9057,0.2096,0.3686,0.3524,0,0.9359,0.9179,0,0.3968,0.4242,0.0982,0.9002,-0.2951,-0.2951,0.9087,-0.9057,-0.2096,0.3686,-0.6567,-0.6567,0.3709,-0.4242,-0.0982,0.9002,0.0982,-0.4242,0.9002,0,-0.9179,0.3968,0.2096,-0.9057,0.3686,0,-0.3524,0.9359,0.9057,-0.2096,0.3686,0.2951,-0.2951,0.9087,0.6567,-0.6567,0.3709,0.4242,-0.0982,0.9002,0.9179,0,0.3968,0.4242,-0.0982,0.9002,0.9057,-0.2096,0.3686,0.3524,0,0.9359,-0.0982,-0.4242,0.9002,-0.6567,-0.6567,0.3709,-0.2096,-0.9057,0.3686,-0.2951,-0.2951,0.9087,0.6567,-0.6567,0.3709,0.0982,-0.4242,0.9002,0.2096,-0.9057,0.3686,0.2951,-0.2951,0.9087,0,-0.9179,0.3968,-0.0982,-0.4242,0.9002,-0.2096,-0.9057,0.3686,0,-0.3524,0.9359,-0.9057,0.2096,-0.3686,-0.3524,0,-0.9359,-0.9179,0,-0.3968,-0.4242,0.0982,-0.9002,-0.9057,-0.2096,-0.3686,-0.2951,-0.2951,-0.9087,-0.6567,-0.6567,-0.3709,-0.4242,-0.0982,-0.9002,-0.4242,-0.0982,0.9002,-0.9179,0,0.3968,-0.9057,-0.2096,0.3686,-0.3524,0,0.9359,-0.9057,0.2096,-0.3686,-0.2951,0.2951,-0.9087,-0.4242,0.0982,-0.9002,-0.6567,0.6567,-0.3709,0.0982,0.4242,0.9002,0,0.9179,0.3968,0,0.3524,0.9359,0.2096,0.9057,0.3686,-0.0982,0.4242,-0.9002,0,0.9179,-0.3968,0,0.3524,-0.9359,-0.2096,0.9057,-0.3686,0,0.9179,0.3968,-0.0982,0.4242,0.9002,0,0.3524,0.9359,-0.2096,0.9057,0.3686,-0.6567,0.6567,-0.3709,-0.0982,0.4242,-0.9002,-0.2951,0.2951,-0.9087,-0.2096,0.9057,-0.3686,-0.2951,0.2951,0.9087,-0.9057,0.2096,0.3686,-0.4242,0.0982,0.9002,-0.6567,0.6567,0.3709,0,0.9179,-0.3968,0.0982,0.4242,-0.9002,0,0.3524,-0.9359,0.2096,0.9057,-0.3686,0.6567,0.6567,0.3709,0.0982,0.4242,0.9002,0.2951,0.2951,0.9087,0.2096,0.9057,0.3686,0.9057,0.2096,0.3686,0.2951,0.2951,0.9087,0.4242,0.0982,0.9002,0.6567,0.6567,0.3709,-0.0982,0.4242,0.9002,-0.6567,0.6567,0.3709,-0.2951,0.2951,0.9087,-0.2096,0.9057,0.3686,-0.4242,0.0982,0.9002,-0.9179,0,0.3968,-0.3524,0,0.9359,-0.9057,0.2096,0.3686,-0.9179,0,-0.3968,-0.4242,-0.0982,-0.9002,-0.9057,-0.2096,-0.3686,-0.3524,0,-0.9359],
    indices: [0,1,2,3,2,1,4,2,3,5,2,4,5,6,2,7,6,5,7,8,6,7,9,8,10,9,7,10,11,9,12,11,10,13,11,12,12,14,13,11,13,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,83,81,80,81,83,84,83,80,85,83,85,86,86,85,87,86,87,88,88,87,89,89,87,90,89,90,91,91,90,92,91,92,93,91,93,94,95,91,94,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167,168,169,170,169,168,171,172,173,174,173,172,175,176,177,178,177,176,179,180,181,182,181,180,183,184,185,186,185,184,187,188,189,190,189,188,191,192,193,194,193,192,195,196,197,198,197,196,199,200,201,202,201,200,203,204,205,206,205,204,207,208,209,210,209,208,211,212,213,214,213,212,215,216,217,218,217,216,219,220,221,222,221,220,223],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-30",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.331443,
      aspect: [1, 0.95039, 0.762569],
      size: [0.315, 0.331443, 0.252748],
    },
    attachment: {
      axis: "z", dir: 1, n: 2,
      sunkUnitsMin: 0.128874, sunkUnitsMean: 0.128874, sunkUnitsMax: 0.128874,
      sunkFractionMin: 0.509891, sunkFractionMean: 0.509891, sunkFractionMax: 0.509891,
    },
    roles: ["ear"],
    tris: 92,
    verts: 168,
    triVariants: [92],
    size: [0.315, 0.331443, 0.252748],
    offset: [0.375, 1.336986, 0.4975],
    provenance: [
      { species: "lion", node: "body", ordinal: 1, role: "ear", name: "ear-right" },
      { species: "lion", node: "body", ordinal: 2, role: "ear", name: "ear-left" },
    ],
    positions: [0.0916,-0.0245,-0.1127,0.1575,0.0136,-0.0507,0.1364,-0.0625,-0.0711,0.1057,0.0265,-0.099,0.0529,0.115,-0.0753,0.1364,0.0897,-0.0303,0.0916,0.0776,-0.0853,0.0787,0.1453,-0.0154,-0.1364,-0.0625,-0.0711,-0.0529,-0.0619,-0.1227,-0.0788,-0.1182,-0.086,-0.0916,-0.0245,-0.1127,-0.0529,-0.0619,-0.1227,0.0529,-0.0619,-0.1227,0,-0.0756,-0.1264,-0.0916,-0.0245,-0.1127,0.0916,-0.0245,-0.1127,0.1057,0.0265,-0.099,-0.1057,0.0265,-0.099,-0.0916,0.0776,-0.0853,0.0916,0.0776,-0.0853,-0.0529,0.115,-0.0753,0.0529,0.115,-0.0753,0,0.1287,-0.0716,-0.0788,0.1453,-0.0154,0,0.1287,-0.0716,-0.0529,0.115,-0.0753,0,0.1657,-0.0099,-0.1575,0.0136,-0.0507,-0.0916,0.0776,-0.0853,-0.1057,0.0265,-0.099,-0.1364,0.0897,-0.0303,0,0.1287,-0.0716,0.0787,0.1453,-0.0154,0.0529,0.115,-0.0753,0,0.1657,-0.0099,-0.1575,0.0136,-0.0507,-0.0916,-0.0245,-0.1127,-0.1364,-0.0625,-0.0711,-0.1057,0.0265,-0.099,-0.1364,0.0897,-0.0303,-0.0529,0.115,-0.0753,-0.0916,0.0776,-0.0853,-0.0788,0.1453,-0.0154,-0.0788,-0.1182,-0.086,0,-0.0756,-0.1264,0,-0.1385,-0.0915,-0.0529,-0.0619,-0.1227,0,-0.0756,-0.1264,0.0787,-0.1182,-0.086,0,-0.1385,-0.0915,0.0529,-0.0619,-0.1227,0.0529,-0.0619,-0.1227,0.1364,-0.0625,-0.0711,0.0787,-0.1182,-0.086,0.0916,-0.0245,-0.1127,0.0916,0.0776,-0.0853,0.1575,0.0136,-0.0507,0.1057,0.0265,-0.099,0.1364,0.0897,-0.0303,0.1575,-0.0136,0.0507,0.1364,-0.0625,-0.0711,0.1575,0.0136,-0.0507,0.1364,-0.0897,0.0303,0.0787,-0.1453,0.0154,0.1364,-0.0625,-0.0711,0.1364,-0.0897,0.0303,0.0787,-0.1182,-0.086,-0.0788,-0.1453,0.0154,0,-0.1385,-0.0915,0,-0.1657,0.0099,-0.0788,-0.1182,-0.086,-0.0788,0.1453,-0.0154,0,0.1385,0.0915,0,0.1657,-0.0099,-0.0788,0.1182,0.086,0.1364,0.0625,0.0711,0.1575,0.0136,-0.0507,0.1364,0.0897,-0.0303,0.1575,-0.0136,0.0507,0.0787,0.1182,0.086,0.1364,0.0897,-0.0303,0.0787,0.1453,-0.0154,0.1364,0.0625,0.0711,-0.1364,0.0897,-0.0303,-0.0788,0.1182,0.086,-0.0788,0.1453,-0.0154,-0.1364,0.0625,0.0711,-0.1364,-0.0897,0.0303,-0.0788,-0.1182,-0.086,-0.0788,-0.1453,0.0154,-0.1364,-0.0625,-0.0711,-0.1364,-0.0625,-0.0711,-0.1575,-0.0136,0.0507,-0.1575,0.0136,-0.0507,-0.1364,-0.0897,0.0303,-0.1575,0.0136,-0.0507,-0.1364,0.0625,0.0711,-0.1364,0.0897,-0.0303,-0.1575,-0.0136,0.0507,0,-0.1657,0.0099,0.0787,-0.1182,-0.086,0.0787,-0.1453,0.0154,0,-0.1385,-0.0915,0,-0.1287,0.0716,-0.0788,-0.1453,0.0154,0,-0.1657,0.0099,-0.0529,-0.115,0.0753,0,0.1657,-0.0099,0.0787,0.1182,0.086,0.0787,0.1453,-0.0154,0,0.1385,0.0915,-0.0529,0.0619,0.1227,-0.1364,0.0625,0.0711,-0.0916,0.0245,0.1127,-0.0788,0.1182,0.086,0,0.0756,0.1264,-0.0788,0.1182,0.086,-0.0529,0.0619,0.1227,0,0.1385,0.0915,0.1364,-0.0897,0.0303,0.0529,-0.115,0.0753,0.0787,-0.1453,0.0154,0.0916,-0.0776,0.0853,0.1575,-0.0136,0.0507,0.0916,-0.0776,0.0853,0.1364,-0.0897,0.0303,0.1057,-0.0265,0.099,-0.0916,-0.0776,0.0853,-0.1575,-0.0136,0.0507,-0.1364,-0.0897,0.0303,-0.1057,-0.0265,0.099,-0.0529,-0.115,0.0753,-0.1364,-0.0897,0.0303,-0.0788,-0.1453,0.0154,-0.0916,-0.0776,0.0853,0.1364,0.0625,0.0711,0.1057,-0.0265,0.099,0.1575,-0.0136,0.0507,0.0916,0.0245,0.1127,-0.1057,-0.0265,0.099,-0.1364,0.0625,0.0711,-0.1575,-0.0136,0.0507,-0.0916,0.0245,0.1127,0.0787,-0.1453,0.0154,0,-0.1287,0.0716,0,-0.1657,0.0099,0.0529,-0.115,0.0753,0.0787,0.1182,0.086,0,0.0756,0.1264,0.0529,0.0619,0.1227,0,0.1385,0.0915,0.1364,0.0625,0.0711,0.0529,0.0619,0.1227,0.0916,0.0245,0.1127,0.0787,0.1182,0.086,0.0529,-0.115,0.0753,-0.0529,-0.115,0.0753,0,-0.1287,0.0716,0.0916,-0.0776,0.0853,-0.0916,-0.0776,0.0853,0.1057,-0.0265,0.099,-0.1057,-0.0265,0.099,0.0916,0.0245,0.1127,-0.0916,0.0245,0.1127,-0.0529,0.0619,0.1227,0.0529,0.0619,0.1227,0,0.0756,0.1264],
    normals: [0.3687,0.0286,-0.9291,0.9293,0.0956,-0.3567,0.8048,-0.3533,-0.4769,0.4257,0.2342,-0.874,0.2129,0.5903,-0.7786,0.8048,0.5444,-0.2364,0.3687,0.4398,-0.8189,0.4647,0.873,-0.1484,-0.8048,-0.3533,-0.4769,-0.2129,-0.1219,-0.9694,-0.4647,-0.6818,-0.565,-0.3687,0.0286,-0.9291,-0.2129,-0.1219,-0.9694,0.2129,-0.1219,-0.9694,0,-0.177,-0.9842,-0.3687,0.0286,-0.9291,0.3687,0.0286,-0.9291,0.4257,0.2342,-0.874,-0.4257,0.2342,-0.874,-0.3687,0.4398,-0.8189,0.3687,0.4398,-0.8189,-0.2129,0.5903,-0.7786,0.2129,0.5903,-0.7786,0,0.6454,-0.7638,-0.4647,0.873,-0.1484,0,0.6454,-0.7638,-0.2129,0.5903,-0.7786,0,0.9932,-0.1161,-0.9293,0.0956,-0.3567,-0.3687,0.4398,-0.8189,-0.4257,0.2342,-0.874,-0.8048,0.5444,-0.2364,0,0.6454,-0.7638,0.4647,0.873,-0.1484,0.2129,0.5903,-0.7786,0,0.9932,-0.1161,-0.9293,0.0956,-0.3567,-0.3687,0.0286,-0.9291,-0.8048,-0.3533,-0.4769,-0.4257,0.2342,-0.874,-0.8048,0.5444,-0.2364,-0.2129,0.5903,-0.7786,-0.3687,0.4398,-0.8189,-0.4647,0.873,-0.1484,-0.4647,-0.6818,-0.565,0,-0.177,-0.9842,0,-0.8021,-0.5972,-0.2129,-0.1219,-0.9694,0,-0.177,-0.9842,0.4647,-0.6818,-0.565,0,-0.8021,-0.5972,0.2129,-0.1219,-0.9694,0.2129,-0.1219,-0.9694,0.8048,-0.3533,-0.4769,0.4647,-0.6818,-0.565,0.3687,0.0286,-0.9291,0.3687,0.4398,-0.8189,0.9293,0.0956,-0.3567,0.4257,0.2342,-0.874,0.8048,0.5444,-0.2364,0.9293,-0.0956,0.3567,0.8048,-0.3533,-0.4769,0.9293,0.0956,-0.3567,0.8048,-0.5444,0.2364,0.4647,-0.873,0.1484,0.8048,-0.3533,-0.4769,0.8048,-0.5444,0.2364,0.4647,-0.6818,-0.565,-0.4647,-0.873,0.1484,0,-0.8021,-0.5972,0,-0.9932,0.1161,-0.4647,-0.6818,-0.565,-0.4647,0.873,-0.1484,0,0.8021,0.5972,0,0.9932,-0.1161,-0.4647,0.6818,0.565,0.8048,0.3533,0.4769,0.9293,0.0956,-0.3567,0.8048,0.5444,-0.2364,0.9293,-0.0956,0.3567,0.4647,0.6818,0.565,0.8048,0.5444,-0.2364,0.4647,0.873,-0.1484,0.8048,0.3533,0.4769,-0.8048,0.5444,-0.2364,-0.4647,0.6818,0.565,-0.4647,0.873,-0.1484,-0.8048,0.3533,0.4769,-0.8048,-0.5444,0.2364,-0.4647,-0.6818,-0.565,-0.4647,-0.873,0.1484,-0.8048,-0.3533,-0.4769,-0.8048,-0.3533,-0.4769,-0.9293,-0.0956,0.3567,-0.9293,0.0956,-0.3567,-0.8048,-0.5444,0.2364,-0.9293,0.0956,-0.3567,-0.8048,0.3533,0.4769,-0.8048,0.5444,-0.2364,-0.9293,-0.0956,0.3567,0,-0.9932,0.1161,0.4647,-0.6818,-0.565,0.4647,-0.873,0.1484,0,-0.8021,-0.5972,0,-0.6454,0.7638,-0.4647,-0.873,0.1484,0,-0.9932,0.1161,-0.2129,-0.5903,0.7786,0,0.9932,-0.1161,0.4647,0.6818,0.565,0.4647,0.873,-0.1484,0,0.8021,0.5972,-0.2129,0.1219,0.9694,-0.8048,0.3533,0.4769,-0.3687,-0.0286,0.9291,-0.4647,0.6818,0.565,0,0.177,0.9842,-0.4647,0.6818,0.565,-0.2129,0.1219,0.9694,0,0.8021,0.5972,0.8048,-0.5444,0.2364,0.2129,-0.5903,0.7786,0.4647,-0.873,0.1484,0.3687,-0.4398,0.8189,0.9293,-0.0956,0.3567,0.3687,-0.4398,0.8189,0.8048,-0.5444,0.2364,0.4257,-0.2342,0.874,-0.3687,-0.4398,0.8189,-0.9293,-0.0956,0.3567,-0.8048,-0.5444,0.2364,-0.4257,-0.2342,0.874,-0.2129,-0.5903,0.7786,-0.8048,-0.5444,0.2364,-0.4647,-0.873,0.1484,-0.3687,-0.4398,0.8189,0.8048,0.3533,0.4769,0.4257,-0.2342,0.874,0.9293,-0.0956,0.3567,0.3687,-0.0286,0.9291,-0.4257,-0.2342,0.874,-0.8048,0.3533,0.4769,-0.9293,-0.0956,0.3567,-0.3687,-0.0286,0.9291,0.4647,-0.873,0.1484,0,-0.6454,0.7638,0,-0.9932,0.1161,0.2129,-0.5903,0.7786,0.4647,0.6818,0.565,0,0.177,0.9842,0.2129,0.1219,0.9694,0,0.8021,0.5972,0.8048,0.3533,0.4769,0.2129,0.1219,0.9694,0.3687,-0.0286,0.9291,0.4647,0.6818,0.565,0.2129,-0.5903,0.7786,-0.2129,-0.5903,0.7786,0,-0.6454,0.7638,0.3687,-0.4398,0.8189,-0.3687,-0.4398,0.8189,0.4257,-0.2342,0.874,-0.4257,-0.2342,0.874,0.3687,-0.0286,0.9291,-0.3687,-0.0286,0.9291,-0.2129,0.1219,0.9694,0.2129,0.1219,0.9694,0,0.177,0.9842],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,13,15,16,16,15,17,17,15,18,17,18,19,17,19,20,20,19,21,20,21,22,22,21,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,157,159,160,160,159,161,160,161,162,162,161,163,162,163,164,164,163,165,165,163,166,165,166,167],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-31",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.25,
      aspect: [1, 1, 0.9],
      size: [1.25, 1.25, 1.125],
    },
    attachment: null,
    roles: ["hull"],
    tris: 50,
    verts: 100,
    triVariants: [50],
    size: [1.25, 1.25, 1.125],
    offset: [0, 0.80625, -0.0625],
    provenance: [
      { species: "lion", node: "body", ordinal: 3, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [-0.3125,-0.625,0.375,0.3125,-0.625,-0.25,0.3125,-0.625,0.375,-0.3125,-0.625,-0.25,-0.5,-0.5,0.5625,-0.3125,-0.625,-0.25,-0.3125,-0.625,0.375,-0.5,-0.5,-0.4375,0.625,0.3125,0.375,0.625,-0.3125,-0.25,0.625,0.3125,-0.25,0.625,-0.3125,0.375,0.3125,0.625,0.375,-0.5,0.5,0.5625,0.5,0.5,0.5625,-0.3125,0.625,0.375,0.625,0.3125,-0.25,0.5,-0.5,-0.4375,0.5,0.5,-0.4375,0.625,-0.3125,-0.25,-0.3125,-0.3125,-0.5625,0.5,-0.5,-0.4375,-0.5,-0.5,-0.4375,0.3125,-0.3125,-0.5625,-0.5,-0.5,0.5625,0.3125,-0.625,0.375,0.5,-0.5,0.5625,-0.3125,-0.625,0.375,0.5,0.5,0.5625,0.625,0.3125,-0.25,0.5,0.5,-0.4375,0.625,0.3125,0.375,-0.5,0.5,-0.4375,0.3125,0.3125,-0.5625,-0.3125,0.3125,-0.5625,0.5,0.5,-0.4375,0.625,-0.3125,-0.25,0.5,-0.5,0.5625,0.5,-0.5,-0.4375,0.625,-0.3125,0.375,0.3125,-0.625,-0.25,-0.5,-0.5,-0.4375,0.5,-0.5,-0.4375,-0.3125,-0.625,-0.25,-0.5,-0.5,0.5625,-0.625,-0.3125,-0.25,-0.5,-0.5,-0.4375,-0.625,-0.3125,0.375,-0.5,0.5,-0.4375,0.3125,0.625,-0.25,0.5,0.5,-0.4375,-0.3125,0.625,-0.25,-0.3125,0.625,-0.25,-0.5,0.5,0.5625,-0.3125,0.625,0.375,-0.5,0.5,-0.4375,-0.5,-0.5,0.5625,-0.625,0.3125,0.375,-0.625,-0.3125,0.375,-0.5,0.5,0.5625,0.3125,-0.3125,-0.5625,0.5,0.5,-0.4375,0.5,-0.5,-0.4375,0.3125,0.3125,-0.5625,-0.625,-0.3125,-0.25,-0.5,0.5,-0.4375,-0.5,-0.5,-0.4375,-0.625,0.3125,-0.25,0.5,-0.5,0.5625,0.3125,-0.625,-0.25,0.5,-0.5,-0.4375,0.3125,-0.625,0.375,-0.625,-0.3125,0.375,-0.625,0.3125,-0.25,-0.625,-0.3125,-0.25,-0.625,0.3125,0.375,-0.5,0.5,-0.4375,-0.3125,-0.3125,-0.5625,-0.5,-0.5,-0.4375,-0.3125,0.3125,-0.5625,0.3125,0.625,-0.25,-0.3125,0.625,0.375,0.3125,0.625,0.375,-0.3125,0.625,-0.25,-0.625,0.3125,-0.25,-0.5,0.5,0.5625,-0.5,0.5,-0.4375,-0.625,0.3125,0.375,0.3125,0.625,-0.25,0.5,0.5,0.5625,0.5,0.5,-0.4375,0.3125,0.625,0.375,-0.3125,0.3125,-0.5625,0.3125,-0.3125,-0.5625,-0.3125,-0.3125,-0.5625,0.3125,0.3125,-0.5625,0.5,0.5,0.5625,0.625,-0.3125,0.375,0.625,0.3125,0.375,0.5,-0.5,0.5625],
    normals: [-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.6667,-0.6667,0.3333,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,-0.5774,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.2232,0.9489,0.2232,-0.6667,0.6667,0.3333,0.6667,0.6667,0.3333,-0.2232,0.9489,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,-0.6667,-0.6667,0.3333,0.2232,-0.9489,0.2232,0.6667,-0.6667,0.3333,-0.2232,-0.9489,0.2232,0.6667,0.6667,0.3333,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9489,0.2232,0.2232,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,0.6667,-0.6667,0.3333,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,-0.6667,-0.6667,0.3333,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,-0.2232,0.9489,-0.2232,-0.6667,0.6667,0.3333,-0.2232,0.9489,0.2232,-0.5774,0.5774,-0.5774,-0.6667,-0.6667,0.3333,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.6667,0.6667,0.3333,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,0.6667,-0.6667,0.3333,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.9489,0.2232,-0.2232,-0.6667,0.6667,0.3333,-0.5774,0.5774,-0.5774,-0.9489,0.2232,0.2232,0.2232,0.9489,-0.2232,0.6667,0.6667,0.3333,0.5774,0.5774,-0.5774,0.2232,0.9489,0.2232,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.6667,0.6667,0.3333,0.9489,-0.2232,0.2232,0.9489,0.2232,0.2232,0.6667,-0.6667,0.3333],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-32",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.241998,
      aspect: [1, 0.70539, 0.678477],
      size: [0.241998, 0.16419, 0.170703],
    },
    attachment: {
      axis: "z", dir: 1, n: 2,
      sunkUnitsMin: 0, sunkUnitsMean: 0.05, sunkUnitsMax: 0.1,
      sunkFractionMin: 0, sunkFractionMean: 0.292906, sunkFractionMax: 0.585813,
    },
    roles: ["nose"],
    tris: 29,
    verts: 59,
    triVariants: [29],
    size: [0.241998, 0.16419, 0.170703],
    offset: [0, 0.83902, 0.710352],
    provenance: [
      { species: "lion", node: "body", ordinal: 4, role: "nose", name: "nose-tip" },
      { species: "tiger", node: "body", ordinal: 5, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0707,0.0274,0.0854,0.121,0.0116,0.0427,0.121,0.0432,0.0427,-0.0707,0.0274,0.0854,-0.121,0.0432,0.0427,-0.121,0.0116,0.0427,0.0707,0.0821,0.0427,0.121,0.0432,-0.0854,0.0707,0.0821,-0.0854,0.121,0.0432,0.0427,-0.121,0.0432,0.0427,-0.0707,0.0821,-0.0854,-0.121,0.0432,-0.0854,-0.0707,0.0821,0.0427,0.0707,0.0821,-0.0854,-0.0707,0.0821,0.0427,0.0707,0.0821,0.0427,-0.0707,0.0821,-0.0854,0.0707,0.0274,0.0854,-0.0707,0.0274,0.0854,0,-0.0274,0.0854,0.05,0.0434,0.0854,-0.05,0.0434,0.0854,0.0707,0.0821,0.0427,-0.05,0.0434,0.0854,0.05,0.0434,0.0854,-0.0707,0.0821,0.0427,0,-0.0274,0.0854,-0.121,0.0116,0.0427,0,-0.0821,0.0427,-0.0707,0.0274,0.0854,-0.05,0.0434,0.0854,-0.121,0.0432,0.0427,-0.0707,0.0274,0.0854,-0.0707,0.0821,0.0427,0.121,0.0432,0.0427,0.05,0.0434,0.0854,0.0707,0.0274,0.0854,0.0707,0.0821,0.0427,0.121,0.0116,0.0427,0,-0.0274,0.0854,0,-0.0821,0.0427,0.0707,0.0274,0.0854,0.121,0.0116,0.0427,0,-0.0821,-0.0854,0.121,0.0116,-0.0854,0,-0.0821,0.0427,0.121,0.0432,0.0427,0.121,0.0116,-0.0854,0.121,0.0432,-0.0854,0.121,0.0116,0.0427,0,-0.0821,0.0427,-0.121,0.0116,-0.0854,0,-0.0821,-0.0854,-0.121,0.0116,0.0427,-0.121,0.0116,0.0427,-0.121,0.0432,-0.0854,-0.121,0.0116,-0.0854,-0.121,0.0432,0.0427],
    normals: [0.3519,0,0.9361,0.7737,-0.4677,0.4274,0.7737,0.4677,0.4274,-0.3519,0,0.9361,-0.7737,0.4677,0.4274,-0.7737,-0.4677,0.4274,0.2479,0.9127,0.3248,0.8636,0.5041,0,0.2695,0.963,0,0.7737,0.4677,0.4274,-0.7737,0.4677,0.4274,-0.2695,0.963,0,-0.8636,0.5041,0,-0.2479,0.9127,0.3248,0.2695,0.963,0,-0.2479,0.9127,0.3248,0.2479,0.9127,0.3248,-0.2695,0.963,0,0.3519,0,0.9361,-0.3519,0,0.9361,0,-0.4952,0.8688,0.153,0.4623,0.8734,-0.153,0.4623,0.8734,0.2479,0.9127,0.3248,-0.153,0.4623,0.8734,0.153,0.4623,0.8734,-0.2479,0.9127,0.3248,0,-0.4952,0.8688,-0.7737,-0.4677,0.4274,0,-0.9472,0.3206,-0.3519,0,0.9361,-0.153,0.4623,0.8734,-0.7737,0.4677,0.4274,-0.3519,0,0.9361,-0.2479,0.9127,0.3248,0.7737,0.4677,0.4274,0.153,0.4623,0.8734,0.3519,0,0.9361,0.2479,0.9127,0.3248,0.7737,-0.4677,0.4274,0,-0.4952,0.8688,0,-0.9472,0.3206,0.3519,0,0.9361,0.7737,-0.4677,0.4274,0,-1,0,0.8636,-0.5041,0,0,-0.9472,0.3206,0.7737,0.4677,0.4274,0.8636,-0.5041,0,0.8636,0.5041,0,0.7737,-0.4677,0.4274,0,-0.9472,0.3206,-0.8636,-0.5041,0,0,-1,0,-0.7737,-0.4677,0.4274,-0.7737,-0.4677,0.4274,-0.8636,0.5041,0,-0.8636,-0.5041,0,-0.7737,0.4677,0.4274],
    indices: [0,1,2,3,4,5,6,7,8,7,6,9,10,11,12,11,10,13,14,15,16,15,14,17,18,19,20,19,18,21,19,21,22,23,24,25,24,23,26,27,28,29,28,27,30,31,32,33,32,31,34,35,36,37,36,35,38,39,40,41,40,39,42,43,44,45,44,43,46,47,48,49,48,47,50,51,52,53,52,51,54,55,56,57,56,55,58],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-33",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.25,
      aspect: [1, 1, 1],
      size: [1.25, 1.25, 1.25],
    },
    attachment: null,
    roles: ["hull"],
    tris: 114,
    verts: 198,
    triVariants: [114],
    size: [1.25, 1.25, 1.25],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "monkey", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [-0.5,0.5,0.5,-0.4531,0.4531,0.5313,-0.375,0.5,0.5,0.4531,-0.4531,0.5313,0.375,-0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,0.375,0.5,-0.4531,0.4531,0.5313,-0.5,-0.375,0.5,-0.5,-0.5,0.5,-0.4531,-0.4531,0.5313,-0.4531,-0.4531,0.5313,-0.5,-0.5,0.5,-0.375,-0.5,0.5,0.5,-0.375,0.5,0.4531,-0.4531,0.5313,0.5,-0.5,0.5,0.5,0.5,0.5,0.4531,0.4531,0.5313,0.5,0.375,0.5,0.375,0.5,0.5,0.4531,0.4531,0.5313,0.5,0.5,0.5,0.375,-0.5,0.5,0.3125,-0.625,0.3125,0.5,-0.5,0.5,-0.375,-0.5,0.5,-0.3125,-0.625,0.3125,-0.5,-0.5,0.5,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,0.5,-0.5,0.5,0.3125,-0.625,-0.3125,0.5,-0.5,-0.5,0.3125,-0.625,0.3125,-0.475,0.3125,0.1125,-0.625,0.3125,0.3125,-0.475,0.3125,0.3125,-0.625,0.3125,0.1125,0.625,0.3125,0.1125,0.475,0.3125,0.3125,0.625,0.3125,0.3125,0.475,0.3125,0.1125,0.3125,-0.625,-0.3125,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.3125,-0.625,-0.3125,-0.5,-0.5,0.5,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,-0.5,-0.5,-0.5,0.625,0.3125,0.3125,0.625,-0.1875,0.3125,0.625,0.2125,0.3125,0.625,-0.2875,0.3125,0.625,-0.3125,0.3125,0.5,0.5,0.5,0.5,-0.375,0.5,0.5,0.375,0.5,0.5,-0.5,0.5,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.625,-0.3125,0.5,0.5,0.5,0.5,0.5,-0.5,0.3125,0.625,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.1125,-0.625,-0.2875,0.3125,-0.625,0.2125,0.3125,-0.625,-0.1875,0.3125,-0.625,0.3125,0.3125,0.3125,-0.3125,-0.625,0.5,0.5,-0.5,0.5,-0.5,-0.5,0.3125,0.3125,-0.625,-0.5,0.5,-0.5,-0.3125,-0.3125,-0.625,-0.5,-0.5,-0.5,-0.3125,0.3125,-0.625,0.3125,0.625,0.3125,0.375,0.5,0.5,0.5,0.5,0.5,0.15,0.5,0.5,-0.3125,0.625,0.3125,-0.15,0.5,0.5,-0.375,0.5,0.5,-0.5,0.5,0.5,0.625,-0.3125,-0.3125,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.625,-0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,-0.1875,0.3125,-0.625,-0.2875,0.3125,-0.625,0.2125,0.3125,-0.625,0.3125,0.3125,-0.5,-0.5,0.5,-0.5,0.375,0.5,-0.5,-0.375,0.5,-0.5,0.5,0.5,-0.3125,-0.3125,-0.625,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.3125,-0.3125,-0.625,-0.625,0.3125,-0.3125,-0.5,0.5,0.5,-0.5,0.5,-0.5,-0.625,0.3125,0.1125,-0.625,0.3125,0.3125,-0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.625,0.3125,-0.3125,-0.3125,0.625,-0.3125,-0.5,0.5,0.5,-0.3125,0.625,0.3125,-0.5,0.5,-0.5,-0.5,-0.5,0.5,-0.625,-0.3125,-0.3125,-0.5,-0.5,-0.5,-0.625,-0.3125,0.3125,0.625,0.3125,-0.3125,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.5,0.5,-0.5,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.5,0.5,-0.5,0.3125,0.625,-0.3125,0.5,0.5,-0.5,-0.3125,0.625,-0.3125,0.625,0.3125,0.3125,0.625,0.2125,0.3125,0.625,0.3125,0.1125,0.625,-0.2875,0.3125,0.625,-0.1875,0.3125,0.625,-0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.5,0.5,0.5,0.625,0.3125,-0.3125,0.5,0.5,-0.5,0.625,0.3125,0.1125,0.625,0.3125,0.3125,0.625,0.2125,0.3125,0.5164,-0.1875,0.3125,0.625,-0.1875,0.3125,0.425,-0.0961,0.3125,0.425,0.1211,0.3125,0.5164,0.2125,0.3125,-0.425,-0.0961,0.3125,-0.625,-0.1875,0.3125,-0.5164,-0.1875,0.3125,-0.625,0.2125,0.3125,-0.425,0.1211,0.3125,-0.5164,0.2125,0.3125,0.5,-0.375,0.5,0.3125,-0.3125,0.625,0.4531,-0.4531,0.5313,0.5,0.375,0.5,0.3125,0.3125,0.625,0.4531,0.4531,0.5313,-0.3125,-0.3125,0.625,-0.5,-0.375,0.5,-0.4531,-0.4531,0.5313,-0.5,0.375,0.5,-0.3125,0.3125,0.625,-0.4531,0.4531,0.5313,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.625,0.375,-0.5,0.5,-0.4531,-0.4531,0.5313,-0.375,-0.5,0.5,0.4531,-0.4531,0.5313,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,0.4531,0.4531,0.5313,-0.3125,0.3125,0.625,0.3125,0.3125,0.625,-0.4531,0.4531,0.5313,0.375,0.5,0.5,-0.375,0.5,0.5],
    normals: [-0.5774,0.5774,0.5774,-0.3015,0.3015,0.9045,0,0.7945,0.6072,0.3015,-0.3015,0.9045,0,-0.7945,0.6072,0.5774,-0.5774,0.5774,-0.5774,0.5774,0.5774,-0.7945,0,0.6072,-0.3015,0.3015,0.9045,-0.7945,0,0.6072,-0.5774,-0.5774,0.5774,-0.3015,-0.3015,0.9045,-0.3015,-0.3015,0.9045,-0.5774,-0.5774,0.5774,0,-0.7945,0.6072,0.7945,0,0.6072,0.3015,-0.3015,0.9045,0.5774,-0.5774,0.5774,0.5774,0.5774,0.5774,0.3015,0.3015,0.9045,0.7945,0,0.6072,0,0.7945,0.6072,0.3015,0.3015,0.9045,0.5774,0.5774,0.5774,0,-0.7945,0.6072,0.2232,-0.9489,0.2232,0.5774,-0.5774,0.5774,0,-0.7945,0.6072,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,0.5774,-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,0.5774,-0.5774,0.5774,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,-0.5774,-0.5774,0.5774,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,-0.5774,0.9489,0.2232,0.2232,0.9571,0,0.2898,0.9571,0,0.2898,0.9571,0,0.2898,0.9489,-0.2232,0.2232,0.5774,0.5774,0.5774,0.7945,0,0.6072,0.7945,0,0.6072,0.5774,-0.5774,0.5774,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,-0.2232,0.5774,0.5774,0.5774,0.5774,0.5774,-0.5774,0.2232,0.9489,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9571,0.2898,0,-0.9571,0,0.2898,-0.9571,0,0.2898,-0.9571,0,0.2898,-0.9489,0.2232,0.2232,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.2232,0.9489,0.2232,0,0.7945,0.6072,0.5774,0.5774,0.5774,0,0.8321,0.5547,-0.2232,0.9489,0.2232,0,0.8321,0.5547,0,0.7945,0.6072,-0.5774,0.5774,0.5774,0.9489,-0.2232,-0.2232,0.5774,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9571,0,0.2898,-0.9571,0,0.2898,-0.9571,0,0.2898,-0.9489,0.2232,0.2232,-0.5774,-0.5774,0.5774,-0.7945,0,0.6072,-0.7945,0,0.6072,-0.5774,0.5774,0.5774,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,-0.9489,0.2232,-0.2232,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.9571,0.2898,0,-0.9489,0.2232,0.2232,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,-0.2232,0.9489,-0.2232,-0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,0.5774,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,0.9489,0.2232,0.2232,0.9571,0,0.2898,0.9571,0.2898,0,0.9571,0,0.2898,0.9571,0,0.2898,0.9489,-0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.5774,0.5774,0.5774,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9571,0.2898,0,0.9489,0.2232,0.2232,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0.5547,0,0.8321,0.2232,-0.2232,0.9489,0.3015,-0.3015,0.9045,0.5547,0,0.8321,0.2232,0.2232,0.9489,0.3015,0.3015,0.9045,-0.2232,-0.2232,0.9489,-0.5547,0,0.8321,-0.3015,-0.3015,0.9045,-0.5547,0,0.8321,-0.2232,0.2232,0.9489,-0.3015,0.3015,0.9045,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,0,-0.5547,0.8321,-0.3015,-0.3015,0.9045,0,-0.5547,0.8321,0.3015,-0.3015,0.9045,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,0.3015,0.3015,0.9045,-0.2232,0.2232,0.9489,0.2232,0.2232,0.9489,-0.3015,0.3015,0.9045,0,0.5547,0.8321,0,0.5547,0.8321],
    indices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,25,24,27,25,27,28,28,27,29,30,31,32,31,30,33,34,35,36,35,34,37,38,39,40,39,38,41,42,43,44,43,42,45,46,47,48,47,46,49,50,51,52,51,50,53,54,55,56,55,54,57,57,54,58,58,54,59,58,59,60,60,59,61,62,58,60,63,64,65,64,63,66,67,68,69,68,67,70,71,72,73,72,71,74,74,71,75,76,74,75,76,75,77,74,76,78,79,80,81,80,79,82,83,84,85,84,83,86,87,88,89,88,87,90,90,87,91,90,91,92,92,91,93,93,91,94,95,96,97,96,95,98,99,100,101,100,99,102,102,99,103,103,99,104,103,104,105,105,104,106,107,103,105,108,109,110,109,108,111,112,113,114,113,112,115,113,115,116,117,118,119,118,117,120,121,122,123,122,121,124,125,126,127,126,125,128,129,130,131,130,129,132,133,134,135,134,133,136,137,138,139,138,137,140,141,142,143,142,141,144,145,146,147,148,147,146,148,146,149,150,147,148,151,147,150,147,151,152,153,154,155,154,153,156,156,153,157,158,159,160,159,158,161,161,158,162,162,158,163,164,165,166,165,164,167,167,164,168,167,168,169,170,171,172,171,170,173,171,173,174,174,173,175,176,177,178,177,176,179,179,176,180,179,180,181,182,183,184,183,182,185,186,187,188,187,186,189,187,189,190,190,189,191,192,193,194,193,192,195,195,192,196,195,196,197],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "box-34",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.315,
      aspect: [1, 1, 0.650794],
      size: [0.315, 0.315, 0.205],
    },
    attachment: {
      axis: "y", dir: 1, n: 2,
      sunkUnitsMin: 0.245, sunkUnitsMean: 0.245, sunkUnitsMax: 0.245,
      sunkFractionMin: 0.777778, sunkFractionMean: 0.777778, sunkFractionMax: 0.777778,
    },
    roles: ["ear"],
    tris: 116,
    verts: 216,
    triVariants: [116],
    size: [0.315, 0.315, 0.205],
    offset: [0.4475, 1.34375, 0.3475],
    provenance: [
      { species: "panda", node: "body", ordinal: 0, role: "ear", name: "ear-right" },
      { species: "panda", node: "body", ordinal: 1, role: "ear", name: "ear-left" },
    ],
    positions: [0.0916,-0.0529,-0.1025,0.1575,0,-0.0525,0.1364,-0.0787,-0.0525,0.1057,0,-0.1025,0.0529,0.0916,-0.1025,0.1364,0.0788,-0.0525,0.0916,0.0529,-0.1025,0.0787,0.1364,-0.0525,-0.1364,-0.0787,-0.0525,-0.0529,-0.0916,-0.1025,-0.0788,-0.1364,-0.0525,-0.0916,-0.0529,-0.1025,-0.0529,-0.0916,-0.1025,0.0529,-0.0916,-0.1025,0,-0.1057,-0.1025,0.0916,-0.0529,-0.1025,-0.0916,-0.0529,-0.1025,0.1057,0,-0.1025,-0.1057,0,-0.1025,-0.0916,0.0529,-0.1025,0.0916,0.0529,-0.1025,-0.0529,0.0916,-0.1025,0.0529,0.0916,-0.1025,0,0.1057,-0.1025,-0.0788,0.1364,-0.0525,0,0.1057,-0.1025,-0.0529,0.0916,-0.1025,0,0.1575,-0.0525,-0.1575,0,-0.0525,-0.0916,0.0529,-0.1025,-0.1057,0,-0.1025,-0.1364,0.0788,-0.0525,0,0.1057,-0.1025,0.0787,0.1364,-0.0525,0.0529,0.0916,-0.1025,0,0.1575,-0.0525,-0.1575,0,-0.0525,-0.0916,-0.0529,-0.1025,-0.1364,-0.0787,-0.0525,-0.1057,0,-0.1025,-0.1364,0.0788,-0.0525,-0.0529,0.0916,-0.1025,-0.0916,0.0529,-0.1025,-0.0788,0.1364,-0.0525,-0.0788,-0.1364,-0.0525,0,-0.1057,-0.1025,0,-0.1575,-0.0525,-0.0529,-0.0916,-0.1025,0,-0.1057,-0.1025,0.0787,-0.1364,-0.0525,0,-0.1575,-0.0525,0.0529,-0.0916,-0.1025,0.0529,-0.0916,-0.1025,0.1364,-0.0787,-0.0525,0.0787,-0.1364,-0.0525,0.0916,-0.0529,-0.1025,0.0916,0.0529,-0.1025,0.1575,0,-0.0525,0.1057,0,-0.1025,0.1364,0.0788,-0.0525,0.1575,0,0.0525,0.1364,-0.0787,-0.0525,0.1575,0,-0.0525,0.1364,-0.0787,0.0525,0.0787,-0.1364,0.0525,0.1364,-0.0787,-0.0525,0.1364,-0.0787,0.0525,0.0787,-0.1364,-0.0525,-0.0788,-0.1364,0.0525,0,-0.1575,-0.0525,0,-0.1575,0.0525,-0.0788,-0.1364,-0.0525,-0.0788,0.1364,-0.0525,0,0.1575,0.0525,0,0.1575,-0.0525,-0.0788,0.1364,0.0525,0.1364,0.0788,0.0525,0.1575,0,-0.0525,0.1364,0.0788,-0.0525,0.1575,0,0.0525,0.0787,0.1364,0.0525,0.1364,0.0788,-0.0525,0.0787,0.1364,-0.0525,0.1364,0.0788,0.0525,-0.1364,0.0788,-0.0525,-0.0788,0.1364,0.0525,-0.0788,0.1364,-0.0525,-0.1364,0.0788,0.0525,-0.1364,-0.0787,0.0525,-0.0788,-0.1364,-0.0525,-0.0788,-0.1364,0.0525,-0.1364,-0.0787,-0.0525,-0.1364,-0.0787,-0.0525,-0.1575,0,0.0525,-0.1575,0,-0.0525,-0.1364,-0.0787,0.0525,-0.1575,0,-0.0525,-0.1364,0.0788,0.0525,-0.1364,0.0788,-0.0525,-0.1575,0,0.0525,0,-0.1575,0.0525,0.0787,-0.1364,-0.0525,0.0787,-0.1364,0.0525,0,-0.1575,-0.0525,0,0.1575,-0.0525,0.0787,0.1364,0.0525,0.0787,0.1364,-0.0525,0,0.1575,0.0525,0.0349,-0.0604,0.0775,-0.0349,-0.0604,0.0775,0,-0.0698,0.0775,0.0604,-0.0349,0.0775,-0.0604,-0.0349,0.0775,0.0698,0,0.0775,-0.0698,0,0.0775,0.0604,0.0349,0.0775,-0.0604,0.0349,0.0775,-0.0349,0.0604,0.0775,0.0349,0.0604,0.0775,0,0.0698,0.0775,-0.0604,-0.0349,0.0775,-0.1057,0,0.1025,-0.0916,-0.0529,0.1025,-0.0698,0,0.0775,-0.0349,-0.0604,0.0775,-0.0916,-0.0529,0.1025,-0.0529,-0.0916,0.1025,-0.0604,-0.0349,0.0775,0,-0.0698,0.0775,-0.0529,-0.0916,0.1025,0,-0.1057,0.1025,-0.0349,-0.0604,0.0775,-0.0349,0.0604,0.0775,-0.0916,0.0529,0.1025,-0.0604,0.0349,0.0775,-0.0529,0.0916,0.1025,-0.0604,0.0349,0.0775,-0.1057,0,0.1025,-0.0698,0,0.0775,-0.0916,0.0529,0.1025,0,0.0698,0.0775,-0.0529,0.0916,0.1025,-0.0349,0.0604,0.0775,0,0.1057,0.1025,0.0529,-0.0916,0.1025,0,-0.0698,0.0775,0,-0.1057,0.1025,0.0349,-0.0604,0.0775,0.0916,-0.0529,0.1025,0.0349,-0.0604,0.0775,0.0529,-0.0916,0.1025,0.0604,-0.0349,0.0775,0.1057,0,0.1025,0.0604,-0.0349,0.0775,0.0916,-0.0529,0.1025,0.0698,0,0.0775,0.1057,0,0.1025,0.0604,0.0349,0.0775,0.0698,0,0.0775,0.0916,0.0529,0.1025,0.0916,0.0529,0.1025,0.0349,0.0604,0.0775,0.0604,0.0349,0.0775,0.0529,0.0916,0.1025,0.0529,0.0916,0.1025,0,0.0698,0.0775,0.0349,0.0604,0.0775,0,0.1057,0.1025,0.1364,-0.0787,0.0525,0.0529,-0.0916,0.1025,0.0787,-0.1364,0.0525,0.0916,-0.0529,0.1025,0.1364,0.0788,0.0525,0.0529,0.0916,0.1025,0.0916,0.0529,0.1025,0.0787,0.1364,0.0525,0.0787,-0.1364,0.0525,0,-0.1057,0.1025,0,-0.1575,0.0525,0.0529,-0.0916,0.1025,-0.0529,0.0916,0.1025,-0.1364,0.0788,0.0525,-0.0916,0.0529,0.1025,-0.0788,0.1364,0.0525,-0.1057,0,0.1025,-0.1364,0.0788,0.0525,-0.1575,0,0.0525,-0.0916,0.0529,0.1025,0.0787,0.1364,0.0525,0,0.1057,0.1025,0.0529,0.0916,0.1025,0,0.1575,0.0525,-0.0529,-0.0916,0.1025,-0.1364,-0.0787,0.0525,-0.0788,-0.1364,0.0525,-0.0916,-0.0529,0.1025,-0.0916,-0.0529,0.1025,-0.1575,0,0.0525,-0.1364,-0.0787,0.0525,-0.1057,0,0.1025,0.1575,0,0.0525,0.0916,-0.0529,0.1025,0.1364,-0.0787,0.0525,0.1057,0,0.1025,0,-0.1057,0.1025,-0.0788,-0.1364,0.0525,0,-0.1575,0.0525,-0.0529,-0.0916,0.1025,0,0.1057,0.1025,-0.0788,0.1364,0.0525,-0.0529,0.0916,0.1025,0,0.1575,0.0525,0.1364,0.0788,0.0525,0.1057,0,0.1025,0.1575,0,0.0525,0.0916,0.0529,0.1025],
    normals: [0.3687,-0.2129,-0.9049,0.9293,0,-0.3692,0.8048,-0.4647,-0.3692,0.4257,0,-0.9049,0.2129,0.3687,-0.9049,0.8048,0.4647,-0.3692,0.3687,0.2129,-0.9049,0.4647,0.8048,-0.3692,-0.8048,-0.4647,-0.3692,-0.2129,-0.3687,-0.9049,-0.4647,-0.8048,-0.3692,-0.3687,-0.2129,-0.9049,-0.2129,-0.3687,-0.9049,0.2129,-0.3687,-0.9049,0,-0.4257,-0.9049,0.3687,-0.2129,-0.9049,-0.3687,-0.2129,-0.9049,0.4257,0,-0.9049,-0.4257,0,-0.9049,-0.3687,0.2129,-0.9049,0.3687,0.2129,-0.9049,-0.2129,0.3687,-0.9049,0.2129,0.3687,-0.9049,0,0.4257,-0.9049,-0.4647,0.8048,-0.3692,0,0.4257,-0.9049,-0.2129,0.3687,-0.9049,0,0.9293,-0.3692,-0.9293,0,-0.3692,-0.3687,0.2129,-0.9049,-0.4257,0,-0.9049,-0.8048,0.4647,-0.3692,0,0.4257,-0.9049,0.4647,0.8048,-0.3692,0.2129,0.3687,-0.9049,0,0.9293,-0.3692,-0.9293,0,-0.3692,-0.3687,-0.2129,-0.9049,-0.8048,-0.4647,-0.3692,-0.4257,0,-0.9049,-0.8048,0.4647,-0.3692,-0.2129,0.3687,-0.9049,-0.3687,0.2129,-0.9049,-0.4647,0.8048,-0.3692,-0.4647,-0.8048,-0.3692,0,-0.4257,-0.9049,0,-0.9293,-0.3692,-0.2129,-0.3687,-0.9049,0,-0.4257,-0.9049,0.4647,-0.8048,-0.3692,0,-0.9293,-0.3692,0.2129,-0.3687,-0.9049,0.2129,-0.3687,-0.9049,0.8048,-0.4647,-0.3692,0.4647,-0.8048,-0.3692,0.3687,-0.2129,-0.9049,0.3687,0.2129,-0.9049,0.9293,0,-0.3692,0.4257,0,-0.9049,0.8048,0.4647,-0.3692,0.9293,0,0.3692,0.8048,-0.4647,-0.3692,0.9293,0,-0.3692,0.8048,-0.4647,0.3692,0.4647,-0.8048,0.3692,0.8048,-0.4647,-0.3692,0.8048,-0.4647,0.3692,0.4647,-0.8048,-0.3692,-0.4647,-0.8048,0.3692,0,-0.9293,-0.3692,0,-0.9293,0.3692,-0.4647,-0.8048,-0.3692,-0.4647,0.8048,-0.3692,0,0.9293,0.3692,0,0.9293,-0.3692,-0.4647,0.8048,0.3692,0.8048,0.4647,0.3692,0.9293,0,-0.3692,0.8048,0.4647,-0.3692,0.9293,0,0.3692,0.4647,0.8048,0.3692,0.8048,0.4647,-0.3692,0.4647,0.8048,-0.3692,0.8048,0.4647,0.3692,-0.8048,0.4647,-0.3692,-0.4647,0.8048,0.3692,-0.4647,0.8048,-0.3692,-0.8048,0.4647,0.3692,-0.8048,-0.4647,0.3692,-0.4647,-0.8048,-0.3692,-0.4647,-0.8048,0.3692,-0.8048,-0.4647,-0.3692,-0.8048,-0.4647,-0.3692,-0.9293,0,0.3692,-0.9293,0,-0.3692,-0.8048,-0.4647,0.3692,-0.9293,0,-0.3692,-0.8048,0.4647,0.3692,-0.8048,0.4647,-0.3692,-0.9293,0,0.3692,0,-0.9293,0.3692,0.4647,-0.8048,-0.3692,0.4647,-0.8048,0.3692,0,-0.9293,-0.3692,0,0.9293,-0.3692,0.4647,0.8048,0.3692,0.4647,0.8048,-0.3692,0,0.9293,0.3692,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0.4944,0.2855,0.821,0.5709,0,0.821,0.4944,0.2855,0.821,0.5709,0,0.821,0.2855,0.4944,0.821,0.4944,0.2855,0.821,0.2855,0.4944,0.821,0.4944,0.2855,0.821,0,0.5709,0.821,0.2855,0.4944,0.821,0,0.5709,0.821,0.2855,0.4944,0.821,0.2855,-0.4944,0.821,0.4944,-0.2855,0.821,0.4944,-0.2855,0.821,0.2855,-0.4944,0.821,0.4944,-0.2855,0.821,0.5709,0,0.821,0.5709,0,0.821,0.4944,-0.2855,0.821,0,-0.5709,0.821,0.2855,-0.4944,0.821,0.2855,-0.4944,0.821,0,-0.5709,0.821,-0.2855,0.4944,0.821,0,0.5709,0.821,0,0.5709,0.821,-0.2855,0.4944,0.821,-0.4944,0.2855,0.821,-0.2855,0.4944,0.821,-0.2855,0.4944,0.821,-0.4944,0.2855,0.821,-0.5709,0,0.821,-0.4944,0.2855,0.821,-0.4944,0.2855,0.821,-0.5709,0,0.821,-0.5709,0,0.821,-0.4944,-0.2855,0.821,-0.5709,0,0.821,-0.4944,-0.2855,0.821,-0.4944,-0.2855,0.821,-0.2855,-0.4944,0.821,-0.4944,-0.2855,0.821,-0.2855,-0.4944,0.821,-0.2855,-0.4944,0.821,0,-0.5709,0.821,-0.2855,-0.4944,0.821,0,-0.5709,0.821,0.8048,-0.4647,0.3692,0.3474,-0.6017,0.7193,0.4647,-0.8048,0.3692,0.6017,-0.3474,0.7193,0.8048,0.4647,0.3692,0.3474,0.6017,0.7193,0.6017,0.3474,0.7193,0.4647,0.8048,0.3692,0.4647,-0.8048,0.3692,0,-0.6947,0.7193,0,-0.9293,0.3692,0.3474,-0.6017,0.7193,-0.3474,0.6017,0.7193,-0.8048,0.4647,0.3692,-0.6017,0.3474,0.7193,-0.4647,0.8048,0.3692,-0.6947,0,0.7193,-0.8048,0.4647,0.3692,-0.9293,0,0.3692,-0.6017,0.3474,0.7193,0.4647,0.8048,0.3692,0,0.6947,0.7193,0.3474,0.6017,0.7193,0,0.9293,0.3692,-0.3474,-0.6017,0.7193,-0.8048,-0.4647,0.3692,-0.4647,-0.8048,0.3692,-0.6017,-0.3474,0.7193,-0.6017,-0.3474,0.7193,-0.9293,0,0.3692,-0.8048,-0.4647,0.3692,-0.6947,0,0.7193,0.9293,0,0.3692,0.6017,-0.3474,0.7193,0.8048,-0.4647,0.3692,0.6947,0,0.7193,0,-0.6947,0.7193,-0.4647,-0.8048,0.3692,0,-0.9293,0.3692,-0.3474,-0.6017,0.7193,0,0.6947,0.7193,-0.4647,0.8048,0.3692,-0.3474,0.6017,0.7193,0,0.9293,0.3692,0.8048,0.4647,0.3692,0.6947,0,0.7193,0.9293,0,0.3692,0.6017,0.3474,0.7193],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,15,12,16,15,16,17,17,16,18,17,18,19,17,19,20,20,19,21,20,21,22,22,21,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,109,111,112,112,111,113,112,113,114,114,113,115,114,115,116,116,115,117,117,115,118,117,118,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167,168,169,170,169,168,171,172,173,174,173,172,175,176,177,178,177,176,179,180,181,182,181,180,183,184,185,186,185,184,187,188,189,190,189,188,191,192,193,194,193,192,195,196,197,198,197,196,199,200,201,202,201,200,203,204,205,206,205,204,207,208,209,210,209,208,211,212,213,214,213,212,215],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-35",
    shape: {
      form: "box", taper: 1, symmetry: "radial", longest: 1.343347,
      aspect: [1, 1, 0.37037],
      size: [1.343347, 1.343347, 0.497536],
    },
    attachment: {
      axis: "z", dir: -1, n: 1,
      sunkUnitsMin: 0.497536, sunkUnitsMean: 0.497536, sunkUnitsMax: 0.497536,
      sunkFractionMin: 1, sunkFractionMean: 1, sunkFractionMax: 1,
    },
    roles: ["band"],
    tris: 92,
    verts: 48,
    triVariants: [92],
    size: [1.343347, 1.343347, 0.497536],
    offset: [0, 0.80625, -0.2725],
    provenance: [
      { species: "panda", node: "body", ordinal: 2, role: "band", name: "rump-shell (torso shell-ring)" },
    ],
    positions: [0.311,0.6219,-0.2488,-0.4975,0.4975,-0.2488,-0.311,0.6219,-0.2488,-0.326,0.6717,-0.1891,-0.5334,0.5334,-0.1891,0.4975,0.4975,-0.2488,0.326,0.6717,-0.1891,0.5334,0.5334,-0.1891,0.326,0.6717,0.1891,0.5334,0.5334,0.1891,0.6717,0.326,-0.1891,-0.326,0.6717,0.1891,0.6219,0.311,-0.2488,0.311,0.6219,0.2488,-0.5334,0.5334,0.1891,-0.311,0.6219,0.2488,-0.4975,0.4975,0.2488,0.4975,0.4975,0.2488,-0.6717,0.326,0.1891,-0.6717,0.326,-0.1891,0.6717,0.326,0.1891,0.6219,0.311,0.2488,-0.6219,0.311,-0.2488,-0.6219,-0.311,-0.2488,0.6219,-0.311,-0.2488,0.6717,-0.326,-0.1891,-0.6219,0.311,0.2488,-0.6219,-0.311,0.2488,-0.6717,-0.326,0.1891,0.6219,-0.311,0.2488,0.6717,-0.326,0.1891,0.4975,-0.4975,-0.2488,-0.6717,-0.326,-0.1891,0.4975,-0.4975,0.2488,0.5334,-0.5334,-0.1891,-0.4975,-0.4975,-0.2488,-0.4975,-0.4975,0.2488,0.5334,-0.5334,0.1891,-0.5334,-0.5334,0.1891,0.311,-0.6219,0.2488,-0.311,-0.6219,0.2488,0.326,-0.6717,0.1891,0.311,-0.6219,-0.2488,-0.5334,-0.5334,-0.1891,-0.326,-0.6717,0.1891,0.326,-0.6717,-0.1891,-0.311,-0.6219,-0.2488,-0.326,-0.6717,-0.1891],
    normals: [0.1549,0.5116,-0.8452,-0.3695,0.3695,-0.8526,-0.1549,0.5116,-0.8452,-0.2803,0.9258,-0.2538,-0.6831,0.6831,-0.2582,0.3695,0.3695,-0.8526,0.2803,0.9258,-0.2538,0.6831,0.6831,-0.2582,0.2803,0.9258,0.2538,0.6831,0.6831,0.2582,0.9258,0.2803,-0.2538,-0.2803,0.9258,0.2538,0.5116,0.1549,-0.8452,0.1549,0.5116,0.8452,-0.6831,0.6831,0.2582,-0.1549,0.5116,0.8452,-0.3695,0.3695,0.8526,0.3695,0.3695,0.8526,-0.9258,0.2803,0.2538,-0.9258,0.2803,-0.2538,0.9258,0.2803,0.2538,0.5116,0.1549,0.8452,-0.5116,0.1549,-0.8452,-0.5116,-0.1549,-0.8452,0.5116,-0.1549,-0.8452,0.9258,-0.2803,-0.2538,-0.5116,0.1549,0.8452,-0.5116,-0.1549,0.8452,-0.9258,-0.2803,0.2538,0.5116,-0.1549,0.8452,0.9258,-0.2803,0.2538,0.3695,-0.3695,-0.8526,-0.9258,-0.2803,-0.2538,0.3695,-0.3695,0.8526,0.6831,-0.6831,-0.2582,-0.3695,-0.3695,-0.8526,-0.3695,-0.3695,0.8526,0.6831,-0.6831,0.2582,-0.6831,-0.6831,0.2582,0.1549,-0.5116,0.8452,-0.1549,-0.5116,0.8452,0.2803,-0.9258,0.2538,0.1549,-0.5116,-0.8452,-0.6831,-0.6831,-0.2582,-0.2803,-0.9258,0.2538,0.2803,-0.9258,-0.2538,-0.1549,-0.5116,-0.8452,-0.2803,-0.9258,-0.2538],
    indices: [0,1,2,3,0,2,4,2,1,2,4,3,5,1,0,0,3,6,0,7,5,7,0,6,3,8,6,6,9,7,9,6,8,10,5,7,9,10,7,8,3,11,4,11,3,12,1,5,5,10,12,13,9,8,11,13,8,11,4,14,13,11,15,14,15,11,16,13,15,15,14,16,9,13,17,16,17,13,4,18,14,18,16,14,1,19,4,18,4,19,17,20,9,10,9,20,16,21,17,20,17,21,19,1,22,12,22,1,12,23,22,23,19,22,10,24,12,24,23,12,24,10,25,20,25,10,16,18,26,26,21,16,18,27,26,27,21,26,19,28,18,27,18,28,29,20,21,27,29,21,20,29,30,25,20,30,25,31,24,31,23,24,19,23,32,28,19,32,27,33,29,33,30,29,30,34,25,31,25,34,31,35,23,35,32,23,28,36,27,36,33,27,30,33,37,34,30,37,32,38,28,36,28,38,36,39,33,39,37,33,39,36,40,38,40,36,37,39,41,40,41,39,41,34,37,34,42,31,42,35,31,32,35,43,38,32,43,41,40,44,40,38,44,34,41,45,42,34,45,44,45,41,35,42,46,46,43,35,45,46,42,38,47,44,47,38,43,43,46,47,45,44,47,46,45,47],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "box-36",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.25,
      aspect: [1, 1, 1],
      size: [1.25, 1.25, 1.25],
    },
    attachment: null,
    roles: ["hull"],
    tris: 72,
    verts: 112,
    triVariants: [72],
    size: [1.25, 1.25, 1.25],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "panda", node: "body", ordinal: 3, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [0.5,-0.2797,0.5,0.3125,-0.3125,0.625,0.5,-0.5,0.5,-0.5,-0.2797,0.5,-0.5,-0.5,0.5,-0.3125,-0.3125,0.625,0.5,-0.2797,0.5,0.625,-0.3125,0.3125,0.625,-0.0992,0.3125,0.5,-0.5,0.5,0.3125,0.625,-0.3125,0.5,0.5,0.2701,0.5,0.5,-0.5,0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,-0.5,0.5,0.2701,-0.3125,0.625,0.3125,-0.5,0.5,-0.5,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,-0.625,-0.3125,0.3125,-0.5,-0.2797,0.5,-0.625,-0.0992,0.3125,-0.5,-0.5,0.5,0.3125,-0.625,-0.3125,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.3125,-0.625,-0.3125,0.625,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.625,-0.0992,0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.5,-0.5,0.5,-0.625,-0.3125,-0.3125,-0.5,-0.5,-0.5,-0.625,-0.3125,0.3125,0.625,0.3125,-0.3125,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.625,-0.3125,-0.3125,-0.625,0.3125,-0.3125,-0.5,0.5,0.2701,-0.5,0.5,-0.5,-0.625,0.3125,0.3125,-0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.625,0.3125,-0.3125,-0.5,0.5,-0.5,0.3125,0.625,-0.3125,0.5,0.5,-0.5,-0.3125,0.625,-0.3125,0.5,0.5,0.2701,0.625,0.3125,-0.3125,0.5,0.5,-0.5,0.625,0.3125,0.3125,-0.5,-0.5,0.5,0.3125,-0.625,0.3125,0.5,-0.5,0.5,-0.3125,-0.625,0.3125,0.3125,-0.3125,0.625,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.3125,-0.3125,0.625,0.625,-0.3125,-0.3125,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.625,-0.3125,0.3125,0.5,-0.5,0.5,0.3125,-0.625,-0.3125,0.5,-0.5,-0.5,0.3125,-0.625,0.3125,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,-0.0992,0.3125,-0.625,0.3125,0.3125,-0.5,-0.5,0.5,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,-0.5,-0.5,-0.5,-0.5,-0.2797,0.5,-0.625,0.3125,0.3125,-0.625,-0.0992,0.3125,-0.5,0.5,0.5,-0.5,0.5,0.2701,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,0.5,0.5,0.5,0.5,0.5,0.2701,0.625,0.3125,0.3125,0.625,-0.0992,0.3125,0.5,-0.2797,0.5,-0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,-0.3125,0.625,-0.5,0.5,-0.5,-0.3125,-0.3125,-0.625,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,0.3125,-0.3125,-0.625,0.5,0.5,-0.5,-0.3125,0.3125,-0.625,0.3125,0.3125,-0.625],
    normals: [0.7379,0,0.6749,0.1599,-0.4319,0.8877,0.5774,-0.5774,0.5774,-0.7379,0,0.6749,-0.5774,-0.5774,0.5774,-0.1599,-0.4319,0.8877,0.7379,0,0.6749,0.9489,-0.2232,0.2232,0.9919,0,0.1268,0.5774,-0.5774,0.5774,0.2232,0.9489,-0.2232,0.7071,0.7071,0,0.5774,0.5774,-0.5774,0.2715,0.9624,0,-0.2232,0.9489,-0.2232,-0.7071,0.7071,0,-0.2715,0.9624,0,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,-0.2715,0.9624,0,0.2715,0.9624,0,-0.2232,0.9489,-0.2232,-0.9489,-0.2232,0.2232,-0.7379,0,0.6749,-0.9919,0,0.1268,-0.5774,-0.5774,0.5774,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,0.9624,0.2715,0,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9919,0,0.1268,-0.2232,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.5774,-0.5774,0.5774,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.2232,-0.7071,0.7071,0,-0.5774,0.5774,-0.5774,-0.9624,0.2715,0,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,0.7071,0.7071,0,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9624,0.2715,0,-0.5774,-0.5774,0.5774,0.2232,-0.9489,0.2232,0.5774,-0.5774,0.5774,-0.2232,-0.9489,0.2232,0.1599,-0.4319,0.8877,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.1599,-0.4319,0.8877,0.9489,-0.2232,-0.2232,0.5774,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,0.5774,-0.5774,0.5774,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9919,0,0.1268,-0.9624,0.2715,0,-0.5774,-0.5774,0.5774,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,-0.5774,-0.6614,0,0.75,-0.889,0.1658,0.4268,-0.8321,0,0.5547,-0.5774,0.5774,0.5774,-0.7071,0.7071,0,-0.1658,0.889,0.4268,0.1658,0.889,0.4268,0.5774,0.5774,0.5774,0.7071,0.7071,0,0.889,0.1658,0.4268,0.8321,0,0.5547,0.6614,0,0.75,-0.2232,0.2232,0.9489,-0.2758,0,0.9612,0.2232,0.2232,0.9489,0.2758,0,0.9612,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.2232,0.2232,-0.9489],
    indices: [0,1,2,3,4,5,6,7,8,7,6,9,10,11,12,11,10,13,14,15,16,15,14,17,18,19,20,19,18,21,22,23,24,23,22,25,26,27,28,27,26,29,30,31,32,31,30,33,33,30,34,35,36,37,36,35,38,39,40,41,40,39,42,43,44,45,44,43,46,47,48,49,48,47,50,51,52,53,52,51,54,55,56,57,56,55,58,59,60,61,60,59,62,63,64,65,64,63,66,67,68,69,68,67,70,71,72,73,72,71,74,75,76,77,76,75,78,79,80,81,80,79,82,83,80,82,84,85,86,85,84,87,88,89,90,89,88,91,91,92,89,92,91,93,91,94,93,94,91,95,94,95,96,95,97,96,95,98,97,98,95,99,88,100,91,100,95,91,100,88,101,102,99,95,95,100,102,101,102,100,99,102,103,102,101,103,104,105,106,105,107,106,107,105,108,108,109,107,105,104,110,110,108,105,109,108,111,111,104,109,108,110,111,104,111,110],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "box-37",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.332,
      aspect: [1, 0.899825, 0.354699],
      size: [0.332, 0.298742, 0.11776],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 25,
    verts: 18,
    triVariants: [25],
    size: [0.332, 0.298742, 0.11776],
    offset: [0, 0.744379, 0.68388],
    provenance: [
      { species: "panda", node: "body", ordinal: 6, role: "nose", name: "nose-tip" },
    ],
    positions: [-0.166,-0.0369,-0.0589,-0.1174,0.0948,0.0589,-0.1174,0.0948,-0.0589,0,0.1494,-0.0589,0,0.1494,0.0589,0.1174,0.0948,-0.0589,0.1174,0.0948,0.0589,-0.166,-0.0369,0.0589,0.166,-0.0369,0.0589,0.166,-0.0369,-0.0589,0.1589,-0.1028,-0.0589,-0.1589,-0.1028,0.0589,-0.1589,-0.1028,-0.0589,-0.0968,-0.1494,-0.0589,0.1589,-0.1028,0.0589,-0.0968,-0.1494,0.0589,0.0968,-0.1494,-0.0589,0.0968,-0.1494,0.0589],
    normals: [-0.9925,0.1226,0,-0.5708,0.526,0.6305,-0.7354,0.6777,0,0,1,0,0,0.7819,0.6234,0.7354,0.6777,0,0.5708,0.526,0.6305,-0.7464,0.0922,0.6591,0.7464,0.0922,0.6591,0.9925,0.1226,0,0.869,-0.4947,0,-0.6767,-0.3852,0.6275,-0.869,-0.4947,0,-0.3162,-0.9487,0,0.6767,-0.3852,0.6275,-0.2423,-0.7271,0.6424,0.3162,-0.9487,0,0.2423,-0.7271,0.6424],
    indices: [0,1,2,1,3,2,3,1,4,4,5,3,1,6,4,5,4,6,1,0,7,7,6,1,8,5,6,7,8,6,5,8,9,8,10,9,0,11,7,11,8,7,11,0,12,13,11,12,10,8,14,11,14,8,11,13,15,15,14,11,16,15,13,17,10,14,14,15,17,15,16,17,10,17,16],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "box-38",
    shape: {
      form: "box", taper: 0.839147, symmetry: "mirror", longest: 0.912191,
      aspect: [1, 0.703936, 0.686127],
      size: [0.625879, 0.912191, 0.642124],
    },
    attachment: {
      axis: "z", dir: -1, n: 1,
      sunkUnitsMin: 0.173205, sunkUnitsMean: 0.173205, sunkUnitsMax: 0.173205,
      sunkFractionMin: 0.269738, sunkFractionMean: 0.269738, sunkFractionMax: 0.269738,
    },
    roles: ["tail"],
    tris: 48,
    verts: 78,
    triVariants: [48],
    size: [0.625879, 0.912191, 0.642124],
    offset: [0, 1.099846, -0.772857],
    provenance: [
      { species: "parrot", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [-0.085,-0.3561,0.3211,0.085,-0.4561,0.1479,0.085,-0.3561,0.3211,-0.085,-0.4561,0.1479,0.3129,0.1309,0.0399,-0.085,-0.3561,0.3211,0.085,-0.3561,0.3211,-0.3129,0.1309,0.0399,0.3016,0.2334,-0.0193,-0.3016,0.2334,-0.0193,0.146,0.2829,-0.0479,0.2324,0.2964,-0.0556,-0.146,0.2829,-0.0479,-0.2324,0.2964,-0.0556,0.1032,0.4054,-0.1186,-0.1032,0.4054,-0.1186,0,0.4561,-0.1479,-0.3129,0.0309,-0.1333,0.085,-0.4561,0.1479,-0.085,-0.4561,0.1479,0.3129,0.0309,-0.1333,-0.3016,0.1334,-0.1925,0.3016,0.1334,-0.1925,-0.146,0.1829,-0.2211,-0.2324,0.1964,-0.2289,0.146,0.1829,-0.2211,0.2324,0.1964,-0.2289,-0.1032,0.3054,-0.2918,0.1032,0.3054,-0.2918,0,0.3561,-0.3211,-0.3016,0.1334,-0.1925,-0.2324,0.2964,-0.0556,-0.2324,0.1964,-0.2289,-0.3016,0.2334,-0.0193,0.1032,0.4054,-0.1186,0.146,0.1829,-0.2211,0.1032,0.3054,-0.2918,0.146,0.2829,-0.0479,-0.146,0.1829,-0.2211,-0.1032,0.4054,-0.1186,-0.1032,0.3054,-0.2918,-0.146,0.2829,-0.0479,-0.3129,0.0309,-0.1333,-0.3016,0.2334,-0.0193,-0.3016,0.1334,-0.1925,-0.3129,0.1309,0.0399,-0.2324,0.1964,-0.2289,-0.146,0.2829,-0.0479,-0.146,0.1829,-0.2211,-0.2324,0.2964,-0.0556,0.3129,0.1309,0.0399,0.085,-0.4561,0.1479,0.3129,0.0309,-0.1333,0.085,-0.3561,0.3211,0.3016,0.2334,-0.0193,0.3129,0.0309,-0.1333,0.3016,0.1334,-0.1925,0.3129,0.1309,0.0399,0,0.3561,-0.3211,0.1032,0.4054,-0.1186,0.1032,0.3054,-0.2918,0,0.4561,-0.1479,0.2324,0.2964,-0.0556,0.3016,0.1334,-0.1925,0.2324,0.1964,-0.2289,0.3016,0.2334,-0.0193,-0.085,-0.4561,0.1479,-0.3129,0.1309,0.0399,-0.3129,0.0309,-0.1333,-0.085,-0.3561,0.3211,0.146,0.1829,-0.2211,0.2324,0.2964,-0.0556,0.2324,0.1964,-0.2289,0.146,0.2829,-0.0479,-0.1032,0.3054,-0.2918,0,0.4561,-0.1479,0,0.3561,-0.3211,-0.1032,0.4054,-0.1186],
    normals: [0,-0.866,0.5,0,-0.866,0.5,0,-0.866,0.5,0,-0.866,0.5,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,0.5,0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,0,-0.5,-0.866,-0.9097,0.3596,-0.2076,-0.3107,0.8232,-0.4753,-0.3107,0.8232,-0.4753,-0.9097,0.3596,-0.2076,0.7812,0.5406,-0.3121,0.9572,0.2507,-0.1447,0.7812,0.5406,-0.3121,0.9572,0.2507,-0.1447,-0.9572,0.2507,-0.1447,-0.7812,0.5406,-0.3121,-0.7812,0.5406,-0.3121,-0.9572,0.2507,-0.1447,-0.9896,-0.1248,0.0721,-0.9097,0.3596,-0.2076,-0.9097,0.3596,-0.2076,-0.9896,-0.1248,0.0721,-0.3107,0.8232,-0.4753,0.1775,0.8523,-0.4921,0.1775,0.8523,-0.4921,-0.3107,0.8232,-0.4753,0.9896,-0.1248,0.0721,0.9268,-0.3253,0.1878,0.9896,-0.1248,0.0721,0.9268,-0.3253,0.1878,0.9097,0.3596,-0.2076,0.9896,-0.1248,0.0721,0.9097,0.3596,-0.2076,0.9896,-0.1248,0.0721,0,0.866,-0.5,0.7812,0.5406,-0.3121,0.7812,0.5406,-0.3121,0,0.866,-0.5,0.3107,0.8232,-0.4753,0.9097,0.3596,-0.2076,0.3107,0.8232,-0.4753,0.9097,0.3596,-0.2076,-0.9268,-0.3253,0.1878,-0.9896,-0.1248,0.0721,-0.9896,-0.1248,0.0721,-0.9268,-0.3253,0.1878,-0.1775,0.8523,-0.4921,0.3107,0.8232,-0.4753,0.3107,0.8232,-0.4753,-0.1775,0.8523,-0.4921,-0.7812,0.5406,-0.3121,0,0.866,-0.5,0,0.866,-0.5,-0.7812,0.5406,-0.3121],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,7,4,8,7,8,9,9,8,10,10,8,11,12,9,10,9,12,13,14,12,10,12,14,15,15,14,16,17,18,19,18,17,20,20,17,21,20,21,22,22,21,23,23,21,24,25,22,23,22,25,26,27,25,23,25,27,28,28,27,29,30,31,32,31,30,33,34,35,36,35,34,37,38,39,40,39,38,41,42,43,44,43,42,45,46,47,48,47,46,49,50,51,52,51,50,53,54,55,56,55,54,57,58,59,60,59,58,61,62,63,64,63,62,65,66,67,68,67,66,69,70,71,72,71,70,73,74,75,76,75,74,77],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "box-39",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.25,
      aspect: [1, 1, 1],
      size: [1.25, 1.25, 1.25],
    },
    attachment: null,
    roles: ["hull"],
    tris: 80,
    verts: 130,
    triVariants: [80],
    size: [1.25, 1.25, 1.25],
    offset: [0, 0.80625, 0],
    provenance: [
      { species: "penguin", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [0.0781,0.3125,0.625,0.4259,0.4259,0.5494,0.2425,0.4259,0.5494,0.3125,0.3125,0.625,-0.3125,0.3125,0.625,0.4822,0.3218,0.5119,-0.0781,0.3125,0.625,-0.2425,0.4259,0.5494,-0.4259,0.4259,0.5494,-0.4822,0.3218,0.5119,-0.5,0.1791,0.5,0.5,0.1791,0.5,-0.3125,-0.3125,0.625,-0.5,-0.5,0.5,0.3125,-0.3125,0.625,0.5,-0.5,0.5,0.3125,-0.625,0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,-0.3125,-0.3125,-0.625,-0.3125,0.5,0.5,0.5,0.625,-0.3125,0.3125,0.625,0.3125,0.3125,0.5,-0.5,0.5,0.5,0.1791,0.5,-0.625,-0.3125,-0.3125,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.625,0.3125,-0.3125,-0.5,0.5,-0.5,-0.3125,-0.3125,-0.625,-0.5,-0.5,-0.5,-0.3125,0.3125,-0.625,-0.5,0.5,-0.5,0.3125,0.625,-0.3125,0.5,0.5,-0.5,-0.3125,0.625,-0.3125,0.3125,-0.625,-0.3125,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.3125,-0.625,-0.3125,0.5,0.5,0.5,0.625,0.3125,-0.3125,0.5,0.5,-0.5,0.625,0.3125,0.3125,0.5,-0.5,0.5,0.3125,-0.625,-0.3125,0.5,-0.5,-0.5,0.3125,-0.625,0.3125,0.3125,-0.3125,-0.625,0.5,0.5,-0.5,0.5,-0.5,-0.5,0.3125,0.3125,-0.625,-0.4822,0.3218,0.5119,-0.5,0.5,0.5,-0.5,0.1791,0.5,-0.4259,0.4259,0.5494,-0.625,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,0.3125,-0.3125,-0.5,0.5,0.5,-0.5,0.5,-0.5,-0.625,0.3125,0.3125,-0.3125,0.3125,-0.625,0.3125,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,0.3125,-0.625,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.2425,0.4259,0.5494,-0.0781,0.3125,0.625,0.0781,0.3125,0.625,-0.2425,0.4259,0.5494,0.4259,0.4259,0.5494,-0.4259,0.4259,0.5494,0.5,0.5,0.5,-0.5,0.5,0.5,0.3125,0.625,0.3125,-0.5,0.5,0.5,0.5,0.5,0.5,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,-0.5,0.5,0.5,-0.3125,0.625,0.3125,-0.5,0.5,-0.5,-0.5,0.5,-0.5,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.625,0.5,0.5,-0.5,0.5,0.5,0.5,0.4822,0.3218,0.5119,0.5,0.1791,0.5,0.4259,0.4259,0.5494,0.625,-0.3125,-0.3125,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.625,-0.3125,0.3125,-0.5,-0.5,0.5,-0.625,0.3125,0.3125,-0.625,-0.3125,0.3125,-0.5,0.5,0.5,-0.5,0.1791,0.5,-0.5,-0.5,0.5,-0.625,-0.3125,-0.3125,-0.5,-0.5,-0.5,-0.625,-0.3125,0.3125,-0.5,-0.5,0.5,-0.3125,-0.625,-0.3125,-0.3125,-0.625,0.3125,-0.5,-0.5,-0.5,0.625,0.3125,0.3125,0.625,-0.3125,-0.3125,0.625,0.3125,-0.3125,0.625,-0.3125,0.3125,0.625,0.3125,-0.3125,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.625,-0.3125,-0.3125,0.3125,0.625,-0.3125,0.5,0.5,0.5,0.5,0.5,-0.5,0.3125,0.625,0.3125,-0.3125,-0.3125,-0.625,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.3125,-0.3125,-0.625],
    normals: [0,0.1027,0.9947,0.374,0.2257,0.8995,0,0.5547,0.8321,0.2232,0.2232,0.9489,-0.2232,0.2232,0.9489,0.5547,0,0.8321,0,0.1027,0.9947,0,0.5547,0.8321,-0.374,0.2257,0.8995,-0.5547,0,0.8321,-0.5547,0,0.8321,0.5547,0,0.8321,-0.2232,-0.2232,0.9489,-0.2074,-0.5185,0.8296,0.2232,-0.2232,0.9489,0.2074,-0.5185,0.8296,0,-0.9398,0.3417,0,-0.9398,0.3417,0,-1,0,0,-1,0,0.5774,0.5774,0.5774,0.9489,-0.2232,0.2232,0.9489,0.2232,0.2232,0.8296,-0.5185,0.2074,0.8222,0,0.5691,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,0.3015,-0.9045,-0.3015,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.3015,-0.9045,-0.3015,0.5774,0.5774,0.5774,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9489,0.2232,0.2232,0.8296,-0.5185,0.2074,0.3015,-0.9045,-0.3015,0.5774,-0.5774,-0.5774,0.5547,-0.8321,0,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.5547,0,0.8321,-0.5774,0.5774,0.5774,-0.8222,0,0.5691,-0.2571,0.3448,0.9028,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.9489,0.2232,0.2232,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0,0.5547,0.8321,0,0.5547,0.8321,0,0.5547,0.8321,0,0.5547,0.8321,0.2571,0.3448,0.9028,-0.2571,0.3448,0.9028,0.5774,0.5774,0.5774,-0.5774,0.5774,0.5774,0.2232,0.9489,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,0.5774,0.5774,0.5547,0,0.8321,0.8222,0,0.5691,0.2571,0.3448,0.9028,0.9489,-0.2232,-0.2232,0.8296,-0.5185,0.2074,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,-0.8296,-0.5185,0.2074,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.5774,0.5774,0.5774,-0.8222,0,0.5691,-0.8296,-0.5185,0.2074,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,-0.8296,-0.5185,0.2074,-0.3015,-0.9045,-0.3015,-0.5547,-0.8321,0,-0.5774,-0.5774,-0.5774,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,0.2232,0.9489,-0.2232,0.5774,0.5774,0.5774,0.5774,0.5774,-0.5774,0.2232,0.9489,0.2232,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489],
    indices: [0,1,2,1,0,3,4,3,0,3,5,1,4,0,6,7,4,6,4,7,8,9,4,8,10,4,9,3,11,5,10,12,4,12,3,4,12,10,13,14,11,3,3,12,14,13,14,12,11,14,15,14,13,15,13,16,15,16,13,17,17,18,16,18,17,19,20,21,22,21,20,23,23,20,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,67,66,65,68,69,70,71,70,69,72,73,74,75,74,73,76,76,73,77,76,77,78,78,77,79,78,79,80,81,82,83,82,81,84,85,86,87,86,85,88,89,90,91,90,89,92,93,94,95,94,93,96,97,98,99,98,97,100,101,102,103,102,101,104,104,101,105,106,107,108,107,106,109,110,111,112,111,110,113,114,115,116,115,114,117,118,119,120,119,118,121,122,123,124,123,122,125,126,127,128,127,126,129],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "box-40",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.801778, 0.46],
      size: [0.4, 0.320711, 0.184],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 25,
    verts: 18,
    triVariants: [25],
    size: [0.4, 0.320711, 0.184],
    offset: [0, 0.733395, 0.717],
    provenance: [
      { species: "polar", node: "body", ordinal: 5, role: "nose", name: "nose" },
    ],
    positions: [-0.2,-0.0396,-0.092,-0.1414,0.1018,0.092,-0.1414,0.1018,-0.092,0,0.1604,-0.092,0,0.1604,0.092,0.1414,0.1018,-0.092,0.1414,0.1018,0.092,-0.2,-0.0396,0.092,-0.1914,-0.1104,0.092,-0.1914,-0.1104,-0.092,-0.1166,-0.1604,-0.092,0.2,-0.0396,0.092,0.2,-0.0396,-0.092,0.1914,-0.1104,-0.092,0.1914,-0.1104,0.092,0.1166,-0.1604,0.092,0.1166,-0.1604,-0.092,-0.1166,-0.1604,0.092],
    normals: [-0.9908,0.1356,0,-0.549,0.549,0.6303,-0.7071,0.7071,0,0,1,0,0,0.7764,0.6303,0.7071,0.7071,0,0.549,0.549,0.6303,-0.7494,0.1025,0.6542,-0.6656,-0.4092,0.6241,-0.8519,-0.5237,0,-0.2903,-0.9569,0,0.7494,0.1025,0.6542,0.9908,0.1356,0,0.8519,-0.5237,0,0.6656,-0.4092,0.6241,0.2213,-0.7295,0.6472,0.2903,-0.9569,0,-0.2213,-0.7295,0.6472],
    indices: [0,1,2,1,3,2,3,1,4,4,5,3,1,6,4,5,4,6,1,0,7,7,6,1,0,8,7,8,0,9,10,8,9,11,5,6,7,11,6,8,11,7,5,11,12,11,13,12,13,11,14,8,14,11,15,13,14,8,15,14,13,15,16,16,17,10,8,10,17,17,16,15,15,8,17],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "box-41",
    shape: {
      form: "box", taper: 1, symmetry: "mirror", longest: 1.35,
      aspect: [1, 1, 0.962963],
      size: [1.35, 1.3, 1.35],
    },
    attachment: null,
    roles: ["hull"],
    tris: 262,
    verts: 454,
    triVariants: [262],
    size: [1.35, 1.3, 1.35],
    offset: [0, 0.83125, 0.05],
    provenance: [
      { species: "tiger", node: "body", ordinal: 0, role: "hull", name: "torso+head fused hull (torso, neck, head, cheeks in one shell)" },
    ],
    positions: [-0.5,-0.525,0.45,-0.3125,-0.65,-0.3625,-0.3125,-0.65,0.2625,-0.5,-0.525,-0.55,0.625,0.2875,0.2625,0.625,-0.3375,-0.3625,0.625,0.2875,-0.3625,0.625,-0.3375,0.2625,0.3125,0.6,0.2625,-0.5,0.475,0.45,0.5,0.475,0.45,-0.3125,0.6,0.2625,0.625,0.2875,-0.3625,0.5,-0.525,-0.55,0.5,0.475,-0.55,0.625,-0.3375,-0.3625,-0.3125,-0.3375,-0.675,0.5,-0.525,-0.55,-0.5,-0.525,-0.55,0.3125,-0.3375,-0.675,0.5,0.475,0.45,0.625,0.2875,-0.3625,0.5,0.475,-0.55,0.625,0.2875,0.2625,-0.5,0.475,-0.55,0.3125,0.2875,-0.675,-0.3125,0.2875,-0.675,0.5,0.475,-0.55,0.625,-0.3375,-0.3625,0.5,-0.525,0.45,0.5,-0.525,-0.55,0.625,-0.3375,0.2625,0.3125,-0.65,-0.3625,-0.5,-0.525,-0.55,0.5,-0.525,-0.55,-0.3125,-0.65,-0.3625,0.5,0.475,0.45,0.3125,-0.3375,0.575,0.5,-0.525,0.45,0.3125,-0.1375,0.575,0.3125,0.2875,0.575,-0.5,-0.525,0.45,-0.625,-0.3375,-0.3625,-0.5,-0.525,-0.55,-0.625,-0.3375,0.2625,-0.5,0.475,-0.55,0.3125,0.6,-0.3625,0.5,0.475,-0.55,-0.3125,0.6,-0.3625,-0.3125,0.6,-0.3625,-0.5,0.475,0.45,-0.3125,0.6,0.2625,-0.5,0.475,-0.55,-0.5,-0.525,0.45,-0.625,0.2875,0.2625,-0.625,-0.3375,0.2625,-0.5,0.475,0.45,0.3125,-0.3375,-0.675,0.5,0.475,-0.55,0.5,-0.525,-0.55,0.3125,0.2875,-0.675,-0.625,-0.3375,-0.3625,-0.5,0.475,-0.55,-0.5,-0.525,-0.55,-0.625,0.2875,-0.3625,0.5,-0.525,0.45,0.3125,-0.65,-0.3625,0.5,-0.525,-0.55,0.3125,-0.65,0.2625,-0.3125,-0.3375,0.575,-0.5,0.475,0.45,-0.5,-0.525,0.45,-0.3125,-0.1375,0.575,-0.3125,0.2875,0.575,-0.625,-0.3375,0.2625,-0.625,0.2875,-0.3625,-0.625,-0.3375,-0.3625,-0.625,0.2875,0.2625,-0.5,0.475,-0.55,-0.3125,-0.3375,-0.675,-0.5,-0.525,-0.55,-0.3125,0.2875,-0.675,0.3125,0.6,-0.3625,-0.3125,0.6,0.2625,0.3125,0.6,0.2625,-0.3125,0.6,-0.3625,-0.625,0.2875,-0.3625,-0.5,0.475,0.45,-0.5,0.475,-0.55,-0.625,0.2875,0.2625,0.3125,0.6,-0.3625,0.5,0.475,0.45,0.5,0.475,-0.55,0.3125,0.6,0.2625,-0.3125,0.2875,-0.675,0.3125,-0.3375,-0.675,-0.3125,-0.3375,-0.675,0.3125,0.2875,-0.675,0.5,0.475,0.45,0.625,-0.3375,0.2625,0.625,0.2875,0.2625,0.5,-0.525,0.45,0.5,0.475,0.45,-0.3125,0.2875,0.575,0.3125,0.2875,0.575,-0.5,0.475,0.45,0.3125,0.2875,0.575,0.2,-0.1375,0.575,0.3125,-0.1375,0.575,-0.3125,-0.1375,0.575,-0.3125,0.2875,0.575,0.675,0.3026,-0.1883,0.675,0.0891,-0.3075,0.675,0.3026,-0.3075,0.675,0.0438,-0.2868,0.675,0.0291,-0.2479,0.675,0.0438,-0.209,0.675,0.0891,-0.1883,0.5361,0.5111,-0.3075,0.675,0.3026,-0.1883,0.675,0.3026,-0.3075,0.5361,0.5111,-0.1883,0.3276,0.65,-0.3075,-0.3276,0.65,-0.1883,0.3276,0.65,-0.1883,-0.3276,0.65,-0.3075,-0.625,0.0055,-0.1669,0.625,-0.025,-0.2479,0.625,0.0055,-0.1669,-0.625,-0.025,-0.2479,0.5361,0.5111,-0.3075,0.3276,0.65,-0.1883,0.5361,0.5111,-0.1883,0.3276,0.65,-0.3075,-0.625,0.2875,-0.3625,0.625,0.0792,-0.3625,-0.625,0.0792,-0.3625,0.625,0.2875,-0.3625,-0.5,0.475,-0.3625,0.5,0.475,-0.3625,-0.3125,0.6,-0.3625,0.3125,0.6,-0.3625,0.625,0.0792,-0.1333,-0.625,0.0055,-0.1669,0.625,0.0055,-0.1669,-0.625,0.0792,-0.1333,-0.625,-0.025,-0.2479,0.625,0.0055,-0.3289,0.625,-0.025,-0.2479,-0.625,0.0055,-0.3289,0.675,0.0891,-0.3075,0.625,0.0055,-0.3289,0.625,0.0792,-0.3625,0.675,0.0438,-0.2868,0.675,0.3026,-0.1883,0.5,0.475,-0.1333,0.625,0.2875,-0.1333,0.5361,0.5111,-0.1883,0.5361,0.5111,-0.1883,0.3125,0.6,-0.1333,0.5,0.475,-0.1333,0.3276,0.65,-0.1883,0.5,0.475,-0.3625,0.675,0.3026,-0.3075,0.625,0.2875,-0.3625,0.5361,0.5111,-0.3075,0.3125,0.6,-0.3625,0.5361,0.5111,-0.3075,0.5,0.475,-0.3625,0.3276,0.65,-0.3075,0.625,0.2875,-0.1333,-0.625,0.0792,-0.1333,0.625,0.0792,-0.1333,-0.625,0.2875,-0.1333,0.5,0.475,-0.1333,-0.5,0.475,-0.1333,0.3125,0.6,-0.1333,-0.3125,0.6,-0.1333,0.625,0.2875,-0.3625,0.675,0.0891,-0.3075,0.625,0.0792,-0.3625,0.675,0.3026,-0.3075,-0.3276,0.65,-0.1883,0.3125,0.6,-0.1333,0.3276,0.65,-0.1883,-0.3125,0.6,-0.1333,0.3125,0.6,-0.3625,-0.3276,0.65,-0.3075,0.3276,0.65,-0.3075,-0.3125,0.6,-0.3625,0.625,0.2875,-0.1333,0.675,0.0891,-0.1883,0.675,0.3026,-0.1883,0.625,0.0792,-0.1333,0.675,0.0438,-0.209,0.625,-0.025,-0.2479,0.675,0.0291,-0.2479,0.625,0.0055,-0.1669,0.675,0.0891,-0.1883,0.625,0.0055,-0.1669,0.675,0.0438,-0.209,0.625,0.0792,-0.1333,0.675,0.0438,-0.2868,0.625,-0.025,-0.2479,0.625,0.0055,-0.3289,0.675,0.0291,-0.2479,-0.625,0.0792,-0.3625,0.625,0.0055,-0.3289,-0.625,0.0055,-0.3289,0.625,0.0792,-0.3625,-0.5361,0.5111,-0.3075,-0.3276,0.65,-0.1883,-0.3276,0.65,-0.3075,-0.5361,0.5111,-0.1883,-0.3125,0.6,-0.1333,-0.5361,0.5111,-0.1883,-0.5,0.475,-0.1333,-0.3276,0.65,-0.1883,-0.5361,0.5111,-0.3075,-0.3125,0.6,-0.3625,-0.5,0.475,-0.3625,-0.3276,0.65,-0.3075,-0.675,0.0891,-0.3075,-0.625,0.2875,-0.3625,-0.625,0.0792,-0.3625,-0.675,0.3026,-0.3075,-0.675,0.3026,-0.3075,-0.5,0.475,-0.3625,-0.625,0.2875,-0.3625,-0.5361,0.5111,-0.3075,-0.675,0.0891,-0.1883,-0.625,0.2875,-0.1333,-0.675,0.3026,-0.1883,-0.625,0.0792,-0.1333,-0.625,-0.025,-0.2479,-0.675,0.0438,-0.209,-0.675,0.0291,-0.2479,-0.625,0.0055,-0.1669,-0.5,0.475,-0.1333,-0.675,0.3026,-0.1883,-0.625,0.2875,-0.1333,-0.5361,0.5111,-0.1883,-0.675,0.3026,-0.1883,-0.5361,0.5111,-0.3075,-0.675,0.3026,-0.3075,-0.5361,0.5111,-0.1883,-0.625,0.0055,-0.1669,-0.675,0.0891,-0.1883,-0.675,0.0438,-0.209,-0.625,0.0792,-0.1333,-0.675,0.0891,-0.3075,-0.675,0.3026,-0.1883,-0.675,0.3026,-0.3075,-0.675,0.0438,-0.2868,-0.675,0.0291,-0.2479,-0.675,0.0438,-0.209,-0.675,0.0891,-0.1883,-0.625,0.0055,-0.3289,-0.675,0.0891,-0.3075,-0.625,0.0792,-0.3625,-0.675,0.0438,-0.2868,-0.625,-0.025,-0.2479,-0.675,0.0438,-0.2868,-0.625,0.0055,-0.3289,-0.675,0.0291,-0.2479,0.675,0.3026,0.2075,0.675,0.0891,0.0883,0.675,0.3026,0.0883,0.675,0.0438,0.109,0.675,0.0291,0.1479,0.675,0.0438,0.1868,0.675,0.0891,0.2075,0.5361,0.5111,0.0883,0.675,0.3026,0.2075,0.675,0.3026,0.0883,0.5361,0.5111,0.2075,0.3276,0.65,0.0883,-0.3276,0.65,0.2075,0.3276,0.65,0.2075,-0.3276,0.65,0.0883,-0.625,0.0055,0.2289,0.625,-0.025,0.1479,0.625,0.0055,0.2289,-0.625,-0.025,0.1479,0.5361,0.5111,0.0883,0.3276,0.65,0.2075,0.5361,0.5111,0.2075,0.3276,0.65,0.0883,-0.625,0.2875,0.0333,0.625,0.0792,0.0333,-0.625,0.0792,0.0333,0.625,0.2875,0.0333,-0.5,0.475,0.0333,0.5,0.475,0.0333,-0.3125,0.6,0.0333,0.3125,0.6,0.0333,0.625,0.0792,0.2625,-0.625,0.0055,0.2289,0.625,0.0055,0.2289,-0.625,0.0792,0.2625,-0.625,-0.025,0.1479,0.625,0.0055,0.0669,0.625,-0.025,0.1479,-0.625,0.0055,0.0669,0.675,0.0891,0.0883,0.625,0.0055,0.0669,0.625,0.0792,0.0333,0.675,0.0438,0.109,0.675,0.3026,0.2075,0.5,0.475,0.2625,0.625,0.2875,0.2625,0.5361,0.5111,0.2075,0.5361,0.5111,0.2075,0.3125,0.6,0.2625,0.5,0.475,0.2625,0.3276,0.65,0.2075,0.5,0.475,0.0333,0.675,0.3026,0.0883,0.625,0.2875,0.0333,0.5361,0.5111,0.0883,0.3125,0.6,0.0333,0.5361,0.5111,0.0883,0.5,0.475,0.0333,0.3276,0.65,0.0883,0.625,0.2875,0.2625,-0.625,0.0792,0.2625,0.625,0.0792,0.2625,-0.625,0.2875,0.2625,0.5,0.475,0.2625,-0.5,0.475,0.2625,0.3125,0.6,0.2625,-0.3125,0.6,0.2625,0.625,0.2875,0.0333,0.675,0.0891,0.0883,0.625,0.0792,0.0333,0.675,0.3026,0.0883,-0.3276,0.65,0.2075,0.3125,0.6,0.2625,0.3276,0.65,0.2075,-0.3125,0.6,0.2625,0.3125,0.6,0.0333,-0.3276,0.65,0.0883,0.3276,0.65,0.0883,-0.3125,0.6,0.0333,0.625,0.2875,0.2625,0.675,0.0891,0.2075,0.675,0.3026,0.2075,0.625,0.0792,0.2625,0.675,0.0438,0.1868,0.625,-0.025,0.1479,0.675,0.0291,0.1479,0.625,0.0055,0.2289,0.675,0.0891,0.2075,0.625,0.0055,0.2289,0.675,0.0438,0.1868,0.625,0.0792,0.2625,0.675,0.0438,0.109,0.625,-0.025,0.1479,0.625,0.0055,0.0669,0.675,0.0291,0.1479,-0.625,0.0792,0.0333,0.625,0.0055,0.0669,-0.625,0.0055,0.0669,0.625,0.0792,0.0333,-0.5361,0.5111,0.0883,-0.3276,0.65,0.2075,-0.3276,0.65,0.0883,-0.5361,0.5111,0.2075,-0.3125,0.6,0.2625,-0.5361,0.5111,0.2075,-0.5,0.475,0.2625,-0.3276,0.65,0.2075,-0.5361,0.5111,0.0883,-0.3125,0.6,0.0333,-0.5,0.475,0.0333,-0.3276,0.65,0.0883,-0.675,0.0891,0.0883,-0.625,0.2875,0.0333,-0.625,0.0792,0.0333,-0.675,0.3026,0.0883,-0.675,0.3026,0.0883,-0.5,0.475,0.0333,-0.625,0.2875,0.0333,-0.5361,0.5111,0.0883,-0.675,0.0891,0.2075,-0.625,0.2875,0.2625,-0.675,0.3026,0.2075,-0.625,0.0792,0.2625,-0.625,-0.025,0.1479,-0.675,0.0438,0.1868,-0.675,0.0291,0.1479,-0.625,0.0055,0.2289,-0.5,0.475,0.2625,-0.675,0.3026,0.2075,-0.625,0.2875,0.2625,-0.5361,0.5111,0.2075,-0.675,0.3026,0.2075,-0.5361,0.5111,0.0883,-0.675,0.3026,0.0883,-0.5361,0.5111,0.2075,-0.625,0.0055,0.2289,-0.675,0.0891,0.2075,-0.675,0.0438,0.1868,-0.625,0.0792,0.2625,-0.675,0.0891,0.0883,-0.675,0.3026,0.2075,-0.675,0.3026,0.0883,-0.675,0.0438,0.109,-0.675,0.0291,0.1479,-0.675,0.0438,0.1868,-0.675,0.0891,0.2075,-0.625,0.0055,0.0669,-0.675,0.0891,0.0883,-0.625,0.0792,0.0333,-0.675,0.0438,0.109,-0.625,-0.025,0.1479,-0.675,0.0438,0.109,-0.625,0.0055,0.0669,-0.675,0.0291,0.1479,-0.1414,-0.2789,0.575,0.1414,-0.2789,0.575,0,-0.3375,0.575,-0.2,-0.1375,0.575,0.2,-0.1375,0.575,-0.1414,0.0039,0.575,0.1414,0.0039,0.575,0,0.0625,0.575,0.2,-0.1375,0.675,0.1414,-0.2789,0.575,0.2,-0.1375,0.575,0.1414,0.0039,0.575,0.1414,-0.2789,0.675,0,-0.3375,0.675,0,-0.3375,0.575,-0.1414,-0.2789,0.675,-0.1414,-0.2789,0.575,-0.2,-0.1375,0.575,-0.2,-0.1375,0.675,0.1414,0.0039,0.675,-0.1414,0.0039,0.675,-0.1414,0.0039,0.575,0,0.0625,0.575,0,0.0625,0.675,0.3125,-0.65,-0.3625,-0.3125,-0.65,0.2625,-0.3125,-0.65,-0.3625,0.3125,-0.65,0.2625,-0.5,-0.525,0.45,0.5,-0.525,0.45,0.3125,-0.3375,0.575,-0.3125,-0.3375,0.575,0.3125,-0.1375,0.575,-0.3125,-0.1375,0.575,0.2,-0.1375,0.575],
    normals: [-0.5774,-0.5774,0.5774,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.5774,-0.5774,-0.5774,0.9489,0.2232,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,0.2232,0.2232,0.9489,0.2232,-0.5774,0.5774,0.5774,0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,0.9489,0.2232,-0.2232,0.5774,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,-0.2232,-0.2232,-0.9489,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.5774,0.2232,-0.2232,-0.9489,0.5774,0.5774,0.5774,0.9489,0.2232,-0.2232,0.5774,0.5774,-0.5774,0.9489,0.2232,0.2232,-0.5774,0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.5774,0.5774,-0.5774,0.9489,-0.2232,-0.2232,0.5774,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.9489,-0.2232,0.2232,0.2232,-0.9489,-0.2232,-0.5774,-0.5774,-0.5774,0.5774,-0.5774,-0.5774,-0.2232,-0.9489,-0.2232,0.5774,0.5774,0.5774,0.2232,-0.2232,0.9489,0.5774,-0.5774,0.5774,0.2898,0,0.9571,0.2232,0.2232,0.9489,-0.5774,-0.5774,0.5774,-0.9489,-0.2232,-0.2232,-0.5774,-0.5774,-0.5774,-0.9489,-0.2232,0.2232,-0.5774,0.5774,-0.5774,0.2232,0.9489,-0.2232,0.5774,0.5774,-0.5774,-0.2232,0.9489,-0.2232,-0.2232,0.9489,-0.2232,-0.5774,0.5774,0.5774,-0.2232,0.9489,0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,0.5774,-0.9489,0.2232,0.2232,-0.9489,-0.2232,0.2232,-0.5774,0.5774,0.5774,0.2232,-0.2232,-0.9489,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.5774,0.2232,0.2232,-0.9489,-0.9489,-0.2232,-0.2232,-0.5774,0.5774,-0.5774,-0.5774,-0.5774,-0.5774,-0.9489,0.2232,-0.2232,0.5774,-0.5774,0.5774,0.2232,-0.9489,-0.2232,0.5774,-0.5774,-0.5774,0.2232,-0.9489,0.2232,-0.2232,-0.2232,0.9489,-0.5774,0.5774,0.5774,-0.5774,-0.5774,0.5774,-0.2898,0,0.9571,-0.2232,0.2232,0.9489,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.5774,0.5774,-0.5774,-0.2232,-0.2232,-0.9489,-0.5774,-0.5774,-0.5774,-0.2232,0.2232,-0.9489,0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2232,0.2232,0.9489,0.2232,-0.2232,0.9489,-0.2232,-0.9489,0.2232,-0.2232,-0.5774,0.5774,0.5774,-0.5774,0.5774,-0.5774,-0.9489,0.2232,0.2232,0.2232,0.9489,-0.2232,0.5774,0.5774,0.5774,0.5774,0.5774,-0.5774,0.2232,0.9489,0.2232,-0.2232,0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,0.2232,-0.9489,0.5774,0.5774,0.5774,0.9489,-0.2232,0.2232,0.9489,0.2232,0.2232,0.5774,-0.5774,0.5774,0.5774,0.5774,0.5774,-0.2232,0.2232,0.9489,0.2232,0.2232,0.9489,-0.5774,0.5774,0.5774,0.2232,0.2232,0.9489,0,0,1,0.2898,0,0.9571,-0.2898,0,0.9571,-0.2232,0.2232,0.9489,0.8969,0.2716,0.3491,0.9174,-0.086,-0.3885,0.8969,0.2716,-0.3491,0.9048,-0.317,-0.2845,0.9018,-0.4321,0,0.9048,-0.317,0.2845,0.9174,-0.086,0.3885,0.6622,0.6622,-0.3505,0.8969,0.2716,0.3491,0.8969,0.2716,-0.3491,0.6622,0.6622,0.3505,0.2716,0.8969,-0.3491,-0.2716,0.8969,0.3491,0.2716,0.8969,0.3491,-0.2716,0.8969,-0.3491,-0.3782,-0.6736,0.635,0.3711,-0.9286,0,0.3782,-0.6736,0.635,-0.3711,-0.9286,0,0.6622,0.6622,-0.3505,0.2716,0.8969,0.3491,0.6622,0.6622,0.3505,0.2716,0.8969,-0.3491,-0.4337,0.1313,-0.8915,0.3889,-0.1944,-0.9005,-0.3889,-0.1944,-0.9005,0.4337,0.1313,-0.8915,-0.3115,0.3115,-0.8977,0.3115,0.3115,-0.8977,-0.1313,0.4337,-0.8915,0.1313,0.4337,-0.8915,0.3889,-0.1944,0.9005,-0.3782,-0.6736,0.635,0.3782,-0.6736,0.635,-0.3889,-0.1944,0.9005,-0.3711,-0.9286,0,0.3782,-0.6736,-0.635,0.3711,-0.9286,0,-0.3782,-0.6736,-0.635,0.9174,-0.086,-0.3885,0.3782,-0.6736,-0.635,0.3889,-0.1944,-0.9005,0.9048,-0.317,-0.2845,0.8969,0.2716,0.3491,0.3115,0.3115,0.8977,0.4337,0.1313,0.8915,0.6622,0.6622,0.3505,0.6622,0.6622,0.3505,0.1313,0.4337,0.8915,0.3115,0.3115,0.8977,0.2716,0.8969,0.3491,0.3115,0.3115,-0.8977,0.8969,0.2716,-0.3491,0.4337,0.1313,-0.8915,0.6622,0.6622,-0.3505,0.1313,0.4337,-0.8915,0.6622,0.6622,-0.3505,0.3115,0.3115,-0.8977,0.2716,0.8969,-0.3491,0.4337,0.1313,0.8915,-0.3889,-0.1944,0.9005,0.3889,-0.1944,0.9005,-0.4337,0.1313,0.8915,0.3115,0.3115,0.8977,-0.3115,0.3115,0.8977,0.1313,0.4337,0.8915,-0.1313,0.4337,0.8915,0.4337,0.1313,-0.8915,0.9174,-0.086,-0.3885,0.3889,-0.1944,-0.9005,0.8969,0.2716,-0.3491,-0.2716,0.8969,0.3491,0.1313,0.4337,0.8915,0.2716,0.8969,0.3491,-0.1313,0.4337,0.8915,0.1313,0.4337,-0.8915,-0.2716,0.8969,-0.3491,0.2716,0.8969,-0.3491,-0.1313,0.4337,-0.8915,0.4337,0.1313,0.8915,0.9174,-0.086,0.3885,0.8969,0.2716,0.3491,0.3889,-0.1944,0.9005,0.9048,-0.317,0.2845,0.3711,-0.9286,0,0.9018,-0.4321,0,0.3782,-0.6736,0.635,0.9174,-0.086,0.3885,0.3782,-0.6736,0.635,0.9048,-0.317,0.2845,0.3889,-0.1944,0.9005,0.9048,-0.317,-0.2845,0.3711,-0.9286,0,0.3782,-0.6736,-0.635,0.9018,-0.4321,0,-0.3889,-0.1944,-0.9005,0.3782,-0.6736,-0.635,-0.3782,-0.6736,-0.635,0.3889,-0.1944,-0.9005,-0.6622,0.6622,-0.3505,-0.2716,0.8969,0.3491,-0.2716,0.8969,-0.3491,-0.6622,0.6622,0.3505,-0.1313,0.4337,0.8915,-0.6622,0.6622,0.3505,-0.3115,0.3115,0.8977,-0.2716,0.8969,0.3491,-0.6622,0.6622,-0.3505,-0.1313,0.4337,-0.8915,-0.3115,0.3115,-0.8977,-0.2716,0.8969,-0.3491,-0.9174,-0.086,-0.3885,-0.4337,0.1313,-0.8915,-0.3889,-0.1944,-0.9005,-0.8969,0.2716,-0.3491,-0.8969,0.2716,-0.3491,-0.3115,0.3115,-0.8977,-0.4337,0.1313,-0.8915,-0.6622,0.6622,-0.3505,-0.9174,-0.086,0.3885,-0.4337,0.1313,0.8915,-0.8969,0.2716,0.3491,-0.3889,-0.1944,0.9005,-0.3711,-0.9286,0,-0.9048,-0.317,0.2845,-0.9018,-0.4321,0,-0.3782,-0.6736,0.635,-0.3115,0.3115,0.8977,-0.8969,0.2716,0.3491,-0.4337,0.1313,0.8915,-0.6622,0.6622,0.3505,-0.8969,0.2716,0.3491,-0.6622,0.6622,-0.3505,-0.8969,0.2716,-0.3491,-0.6622,0.6622,0.3505,-0.3782,-0.6736,0.635,-0.9174,-0.086,0.3885,-0.9048,-0.317,0.2845,-0.3889,-0.1944,0.9005,-0.9174,-0.086,-0.3885,-0.8969,0.2716,0.3491,-0.8969,0.2716,-0.3491,-0.9048,-0.317,-0.2845,-0.9018,-0.4321,0,-0.9048,-0.317,0.2845,-0.9174,-0.086,0.3885,-0.3782,-0.6736,-0.635,-0.9174,-0.086,-0.3885,-0.3889,-0.1944,-0.9005,-0.9048,-0.317,-0.2845,-0.3711,-0.9286,0,-0.9048,-0.317,-0.2845,-0.3782,-0.6736,-0.635,-0.9018,-0.4321,0,0.8969,0.2716,0.3491,0.9174,-0.086,-0.3885,0.8969,0.2716,-0.3491,0.9048,-0.317,-0.2845,0.9018,-0.4321,0,0.9048,-0.317,0.2845,0.9174,-0.086,0.3885,0.6622,0.6622,-0.3505,0.8969,0.2716,0.3491,0.8969,0.2716,-0.3491,0.6622,0.6622,0.3505,0.2716,0.8969,-0.3491,-0.2716,0.8969,0.3491,0.2716,0.8969,0.3491,-0.2716,0.8969,-0.3491,-0.3782,-0.6736,0.635,0.3711,-0.9286,0,0.3782,-0.6736,0.635,-0.3711,-0.9286,0,0.6622,0.6622,-0.3505,0.2716,0.8969,0.3491,0.6622,0.6622,0.3505,0.2716,0.8969,-0.3491,-0.4337,0.1313,-0.8915,0.3889,-0.1944,-0.9005,-0.3889,-0.1944,-0.9005,0.4337,0.1313,-0.8915,-0.3115,0.3115,-0.8977,0.3115,0.3115,-0.8977,-0.1313,0.4337,-0.8915,0.1313,0.4337,-0.8915,0.3889,-0.1944,0.9005,-0.3782,-0.6736,0.635,0.3782,-0.6736,0.635,-0.3889,-0.1944,0.9005,-0.3711,-0.9286,0,0.3782,-0.6736,-0.635,0.3711,-0.9286,0,-0.3782,-0.6736,-0.635,0.9174,-0.086,-0.3885,0.3782,-0.6736,-0.635,0.3889,-0.1944,-0.9005,0.9048,-0.317,-0.2845,0.8969,0.2716,0.3491,0.3115,0.3115,0.8977,0.4337,0.1313,0.8915,0.6622,0.6622,0.3505,0.6622,0.6622,0.3505,0.1313,0.4337,0.8915,0.3115,0.3115,0.8977,0.2716,0.8969,0.3491,0.3115,0.3115,-0.8977,0.8969,0.2716,-0.3491,0.4337,0.1313,-0.8915,0.6622,0.6622,-0.3505,0.1313,0.4337,-0.8915,0.6622,0.6622,-0.3505,0.3115,0.3115,-0.8977,0.2716,0.8969,-0.3491,0.4337,0.1313,0.8915,-0.3889,-0.1944,0.9005,0.3889,-0.1944,0.9005,-0.4337,0.1313,0.8915,0.3115,0.3115,0.8977,-0.3115,0.3115,0.8977,0.1313,0.4337,0.8915,-0.1313,0.4337,0.8915,0.4337,0.1313,-0.8915,0.9174,-0.086,-0.3885,0.3889,-0.1944,-0.9005,0.8969,0.2716,-0.3491,-0.2716,0.8969,0.3491,0.1313,0.4337,0.8915,0.2716,0.8969,0.3491,-0.1313,0.4337,0.8915,0.1313,0.4337,-0.8915,-0.2716,0.8969,-0.3491,0.2716,0.8969,-0.3491,-0.1313,0.4337,-0.8915,0.4337,0.1313,0.8915,0.9174,-0.086,0.3885,0.8969,0.2716,0.3491,0.3889,-0.1944,0.9005,0.9048,-0.317,0.2845,0.3711,-0.9286,0,0.9018,-0.4321,0,0.3782,-0.6736,0.635,0.9174,-0.086,0.3885,0.3782,-0.6736,0.635,0.9048,-0.317,0.2845,0.3889,-0.1944,0.9005,0.9048,-0.317,-0.2845,0.3711,-0.9286,0,0.3782,-0.6736,-0.635,0.9018,-0.4321,0,-0.3889,-0.1944,-0.9005,0.3782,-0.6736,-0.635,-0.3782,-0.6736,-0.635,0.3889,-0.1944,-0.9005,-0.6622,0.6622,-0.3505,-0.2716,0.8969,0.3491,-0.2716,0.8969,-0.3491,-0.6622,0.6622,0.3505,-0.1313,0.4337,0.8915,-0.6622,0.6622,0.3505,-0.3115,0.3115,0.8977,-0.2716,0.8969,0.3491,-0.6622,0.6622,-0.3505,-0.1313,0.4337,-0.8915,-0.3115,0.3115,-0.8977,-0.2716,0.8969,-0.3491,-0.9174,-0.086,-0.3885,-0.4337,0.1313,-0.8915,-0.3889,-0.1944,-0.9005,-0.8969,0.2716,-0.3491,-0.8969,0.2716,-0.3491,-0.3115,0.3115,-0.8977,-0.4337,0.1313,-0.8915,-0.6622,0.6622,-0.3505,-0.9174,-0.086,0.3885,-0.4337,0.1313,0.8915,-0.8969,0.2716,0.3491,-0.3889,-0.1944,0.9005,-0.3711,-0.9286,0,-0.9048,-0.317,0.2845,-0.9018,-0.4321,0,-0.3782,-0.6736,0.635,-0.3115,0.3115,0.8977,-0.8969,0.2716,0.3491,-0.4337,0.1313,0.8915,-0.6622,0.6622,0.3505,-0.8969,0.2716,0.3491,-0.6622,0.6622,-0.3505,-0.8969,0.2716,-0.3491,-0.6622,0.6622,0.3505,-0.3782,-0.6736,0.635,-0.9174,-0.086,0.3885,-0.9048,-0.317,0.2845,-0.3889,-0.1944,0.9005,-0.9174,-0.086,-0.3885,-0.8969,0.2716,0.3491,-0.8969,0.2716,-0.3491,-0.9048,-0.317,-0.2845,-0.9018,-0.4321,0,-0.9048,-0.317,0.2845,-0.9174,-0.086,0.3885,-0.3782,-0.6736,-0.635,-0.9174,-0.086,-0.3885,-0.3889,-0.1944,-0.9005,-0.9048,-0.317,-0.2845,-0.3711,-0.9286,0,-0.9048,-0.317,-0.2845,-0.3782,-0.6736,-0.635,-0.9018,-0.4321,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0.7764,0,0.6303,0.7071,-0.7071,0,1,0,0,0.7071,0.7071,0,0.549,-0.549,0.6303,0,-0.7764,0.6303,0,-1,0,-0.549,-0.549,0.6303,-0.7071,-0.7071,0,-1,0,0,-0.7764,0,0.6303,0.549,0.549,0.6303,-0.549,0.549,0.6303,-0.7071,0.7071,0,0,1,0,0,0.7764,0.6303,0.2232,-0.9489,-0.2232,-0.2232,-0.9489,0.2232,-0.2232,-0.9489,-0.2232,0.2232,-0.9489,0.2232,-0.5774,-0.5774,0.5774,0.5774,-0.5774,0.5774,0.2232,-0.2232,0.9489,-0.2232,-0.2232,0.9489,0.2898,0,0.9571,-0.2898,0,0.9571,0,0,1],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,39,36,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,67,66,65,68,69,70,71,70,69,72,70,72,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,106,107,108,107,106,109,109,106,110,111,112,113,112,111,114,114,111,115,115,111,116,116,111,117,118,119,120,119,118,121,122,123,124,123,122,125,126,127,128,127,126,129,130,131,132,131,130,133,134,135,136,135,134,137,137,134,138,137,138,139,139,138,140,139,140,141,142,143,144,143,142,145,146,147,148,147,146,149,150,151,152,151,150,153,154,155,156,155,154,157,158,159,160,159,158,161,162,163,164,163,162,165,166,167,168,167,166,169,170,171,172,171,170,173,173,170,174,173,174,175,175,174,176,175,176,177,178,179,180,179,178,181,182,183,184,183,182,185,186,187,188,187,186,189,190,191,192,191,190,193,194,195,196,195,194,197,198,199,200,199,198,201,202,203,204,203,202,205,206,207,208,207,206,209,210,211,212,211,210,213,214,215,216,215,214,217,218,219,220,219,218,221,222,223,224,223,222,225,226,227,228,227,226,229,230,231,232,231,230,233,234,235,236,235,234,237,238,239,240,239,238,241,242,243,244,243,242,245,246,247,248,247,246,249,250,251,252,251,250,253,251,253,254,251,254,255,251,255,256,257,258,259,258,257,260,261,262,263,262,261,264,265,266,267,266,265,268,268,265,269,269,265,270,270,265,271,272,273,274,273,272,275,276,277,278,277,276,279,280,281,282,281,280,283,284,285,286,285,284,287,288,289,290,289,288,291,291,288,292,291,292,293,293,292,294,293,294,295,296,297,298,297,296,299,300,301,302,301,300,303,304,305,306,305,304,307,308,309,310,309,308,311,312,313,314,313,312,315,316,317,318,317,316,319,320,321,322,321,320,323,324,325,326,325,324,327,327,324,328,327,328,329,329,328,330,329,330,331,332,333,334,333,332,335,336,337,338,337,336,339,340,341,342,341,340,343,344,345,346,345,344,347,348,349,350,349,348,351,352,353,354,353,352,355,356,357,358,357,356,359,360,361,362,361,360,363,364,365,366,365,364,367,368,369,370,369,368,371,372,373,374,373,372,375,376,377,378,377,376,379,380,381,382,381,380,383,384,385,386,385,384,387,388,389,390,389,388,391,392,393,394,393,392,395,396,397,398,397,396,399,400,401,402,401,400,403,404,405,406,405,404,407,405,407,408,405,408,409,405,409,410,411,412,413,412,411,414,415,416,417,416,415,418,419,420,421,420,419,422,420,422,423,423,422,424,423,424,425,425,424,426,427,428,429,430,427,429,428,427,431,432,428,431,428,432,433,434,433,432,431,434,432,433,434,435,434,436,435,434,431,437,437,431,427,436,434,437,427,430,438,437,427,438,439,436,437,437,438,439,436,439,440,439,441,440,430,442,438,442,430,441,439,438,442,441,439,442,443,444,445,444,443,446,446,447,444,447,446,448,449,447,448,447,449,450,451,450,449,450,451,452,452,451,453],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "cone-01",
    shape: {
      form: "cone", taper: 0, symmetry: "mirror", longest: 0.400356,
      aspect: [1, 0.820695, 0.399644],
      size: [0.16, 0.400356, 0.32857],
    },
    attachment: {
      axis: "y", dir: 1, n: 4,
      sunkUnitsMin: 0.125, sunkUnitsMean: 0.125, sunkUnitsMax: 0.125,
      sunkFractionMin: 0.312222, sunkFractionMean: 0.312222, sunkFractionMax: 0.312222,
    },
    roles: ["ear"],
    tris: 34,
    verts: 68,
    triVariants: [34],
    size: [0.16, 0.400356, 0.32857],
    offset: [0.227581, 1.506428, 0.469709],
    provenance: [
      { species: "bee", node: "body", ordinal: 4, role: "ear", name: "ear-right" },
      { species: "bee", node: "body", ordinal: 5, role: "ear", name: "ear-left" },
      { species: "caterpillar", node: "body", ordinal: 4, role: "ear", name: "ear-right" },
      { species: "caterpillar", node: "body", ordinal: 5, role: "ear", name: "ear-left" },
    ],
    positions: [0.08,0.1383,0.1135,-0.08,0.1383,0.1135,0,0.0765,0.1643,0,0.2002,0.0628,-0.08,0.0767,0.0384,0,0.2002,0.0628,0,0.133,-0.0191,-0.08,0.1383,0.1135,0.08,0.0767,0.0384,0,-0.0423,0.0465,0.08,0.0004,-0.0217,0,0.0204,0.0959,0,0.0204,0.0959,-0.08,0.1383,0.1135,-0.08,0.0767,0.0384,0,0.0765,0.1643,0.08,0.1383,0.1135,0,0.0204,0.0959,0.08,0.0767,0.0384,0,0.0765,0.1643,0,-0.0423,0.0465,-0.08,0.0767,0.0384,-0.08,0.0004,-0.0217,0,0.0204,0.0959,-0.08,0.0004,-0.0217,0,0.133,-0.0191,0,0.043,-0.0899,-0.08,0.0767,0.0384,0,0.2002,0.0628,0.08,0.0767,0.0384,0,0.133,-0.0191,0.08,0.1383,0.1135,-0.08,-0.0871,-0.064,0,0.043,-0.0899,0,-0.0602,-0.1398,-0.08,0.0004,-0.0217,0,-0.1141,0.0118,-0.08,0.0004,-0.0217,-0.08,-0.0871,-0.064,0,-0.0423,0.0465,0,0.043,-0.0899,0.08,-0.0871,-0.064,0,-0.0602,-0.1398,0.08,0.0004,-0.0217,-0.08,-0.1817,-0.0865,0,-0.0602,-0.1398,0,-0.1632,-0.1643,-0.08,-0.0871,-0.064,0,-0.0602,-0.1398,0.08,-0.1817,-0.0865,0,-0.1632,-0.1643,0.08,-0.0871,-0.064,0,0.133,-0.0191,0.08,0.0004,-0.0217,0,0.043,-0.0899,0.08,0.0767,0.0384,0.08,0.0004,-0.0217,0,-0.1141,0.0118,0.08,-0.0871,-0.064,0,-0.0423,0.0465,0.08,-0.0871,-0.064,0,-0.2002,-0.0086,0.08,-0.1817,-0.0865,0,-0.1141,0.0118,0,-0.2002,-0.0086,-0.08,-0.0871,-0.064,-0.08,-0.1817,-0.0865,0,-0.1141,0.0118],
    normals: [0,0.6342,0.7731,0,0.6342,0.7731,0,0.6342,0.7731,0,0.6342,0.7731,-0.9988,0.034,-0.0347,0,0.7731,-0.6342,0,0.7,-0.7142,-1,0,0,0.9988,0.034,-0.0347,0,-0.53,0.848,0.9988,0.0257,-0.0412,0,-0.7,0.7142,0,-0.7,0.7142,-1,0,0,-0.9988,0.034,-0.0347,0,-0.7731,0.6342,1,0,0,0,-0.7,0.7142,0.9988,0.034,-0.0347,0,-0.7731,0.6342,0,-0.53,0.848,-0.9988,0.034,-0.0347,-0.9988,0.0257,-0.0412,0,-0.7,0.7142,-0.9988,0.0257,-0.0412,0,0.7,-0.7142,0,0.53,-0.848,-0.9988,0.034,-0.0347,0,0.7731,-0.6342,0.9988,0.034,-0.0347,0,0.7,-0.7142,1,0,0,-0.9988,0.0163,-0.0457,0,0.53,-0.848,0,0.3352,-0.9421,-0.9988,0.0257,-0.0412,0,-0.3352,0.9421,-0.9988,0.0257,-0.0412,-0.9988,0.0163,-0.0457,0,-0.53,0.848,0,0.53,-0.848,0.9988,0.0163,-0.0457,0,0.3352,-0.9421,0.9988,0.0257,-0.0412,-1,0,0,0,0.3352,-0.9421,0,0.2313,-0.9729,-0.9988,0.0163,-0.0457,0,0.3352,-0.9421,1,0,0,0,0.2313,-0.9729,0.9988,0.0163,-0.0457,0,0.7,-0.7142,0.9988,0.0257,-0.0412,0,0.53,-0.848,0.9988,0.034,-0.0347,0.9988,0.0257,-0.0412,0,-0.3352,0.9421,0.9988,0.0163,-0.0457,0,-0.53,0.848,0.9988,0.0163,-0.0457,0,-0.2313,0.9729,1,0,0,0,-0.3352,0.9421,0,-0.2313,0.9729,-0.9988,0.0163,-0.0457,-1,0,0,0,-0.3352,0.9421],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "cone-02",
    shape: {
      form: "cone", taper: 0.222971, symmetry: "handed", longest: 0.463702,
      aspect: [1, 0.960649, 0.814258],
      size: [0.445455, 0.377573, 0.463702],
    },
    attachment: {
      axis: "y", dir: 1, n: 2,
      sunkUnitsMin: 0.224387, sunkUnitsMean: 0.224387, sunkUnitsMax: 0.224387,
      sunkFractionMin: 0.594288, sunkFractionMean: 0.594288, sunkFractionMax: 0.594288,
    },
    roles: ["ear"],
    tris: 36,
    verts: 60,
    triVariants: [36],
    size: [0.445455, 0.377573, 0.463702],
    offset: [0.351812, 1.39565, 0.475851],
    provenance: [
      { species: "dog", node: "body", ordinal: 2, role: "ear", name: "ear-right" },
      { species: "pig", node: "body", ordinal: 1, role: "ear", name: "ear-right" },
    ],
    positions: [0.2227,0.0894,0.0241,0.2227,0.0894,-0.0338,-0.1482,0.1888,0.0241,-0.1482,0.1888,-0.0338,0.1855,-0.0497,0.0241,0.1828,-0.0529,0.0241,0.1482,-0.1888,0.0241,-0.2227,-0.0894,0.0241,-0.1848,0.0456,0.0241,-0.1855,0.0497,0.0241,0.2134,0.0546,0.0865,0.1855,-0.0497,0.0241,0.2227,0.0894,0.0241,0.1482,-0.1888,0.0241,0.2227,0.0894,-0.0338,0.2062,0.0276,-0.1323,0.1482,-0.1888,-0.2319,0.2134,0.0546,0.0865,0.2227,0.0894,0.0241,0.0476,0.0122,0.2319,-0.0351,0.0343,0.2319,-0.1482,0.1888,0.0241,-0.1575,0.154,0.0865,-0.0351,0.0343,0.2319,-0.0638,-0.0727,0.1679,0.0476,0.0122,0.2319,0.0189,-0.0949,0.1679,-0.0351,0.0343,0.2319,-0.1575,0.154,0.0865,-0.0638,-0.0727,0.1679,-0.1855,0.0497,0.0241,-0.1848,0.0456,0.0241,0.0189,-0.0949,0.1679,-0.0638,-0.0727,0.1679,0.1828,-0.0529,0.0241,-0.1848,0.0456,0.0241,-0.1648,0.127,-0.1323,0.2062,0.0276,-0.1323,-0.2227,-0.0894,-0.2319,0.1482,-0.1888,-0.2319,-0.2227,-0.0894,-0.2319,-0.2227,-0.0894,0.0241,-0.1648,0.127,-0.1323,-0.1482,0.1888,-0.0338,-0.1482,0.1888,0.0241,-0.1855,0.0497,0.0241,-0.1575,0.154,0.0865,0.1482,-0.1888,-0.2319,0.1482,-0.1888,0.0241,-0.2227,-0.0894,-0.2319,-0.2227,-0.0894,0.0241,0.0476,0.0122,0.2319,0.0189,-0.0949,0.1679,0.2134,0.0546,0.0865,0.1855,-0.0497,0.0241,0.1828,-0.0529,0.0241,0.2227,0.0894,-0.0338,0.2062,0.0276,-0.1323,-0.1482,0.1888,-0.0338,-0.1648,0.127,-0.1323],
    normals: [0.25,0.933,0.2588,0.2481,0.9261,-0.2842,0.25,0.933,0.2588,0.2481,0.9261,-0.2842,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0.8569,-0.4136,0.3078,0.8884,-0.3863,0.248,0.9659,-0.2588,0,0.9659,-0.2588,0,0.9659,-0.2588,0,0.9659,-0.2588,0,0.9659,-0.2588,0,0.2241,0.8365,0.5,0.25,0.933,0.2588,0.2241,0.8365,0.5,0.2241,0.8365,0.5,0.25,0.933,0.2588,0.2241,0.8365,0.5,-0.5137,-0.3346,0.79,-0.5137,-0.3346,0.79,0.2776,-0.5466,0.79,0.2776,-0.5466,0.79,-0.5137,-0.3346,0.79,-0.9489,0.0703,0.3078,-0.5137,-0.3346,0.79,-0.9625,0.1097,0.248,-0.8079,-0.1274,0.5754,-0.2241,-0.8365,-0.5,-0.2241,-0.8365,-0.5,-0.2241,-0.8365,-0.5,-0.2241,-0.8365,-0.5,0.168,0.627,-0.7607,0.168,0.627,-0.7607,0.1051,0.3923,-0.9138,0.1051,0.3923,-0.9138,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9625,0.1097,0.248,-0.9489,0.0703,0.3078,-0.2588,-0.9659,0,-0.2588,-0.9659,0,-0.2588,-0.9659,0,-0.2588,-0.9659,0,0.2776,-0.5466,0.79,0.2776,-0.5466,0.79,0.8569,-0.4136,0.3078,0.8884,-0.3863,0.248,0.636,-0.5143,0.5754,0.2481,0.9261,-0.2842,0.168,0.627,-0.7607,0.2481,0.9261,-0.2842,0.168,0.627,-0.7607],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,5,8,7,9,7,8,10,11,12,11,13,12,12,13,14,14,13,15,16,15,13,17,18,19,19,18,20,18,21,20,22,20,21,23,24,25,26,25,24,27,28,29,28,30,29,31,29,30,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,43,41,45,44,41,44,45,46,47,48,49,50,49,48,51,52,53,53,52,54,55,54,52,56,57,58,59,58,57],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "cone-03",
    shape: {
      form: "cone", taper: 0.222971, symmetry: "handed", longest: 0.463702,
      aspect: [1, 0.960649, 0.814258],
      size: [0.445455, 0.377573, 0.463702],
    },
    attachment: {
      axis: "y", dir: 1, n: 2,
      sunkUnitsMin: 0.224386, sunkUnitsMean: 0.224386, sunkUnitsMax: 0.224386,
      sunkFractionMin: 0.594285, sunkFractionMean: 0.594285, sunkFractionMax: 0.594285,
    },
    roles: ["ear"],
    tris: 36,
    verts: 60,
    triVariants: [36],
    size: [0.445455, 0.377573, 0.463702],
    offset: [-0.351812, 1.395651, 0.475851],
    provenance: [
      { species: "dog", node: "body", ordinal: 3, role: "ear", name: "ear-left" },
      { species: "pig", node: "body", ordinal: 2, role: "ear", name: "ear-left" },
    ],
    positions: [-0.2062,0.0276,-0.1323,0.1482,0.1888,-0.0338,0.1648,0.127,-0.1323,-0.2227,0.0894,-0.0338,0.0351,0.0343,0.2319,-0.0189,-0.0949,0.1679,0.0638,-0.0727,0.1679,-0.0476,0.0122,0.2319,-0.0189,-0.0949,0.1679,-0.1855,-0.0497,0.0241,-0.1828,-0.0529,0.0241,-0.2134,0.0546,0.0865,-0.0476,0.0122,0.2319,0.0638,-0.0727,0.1679,-0.1828,-0.0529,0.0241,0.1848,0.0456,0.0241,-0.0189,-0.0949,0.1679,0.1855,0.0497,0.0241,0.0638,-0.0727,0.1679,0.1848,0.0456,0.0241,0.1575,0.154,0.0865,0.0351,0.0343,0.2319,-0.2227,0.0894,0.0241,0.1575,0.154,0.0865,0.1482,0.1888,0.0241,0.0351,0.0343,0.2319,-0.0476,0.0122,0.2319,-0.2134,0.0546,0.0865,-0.2062,0.0276,-0.1323,0.2227,-0.0894,-0.2319,-0.1482,-0.1888,-0.2319,0.1648,0.127,-0.1323,-0.2227,0.0894,-0.0338,0.1482,0.1888,0.0241,0.1482,0.1888,-0.0338,-0.2227,0.0894,0.0241,-0.1482,-0.1888,0.0241,-0.2062,0.0276,-0.1323,-0.1482,-0.1888,-0.2319,-0.2227,0.0894,-0.0338,-0.2227,0.0894,0.0241,-0.1855,-0.0497,0.0241,-0.2134,0.0546,0.0865,0.1575,0.154,0.0865,0.1855,0.0497,0.0241,0.1482,0.1888,0.0241,0.2227,-0.0894,0.0241,0.1482,0.1888,-0.0338,0.1648,0.127,-0.1323,0.2227,-0.0894,-0.2319,-0.1482,-0.1888,0.0241,0.2227,-0.0894,-0.2319,0.2227,-0.0894,0.0241,-0.1482,-0.1888,-0.2319,0.1848,0.0456,0.0241,0.2227,-0.0894,0.0241,0.1855,0.0497,0.0241,-0.1482,-0.1888,0.0241,-0.1828,-0.0529,0.0241,-0.1855,-0.0497,0.0241],
    normals: [-0.168,0.627,-0.7607,-0.2481,0.9261,-0.2842,-0.168,0.627,-0.7607,-0.2481,0.9261,-0.2842,0.5138,-0.3346,0.79,-0.2776,-0.5466,0.79,0.5138,-0.3346,0.79,-0.2776,-0.5466,0.79,-0.2776,-0.5466,0.79,-0.8884,-0.3863,0.248,-0.636,-0.5143,0.5754,-0.8569,-0.4136,0.3078,-0.2776,-0.5466,0.79,0.2241,-0.8365,-0.5,0.2241,-0.8365,-0.5,0.2241,-0.8365,-0.5,0.2241,-0.8365,-0.5,0.9625,0.1097,0.248,0.5138,-0.3346,0.79,0.8079,-0.1274,0.5754,0.9489,0.0703,0.3078,0.5138,-0.3346,0.79,-0.25,0.933,0.2588,-0.2241,0.8365,0.5,-0.25,0.933,0.2588,-0.2241,0.8365,0.5,-0.2241,0.8365,0.5,-0.2241,0.8365,0.5,-0.168,0.627,-0.7607,-0.1051,0.3923,-0.9138,-0.1051,0.3923,-0.9138,-0.168,0.627,-0.7607,-0.2481,0.9261,-0.2842,-0.25,0.933,0.2588,-0.2481,0.9261,-0.2842,-0.25,0.933,0.2588,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.8884,-0.3863,0.248,-0.8569,-0.4136,0.3078,0.9489,0.0703,0.3078,0.9625,0.1097,0.248,0.9659,0.2588,0,0.9659,0.2588,0,0.9659,0.2588,0,0.9659,0.2588,0,0.9659,0.2588,0,0.2588,-0.9659,0,0.2588,-0.9659,0,0.2588,-0.9659,0,0.2588,-0.9659,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,11,8,12,13,14,15,14,13,16,17,18,19,18,17,20,18,20,21,22,23,24,23,22,25,25,22,26,26,22,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,39,36,40,40,36,41,40,41,42,43,44,45,46,45,44,46,47,45,46,48,47,48,46,49,50,51,52,51,50,53,54,55,56,55,54,57,57,54,58,59,57,58],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "cone-04",
    shape: {
      form: "cone", taper: 0.24949, symmetry: "handed", longest: 0.405965,
      aspect: [1, 0.993273, 0.729191],
      size: [0.403234, 0.296026, 0.405965],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.211476, sunkUnitsMean: 0.211476, sunkUnitsMax: 0.211476,
      sunkFractionMin: 0.714383, sunkFractionMean: 0.714383, sunkFractionMax: 0.714383,
    },
    roles: ["ear"],
    tris: 62,
    verts: 112,
    triVariants: [62],
    size: [0.403234, 0.296026, 0.405965],
    offset: [0.300476, 1.367787, 0.347018],
    provenance: [
      { species: "hog", node: "body", ordinal: 2, role: "ear", name: "ear-right" },
    ],
    positions: [0.1176,0.0227,-0.0199,0.1184,-0.0614,-0.0947,0.0552,0.012,-0.0686,0.056,-0.0667,-0.1386,-0.0226,0.0883,0.0292,-0.0919,0.0174,-0.0066,-0.0259,0.1063,0.11,-0.0998,0.0305,0.0717,0.0981,0.1018,0.0577,0.037,0.0861,0.0041,0.0748,0.1463,0.1061,0.0217,0.1152,0.0358,-0.159,-0.0514,0.0222,-0.1473,-0.0594,-0.053,-0.2016,-0.1371,-0.037,-0.1866,-0.1386,-0.1077,0.0357,0.148,0.145,0.0277,0.148,0.126,-0.0041,0.1064,0.1618,-0.0259,0.1063,0.11,0.0124,0.1156,0.0397,-0.0226,0.0883,0.0292,0.0277,0.148,0.126,-0.0259,0.1063,0.11,0.1176,0.0227,-0.0199,0.0552,0.012,-0.0686,0.0981,0.1018,0.0577,0.037,0.0861,0.0041,-0.0856,-0.051,0.1965,-0.159,-0.0514,0.0222,-0.1005,-0.1365,0.203,-0.2016,-0.1371,-0.037,0.0748,0.1463,0.1061,0.0217,0.1152,0.0358,0.0277,0.148,0.126,0.0124,0.1156,0.0397,0.0124,0.1156,0.0397,0.0217,0.1152,0.0358,-0.0226,0.0883,0.0292,0.037,0.0861,0.0041,-0.0919,0.0174,-0.0066,0.0552,0.012,-0.0686,-0.1473,-0.0594,-0.053,0.056,-0.0667,-0.1386,-0.1866,-0.1386,-0.1077,0.0394,-0.1468,-0.203,0.0828,0.1463,0.1251,0.12,0.1019,0.1095,0.0748,0.1463,0.1061,0.0981,0.1018,0.0577,0.1643,0.0229,0.091,0.1918,-0.0611,0.0796,0.1176,0.0227,-0.0199,0.1184,-0.0614,-0.0947,0.1918,-0.0611,0.0796,0.2016,-0.1475,0.0757,0.1184,-0.0614,-0.0947,0.1005,-0.148,-0.1643,0.2016,-0.1475,0.0757,0.1918,-0.0611,0.0796,0.1485,-0.1455,0.0981,0.1122,-0.0448,0.1131,0.1643,0.0229,0.091,0.0559,0.0347,0.1367,0.12,0.1019,0.1095,0.0357,0.148,0.145,-0.0041,0.1064,0.1618,0.0828,0.1463,0.1251,-0.0531,0.0308,0.1826,-0.0051,-0.0406,0.1626,-0.0856,-0.051,0.1965,-0.1005,-0.1365,0.203,-0.0474,-0.1385,0.1806,-0.0998,0.0305,0.0717,-0.0919,0.0174,-0.0066,-0.159,-0.0514,0.0222,-0.1473,-0.0594,-0.053,0.0828,0.1463,0.1251,0.0748,0.1463,0.1061,0.0357,0.148,0.145,0.0277,0.148,0.126,-0.0531,0.0308,0.1826,-0.0998,0.0305,0.0717,-0.0856,-0.051,0.1965,-0.159,-0.0514,0.0222,-0.0041,0.1064,0.1618,-0.0259,0.1063,0.11,-0.0531,0.0308,0.1826,-0.0998,0.0305,0.0717,0.056,-0.0667,-0.1386,0.1184,-0.0614,-0.0947,0.0394,-0.1468,-0.203,0.1005,-0.148,-0.1643,0.12,0.1019,0.1095,0.1643,0.0229,0.091,0.0981,0.1018,0.0577,0.1176,0.0227,-0.0199,0.0331,-0.0424,0.0894,0.1122,-0.0448,0.1131,0.0559,0.0347,0.1367,0.1485,-0.1455,0.0981,0.1122,-0.0448,0.1131,0.0331,-0.0424,0.0894,0.0331,-0.0424,0.0894,0.0559,0.0347,0.1367,-0.0051,-0.0406,0.1626,-0.0474,-0.1385,0.1806,0.1485,-0.1455,0.0981,0.0331,-0.0424,0.0894,0.0331,-0.0424,0.0894,-0.0051,-0.0406,0.1626,-0.0474,-0.1385,0.1806],
    normals: [0.6538,0.5506,-0.519,0.7219,0.3941,-0.5688,0.0832,0.6784,-0.73,0.1143,0.6259,-0.7715,-0.4834,0.7397,-0.4681,-0.5381,0.7009,-0.4682,-0.6857,0.7252,0.0627,-0.7926,0.603,0.0905,0.5669,0.6799,-0.4651,0.0475,0.7205,-0.6918,0.2961,0.9077,-0.2972,-0.0294,0.8124,-0.5824,-0.8852,0.4523,0.1085,-0.5927,0.6515,-0.4735,-0.8911,0.4535,-0.0148,-0.5558,0.6418,-0.5284,-0.3313,0.9334,0.1375,-0.363,0.9316,-0.0195,-0.7002,0.6508,0.2936,-0.6857,0.7252,0.0627,-0.346,0.8239,-0.4489,-0.4834,0.7397,-0.4681,-0.363,0.9316,-0.0195,-0.6857,0.7252,0.0627,0.6538,0.5506,-0.519,0.0832,0.6784,-0.73,0.5669,0.6799,-0.4651,0.0475,0.7205,-0.6918,-0.8812,0.2932,0.3707,-0.8852,0.4523,0.1085,-0.9054,0.1868,0.3812,-0.8911,0.4535,-0.0148,0.2961,0.9077,-0.2972,-0.0294,0.8124,-0.5824,-0.363,0.9316,-0.0195,-0.346,0.8239,-0.4489,-0.346,0.8239,-0.4489,-0.0294,0.8124,-0.5824,-0.4834,0.7397,-0.4681,0.0475,0.7205,-0.6918,-0.5381,0.7009,-0.4682,0.0832,0.6784,-0.73,-0.5927,0.6515,-0.4735,0.1143,0.6259,-0.7715,-0.5558,0.6418,-0.5284,0.0488,0.6199,-0.7832,0.3864,0.9075,-0.1649,0.7376,0.5988,-0.3122,0.2961,0.9077,-0.2972,0.5669,0.6799,-0.4651,0.8319,0.4294,-0.3516,0.8969,0.2289,-0.3785,0.6538,0.5506,-0.519,0.7219,0.3941,-0.5688,0.8969,0.2289,-0.3785,0.9146,0.1209,-0.3858,0.7219,0.3941,-0.5688,0.638,0.3981,-0.6592,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,0.3884,0.0021,0.9215,-0.7926,0.603,0.0905,-0.5381,0.7009,-0.4682,-0.8852,0.4523,0.1085,-0.5927,0.6515,-0.4735,0.3864,0.9075,-0.1649,0.2961,0.9077,-0.2972,-0.3313,0.9334,0.1375,-0.363,0.9316,-0.0195,-0.8044,0.4886,0.3379,-0.7926,0.603,0.0905,-0.8812,0.2932,0.3707,-0.8852,0.4523,0.1085,-0.7002,0.6508,0.2936,-0.6857,0.7252,0.0627,-0.8044,0.4886,0.3379,-0.7926,0.603,0.0905,0.1143,0.6259,-0.7715,0.7219,0.3941,-0.5688,0.0488,0.6199,-0.7832,0.638,0.3981,-0.6592,0.7376,0.5988,-0.3122,0.8319,0.4294,-0.3516,0.5669,0.6799,-0.4651,0.6538,0.5506,-0.519,0.3752,-0.1915,0.9069,-0.2815,-0.3162,0.906,0.3039,-0.5618,0.7695,0.1176,0.2128,0.97,-0.2815,-0.3162,0.906,0.3752,-0.1915,0.9069,0.3752,-0.1915,0.9069,0.3039,-0.5618,0.7695,0.8243,-0.3562,0.44,0.6246,0.1944,0.7563,0.1176,0.2128,0.97,0.3752,-0.1915,0.9069,0.3752,-0.1915,0.9069,0.8243,-0.3562,0.44,0.6246,0.1944,0.7563],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,37,39,38,38,39,40,39,41,40,40,41,42,41,43,42,42,43,44,45,44,43,46,47,48,49,48,47,50,51,52,53,52,51,54,55,56,57,56,55,58,59,60,61,60,59,62,61,59,63,61,62,64,63,62,65,66,67,67,66,64,64,66,63,66,68,63,63,68,69,68,70,69,70,71,69,72,69,71,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "cone-05",
    shape: {
      form: "cone", taper: 0.24949, symmetry: "handed", longest: 0.405965,
      aspect: [1, 0.993273, 0.729191],
      size: [0.403234, 0.296026, 0.405965],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.211476, sunkUnitsMean: 0.211476, sunkUnitsMax: 0.211476,
      sunkFractionMin: 0.714383, sunkFractionMean: 0.714383, sunkFractionMax: 0.714383,
    },
    roles: ["ear"],
    tris: 62,
    verts: 112,
    triVariants: [62],
    size: [0.403234, 0.296026, 0.405965],
    offset: [-0.300476, 1.367787, 0.347018],
    provenance: [
      { species: "hog", node: "body", ordinal: 3, role: "ear", name: "ear-left" },
    ],
    positions: [-0.0748,0.1463,0.1061,-0.0357,0.148,0.145,-0.0277,0.148,0.126,-0.0828,0.1463,0.1251,-0.2016,-0.1475,0.0757,-0.1184,-0.0614,-0.0947,-0.1005,-0.148,-0.1643,-0.1918,-0.0611,0.0796,-0.0124,0.1156,0.0397,-0.0748,0.1463,0.1061,-0.0277,0.148,0.126,-0.0217,0.1152,0.0358,-0.1184,-0.0614,-0.0947,-0.0552,0.012,-0.0686,-0.056,-0.0667,-0.1386,-0.1176,0.0227,-0.0199,-0.037,0.0861,0.0041,-0.0748,0.1463,0.1061,-0.0217,0.1152,0.0358,-0.0981,0.1018,0.0577,0.0919,0.0174,-0.0066,0.159,-0.0514,0.0222,0.1473,-0.0594,-0.053,0.0998,0.0305,0.0717,0.0226,0.0883,0.0292,0.0998,0.0305,0.0717,0.0919,0.0174,-0.0066,0.0259,0.1063,0.11,-0.1176,0.0227,-0.0199,-0.037,0.0861,0.0041,-0.0552,0.012,-0.0686,-0.0981,0.1018,0.0577,0.0856,-0.051,0.1965,0.0474,-0.1385,0.1806,0.1005,-0.1365,0.203,0.0051,-0.0406,0.1626,0.0531,0.0308,0.1826,-0.0559,0.0347,0.1367,0.0041,0.1064,0.1618,-0.12,0.1019,0.1095,-0.0357,0.148,0.145,-0.0828,0.1463,0.1251,-0.1643,0.0229,0.091,-0.1122,-0.0448,0.1131,-0.1918,-0.0611,0.0796,-0.1485,-0.1455,0.0981,-0.2016,-0.1475,0.0757,0.0226,0.0883,0.0292,-0.0277,0.148,0.126,0.0259,0.1063,0.11,-0.0124,0.1156,0.0397,-0.1918,-0.0611,0.0796,-0.1176,0.0227,-0.0199,-0.1184,-0.0614,-0.0947,-0.1643,0.0229,0.091,-0.12,0.1019,0.1095,-0.0748,0.1463,0.1061,-0.0981,0.1018,0.0577,-0.0828,0.1463,0.1251,-0.1643,0.0229,0.091,-0.0981,0.1018,0.0577,-0.1176,0.0227,-0.0199,-0.12,0.1019,0.1095,0.159,-0.0514,0.0222,0.1005,-0.1365,0.203,0.2016,-0.1371,-0.037,0.0856,-0.051,0.1965,-0.1005,-0.148,-0.1643,-0.056,-0.0667,-0.1386,-0.0394,-0.1468,-0.203,-0.1184,-0.0614,-0.0947,0.1473,-0.0594,-0.053,0.2016,-0.1371,-0.037,0.1866,-0.1386,-0.1077,0.159,-0.0514,0.0222,0.0259,0.1063,0.11,0.0531,0.0308,0.1826,0.0998,0.0305,0.0717,0.0041,0.1064,0.1618,0.0998,0.0305,0.0717,0.0856,-0.051,0.1965,0.159,-0.0514,0.0222,0.0531,0.0308,0.1826,-0.056,-0.0667,-0.1386,0.1866,-0.1386,-0.1077,-0.0394,-0.1468,-0.203,0.1473,-0.0594,-0.053,-0.0552,0.012,-0.0686,0.0919,0.0174,-0.0066,-0.037,0.0861,0.0041,0.0226,0.0883,0.0292,-0.0124,0.1156,0.0397,-0.0217,0.1152,0.0358,-0.0277,0.148,0.126,0.0041,0.1064,0.1618,0.0259,0.1063,0.11,-0.0357,0.148,0.145,-0.0559,0.0347,0.1367,-0.0331,-0.0424,0.0894,0.0051,-0.0406,0.1626,-0.1122,-0.0448,0.1131,-0.1485,-0.1455,0.0981,-0.0331,-0.0424,0.0894,-0.0559,0.0347,0.1367,-0.1122,-0.0448,0.1131,-0.0331,-0.0424,0.0894,0.0051,-0.0406,0.1626,-0.0331,-0.0424,0.0894,0.0474,-0.1385,0.1806,-0.0331,-0.0424,0.0894,-0.1485,-0.1455,0.0981,0.0474,-0.1385,0.1806],
    normals: [-0.2961,0.9077,-0.2972,0.3313,0.9334,0.1375,0.363,0.9316,-0.0195,-0.3864,0.9075,-0.1649,-0.9146,0.1209,-0.3858,-0.7219,0.3941,-0.5688,-0.638,0.3981,-0.6592,-0.8969,0.2289,-0.3785,0.346,0.8239,-0.4489,-0.2961,0.9077,-0.2972,0.363,0.9316,-0.0195,0.0294,0.8124,-0.5824,-0.7219,0.3941,-0.5688,-0.0832,0.6784,-0.73,-0.1143,0.6259,-0.7715,-0.6538,0.5506,-0.519,-0.0475,0.7205,-0.6918,-0.2961,0.9077,-0.2972,0.0294,0.8124,-0.5824,-0.5669,0.6799,-0.4651,0.5381,0.7009,-0.4682,0.8852,0.4523,0.1085,0.5927,0.6515,-0.4735,0.7926,0.603,0.0905,0.4834,0.7397,-0.4681,0.7926,0.603,0.0905,0.5381,0.7009,-0.4682,0.6857,0.7252,0.0627,-0.6538,0.5506,-0.519,-0.0475,0.7205,-0.6918,-0.0832,0.6784,-0.73,-0.5669,0.6799,-0.4651,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,-0.3884,0.0021,0.9215,0.4834,0.7397,-0.4681,0.363,0.9316,-0.0195,0.6857,0.7252,0.0627,0.346,0.8239,-0.4489,-0.8969,0.2289,-0.3785,-0.6538,0.5506,-0.519,-0.7219,0.3941,-0.5688,-0.8319,0.4294,-0.3516,-0.7376,0.5988,-0.3122,-0.2961,0.9077,-0.2972,-0.5669,0.6799,-0.4651,-0.3864,0.9075,-0.1649,-0.8319,0.4294,-0.3516,-0.5669,0.6799,-0.4651,-0.6538,0.5506,-0.519,-0.7376,0.5988,-0.3122,0.8852,0.4523,0.1085,0.9054,0.1868,0.3812,0.8911,0.4535,-0.0148,0.8812,0.2932,0.3707,-0.638,0.3981,-0.6592,-0.1143,0.6259,-0.7715,-0.0488,0.6199,-0.7832,-0.7219,0.3941,-0.5688,0.5927,0.6515,-0.4735,0.8911,0.4535,-0.0148,0.5558,0.6418,-0.5284,0.8852,0.4523,0.1085,0.6857,0.7252,0.0627,0.8044,0.4886,0.3379,0.7926,0.603,0.0905,0.7002,0.6508,0.2936,0.7926,0.603,0.0905,0.8812,0.2932,0.3707,0.8852,0.4523,0.1085,0.8044,0.4886,0.3379,-0.1143,0.6259,-0.7715,0.5558,0.6418,-0.5284,-0.0488,0.6199,-0.7832,0.5927,0.6515,-0.4735,-0.0832,0.6784,-0.73,0.5381,0.7009,-0.4682,-0.0475,0.7205,-0.6918,0.4834,0.7397,-0.4681,0.346,0.8239,-0.4489,0.0294,0.8124,-0.5824,0.363,0.9316,-0.0195,0.7002,0.6508,0.2936,0.6857,0.7252,0.0627,0.3313,0.9334,0.1375,-0.3039,-0.5618,0.7695,-0.3752,-0.1915,0.9069,-0.8243,-0.3562,0.44,0.2815,-0.3162,0.906,-0.1176,0.2128,0.97,-0.3752,-0.1915,0.9069,-0.3039,-0.5618,0.7695,0.2815,-0.3162,0.906,-0.3752,-0.1915,0.9069,-0.8243,-0.3562,0.44,-0.3752,-0.1915,0.9069,-0.6246,0.1944,0.7563,-0.3752,-0.1915,0.9069,-0.1176,0.2128,0.97,-0.6246,0.1944,0.7563],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,35,32,36,35,36,37,37,36,38,39,37,38,39,38,40,39,40,41,42,37,39,42,43,37,44,43,42,44,45,43,45,44,46,47,48,49,48,47,50,51,52,53,52,51,54,55,56,57,56,55,58,59,60,61,60,59,62,63,64,65,64,63,66,67,68,69,68,67,70,71,72,73,72,71,74,75,76,77,76,75,78,79,80,81,80,79,82,83,84,85,84,83,86,86,83,87,86,87,88,88,87,89,88,89,90,90,89,91,91,89,92,93,94,95,94,93,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "cone-06",
    shape: {
      form: "cone", taper: 0, symmetry: "mirror", longest: 0.401429,
      aspect: [1, 0.99644, 0.714642],
      size: [0.4, 0.401429, 0.286878],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.103528, sunkUnitsMean: 0.103528, sunkUnitsMax: 0.103528,
      sunkFractionMin: 0.360878, sunkFractionMean: 0.360878, sunkFractionMax: 0.360878,
    },
    roles: ["nose"],
    tris: 28,
    verts: 48,
    triVariants: [28],
    size: [0.4, 0.401429, 0.286878],
    offset: [0, 0.718036, 0.664911],
    provenance: [
      { species: "parrot", node: "body", ordinal: 3, role: "nose", name: "beak" },
    ],
    positions: [0.0859,-0.0853,0.0905,-0.0859,-0.0853,0.0905,0,-0.0996,0.0867,-0.162,-0.0442,0.1015,0.162,-0.0442,0.1015,0.1146,0.0664,0.1312,-0.1146,0.0664,0.1312,0,0.1122,0.1434,-0.2,0.0075,-0.0917,-0.1146,0.0664,0.1312,-0.1414,0.1441,-0.0551,-0.162,-0.0442,0.1015,-0.1414,0.1441,-0.0551,0,0.1122,0.1434,0,0.2007,-0.0399,-0.1146,0.0664,0.1312,0.1146,0.0664,0.1312,0.2,0.0075,-0.0917,0.1414,0.1441,-0.0551,0.162,-0.0442,0.1015,0,0.2007,-0.0399,0.1146,0.0664,0.1312,0.1414,0.1441,-0.0551,0,0.1122,0.1434,-0.1414,-0.1291,-0.1283,-0.162,-0.0442,0.1015,-0.2,0.0075,-0.0917,-0.1146,-0.1549,0.0719,0,-0.2007,0.0596,-0.1414,-0.1291,-0.1283,0,-0.1857,-0.1434,-0.1146,-0.1549,0.0719,0.2,0.0075,-0.0917,0.1146,-0.1549,0.0719,0.1414,-0.1291,-0.1283,0.162,-0.0442,0.1015,0.1146,-0.1549,0.0719,0,-0.1857,-0.1434,0.1414,-0.1291,-0.1283,0,-0.2007,0.0596,0.1146,-0.1549,0.0719,-0.1146,-0.1549,0.0719,0,-0.2007,0.0596,0.0859,-0.0853,0.0905,0.162,-0.0442,0.1015,0,-0.0996,0.0867,-0.0859,-0.0853,0.0905,-0.162,-0.0442,0.1015],
    normals: [0,-0.2588,0.9659,0,-0.2588,0.9659,0,-0.2588,0.9659,-0.586,0.0343,0.8096,0.586,0.0343,0.8096,0.5054,0.3072,0.8063,-0.5054,0.3072,0.8063,0,0.5095,0.8605,-0.91,0.3193,0.2646,-0.5054,0.3072,0.8063,-0.6947,0.6227,0.3601,-0.586,0.0343,0.8096,-0.6947,0.6227,0.3601,0,0.5095,0.8605,0,0.9006,0.4346,-0.5054,0.3072,0.8063,0.5054,0.3072,0.8063,0.91,0.3193,0.2646,0.6947,0.6227,0.3601,0.586,0.0343,0.8096,0,0.9006,0.4346,0.5054,0.3072,0.8063,0.6947,0.6227,0.3601,0,0.5095,0.8605,-0.6947,-0.7193,0.0005,-0.7962,-0.4498,0.4047,-0.91,-0.4088,0.0694,-0.5054,-0.6692,0.5447,0,-0.8715,0.4905,-0.6947,-0.7193,0.0005,0,-0.9973,-0.074,-0.5054,-0.6692,0.5447,0.91,-0.4088,0.0694,0.5054,-0.6692,0.5447,0.6947,-0.7193,0.0005,0.7962,-0.4498,0.4047,0.5054,-0.6692,0.5447,0,-0.9973,-0.074,0.6947,-0.7193,0.0005,0,-0.8715,0.4905,0.5054,-0.6692,0.5447,-0.5054,-0.6692,0.5447,0,-0.8715,0.4905,0,-0.2588,0.9659,0.7962,-0.4498,0.4047,0,-0.2588,0.9659,0,-0.2588,0.9659,-0.7962,-0.4498,0.4047],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,3,5,6,6,5,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,43,40,44,41,43,45,46,41,45,41,46,47],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "plate-01",
    shape: {
      form: "plate", taper: 0.976265, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.80052, 0],
      size: [0.4, 0.320208, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 15,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 27,
    verts: 31,
    triVariants: [27],
    size: [0.4, 0.320208, 0],
    offset: [0.2625, 0.933646, 0.635],
    provenance: [
      { species: "beaver", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
      { species: "bee", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "bunny", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
      { species: "cow", node: "body", ordinal: 3, role: "eye", name: "eye card (flat cut-out)" },
      { species: "crab", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
      { species: "deer", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
      { species: "dog", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
      { species: "elephant", node: "body", ordinal: 8, role: "eye", name: "eye card (flat cut-out)" },
      { species: "fox", node: "body", ordinal: 2, role: "eye", name: "eye card (flat cut-out)" },
      { species: "giraffe", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "hog", node: "body", ordinal: 8, role: "eye", name: "eye card (flat cut-out)" },
      { species: "koala", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "lion", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "pig", node: "body", ordinal: 3, role: "eye", name: "eye card (flat cut-out)" },
      { species: "polar", node: "body", ordinal: 3, role: "eye", name: "eye card (flat cut-out)" },
      { species: "tiger", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [-0.0197,-0.144,0,-0.1399,-0.144,0,-0.0798,-0.1601,0,-0.1839,-0.1,0,0.0243,-0.1,0,-0.2,-0.0399,0,0.0404,-0.0399,0,0.0243,0.0202,0,-0.1839,0.0202,0,-0.1399,0.0642,0,-0.0197,0.0642,0,-0.0798,0.0803,0,0.1082,-0.1525,0,-0.0798,-0.1601,0,0.0607,-0.1601,0,-0.0197,-0.144,0,0.1511,-0.1305,0,0.0243,-0.1,0,0.1849,-0.0962,0,0.0404,-0.0399,0,0.2,-0.0399,0,0.1732,0.0601,0,0.0243,0.0202,0,-0.0197,0.0642,0,0.1,0.1333,0,-0.0798,0.0803,0,-0.1,0.1333,0,0,0.1601,0,-0.1399,0.0642,0,-0.1732,0.0601,0,-0.1839,0.0202,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,5,4,6,5,6,7,5,7,8,8,7,9,9,7,10,9,10,11,12,13,14,13,12,15,15,12,16,15,16,17,17,16,18,17,18,19,19,18,20,19,20,21,19,21,22,22,21,23,23,21,24,23,24,25,26,25,24,26,24,27,26,28,25,29,28,26,28,29,30],
    bands: [15,15,15,15,15,15,15,15,15,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "plate-02",
    shape: {
      form: "plate", taper: 0.976265, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.80052, 0],
      size: [0.4, 0.320208, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 15,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 27,
    verts: 31,
    triVariants: [27],
    size: [0.4, 0.320208, 0],
    offset: [-0.2625, 0.933646, 0.635],
    provenance: [
      { species: "beaver", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "bee", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
      { species: "bunny", node: "body", ordinal: 8, role: "eye", name: "eye card (flat cut-out)" },
      { species: "cow", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
      { species: "crab", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "deer", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "dog", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
      { species: "elephant", node: "body", ordinal: 9, role: "eye", name: "eye card (flat cut-out)" },
      { species: "fox", node: "body", ordinal: 3, role: "eye", name: "eye card (flat cut-out)" },
      { species: "giraffe", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
      { species: "hog", node: "body", ordinal: 9, role: "eye", name: "eye card (flat cut-out)" },
      { species: "koala", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
      { species: "lion", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
      { species: "pig", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
      { species: "polar", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
      { species: "tiger", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [0.0798,0.0803,0,0.0197,0.0642,0,0.1399,0.0642,0,-0.0243,0.0202,0,0.1839,0.0202,0,0.2,-0.0399,0,-0.0404,-0.0399,0,-0.0243,-0.1,0,0.1839,-0.1,0,0.0197,-0.144,0,0.1399,-0.144,0,0.0798,-0.1601,0,0.1839,0.0202,0,0.1732,0.0601,0,0.1399,0.0642,0,0.1,0.1333,0,0.0798,0.0803,0,0,0.1601,0,-0.1,0.1333,0,0.0197,0.0642,0,-0.1732,0.0601,0,-0.0243,0.0202,0,-0.0404,-0.0399,0,-0.2,-0.0399,0,-0.1849,-0.0962,0,-0.0243,-0.1,0,-0.1511,-0.1305,0,0.0197,-0.144,0,-0.1082,-0.1525,0,0.0798,-0.1601,0,-0.0607,-0.1601,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,3,2,2,3,4,4,3,5,3,6,5,6,7,5,5,7,8,7,9,8,8,9,10,11,10,9,12,13,14,15,14,13,16,14,15,17,18,15,18,16,15,16,18,19,18,20,19,19,20,21,21,20,22,20,23,22,23,24,22,22,24,25,24,26,25,25,26,27,26,28,27,27,28,29,30,29,28],
    bands: [15,15,15,15,15,15,15,15,15,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "plate-03",
    shape: {
      form: "plate", taper: 1, symmetry: "mirror", longest: 0.236581,
      aspect: [1, 0.426285, 0],
      size: [0.236581, 0.100851, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 4,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["card"],
    tris: 12,
    verts: 14,
    triVariants: [12],
    size: [0.236581, 0.100851, 0],
    offset: [0, 0.686849, 0.635],
    provenance: [
      { species: "bee", node: "body", ordinal: 8, role: "card", name: "face-plate (flat cut-out sheet)" },
      { species: "caterpillar", node: "body", ordinal: 10, role: "card", name: "face-plate (flat cut-out sheet)" },
      { species: "fish", node: "body", ordinal: 5, role: "card", name: "face-plate (flat cut-out sheet)" },
      { species: "monkey", node: "body", ordinal: 9, role: "card", name: "face-plate (flat cut-out sheet)" },
    ],
    positions: [0.071,0.0398,0,0.1183,0.0338,0,0.0964,0.0504,0,0.0396,0.0139,0,0.1148,0.0065,0,0,0.0046,0,0.0641,-0.0354,0,-0.1148,0.0065,0,-0.0396,0.0139,0,-0.0641,-0.0354,0,0,-0.0504,0,-0.1183,0.0338,0,-0.071,0.0398,0,-0.0964,0.0504,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,3,1,0,3,4,1,5,4,3,4,5,6,7,6,5,7,5,8,9,6,7,6,9,10,7,8,11,11,8,12,11,12,13],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-04",
    shape: {
      form: "plate", taper: 1, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.875, 0],
      size: [0.4, 0.35, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 34,
    verts: 38,
    triVariants: [34],
    size: [0.4, 0.35, 0],
    offset: [0.2625, 0.88875, 0.635],
    provenance: [
      { species: "cat", node: "body", ordinal: 3, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [-0.0197,-0.1271,0,-0.1399,-0.1271,0,-0.0798,-0.1351,0,-0.144,-0.125,0,-0.0156,-0.125,0,0.0243,-0.0851,0,-0.1839,-0.0851,0,0.0404,-0.025,0,-0.2,-0.025,0,-0.1839,0.0351,0,0.0243,0.0351,0,-0.1399,0.0791,0,-0.0197,0.0791,0,-0.0798,0.0952,0,-0.1399,0.0791,0,-0.1732,0.075,0,-0.1839,0.0351,0,-0.1,0.1482,0,-0.0798,0.0952,0,0.1,0.1482,0,0,0.175,0,-0.0197,0.0791,0,0.1732,0.075,0,0.0243,0.0351,0,0.0404,-0.025,0,0.2,-0.025,0,0.0243,-0.0851,0,-0.0156,-0.125,0,0.1732,-0.125,0,-0.0197,-0.1271,0,-0.0798,-0.1351,0,0.1,-0.1616,0,-0.1732,-0.125,0,-0.1399,-0.1271,0,-0.144,-0.125,0,-0.1839,-0.0851,0,-0.1,-0.1616,0,0,-0.175,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,3,5,6,6,5,7,6,7,8,8,7,9,9,7,10,9,10,11,11,10,12,11,12,13,14,15,16,15,14,17,17,14,18,17,18,19,17,19,20,21,19,18,21,22,19,23,22,21,24,22,23,24,25,22,26,25,24,27,25,26,27,28,25,29,28,27,30,28,29,28,30,31,32,31,30,32,30,33,32,33,34,32,34,35,36,31,32,31,36,37],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-05",
    shape: {
      form: "plate", taper: 1, symmetry: "mirror", longest: 0.4,
      aspect: [1, 0.875, 0],
      size: [0.4, 0.35, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 34,
    verts: 38,
    triVariants: [34],
    size: [0.4, 0.35, 0],
    offset: [-0.2625, 0.88875, 0.635],
    provenance: [
      { species: "cat", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [0.0798,0.0952,0,0.0197,0.0791,0,0.1399,0.0791,0,-0.0243,0.0351,0,0.1839,0.0351,0,-0.0404,-0.025,0,0.2,-0.025,0,0.1839,-0.0851,0,-0.0243,-0.0851,0,0.144,-0.125,0,0.0156,-0.125,0,0.0197,-0.1271,0,0.1399,-0.1271,0,0.0798,-0.1351,0,0,-0.175,0,0.1,-0.1616,0,-0.1,-0.1616,0,0.1732,-0.125,0,0.1839,-0.0851,0,0.144,-0.125,0,0.1399,-0.1271,0,0.0798,-0.1351,0,-0.1732,-0.125,0,0.0197,-0.1271,0,0.0156,-0.125,0,-0.2,-0.025,0,-0.0243,-0.0851,0,-0.0404,-0.025,0,-0.1732,0.075,0,-0.0243,0.0351,0,0.0197,0.0791,0,-0.1,0.1482,0,0.0798,0.0952,0,0,0.175,0,0.1,0.1482,0,0.1399,0.0791,0,0.1732,0.075,0,0.1839,0.0351,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,3,2,2,3,4,3,5,4,4,5,6,6,5,7,5,8,7,7,8,9,8,10,9,10,11,9,9,11,12,13,12,11,14,15,16,17,16,15,18,19,17,19,20,17,20,21,17,21,16,17,16,21,22,23,22,21,24,22,23,25,22,24,26,25,24,27,25,26,28,25,27,29,28,27,30,28,29,31,28,30,32,31,30,33,31,34,31,32,34,32,35,34,34,35,36,37,36,35],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-06",
    shape: {
      form: "plate", taper: 0.890898, symmetry: "mirror", longest: 0.32978,
      aspect: [1, 0.837959, 0],
      size: [0.32978, 0.276342, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 25,
    verts: 29,
    triVariants: [25],
    size: [0.32978, 0.276342, 0],
    offset: [0.22739, 0.939252, 0.635],
    provenance: [
      { species: "caterpillar", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [0.1175,-0.1382,0,0.0082,-0.1227,0,-0.0495,-0.1382,0,0.1357,-0.1228,0,0.1649,-0.0417,0,0.0504,-0.0805,0,0.0659,-0.0228,0,0.1496,0.0431,0,0.0504,0.0349,0,0.0082,0.0772,0,0.094,0.109,0,-0.0495,0.0926,0,-0.0719,0.1229,0,0.0129,0.1382,0,-0.1072,0.0772,0,-0.1378,0.0673,0,-0.1494,0.0349,0,0.0082,-0.1227,0,-0.1072,-0.1227,0,-0.0495,-0.1382,0,0.0504,-0.0805,0,-0.1494,-0.0805,0,0.0659,-0.0228,0,-0.1649,-0.0228,0,0.0504,0.0349,0,-0.1494,0.0349,0,0.0082,0.0772,0,-0.1072,0.0772,0,-0.0495,0.0926,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3,1,3,4,1,4,5,5,4,6,6,4,7,6,7,8,8,7,9,9,7,10,9,10,11,12,11,10,12,10,13,12,14,11,15,14,12,14,15,16,17,18,19,18,17,20,18,20,21,21,20,22,21,22,23,23,22,24,23,24,25,25,24,26,25,26,27,27,26,28],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-07",
    shape: {
      form: "plate", taper: 0.890898, symmetry: "mirror", longest: 0.32978,
      aspect: [1, 0.837959, 0],
      size: [0.32978, 0.276342, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 25,
    verts: 29,
    triVariants: [25],
    size: [0.32978, 0.276342, 0],
    offset: [-0.227389, 0.939252, 0.635],
    provenance: [
      { species: "caterpillar", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [0.1494,0.0349,0,0.1378,0.0673,0,0.1072,0.0772,0,0.0719,0.1229,0,0.0495,0.0926,0,-0.0129,0.1382,0,-0.094,0.109,0,-0.0082,0.0772,0,-0.1496,0.0431,0,-0.0504,0.0349,0,-0.0659,-0.0228,0,-0.1649,-0.0417,0,-0.0504,-0.0805,0,-0.0082,-0.1227,0,-0.1357,-0.1228,0,0.0495,-0.1382,0,-0.1175,-0.1382,0,0.0495,0.0926,0,-0.0082,0.0772,0,0.1072,0.0772,0,-0.0504,0.0349,0,0.1494,0.0349,0,0.1649,-0.0228,0,-0.0659,-0.0228,0,0.1494,-0.0805,0,-0.0504,-0.0805,0,0.1072,-0.1227,0,-0.0082,-0.1227,0,0.0495,-0.1382,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,3,2,1,4,2,3,5,6,3,6,4,3,4,6,7,6,8,7,7,8,9,9,8,10,8,11,10,10,11,12,12,11,13,11,14,13,13,14,15,16,15,14,17,18,19,18,20,19,19,20,21,21,20,22,20,23,22,22,23,24,23,25,24,24,25,26,25,27,26,28,26,27],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-08",
    shape: {
      form: "plate", taper: 1, symmetry: "radial", longest: 0.4,
      aspect: [1, 1, 0],
      size: [0.4, 0.4, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 5,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 30,
    verts: 34,
    triVariants: [30],
    size: [0.4, 0.4, 0],
    offset: [0.2625, 0.89375, 0.635],
    provenance: [
      { species: "chick", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
      { species: "fish", node: "body", ordinal: 3, role: "eye", name: "eye card (flat cut-out)" },
      { species: "monkey", node: "body", ordinal: 7, role: "eye", name: "eye card (flat cut-out)" },
      { species: "parrot", node: "body", ordinal: 1, role: "eye", name: "eye card (flat cut-out)" },
      { species: "penguin", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [-0.1,0.1732,0,0.1,0.1732,0,0,0.2,0,-0.0798,0.1202,0,-0.1399,0.1041,0,-0.1732,0.1,0,-0.1839,0.0601,0,-0.0197,0.1041,0,0.1732,0.1,0,0.0243,0.0601,0,0.0404,0,0,0.2,0,0,0.0243,-0.0601,0,0.1732,-0.1,0,-0.0197,-0.1041,0,-0.0798,-0.1202,0,0.1,-0.1732,0,-0.1732,-0.1,0,-0.1399,-0.1041,0,-0.1839,-0.0601,0,-0.1,-0.1732,0,0,-0.2,0,-0.0197,-0.1041,0,-0.1399,-0.1041,0,-0.0798,-0.1202,0,-0.1839,-0.0601,0,0.0243,-0.0601,0,0.0404,0,0,-0.2,0,0,0.0243,0.0601,0,-0.1839,0.0601,0,-0.0197,0.1041,0,-0.1399,0.1041,0,-0.0798,0.1202,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,3,1,0,0,4,3,5,4,0,4,5,6,7,1,3,7,8,1,9,8,7,10,8,9,10,11,8,12,11,10,12,13,11,14,13,12,15,13,14,13,15,16,17,16,15,17,15,18,17,18,19,20,16,17,16,20,21,22,23,24,23,22,25,25,22,26,25,26,27,25,27,28,28,27,29,28,29,30,30,29,31,30,31,32,32,31,33],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-09",
    shape: {
      form: "plate", taper: 1, symmetry: "radial", longest: 0.4,
      aspect: [1, 1, 0],
      size: [0.4, 0.4, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 5,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 30,
    verts: 34,
    triVariants: [30],
    size: [0.4, 0.4, 0],
    offset: [-0.2625, 0.89375, 0.635],
    provenance: [
      { species: "chick", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
      { species: "fish", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
      { species: "monkey", node: "body", ordinal: 8, role: "eye", name: "eye card (flat cut-out)" },
      { species: "parrot", node: "body", ordinal: 2, role: "eye", name: "eye card (flat cut-out)" },
      { species: "penguin", node: "body", ordinal: 6, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [0,-0.2,0,0.1,-0.1732,0,-0.1,-0.1732,0,0.1732,-0.1,0,0.1839,-0.0601,0,0.1399,-0.1041,0,0.0798,-0.1202,0,-0.1732,-0.1,0,0.0197,-0.1041,0,-0.0243,-0.0601,0,-0.2,0,0,-0.0404,0,0,-0.1732,0.1,0,-0.0243,0.0601,0,0.0197,0.1041,0,-0.1,0.1732,0,0.0798,0.1202,0,0.1839,0.0601,0,0.1732,0.1,0,0.1399,0.1041,0,0.1,0.1732,0,0,0.2,0,0.0798,0.1202,0,0.0197,0.1041,0,0.1399,0.1041,0,0.1839,0.0601,0,-0.0243,0.0601,0,0.2,0,0,-0.0404,0,0,0.1839,-0.0601,0,-0.0243,-0.0601,0,0.0197,-0.1041,0,0.1399,-0.1041,0,0.0798,-0.1202,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,3,2,1,4,5,3,5,6,3,6,2,3,2,6,7,8,7,6,9,7,8,10,7,9,11,10,9,12,10,11,13,12,11,14,12,13,15,12,14,16,15,14,17,18,19,20,19,18,16,19,20,20,15,16,21,15,20,22,23,24,24,23,25,23,26,25,25,26,27,26,28,27,27,28,29,28,30,29,30,31,29,29,31,32,33,32,31],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-10",
    shape: {
      form: "plate", taper: 1, symmetry: "radial", longest: 0.252879,
      aspect: [1, 0.964888, 0],
      size: [0, 0.244, 0.252879],
    },
    attachment: {
      axis: "x", dir: 1, n: 3,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["card"],
    tris: 10,
    verts: 12,
    triVariants: [10],
    size: [0, 0.244, 0.252879],
    offset: [0.635, 0.99675, -0.18606],
    provenance: [
      { species: "cow", node: "body", ordinal: 5, role: "card", name: "flank-patch card (flat marking, one side only)" },
      { species: "dog", node: "body", ordinal: 9, role: "card", name: "flank-patch card (flat marking, one side only)" },
      { species: "giraffe", node: "body", ordinal: 10, role: "card", name: "flank-patch card (flat marking, one side only)" },
    ],
    positions: [0,0.097,-0.0849,0,-0.025,-0.1264,0,0.025,-0.1264,0,-0.097,-0.0849,0,0.122,-0.0416,0,-0.122,-0.0416,0,0.122,0.0416,0,-0.122,0.0416,0,0.097,0.0849,0,-0.097,0.0849,0,-0.025,0.1264,0,0.025,0.1264],
    normals: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,5,4,6,5,6,7,7,6,8,7,8,9,9,8,10,10,8,11],
    bands: [15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-11",
    shape: {
      form: "plate", taper: 1, symmetry: "radial", longest: 0.433013,
      aspect: [1, 0.92376, 0],
      size: [0, 0.4, 0.433013],
    },
    attachment: {
      axis: "x", dir: 1, n: 3,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["card"],
    tris: 10,
    verts: 12,
    triVariants: [10],
    size: [0, 0.4, 0.433013],
    offset: [0.635, 0.69375, 0.095994],
    provenance: [
      { species: "cow", node: "body", ordinal: 6, role: "card", name: "flank-patch card (flat marking, one side only)" },
      { species: "dog", node: "body", ordinal: 10, role: "card", name: "flank-patch card (flat marking, one side only)" },
      { species: "giraffe", node: "body", ordinal: 11, role: "card", name: "flank-patch card (flat marking, one side only)" },
    ],
    positions: [0,0.175,-0.1299,0,-0.025,-0.2165,0,0.025,-0.2165,0,-0.175,-0.1299,0,0.2,-0.0866,0,-0.2,-0.0866,0,0.2,0.0866,0,-0.2,0.0866,0,0.175,0.1299,0,-0.175,0.1299,0,0.025,0.2165,0,-0.025,0.2165],
    normals: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,5,4,6,5,6,7,7,6,8,7,8,9,9,8,10,9,10,11],
    bands: [15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-12",
    shape: {
      form: "plate", taper: 1, symmetry: "radial", longest: 0.08,
      aspect: [1, 1, 0],
      size: [0.08, 0.08, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 4,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 2,
    verts: 4,
    triVariants: [2],
    size: [0.08, 0.08, 0],
    offset: [0.1, 0.75875, 0.835],
    provenance: [
      { species: "cow", node: "body", ordinal: 7, role: "nose", name: "nostril card (flat)" },
      { species: "cow", node: "body", ordinal: 8, role: "nose", name: "nostril card (flat)" },
      { species: "hog", node: "body", ordinal: 10, role: "nose", name: "nostril card (flat)" },
      { species: "hog", node: "body", ordinal: 11, role: "nose", name: "nostril card (flat)" },
    ],
    positions: [0.04,0.04,0,-0.04,-0.04,0,0.04,-0.04,0,-0.04,0.04,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3],
    bands: [15,15],
  },
  {
    id: "plate-13",
    shape: {
      form: "plate", taper: 1, symmetry: "mirror", longest: 0.21921,
      aspect: [1, 0.456184, 0],
      size: [0.21921, 0.1, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 4,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["card"],
    tris: 14,
    verts: 16,
    triVariants: [14],
    size: [0.21921, 0.1, 0],
    offset: [0, 0.69375, 0.66988],
    provenance: [
      { species: "crab", node: "body", ordinal: 7, role: "card", name: "face-plate (flat cut-out sheet)" },
      { species: "dog", node: "body", ordinal: 8, role: "card", name: "face-plate (flat cut-out sheet)" },
      { species: "lion", node: "body", ordinal: 9, role: "card", name: "face-plate (flat cut-out sheet)" },
      { species: "tiger", node: "body", ordinal: 8, role: "card", name: "face-plate (flat cut-out sheet)" },
    ],
    positions: [0.0607,0.0271,0,0.093,0.05,0,0.0709,0.05,0,0.1096,0.0243,0,0.0339,0.005,0,0.0981,-0.0014,0,0,-0.003,0,0.0548,-0.0372,0,-0.0981,-0.0014,0,-0.0339,0.005,0,-0.0548,-0.0372,0,0,-0.05,0,-0.1096,0.0243,0,-0.0607,0.0271,0,-0.093,0.05,0,-0.0709,0.05,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,0,3,1,4,3,0,4,5,3,6,5,4,5,6,7,8,7,6,8,6,9,10,7,8,7,10,11,8,9,12,12,9,13,12,13,14,14,13,15],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "plate-14",
    shape: {
      form: "plate", taper: 0.874548, symmetry: "mirror", longest: 0.442601,
      aspect: [1, 0.983893, 0],
      size: [0.435472, 0.442601, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 57,
    verts: 61,
    triVariants: [57],
    size: [0.435472, 0.442601, 0],
    offset: [0.258676, 0.920023, 0.635],
    provenance: [
      { species: "panda", node: "body", ordinal: 4, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [0.1065,-0.2049,0,-0.0733,-0.2213,0,0.0553,-0.2213,0,-0.1422,-0.1844,0,0.156,-0.154,0,-0.1971,-0.0745,0,0.0413,-0.0707,0,0.1985,-0.0679,0,-0.0537,-0.0707,0,0.0734,-0.0656,0,-0.0943,-0.0598,0,0.2177,0.0038,0,-0.2177,0.0013,0,-0.124,-0.0301,0,-0.1349,0.0106,0,0.1024,-0.0507,0,0.1252,-0.0275,0,0.1354,0.0106,0,-0.2009,0.065,0,-0.124,0.0512,0,-0.1168,0.0782,0,-0.1887,0.1114,0,-0.0673,0.1276,0,0.1886,0.1126,0,0.1173,0.0782,0,0.0679,0.1276,0,-0.1085,0.1922,0,0.109,0.1922,0,0.0003,0.1457,0,0.0003,0.2213,0,-0.013,-0.0598,0,-0.0943,-0.0598,0,-0.0537,-0.0707,0,-0.124,-0.0301,0,0.0167,-0.0301,0,-0.1349,0.0106,0,0.0276,0.0106,0,0.0167,0.0512,0,-0.124,0.0512,0,-0.013,0.0809,0,-0.0943,0.0809,0,-0.0537,0.0918,0,0.0734,-0.0656,0,-0.0537,-0.0707,0,0.0413,-0.0707,0,-0.013,-0.0598,0,0.1024,-0.0507,0,0.0167,-0.0301,0,0.1252,-0.0275,0,0.0276,0.0106,0,0.1354,0.0106,0,0.1173,0.0782,0,0.0167,0.0512,0,-0.013,0.0809,0,0.0679,0.1276,0,-0.0537,0.0918,0,-0.0673,0.1276,0,0.0003,0.1457,0,-0.0943,0.0809,0,-0.1168,0.0782,0,-0.124,0.0512,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,5,4,6,6,4,7,8,5,6,6,7,9,10,5,8,9,7,11,5,10,12,12,10,13,12,13,14,9,11,15,15,11,16,16,11,17,12,14,18,18,14,19,18,19,20,18,20,21,21,20,22,17,11,23,17,23,24,24,23,25,21,22,26,25,23,27,26,22,28,25,27,28,26,28,27,26,27,29,30,31,32,31,30,33,33,30,34,33,34,35,35,34,36,35,36,37,35,37,38,38,37,39,38,39,40,40,39,41,42,43,44,43,42,45,45,42,46,45,46,47,47,46,48,47,48,49,49,48,50,49,50,51,49,51,52,52,51,53,53,51,54,53,54,55,56,55,54,56,54,57,56,58,55,59,58,56,58,59,60],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "plate-15",
    shape: {
      form: "plate", taper: 0.874548, symmetry: "mirror", longest: 0.442601,
      aspect: [1, 0.983893, 0],
      size: [0.435472, 0.442601, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["eye"],
    tris: 57,
    verts: 61,
    triVariants: [57],
    size: [0.435472, 0.442601, 0],
    offset: [-0.258676, 0.920023, 0.635],
    provenance: [
      { species: "panda", node: "body", ordinal: 5, role: "eye", name: "eye card (flat cut-out)" },
    ],
    positions: [-0.0003,0.2213,0,-0.109,0.1922,0,0.1085,0.1922,0,-0.0003,0.1457,0,-0.0679,0.1276,0,0.0673,0.1276,0,-0.1886,0.1126,0,0.1887,0.1114,0,-0.1173,0.0782,0,-0.1354,0.0106,0,-0.2177,0.0038,0,0.1168,0.0782,0,0.2009,0.065,0,0.124,0.0512,0,0.1349,0.0106,0,0.2177,0.0013,0,-0.1252,-0.0275,0,-0.1024,-0.0507,0,-0.0734,-0.0656,0,0.124,-0.0301,0,0.0943,-0.0598,0,0.1971,-0.0745,0,-0.1985,-0.0679,0,0.0537,-0.0707,0,-0.0413,-0.0707,0,-0.156,-0.154,0,0.1422,-0.1844,0,-0.1065,-0.2049,0,0.0733,-0.2213,0,-0.0553,-0.2213,0,0.0537,0.0918,0,0.013,0.0809,0,0.0943,0.0809,0,0.124,0.0512,0,-0.0167,0.0512,0,0.1349,0.0106,0,-0.0276,0.0106,0,-0.0167,-0.0301,0,0.124,-0.0301,0,0.013,-0.0598,0,0.0943,-0.0598,0,0.0537,-0.0707,0,0.124,0.0512,0,0.1168,0.0782,0,0.0943,0.0809,0,0.0673,0.1276,0,0.0537,0.0918,0,-0.0003,0.1457,0,-0.0679,0.1276,0,0.013,0.0809,0,-0.1173,0.0782,0,-0.0167,0.0512,0,-0.0276,0.0106,0,-0.1354,0.0106,0,-0.1252,-0.0275,0,-0.0167,-0.0301,0,-0.1024,-0.0507,0,0.013,-0.0598,0,-0.0734,-0.0656,0,0.0537,-0.0707,0,-0.0413,-0.0707,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,3,2,3,1,4,3,5,2,1,6,4,2,5,7,4,6,8,8,6,9,6,10,9,5,11,7,7,11,12,11,13,12,13,14,12,12,14,15,9,10,16,16,10,17,17,10,18,14,19,15,19,20,15,15,20,21,10,22,18,23,21,20,18,22,24,24,21,23,22,25,24,24,25,21,21,25,26,25,27,26,26,27,28,29,28,27,30,31,32,32,31,33,31,34,33,33,34,35,34,36,35,36,37,35,35,37,38,37,39,38,38,39,40,41,40,39,42,43,44,45,44,43,46,44,45,47,48,45,48,46,45,46,48,49,48,50,49,49,50,51,51,50,52,50,53,52,53,54,52,52,54,55,54,56,55,55,56,57,56,58,57,57,58,59,60,59,58],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "plate-16",
    shape: {
      form: "plate", taper: 1, symmetry: "radial", longest: 0.113137,
      aspect: [1, 1, 0],
      size: [0.113137, 0.113137, 0],
    },
    attachment: {
      axis: "z", dir: 1, n: 2,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 2,
    verts: 4,
    triVariants: [2],
    size: [0.113137, 0.113137, 0],
    offset: [0.09, 0.80875, 0.835],
    provenance: [
      { species: "pig", node: "body", ordinal: 5, role: "nose", name: "nostril card (flat)" },
      { species: "pig", node: "body", ordinal: 6, role: "nose", name: "nostril card (flat)" },
    ],
    positions: [0.0566,0,0,-0.0566,0,0,0,-0.0566,0,0,0.0566,0],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3],
    bands: [15,15],
  },
  {
    id: "tube-01",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.311961,
      aspect: [1, 0.620001, 0.550085],
      size: [0.311961, 0.193416, 0.171605],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 23,
    verts: 45,
    triVariants: [23],
    size: [0.311961, 0.193416, 0.171605],
    offset: [0, 0.815078, 0.710803],
    provenance: [
      { species: "beaver", node: "body", ordinal: 8, role: "nose", name: "nose-tip" },
    ],
    positions: [0.078,0.0967,-0.0858,0.156,0.0322,0.0429,0.156,0.0322,-0.0858,0.078,0.0967,0.0429,-0.156,0.0322,-0.0858,-0.078,0.0967,0.0429,-0.078,0.0967,-0.0858,-0.156,0.0322,0.0429,0.078,0.0967,-0.0858,-0.078,0.0967,0.0429,0.078,0.0967,0.0429,-0.078,0.0967,-0.0858,0,-0.0967,0.0429,0.156,0.0322,-0.0858,0.156,0.0322,0.0429,0,-0.0967,-0.0858,0.078,0.0322,0.0858,-0.078,0.0322,0.0858,0,-0.0322,0.0858,0.0551,0.0511,0.0858,-0.0551,0.0511,0.0858,-0.156,0.0322,0.0429,0,-0.0967,-0.0858,0,-0.0967,0.0429,-0.156,0.0322,-0.0858,0.078,0.0967,0.0429,0.078,0.0322,0.0858,0.156,0.0322,0.0429,0.0551,0.0511,0.0858,-0.078,0.0967,0.0429,0.0551,0.0511,0.0858,0.078,0.0967,0.0429,-0.0551,0.0511,0.0858,0.156,0.0322,0.0429,0,-0.0322,0.0858,0,-0.0967,0.0429,0.078,0.0322,0.0858,0,-0.0322,0.0858,-0.156,0.0322,0.0429,0,-0.0967,0.0429,-0.078,0.0322,0.0858,-0.0551,0.0511,0.0858,-0.156,0.0322,0.0429,-0.078,0.0322,0.0858,-0.078,0.0967,0.0429],
    normals: [0.3386,0.9409,0,0.8897,0,0.4566,1,0,0,0.3136,0.8563,0.4103,-1,0,0,-0.3136,0.8563,0.4103,-0.3386,0.9409,0,-0.8897,0,0.4566,0.3386,0.9409,0,-0.3136,0.8563,0.4103,0.3136,0.8563,0.4103,-0.3386,0.9409,0,0,-0.9003,0.4352,1,0,0,0.8897,0,0.4566,0.6371,-0.7707,0,0.3584,0,0.9336,-0.3584,0,0.9336,0,-0.3843,0.9232,0.1244,0.3732,0.9194,-0.1244,0.3732,0.9194,-0.8897,0,0.4566,-0.6371,-0.7707,0,0,-0.9003,0.4352,-1,0,0,0.3136,0.8563,0.4103,0.3584,0,0.9336,0.8897,0,0.4566,0.1244,0.3732,0.9194,-0.3136,0.8563,0.4103,0.1244,0.3732,0.9194,0.3136,0.8563,0.4103,-0.1244,0.3732,0.9194,0.8897,0,0.4566,0,-0.3843,0.9232,0,-0.9003,0.4352,0.3584,0,0.9336,0,-0.3843,0.9232,-0.8897,0,0.4566,0,-0.9003,0.4352,-0.3584,0,0.9336,-0.1244,0.3732,0.9194,-0.8897,0,0.4566,-0.3584,0,0.9336,-0.3136,0.8563,0.4103],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,17,19,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "tube-02",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.46,
      aspect: [1, 0.547826, 0.434783],
      size: [0.46, 0.252, 0.2],
    },
    attachment: {
      axis: "z", dir: 1, n: 2,
      sunkUnitsMin: 0.1, sunkUnitsMean: 0.1, sunkUnitsMax: 0.1,
      sunkFractionMin: 0.5, sunkFractionMean: 0.5, sunkFractionMax: 0.5,
    },
    roles: ["nose"],
    tris: 32,
    verts: 54,
    triVariants: [32],
    size: [0.46, 0.252, 0.2],
    offset: [0, 0.72775, 0.625],
    provenance: [
      { species: "chick", node: "body", ordinal: 4, role: "nose", name: "beak" },
      { species: "penguin", node: "body", ordinal: 4, role: "nose", name: "beak" },
    ],
    positions: [-0.1626,0.0698,-0.1,0,0.0895,0.1,0,0.126,-0.1,-0.1317,0.044,0.1,-0.23,-0.066,-0.1,-0.1317,0.044,0.1,-0.1626,0.0698,-0.1,-0.1863,-0.066,0.1,0.1317,0.044,0.1,0.23,-0.066,-0.1,0.1626,0.0698,-0.1,0.1863,-0.066,0.1,0,0.0895,0.1,0.1626,0.0698,-0.1,0,0.126,-0.1,0.1317,0.044,0.1,0.1718,-0.126,-0.1,-0.1281,-0.126,0.1,-0.1718,-0.126,-0.1,0.1281,-0.126,0.1,0.1689,-0.101,0.1,0.23,-0.066,-0.1,0.1863,-0.066,0.1,0.2126,-0.101,-0.1,0.1689,-0.101,0.1,0.1718,-0.126,-0.1,0.2126,-0.101,-0.1,0.1281,-0.126,0.1,-0.23,-0.066,-0.1,-0.1689,-0.101,0.1,-0.1863,-0.066,0.1,-0.2126,-0.101,-0.1,-0.1718,-0.126,-0.1,-0.1689,-0.101,0.1,-0.2126,-0.101,-0.1,-0.1281,-0.126,0.1,0.1317,0.044,0.1,0.1689,-0.101,0.1,0.1863,-0.066,0.1,0.1281,-0.126,0.1,0,0.0895,0.1,-0.1281,-0.126,0.1,-0.1317,0.044,0.1,-0.1689,-0.101,0.1,-0.1863,-0.066,0.1,0.2126,-0.101,-0.1,0.1626,0.0698,-0.1,0.23,-0.066,-0.1,0.1718,-0.126,-0.1,-0.1718,-0.126,-0.1,0,0.126,-0.1,-0.1626,0.0698,-0.1,-0.23,-0.066,-0.1,-0.2126,-0.101,-0.1],
    normals: [-0.6528,0.7319,0.1953,0,0.7078,0.7064,0,0.9838,0.1794,-0.4656,0.5376,0.7029,-0.977,0,0.2135,-0.4656,0.5376,0.7029,-0.6528,0.7319,0.1953,-0.7154,0,0.6987,0.4656,0.5376,0.7029,0.977,0,0.2135,0.6528,0.7319,0.1953,0.7154,0,0.6987,0,0.7078,0.7064,0.6528,0.7319,0.1953,0,0.9838,0.1794,0.4656,0.5376,0.7029,0.3042,-0.9503,0.0665,-0.2358,-0.9704,0.0515,-0.3042,-0.9503,0.0665,0.2358,-0.9704,0.0515,0.5092,-0.4914,0.7066,0.977,0,0.2135,0.7154,0,0.6987,0.744,-0.6481,0.1626,0.5092,-0.4914,0.7066,0.3042,-0.9503,0.0665,0.744,-0.6481,0.1626,0.2358,-0.9704,0.0515,-0.977,0,0.2135,-0.5092,-0.4914,0.7066,-0.7154,0,0.6987,-0.744,-0.6481,0.1626,-0.3042,-0.9503,0.0665,-0.5092,-0.4914,0.7066,-0.744,-0.6481,0.1626,-0.2358,-0.9704,0.0515,0.4656,0.5376,0.7029,0.5092,-0.4914,0.7066,0.7154,0,0.6987,0,0,1,0,0.7078,0.7064,0,0,1,-0.4656,0.5376,0.7029,-0.5092,-0.4914,0.7066,-0.7154,0,0.6987,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,39,36,40,39,40,41,41,40,42,41,42,43,43,42,44,45,46,47,46,45,48,46,48,49,46,49,50,50,49,51,51,49,52,52,49,53],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "tube-03",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.532,
      aspect: [1, 0.56391, 0.435],
      size: [0.532, 0.3, 0.23142],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 22,
    verts: 40,
    triVariants: [22],
    size: [0.532, 0.3, 0.23142],
    offset: [0, 0.757432, 0.74071],
    provenance: [
      { species: "deer", node: "body", ordinal: 8, role: "nose", name: "nose" },
    ],
    positions: [-0.1881,0.0914,-0.1157,0,0.0947,0.1157,0,0.15,-0.1157,-0.1188,0.0577,0.1157,0,0.15,-0.1157,0.1188,0.0577,0.1157,0.1881,0.0914,-0.1157,0,0.0947,0.1157,-0.266,-0.05,-0.1157,-0.1188,0.0577,0.1157,-0.1881,0.0914,-0.1157,-0.168,-0.0316,0.1157,0.1188,0.0577,0.1157,0.1188,-0.0762,0.1157,0.168,-0.0316,0.1157,0,0.0947,0.1157,0,-0.0947,0.1157,-0.1188,0.0577,0.1157,-0.1188,-0.0762,0.1157,-0.168,-0.0316,0.1157,0.168,-0.0316,0.1157,0.1881,-0.1207,-0.1157,0.266,-0.05,-0.1157,0.1188,-0.0762,0.1157,0.1188,0.0577,0.1157,0.266,-0.05,-0.1157,0.1881,0.0914,-0.1157,0.168,-0.0316,0.1157,-0.1188,-0.0762,0.1157,-0.266,-0.05,-0.1157,-0.1881,-0.1207,-0.1157,-0.168,-0.0316,0.1157,0.1188,-0.0762,0.1157,0,-0.15,-0.1157,0.1881,-0.1207,-0.1157,0,-0.0947,0.1157,0,-0.0947,0.1157,-0.1881,-0.1207,-0.1157,0,-0.15,-0.1157,-0.1188,-0.0762,0.1157],
    normals: [-0.6257,0.723,0.2927,0,0.6828,0.7306,0,0.9726,0.2324,-0.409,0.5387,0.7365,0,0.9726,0.2324,0.409,0.5387,0.7365,0.6257,0.723,0.2927,0,0.6828,0.7306,-0.9054,-0.1533,0.3958,-0.409,0.5387,0.7365,-0.6257,0.723,0.2927,-0.6645,-0.1079,0.7394,0.409,0.5387,0.7365,0.2638,-0.6059,0.7506,0.6645,-0.1079,0.7394,0,0.6828,0.7306,0,-0.6543,0.7562,-0.409,0.5387,0.7365,-0.2638,-0.6059,0.7506,-0.6645,-0.1079,0.7394,0.6645,-0.1079,0.7394,0.4378,-0.8495,0.2945,0.9054,-0.1533,0.3958,0.2638,-0.6059,0.7506,0.409,0.5387,0.7365,0.9054,-0.1533,0.3958,0.6257,0.723,0.2927,0.6645,-0.1079,0.7394,-0.2638,-0.6059,0.7506,-0.9054,-0.1533,0.3958,-0.4378,-0.8495,0.2945,-0.6645,-0.1079,0.7394,0.2638,-0.6059,0.7506,0,-0.9726,0.2324,0.4378,-0.8495,0.2945,0,-0.6543,0.7562,0,-0.6543,0.7562,-0.4378,-0.8495,0.2945,0,-0.9726,0.2324,-0.2638,-0.6059,0.7506],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,13,15,16,16,15,17,16,17,18,18,17,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "tube-04",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.61875,
      aspect: [1, 0.580556, 0.448163],
      size: [0.359219, 0.61875, 0.277301],
    },
    attachment: {
      axis: "x", dir: 1, n: 1,
      sunkUnitsMin: 0.045293, sunkUnitsMean: 0.045293, sunkUnitsMax: 0.045293,
      sunkFractionMin: 0.126087, sunkFractionMean: 0.126087, sunkFractionMax: 0.126087,
    },
    roles: ["ear"],
    tris: 58,
    verts: 100,
    triVariants: [58],
    size: [0.359219, 0.61875, 0.277301],
    offset: [0.759317, 0.809375, 0.147998],
    provenance: [
      { species: "elephant", node: "body", ordinal: 1, role: "ear", name: "ear-right" },
    ],
    positions: [0.1102,-0.2094,-0.1322,0.1796,0,0.0304,0.1555,-0.2094,0.0369,0.1343,0,-0.1387,0.1343,0,-0.1387,0.1555,0.2094,0.0369,0.1796,0,0.0304,0.1102,0.2094,-0.1322,0.0136,0.3094,-0.1063,0.1555,0.2094,0.0369,0.1102,0.2094,-0.1322,0.0589,0.3094,0.0627,0.1555,0.2094,0.0369,0.1618,0,0.0611,0.1796,0,0.0304,0.1389,0.1978,0.0672,0.0589,-0.3094,0.0627,-0.1796,-0.3094,-0.0545,0.0136,-0.3094,-0.1063,-0.1343,-0.3094,0.1145,0.1796,0,0.0304,0.1389,-0.1978,0.0672,0.1555,-0.2094,0.0369,0.1618,0,0.0611,0.1555,0.2094,0.0369,0.0553,0.2844,0.0896,0.1389,0.1978,0.0672,0.0589,0.3094,0.0627,0.0553,-0.2844,0.0896,-0.1343,-0.3094,0.1145,0.0589,-0.3094,0.0627,-0.1278,-0.2844,0.1387,-0.1343,0.3094,0.1145,0.0553,0.2844,0.0896,0.0589,0.3094,0.0627,-0.1278,0.2844,0.1387,0.1555,-0.2094,0.0369,0.0553,-0.2844,0.0896,0.0589,-0.3094,0.0627,0.1389,-0.1978,0.0672,-0.1796,0.3094,-0.0545,0.0589,0.3094,0.0627,0.0136,0.3094,-0.1063,-0.1343,0.3094,0.1145,0.1555,-0.2094,0.0369,0.0136,-0.3094,-0.1063,0.1102,-0.2094,-0.1322,0.0589,-0.3094,0.0627,0.0553,-0.2844,0.0896,-0.1278,-0.2094,0.1387,-0.1278,-0.2844,0.1387,0.0253,-0.2094,0.0976,0.07,-0.1631,0.0856,0.1389,-0.1978,0.0672,0.0888,0,0.0806,0.1389,0.1978,0.0672,0.1618,0,0.0611,0.07,0.1631,0.0856,0.0553,0.2844,0.0896,0.0253,0.2094,0.0976,-0.1278,0.2844,0.1387,-0.1278,0.2094,0.1387,-0.1796,0.3094,-0.0545,0.0136,-0.3094,-0.1063,-0.1796,-0.3094,-0.0545,0.0136,0.3094,-0.1063,0.1102,-0.2094,-0.1322,0.1102,0.2094,-0.1322,0.1343,0,-0.1387,0.07,0.1631,0.0856,0.0759,0,0.0323,0.0888,0,0.0806,0.057,0.1631,0.0373,0.07,0.1631,0.0856,0.0124,0.2094,0.0493,0.057,0.1631,0.0373,0.0253,0.2094,0.0976,-0.1408,-0.2094,0.0904,0.0253,-0.2094,0.0976,0.0124,-0.2094,0.0493,-0.1278,-0.2094,0.1387,0.0124,-0.2094,0.0493,0.07,-0.1631,0.0856,0.057,-0.1631,0.0373,0.0253,-0.2094,0.0976,0.0888,0,0.0806,0.057,-0.1631,0.0373,0.07,-0.1631,0.0856,0.0759,0,0.0323,0.0124,-0.2094,0.0493,-0.1408,0.2094,0.0904,-0.1408,-0.2094,0.0904,0.0124,0.2094,0.0493,0.057,-0.1631,0.0373,0.057,0.1631,0.0373,0.0759,0,0.0323,0.0253,0.2094,0.0976,-0.1408,0.2094,0.0904,0.0124,0.2094,0.0493,-0.1278,0.2094,0.1387],
    normals: [0.8689,-0.4369,-0.2328,0.9926,0,0.1216,0.9031,-0.4061,0.1395,0.9659,0,-0.2588,0.9659,0,-0.2588,0.9031,0.4061,0.1395,0.9926,0,0.1216,0.8689,0.4369,-0.2328,0.3696,0.9239,-0.099,0.9031,0.4061,0.1395,0.8689,0.4369,-0.2328,0.439,0.8587,0.2642,0.9031,0.4061,0.1395,0.628,0,0.7782,0.9926,0,0.1216,0.6096,0.1892,0.7698,0.439,-0.8587,0.2642,0,-1,0,0.3696,-0.9239,-0.099,0.099,-0.9239,0.3696,0.9926,0,0.1216,0.6096,-0.1892,0.7698,0.9031,-0.4061,0.1395,0.628,0,0.7782,0.9031,0.4061,0.1395,0.3945,0.4044,0.8251,0.6096,0.1892,0.7698,0.439,0.8587,0.2642,0.3945,-0.4044,0.8251,0.099,-0.9239,0.3696,0.439,-0.8587,0.2642,0.2391,-0.3827,0.8924,0.099,0.9239,0.3696,0.3945,0.4044,0.8251,0.439,0.8587,0.2642,0.2391,0.3827,0.8924,0.9031,-0.4061,0.1395,0.3945,-0.4044,0.8251,0.439,-0.8587,0.2642,0.6096,-0.1892,0.7698,0,1,0,0.439,0.8587,0.2642,0.3696,0.9239,-0.099,0.099,0.9239,0.3696,0.9031,-0.4061,0.1395,0.3696,-0.9239,-0.099,0.8689,-0.4369,-0.2328,0.439,-0.8587,0.2642,0.3945,-0.4044,0.8251,0.2588,0,0.9659,0.2391,-0.3827,0.8924,0.2588,0,0.9659,0.2588,0,0.9659,0.6096,-0.1892,0.7698,0.2588,0,0.9659,0.6096,0.1892,0.7698,0.628,0,0.7782,0.2588,0,0.9659,0.3945,0.4044,0.8251,0.2588,0,0.9659,0.2391,0.3827,0.8924,0.2588,0,0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.8689,-0.4369,0.2328,-0.5306,0,0.8476,-0.9659,0,0.2588,-0.5016,-0.3356,0.7974,-0.8689,-0.4369,0.2328,-0.1239,-0.7173,0.6857,-0.5016,-0.3356,0.7974,-0.3696,-0.9239,0.099,0.183,0.7071,0.683,-0.3696,0.9239,0.099,-0.1239,0.7173,0.6857,0,1,0,-0.1239,0.7173,0.6857,-0.8689,0.4369,0.2328,-0.5016,0.3356,0.7974,-0.3696,0.9239,0.099,-0.9659,0,0.2588,-0.5016,0.3356,0.7974,-0.8689,0.4369,0.2328,-0.5306,0,0.8476,-0.1239,0.7173,0.6857,0.183,-0.7071,0.683,0.183,0.7071,0.683,-0.1239,-0.7173,0.6857,-0.5016,0.3356,0.7974,-0.5016,-0.3356,0.7974,-0.5306,0,0.8476,-0.3696,-0.9239,0.099,0.183,-0.7071,0.683,-0.1239,-0.7173,0.6857,0,-1,0],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,51,48,52,52,48,53,52,53,54,55,54,53,55,53,56,55,57,54,58,57,55,58,59,57,60,59,58,59,60,61,62,63,64,63,62,65,63,65,66,66,65,67,66,67,68,69,70,71,70,69,72,73,74,75,74,73,76,77,78,79,78,77,80,81,82,83,82,81,84,85,86,87,86,85,88,89,90,91,90,89,92,92,89,93,92,93,94,94,93,95,96,97,98,97,96,99],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "tube-05",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.61875,
      aspect: [1, 0.580556, 0.448163],
      size: [0.359219, 0.61875, 0.277301],
    },
    attachment: {
      axis: "x", dir: -1, n: 1,
      sunkUnitsMin: 0.045293, sunkUnitsMean: 0.045293, sunkUnitsMax: 0.045293,
      sunkFractionMin: 0.126087, sunkFractionMean: 0.126087, sunkFractionMax: 0.126087,
    },
    roles: ["ear"],
    tris: 58,
    verts: 100,
    triVariants: [58],
    size: [0.359219, 0.61875, 0.277301],
    offset: [-0.759316, 0.809375, 0.147998],
    provenance: [
      { species: "elephant", node: "body", ordinal: 2, role: "ear", name: "ear-left" },
    ],
    positions: [-0.1343,0,-0.1387,-0.1102,0.2094,-0.1322,-0.1102,-0.2094,-0.1322,-0.0136,0.3094,-0.1063,-0.0136,-0.3094,-0.1063,0.1796,0.3094,-0.0545,0.1796,-0.3094,-0.0545,0.1278,0.2094,0.1387,0.1278,0.2844,0.1387,-0.0253,0.2094,0.0976,-0.0553,0.2844,0.0896,-0.07,0.1631,0.0856,-0.1389,0.1978,0.0672,-0.0888,0,0.0806,-0.1618,0,0.0611,-0.1389,-0.1978,0.0672,-0.07,-0.1631,0.0856,-0.0553,-0.2844,0.0896,-0.0253,-0.2094,0.0976,0.1278,-0.2094,0.1387,0.1278,-0.2844,0.1387,-0.0589,-0.3094,0.0627,-0.1555,-0.2094,0.0369,-0.0136,-0.3094,-0.1063,-0.1102,-0.2094,-0.1322,0.1343,0.3094,0.1145,0.1796,0.3094,-0.0545,-0.0589,0.3094,0.0627,-0.0136,0.3094,-0.1063,-0.1389,-0.1978,0.0672,-0.1555,-0.2094,0.0369,-0.0553,-0.2844,0.0896,-0.0589,-0.3094,0.0627,0.1278,0.2844,0.1387,0.1343,0.3094,0.1145,-0.0553,0.2844,0.0896,-0.0589,0.3094,0.0627,0.1278,-0.2844,0.1387,-0.0553,-0.2844,0.0896,0.1343,-0.3094,0.1145,-0.0589,-0.3094,0.0627,-0.0589,0.3094,0.0627,-0.1555,0.2094,0.0369,-0.0553,0.2844,0.0896,-0.1389,0.1978,0.0672,-0.1618,0,0.0611,-0.1796,0,0.0304,-0.1389,-0.1978,0.0672,-0.1555,-0.2094,0.0369,0.1343,-0.3094,0.1145,-0.0589,-0.3094,0.0627,0.1796,-0.3094,-0.0545,-0.0136,-0.3094,-0.1063,-0.1389,0.1978,0.0672,-0.1555,0.2094,0.0369,-0.1618,0,0.0611,-0.1796,0,0.0304,-0.0589,0.3094,0.0627,-0.0136,0.3094,-0.1063,-0.1555,0.2094,0.0369,-0.1102,0.2094,-0.1322,-0.1102,0.2094,-0.1322,-0.1343,0,-0.1387,-0.1555,0.2094,0.0369,-0.1796,0,0.0304,-0.1343,0,-0.1387,-0.1102,-0.2094,-0.1322,-0.1796,0,0.0304,-0.1555,-0.2094,0.0369,0.1278,0.2094,0.1387,-0.0253,0.2094,0.0976,0.1408,0.2094,0.0904,-0.0124,0.2094,0.0493,-0.0759,0,0.0323,-0.057,-0.1631,0.0373,-0.057,0.1631,0.0373,-0.0124,0.2094,0.0493,-0.0124,-0.2094,0.0493,0.1408,0.2094,0.0904,0.1408,-0.2094,0.0904,-0.0759,0,0.0323,-0.0888,0,0.0806,-0.057,-0.1631,0.0373,-0.07,-0.1631,0.0856,-0.0253,-0.2094,0.0976,-0.0124,-0.2094,0.0493,-0.07,-0.1631,0.0856,-0.057,-0.1631,0.0373,0.1278,-0.2094,0.1387,0.1408,-0.2094,0.0904,-0.0253,-0.2094,0.0976,-0.0124,-0.2094,0.0493,-0.0253,0.2094,0.0976,-0.07,0.1631,0.0856,-0.0124,0.2094,0.0493,-0.057,0.1631,0.0373,-0.057,0.1631,0.0373,-0.07,0.1631,0.0856,-0.0759,0,0.0323,-0.0888,0,0.0806],
    normals: [0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,-0.2588,0,0.9659,-0.2391,0.3827,0.8924,-0.2588,0,0.9659,-0.3945,0.4044,0.8251,-0.2588,0,0.9659,-0.6096,0.1892,0.7698,-0.2588,0,0.9659,-0.628,0,0.7782,-0.6096,-0.1892,0.7698,-0.2588,0,0.9659,-0.3945,-0.4044,0.8251,-0.2588,0,0.9659,-0.2588,0,0.9659,-0.2391,-0.3827,0.8924,-0.439,-0.8587,0.2642,-0.9031,-0.4061,0.1395,-0.3696,-0.9239,-0.099,-0.8689,-0.4369,-0.2328,-0.099,0.9239,0.3696,0,1,0,-0.439,0.8587,0.2642,-0.3696,0.9239,-0.099,-0.6096,-0.1892,0.7698,-0.9031,-0.4061,0.1395,-0.3945,-0.4044,0.8251,-0.439,-0.8587,0.2642,-0.2391,0.3827,0.8924,-0.099,0.9239,0.3696,-0.3945,0.4044,0.8251,-0.439,0.8587,0.2642,-0.2391,-0.3827,0.8924,-0.3945,-0.4044,0.8251,-0.099,-0.9239,0.3696,-0.439,-0.8587,0.2642,-0.439,0.8587,0.2642,-0.9031,0.4061,0.1395,-0.3945,0.4044,0.8251,-0.6096,0.1892,0.7698,-0.628,0,0.7782,-0.9926,0,0.1216,-0.6096,-0.1892,0.7698,-0.9031,-0.4061,0.1395,-0.099,-0.9239,0.3696,-0.439,-0.8587,0.2642,0,-1,0,-0.3696,-0.9239,-0.099,-0.6096,0.1892,0.7698,-0.9031,0.4061,0.1395,-0.628,0,0.7782,-0.9926,0,0.1216,-0.439,0.8587,0.2642,-0.3696,0.9239,-0.099,-0.9031,0.4061,0.1395,-0.8689,0.4369,-0.2328,-0.8689,0.4369,-0.2328,-0.9659,0,-0.2588,-0.9031,0.4061,0.1395,-0.9926,0,0.1216,-0.9659,0,-0.2588,-0.8689,-0.4369,-0.2328,-0.9926,0,0.1216,-0.9031,-0.4061,0.1395,0,-1,0,0.3696,-0.9239,0.099,-0.183,-0.7071,0.683,0.1239,-0.7173,0.6857,0.5306,0,0.8476,0.5016,0.3356,0.7974,0.5016,-0.3356,0.7974,0.1239,-0.7173,0.6857,0.1239,0.7173,0.6857,-0.183,-0.7071,0.683,-0.183,0.7071,0.683,0.5306,0,0.8476,0.9659,0,0.2588,0.5016,0.3356,0.7974,0.8689,0.4369,0.2328,0.3696,0.9239,0.099,0.1239,0.7173,0.6857,0.8689,0.4369,0.2328,0.5016,0.3356,0.7974,0,1,0,-0.183,0.7071,0.683,0.3696,0.9239,0.099,0.1239,0.7173,0.6857,0.3696,-0.9239,0.099,0.8689,-0.4369,0.2328,0.1239,-0.7173,0.6857,0.5016,-0.3356,0.7974,0.5016,-0.3356,0.7974,0.8689,-0.4369,0.2328,0.5306,0,0.8476,0.9659,0,0.2588],
    indices: [0,1,2,1,3,2,2,3,4,3,5,4,6,4,5,7,8,9,10,9,8,11,9,10,12,11,10,13,11,12,14,15,12,15,13,12,13,15,16,15,17,16,16,17,18,18,17,19,20,19,17,21,22,23,24,23,22,25,26,27,28,27,26,29,30,31,32,31,30,33,34,35,36,35,34,37,38,39,40,39,38,41,42,43,44,43,42,45,46,47,48,47,46,49,50,51,52,51,50,53,54,55,56,55,54,57,58,59,60,59,58,61,62,63,64,63,62,65,66,67,68,67,66,69,70,71,72,71,70,73,74,75,75,74,76,74,77,76,76,77,78,79,78,77,80,81,82,83,82,81,84,85,86,87,86,85,88,89,90,91,90,89,92,93,94,95,94,93,96,97,98,99,98,97],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "tube-06",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.532,
      aspect: [1, 0.56391, 0.435],
      size: [0.532, 0.3, 0.23142],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 34,
    verts: 41,
    triVariants: [34],
    size: [0.532, 0.3, 0.23142],
    offset: [0, 0.757432, 0.74071],
    provenance: [
      { species: "fox", node: "body", ordinal: 1, role: "nose", name: "nose" },
    ],
    positions: [-0.1188,0.0577,0.1157,-0.1696,0.059,-0.0198,-0.1434,0.0131,0.1157,-0.1881,0.0914,-0.1157,-0.227,0.0207,-0.1157,0.1696,0.059,-0.0198,0.1188,0.0577,0.1157,0.1434,0.0131,0.1157,0.1881,0.0914,-0.1157,0.227,0.0207,-0.1157,-0.1881,0.0914,-0.1157,0,0.0947,0.1157,0,0.15,-0.1157,-0.1188,0.0577,0.1157,0.1188,0.0577,0.1157,0,-0.0092,0.1157,0.1434,0.0131,0.1157,0,0.0947,0.1157,-0.1188,0.0577,0.1157,-0.1434,0.0131,0.1157,0,0.15,-0.1157,0.1188,0.0577,0.1157,0.1881,0.0914,-0.1157,0,0.0947,0.1157,-0.227,0.0207,-0.1157,-0.1434,0.0131,0.1157,-0.1696,0.059,-0.0198,-0.266,-0.05,-0.1157,-0.168,-0.0316,0.1157,0,-0.0092,0.1157,-0.1188,-0.0762,0.1157,-0.1881,-0.1207,-0.1157,0,-0.0947,0.1157,0,-0.15,-0.1157,0.1188,-0.0762,0.1157,0.1881,-0.1207,-0.1157,0.168,-0.0316,0.1157,0.266,-0.05,-0.1157,0.1434,0.0131,0.1157,0.227,0.0207,-0.1157,0.1696,0.059,-0.0198],
    normals: [-0.409,0.5387,0.7365,-0.8311,0.4579,0.3157,-0.543,0.2992,0.7846,-0.6257,0.723,0.2927,-0.8311,0.4579,0.3157,0.8311,0.4579,0.3157,0.409,0.5387,0.7365,0.543,0.2992,0.7846,0.6257,0.723,0.2927,0.8311,0.4579,0.3157,-0.6257,0.723,0.2927,0,0.6828,0.7306,0,0.9726,0.2324,-0.409,0.5387,0.7365,0.409,0.5387,0.7365,0,0,1,0.543,0.2992,0.7846,0,0.6828,0.7306,-0.409,0.5387,0.7365,-0.543,0.2992,0.7846,0,0.9726,0.2324,0.409,0.5387,0.7365,0.6257,0.723,0.2927,0,0.6828,0.7306,-0.8311,0.4579,0.3157,-0.49,0.27,0.8288,-0.8311,0.4579,0.3157,-0.9054,-0.1533,0.3958,-0.6645,-0.1079,0.7394,0,0,1,-0.2638,-0.6059,0.7506,-0.4378,-0.8495,0.2945,0,-0.6543,0.7562,0,-0.9726,0.2324,0.2638,-0.6059,0.7506,0.4378,-0.8495,0.2945,0.6645,-0.1079,0.7394,0.9054,-0.1533,0.3958,0.49,0.27,0.8288,0.8311,0.4579,0.3157,0.8311,0.4579,0.3157],
    indices: [0,1,2,1,0,3,4,1,3,5,6,7,6,5,8,9,8,5,10,11,12,11,10,13,14,15,16,15,14,17,15,17,18,15,18,19,20,21,22,21,20,23,24,25,26,25,24,27,25,27,28,28,29,25,27,30,28,30,27,31,31,32,30,32,28,30,32,31,33,33,34,32,34,28,32,34,33,35,36,29,28,28,34,36,35,36,34,36,35,37,29,36,38,37,38,36,39,38,37,38,39,40],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "tube-07",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.532,
      aspect: [1, 0.56391, 0.5],
      size: [0.532, 0.3, 0.266],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.1, sunkUnitsMean: 0.1, sunkUnitsMax: 0.1,
      sunkFractionMin: 0.37594, sunkFractionMean: 0.37594, sunkFractionMax: 0.37594,
    },
    roles: ["nose"],
    tris: 28,
    verts: 48,
    triVariants: [28],
    size: [0.532, 0.3, 0.266],
    offset: [0, 0.74375, 0.658],
    provenance: [
      { species: "giraffe", node: "body", ordinal: 5, role: "nose", name: "nose-tip" },
    ],
    positions: [-0.1881,-0.1207,-0.133,0.1881,-0.1207,-0.133,0,-0.15,-0.133,-0.266,-0.05,-0.133,0.266,-0.05,-0.133,-0.1881,0.0914,-0.133,0.1881,0.0914,-0.133,0,0.15,-0.133,0.1542,-0.099,0.133,-0.1542,-0.099,0.133,0,-0.123,0.133,0.2181,-0.041,0.133,-0.2181,-0.041,0.133,0.1542,0.075,0.133,-0.1542,0.075,0.133,0,0.123,0.133,-0.266,-0.05,-0.133,-0.1542,0.075,0.133,-0.1881,0.0914,-0.133,-0.2181,-0.041,0.133,0.1881,0.0914,-0.133,0.2181,-0.041,0.133,0.266,-0.05,-0.133,0.1542,0.075,0.133,0.1542,-0.099,0.133,0,-0.15,-0.133,0.1881,-0.1207,-0.133,0,-0.123,0.133,-0.1542,-0.099,0.133,0,-0.15,-0.133,0,-0.123,0.133,-0.1881,-0.1207,-0.133,0.2181,-0.041,0.133,0.1881,-0.1207,-0.133,0.266,-0.05,-0.133,0.1542,-0.099,0.133,0,0.15,-0.133,0.1542,0.075,0.133,0.1881,0.0914,-0.133,0,0.123,0.133,-0.1542,-0.099,0.133,-0.266,-0.05,-0.133,-0.1881,-0.1207,-0.133,-0.2181,-0.041,0.133,0,0.15,-0.133,-0.1542,0.075,0.133,0,0.123,0.133,-0.1881,0.0914,-0.133],
    normals: [0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0.2876,-0.6485,0.7047,-0.2876,-0.6485,0.7047,0,-0.7132,0.701,0.6426,-0.1247,0.756,-0.6426,-0.1247,0.756,0.417,0.5613,0.7149,-0.417,0.5613,0.7149,0,0.7443,0.6678,-0.9634,-0.1984,0.1801,-0.417,0.5613,0.7149,-0.6005,0.7898,0.1253,-0.6426,-0.1247,0.756,0.6005,0.7898,0.1253,0.6426,-0.1247,0.756,0.9634,-0.1984,0.1801,0.417,0.5613,0.7149,0.2876,-0.6485,0.7047,0,-0.9949,0.101,0.415,-0.901,0.1264,0,-0.7132,0.701,-0.2876,-0.6485,0.7047,0,-0.9949,0.101,0,-0.7132,0.701,-0.415,-0.901,0.1264,0.6426,-0.1247,0.756,0.415,-0.901,0.1264,0.9634,-0.1984,0.1801,0.2876,-0.6485,0.7047,0,0.9949,0.101,0.417,0.5613,0.7149,0.6005,0.7898,0.1253,0,0.7443,0.6678,-0.2876,-0.6485,0.7047,-0.9634,-0.1984,0.1801,-0.415,-0.901,0.1264,-0.6426,-0.1247,0.756,0,0.9949,0.101,-0.417,0.5613,0.7149,0,0.7443,0.6678,-0.6005,0.7898,0.1253],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,4,5,6,6,5,7,8,9,10,9,8,11,9,11,12,12,11,13,12,13,14,14,13,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "tube-08",
    shape: {
      form: "tube", taper: 1, symmetry: "mirror", longest: 0.233877,
      aspect: [1, 0.538309, 0.462256],
      size: [0.233877, 0.125898, 0.108111],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["nose"],
    tris: 23,
    verts: 45,
    triVariants: [23],
    size: [0.233877, 0.125898, 0.108111],
    offset: [0, 0.79356, 0.760803],
    provenance: [
      { species: "panda", node: "body", ordinal: 7, role: "nose", name: "nose-tip" },
    ],
    positions: [-0.0585,0.021,0.0541,-0.1169,0.021,0.027,0,-0.021,0.0541,0,-0.0629,0.027,-0.0413,0.0333,0.0541,-0.0585,0.0629,0.027,-0.0585,0.021,0.0541,-0.1169,0.021,0.027,-0.0585,0.0629,0.027,-0.0585,0.0629,-0.0541,-0.1169,0.021,0.027,-0.1169,0.021,-0.0541,0,-0.0629,-0.0541,0,-0.0629,0.027,-0.1169,0.021,-0.0541,-0.1169,0.021,0.027,0.0413,0.0333,0.0541,-0.0413,0.0333,0.0541,0.0585,0.021,0.0541,-0.0585,0.021,0.0541,0,-0.021,0.0541,0.1169,0.021,-0.0541,0.1169,0.021,0.027,0,-0.0629,-0.0541,0,-0.0629,0.027,0.0585,0.0629,0.027,0.0413,0.0333,0.0541,0.1169,0.021,0.027,0.0585,0.021,0.0541,0.0585,0.021,0.0541,0,-0.021,0.0541,0.1169,0.021,0.027,0,-0.0629,0.027,0.0413,0.0333,0.0541,0.0585,0.0629,0.027,-0.0413,0.0333,0.0541,-0.0585,0.0629,0.027,0.0585,0.0629,-0.0541,-0.0585,0.0629,-0.0541,0.0585,0.0629,0.027,-0.0585,0.0629,0.027,0.1169,0.021,0.027,0.1169,0.021,-0.0541,0.0585,0.0629,0.027,0.0585,0.0629,-0.0541],
    normals: [-0.3218,0,0.9468,-0.878,0,0.4787,0,-0.3672,0.9301,0,-0.8951,0.4458,-0.1019,0.3637,0.9259,-0.2854,0.8592,0.4245,-0.3218,0,0.9468,-0.878,0,0.4787,-0.2854,0.8592,0.4245,-0.3063,0.9519,0,-0.878,0,0.4787,-0.5831,0.8124,0,0,-1,0,0,-0.8951,0.4458,-0.5831,-0.8124,0,-0.878,0,0.4787,0.1019,0.3637,0.9259,-0.1019,0.3637,0.9259,0.3218,0,0.9468,-0.3218,0,0.9468,0,-0.3672,0.9301,1,0,0,0.878,0,0.4787,0,-1,0,0,-0.8951,0.4458,0.2854,0.8592,0.4245,0.1019,0.3637,0.9259,0.878,0,0.4787,0.3218,0,0.9468,0.3218,0,0.9468,0,-0.3672,0.9301,0.878,0,0.4787,0,-0.8951,0.4458,0.1019,0.3637,0.9259,0.2854,0.8592,0.4245,-0.1019,0.3637,0.9259,-0.2854,0.8592,0.4245,0.3063,0.9519,0,-0.3063,0.9519,0,0.2854,0.8592,0.4245,-0.2854,0.8592,0.4245,0.878,0,0.4787,1,0,0,0.2854,0.8592,0.4245,0.3063,0.9519,0],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,17,19,18,20,18,19,21,22,23,24,23,22,25,26,27,28,27,26,29,30,31,32,31,30,33,34,35,36,35,34,37,38,39,40,39,38,41,42,43,44,43,42],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15],
  },
  {
    id: "wedge-01",
    shape: {
      form: "wedge", taper: 0.469231, symmetry: "handed", longest: 0.2,
      aspect: [1, 0.90989, 0.644725],
      size: [0.181978, 0.2, 0.128945],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.028183, sunkUnitsMean: 0.028183, sunkUnitsMax: 0.028183,
      sunkFractionMin: 0.218566, sunkFractionMean: 0.218566, sunkFractionMax: 0.218566,
    },
    roles: ["nose"],
    tris: 28,
    verts: 24,
    triVariants: [28],
    size: [0.181978, 0.2, 0.128945],
    offset: [0.072621, 0.561036, 0.66129],
    provenance: [
      { species: "beaver", node: "body", ordinal: 3, role: "nose", name: "nose-tip" },
    ],
    positions: [0.091,0.1,-0.0162,0.078,-0.05,-0.0645,0.078,0.1,-0.0645,0.091,-0.05,-0.0162,0.0556,0.1,0.0451,0.0427,-0.1,-0.0032,0.0298,-0.1,-0.0515,-0.0298,-0.1,0.0162,-0.0427,-0.1,-0.0321,0.0356,-0.05,0.0504,0.0556,-0.0293,0.0451,-0.078,-0.05,0.0291,-0.091,-0.05,-0.0192,-0.091,0.1,-0.0192,-0.078,0.1,0.0291,0.0032,-0.05,0.0591,-0.0168,-0.0293,0.0645,-0.0168,0.1,0.0645,-0.091,-0.05,-0.0192,0.0298,-0.1,-0.0515,-0.0427,-0.1,-0.0321,0.078,-0.05,-0.0645,-0.091,0.1,-0.0192,0.078,0.1,-0.0645],
    normals: [0.9914,0,0.1305,0.8924,-0.3827,-0.2391,0.9659,0,-0.2588,0.9249,-0.3557,0.134,0.6088,0,0.7934,0.439,-0.8587,0.2642,0.3696,-0.9239,-0.099,-0.2481,-0.8587,0.4483,-0.3696,-0.9239,0.099,0.3945,-0.4044,0.8251,0.6233,-0.1675,0.7638,-0.734,-0.3557,0.5785,-0.8924,-0.3827,0.2391,-0.9659,0,0.2588,-0.7934,0,0.6088,0.0709,-0.4044,0.9118,-0.1579,-0.1675,0.9731,-0.1305,0,0.9914,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659,-0.2588,0,-0.9659],
    indices: [0,1,2,1,0,3,4,3,0,5,1,3,1,5,6,7,6,5,6,7,8,3,9,5,9,7,5,3,4,10,9,3,10,11,8,7,8,11,12,11,13,12,13,11,14,7,9,15,10,15,9,15,11,7,16,10,4,15,10,16,11,15,16,16,14,11,16,4,17,14,16,17,18,19,20,19,18,21,21,18,22,21,22,23],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "wedge-02",
    shape: {
      form: "wedge", taper: 0.469231, symmetry: "handed", longest: 0.2,
      aspect: [1, 0.90989, 0.644725],
      size: [0.181978, 0.2, 0.128945],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.028183, sunkUnitsMean: 0.028183, sunkUnitsMax: 0.028183,
      sunkFractionMin: 0.218566, sunkFractionMean: 0.218566, sunkFractionMax: 0.218566,
    },
    roles: ["nose"],
    tris: 28,
    verts: 24,
    triVariants: [28],
    size: [0.181978, 0.2, 0.128945],
    offset: [-0.07262, 0.561036, 0.66129],
    provenance: [
      { species: "beaver", node: "body", ordinal: 4, role: "nose", name: "nose-tip" },
    ],
    positions: [0.078,0.1,0.0291,0.091,-0.05,-0.0192,0.091,0.1,-0.0192,0.078,-0.05,0.0291,0.0168,0.1,0.0645,0.0298,-0.1,0.0162,0.0427,-0.1,-0.0321,-0.0427,-0.1,-0.0032,-0.0298,-0.1,-0.0515,-0.0032,-0.05,0.0591,0.0168,-0.0293,0.0645,-0.091,-0.05,-0.0162,-0.078,-0.05,-0.0645,-0.078,0.1,-0.0645,-0.091,0.1,-0.0162,-0.0356,-0.05,0.0504,-0.0556,-0.0293,0.0451,-0.0556,0.1,0.0451,-0.078,-0.05,-0.0645,0.0427,-0.1,-0.0321,-0.0298,-0.1,-0.0515,0.091,-0.05,-0.0192,-0.078,0.1,-0.0645,0.091,0.1,-0.0192],
    normals: [0.7934,0,0.6088,0.8924,-0.3827,0.2391,0.9659,0,0.2588,0.734,-0.3557,0.5785,0.1305,0,0.9914,0.2481,-0.8587,0.4483,0.3696,-0.9239,0.099,-0.439,-0.8587,0.2642,-0.3696,-0.9239,-0.099,-0.0709,-0.4044,0.9118,0.1579,-0.1675,0.9731,-0.9249,-0.3557,0.134,-0.8924,-0.3827,-0.2391,-0.9659,0,-0.2588,-0.9914,0,0.1305,-0.3945,-0.4044,0.8251,-0.6233,-0.1675,0.7638,-0.6088,0,0.7934,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659,0.2588,0,-0.9659],
    indices: [0,1,2,1,0,3,4,3,0,5,1,3,1,5,6,7,6,5,6,7,8,3,9,5,9,7,5,3,4,10,9,3,10,11,8,7,8,11,12,11,13,12,13,11,14,7,9,15,10,15,9,15,11,7,16,10,4,15,10,16,11,15,16,16,14,11,16,4,17,14,16,17,18,19,20,19,18,21,21,18,22,21,22,23],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "wedge-03",
    shape: {
      form: "wedge", taper: 0.57729, symmetry: "mirror", longest: 0.862191,
      aspect: [1, 0.842041, 0.682602],
      size: [0.726, 0.862191, 0.588533],
    },
    attachment: {
      axis: "z", dir: -1, n: 1,
      sunkUnitsMin: 0.173205, sunkUnitsMean: 0.173205, sunkUnitsMax: 0.173205,
      sunkFractionMin: 0.2943, sunkFractionMean: 0.2943, sunkFractionMax: 0.2943,
    },
    roles: ["tail"],
    tris: 92,
    verts: 168,
    triVariants: [92],
    size: [0.726, 0.862191, 0.588533],
    offset: [0, 1.050919, -0.746061],
    provenance: [
      { species: "beaver", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [0.3144,0.3336,-0.1334,0.363,0.1861,-0.1637,0.3144,0.2836,-0.22,0.363,0.2361,-0.0771,0.1815,0.355,-0.2612,0.3144,0.3336,-0.1334,0.3144,0.2836,-0.22,0.1815,0.405,-0.1746,0.1815,0.355,-0.2612,0,0.4311,-0.1897,0.1815,0.405,-0.1746,0,0.3811,-0.2763,-0.1815,0.355,-0.2612,0,0.4311,-0.1897,0,0.3811,-0.2763,-0.1815,0.405,-0.1746,-0.3144,0.2836,-0.22,-0.1815,0.405,-0.1746,-0.1815,0.355,-0.2612,-0.3144,0.3336,-0.1334,0,-0.3811,0.2792,0.1815,-0.3484,0.1449,0.1815,-0.2984,0.2315,0,-0.4311,0.1926,0.3144,-0.0725,0.1011,0.1815,-0.3484,0.1449,0.3144,-0.1225,0.0145,0.1815,-0.2984,0.2315,-0.1815,-0.3484,0.1449,-0.3144,-0.0725,0.1011,-0.3144,-0.1225,0.0145,-0.1815,-0.2984,0.2315,-0.3144,-0.1225,0.0145,-0.363,0.2361,-0.0771,-0.363,0.1861,-0.1637,-0.3144,-0.0725,0.1011,-0.363,0.1861,-0.1637,-0.3144,0.3336,-0.1334,-0.3144,0.2836,-0.22,-0.363,0.2361,-0.0771,-0.1815,-0.2984,0.2315,0,-0.4311,0.1926,0,-0.3811,0.2792,-0.1815,-0.3484,0.1449,0.363,0.2361,-0.0771,0.3144,-0.1225,0.0145,0.363,0.1861,-0.1637,0.3144,-0.0725,0.1011,0.1442,-0.2415,0.2564,-0.1442,-0.2415,0.2564,0,-0.3072,0.2943,0.266,-0.0344,0.1368,-0.266,-0.0344,0.1368,-0.3116,0.255,-0.0303,0.3116,0.255,-0.0303,-0.2747,0.3289,-0.073,0.2747,0.3289,-0.073,-0.1635,0.3887,-0.1075,0.1635,0.3887,-0.1075,0,0.4122,-0.1211,-0.1442,-0.3415,0.0831,0.1442,-0.3415,0.0831,0,-0.4072,0.1211,0.266,-0.1344,-0.0364,-0.266,-0.1344,-0.0364,-0.3116,0.155,-0.2035,0.3116,0.155,-0.2035,-0.2747,0.2289,-0.2462,0.2747,0.2289,-0.2462,-0.1635,0.2887,-0.2807,0.1635,0.2887,-0.2807,0,0.3122,-0.2943,0.1815,-0.2984,0.2315,0,-0.3072,0.2943,0,-0.3811,0.2792,0.1442,-0.2415,0.2564,0,-0.3072,0.2943,-0.1815,-0.2984,0.2315,0,-0.3811,0.2792,-0.1442,-0.2415,0.2564,-0.3144,-0.0725,0.1011,-0.3116,0.255,-0.0303,-0.363,0.2361,-0.0771,-0.266,-0.0344,0.1368,0.3144,-0.0725,0.1011,0.1442,-0.2415,0.2564,0.1815,-0.2984,0.2315,0.266,-0.0344,0.1368,0.2747,0.2289,-0.2462,0.363,0.1861,-0.1637,0.3116,0.155,-0.2035,0.3144,0.2836,-0.22,0.2747,0.3289,-0.073,0.363,0.2361,-0.0771,0.3144,0.3336,-0.1334,0.3116,0.255,-0.0303,0.1815,0.405,-0.1746,0.2747,0.3289,-0.073,0.3144,0.3336,-0.1334,0.1635,0.3887,-0.1075,-0.1815,0.405,-0.1746,0,0.4122,-0.1211,0,0.4311,-0.1897,-0.1635,0.3887,-0.1075,-0.1815,0.405,-0.1746,-0.2747,0.3289,-0.073,-0.1635,0.3887,-0.1075,-0.3144,0.3336,-0.1334,0.3116,0.255,-0.0303,0.3144,-0.0725,0.1011,0.363,0.2361,-0.0771,0.266,-0.0344,0.1368,-0.363,0.2361,-0.0771,-0.2747,0.3289,-0.073,-0.3144,0.3336,-0.1334,-0.3116,0.255,-0.0303,0,0.4311,-0.1897,0.1635,0.3887,-0.1075,0.1815,0.405,-0.1746,0,0.4122,-0.1211,-0.1442,-0.2415,0.2564,-0.3144,-0.0725,0.1011,-0.1815,-0.2984,0.2315,-0.266,-0.0344,0.1368,-0.1815,-0.3484,0.1449,-0.266,-0.1344,-0.0364,-0.1442,-0.3415,0.0831,-0.3144,-0.1225,0.0145,-0.3144,0.2836,-0.22,-0.1635,0.2887,-0.2807,-0.2747,0.2289,-0.2462,-0.1815,0.355,-0.2612,0,0.3122,-0.2943,0.1815,0.355,-0.2612,0.1635,0.2887,-0.2807,0,0.3811,-0.2763,0,-0.4311,0.1926,-0.1442,-0.3415,0.0831,0,-0.4072,0.1211,-0.1815,-0.3484,0.1449,0.1815,-0.3484,0.1449,0.266,-0.1344,-0.0364,0.3144,-0.1225,0.0145,0.1442,-0.3415,0.0831,-0.266,-0.1344,-0.0364,-0.363,0.1861,-0.1637,-0.3116,0.155,-0.2035,-0.3144,-0.1225,0.0145,-0.363,0.1861,-0.1637,-0.2747,0.2289,-0.2462,-0.3116,0.155,-0.2035,-0.3144,0.2836,-0.22,0.363,0.1861,-0.1637,0.266,-0.1344,-0.0364,0.3116,0.155,-0.2035,0.3144,-0.1225,0.0145,0,-0.4311,0.1926,0.1442,-0.3415,0.0831,0.1815,-0.3484,0.1449,0,-0.4072,0.1211,-0.1815,0.355,-0.2612,0,0.3122,-0.2943,-0.1635,0.2887,-0.2807,0,0.3811,-0.2763,0.1635,0.2887,-0.2807,0.3144,0.2836,-0.22,0.2747,0.2289,-0.2462,0.1815,0.355,-0.2612],
    normals: [0.704,0.71,0.0158,0.9208,-0.0754,-0.3826,0.704,0.3414,-0.6228,0.9208,0.2937,0.2566,0.3272,0.5672,-0.7559,0.704,0.71,0.0158,0.704,0.3414,-0.6228,0.3272,0.9382,-0.1132,0.3272,0.5672,-0.7559,0,0.9899,-0.1418,0.3272,0.9382,-0.1132,0,0.6177,-0.7864,-0.3272,0.5672,-0.7559,0,0.9899,-0.1418,0,0.6177,-0.7864,-0.3272,0.9382,-0.1132,-0.704,0.3414,-0.6228,-0.3272,0.9382,-0.1132,-0.3272,0.5672,-0.7559,-0.704,0.71,0.0158,0,-0.6188,0.7856,0.6616,-0.7498,0.0072,0.6616,-0.3812,0.6457,0,-0.9897,0.1431,0.8858,-0.0541,0.4609,0.6616,-0.7498,0.0072,0.8858,-0.4262,-0.1836,0.6616,-0.3812,0.6457,-0.6616,-0.7498,0.0072,-0.8858,-0.0541,0.4609,-0.8858,-0.4262,-0.1836,-0.6616,-0.3812,0.6457,-0.8858,-0.4262,-0.1836,-0.9208,0.2937,0.2566,-0.9208,-0.0754,-0.3826,-0.8858,-0.0541,0.4609,-0.9208,-0.0754,-0.3826,-0.704,0.71,0.0158,-0.704,0.3414,-0.6228,-0.9208,0.2937,0.2566,-0.6616,-0.3812,0.6457,0,-0.9897,0.1431,0,-0.6188,0.7856,-0.6616,-0.7498,0.0072,0.9208,0.2937,0.2566,0.8858,-0.4262,-0.1836,0.9208,-0.0754,-0.3826,0.8858,-0.0541,0.4609,0.3066,0.1892,0.9329,-0.3066,0.1892,0.9329,0,0.066,0.9978,0.3942,0.3485,0.8504,-0.3942,0.3485,0.8504,-0.4229,0.5023,0.7542,0.4229,0.5023,0.7542,-0.3259,0.6947,0.6412,0.3259,0.6947,0.6412,-0.1469,0.7925,0.5919,0.1469,0.7925,0.5919,0,0.8127,0.5826,-0.3066,-0.7133,-0.6303,0.3066,-0.7133,-0.6303,0,-0.8311,-0.5561,0.3942,-0.5622,-0.727,-0.3942,-0.5622,-0.727,-0.4229,-0.402,-0.8121,0.4229,-0.402,-0.8121,-0.3259,-0.208,-0.9222,0.3259,-0.208,-0.9222,-0.1469,-0.1164,-0.9823,0.1469,-0.1164,-0.9823,0,-0.0982,-0.9952,0.6616,-0.3812,0.6457,0,0.066,0.9978,0,-0.6188,0.7856,0.3066,0.1892,0.9329,0,0.066,0.9978,-0.6616,-0.3812,0.6457,0,-0.6188,0.7856,-0.3066,0.1892,0.9329,-0.8858,-0.0541,0.4609,-0.4229,0.5023,0.7542,-0.9208,0.2937,0.2566,-0.3942,0.3485,0.8504,0.8858,-0.0541,0.4609,0.3066,0.1892,0.9329,0.6616,-0.3812,0.6457,0.3942,0.3485,0.8504,0.3259,-0.208,-0.9222,0.9208,-0.0754,-0.3826,0.4229,-0.402,-0.8121,0.704,0.3414,-0.6228,0.3259,0.6947,0.6412,0.9208,0.2937,0.2566,0.704,0.71,0.0158,0.4229,0.5023,0.7542,0.3272,0.9382,-0.1132,0.3259,0.6947,0.6412,0.704,0.71,0.0158,0.1469,0.7925,0.5919,-0.3272,0.9382,-0.1132,0,0.8127,0.5826,0,0.9899,-0.1418,-0.1469,0.7925,0.5919,-0.3272,0.9382,-0.1132,-0.3259,0.6947,0.6412,-0.1469,0.7925,0.5919,-0.704,0.71,0.0158,0.4229,0.5023,0.7542,0.8858,-0.0541,0.4609,0.9208,0.2937,0.2566,0.3942,0.3485,0.8504,-0.9208,0.2937,0.2566,-0.3259,0.6947,0.6412,-0.704,0.71,0.0158,-0.4229,0.5023,0.7542,0,0.9899,-0.1418,0.1469,0.7925,0.5919,0.3272,0.9382,-0.1132,0,0.8127,0.5826,-0.3066,0.1892,0.9329,-0.8858,-0.0541,0.4609,-0.6616,-0.3812,0.6457,-0.3942,0.3485,0.8504,-0.6616,-0.7498,0.0072,-0.3942,-0.5622,-0.727,-0.3066,-0.7133,-0.6303,-0.8858,-0.4262,-0.1836,-0.704,0.3414,-0.6228,-0.1469,-0.1164,-0.9823,-0.3259,-0.208,-0.9222,-0.3272,0.5672,-0.7559,0,-0.0982,-0.9952,0.3272,0.5672,-0.7559,0.1469,-0.1164,-0.9823,0,0.6177,-0.7864,0,-0.9897,0.1431,-0.3066,-0.7133,-0.6303,0,-0.8311,-0.5561,-0.6616,-0.7498,0.0072,0.6616,-0.7498,0.0072,0.3942,-0.5622,-0.727,0.8858,-0.4262,-0.1836,0.3066,-0.7133,-0.6303,-0.3942,-0.5622,-0.727,-0.9208,-0.0754,-0.3826,-0.4229,-0.402,-0.8121,-0.8858,-0.4262,-0.1836,-0.9208,-0.0754,-0.3826,-0.3259,-0.208,-0.9222,-0.4229,-0.402,-0.8121,-0.704,0.3414,-0.6228,0.9208,-0.0754,-0.3826,0.3942,-0.5622,-0.727,0.4229,-0.402,-0.8121,0.8858,-0.4262,-0.1836,0,-0.9897,0.1431,0.3066,-0.7133,-0.6303,0.6616,-0.7498,0.0072,0,-0.8311,-0.5561,-0.3272,0.5672,-0.7559,0,-0.0982,-0.9952,-0.1469,-0.1164,-0.9823,0,0.6177,-0.7864,0.1469,-0.1164,-0.9823,0.704,0.3414,-0.6228,0.3259,-0.208,-0.9222,0.3272,0.5672,-0.7559],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,49,51,52,52,51,53,53,51,54,53,54,55,55,54,56,55,56,57,57,56,58,57,58,59,60,61,62,61,60,63,63,60,64,63,64,65,63,65,66,66,65,67,66,67,68,68,67,69,68,69,70,70,69,71,72,73,74,73,72,75,76,77,78,77,76,79,80,81,82,81,80,83,84,85,86,85,84,87,88,89,90,89,88,91,92,93,94,93,92,95,96,97,98,97,96,99,100,101,102,101,100,103,104,105,106,105,104,107,108,109,110,109,108,111,112,113,114,113,112,115,116,117,118,117,116,119,120,121,122,121,120,123,124,125,126,125,124,127,128,129,130,129,128,131,132,133,134,133,132,135,136,137,138,137,136,139,140,141,142,141,140,143,144,145,146,145,144,147,148,149,150,149,148,151,152,153,154,153,152,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  {
    id: "wedge-04",
    shape: {
      form: "wedge", taper: 0.604825, symmetry: "handed", longest: 0.341432,
      aspect: [1, 0.890262, 0.876125],
      size: [0.303964, 0.341432, 0.299137],
    },
    attachment: {
      axis: "y", dir: 1, n: 4,
      sunkUnitsMin: 0.197223, sunkUnitsMean: 0.222223, sunkUnitsMax: 0.297223,
      sunkFractionMin: 0.577635, sunkFractionMean: 0.650856, sunkFractionMax: 0.870519,
    },
    roles: ["ear", "tooth"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.303964, 0.341432, 0.299137],
    offset: [0.171215, 1.304743, 0.382991],
    provenance: [
      { species: "bunny", node: "body", ordinal: 3, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-right" },
      { species: "chick", node: "body", ordinal: 1, role: "ear", name: "ear-right" },
      { species: "monkey", node: "body", ordinal: 4, role: "ear", name: "ear-right" },
      { species: "penguin", node: "body", ordinal: 1, role: "ear", name: "ear-right" },
    ],
    positions: [0.1108,0.067,-0.1094,0.1344,0.1078,0.0073,0.1452,0.0743,-0.051,0.0515,0.09,-0.1336,0.0848,0.1477,0.0315,0.0018,0.1299,-0.1094,0.0254,0.1707,0.0073,-0.0089,0.1633,-0.051,-0.1399,-0.1,-0.0087,-0.0825,0.1287,-0.0241,-0.0661,0.0778,-0.1128,-0.152,-0.0624,0.0569,0.1108,0.067,-0.1094,0.152,-0.0067,-0.0241,0.0997,-0.0179,-0.1128,0.1452,0.0743,-0.051,0.1356,0.0442,0.0647,-0.0466,-0.08,0.1496,0.0091,-0.1248,0.1224,0.0601,0.1049,0.1014,0.152,-0.0067,-0.0241,-0.0174,-0.1707,-0.0087,0.0997,-0.0179,-0.1128,0.0212,-0.1624,0.0569,-0.0302,0.1399,0.0647,-0.0089,0.1633,-0.051,-0.0825,0.1287,-0.0241,0.0254,0.1707,0.0073,0.0094,0.0171,-0.1496,-0.0174,-0.1707,-0.0087,-0.0841,-0.1449,-0.0359,0.0997,-0.0179,-0.1128,-0.1134,-0.0541,0.1224,-0.0825,0.1287,-0.0241,-0.152,-0.0624,0.0569,-0.0302,0.1399,0.0647,0.152,-0.0067,-0.0241,0.0091,-0.1248,0.1224,0.0212,-0.1624,0.0569,0.1356,0.0442,0.0647,0.0515,0.09,-0.1336,0.0997,-0.0179,-0.1128,0.0094,0.0171,-0.1496,0.1108,0.067,-0.1094,0.0848,0.1477,0.0315,-0.0302,0.1399,0.0647,0.0601,0.1049,0.1014,0.0254,0.1707,0.0073,-0.0825,0.1287,-0.0241,0.0018,0.1299,-0.1094,-0.0661,0.0778,-0.1128,-0.0089,0.1633,-0.051,0.1452,0.0743,-0.051,0.1356,0.0442,0.0647,0.152,-0.0067,-0.0241,0.1344,0.1078,0.0073,0.0018,0.1299,-0.1094,0.0094,0.0171,-0.1496,-0.0661,0.0778,-0.1128,0.0515,0.09,-0.1336,-0.0661,0.0778,-0.1128,-0.0841,-0.1449,-0.0359,-0.1399,-0.1,-0.0087,0.0094,0.0171,-0.1496,0.0601,0.1049,0.1014,-0.1134,-0.0541,0.1224,-0.0466,-0.08,0.1496,-0.0302,0.1399,0.0647,0.1344,0.1078,0.0073,0.0601,0.1049,0.1014,0.1356,0.0442,0.0647,0.0848,0.1477,0.0315],
    normals: [0.6529,0.3383,-0.6777,0.8014,0.5954,0.0572,0.8693,0.3848,-0.3102,0.279,0.4832,-0.8299,0.4889,0.8468,0.2094,-0.0335,0.7346,-0.6777,0.115,0.9917,0.0572,-0.1014,0.9452,-0.3102,-0.8099,-0.0072,-0.5865,-0.7635,0.642,-0.0704,-0.6444,0.2729,-0.7143,-0.9295,0.3637,0.0605,0.6529,0.3383,-0.6777,0.9377,-0.3402,-0.0704,0.5585,-0.4216,-0.7143,0.8693,0.3848,-0.3102,0.8187,0.029,0.5735,0.1099,0.1904,0.9755,0.6601,-0.2522,0.7075,0.2711,0.4696,0.8403,0.9377,-0.3402,-0.0704,0.3987,-0.705,-0.5865,0.5585,-0.4216,-0.7143,0.7798,-0.6232,0.0605,-0.3842,0.7235,0.5735,-0.1014,0.9452,-0.3102,-0.7635,0.642,-0.0704,0.115,0.9917,0.0572,-0.0968,-0.1677,-0.9811,0.3987,-0.705,-0.5865,-0.2597,-0.4499,-0.8545,0.5585,-0.4216,-0.7143,-0.5485,0.4456,0.7075,-0.7635,0.642,-0.0704,-0.9295,0.3637,0.0605,-0.3842,0.7235,0.5735,0.9377,-0.3402,-0.0704,0.6601,-0.2522,0.7075,0.7798,-0.6232,0.0605,0.8187,0.029,0.5735,0.279,0.4832,-0.8299,0.5585,-0.4216,-0.7143,-0.0968,-0.1677,-0.9811,0.6529,0.3383,-0.6777,0.4889,0.8468,0.2094,-0.3842,0.7235,0.5735,0.2711,0.4696,0.8403,0.115,0.9917,0.0572,-0.7635,0.642,-0.0704,-0.0335,0.7346,-0.6777,-0.6444,0.2729,-0.7143,-0.1014,0.9452,-0.3102,0.8693,0.3848,-0.3102,0.8187,0.029,0.5735,0.9377,-0.3402,-0.0704,0.8014,0.5954,0.0572,-0.0335,0.7346,-0.6777,-0.0968,-0.1677,-0.9811,-0.6444,0.2729,-0.7143,0.279,0.4832,-0.8299,-0.6444,0.2729,-0.7143,-0.2597,-0.4499,-0.8545,-0.8099,-0.0072,-0.5865,-0.0968,-0.1677,-0.9811,0.2711,0.4696,0.8403,-0.5485,0.4456,0.7075,0.1099,0.1904,0.9755,-0.3842,0.7235,0.5735,0.8014,0.5954,0.0572,0.2711,0.4696,0.8403,0.8187,0.029,0.5735,0.4889,0.8468,0.2094],
    indices: [0,1,2,1,0,3,1,3,4,4,3,5,4,5,6,6,5,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-05",
    shape: {
      form: "wedge", taper: 0.604825, symmetry: "handed", longest: 0.341432,
      aspect: [1, 0.890262, 0.876125],
      size: [0.303964, 0.341432, 0.299137],
    },
    attachment: {
      axis: "y", dir: 1, n: 4,
      sunkUnitsMin: 0.197223, sunkUnitsMean: 0.222223, sunkUnitsMax: 0.297223,
      sunkFractionMin: 0.577635, sunkFractionMean: 0.650856, sunkFractionMax: 0.870519,
    },
    roles: ["ear", "tooth"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.303964, 0.341432, 0.299137],
    offset: [-0.171214, 1.304743, 0.382991],
    provenance: [
      { species: "bunny", node: "body", ordinal: 5, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-left" },
      { species: "chick", node: "body", ordinal: 3, role: "ear", name: "ear-left" },
      { species: "monkey", node: "body", ordinal: 6, role: "ear", name: "ear-left" },
      { species: "penguin", node: "body", ordinal: 3, role: "ear", name: "ear-left" },
    ],
    positions: [-0.0848,0.1477,0.0315,-0.1344,0.1078,0.0073,-0.0601,0.1049,0.1014,-0.1356,0.0442,0.0647,0.0302,0.1399,0.0647,-0.0601,0.1049,0.1014,0.1134,-0.0541,0.1224,0.0466,-0.08,0.1496,-0.0094,0.0171,-0.1496,0.0661,0.0778,-0.1128,0.0841,-0.1449,-0.0359,0.1399,-0.1,-0.0087,-0.0515,0.09,-0.1336,-0.0018,0.1299,-0.1094,-0.0094,0.0171,-0.1496,0.0661,0.0778,-0.1128,-0.1344,0.1078,0.0073,-0.1452,0.0743,-0.051,-0.1356,0.0442,0.0647,-0.152,-0.0067,-0.0241,0.0089,0.1633,-0.051,0.0825,0.1287,-0.0241,-0.0018,0.1299,-0.1094,0.0661,0.0778,-0.1128,-0.0254,0.1707,0.0073,-0.0848,0.1477,0.0315,0.0302,0.1399,0.0647,-0.0601,0.1049,0.1014,-0.1108,0.067,-0.1094,-0.0515,0.09,-0.1336,-0.0997,-0.0179,-0.1128,-0.0094,0.0171,-0.1496,-0.1356,0.0442,0.0647,-0.152,-0.0067,-0.0241,-0.0091,-0.1248,0.1224,-0.0212,-0.1624,0.0569,0.0302,0.1399,0.0647,0.1134,-0.0541,0.1224,0.0825,0.1287,-0.0241,0.152,-0.0624,0.0569,-0.0997,-0.0179,-0.1128,-0.0094,0.0171,-0.1496,0.0174,-0.1707,-0.0087,0.0841,-0.1449,-0.0359,-0.0254,0.1707,0.0073,0.0302,0.1399,0.0647,0.0089,0.1633,-0.051,0.0825,0.1287,-0.0241,-0.0212,-0.1624,0.0569,-0.152,-0.0067,-0.0241,0.0174,-0.1707,-0.0087,-0.0997,-0.0179,-0.1128,-0.0601,0.1049,0.1014,-0.1356,0.0442,0.0647,0.0466,-0.08,0.1496,-0.0091,-0.1248,0.1224,-0.1452,0.0743,-0.051,-0.1108,0.067,-0.1094,-0.152,-0.0067,-0.0241,-0.0997,-0.0179,-0.1128,0.152,-0.0624,0.0569,0.1399,-0.1,-0.0087,0.0825,0.1287,-0.0241,0.0661,0.0778,-0.1128,0.0089,0.1633,-0.051,-0.0018,0.1299,-0.1094,-0.0254,0.1707,0.0073,-0.0848,0.1477,0.0315,-0.0515,0.09,-0.1336,-0.1344,0.1078,0.0073,-0.1108,0.067,-0.1094,-0.1452,0.0743,-0.051],
    normals: [-0.4889,0.8468,0.2094,-0.8014,0.5954,0.0572,-0.2711,0.4696,0.8403,-0.8187,0.029,0.5735,0.3842,0.7235,0.5735,-0.2711,0.4696,0.8403,0.5485,0.4456,0.7075,-0.1099,0.1904,0.9755,0.0968,-0.1677,-0.9811,0.6444,0.2729,-0.7143,0.2597,-0.4499,-0.8545,0.8099,-0.0072,-0.5865,-0.279,0.4832,-0.8299,0.0335,0.7346,-0.6777,0.0968,-0.1677,-0.9811,0.6444,0.2729,-0.7143,-0.8014,0.5954,0.0572,-0.8693,0.3848,-0.3102,-0.8187,0.029,0.5735,-0.9377,-0.3402,-0.0704,0.1014,0.9452,-0.3102,0.7635,0.642,-0.0704,0.0335,0.7346,-0.6777,0.6444,0.2729,-0.7143,-0.115,0.9917,0.0572,-0.4889,0.8468,0.2094,0.3842,0.7235,0.5735,-0.2711,0.4696,0.8403,-0.6529,0.3383,-0.6777,-0.279,0.4832,-0.8299,-0.5585,-0.4216,-0.7143,0.0968,-0.1677,-0.9811,-0.8187,0.029,0.5735,-0.9377,-0.3402,-0.0704,-0.6601,-0.2522,0.7075,-0.7798,-0.6232,0.0605,0.3842,0.7235,0.5735,0.5485,0.4456,0.7075,0.7635,0.642,-0.0704,0.9295,0.3637,0.0605,-0.5585,-0.4216,-0.7143,0.0968,-0.1677,-0.9811,-0.3987,-0.705,-0.5865,0.2597,-0.4499,-0.8545,-0.115,0.9917,0.0572,0.3842,0.7235,0.5735,0.1014,0.9452,-0.3102,0.7635,0.642,-0.0704,-0.7798,-0.6232,0.0605,-0.9377,-0.3402,-0.0704,-0.3987,-0.705,-0.5865,-0.5585,-0.4216,-0.7143,-0.2711,0.4696,0.8403,-0.8187,0.029,0.5735,-0.1099,0.1904,0.9755,-0.6601,-0.2522,0.7075,-0.8693,0.3848,-0.3102,-0.6529,0.3383,-0.6777,-0.9377,-0.3402,-0.0704,-0.5585,-0.4216,-0.7143,0.9295,0.3637,0.0605,0.8099,-0.0072,-0.5865,0.7635,0.642,-0.0704,0.6444,0.2729,-0.7143,0.1014,0.9452,-0.3102,0.0335,0.7346,-0.6777,-0.115,0.9917,0.0572,-0.4889,0.8468,0.2094,-0.279,0.4832,-0.8299,-0.8014,0.5954,0.0572,-0.6529,0.3383,-0.6777,-0.8693,0.3848,-0.3102],
    indices: [0,1,2,3,2,1,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,43,42,41,44,45,46,47,46,45,48,49,50,51,50,49,52,53,54,55,54,53,56,57,58,59,58,57,60,61,62,63,62,61,64,65,66,66,65,67,65,68,67,67,68,69,68,70,69,71,69,70],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-06",
    shape: {
      form: "wedge", taper: 0.410366, symmetry: "mirror", longest: 0.362237,
      aspect: [1, 0.905485, 0.852765],
      size: [0.328, 0.362237, 0.308903],
    },
    attachment: {
      axis: "y", dir: 1, n: 2,
      sunkUnitsMin: 0.20777, sunkUnitsMean: 0.20777, sunkUnitsMax: 0.20777,
      sunkFractionMin: 0.573575, sunkFractionMean: 0.573575, sunkFractionMax: 0.573575,
    },
    roles: ["ear"],
    tris: 62,
    verts: 112,
    triVariants: [62],
    size: [0.328, 0.362237, 0.308903],
    offset: [0.336, 1.404599, 0.320549],
    provenance: [
      { species: "cat", node: "body", ordinal: 0, role: "ear", name: "ear-right" },
      { species: "cat", node: "body", ordinal: 1, role: "ear", name: "ear-left" },
    ],
    positions: [0.0673,0.125,0.0364,0.118,0.0648,0.1107,0.118,0.0337,-0.0055,0.0673,0.1396,0.0907,0.118,0.0337,-0.0055,0.1506,-0.0153,0.1322,0.1506,-0.0642,-0.0505,0.118,0.0648,0.1107,0.1506,-0.0642,-0.0505,0.164,-0.0983,0.1545,0.164,-0.1658,-0.0971,0.1506,-0.0153,0.1322,0.0256,0.1758,0.0597,0.0673,0.1396,0.0907,0.0673,0.125,0.0364,0.0256,0.1811,0.0796,-0.0256,0.1758,0.0597,0.0256,0.1811,0.0796,0.0256,0.1758,0.0597,-0.0256,0.1811,0.0796,-0.118,0.0648,0.1107,-0.0673,0.125,0.0364,-0.118,0.0337,-0.0055,-0.0673,0.1396,0.0907,-0.164,-0.0983,0.1545,-0.1506,-0.0642,-0.0505,-0.164,-0.1658,-0.0971,-0.1506,-0.0153,0.1322,-0.0673,0.1396,0.0907,-0.0256,0.1758,0.0597,-0.0673,0.125,0.0364,-0.0256,0.1811,0.0796,-0.1506,-0.0153,0.1322,-0.118,0.0337,-0.0055,-0.1506,-0.0642,-0.0505,-0.118,0.0648,0.1107,-0.1103,-0.0872,-0.1114,0.1227,-0.1811,-0.1545,-0.1227,-0.1811,-0.1545,0.1103,-0.0872,-0.1114,-0.0798,0.0044,-0.0693,0.0798,0.0044,-0.0693,-0.0324,0.0899,-0.03,0.0324,0.0899,-0.03,0.005,0.1232,-0.0148,-0.005,0.1232,-0.0148,0.0324,0.0899,-0.03,0.0256,0.1758,0.0597,0.0673,0.125,0.0364,0.005,0.1232,-0.0148,0.1103,-0.0872,-0.1114,0.164,-0.1658,-0.0971,0.1227,-0.1811,-0.1545,0.1506,-0.0642,-0.0505,-0.0324,0.0899,-0.03,-0.0256,0.1758,0.0597,-0.005,0.1232,-0.0148,-0.0673,0.125,0.0364,-0.0798,0.0044,-0.0693,-0.0673,0.125,0.0364,-0.0324,0.0899,-0.03,-0.118,0.0337,-0.0055,0.005,0.1232,-0.0148,-0.0256,0.1758,0.0597,0.0256,0.1758,0.0597,-0.005,0.1232,-0.0148,-0.164,-0.1658,-0.0971,-0.1103,-0.0872,-0.1114,-0.1227,-0.1811,-0.1545,-0.1506,-0.0642,-0.0505,-0.1506,-0.0642,-0.0505,-0.0798,0.0044,-0.0693,-0.1103,-0.0872,-0.1114,-0.118,0.0337,-0.0055,0.0798,0.0044,-0.0693,0.1506,-0.0642,-0.0505,0.1103,-0.0872,-0.1114,0.118,0.0337,-0.0055,0.0798,0.0044,-0.0693,0.0673,0.125,0.0364,0.118,0.0337,-0.0055,0.0324,0.0899,-0.03,0.1506,-0.0153,0.1322,0.1063,-0.0983,0.1545,0.164,-0.0983,0.1545,0.0637,-0.0024,0.1287,0.118,0.0648,0.1107,0,0.0724,0.1087,0.0673,0.1396,0.0907,-0.0673,0.1396,0.0907,0.0256,0.1811,0.0796,-0.0256,0.1811,0.0796,-0.118,0.0648,0.1107,-0.0637,-0.0024,0.1287,-0.1506,-0.0153,0.1322,-0.1063,-0.0983,0.1545,-0.164,-0.0983,0.1545,0,-0.0156,0.0779,-0.1063,-0.0983,0.1545,0.1063,-0.0983,0.1545,0,-0.0156,0.0779,-0.0637,-0.0024,0.1287,-0.1063,-0.0983,0.1545,0,0.0724,0.1087,-0.0637,-0.0024,0.1287,0,-0.0156,0.0779,0,-0.0156,0.0779,0.1063,-0.0983,0.1545,0.0637,-0.0024,0.1287,0,0.0724,0.1087,0,-0.0156,0.0779,0.0637,-0.0024,0.1287],
    normals: [0.68,0.6258,-0.382,0.8883,0.4436,-0.1189,0.7852,0.5001,-0.3651,0.7805,0.6038,-0.1618,0.7852,0.5001,-0.3651,0.9653,0.2523,-0.0676,0.8725,0.3466,-0.3444,0.8883,0.4436,-0.1189,0.8725,0.3466,-0.3444,0.9881,0.1487,-0.0398,0.8301,0.3194,-0.4571,0.9653,0.2523,-0.0676,0.3578,0.8485,-0.3899,0.7805,0.6038,-0.1618,0.68,0.6258,-0.382,0.3897,0.8896,-0.2384,-0.3578,0.8485,-0.3899,0.3897,0.8896,-0.2384,0.3578,0.8485,-0.3899,-0.3897,0.8896,-0.2384,-0.8883,0.4436,-0.1189,-0.68,0.6258,-0.382,-0.7852,0.5001,-0.3651,-0.7805,0.6038,-0.1618,-0.9881,0.1487,-0.0398,-0.8725,0.3466,-0.3444,-0.8301,0.3194,-0.4571,-0.9653,0.2523,-0.0676,-0.7805,0.6038,-0.1618,-0.3578,0.8485,-0.3899,-0.68,0.6258,-0.382,-0.3897,0.8896,-0.2384,-0.9653,0.2523,-0.0676,-0.7852,0.5001,-0.3651,-0.8725,0.3466,-0.3444,-0.8883,0.4436,-0.1189,-0.3838,0.4465,-0.8083,0.3282,0.4295,-0.8413,-0.3282,0.4295,-0.8413,0.3838,0.4465,-0.8083,-0.3373,0.5024,-0.7961,0.3373,0.5024,-0.7961,-0.2882,0.547,-0.7859,0.2882,0.547,-0.7859,0.1719,0.6504,-0.7399,-0.1719,0.6504,-0.7399,0.2882,0.547,-0.7859,0.3578,0.8485,-0.3899,0.68,0.6258,-0.382,0.1719,0.6504,-0.7399,0.3838,0.4465,-0.8083,0.8301,0.3194,-0.4571,0.3282,0.4295,-0.8413,0.8725,0.3466,-0.3444,-0.2882,0.547,-0.7859,-0.3578,0.8485,-0.3899,-0.1719,0.6504,-0.7399,-0.68,0.6258,-0.382,-0.3373,0.5024,-0.7961,-0.68,0.6258,-0.382,-0.2882,0.547,-0.7859,-0.7852,0.5001,-0.3651,0.1719,0.6504,-0.7399,-0.3578,0.8485,-0.3899,0.3578,0.8485,-0.3899,-0.1719,0.6504,-0.7399,-0.8301,0.3194,-0.4571,-0.3838,0.4465,-0.8083,-0.3282,0.4295,-0.8413,-0.8725,0.3466,-0.3444,-0.8725,0.3466,-0.3444,-0.3373,0.5024,-0.7961,-0.3838,0.4465,-0.8083,-0.7852,0.5001,-0.3651,0.3373,0.5024,-0.7961,0.8725,0.3466,-0.3444,0.3838,0.4465,-0.8083,0.7852,0.5001,-0.3651,0.3373,0.5024,-0.7961,0.68,0.6258,-0.382,0.7852,0.5001,-0.3651,0.2882,0.547,-0.7859,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.2588,0.9659,0,0.0668,0.9978,0.2753,0.4382,0.8557,-0.2753,0.4382,0.8557,0,0.0668,0.9978,0.6003,-0.1387,0.7876,0.2753,0.4382,0.8557,0,-0.3308,0.9437,0.6003,-0.1387,0.7876,0,0.0668,0.9978,0,0.0668,0.9978,-0.2753,0.4382,0.8557,-0.6003,-0.1387,0.7876,0,-0.3308,0.9437,0,0.0668,0.9978,-0.6003,-0.1387,0.7876],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,39,36,40,39,40,41,41,40,42,41,42,43,43,42,44,44,42,45,46,47,48,47,46,49,50,51,52,51,50,53,54,55,56,55,54,57,58,59,60,59,58,61,62,63,64,63,62,65,66,67,68,67,66,69,70,71,72,71,70,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,85,82,86,85,86,87,87,86,88,89,87,88,89,88,90,89,90,91,92,87,89,92,93,87,94,93,92,94,95,93,95,94,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111],
    bands: [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,1,1,1,1,1],
  },
  {
    id: "wedge-07",
    shape: {
      form: "wedge", taper: 0.522057, symmetry: "mirror", longest: 1.046587,
      aspect: [1, 0.530501, 0.191097],
      size: [0.2, 1.046587, 0.555215],
    },
    attachment: {
      axis: "z", dir: -1, n: 2,
      sunkUnitsMin: 0.076606, sunkUnitsMean: 0.088303, sunkUnitsMax: 0.1,
      sunkFractionMin: 0.137975, sunkFractionMean: 0.159043, sunkFractionMax: 0.18011,
    },
    roles: ["tail"],
    tris: 212,
    verts: 396,
    triVariants: [212],
    size: [0.2, 1.046587, 0.555215],
    offset: [0, 1.186701, -0.826001],
    provenance: [
      { species: "cat", node: "tail", ordinal: -1, role: "tail", name: "tail" },
      { species: "monkey", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [-0.1,-0.3524,0.1179,-0.05,-0.267,0.1803,-0.1,-0.2785,0.0928,-0.05,-0.3083,0.1943,0.05,-0.0048,0.1544,0.1,-0.1228,0.103,0.1,-0.0489,0.0779,0.05,-0.1113,0.1905,-0.05,-0.0603,-0.0273,0.05,-0.0931,0.0014,-0.05,-0.0931,0.0014,0.05,-0.0603,-0.0273,0.05,-0.3411,0.2231,0.1,-0.4456,0.2393,0.1,-0.4111,0.1693,0.05,-0.368,0.2776,0.05,0.3121,-0.2703,0.1,0.2114,-0.1901,0.05,0.1998,-0.2776,0.1,0.2892,-0.185,-0.1,0.2114,-0.1901,-0.05,0.3121,-0.2703,-0.05,0.1998,-0.2776,-0.1,0.2892,-0.185,0.05,0.0798,0.0802,-0.05,-0.0048,0.1544,0.05,-0.0048,0.1544,-0.05,0.0798,0.0802,-0.1,-0.4456,0.2393,-0.05,-0.3411,0.2231,-0.1,-0.4111,0.1693,-0.05,-0.368,0.2776,0.05,-0.267,0.1803,-0.05,-0.3083,0.1943,0.05,-0.3083,0.1943,-0.05,-0.267,0.1803,0.05,-0.3083,0.1943,-0.05,-0.3411,0.2231,0.05,-0.3411,0.2231,-0.05,-0.3083,0.1943,0.05,-0.267,0.1803,0.1,-0.3524,0.1179,0.1,-0.2785,0.0928,0.05,-0.3083,0.1943,-0.05,-0.0931,0.0014,0.05,-0.1343,0.0154,-0.05,-0.1343,0.0154,0.05,-0.0931,0.0014,-0.1,0.1375,-0.165,-0.05,0.2229,-0.1025,-0.1,0.2114,-0.1901,-0.05,0.1816,-0.0885,-0.05,-0.5233,0.201,-0.1,-0.4111,0.1693,-0.05,-0.4812,0.1156,-0.1,-0.4456,0.2393,-0.1,-0.1228,0.103,-0.05,-0.0048,0.1544,-0.1,-0.0489,0.0779,-0.05,-0.1113,0.1905,0.1,-0.3524,0.1179,0.05,-0.4812,0.1156,0.05,-0.3966,0.0414,0.1,-0.4111,0.1693,0.1,0.1375,-0.165,0.05,0.0087,-0.1673,0.05,0.0933,-0.2414,0.1,0.0788,-0.1135,0.1,-0.4456,0.2393,-0.05,-0.5233,0.201,0.05,-0.5233,0.201,-0.1,-0.4456,0.2393,0.05,-0.368,0.2776,-0.05,-0.368,0.2776,0.05,0.413,-0.2205,0.1,0.2892,-0.185,0.05,0.3121,-0.2703,0.1,0.3592,-0.1504,0.05,0.1816,-0.0885,0.1,0.0788,-0.1135,0.1,0.1375,-0.165,0.05,0.1488,-0.0598,-0.05,0.0933,-0.2414,-0.1,0.2114,-0.1901,-0.05,0.1998,-0.2776,-0.1,0.1375,-0.165,-0.05,-0.3966,0.0414,0.05,-0.2901,0.0052,0.05,-0.3966,0.0414,-0.05,-0.2901,0.0052,0.05,0.3055,-0.0804,-0.05,0.2664,-0.0997,0.05,0.2664,-0.0997,-0.05,0.3055,-0.0804,-0.05,0.0087,-0.1673,-0.1,0.1375,-0.165,-0.05,0.0933,-0.2414,-0.1,0.0788,-0.1135,0.1,-0.4111,0.1693,0.05,-0.5233,0.201,0.05,-0.4812,0.1156,0.1,-0.4456,0.2393,-0.05,0.3121,-0.2703,0.05,0.1998,-0.2776,-0.05,0.1998,-0.2776,0.05,0.3121,-0.2703,-0.1,0.2892,-0.185,-0.05,0.413,-0.2205,-0.05,0.3121,-0.2703,-0.1,0.3592,-0.1504,-0.05,0.2229,-0.1025,-0.1,0.2892,-0.185,-0.1,0.2114,-0.1901,-0.05,0.2664,-0.0997,-0.1,0.3592,-0.1504,-0.05,0.4871,-0.1359,-0.05,0.413,-0.2205,-0.1,0.4107,-0.0918,-0.1,-0.2785,0.0928,-0.05,-0.195,0.0115,-0.05,-0.2901,0.0052,-0.05,-0.1343,0.0154,-0.1,-0.2007,0.0979,-0.1,-0.1228,0.103,-0.05,-0.3966,0.0414,0.05,-0.4812,0.1156,-0.05,-0.4812,0.1156,0.05,-0.3966,0.0414,-0.1,0.0443,-0.0435,-0.05,0.1488,-0.0598,-0.1,0.0788,-0.1135,-0.05,0.1219,-0.0052,-0.1,0.0098,0.0264,-0.05,0.0798,0.0802,-0.05,0.0933,-0.2414,0.05,0.0087,-0.1673,-0.05,0.0087,-0.1673,0.05,0.0933,-0.2414,0.05,0.2229,-0.1025,-0.05,0.1816,-0.0885,0.05,0.1816,-0.0885,-0.05,0.2229,-0.1025,0.1,-0.0489,0.0779,0.05,-0.1343,0.0154,0.05,-0.0931,0.0014,0.1,-0.1228,0.103,-0.1,-0.4111,0.1693,-0.05,-0.3083,0.1943,-0.1,-0.3524,0.1179,-0.05,-0.3411,0.2231,-0.05,-0.195,0.0115,0.05,-0.2901,0.0052,-0.05,-0.2901,0.0052,0.05,-0.195,0.0115,-0.05,-0.1343,0.0154,0.05,-0.1343,0.0154,0.05,0.5171,0.0657,0.1,0.4357,-0.0179,0.05,0.5233,-0.0294,0.1,0.4306,0.06,0.05,0.3482,-0.0064,-0.05,0.3342,-0.0476,0.05,0.3342,-0.0476,-0.05,0.3482,-0.0064,-0.05,-0.0334,-0.0818,-0.1,0.0788,-0.1135,-0.05,0.0087,-0.1673,-0.1,0.0443,-0.0435,-0.05,-0.0603,-0.0273,-0.1,0.0098,0.0264,-0.05,0.3482,-0.0064,-0.1,0.4306,0.06,-0.1,0.4357,-0.0179,-0.05,0.3442,0.0543,-0.05,-0.3411,0.2231,0.05,-0.368,0.2776,0.05,-0.3411,0.2231,-0.05,-0.368,0.2776,0.05,0.0798,0.0802,0.1,-0.0489,0.0779,0.1,0.0098,0.0264,0.05,-0.0048,0.1544,-0.05,0.413,-0.2205,0.05,0.3121,-0.2703,-0.05,0.3121,-0.2703,0.05,0.413,-0.2205,-0.1,0.4107,-0.0918,-0.05,0.5233,-0.0294,-0.05,0.4871,-0.1359,-0.1,0.4357,-0.0179,-0.05,0.3442,0.0543,0.05,0.3482,-0.0064,0.05,0.3442,0.0543,-0.05,0.3482,-0.0064,0.1,0.2114,-0.1901,0.05,0.0933,-0.2414,0.05,0.1998,-0.2776,0.1,0.1375,-0.165,0.05,0.4871,-0.1359,0.1,0.3592,-0.1504,0.05,0.413,-0.2205,0.1,0.4107,-0.0918,0.05,0.5233,-0.0294,0.1,0.4107,-0.0918,0.05,0.4871,-0.1359,0.1,0.4357,-0.0179,-0.05,0.1488,-0.0598,0.05,0.1219,-0.0052,0.05,0.1488,-0.0598,-0.05,0.0798,0.0802,-0.05,0.1219,-0.0052,0.05,0.0798,0.0802,0.05,-0.2063,0.1843,-0.05,-0.267,0.1803,0.05,-0.267,0.1803,-0.05,-0.2063,0.1843,0.05,-0.1113,0.1905,-0.05,-0.1113,0.1905,0.05,0.1488,-0.0598,0.1,0.0443,-0.0435,0.1,0.0788,-0.1135,0.05,0.1219,-0.0052,0.1,0.0098,0.0264,0.05,0.0798,0.0802,0.1,-0.2007,0.0979,0.05,-0.267,0.1803,0.1,-0.2785,0.0928,0.1,-0.1228,0.103,0.05,-0.2063,0.1843,0.05,-0.1113,0.1905,-0.05,0.3055,-0.0804,-0.1,0.4107,-0.0918,-0.1,0.3592,-0.1504,-0.05,0.3342,-0.0476,-0.05,0.3342,-0.0476,-0.1,0.4357,-0.0179,-0.1,0.4107,-0.0918,-0.05,0.3482,-0.0064,0.05,0.2229,-0.1025,0.1,0.1375,-0.165,0.1,0.2114,-0.1901,0.05,0.1816,-0.0885,-0.05,-0.267,0.1803,-0.1,-0.2007,0.0979,-0.1,-0.2785,0.0928,-0.1,-0.1228,0.103,-0.05,-0.2063,0.1843,-0.05,-0.1113,0.1905,-0.05,0.4871,-0.1359,0.05,0.5233,-0.0294,0.05,0.4871,-0.1359,-0.05,0.5233,-0.0294,0.1,0.4357,-0.0179,0.05,0.3342,-0.0476,0.1,0.4107,-0.0918,0.05,0.3482,-0.0064,-0.05,-0.0603,-0.0273,0.05,-0.0334,-0.0818,0.05,-0.0603,-0.0273,0.05,0.0087,-0.1673,-0.05,0.0087,-0.1673,-0.05,-0.0334,-0.0818,-0.1,0.0788,-0.1135,-0.05,0.1816,-0.0885,-0.1,0.1375,-0.165,-0.05,0.1488,-0.0598,0.05,0.2664,-0.0997,-0.05,0.2229,-0.1025,0.05,0.2229,-0.1025,-0.05,0.2664,-0.0997,0.1,0.4107,-0.0918,0.05,0.3055,-0.0804,0.1,0.3592,-0.1504,0.05,0.3342,-0.0476,-0.05,0.3342,-0.0476,0.05,0.3055,-0.0804,0.05,0.3342,-0.0476,-0.05,0.3055,-0.0804,0.1,0.3592,-0.1504,0.05,0.2664,-0.0997,0.1,0.2892,-0.185,0.05,0.3055,-0.0804,0.1,0.0098,0.0264,0.05,-0.0931,0.0014,0.05,-0.0603,-0.0273,0.1,-0.0489,0.0779,0.1,0.2892,-0.185,0.05,0.2229,-0.1025,0.1,0.2114,-0.1901,0.05,0.2664,-0.0997,0.05,0.413,-0.2205,-0.05,0.4871,-0.1359,0.05,0.4871,-0.1359,-0.05,0.413,-0.2205,-0.05,0.2664,-0.0997,-0.1,0.3592,-0.1504,-0.1,0.2892,-0.185,-0.05,0.3055,-0.0804,0.05,-0.3083,0.1943,0.1,-0.4111,0.1693,0.1,-0.3524,0.1179,0.05,-0.3411,0.2231,0.1,0.4306,0.06,0.05,0.3482,-0.0064,0.1,0.4357,-0.0179,0.05,0.3442,0.0543,-0.1,-0.0489,0.0779,-0.05,0.0798,0.0802,-0.1,0.0098,0.0264,-0.05,-0.0048,0.1544,0.05,-0.0048,0.1544,-0.05,-0.1113,0.1905,0.05,-0.1113,0.1905,-0.05,-0.0048,0.1544,-0.05,-0.5233,0.201,0.05,-0.4812,0.1156,0.05,-0.5233,0.201,-0.05,-0.4812,0.1156,-0.1,0.4357,-0.0179,-0.05,0.5171,0.0657,-0.05,0.5233,-0.0294,-0.1,0.4306,0.06,-0.05,-0.3966,0.0414,-0.1,-0.2785,0.0928,-0.05,-0.2901,0.0052,-0.1,-0.3524,0.1179,-0.05,-0.4812,0.1156,-0.1,-0.3524,0.1179,-0.05,-0.3966,0.0414,-0.1,-0.4111,0.1693,0.1,-0.2785,0.0928,0.05,-0.3966,0.0414,0.05,-0.2901,0.0052,0.1,-0.3524,0.1179,-0.05,0.5233,-0.0294,0.05,0.5171,0.0657,0.05,0.5233,-0.0294,-0.05,0.5171,0.0657,-0.05,-0.0931,0.0014,-0.1,0.0098,0.0264,-0.05,-0.0603,-0.0273,-0.1,-0.0489,0.0779,-0.05,-0.1343,0.0154,-0.1,-0.0489,0.0779,-0.05,-0.0931,0.0014,-0.1,-0.1228,0.103,0.05,-0.195,0.0115,0.1,-0.2785,0.0928,0.05,-0.2901,0.0052,0.05,-0.1343,0.0154,0.1,-0.2007,0.0979,0.1,-0.1228,0.103,-0.05,0.1998,-0.2776,0.05,0.0933,-0.2414,-0.05,0.0933,-0.2414,0.05,0.1998,-0.2776,0.05,0.1816,-0.0885,-0.05,0.1488,-0.0598,0.05,0.1488,-0.0598,-0.05,0.1816,-0.0885,0.1,0.0788,-0.1135,0.05,-0.0334,-0.0818,0.05,0.0087,-0.1673,0.1,0.0443,-0.0435,0.05,-0.0603,-0.0273,0.1,0.0098,0.0264,0.05,0.4241,0.1598,-0.025,0.3809,0.1569,0.025,0.3809,0.1569,-0.05,0.4241,0.1598,0.025,0.4673,0.1626,-0.025,0.4673,0.1626,-0.025,0.3809,0.1569,-0.1,0.4306,0.06,-0.05,0.3442,0.0543,-0.05,0.4241,0.1598,-0.05,0.4241,0.1598,-0.05,0.5171,0.0657,-0.1,0.4306,0.06,-0.025,0.4673,0.1626,0.05,0.5171,0.0657,0.05,0.4241,0.1598,0.1,0.4306,0.06,0.025,0.4673,0.1626,0.1,0.4306,0.06,0.025,0.3809,0.1569,0.05,0.3442,0.0543,0.05,0.4241,0.1598,-0.05,0.5171,0.0657,0.025,0.4673,0.1626,0.05,0.5171,0.0657,-0.025,0.4673,0.1626,0.025,0.3809,0.1569,-0.05,0.3442,0.0543,0.05,0.3442,0.0543,-0.025,0.3809,0.1569],
    normals: [-0.9981,-0.0307,-0.0532,-0.5329,0.1104,0.8389,-0.9981,-0.008,-0.0609,-0.5329,0.4231,0.7328,0.4782,0.4391,0.7606,0.9981,0.008,0.0609,0.9981,0.0307,0.0532,0.4782,0.1146,0.8708,-0.5329,-0.6713,-0.5151,0.5329,-0.4231,-0.7328,-0.5329,-0.4231,-0.7328,0.5329,-0.6713,-0.5151,0.5329,0.6713,0.5151,1,0,0,0.9981,-0.0487,-0.0374,0.5,0.7767,0.383,0.4782,0.2273,-0.8483,0.9981,-0.008,-0.0609,0.4782,-0.1146,-0.8708,0.9981,0.0159,-0.0593,-0.9981,-0.008,-0.0609,-0.4782,0.2273,-0.8483,-0.4782,-0.1146,-0.8708,-0.9981,0.0159,-0.0593,0.4782,0.6968,0.5347,-0.4782,0.4391,0.7606,0.4782,0.4391,0.7606,-0.4782,0.6968,0.5347,-1,0,0,-0.5329,0.6713,0.5151,-0.9981,-0.0487,-0.0374,-0.5,0.7767,0.383,0.5329,0.1104,0.8389,-0.5329,0.4231,0.7328,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,0.5329,0.4231,0.7328,-0.5329,0.6713,0.5151,0.5329,0.6713,0.5151,-0.5329,0.4231,0.7328,0.5329,0.1104,0.8389,0.9981,-0.0307,-0.0532,0.9981,-0.008,-0.0609,0.5329,0.4231,0.7328,-0.5329,-0.4231,-0.7328,0.5329,-0.1104,-0.8389,-0.5329,-0.1104,-0.8389,0.5329,-0.4231,-0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.1104,0.8389,-0.9981,-0.008,-0.0609,-0.5329,0.4231,0.7328,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.4782,-0.6968,-0.5347,-1,0,0,-0.9981,0.008,0.0609,-0.4782,0.4391,0.7606,-0.9981,0.0307,0.0532,-0.4782,0.1146,0.8708,0.9981,-0.0307,-0.0532,0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.9981,-0.0487,-0.0374,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0.4782,0.5347,-0.6968,0.9981,0.0159,-0.0593,0.4782,0.2273,-0.8483,0.9981,0.0374,-0.0487,0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.5329,0.6713,0.5151,-0.4782,-0.4391,-0.7606,-0.9981,-0.008,-0.0609,-0.4782,-0.1146,-0.8708,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.4782,-0.4391,-0.7606,-0.4782,-0.1146,-0.8708,0.5329,-0.5151,0.6713,-0.5329,-0.219,0.8173,0.5329,-0.219,0.8173,-0.5329,-0.5151,0.6713,-0.4782,-0.6968,-0.5347,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,-0.9981,-0.0487,-0.0374,0.9981,-0.0487,-0.0374,0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,1,0,0,-0.4782,0.2273,-0.8483,0.4782,-0.1146,-0.8708,-0.4782,-0.1146,-0.8708,0.4782,0.2273,-0.8483,-0.9981,0.0159,-0.0593,-0.4782,0.5347,-0.6968,-0.4782,0.2273,-0.8483,-0.9981,0.0374,-0.0487,-0.5329,0.1104,0.8389,-0.9981,0.0159,-0.0593,-0.9981,-0.008,-0.0609,-0.5329,-0.219,0.8173,-0.9981,0.0374,-0.0487,-0.4782,0.7606,-0.4391,-0.4782,0.5347,-0.6968,-0.9981,0.0532,-0.0307,-0.9981,-0.008,-0.0609,-0.5,0.0566,-0.8642,-0.4782,-0.1146,-0.8708,-0.5329,-0.1104,-0.8389,-1,0,0,-0.9981,0.008,0.0609,-0.4782,-0.4391,-0.7606,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,-1,0,0,-0.5329,0.6713,0.5151,-0.9981,-0.0487,-0.0374,-0.5,0.7767,0.383,-0.9981,0.0487,0.0374,-0.4782,0.6968,0.5347,-0.4782,-0.4391,-0.7606,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.5329,0.1104,0.8389,-0.5329,0.4231,0.7328,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,0.9981,0.0307,0.0532,0.5329,-0.1104,-0.8389,0.5329,-0.4231,-0.7328,0.9981,0.008,0.0609,-0.9981,-0.0487,-0.0374,-0.5329,0.4231,0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,-0.5,0.0566,-0.8642,0.4782,-0.1146,-0.8708,-0.4782,-0.1146,-0.8708,0.5,0.0566,-0.8642,-0.5329,-0.1104,-0.8389,0.5329,-0.1104,-0.8389,0.4883,0.8299,0.2697,0.9981,0.0609,-0.008,0.4782,0.8708,-0.1146,0.9766,-0.0141,0.2144,0.5329,-0.8389,0.1104,-0.5329,-0.7328,0.4231,0.5329,-0.7328,0.4231,-0.5329,-0.8389,0.1104,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.4782,-0.6968,-0.5347,-1,0,0,-0.5329,-0.6713,-0.5151,-0.9981,0.0487,0.0374,-0.5329,-0.8389,0.1104,-0.9766,-0.0141,0.2144,-0.9981,0.0609,-0.008,-0.4883,-0.858,0.1591,-0.5329,0.6713,0.5151,0.5,0.7767,0.383,0.5329,0.6713,0.5151,-0.5,0.7767,0.383,0.4782,0.6968,0.5347,0.9981,0.0307,0.0532,0.9981,0.0487,0.0374,0.4782,0.4391,0.7606,-0.4782,0.5347,-0.6968,0.4782,0.2273,-0.8483,-0.4782,0.2273,-0.8483,0.4782,0.5347,-0.6968,-0.9981,0.0532,-0.0307,-0.4782,0.8708,-0.1146,-0.4782,0.7606,-0.4391,-0.9981,0.0609,-0.008,-0.4883,-0.858,0.1591,0.5329,-0.8389,0.1104,0.4883,-0.858,0.1591,-0.5329,-0.8389,0.1104,0.9981,-0.008,-0.0609,0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.9981,-0.0307,-0.0532,0.4782,0.7606,-0.4391,0.9981,0.0374,-0.0487,0.4782,0.5347,-0.6968,0.9981,0.0532,-0.0307,0.4782,0.8708,-0.1146,0.9981,0.0532,-0.0307,0.4782,0.7606,-0.4391,0.9981,0.0609,-0.008,-0.5329,0.6713,0.5151,0.5,0.7767,0.383,0.5329,0.6713,0.5151,-0.4782,0.6968,0.5347,-0.5,0.7767,0.383,0.4782,0.6968,0.5347,0.5,-0.0566,0.8642,-0.5329,0.1104,0.8389,0.5329,0.1104,0.8389,-0.5,-0.0566,0.8642,0.4782,0.1146,0.8708,-0.4782,0.1146,0.8708,0.5329,0.6713,0.5151,1,0,0,0.9981,-0.0487,-0.0374,0.5,0.7767,0.383,0.9981,0.0487,0.0374,0.4782,0.6968,0.5347,1,0,0,0.5329,0.1104,0.8389,0.9981,-0.008,-0.0609,0.9981,0.008,0.0609,0.5,-0.0566,0.8642,0.4782,0.1146,0.8708,-0.5329,-0.5151,0.6713,-0.9981,0.0532,-0.0307,-0.9981,0.0374,-0.0487,-0.5329,-0.7328,0.4231,-0.5329,-0.7328,0.4231,-0.9981,0.0609,-0.008,-0.9981,0.0532,-0.0307,-0.5329,-0.8389,0.1104,0.5329,0.1104,0.8389,0.9981,-0.0307,-0.0532,0.9981,-0.008,-0.0609,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,-1,0,0,-0.9981,-0.008,-0.0609,-0.9981,0.008,0.0609,-0.5,-0.0566,0.8642,-0.4782,0.1146,0.8708,-0.4782,0.7606,-0.4391,0.4782,0.8708,-0.1146,0.4782,0.7606,-0.4391,-0.4782,0.8708,-0.1146,0.9981,0.0609,-0.008,0.5329,-0.7328,0.4231,0.9981,0.0532,-0.0307,0.5329,-0.8389,0.1104,-0.5329,-0.6713,-0.5151,0.5,-0.7767,-0.383,0.5329,-0.6713,-0.5151,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.5329,0.4231,0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,0.5329,-0.219,0.8173,-0.5329,0.1104,0.8389,0.5329,0.1104,0.8389,-0.5329,-0.219,0.8173,0.9981,0.0532,-0.0307,0.5329,-0.5151,0.6713,0.9981,0.0374,-0.0487,0.5329,-0.7328,0.4231,-0.5329,-0.7328,0.4231,0.5329,-0.5151,0.6713,0.5329,-0.7328,0.4231,-0.5329,-0.5151,0.6713,0.9981,0.0374,-0.0487,0.5329,-0.219,0.8173,0.9981,0.0159,-0.0593,0.5329,-0.5151,0.6713,0.9981,0.0487,0.0374,0.5329,-0.4231,-0.7328,0.5329,-0.6713,-0.5151,0.9981,0.0307,0.0532,0.9981,0.0159,-0.0593,0.5329,0.1104,0.8389,0.9981,-0.008,-0.0609,0.5329,-0.219,0.8173,0.4782,0.5347,-0.6968,-0.4782,0.7606,-0.4391,0.4782,0.7606,-0.4391,-0.4782,0.5347,-0.6968,-0.5329,-0.219,0.8173,-0.9981,0.0374,-0.0487,-0.9981,0.0159,-0.0593,-0.5329,-0.5151,0.6713,0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.5329,0.6713,0.5151,0.9766,-0.0141,0.2144,0.5329,-0.8389,0.1104,0.9981,0.0609,-0.008,0.4883,-0.858,0.1591,-0.9981,0.0307,0.0532,-0.4782,0.6968,0.5347,-0.9981,0.0487,0.0374,-0.4782,0.4391,0.7606,0.4782,0.4391,0.7606,-0.4782,0.1146,0.8708,0.4782,0.1146,0.8708,-0.4782,0.4391,0.7606,-0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,0.5,-0.7767,-0.383,-0.4782,-0.6968,-0.5347,-0.9981,0.0609,-0.008,-0.4883,0.8299,0.2697,-0.4782,0.8708,-0.1146,-0.9766,-0.0141,0.2144,-0.4782,-0.4391,-0.7606,-0.9981,-0.008,-0.0609,-0.4782,-0.1146,-0.8708,-0.9981,-0.0307,-0.0532,-0.4782,-0.6968,-0.5347,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,-0.9981,-0.0487,-0.0374,0.9981,-0.008,-0.0609,0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.9981,-0.0307,-0.0532,-0.4782,0.8708,-0.1146,0.4883,0.8299,0.2697,0.4782,0.8708,-0.1146,-0.4883,0.8299,0.2697,-0.5329,-0.4231,-0.7328,-0.9981,0.0487,0.0374,-0.5329,-0.6713,-0.5151,-0.9981,0.0307,0.0532,-0.5329,-0.1104,-0.8389,-0.9981,0.0307,0.0532,-0.5329,-0.4231,-0.7328,-0.9981,0.008,0.0609,0.5,0.0566,-0.8642,0.9981,-0.008,-0.0609,0.4782,-0.1146,-0.8708,0.5329,-0.1104,-0.8389,1,0,0,0.9981,0.008,0.0609,-0.4782,-0.1146,-0.8708,0.4782,-0.4391,-0.7606,-0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.5329,0.4231,0.7328,-0.5329,0.6713,0.5151,0.5329,0.6713,0.5151,-0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,1,0,0,0.5329,-0.6713,-0.5151,0.9981,0.0487,0.0374,0.6297,-0.0508,0.7751,-0.3149,-0.595,0.7395,0.3149,-0.595,0.7395,-0.6297,-0.0508,0.7751,0.3149,0.4934,0.8108,-0.3149,0.4934,0.8108,-0.3149,-0.595,0.7395,-0.9766,-0.0141,0.2144,-0.4883,-0.858,0.1591,-0.6297,-0.0508,0.7751,-0.6297,-0.0508,0.7751,-0.4883,0.8299,0.2697,-0.9766,-0.0141,0.2144,-0.3149,0.4934,0.8108,0.4883,0.8299,0.2697,0.6297,-0.0508,0.7751,0.9766,-0.0141,0.2144,0.3149,0.4934,0.8108,0.9766,-0.0141,0.2144,0.3149,-0.595,0.7395,0.4883,-0.858,0.1591,0.6297,-0.0508,0.7751,-0.4883,0.8299,0.2697,0.3149,0.4934,0.8108,0.4883,0.8299,0.2697,-0.3149,0.4934,0.8108,0.3149,-0.595,0.7395,-0.4883,-0.858,0.1591,0.4883,-0.858,0.1591,-0.3149,-0.595,0.7395],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,71,68,72,71,72,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,106,107,108,107,106,109,110,111,112,111,110,113,114,115,116,115,114,117,118,119,120,119,118,121,121,118,122,121,122,123,124,125,126,125,124,127,128,129,130,129,128,131,131,128,132,131,132,133,134,135,136,135,134,137,138,139,140,139,138,141,142,143,144,143,142,145,146,147,148,147,146,149,150,151,152,151,150,153,153,150,154,153,154,155,156,157,158,157,156,159,160,161,162,161,160,163,164,165,166,165,164,167,167,164,168,167,168,169,170,171,172,171,170,173,174,175,176,175,174,177,178,179,180,179,178,181,182,183,184,183,182,185,186,187,188,187,186,189,190,191,192,191,190,193,194,195,196,195,194,197,198,199,200,199,198,201,202,203,204,203,202,205,206,207,208,209,207,206,209,206,210,207,209,211,212,213,214,213,212,215,215,212,216,215,216,217,218,219,220,219,218,221,219,221,222,222,221,223,224,225,226,225,224,227,225,227,228,228,227,229,230,231,232,231,230,233,234,235,236,235,234,237,238,239,240,239,238,241,242,243,244,243,242,245,245,242,246,245,246,247,248,249,250,249,248,251,252,253,254,253,252,255,256,257,258,257,256,259,259,256,260,260,256,261,262,263,264,263,262,265,266,267,268,267,266,269,270,271,272,271,270,273,274,275,276,275,274,277,278,279,280,279,278,281,282,283,284,283,282,285,286,287,288,287,286,289,290,291,292,291,290,293,294,295,296,295,294,297,298,299,300,299,298,301,302,303,304,303,302,305,306,307,308,307,306,309,310,311,312,311,310,313,314,315,316,315,314,317,318,319,320,319,318,321,322,323,324,323,322,325,326,327,328,327,326,329,330,331,332,331,330,333,334,335,336,335,334,337,338,339,340,339,338,341,342,343,344,343,342,345,346,347,348,347,346,349,347,349,350,350,349,351,352,353,354,353,352,355,356,357,358,357,356,359,360,361,362,361,360,363,361,363,364,364,363,365,366,367,368,367,366,369,369,366,370,369,370,371,372,373,374,373,372,375,376,377,378,377,376,379,380,381,382,381,380,383,384,385,386,385,384,387,388,389,390,389,388,391,392,393,394,393,392,395],
    bands: [13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13],
  },
  {
    id: "wedge-08",
    shape: {
      form: "wedge", taper: 0.405515, symmetry: "mirror", longest: 0.17391,
      aspect: [1, 0.962538, 0.287505],
      size: [0.17391, 0.167395, 0.05],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["tooth"],
    tris: 16,
    verts: 22,
    triVariants: [16],
    size: [0.17391, 0.167395, 0.05],
    offset: [0.349456, 0.610053, 0.65],
    provenance: [
      { species: "caterpillar", node: "body", ordinal: 8, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-right" },
    ],
    positions: [0.0482,0.0837,0.025,-0.087,0.0837,-0.025,-0.087,0.0837,0.025,0.0482,0.0837,-0.025,0.087,-0.0163,-0.025,0.087,-0.0163,0.025,0.013,-0.0837,0.025,0.013,-0.0837,-0.025,-0.087,-0.0396,0.025,-0.087,-0.0396,-0.025,-0.087,0.0837,-0.025,-0.087,0.0837,0.025,-0.087,-0.0396,-0.025,0.087,-0.0163,-0.025,0.013,-0.0837,-0.025,-0.087,0.0837,-0.025,0.0482,0.0837,-0.025,0.087,-0.0163,0.025,-0.087,-0.0396,0.025,0.013,-0.0837,0.025,-0.087,0.0837,0.025,0.0482,0.0837,0.025],
    normals: [0.5651,0.825,0,0,1,0,0,1,0,0.5651,0.825,0,0.9735,-0.2289,0,0.9735,-0.2289,0,0.1611,-0.9869,0,0.1611,-0.9869,0,-0.8378,-0.546,0,-0.8378,-0.546,0,-1,0,0,-1,0,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    indices: [0,1,2,1,0,3,0,4,3,4,0,5,6,4,5,4,6,7,8,7,6,7,8,9,8,10,9,10,8,11,12,13,14,13,12,15,13,15,16,17,18,19,18,17,20,20,17,21],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "wedge-09",
    shape: {
      form: "wedge", taper: 0.405515, symmetry: "mirror", longest: 0.17391,
      aspect: [1, 0.962538, 0.287505],
      size: [0.17391, 0.167395, 0.05],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0, sunkUnitsMean: 0, sunkUnitsMax: 0,
      sunkFractionMin: 0, sunkFractionMean: 0, sunkFractionMax: 0,
    },
    roles: ["tooth"],
    tris: 16,
    verts: 22,
    triVariants: [16],
    size: [0.17391, 0.167395, 0.05],
    offset: [-0.349456, 0.610053, 0.65],
    provenance: [
      { species: "caterpillar", node: "body", ordinal: 9, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-left" },
    ],
    positions: [-0.0482,0.0837,0.025,-0.087,-0.0163,0.025,0.087,0.0837,0.025,0.087,-0.0396,0.025,-0.013,-0.0837,0.025,-0.0482,0.0837,-0.025,0.087,0.0837,-0.025,-0.087,-0.0163,-0.025,0.087,-0.0396,-0.025,-0.013,-0.0837,-0.025,0.087,0.0837,0.025,0.087,-0.0396,0.025,0.087,0.0837,-0.025,0.087,-0.0396,-0.025,-0.013,-0.0837,-0.025,-0.013,-0.0837,0.025,-0.087,-0.0163,-0.025,-0.087,-0.0163,0.025,-0.0482,0.0837,0.025,-0.0482,0.0837,-0.025,0.087,0.0837,-0.025,0.087,0.0837,0.025],
    normals: [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,1,0,0,0.8378,-0.546,0,1,0,0,0.8378,-0.546,0,-0.1611,-0.9869,0,-0.1611,-0.9869,0,-0.9735,-0.2289,0,-0.9735,-0.2289,0,-0.5651,0.825,0,-0.5651,0.825,0,0,1,0,0,1,0],
    indices: [0,1,2,2,1,3,4,3,1,5,6,7,6,8,7,9,7,8,10,11,12,13,12,11,13,11,14,15,14,11,14,15,16,17,16,15,17,18,16,19,16,18,19,18,20,21,20,18],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "wedge-10",
    shape: {
      form: "wedge", taper: 0.706667, symmetry: "mirror", longest: 0.164079,
      aspect: [1, 0.731355, 0.655873],
      size: [0.12, 0.107615, 0.164079],
    },
    attachment: {
      axis: "z", dir: 1, n: 2,
      sunkUnitsMin: 0, sunkUnitsMean: 0.043833, sunkUnitsMax: 0.087666,
      sunkFractionMin: 0, sunkFractionMean: 0.267146, sunkFractionMax: 0.534291,
    },
    roles: ["nose"],
    tris: 46,
    verts: 82,
    triVariants: [46],
    size: [0.12, 0.107615, 0.164079],
    offset: [0, 0.68789, 0.793478],
    provenance: [
      { species: "dog", node: "body", ordinal: 1, role: "nose", name: "nose-tip" },
      { species: "monkey", node: "body", ordinal: 3, role: "nose", name: "nose-tip" },
    ],
    positions: [0.0424,-0.0454,0.055,0.06,-0.0039,0.0016,0.06,-0.025,0.0288,-0.06,-0.0039,0.0016,0,-0.0538,0.0659,-0.0424,-0.0454,0.055,-0.06,-0.025,0.0288,-0.06,-0.0039,0.0016,0.06,0.0186,-0.082,0.06,-0.0039,0.0016,-0.06,0.0186,-0.082,-0.06,-0.0039,0.0016,-0.06,0.0362,-0.0773,-0.06,0.0186,-0.082,-0.06,0.012,0.0128,-0.06,-0.025,0.0288,-0.06,-0.0129,0.0449,0.06,0.012,0.0128,0.06,0.0186,-0.082,0.06,0.0362,-0.0773,0.06,-0.0039,0.0016,0.06,-0.025,0.0288,0.06,-0.0129,0.0449,-0.03,0.0279,0.024,0.03,0.002,0.0574,0.03,0.0279,0.024,0.0195,-0.0103,0.0731,0,-0.0141,0.0781,-0.0195,-0.0103,0.0731,-0.03,0.002,0.0574,0,-0.0418,0.082,-0.0424,-0.0454,0.055,0,-0.0538,0.0659,-0.0424,-0.0333,0.0712,-0.0424,-0.0454,0.055,-0.06,-0.0129,0.0449,-0.06,-0.025,0.0288,-0.0424,-0.0333,0.0712,0.0424,-0.0454,0.055,0,-0.0418,0.082,0,-0.0538,0.0659,0.0424,-0.0333,0.0712,-0.03,0.0538,-0.0726,0.03,0.0279,0.024,0.03,0.0538,-0.0726,-0.03,0.0279,0.024,0.06,-0.0129,0.0449,0.0424,-0.0454,0.055,0.06,-0.025,0.0288,0.0424,-0.0333,0.0712,-0.06,0.0362,-0.0773,-0.03,0.0279,0.024,-0.03,0.0538,-0.0726,-0.06,0.012,0.0128,-0.06,0.012,0.0128,-0.03,0.002,0.0574,-0.03,0.0279,0.024,-0.06,-0.0129,0.0449,0,-0.0141,0.0781,-0.0424,-0.0333,0.0712,0,-0.0418,0.082,-0.0195,-0.0103,0.0731,-0.03,0.002,0.0574,-0.0424,-0.0333,0.0712,-0.0195,-0.0103,0.0731,-0.06,-0.0129,0.0449,0.0424,-0.0333,0.0712,0,-0.0141,0.0781,0,-0.0418,0.082,0.0195,-0.0103,0.0731,0.03,0.0279,0.024,0.06,-0.0129,0.0449,0.06,0.012,0.0128,0.03,0.002,0.0574,0.03,0.0538,-0.0726,0.06,0.012,0.0128,0.06,0.0362,-0.0773,0.03,0.0279,0.024,0.03,0.002,0.0574,0.0424,-0.0333,0.0712,0.06,-0.0129,0.0449,0.0195,-0.0103,0.0731],
    normals: [0,-0.7896,-0.6136,0,-0.8955,-0.4451,0,-0.7896,-0.6136,0,-0.8955,-0.4451,0,-0.7896,-0.6136,0,-0.7896,-0.6136,0,-0.7896,-0.6136,0,-0.8955,-0.4451,0,-0.9659,-0.2588,0,-0.8955,-0.4451,0,-0.9659,-0.2588,-1,0,0,-0.8717,0.4733,0.1268,-1,0,0,-0.8514,0.4723,0.228,-0.9781,-0.1672,0.1244,-0.8815,0.1798,0.4367,0.8514,0.4723,0.228,1,0,0,0.8717,0.4733,0.1268,1,0,0,0.9781,-0.1672,0.1244,0.8815,0.1798,0.4367,-0.2722,0.8599,0.4319,0.3208,0.6864,0.6526,0.2722,0.8599,0.4319,0.2316,0.5137,0.8261,0,0.4432,0.8964,-0.2316,0.5137,0.8261,-0.3208,0.6864,0.6526,0,-0.4061,0.9138,-0.6632,-0.6004,0.4469,0,-0.8022,0.5971,-0.6093,-0.2083,0.7651,-0.6632,-0.6004,0.4469,-0.8815,0.1798,0.4367,-0.9781,-0.1672,0.1244,-0.6093,-0.2083,0.7651,0.6632,-0.6004,0.4469,0,-0.4061,0.9138,0,-0.8022,0.5971,0.6093,-0.2083,0.7651,-0.2699,0.9301,0.2492,0.2722,0.8599,0.4319,0.2699,0.9301,0.2492,-0.2722,0.8599,0.4319,0.8815,0.1798,0.4367,0.6632,-0.6004,0.4469,0.9781,-0.1672,0.1244,0.6093,-0.2083,0.7651,-0.8717,0.4733,0.1268,-0.2722,0.8599,0.4319,-0.2699,0.9301,0.2492,-0.8514,0.4723,0.228,-0.8514,0.4723,0.228,-0.3208,0.6864,0.6526,-0.2722,0.8599,0.4319,-0.8815,0.1798,0.4367,0,0.4432,0.8964,-0.6093,-0.2083,0.7651,0,-0.4061,0.9138,-0.2316,0.5137,0.8261,-0.3208,0.6864,0.6526,-0.6093,-0.2083,0.7651,-0.2316,0.5137,0.8261,-0.8815,0.1798,0.4367,0.6093,-0.2083,0.7651,0,0.4432,0.8964,0,-0.4061,0.9138,0.2316,0.5137,0.8261,0.2722,0.8599,0.4319,0.8815,0.1798,0.4367,0.8514,0.4723,0.228,0.3208,0.6864,0.6526,0.2699,0.9301,0.2492,0.8514,0.4723,0.228,0.8717,0.4733,0.1268,0.2722,0.8599,0.4319,0.3208,0.6864,0.6526,0.6093,-0.2083,0.7651,0.8815,0.1798,0.4367,0.2316,0.5137,0.8261],
    indices: [0,1,2,1,0,3,3,0,4,3,4,5,3,5,6,7,8,9,8,7,10,11,12,13,12,11,14,14,11,15,14,15,16,17,18,19,18,17,20,20,17,21,21,17,22,23,24,25,24,23,26,26,23,27,27,23,28,28,23,29,30,31,32,31,30,33,34,35,36,35,34,37,38,39,40,39,38,41,42,43,44,43,42,45,46,47,48,47,46,49,50,51,52,51,50,53,54,55,56,55,54,57,58,59,60,59,58,61,62,63,64,63,62,65,66,67,68,67,66,69,70,71,72,71,70,73,74,75,76,75,74,77,78,79,80,79,78,81],
    bands: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  {
    id: "wedge-11",
    shape: {
      form: "wedge", taper: 0.390619, symmetry: "handed", longest: 0.445163,
      aspect: [1, 0.693454, 0.689491],
      size: [0.3087, 0.306936, 0.445163],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.167366, sunkUnitsMean: 0.167366, sunkUnitsMax: 0.167366,
      sunkFractionMin: 0.375966, sunkFractionMean: 0.375966, sunkFractionMax: 0.375966,
    },
    roles: ["tooth"],
    tris: 38,
    verts: 24,
    triVariants: [38],
    size: [0.3087, 0.306936, 0.445163],
    offset: [0.267072, 0.598023, 0.680216],
    provenance: [
      { species: "elephant", node: "body", ordinal: 3, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-right" },
    ],
    positions: [0.1215,0.0433,0.0187,0.1354,0.0186,-0.2061,0.093,0.1181,-0.1677,-0.0095,0.1535,-0.1298,0.1544,-0.0337,-0.011,0.1215,-0.1152,-0.0237,0.093,-0.0868,-0.2226,-0.0095,-0.1363,-0.2074,0.0423,0.0706,0.048,-0.0369,0.0323,0.0597,-0.1119,0.1039,-0.1146,-0.1544,-0.0015,-0.1311,-0.0697,-0.0492,0.047,-0.1119,-0.101,-0.1695,-0.0369,-0.1261,0.0173,0.0599,-0.0596,0.2226,0.0941,-0.0431,0.2175,0.1282,-0.0549,0.2049,0.1424,-0.0881,0.1921,0.1282,-0.1232,0.1866,0.0423,-0.1535,-0.012,0.0941,-0.1397,0.1917,0.0599,-0.1279,0.2043,0.0458,-0.0948,0.2171],
    normals: [0.7249,0.6503,0.2272,0.9956,0.0241,-0.0901,0.7167,0.6782,0.1625,0.0434,0.9104,0.4115,0.9997,0.0058,-0.0218,0.7249,-0.6768,-0.1284,0.7167,-0.6686,-0.1983,0.0434,-0.9942,-0.0988,0.0613,0.8792,0.4726,-0.6022,0.5583,0.5707,-0.63,0.5848,0.5111,-0.9089,-0.1079,0.4028,-0.8771,-0.1243,0.464,-0.63,-0.7619,0.1502,-0.6022,-0.7688,0.2151,-0.2623,0.2373,0.9353,0.1929,0.4575,0.868,0.6482,0.3005,0.6997,0.8368,-0.1417,0.5289,0.6482,-0.6101,0.4557,0.0613,-0.9977,-0.0303,0.1929,-0.8302,0.523,-0.2623,-0.6732,0.6914,-0.4509,-0.231,0.8622],
    indices: [0,1,2,3,0,2,1,0,4,5,1,4,1,5,6,5,7,6,0,3,8,3,9,8,9,3,10,11,9,10,9,11,12,13,12,11,7,14,13,12,13,14,15,8,9,12,15,9,16,0,8,8,15,16,17,4,0,0,16,17,4,17,18,18,5,4,17,19,18,19,17,16,5,18,19,7,5,20,19,20,5,14,7,20,19,16,21,20,19,21,21,16,15,22,20,21,20,22,14,21,15,22,14,23,12,23,14,22,15,12,23,22,15,23],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "wedge-12",
    shape: {
      form: "wedge", taper: 0.390619, symmetry: "handed", longest: 0.445163,
      aspect: [1, 0.693454, 0.689491],
      size: [0.3087, 0.306936, 0.445163],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.167366, sunkUnitsMean: 0.167366, sunkUnitsMax: 0.167366,
      sunkFractionMin: 0.375966, sunkFractionMean: 0.375966, sunkFractionMax: 0.375966,
    },
    roles: ["tooth"],
    tris: 38,
    verts: 24,
    triVariants: [38],
    size: [0.3087, 0.306936, 0.445163],
    offset: [-0.267072, 0.598023, 0.680216],
    provenance: [
      { species: "elephant", node: "body", ordinal: 7, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-left" },
    ],
    positions: [-0.1354,0.0186,-0.2061,-0.1215,0.0433,0.0187,-0.093,0.1181,-0.1677,0.0095,0.1535,-0.1298,-0.1544,-0.0337,-0.011,-0.093,-0.0868,-0.2226,-0.0423,0.0706,0.048,0.0369,0.0323,0.0597,0.1119,0.1039,-0.1146,0.1544,-0.0015,-0.1311,-0.0941,-0.0431,0.2175,-0.1282,-0.0549,0.2049,-0.1215,-0.1152,-0.0237,-0.1424,-0.0881,0.1921,-0.1282,-0.1232,0.1866,-0.0941,-0.1397,0.1917,-0.0423,-0.1535,-0.012,0.0095,-0.1363,-0.2074,0.1119,-0.101,-0.1695,0.0369,-0.1261,0.0173,0.0697,-0.0492,0.047,-0.0599,-0.0596,0.2226,-0.0599,-0.1279,0.2043,-0.0458,-0.0948,0.2171],
    normals: [-0.9956,0.0241,-0.0901,-0.7249,0.6503,0.2272,-0.7167,0.6782,0.1625,-0.0434,0.9104,0.4115,-0.9997,0.0058,-0.0218,-0.7167,-0.6686,-0.1983,-0.0613,0.8792,0.4726,0.6022,0.5583,0.5707,0.63,0.5848,0.5111,0.9089,-0.1079,0.4028,-0.1929,0.4575,0.868,-0.6482,0.3005,0.6997,-0.7249,-0.6768,-0.1284,-0.8368,-0.1417,0.5289,-0.6482,-0.6101,0.4557,-0.1929,-0.8302,0.523,-0.0613,-0.9977,-0.0303,-0.0434,-0.9942,-0.0988,0.63,-0.7619,0.1502,0.6022,-0.7688,0.2151,0.8771,-0.1243,0.464,0.2623,0.2373,0.9353,0.2623,-0.6732,0.6914,0.4509,-0.231,0.8622],
    indices: [0,1,2,1,3,2,1,0,4,5,4,0,3,1,6,7,3,6,3,7,8,7,9,8,1,10,6,10,7,6,4,11,1,10,1,11,4,5,12,11,4,13,12,13,4,14,11,13,13,12,14,15,11,14,12,15,14,15,10,11,5,16,12,15,12,16,16,5,17,18,16,17,16,18,19,9,19,18,19,15,16,9,7,20,19,9,20,7,10,21,21,20,7,22,10,15,15,19,22,22,21,10,23,19,20,20,21,23,19,23,22,21,22,23],
    bands: [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
  {
    id: "wedge-13",
    shape: {
      form: "wedge", taper: 0.58581, symmetry: "handed", longest: 0.411414,
      aspect: [1, 0.785314, 0.632949],
      size: [0.260404, 0.323089, 0.411414],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.160508, sunkUnitsMean: 0.160508, sunkUnitsMax: 0.160508,
      sunkFractionMin: 0.390137, sunkFractionMean: 0.390137, sunkFractionMax: 0.390137,
    },
    roles: ["tooth"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.260404, 0.323089, 0.411414],
    offset: [0.294346, 0.671641, 0.670199],
    provenance: [
      { species: "hog", node: "body", ordinal: 6, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-right" },
    ],
    positions: [0.1041,0.083,0.1899,0.0182,-0.0788,0.0708,0.0974,-0.06,0.0354,0.0699,0.0749,0.2051,0.1182,0.1118,0.1689,0.0974,-0.06,0.0354,0.1302,0.0066,-0.0132,0.1041,0.083,0.1899,-0.0611,-0.0388,0.0722,0.0216,0.1247,0.1913,-0.0939,0.0367,0.0388,0.0358,0.0922,0.2057,-0.0611,0.1033,-0.0098,0.0699,0.1615,0.1551,0.0182,0.1221,-0.0452,0.0358,0.1534,0.1704,-0.1019,-0.0046,-0.174,-0.0939,0.0367,0.0388,-0.0611,0.1033,-0.0098,-0.1302,-0.062,-0.1321,0.0699,0.1615,0.1551,0.0974,0.0821,-0.0466,0.0182,0.1221,-0.0452,0.1041,0.1443,0.1545,0.1302,0.0066,-0.0132,0.0347,-0.0229,-0.2057,0.0974,0.0821,-0.0466,0.063,-0.0879,-0.1769,0.0974,-0.06,0.0354,0.063,-0.0879,-0.1769,0.1302,0.0066,-0.0132,0.0347,-0.1453,-0.135,-0.1302,-0.062,-0.1321,-0.0611,-0.0388,0.0722,-0.0939,0.0367,0.0388,-0.1019,-0.127,-0.1033,0.0182,0.1221,-0.0452,0.0347,-0.0229,-0.2057,-0.0336,0.0117,-0.2045,0.0974,0.0821,-0.0466,0.0182,-0.0788,0.0708,-0.1019,-0.127,-0.1033,-0.0336,-0.1615,-0.1045,-0.0611,-0.0388,0.0722,0.0699,0.0749,0.2051,-0.0611,-0.0388,0.0722,0.0182,-0.0788,0.0708,0.0358,0.0922,0.2057,0.0347,-0.1453,-0.135,0.0182,-0.0788,0.0708,-0.0336,-0.1615,-0.1045,0.0974,-0.06,0.0354,-0.0611,0.1033,-0.0098,-0.0336,0.0117,-0.2045,-0.1019,-0.0046,-0.174,0.0182,0.1221,-0.0452,-0.0939,0.0367,0.0388,0.0358,0.1534,0.1704,-0.0611,0.1033,-0.0098,0.0216,0.1247,0.1913,0.1041,0.1443,0.1545,0.1302,0.0066,-0.0132,0.0974,0.0821,-0.0466,0.1182,0.1118,0.1689,0.1041,0.1443,0.1545,0.1041,0.083,0.1899,0.1182,0.1118,0.1689,0.0699,0.1615,0.1551,0.0699,0.0749,0.2051,0.0358,0.1534,0.1704,0.0358,0.0922,0.2057,0.0216,0.1247,0.1913],
    normals: [0.6482,-0.1092,0.7536,0.0295,-0.8054,0.592,0.708,-0.6443,0.289,0.1929,-0.2172,0.9569,0.8368,0.2738,0.4742,0.708,-0.6443,0.289,0.9891,-0.0736,-0.1275,0.6482,-0.1092,0.7536,-0.6491,-0.4625,0.6039,-0.4509,0.4463,0.773,-0.9302,0.1835,0.3179,-0.2623,0.0128,0.9649,-0.6491,0.7543,-0.0986,0.1929,0.9373,0.2903,0.0295,0.9154,-0.4015,-0.2623,0.8292,0.4936,-0.7015,0.6631,-0.2611,-0.9302,0.1835,0.3179,-0.6491,0.7543,-0.0986,-0.9835,0.0905,0.1567,0.1929,0.9373,0.2903,0.708,0.5725,-0.4135,0.0295,0.9154,-0.4015,0.6482,0.7072,0.2823,0.9891,-0.0736,-0.1275,0.6602,0.4807,-0.5771,0.708,0.5725,-0.4135,0.9422,-0.1675,-0.2901,0.708,-0.6443,0.289,0.9422,-0.1675,-0.2901,0.9891,-0.0736,-0.1275,0.6602,-0.7402,0.1277,-0.9835,0.0905,0.1567,-0.6491,-0.4625,0.6039,-0.9302,0.1835,0.3179,-0.7015,-0.5577,0.4437,0.0295,0.9154,-0.4015,0.6602,0.4807,-0.5771,-0.0206,0.8248,-0.5651,0.708,0.5725,-0.4135,0.0295,-0.8054,0.592,-0.7015,-0.5577,0.4437,-0.0206,-0.9018,0.4317,-0.6491,-0.4625,0.6039,0.1929,-0.2172,0.9569,-0.6491,-0.4625,0.6039,0.0295,-0.8054,0.592,-0.2623,0.0128,0.9649,0.6602,-0.7402,0.1277,0.0295,-0.8054,0.592,-0.0206,-0.9018,0.4317,0.708,-0.6443,0.289,-0.6491,0.7543,-0.0986,-0.0206,0.8248,-0.5651,-0.7015,0.6631,-0.2611,0.0295,0.9154,-0.4015,-0.9302,0.1835,0.3179,-0.2623,0.8292,0.4936,-0.6491,0.7543,-0.0986,-0.4509,0.4463,0.773,0.6482,0.7072,0.2823,0.9891,-0.0736,-0.1275,0.708,0.5725,-0.4135,0.8368,0.2738,0.4742,0.6482,0.7072,0.2823,0.6482,-0.1092,0.7536,0.8368,0.2738,0.4742,0.1929,0.9373,0.2903,0.1929,-0.2172,0.9569,-0.2623,0.8292,0.4936,-0.2623,0.0128,0.9649,-0.4509,0.4463,0.773],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,65,67,68,68,67,69,68,69,70,70,69,71],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-14",
    shape: {
      form: "wedge", taper: 0.58581, symmetry: "handed", longest: 0.411414,
      aspect: [1, 0.785314, 0.632949],
      size: [0.260404, 0.323089, 0.411414],
    },
    attachment: {
      axis: "z", dir: 1, n: 1,
      sunkUnitsMin: 0.160508, sunkUnitsMean: 0.160508, sunkUnitsMax: 0.160508,
      sunkFractionMin: 0.390137, sunkFractionMean: 0.390137, sunkFractionMax: 0.390137,
    },
    roles: ["tooth"],
    tris: 38,
    verts: 72,
    triVariants: [38],
    size: [0.260404, 0.323089, 0.411414],
    offset: [-0.294346, 0.671641, 0.670199],
    provenance: [
      { species: "hog", node: "body", ordinal: 7, role: "tooth", name: "front-of-face feature (tooth/tusk/cheek)-left" },
    ],
    positions: [-0.0358,0.0922,0.2057,-0.0182,-0.0788,0.0708,0.0611,-0.0388,0.0722,-0.0699,0.0749,0.2051,-0.0216,0.1247,0.1913,0.0611,-0.0388,0.0722,0.0939,0.0367,0.0388,-0.0358,0.0922,0.2057,-0.0974,-0.06,0.0354,-0.1182,0.1118,0.1689,-0.1302,0.0066,-0.0132,-0.1041,0.083,0.1899,-0.1041,0.1443,0.1545,-0.0182,0.1221,-0.0452,-0.0974,0.0821,-0.0466,-0.0699,0.1615,0.1551,-0.0347,-0.0229,-0.2057,-0.1302,0.0066,-0.0132,-0.0974,0.0821,-0.0466,-0.063,-0.0879,-0.1769,-0.0699,0.1615,0.1551,0.0611,0.1033,-0.0098,-0.0182,0.1221,-0.0452,-0.0358,0.1534,0.1704,0.0939,0.0367,0.0388,0.1019,-0.0046,-0.174,0.0611,0.1033,-0.0098,0.1302,-0.062,-0.1321,0.0611,-0.0388,0.0722,0.1302,-0.062,-0.1321,0.0939,0.0367,0.0388,0.1019,-0.127,-0.1033,-0.063,-0.0879,-0.1769,-0.0974,-0.06,0.0354,-0.1302,0.0066,-0.0132,-0.0347,-0.1453,-0.135,-0.0182,0.1221,-0.0452,0.1019,-0.0046,-0.174,0.0336,0.0117,-0.2045,0.0611,0.1033,-0.0098,-0.0182,-0.0788,0.0708,-0.0347,-0.1453,-0.135,0.0336,-0.1615,-0.1045,-0.0974,-0.06,0.0354,-0.0699,0.0749,0.2051,-0.0974,-0.06,0.0354,-0.0182,-0.0788,0.0708,-0.1041,0.083,0.1899,0.0611,-0.0388,0.0722,0.0336,-0.1615,-0.1045,0.1019,-0.127,-0.1033,-0.0182,-0.0788,0.0708,-0.0974,0.0821,-0.0466,0.0336,0.0117,-0.2045,-0.0347,-0.0229,-0.2057,-0.0182,0.1221,-0.0452,-0.1302,0.0066,-0.0132,-0.1041,0.1443,0.1545,-0.0974,0.0821,-0.0466,-0.1182,0.1118,0.1689,-0.0358,0.1534,0.1704,0.0939,0.0367,0.0388,0.0611,0.1033,-0.0098,-0.0216,0.1247,0.1913,-0.0358,0.1534,0.1704,-0.0358,0.0922,0.2057,-0.0216,0.1247,0.1913,-0.0699,0.1615,0.1551,-0.0699,0.0749,0.2051,-0.1041,0.1443,0.1545,-0.1041,0.083,0.1899,-0.1182,0.1118,0.1689],
    normals: [0.2623,0.0128,0.9649,-0.0295,-0.8054,0.592,0.6491,-0.4625,0.6039,-0.1929,-0.2172,0.9569,0.4509,0.4463,0.773,0.6491,-0.4625,0.6039,0.9302,0.1835,0.3179,0.2623,0.0128,0.9649,-0.708,-0.6443,0.289,-0.8368,0.2738,0.4742,-0.9891,-0.0736,-0.1275,-0.6482,-0.1092,0.7536,-0.6482,0.7072,0.2823,-0.0295,0.9154,-0.4015,-0.708,0.5725,-0.4135,-0.1929,0.9373,0.2903,-0.6602,0.4807,-0.5771,-0.9891,-0.0736,-0.1275,-0.708,0.5725,-0.4135,-0.9422,-0.1675,-0.2901,-0.1929,0.9373,0.2903,0.6491,0.7543,-0.0986,-0.0295,0.9154,-0.4015,0.2623,0.8292,0.4936,0.9302,0.1835,0.3179,0.7015,0.6631,-0.2611,0.6491,0.7543,-0.0986,0.9835,0.0905,0.1567,0.6491,-0.4625,0.6039,0.9835,0.0905,0.1567,0.9302,0.1835,0.3179,0.7015,-0.5577,0.4437,-0.9422,-0.1675,-0.2901,-0.708,-0.6443,0.289,-0.9891,-0.0736,-0.1275,-0.6602,-0.7402,0.1277,-0.0295,0.9154,-0.4015,0.7015,0.6631,-0.2611,0.0206,0.8248,-0.5651,0.6491,0.7543,-0.0986,-0.0295,-0.8054,0.592,-0.6602,-0.7402,0.1277,0.0206,-0.9018,0.4317,-0.708,-0.6443,0.289,-0.1929,-0.2172,0.9569,-0.708,-0.6443,0.289,-0.0295,-0.8054,0.592,-0.6482,-0.1092,0.7536,0.6491,-0.4625,0.6039,0.0206,-0.9018,0.4317,0.7015,-0.5577,0.4437,-0.0295,-0.8054,0.592,-0.708,0.5725,-0.4135,0.0206,0.8248,-0.5651,-0.6602,0.4807,-0.5771,-0.0295,0.9154,-0.4015,-0.9891,-0.0736,-0.1275,-0.6482,0.7072,0.2823,-0.708,0.5725,-0.4135,-0.8368,0.2738,0.4742,0.2623,0.8292,0.4936,0.9302,0.1835,0.3179,0.6491,0.7543,-0.0986,0.4509,0.4463,0.773,0.2623,0.8292,0.4936,0.2623,0.0128,0.9649,0.4509,0.4463,0.773,-0.1929,0.9373,0.2903,-0.1929,-0.2172,0.9569,-0.6482,0.7072,0.2823,-0.6482,-0.1092,0.7536,-0.8368,0.2738,0.4742],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,65,67,68,68,67,69,68,69,70,70,69,71],
    bands: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-15",
    shape: {
      form: "wedge", taper: 0.516929, symmetry: "mirror", longest: 1.0824,
      aspect: [1, 0.512948, 0.258684],
      size: [0.28, 1.0824, 0.555215],
    },
    attachment: {
      axis: "z", dir: -1, n: 1,
      sunkUnitsMin: 0.076607, sunkUnitsMean: 0.076607, sunkUnitsMax: 0.076607,
      sunkFractionMin: 0.137977, sunkFractionMean: 0.137977, sunkFractionMax: 0.137977,
    },
    roles: ["tail"],
    tris: 212,
    verts: 404,
    triVariants: [212],
    size: [0.28, 1.0824, 0.555215],
    offset: [0, 1.204607, -0.826],
    provenance: [
      { species: "lion", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [-0.1,-0.3703,0.1179,-0.05,-0.2849,0.1803,-0.1,-0.2964,0.0928,-0.05,-0.3262,0.1943,0.05,-0.0227,0.1544,0.1,-0.1407,0.103,0.1,-0.0668,0.0779,0.05,-0.1292,0.1905,-0.05,-0.0782,-0.0273,0.05,-0.111,0.0014,-0.05,-0.111,0.0014,0.05,-0.0782,-0.0273,0.05,-0.359,0.2231,0.1,-0.4635,0.2393,0.1,-0.429,0.1693,0.05,-0.3859,0.2776,0.05,0.2942,-0.2703,0.1,0.1934,-0.1901,0.05,0.1819,-0.2776,0.1,0.2713,-0.185,-0.1,0.1934,-0.1901,-0.05,0.2942,-0.2703,-0.05,0.1819,-0.2776,-0.1,0.2713,-0.185,0.05,0.0619,0.0802,-0.05,-0.0227,0.1544,0.05,-0.0227,0.1544,-0.05,0.0619,0.0802,-0.1,-0.4635,0.2393,-0.05,-0.359,0.2231,-0.1,-0.429,0.1693,-0.05,-0.3859,0.2776,0.05,-0.2849,0.1803,-0.05,-0.3262,0.1943,0.05,-0.3262,0.1943,-0.05,-0.2849,0.1803,0.05,-0.3262,0.1943,-0.05,-0.359,0.2231,0.05,-0.359,0.2231,-0.05,-0.3262,0.1943,0.05,-0.2849,0.1803,0.1,-0.3703,0.1179,0.1,-0.2964,0.0928,0.05,-0.3262,0.1943,-0.05,-0.111,0.0014,0.05,-0.1522,0.0154,-0.05,-0.1522,0.0154,0.05,-0.111,0.0014,-0.1,0.1196,-0.165,-0.05,0.205,-0.1025,-0.1,0.1934,-0.1901,-0.05,0.1637,-0.0885,-0.05,-0.5412,0.201,-0.1,-0.429,0.1693,-0.05,-0.4991,0.1156,-0.1,-0.4635,0.2393,-0.1,-0.1407,0.103,-0.05,-0.0227,0.1544,-0.1,-0.0668,0.0779,-0.05,-0.1292,0.1905,0.1,-0.3703,0.1179,0.05,-0.4991,0.1156,0.05,-0.4145,0.0414,0.1,-0.429,0.1693,0.1,0.1196,-0.165,0.05,-0.0092,-0.1673,0.05,0.0754,-0.2414,0.1,0.0609,-0.1135,0.1,-0.4635,0.2393,-0.05,-0.5412,0.201,0.05,-0.5412,0.201,-0.1,-0.4635,0.2393,0.05,-0.3859,0.2776,-0.05,-0.3859,0.2776,0.05,0.3951,-0.2205,0.1,0.2713,-0.185,0.05,0.2942,-0.2703,0.1,0.3413,-0.1504,0.05,0.1637,-0.0885,0.1,0.0609,-0.1135,0.1,0.1196,-0.165,0.05,0.1309,-0.0598,-0.05,0.0754,-0.2414,-0.1,0.1934,-0.1901,-0.05,0.1819,-0.2776,-0.1,0.1196,-0.165,-0.05,-0.4145,0.0414,0.05,-0.308,0.0052,0.05,-0.4145,0.0414,-0.05,-0.308,0.0052,0.05,0.2876,-0.0804,-0.05,0.2485,-0.0997,0.05,0.2485,-0.0997,-0.05,0.2876,-0.0804,-0.05,-0.0092,-0.1673,-0.1,0.1196,-0.165,-0.05,0.0754,-0.2414,-0.1,0.0609,-0.1135,0.1,-0.429,0.1693,0.05,-0.5412,0.201,0.05,-0.4991,0.1156,0.1,-0.4635,0.2393,-0.05,0.2942,-0.2703,0.05,0.1819,-0.2776,-0.05,0.1819,-0.2776,0.05,0.2942,-0.2703,-0.1,0.2713,-0.185,-0.05,0.3951,-0.2205,-0.05,0.2942,-0.2703,-0.1,0.3413,-0.1504,-0.05,0.205,-0.1025,-0.1,0.2713,-0.185,-0.1,0.1934,-0.1901,-0.05,0.2485,-0.0997,-0.1,0.3413,-0.1504,-0.05,0.4692,-0.1359,-0.05,0.3951,-0.2205,-0.1,0.3928,-0.0918,-0.1,-0.2964,0.0928,-0.05,-0.2129,0.0115,-0.05,-0.308,0.0052,-0.05,-0.1522,0.0154,-0.1,-0.2186,0.0979,-0.1,-0.1407,0.103,-0.05,-0.4145,0.0414,0.05,-0.4991,0.1156,-0.05,-0.4991,0.1156,0.05,-0.4145,0.0414,-0.1,0.0264,-0.0435,-0.05,0.1309,-0.0598,-0.1,0.0609,-0.1135,-0.05,0.104,-0.0052,-0.1,-0.0081,0.0264,-0.05,0.0619,0.0802,-0.05,0.0754,-0.2414,0.05,-0.0092,-0.1673,-0.05,-0.0092,-0.1673,0.05,0.0754,-0.2414,0.05,0.205,-0.1025,-0.05,0.1637,-0.0885,0.05,0.1637,-0.0885,-0.05,0.205,-0.1025,0.1,-0.0668,0.0779,0.05,-0.1522,0.0154,0.05,-0.111,0.0014,0.1,-0.1407,0.103,-0.1,-0.429,0.1693,-0.05,-0.3262,0.1943,-0.1,-0.3703,0.1179,-0.05,-0.359,0.2231,-0.05,-0.2129,0.0115,0.05,-0.308,0.0052,-0.05,-0.308,0.0052,0.05,-0.2129,0.0115,-0.05,-0.1522,0.0154,0.05,-0.1522,0.0154,-0.05,-0.0513,-0.0818,-0.1,0.0609,-0.1135,-0.05,-0.0092,-0.1673,-0.1,0.0264,-0.0435,-0.05,-0.0782,-0.0273,-0.1,-0.0081,0.0264,-0.05,-0.359,0.2231,0.05,-0.3859,0.2776,0.05,-0.359,0.2231,-0.05,-0.3859,0.2776,0.05,0.0619,0.0802,0.1,-0.0668,0.0779,0.1,-0.0081,0.0264,0.05,-0.0227,0.1544,-0.05,0.3951,-0.2205,0.05,0.2942,-0.2703,-0.05,0.2942,-0.2703,0.05,0.3951,-0.2205,0.1,0.1934,-0.1901,0.05,0.0754,-0.2414,0.05,0.1819,-0.2776,0.1,0.1196,-0.165,0.05,0.4692,-0.1359,0.1,0.3413,-0.1504,0.05,0.3951,-0.2205,0.1,0.3928,-0.0918,-0.05,0.1309,-0.0598,0.05,0.104,-0.0052,0.05,0.1309,-0.0598,-0.05,0.0619,0.0802,-0.05,0.104,-0.0052,0.05,0.0619,0.0802,0.05,-0.2242,0.1843,-0.05,-0.2849,0.1803,0.05,-0.2849,0.1803,-0.05,-0.2242,0.1843,0.05,-0.1292,0.1905,-0.05,-0.1292,0.1905,0.05,0.1309,-0.0598,0.1,0.0264,-0.0435,0.1,0.0609,-0.1135,0.05,0.104,-0.0052,0.1,-0.0081,0.0264,0.05,0.0619,0.0802,0.1,-0.2186,0.0979,0.05,-0.2849,0.1803,0.1,-0.2964,0.0928,0.1,-0.1407,0.103,0.05,-0.2242,0.1843,0.05,-0.1292,0.1905,-0.05,0.2876,-0.0804,-0.1,0.3928,-0.0918,-0.1,0.3413,-0.1504,-0.05,0.3163,-0.0476,0.05,0.205,-0.1025,0.1,0.1196,-0.165,0.1,0.1934,-0.1901,0.05,0.1637,-0.0885,-0.05,-0.2849,0.1803,-0.1,-0.2186,0.0979,-0.1,-0.2964,0.0928,-0.1,-0.1407,0.103,-0.05,-0.2242,0.1843,-0.05,-0.1292,0.1905,-0.05,-0.0782,-0.0273,0.05,-0.0513,-0.0818,0.05,-0.0782,-0.0273,0.05,-0.0092,-0.1673,-0.05,-0.0092,-0.1673,-0.05,-0.0513,-0.0818,-0.1,0.0609,-0.1135,-0.05,0.1637,-0.0885,-0.1,0.1196,-0.165,-0.05,0.1309,-0.0598,0.05,0.2485,-0.0997,-0.05,0.205,-0.1025,0.05,0.205,-0.1025,-0.05,0.2485,-0.0997,0.1,0.3928,-0.0918,0.05,0.2876,-0.0804,0.1,0.3413,-0.1504,0.05,0.3163,-0.0476,-0.05,0.3163,-0.0476,0.05,0.2876,-0.0804,0.05,0.3163,-0.0476,-0.05,0.2876,-0.0804,0.1,0.3413,-0.1504,0.05,0.2485,-0.0997,0.1,0.2713,-0.185,0.05,0.2876,-0.0804,0.1,-0.0081,0.0264,0.05,-0.111,0.0014,0.05,-0.0782,-0.0273,0.1,-0.0668,0.0779,0.1,0.2713,-0.185,0.05,0.205,-0.1025,0.1,0.1934,-0.1901,0.05,0.2485,-0.0997,0.05,0.3951,-0.2205,-0.05,0.4692,-0.1359,0.05,0.4692,-0.1359,-0.05,0.3951,-0.2205,-0.05,0.2485,-0.0997,-0.1,0.3413,-0.1504,-0.1,0.2713,-0.185,-0.05,0.2876,-0.0804,0.05,-0.3262,0.1943,0.1,-0.429,0.1693,0.1,-0.3703,0.1179,0.05,-0.359,0.2231,-0.1,-0.0668,0.0779,-0.05,0.0619,0.0802,-0.1,-0.0081,0.0264,-0.05,-0.0227,0.1544,0.05,-0.0227,0.1544,-0.05,-0.1292,0.1905,0.05,-0.1292,0.1905,-0.05,-0.0227,0.1544,-0.05,-0.5412,0.201,0.05,-0.4991,0.1156,0.05,-0.5412,0.201,-0.05,-0.4991,0.1156,-0.05,-0.4145,0.0414,-0.1,-0.2964,0.0928,-0.05,-0.308,0.0052,-0.1,-0.3703,0.1179,-0.05,-0.4991,0.1156,-0.1,-0.3703,0.1179,-0.05,-0.4145,0.0414,-0.1,-0.429,0.1693,0.1,-0.2964,0.0928,0.05,-0.4145,0.0414,0.05,-0.308,0.0052,0.1,-0.3703,0.1179,-0.05,-0.111,0.0014,-0.1,-0.0081,0.0264,-0.05,-0.0782,-0.0273,-0.1,-0.0668,0.0779,-0.05,-0.1522,0.0154,-0.1,-0.0668,0.0779,-0.05,-0.111,0.0014,-0.1,-0.1407,0.103,0.05,-0.2129,0.0115,0.1,-0.2964,0.0928,0.05,-0.308,0.0052,0.05,-0.1522,0.0154,0.1,-0.2186,0.0979,0.1,-0.1407,0.103,-0.05,0.1819,-0.2776,0.05,0.0754,-0.2414,-0.05,0.0754,-0.2414,0.05,0.1819,-0.2776,0.05,0.1637,-0.0885,-0.05,0.1309,-0.0598,0.05,0.1309,-0.0598,-0.05,0.1637,-0.0885,0.1,0.0609,-0.1135,0.05,-0.0513,-0.0818,0.05,-0.0092,-0.1673,0.1,0.0264,-0.0435,0.05,-0.0782,-0.0273,0.1,-0.0081,0.0264,0.14,0.4186,-0.0017,0.05,0.3163,-0.0476,0.1,0.3928,-0.0918,0.07,0.2961,0.0145,0.05,0.3163,-0.0476,0.14,0.4186,-0.0017,0.07,0.5412,-0.0178,0.1,0.3928,-0.0918,0.05,0.4692,-0.1359,0.14,0.4186,-0.0017,0.1,0.3928,-0.0918,0.07,0.5412,-0.0178,-0.07,0.5412,-0.0178,-0.05,0.4692,-0.1359,-0.1,0.3928,-0.0918,-0.14,0.4186,-0.0017,-0.07,0.5412,-0.0178,-0.1,0.3928,-0.0918,-0.14,0.4186,-0.0017,-0.1,0.3928,-0.0918,-0.05,0.3163,-0.0476,-0.07,0.2961,0.0145,-0.14,0.4186,-0.0017,-0.05,0.3163,-0.0476,0.07,0.5325,0.1153,0.14,0.4186,-0.0017,0.07,0.5412,-0.0178,0.14,0.4115,0.1073,-0.07,0.2961,0.0145,-0.14,0.4115,0.1073,-0.14,0.4186,-0.0017,-0.07,0.2905,0.0994,-0.07,0.2905,0.0994,0.07,0.2961,0.0145,0.07,0.2905,0.0994,-0.07,0.2961,0.0145,0.14,0.4115,0.1073,0.07,0.2961,0.0145,0.14,0.4186,-0.0017,0.07,0.2905,0.0994,-0.14,0.4186,-0.0017,-0.07,0.5325,0.1153,-0.07,0.5412,-0.0178,-0.14,0.4115,0.1073,-0.07,0.5412,-0.0178,0.07,0.5325,0.1153,0.07,0.5412,-0.0178,-0.07,0.5325,0.1153,0.07,0.4023,0.247,-0.035,0.3418,0.2431,0.035,0.3418,0.2431,-0.07,0.4023,0.247,0.035,0.4628,0.251,-0.035,0.4628,0.251,-0.035,0.3418,0.2431,-0.14,0.4115,0.1073,-0.07,0.2905,0.0994,-0.07,0.4023,0.247,-0.07,0.4023,0.247,-0.07,0.5325,0.1153,-0.14,0.4115,0.1073,-0.035,0.4628,0.251,0.07,0.5325,0.1153,0.07,0.4023,0.247,0.14,0.4115,0.1073,0.035,0.4628,0.251,0.14,0.4115,0.1073,0.035,0.3418,0.2431,0.07,0.2905,0.0994,0.07,0.4023,0.247,-0.07,0.5325,0.1153,0.035,0.4628,0.251,0.07,0.5325,0.1153,-0.035,0.4628,0.251,0.035,0.3418,0.2431,-0.07,0.2905,0.0994,0.07,0.2905,0.0994,-0.035,0.3418,0.2431,-0.07,0.2961,0.0145,0.05,0.3163,-0.0476,0.07,0.2961,0.0145,-0.05,0.3163,-0.0476,0.05,0.4692,-0.1359,-0.07,0.5412,-0.0178,0.07,0.5412,-0.0178,-0.05,0.4692,-0.1359],
    normals: [-0.9981,-0.0307,-0.0532,-0.5329,0.1104,0.8389,-0.9981,-0.008,-0.0609,-0.5329,0.4231,0.7328,0.4782,0.4391,0.7606,0.9981,0.008,0.0609,0.9981,0.0307,0.0532,0.4782,0.1146,0.8708,-0.5329,-0.6713,-0.5151,0.5329,-0.4231,-0.7328,-0.5329,-0.4231,-0.7328,0.5329,-0.6713,-0.5151,0.5329,0.6713,0.5151,1,0,0,0.9981,-0.0487,-0.0374,0.5,0.7767,0.383,0.4782,0.2273,-0.8483,0.9981,-0.008,-0.0609,0.4782,-0.1146,-0.8708,0.9981,0.0159,-0.0593,-0.9981,-0.008,-0.0609,-0.4782,0.2273,-0.8483,-0.4782,-0.1146,-0.8708,-0.9981,0.0159,-0.0593,0.4782,0.6968,0.5347,-0.4782,0.4391,0.7606,0.4782,0.4391,0.7606,-0.4782,0.6968,0.5347,-1,0,0,-0.5329,0.6713,0.5151,-0.9981,-0.0487,-0.0374,-0.5,0.7767,0.383,0.5329,0.1104,0.8389,-0.5329,0.4231,0.7328,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,0.5329,0.4231,0.7328,-0.5329,0.6713,0.5151,0.5329,0.6713,0.5151,-0.5329,0.4231,0.7328,0.5329,0.1104,0.8389,0.9981,-0.0307,-0.0532,0.9981,-0.008,-0.0609,0.5329,0.4231,0.7328,-0.5329,-0.4231,-0.7328,0.5329,-0.1104,-0.8389,-0.5329,-0.1104,-0.8389,0.5329,-0.4231,-0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.1104,0.8389,-0.9981,-0.008,-0.0609,-0.5329,0.4231,0.7328,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.4782,-0.6968,-0.5347,-1,0,0,-0.9981,0.008,0.0609,-0.4782,0.4391,0.7606,-0.9981,0.0307,0.0532,-0.4782,0.1146,0.8708,0.9981,-0.0307,-0.0532,0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.9981,-0.0487,-0.0374,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0.4782,0.5347,-0.6968,0.9981,0.0159,-0.0593,0.4782,0.2273,-0.8483,0.9981,0.0374,-0.0487,0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.5329,0.6713,0.5151,-0.4782,-0.4391,-0.7606,-0.9981,-0.008,-0.0609,-0.4782,-0.1146,-0.8708,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.4782,-0.4391,-0.7606,-0.4782,-0.1146,-0.8708,0.5329,-0.5151,0.6713,-0.5329,-0.219,0.8173,0.5329,-0.219,0.8173,-0.5329,-0.5151,0.6713,-0.4782,-0.6968,-0.5347,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,-0.9981,-0.0487,-0.0374,0.9981,-0.0487,-0.0374,0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,1,0,0,-0.4782,0.2273,-0.8483,0.4782,-0.1146,-0.8708,-0.4782,-0.1146,-0.8708,0.4782,0.2273,-0.8483,-0.9981,0.0159,-0.0593,-0.4782,0.5347,-0.6968,-0.4782,0.2273,-0.8483,-0.9981,0.0374,-0.0487,-0.5329,0.1104,0.8389,-0.9981,0.0159,-0.0593,-0.9981,-0.008,-0.0609,-0.5329,-0.219,0.8173,-0.9981,0.0374,-0.0487,-0.4704,0.6917,-0.548,-0.4782,0.5347,-0.6968,-0.9776,-0.0152,-0.2101,-0.9981,-0.008,-0.0609,-0.5,0.0566,-0.8642,-0.4782,-0.1146,-0.8708,-0.5329,-0.1104,-0.8389,-1,0,0,-0.9981,0.008,0.0609,-0.4782,-0.4391,-0.7606,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,-1,0,0,-0.5329,0.6713,0.5151,-0.9981,-0.0487,-0.0374,-0.5,0.7767,0.383,-0.9981,0.0487,0.0374,-0.4782,0.6968,0.5347,-0.4782,-0.4391,-0.7606,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.5329,0.1104,0.8389,-0.5329,0.4231,0.7328,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,0.9981,0.0307,0.0532,0.5329,-0.1104,-0.8389,0.5329,-0.4231,-0.7328,0.9981,0.008,0.0609,-0.9981,-0.0487,-0.0374,-0.5329,0.4231,0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,-0.5,0.0566,-0.8642,0.4782,-0.1146,-0.8708,-0.4782,-0.1146,-0.8708,0.5,0.0566,-0.8642,-0.5329,-0.1104,-0.8389,0.5329,-0.1104,-0.8389,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.4782,-0.6968,-0.5347,-1,0,0,-0.5329,-0.6713,-0.5151,-0.9981,0.0487,0.0374,-0.5329,0.6713,0.5151,0.5,0.7767,0.383,0.5329,0.6713,0.5151,-0.5,0.7767,0.383,0.4782,0.6968,0.5347,0.9981,0.0307,0.0532,0.9981,0.0487,0.0374,0.4782,0.4391,0.7606,-0.4782,0.5347,-0.6968,0.4782,0.2273,-0.8483,-0.4782,0.2273,-0.8483,0.4782,0.5347,-0.6968,0.9981,-0.008,-0.0609,0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.9981,-0.0307,-0.0532,0.4704,0.6917,-0.548,0.9981,0.0374,-0.0487,0.4782,0.5347,-0.6968,0.9776,-0.0152,-0.2101,-0.5329,0.6713,0.5151,0.5,0.7767,0.383,0.5329,0.6713,0.5151,-0.4782,0.6968,0.5347,-0.5,0.7767,0.383,0.4782,0.6968,0.5347,0.5,-0.0566,0.8642,-0.5329,0.1104,0.8389,0.5329,0.1104,0.8389,-0.5,-0.0566,0.8642,0.4782,0.1146,0.8708,-0.4782,0.1146,0.8708,0.5329,0.6713,0.5151,1,0,0,0.9981,-0.0487,-0.0374,0.5,0.7767,0.383,0.9981,0.0487,0.0374,0.4782,0.6968,0.5347,1,0,0,0.5329,0.1104,0.8389,0.9981,-0.008,-0.0609,0.9981,0.008,0.0609,0.5,-0.0566,0.8642,0.4782,0.1146,0.8708,-0.5329,-0.5151,0.6713,-0.9776,-0.0152,-0.2101,-0.9981,0.0374,-0.0487,-0.5496,-0.8329,0.0642,0.5329,0.1104,0.8389,0.9981,-0.0307,-0.0532,0.9981,-0.008,-0.0609,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,-1,0,0,-0.9981,-0.008,-0.0609,-0.9981,0.008,0.0609,-0.5,-0.0566,0.8642,-0.4782,0.1146,0.8708,-0.5329,-0.6713,-0.5151,0.5,-0.7767,-0.383,0.5329,-0.6713,-0.5151,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.5329,0.4231,0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,0.5329,-0.219,0.8173,-0.5329,0.1104,0.8389,0.5329,0.1104,0.8389,-0.5329,-0.219,0.8173,0.9776,-0.0152,-0.2101,0.5329,-0.5151,0.6713,0.9981,0.0374,-0.0487,0.5496,-0.8329,0.0642,-0.5496,-0.8329,0.0642,0.5329,-0.5151,0.6713,0.5496,-0.8329,0.0642,-0.5329,-0.5151,0.6713,0.9981,0.0374,-0.0487,0.5329,-0.219,0.8173,0.9981,0.0159,-0.0593,0.5329,-0.5151,0.6713,0.9981,0.0487,0.0374,0.5329,-0.4231,-0.7328,0.5329,-0.6713,-0.5151,0.9981,0.0307,0.0532,0.9981,0.0159,-0.0593,0.5329,0.1104,0.8389,0.9981,-0.008,-0.0609,0.5329,-0.219,0.8173,0.4782,0.5347,-0.6968,-0.4704,0.6917,-0.548,0.4704,0.6917,-0.548,-0.4782,0.5347,-0.6968,-0.5329,-0.219,0.8173,-0.9981,0.0374,-0.0487,-0.9981,0.0159,-0.0593,-0.5329,-0.5151,0.6713,0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.5329,0.6713,0.5151,-0.9981,0.0307,0.0532,-0.4782,0.6968,0.5347,-0.9981,0.0487,0.0374,-0.4782,0.4391,0.7606,0.4782,0.4391,0.7606,-0.4782,0.1146,0.8708,0.4782,0.1146,0.8708,-0.4782,0.4391,0.7606,-0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,0.5,-0.7767,-0.383,-0.4782,-0.6968,-0.5347,-0.4782,-0.4391,-0.7606,-0.9981,-0.008,-0.0609,-0.4782,-0.1146,-0.8708,-0.9981,-0.0307,-0.0532,-0.4782,-0.6968,-0.5347,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,-0.9981,-0.0487,-0.0374,0.9981,-0.008,-0.0609,0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.9981,-0.0307,-0.0532,-0.5329,-0.4231,-0.7328,-0.9981,0.0487,0.0374,-0.5329,-0.6713,-0.5151,-0.9981,0.0307,0.0532,-0.5329,-0.1104,-0.8389,-0.9981,0.0307,0.0532,-0.5329,-0.4231,-0.7328,-0.9981,0.008,0.0609,0.5,0.0566,-0.8642,0.9981,-0.008,-0.0609,0.4782,-0.1146,-0.8708,0.5329,-0.1104,-0.8389,1,0,0,0.9981,0.008,0.0609,-0.4782,-0.1146,-0.8708,0.4782,-0.4391,-0.7606,-0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.5329,0.4231,0.7328,-0.5329,0.6713,0.5151,0.5329,0.6713,0.5151,-0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,1,0,0,0.5329,-0.6713,-0.5151,0.9981,0.0487,0.0374,0.9791,0.0089,-0.2033,0.5496,-0.8329,0.0642,0.9776,-0.0152,-0.2101,0.4967,-0.8407,-0.2156,0.5496,-0.8329,0.0642,0.9791,0.0089,-0.2033,0.4842,0.8416,-0.2394,0.9776,-0.0152,-0.2101,0.4704,0.6917,-0.548,0.9791,0.0089,-0.2033,0.9776,-0.0152,-0.2101,0.4842,0.8416,-0.2394,-0.4842,0.8416,-0.2394,-0.4704,0.6917,-0.548,-0.9776,-0.0152,-0.2101,-0.9791,0.0089,-0.2033,-0.4842,0.8416,-0.2394,-0.9776,-0.0152,-0.2101,-0.9791,0.0089,-0.2033,-0.9776,-0.0152,-0.2101,-0.5496,-0.8329,0.0642,-0.4967,-0.8407,-0.2156,-0.9791,0.0089,-0.2033,-0.5496,-0.8329,0.0642,0.4883,0.8299,0.2697,0.9791,0.0089,-0.2033,0.4842,0.8416,-0.2394,0.9766,-0.0141,0.2144,-0.4967,-0.8407,-0.2156,-0.9766,-0.0141,0.2144,-0.9791,0.0089,-0.2033,-0.4883,-0.858,0.1591,-0.4883,-0.858,0.1591,0.4967,-0.8407,-0.2156,0.4883,-0.858,0.1591,-0.4967,-0.8407,-0.2156,0.9766,-0.0141,0.2144,0.4967,-0.8407,-0.2156,0.9791,0.0089,-0.2033,0.4883,-0.858,0.1591,-0.9791,0.0089,-0.2033,-0.4883,0.8299,0.2697,-0.4842,0.8416,-0.2394,-0.9766,-0.0141,0.2144,-0.4842,0.8416,-0.2394,0.4883,0.8299,0.2697,0.4842,0.8416,-0.2394,-0.4883,0.8299,0.2697,0.6297,-0.0508,0.7751,-0.3149,-0.595,0.7395,0.3149,-0.595,0.7395,-0.6297,-0.0508,0.7751,0.3149,0.4934,0.8108,-0.3149,0.4934,0.8108,-0.3149,-0.595,0.7395,-0.9766,-0.0141,0.2144,-0.4883,-0.858,0.1591,-0.6297,-0.0508,0.7751,-0.6297,-0.0508,0.7751,-0.4883,0.8299,0.2697,-0.9766,-0.0141,0.2144,-0.3149,0.4934,0.8108,0.4883,0.8299,0.2697,0.6297,-0.0508,0.7751,0.9766,-0.0141,0.2144,0.3149,0.4934,0.8108,0.9766,-0.0141,0.2144,0.3149,-0.595,0.7395,0.4883,-0.858,0.1591,0.6297,-0.0508,0.7751,-0.4883,0.8299,0.2697,0.3149,0.4934,0.8108,0.4883,0.8299,0.2697,-0.3149,0.4934,0.8108,0.3149,-0.595,0.7395,-0.4883,-0.858,0.1591,0.4883,-0.858,0.1591,-0.3149,-0.595,0.7395,-0.4967,-0.8407,-0.2156,0.5496,-0.8329,0.0642,0.4967,-0.8407,-0.2156,-0.5496,-0.8329,0.0642,0.4704,0.6917,-0.548,-0.4842,0.8416,-0.2394,0.4842,0.8416,-0.2394,-0.4704,0.6917,-0.548],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,71,68,72,71,72,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,106,107,108,107,106,109,110,111,112,111,110,113,114,115,116,115,114,117,118,119,120,119,118,121,121,118,122,121,122,123,124,125,126,125,124,127,128,129,130,129,128,131,131,128,132,131,132,133,134,135,136,135,134,137,138,139,140,139,138,141,142,143,144,143,142,145,146,147,148,147,146,149,150,151,152,151,150,153,153,150,154,153,154,155,156,157,158,157,156,159,159,156,160,159,160,161,162,163,164,163,162,165,166,167,168,167,166,169,170,171,172,171,170,173,174,175,176,175,174,177,178,179,180,179,178,181,182,183,184,185,183,182,185,182,186,183,185,187,188,189,190,189,188,191,191,188,192,191,192,193,194,195,196,195,194,197,195,197,198,198,197,199,200,201,202,201,200,203,201,203,204,204,203,205,206,207,208,207,206,209,210,211,212,211,210,213,214,215,216,215,214,217,217,214,218,217,218,219,220,221,222,221,220,223,223,220,224,224,220,225,226,227,228,227,226,229,230,231,232,231,230,233,234,235,236,235,234,237,238,239,240,239,238,241,242,243,244,243,242,245,246,247,248,247,246,249,250,251,252,251,250,253,254,255,256,255,254,257,258,259,260,259,258,261,262,263,264,263,262,265,266,267,268,267,266,269,270,271,272,271,270,273,274,275,276,275,274,277,278,279,280,279,278,281,282,283,284,283,282,285,286,287,288,287,286,289,290,291,292,291,290,293,294,295,296,295,294,297,298,299,300,299,298,301,299,301,302,302,301,303,304,305,306,305,304,307,308,309,310,309,308,311,312,313,314,313,312,315,313,315,316,316,315,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,343,342,345,346,347,348,347,346,349,350,351,352,351,350,353,354,355,356,355,354,357,358,359,360,359,358,361,362,363,364,363,362,365,366,367,368,367,366,369,369,366,370,369,370,371,372,373,374,373,372,375,376,377,378,377,376,379,380,381,382,381,380,383,384,385,386,385,384,387,388,389,390,389,388,391,392,393,394,393,392,395,396,397,398,397,396,399,400,401,402,401,400,403],
    bands: [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-16",
    shape: {
      form: "wedge", taper: 0.680441, symmetry: "handed", longest: 0.388582,
      aspect: [1, 0.894169, 0.70503],
      size: [0.347458, 0.388582, 0.273962],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.326323, sunkUnitsMean: 0.326323, sunkUnitsMax: 0.326323,
      sunkFractionMin: 0.839779, sunkFractionMean: 0.839779, sunkFractionMax: 0.839779,
    },
    roles: ["ear"],
    tris: 68,
    verts: 122,
    triVariants: [68],
    size: [0.347458, 0.388582, 0.273962],
    offset: [0.351224, 1.349218, 0.382966],
    provenance: [
      { species: "tiger", node: "body", ordinal: 1, role: "ear", name: "ear-right" },
    ],
    positions: [0.1238,-0.168,0.092,0.1737,-0.0138,-0.0528,0.1737,0.0121,0.0438,0.1238,-0.1939,-0.0046,0.1737,0.0121,0.0438,0.1737,0.0632,-0.0734,0.1737,0.0891,0.0232,0.1737,-0.0138,-0.0528,0.1737,0.0891,0.0232,0.1339,0.1299,-0.0913,0.1339,0.1558,0.0053,0.1737,0.0632,-0.0734,0.0648,0.1943,-0.005,0.1339,0.1299,-0.0913,0.0648,0.1684,-0.1016,0.1339,0.1558,0.0053,-0.0149,0.1684,-0.1016,0.0648,0.1943,-0.005,0.0648,0.1684,-0.1016,-0.0149,0.1943,-0.005,-0.0839,0.1299,-0.0913,-0.0149,0.1943,-0.005,-0.0149,0.1684,-0.1016,-0.0839,0.1558,0.0053,-0.0839,0.1299,-0.0913,-0.1238,0.0891,0.0232,-0.0839,0.1558,0.0053,-0.1238,0.0632,-0.0734,-0.0149,0.1943,-0.005,-0.0473,0.1334,0.0631,-0.0015,0.1589,0.0562,-0.0839,0.1558,0.0053,-0.0149,0.1943,-0.005,0.0514,0.1589,0.0562,0.0648,0.1943,-0.005,-0.0015,0.1589,0.0562,0.1339,0.1558,0.0053,0.1237,0.0891,0.0749,0.1737,0.0891,0.0232,0.0973,0.1334,0.0631,0.1737,0.0891,0.0232,0.1237,0.0314,0.0904,0.1737,0.0121,0.0438,0.1237,0.0891,0.0749,0.0648,0.1943,-0.005,0.0973,0.1334,0.0631,0.1339,0.1558,0.0053,0.0514,0.1589,0.0562,0.1237,0.0314,0.0904,0.1238,-0.168,0.092,0.1737,0.0121,0.0438,0.0755,-0.1425,0.137,-0.0839,0.1558,0.0053,-0.0772,0.0834,0.0764,-0.0473,0.1334,0.0631,-0.1238,0.0891,0.0232,-0.1238,0.0891,0.0232,-0.1254,-0.0905,0.123,-0.0772,0.0834,0.0764,-0.1737,-0.091,0.0714,-0.1238,0.0632,-0.0734,-0.1737,-0.091,0.0714,-0.1238,0.0891,0.0232,-0.1737,-0.1169,-0.0252,0.0755,-0.1943,-0.0562,0.1237,0.0373,-0.1183,0.1237,-0.0204,-0.1028,-0.1254,-0.1423,-0.0701,0.0973,0.0816,-0.1301,0.0514,0.1072,-0.137,-0.0015,0.1072,-0.137,-0.0473,0.0816,-0.1301,-0.0772,0.0316,-0.1167,0.1237,-0.0204,-0.1028,0.1737,0.0632,-0.0734,0.1737,-0.0138,-0.0528,0.1237,0.0373,-0.1183,-0.0772,0.0316,-0.1167,-0.1737,-0.1169,-0.0252,-0.1238,0.0632,-0.0734,-0.1254,-0.1423,-0.0701,0.1237,0.0373,-0.1183,0.1339,0.1299,-0.0913,0.1737,0.0632,-0.0734,0.0973,0.0816,-0.1301,-0.0772,0.0316,-0.1167,-0.0839,0.1299,-0.0913,-0.0473,0.0816,-0.1301,-0.1238,0.0632,-0.0734,-0.0473,0.0816,-0.1301,-0.0149,0.1684,-0.1016,-0.0015,0.1072,-0.137,-0.0839,0.1299,-0.0913,0.1238,-0.1939,-0.0046,0.1237,-0.0204,-0.1028,0.1737,-0.0138,-0.0528,0.0755,-0.1943,-0.0562,0.0514,0.1072,-0.137,-0.0149,0.1684,-0.1016,0.0648,0.1684,-0.1016,-0.0015,0.1072,-0.137,0.0973,0.0816,-0.1301,0.0648,0.1684,-0.1016,0.1339,0.1299,-0.0913,0.0514,0.1072,-0.137,0.1238,-0.1939,-0.0046,-0.1254,-0.1423,-0.0701,0.0755,-0.1943,-0.0562,-0.1737,-0.1169,-0.0252,0.1238,-0.168,0.092,-0.1737,-0.091,0.0714,0.0755,-0.1425,0.137,-0.1254,-0.0905,0.123,0.1237,0.0891,0.0749,0.0755,-0.1425,0.137,0.1237,0.0314,0.0904,-0.1254,-0.0905,0.123,0.0973,0.1334,0.0631,0.0514,0.1589,0.0562,-0.0015,0.1589,0.0562,-0.0473,0.1334,0.0631,-0.0772,0.0834,0.0764],
    normals: [0.8924,-0.1319,0.4315,0.9196,-0.2137,-0.3297,0.9196,-0.0202,0.3924,0.8924,-0.33,-0.3078,0.9196,-0.0202,0.3924,0.8977,0.1368,-0.4189,0.8977,0.3279,0.2944,0.9196,-0.2137,-0.3297,0.8977,0.3279,0.2944,0.6571,0.5392,-0.5267,0.6571,0.7303,0.1866,0.8977,0.1368,-0.4189,0.2405,0.9626,0.1243,0.6571,0.5392,-0.5267,0.2405,0.7715,-0.589,0.6571,0.7303,0.1866,-0.2405,0.7715,-0.589,0.2405,0.9626,0.1243,0.2405,0.7715,-0.589,-0.2405,0.9626,0.1243,-0.6571,0.5392,-0.5267,-0.2405,0.9626,0.1243,-0.2405,0.7715,-0.589,-0.6571,0.7303,0.1866,-0.6571,0.5392,-0.5267,-0.8569,0.4396,0.2692,-0.6571,0.7303,0.1866,-0.8569,0.2461,-0.4529,-0.2405,0.9626,0.1243,-0.301,0.525,0.7961,-0.1102,0.6314,0.7676,-0.6571,0.7303,0.1866,-0.2405,0.9626,0.1243,0.1102,0.6314,0.7676,0.2405,0.9626,0.1243,-0.1102,0.6314,0.7676,0.6571,0.7303,0.1866,0.4112,0.3406,0.8455,0.8977,0.3279,0.2944,0.301,0.525,0.7961,0.8977,0.3279,0.2944,0.4037,0.1851,0.896,0.9196,-0.0202,0.3924,0.4112,0.3406,0.8455,0.2405,0.9626,0.1243,0.301,0.525,0.7961,0.6571,0.7303,0.1866,0.1102,0.6314,0.7676,0.4037,0.1851,0.896,0.8924,-0.1319,0.4315,0.9196,-0.0202,0.3924,0.3696,0.1434,0.918,-0.6571,0.7303,0.1866,-0.3762,0.3869,0.8419,-0.301,0.525,0.7961,-0.8569,0.4396,0.2692,-0.8569,0.4396,0.2692,-0.3696,0.3348,0.8668,-0.3762,0.3869,0.8419,-0.8924,0.33,0.3078,-0.8569,0.2461,-0.4529,-0.8924,0.33,0.3078,-0.8569,0.4396,0.2692,-0.8924,0.1319,-0.4315,0.3696,-0.3348,-0.8668,0.4112,-0.1278,-0.9025,0.4037,-0.2877,-0.8685,-0.3696,-0.1434,-0.918,0.301,0.0566,-0.9519,0.1102,0.163,-0.9805,-0.1102,0.163,-0.9805,-0.301,0.0566,-0.9519,-0.3762,-0.0859,-0.9226,0.4037,-0.2877,-0.8685,0.8977,0.1368,-0.4189,0.9196,-0.2137,-0.3297,0.4112,-0.1278,-0.9025,-0.3762,-0.0859,-0.9226,-0.8924,0.1319,-0.4315,-0.8569,0.2461,-0.4529,-0.3696,-0.1434,-0.918,0.4112,-0.1278,-0.9025,0.6571,0.5392,-0.5267,0.8977,0.1368,-0.4189,0.301,0.0566,-0.9519,-0.3762,-0.0859,-0.9226,-0.6571,0.5392,-0.5267,-0.301,0.0566,-0.9519,-0.8569,0.2461,-0.4529,-0.301,0.0566,-0.9519,-0.2405,0.7715,-0.589,-0.1102,0.163,-0.9805,-0.6571,0.5392,-0.5267,0.8924,-0.33,-0.3078,0.4037,-0.2877,-0.8685,0.9196,-0.2137,-0.3297,0.3696,-0.3348,-0.8668,0.1102,0.163,-0.9805,-0.2405,0.7715,-0.589,0.2405,0.7715,-0.589,-0.1102,0.163,-0.9805,0.301,0.0566,-0.9519,0.2405,0.7715,-0.589,0.6571,0.5392,-0.5267,0.1102,0.163,-0.9805,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,-0.2588,-0.933,0.25,0.4112,0.3406,0.8455,0.3696,0.1434,0.918,0.4037,0.1851,0.896,-0.3696,0.3348,0.8668,0.301,0.525,0.7961,0.1102,0.6314,0.7676,-0.1102,0.6314,0.7676,-0.301,0.525,0.7961,-0.3762,0.3869,0.8419],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,65,67,68,68,67,69,69,67,70,70,67,71,71,67,72,73,74,75,74,73,76,77,78,79,78,77,80,81,82,83,82,81,84,85,86,87,86,85,88,89,90,91,90,89,92,93,94,95,94,93,96,97,98,99,98,97,100,101,102,103,102,101,104,105,106,107,106,105,108,108,105,109,108,109,110,110,109,111,110,111,112,113,114,115,114,113,116,116,113,117,116,117,118,116,118,119,116,119,120,116,120,121],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-17",
    shape: {
      form: "wedge", taper: 0.680441, symmetry: "handed", longest: 0.388582,
      aspect: [1, 0.894169, 0.70503],
      size: [0.347458, 0.388582, 0.273962],
    },
    attachment: {
      axis: "y", dir: 1, n: 1,
      sunkUnitsMin: 0.326323, sunkUnitsMean: 0.326323, sunkUnitsMax: 0.326323,
      sunkFractionMin: 0.839779, sunkFractionMean: 0.839779, sunkFractionMax: 0.839779,
    },
    roles: ["ear"],
    tris: 68,
    verts: 122,
    triVariants: [68],
    size: [0.347458, 0.388582, 0.273962],
    offset: [-0.351224, 1.349218, 0.382966],
    provenance: [
      { species: "tiger", node: "body", ordinal: 2, role: "ear", name: "ear-left" },
    ],
    positions: [0.1254,-0.0905,0.123,-0.0755,-0.1425,0.137,0.1737,-0.091,0.0714,-0.1238,-0.168,0.092,0.1737,-0.1169,-0.0252,-0.1238,-0.1939,-0.0046,0.1254,-0.1423,-0.0701,-0.0755,-0.1943,-0.0562,-0.0514,0.1072,-0.137,-0.0973,0.0816,-0.1301,-0.0648,0.1684,-0.1016,-0.1339,0.1299,-0.0913,0.0015,0.1072,-0.137,-0.0514,0.1072,-0.137,0.0149,0.1684,-0.1016,-0.0648,0.1684,-0.1016,-0.0755,-0.1943,-0.0562,-0.1238,-0.1939,-0.0046,-0.1237,-0.0204,-0.1028,-0.1737,-0.0138,-0.0528,0.0839,0.1299,-0.0913,0.0473,0.0816,-0.1301,0.0149,0.1684,-0.1016,0.0015,0.1072,-0.137,0.1238,0.0632,-0.0734,0.0772,0.0316,-0.1167,0.0839,0.1299,-0.0913,0.0473,0.0816,-0.1301,-0.0973,0.0816,-0.1301,-0.1237,0.0373,-0.1183,-0.1339,0.1299,-0.0913,-0.1737,0.0632,-0.0734,0.1254,-0.1423,-0.0701,0.0772,0.0316,-0.1167,0.1737,-0.1169,-0.0252,0.1238,0.0632,-0.0734,-0.1237,0.0373,-0.1183,-0.1237,-0.0204,-0.1028,-0.1737,0.0632,-0.0734,-0.1737,-0.0138,-0.0528,0.0772,0.0316,-0.1167,0.1254,-0.1423,-0.0701,0.0473,0.0816,-0.1301,0.0015,0.1072,-0.137,-0.0514,0.1072,-0.137,-0.0973,0.0816,-0.1301,-0.1237,0.0373,-0.1183,-0.0755,-0.1943,-0.0562,-0.1237,-0.0204,-0.1028,0.1737,-0.1169,-0.0252,0.1238,0.0632,-0.0734,0.1737,-0.091,0.0714,0.1238,0.0891,0.0232,0.1737,-0.091,0.0714,0.1238,0.0891,0.0232,0.1254,-0.0905,0.123,0.0772,0.0834,0.0764,0.1238,0.0891,0.0232,0.0839,0.1558,0.0053,0.0772,0.0834,0.0764,0.0473,0.1334,0.0631,-0.0755,-0.1425,0.137,-0.1237,0.0314,0.0904,-0.1238,-0.168,0.092,-0.1737,0.0121,0.0438,-0.0514,0.1589,0.0562,-0.0648,0.1943,-0.005,-0.0973,0.1334,0.0631,-0.1339,0.1558,0.0053,-0.1237,0.0891,0.0749,-0.1737,0.0891,0.0232,-0.1237,0.0314,0.0904,-0.1737,0.0121,0.0438,-0.0973,0.1334,0.0631,-0.1339,0.1558,0.0053,-0.1237,0.0891,0.0749,-0.1737,0.0891,0.0232,0.0015,0.1589,0.0562,0.0149,0.1943,-0.005,-0.0514,0.1589,0.0562,-0.0648,0.1943,-0.005,0.0839,0.1558,0.0053,0.0149,0.1943,-0.005,0.0473,0.1334,0.0631,0.0015,0.1589,0.0562,0.1238,0.0632,-0.0734,0.0839,0.1299,-0.0913,0.1238,0.0891,0.0232,0.0839,0.1558,0.0053,0.0839,0.1558,0.0053,0.0839,0.1299,-0.0913,0.0149,0.1943,-0.005,0.0149,0.1684,-0.1016,0.0149,0.1943,-0.005,0.0149,0.1684,-0.1016,-0.0648,0.1943,-0.005,-0.0648,0.1684,-0.1016,-0.1339,0.1558,0.0053,-0.0648,0.1943,-0.005,-0.1339,0.1299,-0.0913,-0.0648,0.1684,-0.1016,-0.1737,0.0632,-0.0734,-0.1737,0.0891,0.0232,-0.1339,0.1299,-0.0913,-0.1339,0.1558,0.0053,-0.1737,-0.0138,-0.0528,-0.1737,0.0121,0.0438,-0.1737,0.0632,-0.0734,-0.1737,0.0891,0.0232,-0.1238,-0.1939,-0.0046,-0.1238,-0.168,0.092,-0.1737,-0.0138,-0.0528,-0.1737,0.0121,0.0438,0.0772,0.0834,0.0764,0.0473,0.1334,0.0631,0.1254,-0.0905,0.123,0.0015,0.1589,0.0562,-0.0514,0.1589,0.0562,-0.0973,0.1334,0.0631,-0.1237,0.0891,0.0749,-0.0755,-0.1425,0.137,-0.1237,0.0314,0.0904],
    normals: [0.2588,-0.933,0.25,0.2588,-0.933,0.25,0.2588,-0.933,0.25,0.2588,-0.933,0.25,0.2588,-0.933,0.25,0.2588,-0.933,0.25,0.2588,-0.933,0.25,0.2588,-0.933,0.25,-0.1102,0.163,-0.9805,-0.301,0.0566,-0.9519,-0.2405,0.7715,-0.589,-0.6571,0.5392,-0.5267,0.1102,0.163,-0.9805,-0.1102,0.163,-0.9805,0.2405,0.7715,-0.589,-0.2405,0.7715,-0.589,-0.3696,-0.3348,-0.8668,-0.8924,-0.33,-0.3078,-0.4037,-0.2877,-0.8685,-0.9196,-0.2137,-0.3297,0.6571,0.5392,-0.5267,0.301,0.0566,-0.9519,0.2405,0.7715,-0.589,0.1102,0.163,-0.9805,0.8569,0.2461,-0.4529,0.3762,-0.0859,-0.9226,0.6571,0.5392,-0.5267,0.301,0.0566,-0.9519,-0.301,0.0566,-0.9519,-0.4112,-0.1278,-0.9025,-0.6571,0.5392,-0.5267,-0.8977,0.1368,-0.4189,0.3696,-0.1434,-0.918,0.3762,-0.0859,-0.9226,0.8924,0.1319,-0.4315,0.8569,0.2461,-0.4529,-0.4112,-0.1278,-0.9025,-0.4037,-0.2877,-0.8685,-0.8977,0.1368,-0.4189,-0.9196,-0.2137,-0.3297,0.3762,-0.0859,-0.9226,0.3696,-0.1434,-0.918,0.301,0.0566,-0.9519,0.1102,0.163,-0.9805,-0.1102,0.163,-0.9805,-0.301,0.0566,-0.9519,-0.4112,-0.1278,-0.9025,-0.3696,-0.3348,-0.8668,-0.4037,-0.2877,-0.8685,0.8924,0.1319,-0.4315,0.8569,0.2461,-0.4529,0.8924,0.33,0.3078,0.8569,0.4396,0.2692,0.8924,0.33,0.3078,0.8569,0.4396,0.2692,0.3696,0.3348,0.8668,0.3762,0.3869,0.8419,0.8569,0.4396,0.2692,0.6571,0.7303,0.1866,0.3762,0.3869,0.8419,0.301,0.525,0.7961,-0.3696,0.1434,0.918,-0.4037,0.1851,0.896,-0.8924,-0.1319,0.4315,-0.9196,-0.0202,0.3924,-0.1102,0.6314,0.7676,-0.2405,0.9626,0.1243,-0.301,0.525,0.7961,-0.6571,0.7303,0.1866,-0.4112,0.3406,0.8455,-0.8977,0.3279,0.2944,-0.4037,0.1851,0.896,-0.9196,-0.0202,0.3924,-0.301,0.525,0.7961,-0.6571,0.7303,0.1866,-0.4112,0.3406,0.8455,-0.8977,0.3279,0.2944,0.1102,0.6314,0.7676,0.2405,0.9626,0.1243,-0.1102,0.6314,0.7676,-0.2405,0.9626,0.1243,0.6571,0.7303,0.1866,0.2405,0.9626,0.1243,0.301,0.525,0.7961,0.1102,0.6314,0.7676,0.8569,0.2461,-0.4529,0.6571,0.5392,-0.5267,0.8569,0.4396,0.2692,0.6571,0.7303,0.1866,0.6571,0.7303,0.1866,0.6571,0.5392,-0.5267,0.2405,0.9626,0.1243,0.2405,0.7715,-0.589,0.2405,0.9626,0.1243,0.2405,0.7715,-0.589,-0.2405,0.9626,0.1243,-0.2405,0.7715,-0.589,-0.6571,0.7303,0.1866,-0.2405,0.9626,0.1243,-0.6571,0.5392,-0.5267,-0.2405,0.7715,-0.589,-0.8977,0.1368,-0.4189,-0.8977,0.3279,0.2944,-0.6571,0.5392,-0.5267,-0.6571,0.7303,0.1866,-0.9196,-0.2137,-0.3297,-0.9196,-0.0202,0.3924,-0.8977,0.1368,-0.4189,-0.8977,0.3279,0.2944,-0.8924,-0.33,-0.3078,-0.8924,-0.1319,0.4315,-0.9196,-0.2137,-0.3297,-0.9196,-0.0202,0.3924,0.3762,0.3869,0.8419,0.301,0.525,0.7961,0.3696,0.3348,0.8668,0.1102,0.6314,0.7676,-0.1102,0.6314,0.7676,-0.301,0.525,0.7961,-0.4112,0.3406,0.8455,-0.3696,0.1434,0.918,-0.4037,0.1851,0.896],
    indices: [0,1,2,1,3,2,2,3,4,3,5,4,4,5,6,7,6,5,8,9,10,11,10,9,12,13,14,15,14,13,16,17,18,19,18,17,20,21,22,23,22,21,24,25,26,27,26,25,28,29,30,31,30,29,32,33,34,35,34,33,36,37,38,39,38,37,40,41,42,42,41,43,43,41,44,44,41,45,45,41,46,41,47,46,48,46,47,49,50,51,52,51,50,53,54,55,56,55,54,57,58,59,60,59,58,61,62,63,64,63,62,65,66,67,68,67,66,69,70,71,72,71,70,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,106,107,108,107,106,109,110,111,112,111,110,113,114,115,114,116,115,116,117,115,117,118,115,118,119,115,115,119,120,121,120,119],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,5,5,5,5,5,5,5],
  },
  {
    id: "wedge-18",
    shape: {
      form: "wedge", taper: 0.521512, symmetry: "mirror", longest: 1.046587,
      aspect: [1, 0.530501, 0.191097],
      size: [0.2, 1.046587, 0.555215],
    },
    attachment: {
      axis: "z", dir: -1, n: 1,
      sunkUnitsMin: 0.076607, sunkUnitsMean: 0.076607, sunkUnitsMax: 0.076607,
      sunkFractionMin: 0.137977, sunkFractionMean: 0.137977, sunkFractionMax: 0.137977,
    },
    roles: ["tail"],
    tris: 212,
    verts: 306,
    triVariants: [212],
    size: [0.2, 1.046587, 0.555215],
    offset: [0, 1.186701, -0.826],
    provenance: [
      { species: "tiger", node: "tail", ordinal: -1, role: "tail", name: "tail" },
    ],
    positions: [-0.1,-0.3524,0.1179,-0.05,-0.267,0.1803,-0.1,-0.2785,0.0928,-0.05,-0.3083,0.1943,0.05,-0.0048,0.1544,0.1,-0.1228,0.103,0.1,-0.0489,0.0779,0.05,-0.1113,0.1905,-0.05,-0.0603,-0.0273,0.05,-0.0931,0.0014,-0.05,-0.0931,0.0014,0.05,-0.0603,-0.0273,0.05,-0.3411,0.2231,0.1,-0.4456,0.2393,0.1,-0.4111,0.1693,0.05,-0.368,0.2776,0.05,0.3121,-0.2703,0.1,0.2114,-0.1901,0.05,0.1998,-0.2776,0.1,0.2892,-0.185,-0.1,0.2114,-0.1901,-0.05,0.3121,-0.2703,-0.05,0.1998,-0.2776,-0.1,0.2892,-0.185,0.05,0.0798,0.0802,-0.05,-0.0048,0.1544,0.05,-0.0048,0.1544,-0.05,0.0798,0.0802,-0.1,-0.4456,0.2393,-0.05,-0.3411,0.2231,-0.1,-0.4111,0.1693,-0.05,-0.368,0.2776,0.05,-0.267,0.1803,-0.05,-0.3083,0.1943,0.05,-0.3083,0.1943,-0.05,-0.267,0.1803,0.05,-0.3083,0.1943,-0.05,-0.3411,0.2231,0.05,-0.3411,0.2231,-0.05,-0.3083,0.1943,0.05,-0.267,0.1803,0.1,-0.3524,0.1179,0.1,-0.2785,0.0928,0.05,-0.3083,0.1943,-0.05,-0.0931,0.0014,0.05,-0.1343,0.0154,-0.05,-0.1343,0.0154,0.05,-0.0931,0.0014,-0.1,0.1375,-0.165,-0.05,0.2229,-0.1025,-0.1,0.2114,-0.1901,-0.05,0.1816,-0.0885,-0.05,-0.5233,0.201,-0.1,-0.4111,0.1693,-0.05,-0.4812,0.1156,-0.1,-0.4456,0.2393,-0.1,-0.1228,0.103,-0.05,-0.0048,0.1544,-0.1,-0.0489,0.0779,-0.05,-0.1113,0.1905,0.1,-0.3524,0.1179,0.05,-0.4812,0.1156,0.05,-0.3966,0.0414,0.1,-0.4111,0.1693,0.1,0.1375,-0.165,0.05,0.0087,-0.1673,0.05,0.0933,-0.2414,0.1,0.0788,-0.1135,0.1,-0.4456,0.2393,-0.05,-0.5233,0.201,0.05,-0.5233,0.201,-0.1,-0.4456,0.2393,0.05,-0.368,0.2776,-0.05,-0.368,0.2776,0.05,0.1816,-0.0885,0.1,0.0788,-0.1135,0.1,0.1375,-0.165,0.05,0.1488,-0.0598,-0.05,0.0933,-0.2414,-0.1,0.2114,-0.1901,-0.05,0.1998,-0.2776,-0.1,0.1375,-0.165,-0.05,-0.3966,0.0414,0.05,-0.2901,0.0052,0.05,-0.3966,0.0414,-0.05,-0.2901,0.0052,-0.05,0.0087,-0.1673,-0.1,0.1375,-0.165,-0.05,0.0933,-0.2414,-0.1,0.0788,-0.1135,0.1,-0.4111,0.1693,0.05,-0.5233,0.201,0.05,-0.4812,0.1156,0.1,-0.4456,0.2393,-0.05,0.3121,-0.2703,0.05,0.1998,-0.2776,-0.05,0.1998,-0.2776,0.05,0.3121,-0.2703,-0.05,0.2229,-0.1025,-0.1,0.2892,-0.185,-0.1,0.2114,-0.1901,-0.05,0.2664,-0.0997,-0.1,-0.2785,0.0928,-0.05,-0.195,0.0115,-0.05,-0.2901,0.0052,-0.05,-0.1343,0.0154,-0.1,-0.2007,0.0979,-0.1,-0.1228,0.103,-0.05,-0.3966,0.0414,0.05,-0.4812,0.1156,-0.05,-0.4812,0.1156,0.05,-0.3966,0.0414,-0.1,0.0443,-0.0435,-0.05,0.1488,-0.0598,-0.1,0.0788,-0.1135,-0.05,0.1219,-0.0052,-0.1,0.0098,0.0264,-0.05,0.0798,0.0802,-0.05,0.0933,-0.2414,0.05,0.0087,-0.1673,-0.05,0.0087,-0.1673,0.05,0.0933,-0.2414,0.05,0.2229,-0.1025,-0.05,0.1816,-0.0885,0.05,0.1816,-0.0885,-0.05,0.2229,-0.1025,0.1,-0.0489,0.0779,0.05,-0.1343,0.0154,0.05,-0.0931,0.0014,0.1,-0.1228,0.103,-0.1,-0.4111,0.1693,-0.05,-0.3083,0.1943,-0.1,-0.3524,0.1179,-0.05,-0.3411,0.2231,-0.05,-0.195,0.0115,0.05,-0.2901,0.0052,-0.05,-0.2901,0.0052,0.05,-0.195,0.0115,-0.05,-0.1343,0.0154,0.05,-0.1343,0.0154,-0.05,-0.0334,-0.0818,-0.1,0.0788,-0.1135,-0.05,0.0087,-0.1673,-0.1,0.0443,-0.0435,-0.05,-0.0603,-0.0273,-0.1,0.0098,0.0264,-0.05,-0.3411,0.2231,0.05,-0.368,0.2776,0.05,-0.3411,0.2231,-0.05,-0.368,0.2776,0.05,0.0798,0.0802,0.1,-0.0489,0.0779,0.1,0.0098,0.0264,0.05,-0.0048,0.1544,0.1,0.2114,-0.1901,0.05,0.0933,-0.2414,0.05,0.1998,-0.2776,0.1,0.1375,-0.165,-0.05,0.1488,-0.0598,0.05,0.1219,-0.0052,0.05,0.1488,-0.0598,-0.05,0.0798,0.0802,-0.05,0.1219,-0.0052,0.05,0.0798,0.0802,0.05,-0.2063,0.1843,-0.05,-0.267,0.1803,0.05,-0.267,0.1803,-0.05,-0.2063,0.1843,0.05,-0.1113,0.1905,-0.05,-0.1113,0.1905,0.05,0.1488,-0.0598,0.1,0.0443,-0.0435,0.1,0.0788,-0.1135,0.05,0.1219,-0.0052,0.1,0.0098,0.0264,0.05,0.0798,0.0802,0.1,-0.2007,0.0979,0.05,-0.267,0.1803,0.1,-0.2785,0.0928,0.1,-0.1228,0.103,0.05,-0.2063,0.1843,0.05,-0.1113,0.1905,0.05,0.2229,-0.1025,0.1,0.1375,-0.165,0.1,0.2114,-0.1901,0.05,0.1816,-0.0885,-0.05,-0.267,0.1803,-0.1,-0.2007,0.0979,-0.1,-0.2785,0.0928,-0.1,-0.1228,0.103,-0.05,-0.2063,0.1843,-0.05,-0.1113,0.1905,-0.05,-0.0603,-0.0273,0.05,-0.0334,-0.0818,0.05,-0.0603,-0.0273,0.05,0.0087,-0.1673,-0.05,0.0087,-0.1673,-0.05,-0.0334,-0.0818,-0.1,0.0788,-0.1135,-0.05,0.1816,-0.0885,-0.1,0.1375,-0.165,-0.05,0.1488,-0.0598,0.05,0.2664,-0.0997,-0.05,0.2229,-0.1025,0.05,0.2229,-0.1025,-0.05,0.2664,-0.0997,0.1,0.0098,0.0264,0.05,-0.0931,0.0014,0.05,-0.0603,-0.0273,0.1,-0.0489,0.0779,0.1,0.2892,-0.185,0.05,0.2229,-0.1025,0.1,0.2114,-0.1901,0.05,0.2664,-0.0997,0.05,-0.3083,0.1943,0.1,-0.4111,0.1693,0.1,-0.3524,0.1179,0.05,-0.3411,0.2231,-0.1,-0.0489,0.0779,-0.05,0.0798,0.0802,-0.1,0.0098,0.0264,-0.05,-0.0048,0.1544,0.05,-0.0048,0.1544,-0.05,-0.1113,0.1905,0.05,-0.1113,0.1905,-0.05,-0.0048,0.1544,-0.05,-0.5233,0.201,0.05,-0.4812,0.1156,0.05,-0.5233,0.201,-0.05,-0.4812,0.1156,-0.05,-0.3966,0.0414,-0.1,-0.2785,0.0928,-0.05,-0.2901,0.0052,-0.1,-0.3524,0.1179,-0.05,-0.4812,0.1156,-0.1,-0.3524,0.1179,-0.05,-0.3966,0.0414,-0.1,-0.4111,0.1693,0.1,-0.2785,0.0928,0.05,-0.3966,0.0414,0.05,-0.2901,0.0052,0.1,-0.3524,0.1179,-0.05,-0.0931,0.0014,-0.1,0.0098,0.0264,-0.05,-0.0603,-0.0273,-0.1,-0.0489,0.0779,-0.05,-0.1343,0.0154,-0.1,-0.0489,0.0779,-0.05,-0.0931,0.0014,-0.1,-0.1228,0.103,0.05,-0.195,0.0115,0.1,-0.2785,0.0928,0.05,-0.2901,0.0052,0.05,-0.1343,0.0154,0.1,-0.2007,0.0979,0.1,-0.1228,0.103,-0.05,0.1998,-0.2776,0.05,0.0933,-0.2414,-0.05,0.0933,-0.2414,0.05,0.1998,-0.2776,0.05,0.1816,-0.0885,-0.05,0.1488,-0.0598,0.05,0.1488,-0.0598,-0.05,0.1816,-0.0885,0.1,0.0788,-0.1135,0.05,-0.0334,-0.0818,0.05,0.0087,-0.1673,0.1,0.0443,-0.0435,0.05,-0.0603,-0.0273,0.1,0.0098,0.0264,-0.1,0.2892,-0.185,-0.05,0.413,-0.2205,-0.05,0.3121,-0.2703,0.05,0.3121,-0.2703,-0.1,0.3592,-0.1504,-0.05,0.2664,-0.0997,0.05,0.413,-0.2205,0.1,0.2892,-0.185,-0.05,0.4871,-0.1359,0.1,0.3592,-0.1504,0.05,0.2664,-0.0997,0.05,0.3055,-0.0804,-0.05,0.3055,-0.0804,0.05,0.4871,-0.1359,-0.1,0.4107,-0.0918,0.1,0.4107,-0.0918,-0.05,0.3342,-0.0476,0.05,0.5233,-0.0294,0.05,0.3342,-0.0476,-0.05,0.5233,-0.0294,0.1,0.4357,-0.0179,0.05,0.3482,-0.0064,-0.1,0.4357,-0.0179,0.05,0.5171,0.0657,-0.05,0.3482,-0.0064,-0.05,0.5171,0.0657,-0.1,0.4306,0.06,0.1,0.4306,0.06,-0.05,0.3442,0.0543,0.05,0.3442,0.0543,0.0285,0.3748,0.1565,0.057,0.4241,0.1598,-0.0285,0.3748,0.1565,-0.057,0.4241,0.1598,0.0285,0.4734,0.163,-0.0285,0.4734,0.163],
    normals: [-0.9981,-0.0307,-0.0532,-0.5329,0.1104,0.8389,-0.9981,-0.008,-0.0609,-0.5329,0.4231,0.7328,0.4782,0.4391,0.7606,0.9981,0.008,0.0609,0.9981,0.0307,0.0532,0.4782,0.1146,0.8708,-0.5329,-0.6713,-0.5151,0.5329,-0.4231,-0.7328,-0.5329,-0.4231,-0.7328,0.5329,-0.6713,-0.5151,0.5329,0.6713,0.5151,1,0,0,0.9981,-0.0487,-0.0374,0.5,0.7767,0.383,0.4782,0.2273,-0.8483,0.9981,-0.008,-0.0609,0.4782,-0.1146,-0.8708,0.9981,0.0159,-0.0593,-0.9981,-0.008,-0.0609,-0.4782,0.2273,-0.8483,-0.4782,-0.1146,-0.8708,-0.9981,0.0159,-0.0593,0.4782,0.6968,0.5347,-0.4782,0.4391,0.7606,0.4782,0.4391,0.7606,-0.4782,0.6968,0.5347,-1,0,0,-0.5329,0.6713,0.5151,-0.9981,-0.0487,-0.0374,-0.5,0.7767,0.383,0.5329,0.1104,0.8389,-0.5329,0.4231,0.7328,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,0.5329,0.4231,0.7328,-0.5329,0.6713,0.5151,0.5329,0.6713,0.5151,-0.5329,0.4231,0.7328,0.5329,0.1104,0.8389,0.9981,-0.0307,-0.0532,0.9981,-0.008,-0.0609,0.5329,0.4231,0.7328,-0.5329,-0.4231,-0.7328,0.5329,-0.1104,-0.8389,-0.5329,-0.1104,-0.8389,0.5329,-0.4231,-0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.1104,0.8389,-0.9981,-0.008,-0.0609,-0.5329,0.4231,0.7328,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.4782,-0.6968,-0.5347,-1,0,0,-0.9981,0.008,0.0609,-0.4782,0.4391,0.7606,-0.9981,0.0307,0.0532,-0.4782,0.1146,0.8708,0.9981,-0.0307,-0.0532,0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.9981,-0.0487,-0.0374,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0,-0.4423,0.8969,0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.5329,0.6713,0.5151,-0.4782,-0.4391,-0.7606,-0.9981,-0.008,-0.0609,-0.4782,-0.1146,-0.8708,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.4782,-0.4391,-0.7606,-0.4782,-0.1146,-0.8708,-0.4782,-0.6968,-0.5347,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,-0.9981,-0.0487,-0.0374,0.9981,-0.0487,-0.0374,0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,1,0,0,-0.4782,0.2273,-0.8483,0.4782,-0.1146,-0.8708,-0.4782,-0.1146,-0.8708,0.4782,0.2273,-0.8483,-0.5329,0.1104,0.8389,-0.9981,0.0159,-0.0593,-0.9981,-0.008,-0.0609,-0.5329,-0.219,0.8173,-0.9981,-0.008,-0.0609,-0.5,0.0566,-0.8642,-0.4782,-0.1146,-0.8708,-0.5329,-0.1104,-0.8389,-1,0,0,-0.9981,0.008,0.0609,-0.4782,-0.4391,-0.7606,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,-1,0,0,-0.5329,0.6713,0.5151,-0.9981,-0.0487,-0.0374,-0.5,0.7767,0.383,-0.9981,0.0487,0.0374,-0.4782,0.6968,0.5347,-0.4782,-0.4391,-0.7606,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,0.4782,-0.4391,-0.7606,0.5329,0.1104,0.8389,-0.5329,0.4231,0.7328,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,0.9981,0.0307,0.0532,0.5329,-0.1104,-0.8389,0.5329,-0.4231,-0.7328,0.9981,0.008,0.0609,-0.9981,-0.0487,-0.0374,-0.5329,0.4231,0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,-0.5,0.0566,-0.8642,0.4782,-0.1146,-0.8708,-0.4782,-0.1146,-0.8708,0.5,0.0566,-0.8642,-0.5329,-0.1104,-0.8389,0.5329,-0.1104,-0.8389,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.4782,-0.6968,-0.5347,-1,0,0,-0.5329,-0.6713,-0.5151,-0.9981,0.0487,0.0374,-0.5329,0.6713,0.5151,0.5,0.7767,0.383,0.5329,0.6713,0.5151,-0.5,0.7767,0.383,0.4782,0.6968,0.5347,0.9981,0.0307,0.0532,0.9981,0.0487,0.0374,0.4782,0.4391,0.7606,0.9981,-0.008,-0.0609,0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,0.5,0.7767,0.383,0.5329,0.6713,0.5151,-0.4782,0.6968,0.5347,-0.5,0.7767,0.383,0.4782,0.6968,0.5347,0.5,-0.0566,0.8642,-0.5329,0.1104,0.8389,0.5329,0.1104,0.8389,-0.5,-0.0566,0.8642,0.4782,0.1146,0.8708,-0.4782,0.1146,0.8708,0.5329,0.6713,0.5151,1,0,0,0.9981,-0.0487,-0.0374,0.5,0.7767,0.383,0.9981,0.0487,0.0374,0.4782,0.6968,0.5347,1,0,0,0.5329,0.1104,0.8389,0.9981,-0.008,-0.0609,0.9981,0.008,0.0609,0.5,-0.0566,0.8642,0.4782,0.1146,0.8708,0.5329,0.1104,0.8389,0.9981,-0.0307,-0.0532,0.9981,-0.008,-0.0609,0.5329,0.4231,0.7328,-0.5329,0.1104,0.8389,-1,0,0,-0.9981,-0.008,-0.0609,-0.9981,0.008,0.0609,-0.5,-0.0566,0.8642,-0.4782,0.1146,0.8708,-0.5329,-0.6713,-0.5151,0.5,-0.7767,-0.383,0.5329,-0.6713,-0.5151,0.4782,-0.6968,-0.5347,-0.4782,-0.6968,-0.5347,-0.5,-0.7767,-0.383,-0.9981,-0.0487,-0.0374,-0.5329,0.4231,0.7328,-0.9981,-0.0307,-0.0532,-0.5329,0.6713,0.5151,0.5329,-0.219,0.8173,-0.5329,0.1104,0.8389,0.5329,0.1104,0.8389,-0.5329,-0.219,0.8173,0.9981,0.0487,0.0374,0.5329,-0.4231,-0.7328,0.5329,-0.6713,-0.5151,0.9981,0.0307,0.0532,0.9981,0.0159,-0.0593,0.5329,0.1104,0.8389,0.9981,-0.008,-0.0609,0.5329,-0.219,0.8173,0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.9981,-0.0307,-0.0532,0.5329,0.6713,0.5151,-0.9981,0.0307,0.0532,-0.4782,0.6968,0.5347,-0.9981,0.0487,0.0374,-0.4782,0.4391,0.7606,0.4782,0.4391,0.7606,-0.4782,0.1146,0.8708,0.4782,0.1146,0.8708,-0.4782,0.4391,0.7606,-0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,0.5,-0.7767,-0.383,-0.4782,-0.6968,-0.5347,-0.4782,-0.4391,-0.7606,-0.9981,-0.008,-0.0609,-0.4782,-0.1146,-0.8708,-0.9981,-0.0307,-0.0532,-0.4782,-0.6968,-0.5347,-0.9981,-0.0307,-0.0532,-0.4782,-0.4391,-0.7606,-0.9981,-0.0487,-0.0374,0.9981,-0.008,-0.0609,0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.9981,-0.0307,-0.0532,-0.5329,-0.4231,-0.7328,-0.9981,0.0487,0.0374,-0.5329,-0.6713,-0.5151,-0.9981,0.0307,0.0532,-0.5329,-0.1104,-0.8389,-0.9981,0.0307,0.0532,-0.5329,-0.4231,-0.7328,-0.9981,0.008,0.0609,0.5,0.0566,-0.8642,0.9981,-0.008,-0.0609,0.4782,-0.1146,-0.8708,0.5329,-0.1104,-0.8389,1,0,0,0.9981,0.008,0.0609,-0.4782,-0.1146,-0.8708,0.4782,-0.4391,-0.7606,-0.4782,-0.4391,-0.7606,0.4782,-0.1146,-0.8708,0.5329,0.4231,0.7328,-0.5329,0.6713,0.5151,0.5329,0.6713,0.5151,-0.5329,0.4231,0.7328,0.9981,-0.0487,-0.0374,0.5,-0.7767,-0.383,0.4782,-0.6968,-0.5347,1,0,0,0.5329,-0.6713,-0.5151,0.9981,0.0487,0.0374,-0.9981,0.0159,-0.0593,-0.4782,0.5347,-0.6968,-0.4782,0.2273,-0.8483,0.4782,0.2273,-0.8483,-0.9981,0.0374,-0.0487,-0.5329,-0.219,0.8173,0.4782,0.5347,-0.6968,0.9981,0.0159,-0.0593,-0.4782,0.7606,-0.4391,0.9981,0.0374,-0.0487,0.5329,-0.219,0.8173,0.5329,-0.5151,0.6713,-0.5329,-0.5151,0.6713,0.4782,0.7606,-0.4391,-0.9981,0.0532,-0.0307,0.9981,0.0532,-0.0307,-0.5329,-0.7328,0.4231,0.4782,0.8708,-0.1146,0.5329,-0.7328,0.4231,-0.4782,0.8708,-0.1146,0.9981,0.0609,-0.008,0.5329,-0.8389,0.1104,-0.9981,0.0609,-0.008,0.4909,0.836,0.2452,-0.5329,-0.8389,0.1104,-0.4909,0.836,0.2452,-0.9818,-0.0124,0.1896,0.9818,-0.0124,0.1896,-0.4909,-0.8609,0.134,0.4909,-0.8609,0.134,0.3266,-0.614,0.7186,0.6532,-0.0495,0.7556,-0.3266,-0.614,0.7186,-0.6532,-0.0495,0.7556,0.3266,0.515,0.7926,-0.3266,0.515,0.7926],
    indices: [0,1,2,1,0,3,4,5,6,5,4,7,8,9,10,9,8,11,12,13,14,13,12,15,16,17,18,17,16,19,20,21,22,21,20,23,24,25,26,25,24,27,28,29,30,29,28,31,32,33,34,33,32,35,36,37,38,37,36,39,40,41,42,41,40,43,44,45,46,45,44,47,48,49,50,49,48,51,52,53,54,53,52,55,56,57,58,57,56,59,60,61,62,61,60,63,64,65,66,65,64,67,68,69,70,69,68,71,71,68,72,71,72,73,74,75,76,75,74,77,78,79,80,79,78,81,82,83,84,83,82,85,86,87,88,87,86,89,90,91,92,91,90,93,94,95,96,95,94,97,98,99,100,99,98,101,102,103,104,103,102,105,105,102,106,105,106,107,108,109,110,109,108,111,112,113,114,113,112,115,115,112,116,115,116,117,118,119,120,119,118,121,122,123,124,123,122,125,126,127,128,127,126,129,130,131,132,131,130,133,134,135,136,135,134,137,137,134,138,137,138,139,140,141,142,141,140,143,143,140,144,143,144,145,146,147,148,147,146,149,150,151,152,151,150,153,154,155,156,155,154,157,158,159,160,161,159,158,161,158,162,159,161,163,164,165,166,165,164,167,167,164,168,167,168,169,170,171,172,171,170,173,171,173,174,174,173,175,176,177,178,177,176,179,177,179,180,180,179,181,182,183,184,183,182,185,186,187,188,187,186,189,189,186,190,189,190,191,192,193,194,193,192,195,195,192,196,196,192,197,198,199,200,199,198,201,202,203,204,203,202,205,206,207,208,207,206,209,210,211,212,211,210,213,214,215,216,215,214,217,218,219,220,219,218,221,222,223,224,223,222,225,226,227,228,227,226,229,230,231,232,231,230,233,234,235,236,235,234,237,238,239,240,239,238,241,242,243,244,243,242,245,246,247,248,247,246,249,250,251,252,251,250,253,251,253,254,254,253,255,256,257,258,257,256,259,260,261,262,261,260,263,264,265,266,265,264,267,265,267,268,268,267,269,270,271,272,271,273,272,271,270,274,275,274,270,273,271,276,276,277,273,274,278,271,278,276,271,277,276,279,279,280,277,281,275,280,280,279,281,274,275,282,275,281,282,283,279,276,276,278,283,282,284,274,278,274,284,279,283,285,285,281,279,281,286,282,284,282,286,278,287,283,287,285,283,281,285,288,286,281,288,284,289,278,287,278,289,285,287,290,290,288,285,291,286,288,288,290,291,286,292,284,289,284,292,293,290,287,289,293,287,286,291,294,292,286,294,292,295,289,293,289,295,294,296,292,295,292,296,290,293,297,297,291,290,291,298,294,296,294,298,291,297,299,298,291,299,297,300,299,300,298,299,293,301,297,300,297,301,298,300,302,302,296,298,301,302,300,296,302,303,302,301,303,303,295,296,301,293,304,295,304,293,303,301,304,295,303,305,303,304,305,304,295,305],
    bands: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  },
]

/** Shapes of one measured form, in bank order. */
export const partsOfForm = (form: PartShape['form']): readonly BakedPart[] =>
  PARTS_BANK.filter(p => p.shape.form === form)

/**
 * Shapes the pack ever used for a given role.
 *
 * A lookup into provenance, NOT a category. A kit is free to ask for the shapes
 * that were ears and then use them as spikes — that is the point of naming the
 * records by form.
 */
export const partsUsedAs = (role: PartRole): readonly BakedPart[] =>
  PARTS_BANK.filter(p => p.roles.includes(role))

/** What a kit asks the bank for when it does not know any species names. */
export interface PartQuery {
  form?: PartShape['form'] | readonly PartShape['form'][]
  /** Longest extent in model units, inclusive. */
  maxLongest?: number
  minLongest?: number
  /** Cross-section ratio: `maxTaper: 0.5` means "must narrow to at most half". */
  maxTaper?: number
  symmetry?: PartShape['symmetry']
  /** Only shapes the pack demonstrably buried at least this deep. */
  minSunkFraction?: number
}

/**
 * Find shapes by what they ARE — the query a kit builds an unknown animal with.
 *
 * The motivating case, and the one `tests/island/parts-bank.test.ts` pins:
 *
 *   findParts({ form: ['spike', 'cone'], maxLongest: 0.5, maxTaper: 0.5,
 *               minSunkFraction: 0.2 })
 *
 * — "small tapering spikes I can repeat and sink" — which must return the hog's
 * tusk and the hog's ear without naming either. Results are sorted smallest
 * first, because a repeated row wants the small end of the range.
 */
export const findParts = (q: PartQuery): readonly BakedPart[] => {
  const forms = q.form === undefined ? null
    : (Array.isArray(q.form) ? q.form : [q.form]) as readonly PartShape['form'][]
  return PARTS_BANK
    .filter(p => (forms === null || forms.includes(p.shape.form))
      && (q.maxLongest === undefined || p.shape.longest <= q.maxLongest)
      && (q.minLongest === undefined || p.shape.longest >= q.minLongest)
      && (q.maxTaper === undefined || p.shape.taper <= q.maxTaper)
      && (q.symmetry === undefined || p.shape.symmetry === q.symmetry)
      && (q.minSunkFraction === undefined
        || (p.attachment !== null && p.attachment.sunkFractionMax >= q.minSunkFraction)))
    .slice()
    .sort((a, b) => a.shape.longest - b.shape.longest)
}

/** One shape by id, or `undefined` if the id is not in the bank. */
export const partById = (id: string): BakedPart | undefined =>
  PARTS_BANK.find(p => p.id === id)
