import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isSoul, rgbToHsv, hsvToRgb, shade, isNatural, recolourInto, regionOf, reserved,
  SOUL_VALUE, BAND, RAMP_LOW, RAMP_HIGH, RESERVE, RESERVE_X0, RESERVE_X1, SWATCH,
} from '../../src/island/variants/recolour'
import { SETS, NATURAL, setById, variantKey, totalVariants } from '../../src/island/variants/sets'
import speciesBase from '../../src/island/variants/species-base.json'

/**
 * The rule that decides what a set may change, tested against the REAL atlas
 * rather than invented pixels.
 */

const here = dirname(fileURLToPath(import.meta.url))
const PNG = resolve(here, '../../src/island/public/pets/Textures/colormap.png')

/** Minimal PNG decode — the same one tools/pets/atlas.mjs uses. */
function decode(path: string): { w: number; h: number; px: Buffer; stride: number; bpp: number } {
  const buf = readFileSync(path)
  let off = 8, w = 0, h = 0, depth = 0, colour = 0
  const idat: Buffer[] = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4)
      depth = data[8] as number; colour = data[9] as number
    }
    if (type === 'IDAT') idat.push(data)
    if (type === 'IEND') break
    off += 12 + len
  }
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[colour] as number
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
      const a = x >= bpp ? (cur[x - bpp] as number) : 0
      const b = prev[x] as number
      const c = x >= bpp ? (prev[x - bpp] as number) : 0
      let v = line[x] as number
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
  return { w, h, px, stride, bpp }
}

describe('hsv round trip', () => {
  it('returns what it was given', () => {
    for (const c of [[0, 0, 0], [255, 255, 255], [234, 145, 104], [61, 63, 75], [255, 152, 50]]) {
      const [r, g, b] = c as [number, number, number]
      const [h, s, v] = rgbToHsv(r, g, b)
      expect(hsvToRgb(h, s, v)).toEqual([r, g, b])
    }
  })

  it('handles negative hue without producing black', () => {
    expect(hsvToRgb(-30, 1, 1)).not.toEqual([0, 0, 0])
  })
})

describe('isSoul — what a set may never touch', () => {
  it('is darkness alone, deliberately', () => {
    // Written down so moving it is a deliberate act with a failing test
    // attached, rather than a quiet tweak that tints every pet's pupils.
    expect(SOUL_VALUE).toBe(78)
  })

  it('protects black and near-black', () => {
    expect(isSoul(0, 0, 0)).toBe(true)
    expect(isSoul(60, 62, 71)).toBe(true)              // the atlas's dark column
    expect(isSoul(20, 25, 40)).toBe(true)
  })

  it('does NOT protect white — the correction that made the sets work', () => {
    /*
     * Joe, from the Pet-o-matic: "the hue never works for all of them, because
     * it only changes one channel and an animal may not have that channel; the
     * polar bear is almost always white."
     *
     * Protecting low saturation protected the polar bear's whole COAT, so it,
     * the panda, the penguin and the elephant sat out every set. Whites are
     * coat now, and the eye-whites go faintly tinted along with them — a
     * forced trade, since these models have no separate face mesh.
     */
    expect(isSoul(248, 248, 250)).toBe(false)
    expect(isSoul(193, 193, 216)).toBe(false)          // polar bear shading
  })

  it('leaves an ordinary coat colour to be recoloured', () => {
    expect(isSoul(234, 145, 104)).toBe(false)          // the commonest brown
    expect(isSoul(255, 152, 50)).toBe(false)           // lion orange
    expect(isSoul(78, 184, 130)).toBe(false)           // caterpillar green
  })
})

