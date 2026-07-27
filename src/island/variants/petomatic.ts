/**
 * The Pet-o-matic: every creature, on a turntable, for Joe's veto pass.
 *
 * Phase 3 item 6's acceptance — all forty sets × twenty-four species
 * enumerable and keyboard-pageable. Palettes are mine to design per the brief
 * and are therefore a proposal; this is the surface on which they get judged
 * and rejected.
 *
 * It uses the REAL lighting rig rather than a convenient white studio, because
 * a palette judged under different light is a palette judged wrongly — these
 * colours have to work under the same three lights and the same tone mapping
 * that the island uses, or the veto means nothing.
 *
 * A dev page: preview channel only, behind the `petOMatic` flag. It never
 * loads in production.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createLighting, flattenImported } from '../lighting'
import type { LightingPreset } from '../lighting'
import { SETS } from './sets'
import { createSetAtlas } from './atlas'

/** Six across, four down: 24 species on one screen, all turning. */
const COLUMNS = 6
const SPACING = 1.15

export async function runPetOMatic(
  canvas: HTMLCanvasElement, species: readonly string[], preset: LightingPreset,
  base = '',
): Promise<void> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const scene = new THREE.Scene()
  const lighting = createLighting(renderer, preset)
  lighting.attach(scene, true)

  const rows = Math.ceil(species.length / COLUMNS)
  const camera = new THREE.PerspectiveCamera(
    32, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, rows * SPACING * 0.9, rows * SPACING * 2.4)
  camera.lookAt(0, 0, 0)

  const loader = new GLTFLoader()
  const atlas = createSetAtlas(base)

  /** One turntable per species, laid out in a grid centred on the origin. */
  const stands: THREE.Object3D[] = []
  await Promise.all(species.map(async (name, i) => {
    const gltf = await loader.loadAsync(`${base}pets/${name}.glb`)
    const pet = gltf.scene
    flattenImported(pet)
    pet.scale.setScalar(0.5)

    const stand = new THREE.Group()
    stand.add(pet)
    stand.position.set(
      ((i % COLUMNS) - (COLUMNS - 1) / 2) * SPACING,
      0,
      (Math.floor(i / COLUMNS) - (rows - 1) / 2) * SPACING,
    )
    stand.name = name
    stands[i] = stand
    scene.add(stand)
  }))

  /* ------------------------------------------------------------ paging --- */

  let at = 0
  /*
   * At the TOP, large, and impossible to miss.
   *
   * The first version was a thin strip along the bottom and Joe reported not
   * finding the names at all — which makes the whole page useless for judging
   * them, since a set is a name as much as a colour.
   */
  const caption = document.createElement('div')
  caption.style.cssText = [
    'position:fixed', 'left:0', 'right:0', 'top:0', 'padding:14px 18px 16px',
    'font:700 30px/1.15 ui-rounded,system-ui,sans-serif', 'color:#fff',
    'background:linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,0))',
    'text-align:center', 'z-index:99', 'pointer-events:none',
    'text-shadow:0 2px 6px rgba(0,0,0,.8)',
  ].join(';')
  const detail = document.createElement('div')
  detail.style.cssText = 'font:600 15px/1.5 ui-rounded,system-ui,sans-serif;opacity:.9'
  caption.append(detail)
  document.body.append(caption)

  /** Which animal is where, since the grid is not labelled. */
  const legend = document.createElement('div')
  legend.style.cssText = [
    'position:fixed', 'left:0', 'right:0', 'bottom:0', 'padding:8px 14px',
    'font:500 12px/1.5 ui-monospace,monospace', 'color:#fff',
    'background:rgba(0,0,0,.6)', 'text-align:center', 'z-index:99',
    'pointer-events:none',
  ].join(';')
  legend.textContent = species
    .map(s => s.replace('animal-', ''))
    .reduce<string[]>((rows, name, i) => {
      const row = Math.floor(i / COLUMNS)
      rows[row] = (rows[row] ?? '') + name.padEnd(13)
      return rows
    }, [])
    .join('   |   ')
  document.body.append(legend)

  async function show(index: number): Promise<void> {
    at = (index + SETS.length) % SETS.length
    const set = SETS[at] as typeof SETS[number]
    await Promise.all(stands.map((stand, i) =>
      stand ? atlas.dress(stand, set.id, species[i] as string) : Promise.resolve()))
    caption.firstChild?.remove()
    caption.prepend(`${set.name}`)
    detail.textContent =
      `set ${at + 1} of ${SETS.length}  ·  id “${set.id}”  ·  `
      + `hue ${set.hue}° · sat ${set.sat} · light ${set.light}  ·  `
      + `${SETS.length * species.length} creatures  ·  `
      + `← → set,  ↑ ↓ ten,  space to stop spinning`
  }

  let spinning = true
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') void show(at + 1)
    else if (e.key === 'ArrowLeft') void show(at - 1)
    else if (e.key === 'ArrowDown') void show(at + 10)
    else if (e.key === 'ArrowUp') void show(at - 10)
    else if (e.key === ' ') { spinning = !spinning; e.preventDefault() }
  })

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight, false)
  })

  await show(0)
  document.getElementById('boot')?.remove()

  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta()
    lighting.update(dt)
    if (spinning) for (const s of stands) if (s) s.rotation.y += dt * 0.6
    renderer.render(scene, camera)
  })
}
