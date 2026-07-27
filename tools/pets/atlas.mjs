/**
 * What the cube pets actually do for colour.
 *
 * Phase 3 item 5, the autopsy — kept as a script rather than written down once
 * and trusted, because it is a set of facts about 24 binary files plus a PNG,
 * and facts about files that nothing checks are facts that go stale the first
 * time someone re-exports the art. Same reasoning as the coast test.
 *
 *   node tools/pets/atlas.mjs
 *
 * The finding it produces is recorded in HANDOFF §6. In short: one material
 * per pet, one shared texture, no vertex colours and no baseColorFactor — so
 * colour is entirely a texture lookup, and every pet samples a handful of
 * vertical COLUMNS of `colormap.png`, using v to pick a shade down a gradient.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decodePng } from './png.mjs'
import { RESERVE, RESERVE_X, inReserve, reserveDrift } from './reserve.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const PETS = resolve(here, '../../src/island/public/pets')

/** Anything failing an invariant lands here and turns the exit code red. */
const failures = []
const must = (ok, message) => { if (!ok) failures.push(message); return ok }

/* ------------------------------------------------------------------ glb --- */

function readGlb(path) {
  const buf = readFileSync(path)
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a glb: ' + path)
  const total = buf.readUInt32LE(8)
  let off = 12, json = null, bin = null
  while (off < total) {
    const len = buf.readUInt32LE(off)
    const type = buf.readUInt32LE(off + 4)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8'))
    if (type === 0x004e4942) bin = data
    off += 8 + len + ((4 - (len % 4)) % 4)
  }
  return { json, bin }
}

const SIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const WIDE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }

function uvs(g, bin) {
  const out = []
  for (const mesh of g.meshes ?? []) {
    for (const pr of mesh.primitives ?? []) {
      const i = pr.attributes.TEXCOORD_0
      if (i === undefined) continue
      const acc = g.accessors[i]
      const bv = g.bufferViews[acc.bufferView]
      const size = SIZE[acc.componentType], n = WIDE[acc.type]
      const stride = bv.byteStride ?? size * n
      const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
      for (let k = 0; k < acc.count; k++) {
        out.push([
          bin.readFloatLE(base + k * stride),
          bin.readFloatLE(base + k * stride + size),
        ])
      }
    }
  }
  return out
}

/** Any accessor, as numbers (SCALAR) or tuples. Needed for indices and positions. */
function accessor(g, bin, i) {
  const acc = g.accessors[i]
  const bv = g.bufferViews[acc.bufferView]
  const size = SIZE[acc.componentType], n = WIDE[acc.type]
  const stride = bv.byteStride ?? size * n
  const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
  const read = p => acc.componentType === 5126 ? bin.readFloatLE(p)
    : acc.componentType === 5125 ? bin.readUInt32LE(p)
    : acc.componentType === 5123 ? bin.readUInt16LE(p)
    : bin.readUInt8(p)
  const out = []
  for (let k = 0; k < acc.count; k++) {
    const o = base + k * stride
    if (n === 1) { out.push(read(o)); continue }
    const tuple = []
    for (let c = 0; c < n; c++) tuple.push(read(o + c * size))
    out.push(tuple)
  }
  return out
}

/**
 * Mesh nodes that are EXTREMITIES rather than the animal's coat.
 *
 * Joe: *"for the cow the white should change, not the horns and nose"*, and
 * *"for the bee the yellow should change"*. Both were lost the same way. The
 * pack's dark blue-grey `#4d515f` — its "black" — is the colour of nearly every
 * leg mesh, and its max channel is 95, above SOUL_VALUE, with saturation 0.19,
 * above MARKING_SATURATION. So it qualifies as a base coat, and four legs plus
 * a nose outvoted the animal.
 *
 * A deny-list rather than an allow-list of `body`, so a species whose main mesh
 * is named something unexpected still gets a vote. Measured across the pack the
 * only mesh node names are body, Group, leg-*, wing-* and tail.
 */
const EXTREMITY = /^(leg|wing|tail)/

/**
 * Every coat triangle, with the area it covers and the UVs of its corners.
 *
 * Node scale is accumulated down the tree, because the parts carry their own
 * transforms and an area comparison between differently-scaled nodes is
 * otherwise meaningless.
 */
