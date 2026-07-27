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
import { inflateSync } from 'node:zlib'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const PETS = resolve(here, '../../src/island/public/pets')

/* ------------------------------------------------------------------ png --- */

function decodePng(path) {
  const buf = readFileSync(path)
  let off = 8, w = 0, h = 0, depth = 0, colour = 0
  const idat = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; colour = data[9]
    }
    if (type === 'IDAT') idat.push(data)
    if (type === 'IEND') break
    off += 12 + len
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colour]
  const raw = inflateSync(Buffer.concat(idat))
  const bpp = channels * (depth / 8)
  const stride = w * bpp
  const px = Buffer.alloc(h * stride)
  let p = 0
  for (let y = 0; y < h; y++) {
    const f = raw[p++]
    const line = raw.subarray(p, p + stride); p += stride
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride)
    const cur = px.subarray(y * stride, (y + 1) * stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0
      const b = prev[x]
      const c = x >= bpp ? prev[x - bpp] : 0
      let v = line[x]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) {
        const q = a + b - c
        const pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c)
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
      }
      cur[x] = v & 0xff
    }
  }
  return { w, h, bpp, stride, px }
}

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
