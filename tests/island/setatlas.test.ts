/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { createSetAtlas } from '../../src/island/variants/atlas'
import { NATURAL, SETS } from '../../src/island/variants/sets'
import { isNatural } from '../../src/island/variants/recolour'

/**
 * The sharing rules from HANDOFF §6 — the two ways this engine could quietly
 * break a friend Juno already owns — plus the one the pet GLBs impose.
 */

describe('the natural set is untouched, not merely unchanged', () => {
  it('produces no texture at all', async () => {
    /*
     * The golden guarantee, and why it can be exact rather than a pixel
     * comparison: for the natural set there is nothing to compare, because
     * nothing happens. A pet she already owns keeps the same material and the
     * same texture it had before this engine existed.
     */
    const atlas = createSetAtlas()
    expect(await atlas.texture('natural', 'animal-fox')).toBeNull()
  })

  it('leaves a pet exactly as it found it', async () => {
    const atlas = createSetAtlas()
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ name: 'colormap', side: THREE.DoubleSide }))
    const before = mesh.material
    await atlas.dress(mesh, 'natural', 'animal-fox')
    expect(mesh.material).toBe(before)
  })

  it('is the only set that behaves that way', () => {
    expect(isNatural(NATURAL)).toBe(true)
    for (const set of SETS.slice(1)) expect(isNatural(set), set.id).toBe(false)
  })
})

describe('caching', () => {
  it('hands back the same texture promise for a set asked for twice', () => {
    /*
     * Forty sets is forty 512×512 composites. Building one twice because two
     * pets of a set hatched together is a visible hitch on a mid-range tablet,
     * and would make two textures where the design depends on there being one.
     */
    const atlas = createSetAtlas()
    expect(atlas.texture('berry', 'animal-fox')).toBe(atlas.texture('berry', 'animal-fox'))
  })

  it('treats an unknown set as natural rather than failing', async () => {
    // A save naming a set since removed must not stop her playing.
    const atlas = createSetAtlas()
    expect(await atlas.texture('a-set-that-was-removed', 'animal-fox')).toBeNull()
  })

  it('reports what it has cached', () => {
    const atlas = createSetAtlas()
    void atlas.texture('mint', 'animal-fox')
    void atlas.texture('berry', 'animal-fox')
    expect(atlas.cached().sort()).toEqual(['berry/animal-fox', 'mint/animal-fox'])
  })
})

describe('the material rules the GLBs impose', () => {
  /**
   * A stand-in for a loaded pet. These properties are the ones the real GLBs
   * actually declare, measured in item 5: `doubleSided: true`, metalness 0,
   * and glTF's default roughness of 1.
   */
  function petLike(): { pet: THREE.Group; source: THREE.MeshStandardMaterial } {
    const source = new THREE.MeshStandardMaterial({
      name: 'colormap', side: THREE.DoubleSide, metalness: 0, roughness: 1,
    })
    const pet = new THREE.Group()
    for (const part of ['body', 'head', 'tail']) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), source)
      m.name = part
      pet.add(m)
    }
    return { pet, source }
  }

  /** Dress without waiting on a texture load that jsdom cannot perform. */
  function withTexture(atlas: ReturnType<typeof createSetAtlas>): void {
    vi.spyOn(atlas, 'texture').mockResolvedValue(new THREE.Texture())
  }

  it('keeps doubleSided, which a hand-built material would silently lose', async () => {
    /*
     * The bug this design exists to avoid, found by reading the GLB rather
     * than by seeing it. The pets are doubleSided and a fresh
     * MeshStandardMaterial defaults to FrontSide, so REPLACING the material
     * renders every creature with holes through it — and that reads as broken
     * geometry rather than as a material mistake.
     */
    const { pet } = petLike()
    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(pet, 'berry', 'animal-fox')
    const worn = (pet.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
    expect(worn.side).toBe(THREE.DoubleSide)
    expect(worn.roughness).toBe(1)
    expect(worn.metalness).toBe(0)
  })

  it('changes the map and leaves the source material alone', async () => {
    const { pet, source } = petLike()
    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(pet, 'berry', 'animal-fox')
    const worn = (pet.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
    expect(worn).not.toBe(source)
    expect(worn.map).not.toBe(source.map)
    expect(source.map).toBeNull()
  })

  it('dresses every mesh, not just the first', async () => {
    // A pet is 3 to 7 primitives. Missing one leaves a creature wearing two
    // palettes, which looks like a rendering fault rather than a bug.
    const { pet } = petLike()
    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(pet, 'berry', 'animal-fox')
    pet.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) expect((m.material as THREE.Material).name).toContain('berry')
    })
  })

  it('shares ONE material across every pet of a set and species', async () => {
    /*
     * Not merely tidy: every distinct material is a shader permutation for
     * three.js to manage, and a set can be worn by two dozen creatures at once.
     *
     * Two pets of the SAME species, which is the real case — `pets.ts` caches
     * the loaded GLB and clones it, and a three.js clone shares materials with
     * its original, so both arrive holding the identical source. The cache is
     * keyed on that source, so they come out sharing one dressed material.
     */
    const shared = new THREE.MeshStandardMaterial({
      name: 'colormap', side: THREE.DoubleSide, metalness: 0, roughness: 1,
    })
    const twin = (): THREE.Mesh =>
      new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), shared)
    const a = twin(), b = twin()

    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(a, 'berry', 'animal-fox')
    await atlas.dress(b, 'berry', 'animal-fox')
    expect(a.material).toBe(b.material)
  })

  it('gives different SPECIES their own dressed material', async () => {
    // Different species carry different source materials, so they cannot share
    // a clone — the bound is species x sets, not one per pet, which is what
    // matters.
    const a = petLike()
    const b = petLike()
    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(a.pet, 'berry', 'animal-fox')
    await atlas.dress(b.pet, 'berry', 'animal-bee')
    expect((a.pet.children[0] as THREE.Mesh).material)
      .not.toBe((b.pet.children[0] as THREE.Mesh).material)
  })

  it('does NOT dispose the material it replaces', async () => {
    /*
     * The landmine. What it replaces is the shared natural material, and
     * disposing it breaks every other pet of the natural set — including ones
     * she already owns (brief §19). The rule stage.showTemp already follows.
     */
    const { pet, source } = petLike()
    const spy = vi.spyOn(source, 'dispose')
    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(pet, 'berry', 'animal-fox')
    expect(spy).not.toHaveBeenCalled()
  })

  it('can re-dress a pet that is already dressed', async () => {
    // The Pet-o-matic pages through forty sets on the same models.
    const { pet } = petLike()
    const atlas = createSetAtlas()
    withTexture(atlas)
    await atlas.dress(pet, 'berry', 'animal-fox')
    await atlas.dress(pet, 'mint', 'animal-fox')
    expect(((pet.children[1] as THREE.Mesh).material as THREE.Material).name)
      .toContain('mint')
  })
})