function coatTriangles(g, bin) {
  const out = []
  const walk = (i, s) => {
    const node = g.nodes[i]
    const ns = node.scale
      ? [s[0] * node.scale[0], s[1] * node.scale[1], s[2] * node.scale[2]] : s
    if (node.mesh !== undefined && !EXTREMITY.test(node.name ?? '')) {
      for (const pr of g.meshes[node.mesh].primitives ?? []) {
        if (pr.attributes.TEXCOORD_0 === undefined || pr.indices === undefined) continue
        const uv = accessor(g, bin, pr.attributes.TEXCOORD_0)
        const po = accessor(g, bin, pr.attributes.POSITION)
        const ix = accessor(g, bin, pr.indices)
        for (let k = 0; k + 2 < ix.length; k += 3) {
          const c = [ix[k], ix[k + 1], ix[k + 2]]
          const p = c.map(v => [po[v][0] * ns[0], po[v][1] * ns[1], po[v][2] * ns[2]])
          const e1 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]]
          const e2 = [p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]]
          const area = 0.5 * Math.hypot(
            e1[1] * e2[2] - e1[2] * e2[1],
            e1[2] * e2[0] - e1[0] * e2[2],
            e1[0] * e2[1] - e1[1] * e2[0])
          out.push({ area, uv: c.map(v => uv[v]) })
        }
      }
    }
    for (const child of node.children ?? []) walk(child, ns)
  }
  for (const root of g.scenes?.[0]?.nodes ?? []) walk(root, [1, 1, 1])
  return out
}

/* --------------------------------------------------------------- report --- */

const img = decodePng(join(PETS, 'Textures/colormap.png'))
const hex = (x, y) => {
  const o = y * img.stride + x * img.bpp
  return '#' + [img.px[o], img.px[o + 1], img.px[o + 2]]
    .map(v => v.toString(16).padStart(2, '0')).join('')
}

const files = readdirSync(PETS).filter(f => f.endsWith('.glb')).sort()
const materials = new Set(), attrs = new Set(), images = new Set()
let withFactor = 0, withVertexColour = 0
const columns = new Map()
const perPet = new Map()

for (const f of files) {
  const { json: g, bin } = readGlb(join(PETS, f))
  for (const m of g.materials ?? []) {
    materials.add(m.name)
    if (m.pbrMetallicRoughness?.baseColorFactor) withFactor++
  }
  for (const i of g.images ?? []) images.add(i.uri ?? i.mimeType)
  for (const mesh of g.meshes ?? []) {
    for (const pr of mesh.primitives ?? []) {
      const keys = Object.keys(pr.attributes)
      attrs.add(keys.sort().join('+'))
      if (keys.includes('COLOR_0')) withVertexColour++
    }
  }
  const mine = new Set()
  for (const [u] of uvs(g, bin)) {
    const px = Math.round(u * img.w)
    mine.add(px)
    columns.set(px, (columns.get(px) ?? 0) + 1)
  }
  perPet.set(f.replace('animal-', '').replace('.glb', ''), [...mine].sort((a, b) => a - b))
}

console.log(`colormap.png        ${img.w} x ${img.h}`)
console.log(`species             ${files.length}`)
console.log(`images referenced   ${[...images].join(', ')}`)
console.log(`material names      ${[...materials].join(', ')}`)
console.log(`vertex attributes   ${[...attrs].join(' | ')}`)
console.log(`baseColorFactor     ${withFactor} materials`)
console.log(`COLOR_0 attributes  ${withVertexColour} primitives`)

const cols = [...columns.keys()].sort((a, b) => a - b)
console.log(`\ncolour COLUMNS      ${cols.length}: ${cols.join(' ')}`)

console.log('\ncolumn         used by  top -> bottom of its gradient')
for (const c of cols) {
  const users = [...perPet.entries()].filter(([, list]) => list.includes(c)).map(([n]) => n)
  const x = Math.min(img.w - 1, c)
  console.log(`  u=${String(c).padEnd(5)} ${String(users.length).padStart(2)}/24   `
    + `${hex(x, 140)} -> ${hex(x, 500)}   ${users.slice(0, 6).join(' ')}`
    + (users.length > 6 ? ' …' : ''))
}

