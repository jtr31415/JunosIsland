/**
 * A stable fingerprint of a built creature. Determinism, made checkable.
 *
 * Joe asked for a builder that is deterministic as well as fast — *"same
 * definition in, same creature out"* — for two reasons that pull in opposite
 * directions and are both real:
 *
 *   1. **So a species can be reviewed, corrected and rebuilt without drift.** He
 *      looks at an animal, sends a note, the definition changes by one number and
 *      nothing else about the animal moves.
 *   2. **So a correction to the BUILDER improves every animal at once.** The
 *      pupil fix should have been that kind of change: one measured colour, in
 *      one place, correcting every animal built by this method. It was not,
 *      because each species carried its own copy of the number.
 *
 * A fingerprint serves both. Pin one per species in a test and an accidental
 * change is CAUGHT — red, by name, with the old and new hashes — rather than
 * discovered later on a screen. A deliberate change to the builder shows up as
 * every species' hash moving at once, which is exactly the signal that says the
 * change did what it claimed to.
 *
 * ## What goes into it
 *
 * Everything about the geometry a viewer can see and nothing about how it got
 * there: per mesh, its name, the bank id it claims, and its positions, normals,
 * uvs and indices. Not the material, not the texture (the palette is data and has
 * its own test), not `userData` beyond the part id.
 *
 * **Quantised to 1e-6 before hashing.** Float32 attributes and IEEE arithmetic
 * are reproducible, but `Math.cos` and `Math.sin` are implementation-defined and
 * the chamfer idiom turns parts by 45 degrees. A hash that changed when V8 did
 * would be a hash nobody trusted. 1e-6 is four orders below the pack's own 1/16
 * authoring grid, so nothing a builder can express hides under it.
 *
 * **Order-independent.** The per-mesh digests are sorted before they are combined,
 * so re-ordering a definition's features — which changes nothing anybody can see —
 * does not move the hash. What the hash asserts is that the SET of built meshes is
 * the same set, which is the claim worth pinning.
 */
import * as THREE from 'three'
import { buildAssembly } from './assembly'
import { ASSEMBLED_BUILDS } from './assembled'

/**
 * Two independent 32-bit FNV-1a passes, concatenated — 64 bits of hash out of
 * `Math.imul`, which is exact and identical on every engine.
 *
 * Deliberately not a crypto hash and deliberately not `BigInt`: the job is to
 * notice a change, not to resist one, and this runs over every vertex of every
 * species on every test run.
 */
function fnv(s: string): string {
  let a = 0x811c9dc5, b = 0x1000193
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a = Math.imul(a ^ c, 0x01000193)
    b = Math.imul(b ^ c, 0x85ebca6b)
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0')
}

/** 1e-6, and `-0` folded to `0` so a mirrored copy does not read differently. */
const q = (n: number): string => {
  const v = Math.round(n * 1e6) / 1e6
  return Object.is(v, -0) ? '0' : String(v)
}

function meshDigest(m: THREE.Mesh): string {
  const g = m.geometry
  const parts: string[] = [m.name, String(m.userData['part'] ?? '')]
  for (const key of ['position', 'normal', 'uv'] as const) {
    const a = g.getAttribute(key)
    if (!a) { parts.push(`${key}:`); continue }
    const out: string[] = []
    for (let i = 0; i < a.count * a.itemSize; i++) out.push(q(a.array[i] as number))
    parts.push(`${key}:${out.join(',')}`)
  }
  parts.push(`index:${[...(g.getIndex()?.array ?? [])].join(',')}`)
  /* The placed node's own translation. Rule 4 says it is the ONLY thing a node
   * carries, so it is the only thing beyond the vertices worth hashing. */
  parts.push(`at:${q(m.position.x)},${q(m.position.y)},${q(m.position.z)}`)
  return fnv(parts.join('|'))
}

/** The fingerprint of an already-built group. */
export function groupFingerprint(g: THREE.Object3D): string {
  const digests: string[] = []
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) digests.push(meshDigest(o as THREE.Mesh)) })
  digests.sort()
  /* The group's own grounding translation is part of the animal: it is where the
   * feet ended up, and a species that quietly left the floor should be red. */
  return fnv(`${digests.length}|${digests.join('|')}|y:${q(g.position.y)}`)
}

/** Build one assembled species and fingerprint it. The form a test pins. */
export function creatureFingerprint(id: string): string {
  const spec = ASSEMBLED_BUILDS[id]
  if (!spec) throw new Error(`no assembly build for "${id}"`)
  return groupFingerprint(buildAssembly(spec))
}
