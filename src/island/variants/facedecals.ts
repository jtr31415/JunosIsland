/**
 * Keeping the eyes out of the recolour.
 *
 * Joe, on the first Pet-o-matic pass at the sets: *"penguin pupils should stay
 * black, panda and polar bear and cow white of eye should stay white; rest of
 * the animal colouring slice is accepted."*
 *
 * The thing that makes this possible, and that two earlier attempts missed by
 * looking in the texture: THE EYES ARE THEIR OWN GEOMETRY. In all 24 species the
 * face is a flat sheet floating in front of the head — a separate connected
 * component, mirrored left and right, its area-weighted normal exactly +z. It is
 * not painted onto the head shell, it is stuck on top of it. tools/pets/atlas.mjs
 * finds those 63 decals from the mesh alone, with no colour test anywhere, and
 * writes down which vertices they are.
 *
 * So the fix is to point those vertices at a RESERVED copy of the colours they
 * already read (tools/pets/reserve.mjs, and RESERVE in recolour.ts). The eyes
 * read a copy nothing recolours; the coat reads the original everything
 * recolours. Measured over all 25 sets × 24 species: the eye-white drift on the
 * cow, panda and polar bear goes from 236 to 0, the penguin's pupil drift from
 * 139 to 0, and every species' COAT drift is unchanged to the byte. It is not a
 * trade — the coats still take their set completely.
 *
 * WHY THIS COSTS NO MEMORY, which is the whole reason it is done this way. The
 * decal UVs are a fact about the SPECIES, not about the set: the same 1,755
 * vertices move to the same reserved column whatever colour the pet ends up. So
 * the SHARED geometry is corrected once and every clone inherits it for free.
 * Forking geometry per (set × species) would be 25 × 1286.5 KiB = 32.2 MiB of
 * vertex buffers, which is precisely the constraint the one-texture-per-set
 * design exists to respect.
 *
 * WHERE IT RUNS. Its proper home is the loader, on the shared prototype, before
 * any pet is cloned: `pets.ts` beside `flattenImported`, and `petomatic.ts`
 * beside its own. `dress()` calls it as well, and that is a safety net rather
 * than duplication — a pet recoloured without the patch is a pet with berry
 * eyeballs, and "the step that was easily forgotten" is a failure this project
 * has already paid for four times (HANDOFF §5).
 *
 * Two properties make the second call harmless. It is IDEMPOTENT, so order
 * between the callers does not matter. And a three.js `clone()` SHARES geometry
 * with its original (HANDOFF §6), so patching any one clone patches every pet of
 * that species — including ones already in the scene, because `needsUpdate` puts
 * the change on the GPU. Verified in a real browser, with the loader call
 * removed, so that `dress()` was the only thing running it.
 *
 * The NATURAL set needs no patch either way, and gets none: `dress()` returns
 * early for it, and an unpatched natural pet reads the original swatches, which
 * no set ever writes to. A patched one reads a verbatim copy of them. Both are
 * the same pixels, which is what keeps brief §19 — the friends she already owns
 * are unchanged — true rather than merely likely.
 */
import type * as THREE from 'three'
import { ATLAS_WIDTH, RESERVE } from './recolour'
import faceTable from './species-face.json'

/**
 * `[firstVertex, count]` — the 1,755 decal vertices fall into 48 runs.
 *
 * Declared as a plain array rather than a tuple because that is what a JSON
 * import is: TypeScript infers `number[][]` from the file and no assertion can
 * honestly promise it two elements. The build script is what guarantees the
 * shape; the tests are what check it.
 */
type Run = readonly number[]

/** species -> mesh node name -> destination column -> runs of vertex indices. */
type FaceTable = Record<string, Record<string, Record<string, readonly Run[]>>>

/** reserved column -> the column it copies, so a patched vertex is recognisable. */
const SOURCE_OF = new Map(RESERVE.map(([from, to]) => [to, from] as const))

/**
 * Float32 UVs land exactly on these fractions — 112/512, 496/512, 336/512 and
 * 368/512 are all exactly representable — so this could be an equality test.
 * A tolerance instead, because an epsilon that is wrong is a wasted line and an
 * equality test that is wrong is a pet with no eyes.
 */
const UV_EPS = 1e-6

/**
 * Move one species' face-decal UVs onto the reserved swatches.
 *
 * Idempotent, and cheaply so: a vertex is moved only if it is still sitting on
 * the column the reserve copies. That guard is why this may be called from more
 * than one place without anyone having to reason about which ran first.
 *
 * @param root  the loaded model, or any clone of it — geometry is shared.
 * @param speciesId  `animal-fox` or `fox`; both are accepted.
 * @returns how many vertex UVs actually moved. 0 on a second call.
 */
export function wearFaceUVs(root: THREE.Object3D, speciesId: string): number {
  const table = (faceTable as FaceTable)[speciesId.replace('animal-', '')]
  if (!table) return 0

  let moved = 0
  root.traverse(node => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh) return
    /*
     * Keyed on the node's name, which is provably unambiguous for this pack:
     * 133 mesh-bearing nodes, none unnamed, no name repeated within a file, no
     * node whose mesh holds more than one primitive, and no two nodes sharing a
     * mesh. tools/pets/atlas.mjs asserts all five, so "name + vertex index"
     * addresses exactly one vertex and nothing here depends on loader
     * internals. A re-export that broke it would fail the build, not the eyes.
     */
    const spec = table[mesh.name]
    if (!spec) return
    const uv = mesh.geometry.getAttribute('uv') as THREE.BufferAttribute | undefined
    if (!uv) return

    let touched = false
    for (const [column, runs] of Object.entries(spec)) {
      const to = Number(column)
      const from = SOURCE_OF.get(to)
      if (from === undefined) continue
      const want = to / ATLAS_WIDTH
      const was = from / ATLAS_WIDTH
      for (const run of runs) {
        const first = run[0] as number, count = run[1] as number
        for (let i = first; i < first + count && i < uv.count; i++) {
          if (Math.abs(uv.getX(i) - was) > UV_EPS) continue
          uv.setX(i, want)
          moved++
          touched = true
        }
      }
    }
    /*
     * Only when something changed. Marking an untouched attribute would have
     * every clone of every species re-upload its UVs on the next draw for
     * nothing — and marking it too late is the one three.js-side risk this
     * carries, so it is set inside the same traversal that writes.
     */
    if (touched) uv.needsUpdate = true
  })
  return moved
}

/** How many vertices this species has on its face. For tests and the dump. */
export function faceVertexCount(speciesId: string): number {
  const table = (faceTable as FaceTable)[speciesId.replace('animal-', '')]
  if (!table) return 0
  let n = 0
  for (const spec of Object.values(table)) {
    for (const runs of Object.values(spec)) {
      for (const run of runs) n += run[1] as number
    }
  }
  return n
}

/** Every species the table knows about, unprefixed. For tests. */
export const speciesWithFaces = (): string[] => Object.keys(faceTable as FaceTable)
