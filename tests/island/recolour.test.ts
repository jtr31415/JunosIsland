import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isSoul, rgbToHsv, hsvToRgb, shift, isNatural, recolourInto,
  SOUL_SATURATION, SOUL_VALUE,
} from '../../src/island/variants/recolour'

import { SETS, NATURAL, setById, variantKey, totalVariants } from '../../src/island/variants/sets'

/**
 * The rule that protects the pets' faces, tested against the REAL atlas rather
 * than invented pixels. Item 5 measured which texels are soul and which are
 * coat (HANDOFF §6); this is that measurement turned into a guarantee.
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
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8] as number; colour = data[9] as number
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

  it('rotating by a full turn changes nothing', () => {
    const [h, s, v] = rgbToHsv(234, 145, 104)
    expect(hsvToRgb(h + 360, s, v)).toEqual([234, 145, 104])
  })

  it('handles negative hue without producing black', () => {
    expect(hsvToRgb(-30, 1, 1)).not.toEqual([0, 0, 0])
  })
})

describe('isSoul — what a set may never touch', () => {
  it('uses the thresholds item 5 measured', () => {
    // Written down so that moving them is a deliberate act with a failing
    // test attached, rather than a quiet tweak that tints every pet's eyes.
    expect(SOUL_SATURATION).toBe(0.10)
    expect(SOUL_VALUE).toBe(90)
  })

  it('protects black, near-black and white', () => {
    expect(isSoul(0, 0, 0)).toBe(true)
    expect(isSoul(60, 62, 71)).toBe(true)              // the atlas's dark column
    expect(isSoul(248, 248, 250)).toBe(true)           // eye white
  })

  it('leaves a coat colour alone to be recoloured', () => {
    expect(isSoul(234, 145, 104)).toBe(false)          // the commonest brown
    expect(isSoul(255, 152, 50)).toBe(false)           // lion orange
    expect(isSoul(78, 184, 130)).toBe(false)           // caterpillar green
  })

  it('treats a dark but saturated colour as soul', () => {
    // The near-blacks run to about 0.2 saturation. Rotating those tints the
    // pupils and the outlines, which is the one thing that must not move.
    expect(isSoul(20, 25, 40)).toBe(true)
  })
})

describe('against the real colormap.png', () => {
  const img = decode(PNG)
  /*
   * DISTINCT colours, not every pixel. 512x512 x 40 sets is ten million
   * assertions and the first version of this file duly took 44 seconds and
   * then timed out. The atlas holds only a few hundred distinct colours, and
   * the rule under test is a property of a colour rather than of a position.
   */
  const seen = new Map<string, [number, number, number]>()
  for (let i = 0; i < img.px.length; i += img.bpp) {
    const c: [number, number, number] =
      [img.px[i] as number, img.px[i + 1] as number, img.px[i + 2] as number]
    seen.set(c.join(','), c)
  }
  const pixels = [...seen.values()]

  it('the atlas is the size the autopsy found', () => {
    expect(img.w).toBe(512)
    expect(img.h).toBe(512)
  })

  it('leaves every soul pixel of the real atlas untouched, for every set', () => {
    /*
     * The guarantee, stated over the actual art rather than over examples I
     * chose. Brief §5: "the face decal (the soul) stays constant per species."
     */
    const offenders: string[] = []
    for (const set of SETS) {
      for (const [r, g, b] of pixels) {
        if (!isSoul(r, g, b)) continue
        const after = shift(r, g, b, set)
        if (after.join() !== [r, g, b].join()) {
          offenders.push(`${set.id}: ${[r, g, b]} -> ${after}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it('is checking a real number of colours, not an empty list', () => {
    // A guarantee over nothing is not a guarantee. The autopsy counted 710
    // texels the pets sample; the atlas as a whole holds more than that.
    expect(pixels.length).toBeGreaterThan(500)
    expect(pixels.filter(([r, g, b]) => isSoul(r, g, b)).length).toBeGreaterThan(20)
  })

  it('actually changes the coat, for every set except the natural one', () => {
    // A palette that protects the face perfectly by changing nothing at all
    // would pass the test above. This is the other half.
    for (const set of SETS) {
      const coats = pixels.filter(([r, g, b]) => !isSoul(r, g, b))
      const moved = coats.filter(([r, g, b]) =>
        shift(r, g, b, set).join() !== [r, g, b].join()).length
      if (set.id === 'natural') expect(moved).toBe(0)
      else expect(moved / coats.length, `${set.id} barely changed`).toBeGreaterThan(0.9)
    }
  })

  it('keeps the shading gradient rather than flattening it', () => {
    /*
     * The gradient down each atlas column IS the models' shading. Replace
     * brightness instead of scaling it and every pet becomes a cardboard
     * cut-out of itself.
     */
    const set = SETS.find(s => s.id === 'bluebell')!
    const column = 240
    const top = shift(
      img.px[140 * img.stride + column * img.bpp] as number,
      img.px[140 * img.stride + column * img.bpp + 1] as number,
      img.px[140 * img.stride + column * img.bpp + 2] as number, set)
    const bottom = shift(
      img.px[500 * img.stride + column * img.bpp] as number,
      img.px[500 * img.stride + column * img.bpp + 1] as number,
      img.px[500 * img.stride + column * img.bpp + 2] as number, set)
    expect(Math.max(...top)).not.toBe(Math.max(...bottom))
  })
})

describe('the natural set is a no-op, not merely a small one', () => {
  it('is recognised as natural', () => {
    expect(isNatural(NATURAL)).toBe(true)
  })

  it('recolours nothing at all', () => {
    // What makes the golden guarantee possible: the friends she already owns
    // reuse the base texture rather than a recomposited copy of it.
    const buf = new Uint8ClampedArray([234, 145, 104, 255, 61, 63, 75, 255])
    const before = [...buf]
    expect(recolourInto(buf, NATURAL)).toBe(0)
    expect([...buf]).toEqual(before)
  })

  it('and no other set claims to be natural', () => {
    for (const set of SETS.slice(1)) expect(isNatural(set), set.id).toBe(false)
  })
})

describe('recolourInto', () => {
  it('skips fully transparent pixels', () => {
    const buf = new Uint8ClampedArray([234, 145, 104, 0])
    recolourInto(buf, SETS[1] as never)
    expect([...buf]).toEqual([234, 145, 104, 0])
  })

  it('reports how many pixels it moved', () => {
    const buf = new Uint8ClampedArray([234, 145, 104, 255, 0, 0, 0, 255])
    expect(recolourInto(buf, SETS[1] as never)).toBe(1)   // the coat, not the black
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

  it('can be looked up by id', () => {
    expect(setById('berry')?.name).toBe('Berry')
    expect(setById('nope')).toBeUndefined()
  })
})
