/**
 * Fitting a model to the space it is allowed.
 *
 * This one rule went wrong three times in an afternoon, each time in a
 * different costume, and each time it looked like a different bug:
 *
 *   - Forest rocks fitted by a fixed scale became boulders taller than the
 *     hexes, because Rock_1 alone spans 0.54 to 4.58 units.
 *   - hills_B fitted by HEIGHT (0.37 tall, 1.47 wide) scaled nearly fourfold
 *     into a tan mesa five hexes across.
 *   - waterlily_A fitted by height (0.02 tall) became a tan disc the size of
 *     a hex, sitting beside every pond.
 *
 * All three are the same mistake: choosing one dimension to fit. The piece
 * has to fit BOTH, so these tests are mostly about the shapes that break a
 * single-dimension rule.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { fitInto, FITS } from '../../src/island/world/props'

/** A box of the given size, sitting on the origin like a real prop. */
function slab(w: number, h: number, d = w): THREE.Object3D {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d))
  mesh.position.y = h / 2
  const holder = new THREE.Group()
  holder.add(mesh)
  return holder
}

/** Measured the way the renderer will see it. */
function sizeOf(o: THREE.Object3D): { w: number; h: number } {
  o.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(o)
  return {
    w: Math.max(box.max.x - box.min.x, box.max.z - box.min.z),
    h: box.max.y - box.min.y,
  }
}

describe('fitInto', () => {
  it('shrinks a tall thin thing until its HEIGHT fits', () => {
    // A tree: height is what binds.
    const tree = slab(0.4, 8)
    fitInto(tree, 1.0, 0.95)
    const s = sizeOf(tree)
    expect(s.h).toBeCloseTo(0.95, 5)
    expect(s.w).toBeLessThanOrEqual(1.0 + 1e-6)
  })

  it('shrinks a flat wide thing until its WIDTH fits', () => {
    /*
     * The lily pad. 0.02 tall and nearly a metre across: fitting to a height
     * of 0.12 would scale it SIX times and produce a disc the size of a hex.
     */
    const lily = slab(0.9, 0.02)
    fitInto(lily, FITS.lily[0], FITS.lily[1])
    const s = sizeOf(lily)
    expect(s.w).toBeCloseTo(FITS.lily[0], 5)
    expect(s.h).toBeLessThan(FITS.lily[1])
    expect(lily.scale.x).toBeLessThan(1)      // shrunk, emphatically not grown
  })

  it('never magnifies a low wide hill to reach a height', () => {
    // hills_B: 1.47 wide, 0.37 tall. Height-fitting scaled it 3.9x.
    const hill = slab(1.47, 0.37)
    fitInto(hill, FITS.big[0], FITS.big[1])
    expect(sizeOf(hill).w).toBeLessThanOrEqual(FITS.big[0] + 1e-6)
    expect(hill.scale.x).toBeLessThan(1.2)
  })

  it('brings wildly different models to a comparable size', () => {
    /*
     * The whole point. Rock_1 spans ninefold within one family, so the
     * smallest and the largest must still end up looking like the same
     * KIND of thing once placed.
     */
    const small = slab(0.5, 0.54)
    const large = slab(3.0, 4.58)
    fitInto(small, FITS.cover[0], FITS.cover[1])
    fitInto(large, FITS.cover[0], FITS.cover[1])
    const a = sizeOf(small), b = sizeOf(large)
    expect(Math.max(a.h, b.h) / Math.min(a.h, b.h)).toBeLessThan(2)
  })

  it('measures through a parent transform rather than trusting stale matrices', () => {
    /*
     * Several KayKit models carry a transform on the node ABOVE the mesh.
     * Box3.setFromObject reads matrixWorld, which is stale for an object that
     * was never added to a scene — measuring cold reported the wrong size and
     * the correction went wild.
     */
    const inner = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    inner.position.y = 0.5
    inner.scale.setScalar(4)               // really 4 units tall
    const holder = new THREE.Group()
    holder.add(inner)

    fitInto(holder, 10, 1)
    expect(sizeOf(holder).h).toBeCloseTo(1, 5)
  })

  it('leaves a degenerate model alone instead of scaling it to infinity', () => {
    // An empty group has no size; dividing by it would produce Infinity and
    // put a NaN through the whole matrix.
    const empty = new THREE.Group()
    fitInto(empty, 1, 1)
    expect(Number.isFinite(empty.scale.x)).toBe(true)
    expect(empty.scale.x).toBe(1)
  })

  it('is idempotent — fitting twice is fitting once', () => {
    // setProgress and sync both re-fit on occasion; a rule that compounded
    // would shrink a piece a little more on every pass.
    const o = slab(2, 6)
    fitInto(o, 1, 0.95)
    const once = o.scale.x
    fitInto(o, 1, 0.95)
    expect(o.scale.x).toBeCloseTo(once, 6)
  })
})
