/**
 * `npm run pets:creature` — build an assembled species and look at it.
 *
 * The third leg of Joe's ask on 29 July: *"can we not set up a script and the
 * agent just provides the script definitions?"* The definition is
 * `src/island/species/parts/assembled/animal-<name>.ts`; this is the script that
 * runs it. **Adding a species is: write ten lines, run this, look at it.**
 *
 * It builds the creature exactly as the game will — same `buildAssembly`, same
 * bank, same texture — and prints the things that are worth seeing before a
 * screenshot is worth taking:
 *
 *   - the height, against the pack's measured 1.43-2.02 band, which is a FLOOR
 *     and is the first thing that fails for a species designed low;
 *   - the keep-out radius `pets.ts:652` will charge it, which is what decides
 *     whether an animal can walk between two trees;
 *   - the vertex and triangle counts against rule 9;
 *   - every mesh, with the bank shape it came from, where it was joined, how deep
 *     it is sunk, which way it faces and whether it is still EMBEDDED — §3's
 *     "nothing floats" is the thing a still image hides best;
 *   - the fingerprint, so a rebuild can be compared with the last one;
 *   - and the `flag`, because an animal with one is an animal Joe is being asked
 *     to rule on.
 *
 * ```
 * npm run pets:creature                 # every assembled species, one line each
 * npm run pets:creature -- animal-mouse # one species, in full
 * ```
 */
import * as THREE from 'three'
import {
  assembledSpecies, buildAssembled, ASSEMBLED_BUILDS,
  PACK_HEIGHT_MIN, PACK_HEIGHT_MAX, MODEL_VERTS_MIN, MODEL_VERTS_MAX,
  MODEL_TRIS_MIN, MODEL_TRIS_MAX, BODY_VERTS_MIN, BODY_VERTS_MAX,
} from '../../src/island/species/parts/index'
import { groupFingerprint } from '../../src/island/species/parts/fingerprint'

const pad = (s: string, n: number): string => (s.length >= n ? s : s + ' '.repeat(n - s.length))
const num = (v: number, n = 3): string => v.toFixed(n)
const band = (v: number, lo: number, hi: number): string =>
  v < lo ? `UNDER ${lo}` : v > hi ? `OVER ${hi}` : 'ok'

interface Facts {
  height: number; width: number; depth: number; keepOut: number
  verts: number; tris: number; body: number; meshes: THREE.Mesh[]; group: THREE.Group
}

function measure(id: string): Facts {
  const g = buildAssembled(id)
  g.updateMatrixWorld(true)
  const meshes: THREE.Mesh[] = []
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh) })
  const box = new THREE.Box3().setFromObject(g)
  const s = box.getSize(new THREE.Vector3())
  let verts = 0, tris = 0, body = 0
  for (const m of meshes) {
    const n = m.geometry.getAttribute('position').count
    verts += n
    tris += m.geometry.getIndex()!.count / 3
    if (m.userData['role'] !== 'leg') body += n
  }
  return {
    height: s.y, width: s.x, depth: s.z, keepOut: Math.max(s.x, s.z) / 2,
    verts, tris, body, meshes, group: g,
  }
}

/** Is this copy still embedded in whatever it was joined to? §3: nothing floats. */
function embedded(m: THREE.Mesh): string {
  const sink = m.userData['sink'] as number | undefined
  const extent = m.userData['extent'] as number | undefined
  if (sink === undefined || extent === undefined) return ''
  const d = sink * extent
  /* §3: "every eared species embeds its ear into the hull, by at least 0.125".
   * The tolerance is float slack, not a softening — the leg's own burial is
   * 0.408163 x 0.30625, which is 0.125 to seven decimals and under it at eight. */
  return d >= 0.1249 ? `sunk ${num(d)}` : d > 0 ? `sunk ${num(d)} THIN` : 'flush'
}

function one(id: string): void {
  const row = assembledSpecies().find(r => r.id === id)
  if (!row) {
    console.log(`no assembled species "${id}". Known: ${assembledSpecies().map(r => r.id).join(', ')}`)
    process.exitCode = 1
    return
  }
  const spec = ASSEMBLED_BUILDS[id]!
  const f = measure(id)
  console.log(`\n${row.name}  (${id}, ${row.collection})`)
  console.log(`  fingerprint  ${groupFingerprint(f.group)}`)
  console.log(`  height       ${num(f.height, 4)}   ${band(f.height, PACK_HEIGHT_MIN, PACK_HEIGHT_MAX)}`
    + `   [pack ${PACK_HEIGHT_MIN}-${PACK_HEIGHT_MAX}, and 1.43 is a FLOOR]`)
  console.log(`  w x d        ${num(f.width)} x ${num(f.depth)}   keep-out ${num(f.keepOut)}`
    + '   [the fox is the pack\'s worst at 1.15]')
  console.log(`  verts        ${f.verts}   ${band(f.verts, MODEL_VERTS_MIN, MODEL_VERTS_MAX)}`
    + `   (body ${f.body}, ${band(f.body, BODY_VERTS_MIN, BODY_VERTS_MAX)})`)
  console.log(`  triangles    ${f.tris}   ${band(f.tris, MODEL_TRIS_MIN, MODEL_TRIS_MAX)}`)
  console.log(`  palette      ${Object.entries(spec.palette)
    .map(([k, v]) => `${k} #${v.toString(16).padStart(6, '0')}`).join('   ')}`)
  console.log(`\n  ${pad('mesh', 16)}${pad('shape', 18)}${pad('joined at', 26)}`
    + `${pad('facing', 16)}depth`)
  for (const m of f.meshes) {
    const at = m.userData['joinedAt'] as number[] | undefined
    const fa = m.userData['facing'] as number[] | undefined
    console.log(`  ${pad(m.name, 16)}${pad(String(m.userData['part']), 18)}`
      + `${pad(at ? `[${at.map(n => num(n)).join(', ')}]` : '-- the mass --', 26)}`
      + `${pad(fa ? `[${fa.map(n => num(n, 2)).join(', ')}]` : '', 16)}${embedded(m)}`)
  }
  if (row.hullStretchWhy) console.log(`\n  HULL STRETCHED: ${row.hullStretchWhy}`)
  if (row.flag) console.log(`\n  FLAG (Joe reads this): ${row.flag}`)
  console.log('')
}

function all(): void {
  console.log(`\n  ${pad('id', 20)}${pad('height', 9)}${pad('keep-out', 10)}`
    + `${pad('verts', 8)}${pad('tris', 8)}${pad('fingerprint', 18)}flag`)
  for (const row of assembledSpecies()) {
    const f = measure(row.id)
    console.log(`  ${pad(row.id, 20)}${pad(num(f.height, 4), 9)}${pad(num(f.keepOut), 10)}`
      + `${pad(String(f.verts), 8)}${pad(String(f.tris), 8)}`
      + `${pad(groupFingerprint(f.group), 18)}${row.flag ? 'yes' : ''}`)
  }
  console.log('')
}

const wanted = process.argv.slice(2).filter(a => !a.startsWith('-'))
if (wanted.length === 0) all()
else for (const id of wanted) one(id)