console.log('\nper species:')
for (const [name, list] of perPet) console.log('  ' + name.padEnd(13) + list.join(' '))

/*
 * The constraint that decides the whole variant engine. Brief §5: "the face
 * decal (the soul) stays constant per species." If a column is used by every
 * species it is not a coat colour, it is the face — and a set recolour must
 * leave it alone.
 */
const universal = cols.filter(c => columns.size && [...perPet.values()].every(l => l.includes(c)))
console.log(`\ncolumns used by EVERY species: ${universal.join(' ')}`)
console.log('  -> these are the face and eyes. A set recolour must not touch them.')
console.log(`columns free to recolour:      ${cols.filter(c => !universal.includes(c)).join(' ')}`)

/*
 * The precise version of the same constraint.
 *
 * Columns are too coarse: u=112 spans several colour bands, so "preserve the
 * column" would freeze coat colours as well as the face. What actually has to
 * stay constant is the set of TEXELS every species samples — by definition
 * those cannot be any one animal's coat, and they are what the face decal and
 * the eyes are made of.
 */
const texelsPerPet = new Map()
for (const f of files) {
  const { json: g, bin } = readGlb(join(PETS, f))
  const mine = new Set()
  for (const [u, v] of uvs(g, bin)) {
    const x = Math.min(img.w - 1, Math.max(0, Math.round(u * img.w - 0.5)))
    const y = Math.min(img.h - 1, Math.max(0, Math.round(v * img.h - 0.5)))
    mine.add(x + ',' + y)
  }
  texelsPerPet.set(f, mine)
}

const lists = [...texelsPerPet.values()]
const shared = [...lists[0]].filter(t => lists.every(s => s.has(t)))
const every = new Set()
for (const s of lists) for (const t of s) every.add(t)

console.log(`\ntexels sampled, all species: ${every.size}`)
console.log(`texels sampled by EVERY species: ${shared.length}`)
/*
 * Zero, and that is the finding rather than a fault in the count.
 *
 * The face is not a shared decal in the atlas. Every species draws its dark
 * features from the same COLUMN (u=496) but at its own row, so no single texel
 * is common to all 24. "Preserve the shared texels" therefore cannot be the
 * rule — and nor can "preserve a column", because u=112 carries eye-whites and
 * coat colours together.
 *
 * What separates the soul from the coat is SATURATION. Eyes and facial
 * features are black, near-black and white; coats are chromatic. So the rule
 * is a property of the pixel, not of where it sits.
 */
const rgbOf = t => {
  const [x, y] = t.split(',').map(Number)
  const o = y * img.stride + x * img.bpp
  return [img.px[o], img.px[o + 1], img.px[o + 2]]
}
const satOf = ([r, g, b]) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  return mx === 0 ? 0 : (mx - mn) / mx
}

const all = [...every]
let achromatic = 0, muted = 0, chromatic = 0, nearBlack = 0
for (const t of all) {
  const c = rgbOf(t)
  const s = satOf(c)
  if (s < 0.10) achromatic++
  else if (s < 0.25) muted++
  else chromatic++
  if (Math.max(...c) < 90) nearBlack++
}
const pct = n => `${String(n).padStart(3)}  ${(100 * n / all.length).toFixed(0)}%`
console.log(`\nsaturation of the ${all.length} sampled texels:`)
console.log(`  achromatic (<0.10)   ${pct(achromatic)}`)
console.log(`  muted (0.10-0.25)    ${pct(muted)}`)
console.log(`  chromatic (>0.25)    ${pct(chromatic)}`)
console.log(`  near-black (max<90)  ${pct(nearBlack)}`)
console.log('\n-> a set recolour shifts the chromatic texels and leaves the')
console.log('   achromatic ones alone: the eyes and the face stay put.')

/* ------------------------------------------------------- the base table --- */

