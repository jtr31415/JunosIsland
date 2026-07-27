/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { footprintOf, standsInside, firstClear, fitInto, FITS } from '../../src/island/world/props'
import type { Footprint } from '../../src/island/world/props'

/**
 * Joe, playing: "trees are clipping into the larger rock pieces, looks odd."
 *
 * `scatter` ran straight after a tile's big feature was added and knew nothing
 * about it. The feature blocks half a hex; cover starts scattering at 0.18 of
 * one. Roughly the inner half of every tile's undergrowth was planted inside
 * its own rock.
 */
describe('footprintOf', () => {
  it('measures the widest horizontal extent, not the height', () => {
    // A lily pad: wide and flat. Fitting or measuring by height blows it up.
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 1))
    expect(footprintOf(pad)).toBeCloseTo(1, 5)
  })

  it('measures the object AS FITTED, not as authored', () => {
    const tall = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1))
    const before = footprintOf(tall)
    fitInto(tall, ...FITS.cover)
    const after = footprintOf(tall)
    expect(after).toBeLessThan(before)
  })

  it('sees through a transform on the node above the mesh', () => {
    /*
     * Several KayKit models carry their scale on a parent node. Measuring
     * cold reports the wrong size and the correction goes wild — the landmine
     * `fitInto` was written for, and this shares its cause.
     */
    const parent = new THREE.Group()
    const child = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    parent.add(child)
    parent.scale.setScalar(3)
    expect(footprintOf(parent)).toBeCloseTo(1.5, 5)
  })
})

describe('standsInside', () => {
  const rock: Footprint[] = [{ x: 0, z: 0, r: 1 }]

  it('rejects a piece whose footprint overlaps solid scenery', () => {
    expect(standsInside(0.5, 0, 0.3, rock)).toBe(true)
  })

  it('allows a piece that only just touches', () => {
    // Two things next to each other is a wood. Overlap is what reads as a bug.
    expect(standsInside(1.3, 0, 0.3, rock)).toBe(false)
  })

  it('accounts for the size of the piece being placed, not just the obstacle', () => {
    // Same centre, different piece: a pebble clears where a bush does not.
    expect(standsInside(1.2, 0, 0.1, rock)).toBe(false)
    expect(standsInside(1.2, 0, 0.5, rock)).toBe(true)
  })

  it('measures in the ground plane, ignoring height', () => {
    // A tree is not clear of a boulder by virtue of being taller than it.
    expect(standsInside(0, 0, 0.2, rock)).toBe(true)
  })

  it('is clear when there is nothing there', () => {
    expect(standsInside(0, 0, 5, [])).toBe(false)
  })

  it('checks every obstacle, not just the first', () => {
    const many: Footprint[] = [
      { x: -5, z: 0, r: 1 }, { x: 5, z: 0, r: 1 }, { x: 0, z: 5, r: 1 },
    ]
    expect(standsInside(0, 4.5, 0.2, many)).toBe(true)
    expect(standsInside(0, 0, 0.2, many)).toBe(false)
  })
})

describe('firstClear — where a piece actually ends up', () => {
  const nowhereSolid: Footprint[] = []
  const anywhere = (): boolean => true

  it('keeps a piece exactly where it was when nothing is in the way', () => {
    /*
     * The reason attempt zero reproduces the old derivation. Fixing the
     * clipping must not rearrange an island that was already fine — the same
     * hex grows the same thing in the same place, every load.
     */
    const candidates = [{ x: 1, z: 1 }, { x: 2, z: 2 }, { x: 3, z: 3 }]
    expect(firstClear(candidates, 0.1, anywhere, nowhereSolid)).toEqual({ x: 1, z: 1 })
  })

  it('moves on to the next spot when the first is inside a rock', () => {
    const rock: Footprint[] = [{ x: 1, z: 1, r: 0.5 }]
    const candidates = [{ x: 1, z: 1 }, { x: 5, z: 5 }]
    expect(firstClear(candidates, 0.1, anywhere, rock)).toEqual({ x: 5, z: 5 })
  })

  it('plants nothing rather than plant inside something', () => {
    // The whole point. A barer tile beats a tree growing out of a boulder.
    const boulder: Footprint[] = [{ x: 0, z: 0, r: 10 }]
    const candidates = [{ x: 1, z: 1 }, { x: 2, z: 2 }, { x: 3, z: 3 }]
    expect(firstClear(candidates, 0.1, anywhere, boulder)).toBeNull()
  })

  it('still refuses ground the piece is not allowed on', () => {
    // Tufts over the sea used to float. The keep-out rule must not smuggle
    // them back in by accepting a spot merely because nothing solid is there.
    const onlyFarSide = (x: number): boolean => x > 2
    const candidates = [{ x: 1, z: 0 }, { x: 3, z: 0 }]
    expect(firstClear(candidates, 0.1, onlyFarSide, nowhereSolid)).toEqual({ x: 3, z: 0 })
  })

  it('applies both rules, not whichever it checks first', () => {
    const onlyFarSide = (x: number): boolean => x > 2
    const rock: Footprint[] = [{ x: 3, z: 0, r: 0.5 }]
    const candidates = [{ x: 1, z: 0 }, { x: 3, z: 0 }, { x: 9, z: 0 }]
    expect(firstClear(candidates, 0.1, onlyFarSide, rock)).toEqual({ x: 9, z: 0 })
  })
})
