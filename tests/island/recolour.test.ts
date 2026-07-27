import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isSoul, rgbToHsv, hsvToRgb, shade, isNatural, recolourInto,
  SOUL_VALUE, BAND, RAMP_LOW, RAMP_HIGH,
} from '../../src/island/variants/recolour'
import { SETS, NATURAL, setById, variantKey, totalVariants } from '../../src/island/variants/sets'

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

describe('every species adapts equally — the correction', () => {
  /*
   * The whole point of normalising, and the thing that was broken. The polar
   * bear's coat is near-white; the fox's is brown. Under a hue rotation the
   * bear moved by nothing at all.
   */
  const berry = setById('berry')!

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
  it('is forty sets', () => {
    expect(SETS.length).toBe(40)
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

  it('reaches about a thousand creatures across 24 species', () => {
    expect(totalVariants(24)).toBe(960)
  })

  it('has ids that are safe to save and never renamed', () => {
    for (const s of SETS) expect(s.id).toMatch(/^[a-z][a-z0-9]*$/)
  })

  it('keys a creature by set and species, not by index', () => {
    // Inserting a set later must not renumber every creature she owns.
    expect(variantKey({ setId: 'berry', speciesId: 'animal-fox' })).toBe('berry/animal-fox')
  })
})
