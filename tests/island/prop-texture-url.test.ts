import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolvePropTextureUrl } from '../../src/island/world/props'

/*
 * PB-014. All 37 props/*.gltf declare a texture the props folder does not
 * ship, so every prop load used to 404. Harmless to the render and fatal to
 * the console, which is a debugging tool — it cost two agents their time
 * before it was written down.
 *
 * These tests guard the fix from both sides: that the missing name is
 * intercepted, and that the fix stays narrow. The second half matters more.
 * A URL modifier is a blunt instrument sitting in front of every fetch the
 * prop loader makes, and the danger is not that it misses — it is that it
 * swallows a texture that really exists and turns a visible bug into an
 * invisible one.
 */
describe('PB-014 — the prop atlas that was never there', () => {
  const PROPS = 'src/island/public/props'

  it('intercepts the name the glTFs ask for, and returns something decodable', () => {
    const out = resolvePropTextureUrl('/props/hexagons_medieval.png')
    expect(out.startsWith('data:image/png;base64,')).toBe(true)
    // Not merely a data URI — an actual PNG. The magic number is the cheapest
    // proof that a decoder will accept it rather than warn in place of the 404.
    const bytes = Buffer.from(out.split(',')[1] ?? '', 'base64')
    expect([...bytes.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47])
  })

  it('leaves every file that DOES exist alone', () => {
    // Read the folder rather than listing names here, so a texture added later
    // is covered without anyone remembering to come back.
    for (const f of readdirSync(PROPS).filter(f => f.endsWith('.png'))) {
      const url = `/props/${f}`
      expect(resolvePropTextureUrl(url), f).toBe(url)
    }
  })

  it('leaves the tiles atlas of the same name alone', () => {
    // tiles/hexagons_medieval.png is a real file and a DIFFERENT texture. An
    // endsWith on the bare filename would have eaten it.
    const url = '/tiles/hexagons_medieval.png'
    expect(resolvePropTextureUrl(url)).toBe(url)
  })

  it('still describes the repo: the props folder lacks the file, tiles has it', () => {
    // If someone ever ships props/hexagons_medieval.png, this fix becomes dead
    // weight and should be deleted rather than left to confuse. This is the
    // test that says so.
    const props = readdirSync(PROPS)
    expect(props).not.toContain('hexagons_medieval.png')
    expect(props).toContain('hexagons_medieval_Summer.png')
    expect(readdirSync('src/island/public/tiles')).toContain('hexagons_medieval.png')
  })

  it('every prop glTF really does ask for the missing name', () => {
    // The premise of the whole fix, checked rather than believed.
    const gltfs = readdirSync(PROPS).filter(f => f.endsWith('.gltf'))
    expect(gltfs.length).toBeGreaterThan(0)
    for (const f of gltfs) {
      const doc = JSON.parse(readFileSync(`${PROPS}/${f}`, 'utf8'))
      const uris = (doc.images ?? []).map((i: { uri: string }) => i.uri)
      expect(uris, f).toContain('hexagons_medieval.png')
    }
  })
})