/**
 * Which colours are each species' BASE COAT, written out for the recolourer.
 *
 * Joe: "for pig, polar bear, penguin, goat and panda, you picked the wrong
 * base colour to change." He is right, and the cause is structural: the first
 * version decided base-versus-marking per ATLAS BAND, and a band is shared by
 * up to 23 species. The vote is therefore won by whatever most species use it
 * for, and the pale, monochrome animals — the pig, the polar bear, the
 * penguin, the goat, the panda — lose it every time. Their coat gets treated
 * as somebody else's marking.
 *
 * A base coat is a fact about an ANIMAL, so it has to be decided from that
 * animal's own colours. That cannot be done at runtime — it needs the UVs out
 * of the .glb — so it is computed here and shipped as data.
 *
 * The rule per species: take the colours its coat meshes actually sample,
 * weight them by the SURFACE AREA that samples them, and call the largest
 * similar-colour cluster the base. Everything else is a marking and is left
 * alone.
 *
 * AREA, not vertex count, and that is Joe's second correction to this table:
 * *"panda — the white should change, not the black"*, *"bee — the yellow should
 * change"*. Counting vertices values fiddly detail over broad coat: a panda's
 * white torso is a handful of large quads while its black ears and eye patches
 * are many small faces, so black won 798 to 128 on a bear that is mostly white.
 * By area the panda comes out 66% pale, the bee 53% yellow, the cow 86% pale,
 * and the penguin stays 74% dark — which is right, a penguin's coat IS the dark
 * part.
 */
const HUE_TOL = 40
const PALE = 0.12

function baseColoursFor(file) {
  const { json: g, bin } = readGlb(join(PETS, file))
  const tally = new Map()
  for (const { area, uv } of coatTriangles(g, bin)) {
    for (const [u, v] of uv) {
      const x = Math.min(img.w - 1, Math.max(0, Math.round(u * img.w - 0.5)))
      const y = Math.min(img.h - 1, Math.max(0, Math.round(v * img.h - 0.5)))
      const o = y * img.stride + x * img.bpp
      const c = [img.px[o], img.px[o + 1], img.px[o + 2]]
      if (Math.max(...c) < 78) continue                // soul: never a coat
      const key = c.join(',')
      tally.set(key, (tally.get(key) ?? 0) + area / 3)
    }
  }

  const hsv = ([r, g2, b]) => {
    const R = r / 255, G = g2 / 255, B = b / 255
    const mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn
    let h = 0
    if (d) {
      if (mx === R) h = ((G - B) / d) % 6
      else if (mx === G) h = (B - R) / d + 2
      else h = (R - G) / d + 4
      h = (h * 60 + 360) % 360
    }
    return [h, mx === 0 ? 0 : d / mx, mx]
  }

  // Cluster by hue, with all the pale colours as one cluster of their own.
  const clusters = []
  for (const [key, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) {
    const c = key.split(',').map(Number)
    const [h, s] = hsv(c)
    const pale = s < PALE
    let into = clusters.find(cl => cl.pale === pale
      && (pale || Math.abs(((h - cl.hue) % 360 + 540) % 360 - 180) <= HUE_TOL))
    if (!into) { into = { hue: h, pale, weight: 0, keys: [] }; clusters.push(into) }
    into.weight += n
    into.keys.push(key)
  }
  clusters.sort((a, b) => b.weight - a.weight)
  const total = clusters.reduce((s, c) => s + c.weight, 0) || 1
  /*
   * The runner-up comes back too, purely so the report can show the MARGIN. The
   * bee is decided 53% to 46% between its yellow and its black stripes, which is
   * close enough that anyone re-exporting the art wants to see it rather than
   * discover it in the Pet-o-matic.
   */
  return {
    keys: clusters[0] ? clusters[0].keys : [],
    share: clusters[0] ? clusters[0].weight / total : 0,
    runnerUp: clusters[1] ? clusters[1].weight / total : 0,
    label: clusters[0]
      ? (clusters[0].pale ? 'pale' : `hue ${Math.round(clusters[0].hue)}`) : 'none',
  }
}

const table = {}
const picks = new Map()
for (const f of files) {
  const name = f.replace('animal-', '').replace('.glb', '')
  const pick = baseColoursFor(f)
  table[name] = pick.keys
  picks.set(name, pick)
}

const OUT = resolve(here, '../../src/island/variants/species-base.json')
writeFileSync(OUT, JSON.stringify(table, null, 1) + '\n')
console.log('\nwrote species-base.json')
console.log('  species        base            share  next   colours')
for (const [k, v] of Object.entries(table)) {
  const p = picks.get(k)
  const close = p.share - p.runnerUp < 0.15 ? '  <- close' : ''
  console.log('  ' + k.padEnd(15)
    + p.label.padEnd(16)
    + `${(100 * p.share).toFixed(0)}%`.padStart(5)
    + `${(100 * p.runnerUp).toFixed(0)}%`.padStart(6) + '   '
    + String(v.length).padStart(2) + ' colours  ' + v.slice(0, 2).join('  ') + close)
}

/* ================================================================= faces === */

/**
 * THE FACE DECALS, found in the MESH rather than in the texture.
 *
 * Joe: *"penguin pupils should stay black, panda and polar bear and cow white of
 * eye should stay white."* Every earlier attempt looked for that rule in the
 * COLOURS, and no such rule exists — measured, the coat samples the very texels
 * the eyes do, 40.33% of a penguin's surface area drawing from the same pixels
 * as its own pupils. A rule that protects near-achromatic texels freezes 69.74%
 * of a polar bear.
 *
 * The answer was in the geometry the whole time: THE EYES ARE THEIR OWN MESH. In
 * all 24 species the face is a flat sheet floating in front of the head — a
 * separate connected component, mirrored left and right, its area-weighted
 * normal exactly +z. It is not painted onto the head shell, it is stuck on top
 * of it. So a component is a face decal when it is
 *
 *   flat      its bounding box has zero extent in one axis
 *   forward   its area-weighted normal points at +z
 *   front     its centroid is in the front half of the pet
 *   small     it is under FACE_MAX_SHARE of the pet's surface area
 *
 * `flat` and `forward` alone pick out exactly the 63 decals in the pack; `front`
 * and `small` are belt and braces. THE MARGINS ARE NOT TIGHT: decals are flat to
 * 9.15e-9 where the next flattest thing in the pack has an extent of 0.0500, and
 * every decal's normal z is 1.000000 exactly where every planar non-decal's is
 * 0.000000 exactly. The six rejected are the cow's, dog's and giraffe's flank
 * patches — planar, but facing ±x.
 *
 * No colour test anywhere. That is the point.
 */
const PLANAR_EPS = 1e-6
const FORWARD_DOT = 0.9998
const FACE_MAX_SHARE = 0.10

/** Where the cost lands, as a share of each pet's surface area. */
const FACE_SHARE_MIN = 0.010
const FACE_SHARE_MAX = 0.030

/*
 * Full TRS down the tree. `coatTriangles` above accumulates SCALE only, which is
 * enough to compare areas and quite useless for asking which way a face points:
 * a rotated node would report its normal in the wrong frame, and the whole rule
 * turns on that normal.
 */
const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

function mul(a, b) {
  const o = new Array(16).fill(0)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
      o[c * 4 + r] = s
    }
  }
  return o
}