describe('against the real colormap.png', () => {
  const img = decode(PNG)

  /** The real atlas as the RGBA buffer recolourInto consumes. */
  const buffer = (): Uint8ClampedArray => {
    const out = new Uint8ClampedArray(img.w * img.h * 4)
    for (let i = 0, j = 0; i < img.px.length; i += img.bpp, j += 4) {
      out[j] = img.px[i] as number
      out[j + 1] = img.px[i + 1] as number
      out[j + 2] = img.px[i + 2] as number
      out[j + 3] = 255
    }
    return out
  }

  it('is the size the autopsy found', () => {
    expect(img.w).toBe(512)
    expect(img.h).toBe(512)
  })

  it('leaves every soul pixel untouched, for every set', () => {
    /*
     * Stated over the actual art rather than over examples I chose. Once
     * whites have to be recolourable, "the face decal stays constant" reduces
     * to the pupils, the nostrils and the outlines — and those must not move.
     */
    const offenders: string[] = []
    for (const set of SETS) {
      const before = buffer()
      const after = buffer()
      recolourInto(after, set, img.w)
      for (let j = 0; j < before.length; j += 4) {
        const r = before[j] as number
        const g = before[j + 1] as number
        const b = before[j + 2] as number
        if (!isSoul(r, g, b)) continue
        if (after[j] !== r || after[j + 1] !== g || after[j + 2] !== b) {
          offenders.push(`${set.id} at pixel ${j / 4}`)
          break
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('changes the base coat for every set except the natural one', () => {
    // A palette that protects the face perfectly by changing nothing at all
    // would pass the test above. This is the other half.
    for (const set of SETS) {
      const before = buffer()
      const after = buffer()
      const moved = recolourInto(after, set, img.w)
      let coats = 0
      for (let j = 0; j < before.length; j += 4) {
        if (!isSoul(before[j] as number, before[j + 1] as number, before[j + 2] as number)) coats++
      }
      if (set.id === 'natural') { expect(moved).toBe(0); continue }
      expect(moved, `${set.id} changed nothing`).toBeGreaterThan(0)
      expect(moved / coats, `${set.id} barely changed`).toBeGreaterThan(0.35)
    }
  })

  it('LEAVES the markings — stripes, bellies, patches', () => {
    /*
     * Joe, on the version that recoloured everything: "it's now applied across
     * the board. Highlights and eyes need to maintain the original colour —
     * tiger stripes, penguin belly, tortoiseshell, panda stripe."
     *
     * Each band keeps the base coat it is mostly made of and recolours only
     * that; a colour far from it in hue, or pale where the base is not, is a
     * marking and survives untouched. Roughly half the atlas is markings, so
     * a set that moved everything would fail here and a set that moved nothing
     * would fail above.
     */
    for (const set of SETS.slice(1)) {
      const before = buffer()
      const after = buffer()
      const moved = recolourInto(after, set, img.w)
      let coats = 0
      for (let j = 0; j < before.length; j += 4) {
        if (!isSoul(before[j] as number, before[j + 1] as number, before[j + 2] as number)) coats++
      }
      expect(coats - moved, `${set.id} kept no markings`).toBeGreaterThan(coats * 0.2)
    }
  })

  it('sends a DARK-coated species to the top of the ramp too', () => {
    /*
     * Joe, on the penguin: "the black should change and is changing, but seems
     * to maintain the underlying black, making any colour change just very
     * dark."
     *
     * The cause was normalising against every atlas pixel inside the region's
     * HUE WINDOW rather than against the species' own colours. A penguin's coat
     * occupies value 0.31–0.39; the window at hue 230 also caught the elephant's
     * pale blue-grey at 0.90, so the penguin sat at t ≈ 0.07 for every set.
     *
     * Stated over the real atlas deliberately: a buffer holding only the
     * penguin's own colours would pass even with the bug, because then the scan
     * range and the species range are the same thing. It takes the whole atlas,
     * with the elephant in it, to show the fault.
     */
    const keys = new Set((speciesBase as Record<string, string[]>)['penguin'])
    expect(keys.size).toBeGreaterThan(0)
    const before = buffer()
    const after = buffer()
    recolourInto(after, setById('sunshine')!, img.w, keys)

    let hi = 0, lo = 1
    for (let j = 0; j < before.length; j += 4) {
      /*
       * The RESERVE is skipped, and skipping it is the point rather than a
       * convenience. It holds a verbatim copy of the dark swatch — so it
       * contains the penguin's own coat colours, deliberately frozen at the
       * value the artist drew, because those copies are what its pupils read.
       * Counting them here would measure the eyes and call them the coat.
       */
      if (reserved((j / 4) % img.w)) continue
      const key = `${before[j]},${before[j + 1]},${before[j + 2]}`
      if (!keys.has(key)) continue
      const v = Math.max(
        after[j] as number, after[j + 1] as number, after[j + 2] as number) / 255
      hi = Math.max(hi, v)
      lo = Math.min(lo, v)
    }
    /*
     * The bar is "clearly coloured", not "reaches the very top". Its coat is
     * centred on the ramp rather than stretched across it, because stretching a
     * 0.086-wide range over a 0.66-wide ramp amplifies the atlas's gradient steps
     * into visible banding — see CONTRAST_REFERENCE. Centred is what fixes Joe's
     * complaint; the whole coat has to sit well clear of the bottom.
     */
    expect(lo).toBeGreaterThan(RAMP_LOW * 1.5)
    expect(hi).toBeGreaterThan(0.62)
  })

  it('keeps the shading rather than flattening it', () => {
    /*
     * The light-to-dark ordering within a band IS the models' shading. Assign
     * one flat colour across a band and every pet becomes a cardboard cut-out
     * of itself.
     */
    const set = setById('bluebell')!
    const after = buffer()
    recolourInto(after, set, img.w)
    const at = (x: number, y: number): number => {
      const j = (y * img.w + x) * 4
      return Math.max(after[j] as number, after[j + 1] as number, after[j + 2] as number)
    }
    expect(at(240, 300)).not.toBe(at(240, 460))
  })
})

describe('the reserve — the two columns a set may never touch', () => {
  /*
   * Joe: *"penguin pupils should stay black, panda and polar bear and cow white
   * of eye should stay white; rest of the animal colouring slice is accepted."*
   *
   * The mechanism is in tools/pets/reserve.mjs and facedecals.ts: the face
   * decals are separate geometry, so their UVs are pointed at a verbatim copy
   * of the swatches they read, and the recolourer leaves that copy alone. This
   * is the recolourer's half — that the copy really is left alone, in every
   * pass, for every set. tests/island/facedecals.test.ts is the other half.
   */
  const img = decode(PNG)
  const buffer = (): Uint8ClampedArray => {
    const out = new Uint8ClampedArray(img.w * img.h * 4)
    for (let i = 0, j = 0; i < img.px.length; i += img.bpp, j += 4) {
      out[j] = img.px[i] as number
      out[j + 1] = img.px[i + 1] as number
      out[j + 2] = img.px[i + 2] as number
      out[j + 3] = 255
    }
    return out
  }

  it('is two whole swatch columns, written down', () => {
    // Moving these is a deliberate act with a failing test attached: the atlas
    // is baked against them and every decal UV in species-face.json points at
    // them.
    expect([RESERVE_X0, RESERVE_X1]).toEqual([320, 383])
    expect(RESERVE.map(([from, to]) => [from, to])).toEqual([[112, 336], [496, 368]])
    for (const [, to] of RESERVE) {
      expect(to - SWATCH / 2).toBeGreaterThanOrEqual(RESERVE_X0)
      expect(to + SWATCH / 2 - 1).toBeLessThanOrEqual(RESERVE_X1)
    }
  })

  it('knows where it starts and stops', () => {
    expect(reserved(RESERVE_X0 - 1)).toBe(false)
    expect(reserved(RESERVE_X0)).toBe(true)
    expect(reserved(RESERVE_X1)).toBe(true)
    expect(reserved(RESERVE_X1 + 1)).toBe(false)
  })

  it('holds a VERBATIM copy of the swatches the eyes read', () => {
    /*
     * The identity argument, and it is what lets "the eyes look exactly as they
     * do now" be proved without modelling the bilinear filter or the colour
     * space at all: the copy is a whole 32-wide swatch, row for row, so the 2×2
     * neighbourhood a tap reads at the new UV is byte-identical to the one it
     * read at the old.
     *
     * Stated over the shipped PNG rather than over the tool, because it is the
     * file the game loads. A re-exported texture that dropped the reserve would
     * fail here rather than in the Pet-o-matic.
     */
    const adrift: string[] = []
    for (const [from, to] of RESERVE) {
      for (let y = 0; y < img.h; y++) {
        for (let i = 0; i < SWATCH; i++) {
          const src = y * img.stride + (from - SWATCH / 2 + i) * img.bpp
          const dst = y * img.stride + (to - SWATCH / 2 + i) * img.bpp
          for (let c = 0; c < img.bpp; c++) {
            if (img.px[dst + c] === img.px[src + c]) continue
            if (adrift.length < 4) adrift.push(`swatch ${from} -> ${to}, row ${y}, byte ${i}.${c}`)
          }
        }
      }
    }
    // Counted rather than asserted per byte: 131,072 expect() calls take four
    // seconds and say no more than one does.
    expect(adrift, 'run `npm run pets:reserve` and commit colormap.png').toEqual([])
  })

  it('comes through every set byte for byte, with and without a base coat', () => {
    /*
     * THE TEST THIS WHOLE CHANGE EXISTS FOR. Both code paths: the species-base
     * path the game uses, and the band-histogram fallback. Without the
     * `reserved()` skips in recolourInto, the reserved eye-whites go berry with
     * everything else and the fix buys nothing at all.
     */
    const penguin = new Set((speciesBase as Record<string, string[]>)['penguin'])
    for (const set of SETS) {
      // `undefined` is the band-histogram fallback, a base set is the path the
      // game takes. Two is the whole space of code paths; a third species would
      // be a third minute of test time saying the same thing.
      for (const base of [undefined, penguin]) {
        const before = buffer()
        const after = buffer()
        recolourInto(after, set, img.w, base)
        for (let y = 0; y < img.h; y++) {
          for (let x = RESERVE_X0; x <= RESERVE_X1; x++) {
            const j = (y * img.w + x) * 4
            if (after[j] === before[j] && after[j + 1] === before[j + 1]
              && after[j + 2] === before[j + 2]) continue
            expect.fail(`${set.id} moved the reserve at ${x},${y}`)
          }
        }
      }
    }
    // Fifty full recolours of a 512×512 image. Given a real budget rather than
    // vitest's five-second default, which it trips under a loaded machine and
    // then reports as a failure of the fix.
  }, 30_000)

  it('keeps the eye-whites WHITE and the pupils BLACK, in every set', () => {
    /*
     * The acceptance criteria in Joe's own terms. Located by MEASURING the
     * reserve rather than by naming rows, so a re-exported texture that moved
     * the gradient could not quietly make this pass by testing nothing: the
     * counts below are asserted non-zero first.
     *
     * The mirror image is asserted too. The very same colours in the UNRESERVED
     * columns 112 and 496 — which is where the coat still reads them — do go
     * berry, and must. That contrast IS the fix: not "whites are protected",
     * which froze half the roster, but "the eyes' copy of the whites is".
     */
    const before = buffer()
    const white: number[] = [], black: number[] = []
    const coatWhite: number[] = []
    for (let y = 0; y < img.h; y++) {
      for (let x = RESERVE_X0; x <= RESERVE_X1; x++) {
        const j = (y * img.w + x) * 4
        const [r, g, b] = [before[j] as number, before[j + 1] as number, before[j + 2] as number]
        if (Math.min(r, g, b) > 230) white.push(j)
        if (isSoul(r, g, b)) black.push(j)
      }
      for (let x = 96; x < 128; x++) {                    // the source swatch
        const j = (y * img.w + x) * 4
        if (Math.min(before[j] as number, before[j + 1] as number,
          before[j + 2] as number) > 230) coatWhite.push(j)
      }
    }
    expect(white.length, 'no eye-whites in the reserve at all').toBeGreaterThan(100)
    expect(black.length, 'no pupils in the reserve at all').toBeGreaterThan(100)
    expect(coatWhite.length).toBe(white.length)

    /*
     * Recoloured as a POLAR BEAR, which is the case that decides it: its coat
     * and its sclera are the same near-white, so this is the one species where
     * the two cannot be told apart by colour and the geometric rule is the only
     * thing doing any work.
     */
    const polar = new Set((speciesBase as Record<string, string[]>)['polar'])
    const spoiled: string[] = []
    for (const set of SETS.slice(1)) {
      const after = buffer()
      recolourInto(after, set, img.w, polar)
      const min = (j: number): number => Math.min(
        after[j] as number, after[j + 1] as number, after[j + 2] as number)
      const max = (j: number): number => Math.max(
        after[j] as number, after[j + 1] as number, after[j + 2] as number)
      const greyed = white.filter(j => min(j) <= 230).length
      const lit = black.filter(j => max(j) >= SOUL_VALUE).length
      const tinted = coatWhite.filter(j => min(j) <= 230).length
      if (greyed) spoiled.push(`${set.id} tinted ${greyed} reserved eye-whites`)
      if (lit) spoiled.push(`${set.id} lightened ${lit} reserved pupils`)
      if (tinted / coatWhite.length <= 0.9) {
        spoiled.push(`${set.id} left the white COAT white — the old bug`)
      }
    }
    expect(spoiled).toEqual([])
  }, 30_000)

  it('and still recolours a whole coat — this is not a trade', () => {
    /*
     * The half that would catch the cheat. A recolourer that protected the eyes
     * by refusing to change anything at all would sail through every test
     * above. So: every atlas pixel outside the reserve that carries one of the
     * polar bear's OWN base-coat colours must move, for every set. The polar
     * bear because it is the animal a colour rule cannot serve — its whole coat
     * is the same near-white as its sclera.
     */
    const keys = new Set((speciesBase as Record<string, string[]>)['polar'])
    for (const set of SETS.slice(1)) {
      const before = buffer()
      const after = buffer()
      recolourInto(after, set, img.w, keys)
      let coat = 0, moved = 0
      for (let j = 0; j < before.length; j += 4) {
        if (reserved((j / 4) % img.w)) continue
        if (!keys.has(`${before[j]},${before[j + 1]},${before[j + 2]}`)) continue
        coat++
        if (after[j] !== before[j] || after[j + 1] !== before[j + 1]
          || after[j + 2] !== before[j + 2]) moved++
      }
      expect(coat, 'no polar bear coat found in the atlas').toBeGreaterThan(100)
      expect(moved, `${set.id} left the polar bear alone`).toBe(coat)
    }
  }, 30_000)
})

describe('every species adapts equally — the correction', () => {
  /*
   * The whole point of normalising, and the thing that was broken. The polar
   * bear's coat is near-white; the fox's is brown. Under a hue rotation the
   * bear moved by nothing at all.
   */
  const berry = setById('cherry')!

  it('sends a coat to the SET’s hue, whatever colour it started', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const [h, s] = rgbToHsv(...shade(t, berry))
      if (s < 0.02) continue                     // too dark to carry a hue
      expect(Math.abs(h - berry.hue)).toBeLessThan(3)
    }
  })

  it('normalises each band separately, which is what shares one texture', () => {
    /*
     * The mechanism that lets ONE texture per set serve all 24 species. Two
     * bands, one of near-whites and one of browns: both must come out
     * spanning the ramp, rather than the whites clustering at the top.
     */
    const width = BAND * 2
    const buf = new Uint8ClampedArray(width * 4)
    for (let x = 0; x < BAND; x++) {
      const j = x * 4
      const v = 200 + (x % 40)                          // a pale, polar-ish band
      buf[j] = v; buf[j + 1] = v; buf[j + 2] = v + 6; buf[j + 3] = 255
    }
    for (let x = BAND; x < width; x++) {
      const j = x * 4
      const v = 90 + ((x - BAND) % 40)                  // a brown, fox-ish band
      buf[j] = v; buf[j + 1] = Math.round(v * 0.6); buf[j + 2] = 40; buf[j + 3] = 255
    }
    recolourInto(buf, berry, width)

    const spread = (from: number, to: number): number => {
      let lo = 255, hi = 0
      for (let x = from; x < to; x++) {
        const v = Math.max(
          buf[x * 4] as number, buf[x * 4 + 1] as number, buf[x * 4 + 2] as number)
        lo = Math.min(lo, v); hi = Math.max(hi, v)
      }
      return hi - lo
    }
    const full = 255 * (RAMP_HIGH - RAMP_LOW)
    expect(spread(0, BAND), 'the pale band must spread too').toBeGreaterThan(full * 0.6)
    expect(spread(BAND, width)).toBeGreaterThan(full * 0.6)
  })

  it('gives a flat band the middle of the ramp, not an end', () => {
    // A species whose coat is one tone has no range to normalise; it should
    // land somewhere sensible rather than at black or white.
    const buf = new Uint8ClampedArray(8)
    buf.set([200, 200, 205, 255, 200, 200, 205, 255])
    recolourInto(buf, berry, 2)
    const v = Math.max(buf[0] as number, buf[1] as number, buf[2] as number) / 255
    expect(v).toBeGreaterThan(RAMP_LOW * 0.9)
    expect(v).toBeLessThan(RAMP_HIGH)
  })
})

describe('which colour a set changes, per species', () => {
  /*
   * Joe's list, from the Pet-o-matic: "panda — the white should change, not the
   * black. bee — the yellow should change. goat [the cow] — the white should
   * change, not the horns and nose. penguin — the black should change."
   *
   * All four were the same fault. The pack's "black" is `#4d515f`, a dark
   * blue-grey whose max channel is 95 (above SOUL_VALUE 78) and whose saturation
   * is 0.19 (above MARKING_SATURATION 0.12) — so it qualifies as a base coat.
   * It is also the colour of nearly every leg mesh. The picker counted VERTICES,
   * so four legs and a nose outvoted the animal: black beat white on the panda
   * 798 to 128.
   *
   * The table is now weighted by SURFACE AREA and ignores the extremity meshes.
   * These expectations are stated over the shipped `species-base.json` rather
   * than over the tool, because it is the file the game reads, and a re-export
   * that quietly moves it should fail here.
   */
  const regionFor = (name: string) => {
    const keys = (speciesBase as Record<string, string[]>)[name]
    expect(keys, `${name} missing from species-base.json`).toBeTruthy()
    const region = regionOf(new Set(keys))
    expect(region, `${name} has no base region`).toBeTruthy()
    return region!
  }

  it('changes the WHITE on the pale black-and-white animals', () => {
    for (const name of ['panda', 'cow', 'polar']) {
      expect(regionFor(name).pale, `${name} should recolour its pale coat`).toBe(true)
    }
  })

  it('changes the YELLOW on the bee, not its stripes', () => {
    const region = regionFor('bee')
    expect(region.pale).toBe(false)
    // Yellow, around 37°, rather than the dark blue-grey at 229° it used to pick.
    expect(region.hue).toBeGreaterThan(20)
    expect(region.hue).toBeLessThan(60)
  })

  it('changes the DARK on the penguin, because that is its coat', () => {
    const region = regionFor('penguin')
    expect(region.pale).toBe(false)
    expect(Math.abs(region.hue - 230)).toBeLessThan(20)
  })

  it('leaves the tiger orange rather than taking its stripes', () => {
    const region = regionFor('tiger')
    expect(region.pale).toBe(false)
    expect(region.hue).toBeGreaterThan(10)
    expect(region.hue).toBeLessThan(45)
  })

  it('records a base coat for every one of the 24 species', () => {
    const table = speciesBase as Record<string, string[]>
    expect(Object.keys(table).length).toBe(24)
    for (const [name, keys] of Object.entries(table)) {
      expect(keys.length, `${name} has no base colours`).toBeGreaterThan(0)
      expect(regionOf(new Set(keys)), name).toBeTruthy()
    }
  })
})

describe('the natural set is a no-op, not merely a small one', () => {
  it('is recognised as natural', () => {
    expect(isNatural(NATURAL)).toBe(true)
  })

  it('recolours nothing at all', () => {
    const buf = new Uint8ClampedArray([234, 145, 104, 255, 61, 63, 75, 255])
    const before = [...buf]
    expect(recolourInto(buf, NATURAL, 2)).toBe(0)
    expect([...buf]).toEqual(before)
  })

  it('and no other set claims to be natural', () => {
    for (const set of SETS.slice(1)) expect(isNatural(set), set.id).toBe(false)
  })
})

describe('recolourInto', () => {
  it('skips fully transparent pixels', () => {
    const buf = new Uint8ClampedArray([234, 145, 104, 0])
    recolourInto(buf, SETS[1] as never, 1)
    expect([...buf]).toEqual([234, 145, 104, 0])
  })

  it('reports how many pixels it moved', () => {
    const buf = new Uint8ClampedArray([234, 145, 104, 255, 0, 0, 0, 255])
    expect(recolourInto(buf, SETS[1] as never, 2)).toBe(1)   // the coat, not the black
  })
})

describe('the set list', () => {
  it('is one natural set plus twelve colours in two patterns', () => {
    expect(SETS.length).toBe(25)
  })

  it('has no spotted sets, because spots are not expressible in this atlas', () => {
    /*
     * Joe reported every dotted set rendering as stripes. Measured: all 15,333
     * triangles in the pack have a u-span of 0.00 atlas pixels, so the checker's
     * x term was constant per triangle and collapsed to a function of y. Pinned
     * here so a third wearing cannot be reintroduced as a palette alone — it
     * needs a positional signal, which this texture does not carry.
     */
    for (const s of SETS) expect(s.pattern, s.id).not.toBe('dotty')
    expect(new Set(SETS.map(s => s.pattern))).toEqual(new Set(['solid', 'stripy']))
  })

  it('has unique ids and unique names', () => {
    expect(new Set(SETS.map(s => s.id)).size).toBe(SETS.length)
    expect(new Set(SETS.map(s => s.name)).size).toBe(SETS.length)
  })

  it('starts with the natural palette, because that is where every island starts', () => {
    expect(SETS[0]?.id).toBe('natural')
  })

  it('gives every other set a real, absolute colour', () => {
    for (const set of SETS.slice(1)) {
      expect(set.sat, set.id).toBeGreaterThan(0)
      expect(set.sat, set.id).toBeLessThanOrEqual(1)
      expect(set.hue, set.id).toBeGreaterThanOrEqual(0)
      expect(set.hue, set.id).toBeLessThan(360)
    }
  })

  it('reaches six hundred creatures across 24 species', () => {
    // Was 888 with the spotted twelve. Item 7's album ladder is 600 long unless
    // a third wearing arrives with a positional signal behind it.
    expect(totalVariants(24)).toBe(600)
  })

  it('has ids that are safe to save and never renamed', () => {
    for (const s of SETS) expect(s.id).toMatch(/^[a-z][a-z0-9]*$/)
  })

  it('keys a creature by set and species, not by index', () => {
    // Inserting a set later must not renumber every creature she owns.
    expect(variantKey({ setId: 'cherry', speciesId: 'animal-fox' })).toBe('cherry/animal-fox')
  })
})
