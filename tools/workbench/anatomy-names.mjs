/**
 * Emit the anatomy gallery's component name table from the census.
 *
 * JOE_WORKBENCH_ONLY. Run by hand, not by any build:
 *
 *   node tools/workbench/anatomy-names.mjs <census.json>
 *
 * The census is a 3.7 MB survey of all 24 pack bodies — every position-welded
 * connected component in each, with its triangle count, its bounding box, its
 * centroid and a GUESSED name. This script keeps the four fields the viewer
 * needs and throws the rest away, so what lands in `public/anatomy-names.ts` is
 * a few hundred lines rather than a megabyte nobody can read in a diff.
 *
 * The names in it are OURS and not Kenney's. Nothing in the GLB names a
 * component — the file has one mesh called `body` and that is all it says — so
 * every string emitted here is an interpretation, and `anatomy.ts` marks it as
 * one on screen. That distinction is the entire point of the gallery, so it is
 * carried in the data rather than in a comment: the viewer never sees a name
 * without also seeing where it came from.
 *
 * Components are emitted in the viewer's own order — triangles descending, then
 * centroid x, y, z descending — which is `orderComponents` in `anatomy.ts`
 * applied to the census's numbers. The census's own array order is NOT that
 * order and is not any single sort, so re-sorting here is what makes keying by
 * ordinal mean anything at all.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const census = process.argv[2]
if (!census) {
  console.error('usage: node tools/workbench/anatomy-names.mjs <component-census.json>')
  process.exit(2)
}

const round = n => Math.round(n * 1e6) / 1e6

/** The viewer's order, on the census's numbers. Must match `orderComponents`. */
const order = (a, b) =>
  b.tris - a.tris
  || b.centroid[0] - a.centroid[0]
  || b.centroid[1] - a.centroid[1]
  || b.centroid[2] - a.centroid[2]

const data = JSON.parse(readFileSync(census, 'utf8'))
const lines = []
let total = 0

for (const species of Object.keys(data).sort()) {
  const body = data[species]?.nodes?.body
  if (!body) continue
  const parts = [...body.componentsPositionWelded].sort(order).map(c => {
    total++
    const [x, y, z] = c.centroid
    return `    { tris: ${c.tris}, verts: ${c.verts}, c: [${round(x)}, ${round(y)}, ${round(z)}], `
      + `name: ${JSON.stringify(c.guessedName)} },`
  })
  lines.push(`  ${species}: [`, ...parts, '  ],')
}

const out = `/**
 * OUR names for the nameless pieces inside each pack body. GENERATED — do not
 * hand-edit; run \`node tools/workbench/anatomy-names.mjs <census.json>\`.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * A Kenney pet's \`body\` mesh is one mesh with one name, and it comes apart into
 * between four and twelve disjoint shells that the file never names. These are
 * what those shells were called by the agent that surveyed all 24 of them. They
 * are guesses about what a shape IS, made from its size and where it sits, and
 * the anatomy gallery prints them in a different colour with \`our name:\` in
 * front for exactly that reason.
 *
 * \`tris\` and \`c\` are not decoration. The viewer recomputes the split live from
 * the GLB and checks both against this table before it will show a name; if the
 * component count or a triangle count disagrees it labels the part
 * \`unnamed component N\` instead. A wrong name here is worse than no name.
 *
 * Ordered as \`orderComponents\` orders: triangles descending, then centroid x,
 * y, z descending.
 */

/** One component of one body: what it measures, and what we decided to call it. */
export interface NamedComponent {
  /** Triangles in the component, as counted by the position-welded split. */
  tris: number
  /** Vertices in the component, counted before welding. */
  verts: number
  /** Centroid in model units — the mean of its welded vertex positions. */
  c: readonly [number, number, number]
  /** OUR name. Nothing in the GLB says this. */
  name: string
}

export const COMPONENT_NAMES: Readonly<Record<string, readonly NamedComponent[]>> = {
${lines.join('\n')}
}
`

const dest = resolve(here, 'public/anatomy-names.ts')
writeFileSync(dest, out, 'utf8')
console.log(`wrote ${dest}: ${Object.keys(data).length} species, ${total} components`)