function trs(node) {
  if (node.matrix) return node.matrix.slice()
  const t = node.translation ?? [0, 0, 0]
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1]
  const s = node.scale ?? [1, 1, 1]
  const x2 = x + x, y2 = y + y, z2 = z + z
  const xx = x * x2, xy = x * y2, xz = x * z2
  const yy = y * y2, yz = y * z2, zz = z * z2
  const wx = w * x2, wy = w * y2, wz = w * z2
  return [
    (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
    (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
    (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
    t[0], t[1], t[2], 1,
  ]
}

const xform = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
]

/** Every triangle in world space, tagged with the node and vertices it came from. */
function harvest(g, bin) {
  const tris = []
  const meshNodes = []
  const walk = (i, m) => {
    const node = g.nodes[i]
    const wm = mul(m, trs(node))
    if (node.mesh !== undefined) {
      meshNodes.push({ index: i, name: node.name ?? '', mesh: node.mesh })
      for (const pr of g.meshes[node.mesh].primitives ?? []) {
        if (pr.attributes.TEXCOORD_0 === undefined || pr.indices === undefined) continue
        const uv = accessor(g, bin, pr.attributes.TEXCOORD_0)
        const po = accessor(g, bin, pr.attributes.POSITION)
        const ix = accessor(g, bin, pr.indices)
        for (let k = 0; k + 2 < ix.length; k += 3) {
          const c = [ix[k], ix[k + 1], ix[k + 2]]
          const p = c.map(v => xform(wm, po[v]))
          const e1 = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]]
          const e2 = [p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]]
          const cr = [
            e1[1] * e2[2] - e1[2] * e2[1],
            e1[2] * e2[0] - e1[0] * e2[2],
            e1[0] * e2[1] - e1[1] * e2[0],
          ]
          const len = Math.hypot(...cr) || 1
          tris.push({
            nodeName: node.name ?? '', v: c, world: p,
            centroid: [0, 1, 2].map(d => (p[0][d] + p[1][d] + p[2][d]) / 3),
            area: 0.5 * len,
            normal: cr.map(n => n / len),
            uv: c.map(v => uv[v]),
          })
        }
      }
    }
    for (const child of node.children ?? []) walk(child, wm)
  }
  for (const root of g.scenes?.[0]?.nodes ?? []) walk(root, IDENT)
  return { tris, meshNodes }
}

