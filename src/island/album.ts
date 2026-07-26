/**
 * The album: every friend read home, with the name she gave them.
 *
 * Pets are never lost or taken (brief section 5), so this is a record of
 * ownership, not a checklist. There are no locked slots, no percentages and
 * nothing to complete — an empty album says "your friends will appear here",
 * never "you are missing 23".
 *
 * Portraits are RENDERED from the live models rather than drawn: hand-drawn
 * art for a 768-variant space is impossible and would drift from the models
 * the moment either changed. Same code path will feed the Pet-o-matic.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { flattenImported } from './lighting'
import type { Pet } from './flow'

/** One offscreen renderer, reused for every portrait. */
function createPortraitRenderer(size = 192): {
  shoot(species: string): Promise<string>
} {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(size, size)
  renderer.setPixelRatio(1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  // Same three-light temperament as the island, so portraits match the world.
  const hemi = new THREE.HemisphereLight(0xbfe3ff, 0xffd9a0, 1.1)
  const key = new THREE.DirectionalLight(0xffe3b3, 1.9)
  key.position.set(3, 5, 4)
  scene.add(hemi, key)

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
  const loader = new GLTFLoader()
  const cache = new Map<string, string>()

  return {
    async shoot(species) {
      const hit = cache.get(species)
      if (hit) return hit

      const gltf = await loader.loadAsync(`pets/${species}.glb`)
      flattenImported(gltf.scene)
      const model = gltf.scene

      // Frame the model from its own bounds, so every species fills the
      // portrait the same amount whatever its actual size.
      const bounds = new THREE.Box3().setFromObject(model)
      const centre = bounds.getCenter(new THREE.Vector3())
      const radius = bounds.getSize(new THREE.Vector3()).length() / 2
      model.position.sub(centre)
      model.rotation.y = Math.PI * 0.18        // three-quarter view, not flat-on

      scene.add(model)
      camera.position.set(0, radius * 0.35, radius * 3.1)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
      const url = renderer.domElement.toDataURL('image/png')
      scene.remove(model)

      cache.set(species, url)
      return url
    },
  }
}

export interface Album {
  open(pets: readonly Pet[]): void
  close(): void
  isOpen(): boolean
}

export function createAlbum(root: HTMLElement, onClose?: () => void): Album {
  const layer = document.createElement('div')
  layer.className = 'album hide'

  const card = document.createElement('div')
  card.className = 'chunk album-card'

  const title = document.createElement('h2')
  title.className = 'album-title'

  const grid = document.createElement('div')
  grid.className = 'album-grid'

  const shut = document.createElement('button')
  shut.className = 'chunk chunk-button album-close'
  shut.textContent = '\u2715'
  shut.setAttribute('aria-label', 'close the album')

  card.append(shut, title, grid)
  layer.append(card)
  root.append(layer)

  const portraits = createPortraitRenderer()

  const hide = (): void => {
    layer.classList.add('hide')
    onClose?.()
  }
  shut.onclick = hide
  layer.onclick = e => { if (e.target === layer) hide() }

  return {
    open(pets) {
      title.textContent = pets.length === 1
        ? '1 friend has come home'
        : `${pets.length} friends have come home`
      if (pets.length === 0) title.textContent = 'Your friends will appear here'

      grid.replaceChildren()
      for (const pet of pets) {
        const cell = document.createElement('div')
        cell.className = 'chunk album-cell'

        const img = document.createElement('img')
        img.className = 'album-portrait'
        img.alt = pet.name
        cell.append(img)

        const name = document.createElement('span')
        name.className = 'album-name'
        name.textContent = pet.name
        cell.append(name)

        // Tapping a friend says their name — the name is the point.
        cell.onclick = () => {
          const utter = new SpeechSynthesisUtterance(pet.name)
          utter.rate = 0.85
          try { window.speechSynthesis.speak(utter) } catch { /* no voice, no drama */ }
        }

        grid.append(cell)
        void portraits.shoot(pet.species).then(url => { img.src = url })
      }
      layer.classList.remove('hide')
    },

    close: hide,
    isOpen: () => !layer.classList.contains('hide'),
  }
}
