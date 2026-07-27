/**
 * The RESERVE: two spare swatch columns of the pet atlas that nothing recolours.
 *
 *   node tools/pets/reserve.mjs           bake it into colormap.png (idempotent)
 *   node tools/pets/reserve.mjs --check   verify only; exit 1 if it has gone stale
 *
 * THE ATLAS IS A GRID OF 32-TEXEL-WIDE FLAT SWATCH COLUMNS. Every row is exactly
 * 16 runs of 32 identical texels, and each of the seven columns any pet samples
 * (48, 112, 176, 240, 304, 432, 496) is the exact centre of one swatch. NINE
 * swatch columns are sampled by nothing at all — 505 of the 512 columns are
 * entirely unsampled.
 *
 * So a reserve is two of those spare columns, holding row-preserving VERBATIM
 * copies of the two swatches the face decals draw from. Point the decal UVs at
 * the copies (see src/island/variants/facedecals.ts) and the recolourer may then
 * rewrite the originals freely: the eye reads a copy nothing touches, the coat
 * reads the original everything touches. That is what lets a polar bear go
 * properly berry while its sclera stays white — the two are separated in UV
 * space, which is possible, rather than in texel space, which is not (the
 * penguin's coat samples 40% of its area from the very texels its pupils use).
 *
 * VERBATIM AND ROW-PRESERVING MATTERS, twice over. Decal triangles span a median
 * 6.3 and up to 91 atlas rows, so the artist's gradient runs ACROSS an eye and a
 * single flat colour would iron it out. And because the copy is a whole 32-wide
 * swatch, the 2x2 neighbourhood a bilinear tap reads at the new UV is
 * byte-identical to the one at the old UV — so "the eyes look exactly as they do
 * now" is provable without modelling the filter or the colour space at all.
 *
 * WHY IT IS BAKED INTO THE SHIPPED PNG rather than painted at runtime. The
 * natural set reuses the base texture untouched — `isNatural` makes `dress`
 * return early, which is what makes the friends Juno already owns bit-identical
 * (brief §19) — so the reserved swatches have to be right in the file the
 * GLTFLoader fetches, or every natural pet whose species happens to share
 * geometry with a dressed one gets the wrong eyes. It costs nothing to do so:
 * the 24,576 texels it overwrites are sampled by NOTHING today, which
 * tools/pets/atlas.mjs asserts from the models rather than assuming.
 *
 * And it is COMMITTED rather than generated during `npm run build`, for the same
 * reason `species-base.json` is: the build must not depend on the .glb files
 * being present and parseable, `vite build` copies `public/` verbatim, and a
 * committed binary is one a reviewer can see change. The cost of committing is
 * that it can go stale, so it does not go unchecked — this script regenerates
 * it, `--check` verifies it, and tests/island/facedecals.test.ts fails the build
 * if the reserved swatches ever stop matching their sources.
 */
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { statSync } from 'node:fs'
import { decodePng, writePng } from './png.mjs'

const here = dirname(fileURLToPath(import.meta.url))
export const ATLAS = resolve(here, '../../src/island/public/pets/Textures/colormap.png')

/** How wide one flat swatch is, measured: every row is 16 runs of 32. */
export const SWATCH = 32

/** source swatch centre -> reserved swatch centre. Both spare columns today. */
export const RESERVE = new Map([
  [112, 336],   // the pale column: eye whites
  [496, 368],   // the dark column: pupils, nostrils, outlines
])

/** The x range the recolourer must leave alone, inclusive. */
export const RESERVE_X = [320, 383]

export const inReserve = x => x >= RESERVE_X[0] && x <= RESERVE_X[1]

/** Copy the source swatches into the reserve, verbatim. Idempotent. */
export function bakeReserve(img) {
  let changed = 0
  for (const [src, dst] of RESERVE) {
    const s0 = src - SWATCH / 2, d0 = dst - SWATCH / 2
    for (let y = 0; y < img.h; y++) {
      for (let i = 0; i < SWATCH; i++) {
        const from = y * img.stride + (s0 + i) * img.bpp
        const to = y * img.stride + (d0 + i) * img.bpp
        for (let c = 0; c < img.bpp; c++) {
          if (img.px[to + c] === img.px[from + c]) continue
          img.px[to + c] = img.px[from + c]
          changed++
        }
      }
    }
  }
  return changed
}

/** How many bytes of the reserve do NOT match the swatch they copy. */
export function reserveDrift(img) {
  let drift = 0
  for (const [src, dst] of RESERVE) {
    const s0 = src - SWATCH / 2, d0 = dst - SWATCH / 2
    for (let y = 0; y < img.h; y++) {
      for (let i = 0; i < SWATCH; i++) {
        const from = y * img.stride + (s0 + i) * img.bpp
        const to = y * img.stride + (d0 + i) * img.bpp
        for (let c = 0; c < img.bpp; c++) if (img.px[to + c] !== img.px[from + c]) drift++
      }
    }
  }
  return drift
}

/* ------------------------------------------------------------------ main --- */

// Run directly, not when atlas.mjs imports the constants. basename rather than
// a file:// URL comparison, which does not survive Windows path separators.
if (basename(process.argv[1] ?? '') === 'reserve.mjs') {
  const check = process.argv.includes('--check')
  const img = decodePng(ATLAS)
  const drift = reserveDrift(img)
  console.log(`colormap.png       ${img.w} x ${img.h}, ${img.bpp} bytes/texel`)
  for (const [src, dst] of RESERVE) {
    console.log(`  reserve          x ${dst - SWATCH / 2}..${dst + SWATCH / 2 - 1}`
      + `  <- x ${src - SWATCH / 2}..${src + SWATCH / 2 - 1}`
      + `   new u = ${dst}/${img.w} = ${(dst / img.w).toFixed(5)}`)
  }
  console.log(`  bytes adrift     ${drift}`)

  if (check) {
    if (drift !== 0) {
      console.error('\nthe reserved swatches no longer match their sources.')
      console.error('run `npm run pets:reserve` and commit the result.')
      process.exit(1)
    }
    console.log('\nreserve is current.')
  } else {
    const changed = bakeReserve(img)
    if (changed === 0) console.log('\nalready baked; nothing written.')
    else {
      writePng(ATLAS, img)
      console.log(`\nbaked ${changed} bytes; colormap.png is now`
        + ` ${statSync(ATLAS).size} bytes.`)
    }
  }
}