/** Connected components of the WHOLE pet, welded by quantised world position. */
function componentsOf(tris) {
  const parent = tris.map((_, i) => i)
  const find = a => {
    while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a] }
    return a
  }
  const at = new Map()
  const q = x => Math.round(x * 1e5)
  tris.forEach((t, i) => {
    for (const p of t.world) {
      const k = `${q(p[0])},${q(p[1])},${q(p[2])}`
      if (!at.has(k)) at.set(k, [])
      at.get(k).push(i)
    }
  })
  for (const list of at.values()) {
    for (let i = 1; i < list.length; i++) {
      const ra = find(list[0]), rb = find(list[i])
      if (ra !== rb) parent[ra] = rb
    }
  }
  const groups = new Map()
  tris.forEach((_, i) => {
    const r = find(i)
    if (!groups.has(r)) groups.set(r, [])
    groups.get(r).push(i)
  })
  return [...groups.values()]
}

/**
 * Judge every component of one species.
 *
 * Pet-wide rather than per-node, and that is not cosmetic: the cat carries a
 * 21-triangle whisker decal on a node of its own, where it is the LARGEST
 * component. A per-node size rule lost it, and a rule that is right on 23 of 24
 * species is a rule that has not been checked on 24.
 */
function analyseFaces(file) {
  const { json: g, bin } = readGlb(join(PETS, file))
  const { tris, meshNodes } = harvest(g, bin)
  const total = tris.reduce((s, t) => s + t.area, 0)

  const comps = componentsOf(tris).map(idx => {
    const ts = idx.map(i => tris[i])
    const bb = [[1e9, -1e9], [1e9, -1e9], [1e9, -1e9]]
    let area = 0, nx = 0, ny = 0, nz = 0, cx = 0, cz = 0
    for (const t of ts) {
      area += t.area
      nx += t.normal[0] * t.area; ny += t.normal[1] * t.area; nz += t.normal[2] * t.area
      cx += t.centroid[0] * t.area; cz += t.centroid[2] * t.area
      for (const p of t.world) for (let d = 0; d < 3; d++) {
        bb[d][0] = Math.min(bb[d][0], p[d]); bb[d][1] = Math.max(bb[d][1], p[d])
      }
    }
    const len = Math.hypot(nx, ny, nz) || 1
    const extent = [0, 1, 2].map(d => bb[d][1] - bb[d][0])
    return {
      tris: ts, area, extent,
      centroidX: cx / area, centroidZ: cz / area,
      normal: [nx / len, ny / len, nz / len],
      flatAxis: extent.findIndex(e => e < PLANAR_EPS),
    }
  })

  const zmid = comps.reduce((s, c) => s + c.centroidZ * c.area, 0) / total
  for (const c of comps) {
    c.flat = c.flatAxis >= 0
    c.forward = c.normal[2] >= FORWARD_DOT
    c.front = c.centroidZ > zmid
    c.small = c.area / total < FACE_MAX_SHARE
    c.isFace = c.flat && c.forward && c.front && c.small
  }
  return { g, tris, meshNodes, comps, total }
}

/* ------------------------------------------------------- classify all 24 --- */

const faceTable = {}
const faceCost = []
let planarTotal = 0, decalTotal = 0, faceVertexTotal = 0, rangeTotal = 0
const reserveSources = new Set(RESERVE.keys())

for (const f of files) {
  const name = f.replace('animal-', '').replace('.glb', '')
  const { g, tris, meshNodes, comps, total } = analyseFaces(f)
  const decals = comps.filter(c => c.isFace)
  planarTotal += comps.filter(c => c.flat).length
  decalTotal += decals.length

  /* -- can a vertex be addressed by node name and index at all? ---------- */

  const seen = new Set(), meshes = new Set()
  for (const n of meshNodes) {
    must(n.name !== '', `${name}: an unnamed mesh node`)
    must(!seen.has(n.name), `${name}: two mesh nodes called ${n.name}`)
    seen.add(n.name)
    const prims = (g.meshes[n.mesh].primitives ?? []).length
    must(prims === 1, `${name}: node ${n.name} holds ${prims} primitives`)
    /*
     * Two nodes on one glTF mesh would arrive from GLTFLoader as two Meshes
     * SHARING a BufferGeometry — so patching by name would write one buffer
     * twice, with two different vertex sets. It does not happen; asserted so
     * that it cannot start happening quietly.
     */
    must(!meshes.has(n.mesh), `${name}: two nodes share glTF mesh ${n.mesh}`)
    meshes.add(n.mesh)
  }

  /* -- is the thing we found shaped like a face? ------------------------- */

  must(decals.length >= 2, `${name}: ${decals.length} face decals, expected at least 2`)
  const pair = [...decals].sort((a, b) => b.area - a.area).slice(0, 2)
  if (pair.length === 2) {
    must(Math.abs(pair[0].area - pair[1].area) < 1e-6,
      `${name}: the two largest decals differ in area`)
    must(Math.abs(pair[0].centroidX + pair[1].centroidX) < 1e-4,
      `${name}: the two largest decals are not a mirrored pair`)
  }

  /* -- which vertices move, and where ------------------------------------ */

  const decalTris = new Set()
  for (const c of decals) for (const t of c.tris) decalTris.add(t)

  /** node -> vertex -> destination column. */
  const want = new Map()
  for (const t of decalTris) {
    for (let i = 0; i < 3; i++) {
      const column = Math.round(t.uv[i][0] * img.w)
      must(reserveSources.has(column),
        `${name}: a decal samples column ${column}, which has no reserve`)
      const dst = RESERVE.get(column)
      if (dst === undefined) continue
      if (!want.has(t.nodeName)) want.set(t.nodeName, new Map())
      const mine = want.get(t.nodeName)
      const already = mine.get(t.v[i])
      must(already === undefined || already === dst,
        `${name}: vertex ${t.v[i]} of ${t.nodeName} wanted in two reserved columns`)
      mine.set(t.v[i], dst)
    }
  }

  /*
   * A decal vertex shared with a coat triangle would drag coat into the
   * reserve and freeze it. Zero across the pack — the decals really are
   * separate sheets rather than welded panels.
   */
  for (const t of tris) {
    if (decalTris.has(t)) continue
    const mine = want.get(t.nodeName)
    if (!mine) continue
    for (const v of t.v) {
      must(!mine.has(v), `${name}: vertex ${v} of ${t.nodeName} is on a decal AND the coat`)
    }
  }

  /* -- pack into runs, which is how the runtime wants it ------------------ */

  const perNode = {}
  for (const [node, mine] of want) {
    const byDst = {}
    for (const [v, dst] of [...mine.entries()].sort((a, b) => a[0] - b[0])) {
      const runs = (byDst[dst] ??= [])
      const last = runs[runs.length - 1]
      if (last && last[0] + last[1] === v) last[1]++
      else runs.push([v, 1])
    }
    perNode[node] = byDst
    for (const runs of Object.values(byDst)) rangeTotal += runs.length
  }
  faceTable[name] = perNode
  const verts = [...want.values()].reduce((s, m) => s + m.size, 0)
  faceVertexTotal += verts

  /* -- nothing samples the reserve today --------------------------------- */

  for (const t of tris) {
    for (const [u] of t.uv) {
      must(!inReserve(Math.round(u * img.w - 0.5)),
        `${name}: something already samples the reserved columns`)
    }
  }

  /* -- what it costs ----------------------------------------------------- */

  const texels = new Set()
  for (const t of decalTris) {
    for (const [u, v] of t.uv) {
      texels.add(Math.min(img.w - 1, Math.max(0, Math.round(u * img.w - 0.5)))
        + ',' + Math.min(img.h - 1, Math.max(0, Math.round(v * img.h - 0.5))))
    }
  }
  const share = decals.reduce((s, c) => s + c.area, 0) / total
  must(share > FACE_SHARE_MIN && share < FACE_SHARE_MAX,
    `${name}: face decals are ${(100 * share).toFixed(2)}% of the pet, outside `
    + `${100 * FACE_SHARE_MIN}..${100 * FACE_SHARE_MAX}%`)
  faceCost.push({
    name, decals: decals.length, tris: decalTris.size, verts, share, texels: texels.size,
  })
}

console.log('\n\nFACE DECALS — the geometry a set may never recolour')
console.log(`planar components in the pack   ${planarTotal}`)
console.log(`...judged FACE DECAL            ${decalTotal}`)
console.log(`vertices to re-UV               ${faceVertexTotal} in ${rangeTotal} runs`)
console.log('\nspecies        decals  faceTris  faceVerts  faceArea%  texels')
for (const c of faceCost) {
  console.log('  ' + c.name.padEnd(14)
    + String(c.decals).padStart(6) + String(c.tris).padStart(10)
    + String(c.verts).padStart(11) + (100 * c.share).toFixed(2).padStart(10)
    + String(c.texels).padStart(8))
}
const faceShares = faceCost.map(c => c.share).sort((a, b) => a - b)
console.log(`\nfaceArea% frozen: min ${(100 * faceShares[0]).toFixed(2)}`
  + `  median ${(100 * faceShares[12]).toFixed(2)}`
  + `  max ${(100 * faceShares[faceShares.length - 1]).toFixed(2)}`)
console.log('Compare a COLOUR rule: protecting near-achromatic texels would freeze')
console.log('69.7% of a polar bear and 56.5% of a cow. That is the whole argument.')

/* -- idempotence, played out on a copy of the real UVs ---------------------- */

let firstPass = 0, secondPass = 0
for (const f of files) {
  const name = f.replace('animal-', '').replace('.glb', '')
  const { json: g, bin } = readGlb(join(PETS, f))
  const { tris } = harvest(g, bin)
  const uvOf = new Map()
  for (const t of tris) {
    if (!uvOf.has(t.nodeName)) uvOf.set(t.nodeName, new Map())
    for (let i = 0; i < 3; i++) uvOf.get(t.nodeName).set(t.v[i], t.uv[i][0])
  }
  const apply = () => {
    let n = 0
    for (const [node, byDst] of Object.entries(faceTable[name])) {
      for (const [dst, runs] of Object.entries(byDst)) {
        for (const [first, count] of runs) {
          for (let v = first; v < first + count; v++) {
            if (uvOf.get(node).get(v) === Number(dst) / img.w) continue
            uvOf.get(node).set(v, Number(dst) / img.w)
            n++
          }
        }
      }
    }
    return n
  }
  firstPass += apply()
  secondPass += apply()
}
must(firstPass === faceVertexTotal, `the patch moved ${firstPass}, not ${faceVertexTotal}`)
must(secondPass === 0, `applying the patch twice moved ${secondPass} more vertices`)
console.log(`\nidempotence: first pass moved ${firstPass} UVs, second pass ${secondPass}.`)

/* -- the reserve itself ----------------------------------------------------- */

const drift = reserveDrift(img)
must(drift === 0, `colormap.png's reserve is ${drift} bytes adrift`
  + ' — run `npm run pets:reserve`')
console.log(`reserve x ${RESERVE_X[0]}..${RESERVE_X[1]} of colormap.png: `
  + `${drift} bytes adrift from the swatches it copies.`)

const FACE_OUT = resolve(here, '../../src/island/variants/species-face.json')
writeFileSync(FACE_OUT, JSON.stringify(faceTable) + '\n')
console.log('wrote species-face.json')

if (failures.length) {
  console.error(`\n${failures.length} INVARIANT(S) BROKEN:`)
  for (const f of failures) console.error('  ' + f)
  console.error('\nEither colormap.png has gone stale — `npm run pets:reserve` — or the')
  console.error('art has been re-exported in a way the face-decal rule does not survive.')
  console.error('Fix the rule against the new models rather than shipping berry eyeballs.')
  process.exit(1)
}
console.log('\nall face-decal invariants hold.')
