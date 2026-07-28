/**
 * The asset viewer: every species, tile and prop, on a turntable, with the
 * exact ID the code uses printed beside it.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Pet-o-matic's sibling, and it borrows that page's central decision: the REAL
 * lighting rig, not a convenient white studio. A colour judged under different
 * light is judged wrongly, and half of what this surface exists for is
 * judgements about colour — whether a mountain's rock is grey or tan, whether
 * a set palette survives contact with a green island.
 *
 * Every model is loaded through the game's own loader for its kind:
 * `createPropField().load` for scenery, `loadTileModels` for hexes, and the
 * pet path with `wearFaceUVs` and the set atlas for creatures. Not for
 * elegance — because a viewer with its own loader is a viewer that shows Joe
 * something the child will never see.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createLighting, flattenImported } from '../../../src/island/lighting'
import type { LightingPreset } from '../../../src/island/lighting'
import meadowDay from '../../../src/island/lighting/presets/meadow-day.json'
import { createPropField } from '../../../src/island/world/props'
import { loadTileModels } from '../../../src/island/world/tiles'
import type { RenderKind, Season } from '../../../src/island/world/tiles'
import { createSetAtlas } from '../../../src/island/variants/atlas'
import { SETS } from '../../../src/island/variants/sets'
import { wearFaceUVs } from '../../../src/island/variants/facedecals'
import {
  buildCatalogue, tileEntries, incrementSteps, grouped, basenameOf, fileOf,
  type Entry, type Gallery,
} from './registry'

const $ = <T extends HTMLElement>(s: string): T => document.querySelector(s) as T
const say = (t: string, bad = false) => {
  const s = $('#says'); s.textContent = t; s.className = 'meta' + (bad ? ' bad' : '')
}

/* ---------------------------------------------------------------- the scene */

const canvas = $<HTMLCanvasElement>('#stage')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

const scene = new THREE.Scene()
const lighting = createLighting(renderer, meadowDay as LightingPreset)
lighting.attach(scene, true)
/*
 * A neutral mid-dark backdrop, NOT the island's sky.
 *
 * AFTER `attach`, which sets the sky itself — done before, this line was
 * silently overwritten and the page came up pale blue. Black loses the
 * silhouette of anything dark (the panda, the bare trunks, grey rock) and the
 * sky blue tints every colour judgement made here, which is the one thing this
 * page must not do. The LIGHT is the island's; the background is nobody's.
 */
scene.background = new THREE.Color(0x2b2b2b)

const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.08

/** Everything currently on show. Cleared, not hidden — this page loads a lot. */
const stand = new THREE.Group()
scene.add(stand)

function resize(): void {
  const w = canvas.clientWidth || 1
  const h = canvas.clientHeight || 1
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}
new ResizeObserver(resize).observe(canvas)

/**
 * Put the camera where the thing fills the frame, whatever size it is.
 *
 * The assets here span a grass tuft at 0.23 units and a mountain hex at 1.88,
 * so a fixed camera would show one as a speck and clip the other. Framed off
 * the bounding sphere, with the object re-centred on the origin so the
 * turntable spins about its middle rather than about wherever the exporter
 * left it.
 */
function frame(object: THREE.Object3D, pad = 1.6): void {
  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) return
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const centre = box.getCenter(new THREE.Vector3())
  object.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z))

  const dist = (sphere.radius * pad) / Math.sin((camera.fov * Math.PI) / 360)
  controls.target.set(0, sphere.radius * 0.55, 0)
  camera.position.set(dist * 0.55, sphere.radius * 1.25 + dist * 0.4, dist * 0.75)
  camera.near = Math.max(0.01, dist / 200)
  camera.far = dist * 12
  camera.updateProjectionMatrix()
  controls.update()
}

let spinning = true
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta()
  lighting.update(dt)
  if (spinning) stand.rotation.y += dt * 0.5
  controls.update()
  renderer.render(scene, camera)
})

function clearStand(): void {
  for (const child of [...stand.children]) stand.remove(child)
  stand.rotation.y = 0
}

/* ------------------------------------------------------------ the loaders */

/* The game's own, at the same base URL the island uses. */
const props = createPropField('')
const petLoader = new GLTFLoader()
const setAtlas = createSetAtlas('')

/** One cached TileModels per season — six geometries a piece, so not per click. */
const tileModels = new Map<Season, Promise<Awaited<ReturnType<typeof loadTileModels>>>>()
const modelsFor = (season: Season) => {
  const hit = tileModels.get(season)
  if (hit) return hit
  const made = loadTileModels('', season)
  tileModels.set(season, made)
  return made
}

async function loadPet(id: string, setId: string): Promise<THREE.Object3D> {
  const gltf = await petLoader.loadAsync(`pets/${id}.glb`)
  const pet = gltf.scene
  flattenImported(pet)
  /*
   * A fact about the model that must be true before anything looks at it —
   * the same call the Pet-o-matic makes, and for the same reason: this page
   * loads its own GLBs rather than going through the pet field's cache, so
   * without it every face decal is wrong.
   */
  wearFaceUVs(pet, id)
  if (setId) await setAtlas.dress(pet, setId, id)
  return pet
}

async function loadTile(id: string, season: Season): Promise<THREE.Object3D> {
  const models = await modelsFor(season)
  const geometry = models.geometry[id as RenderKind]
  if (!geometry) throw new Error(`no geometry for ${id}`)
  return new THREE.Mesh(geometry, models.material)
}

const loadProp = (id: string, grey: boolean): Promise<THREE.Object3D> => props.load(id, grey)

/* ------------------------------------------------------------ the catalogue */

interface Shown extends Entry { onDisk: boolean; notes: number }

let gallery: Gallery = 'species'
let catalogue: Entry[] = []
let disk: Record<string, string[]> = {}
let notes: Array<{ assetId: string; note: string; at: string }> = []
let picked = ''
/** Bumped on every selection, so a slow load cannot overwrite a newer one. */
let token = 0

const api = async (path: string, body?: unknown) => {
  const res = await fetch(path, body === undefined ? undefined : {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  return res.json()
}

/**
 * What the code names, crossed with what is actually on disk.
 *
 * Both directions matter and neither is a bug on its own. A registry entry
 * with no file is a 404 waiting to happen; a file no table names is either
 * dead weight or an asset nobody remembered to use — `hexagons_medieval.png`
 * cost two agents a day for want of exactly this list.
 */
function shown(): Shown[] {
  const counts = new Map<string, number>()
  for (const n of notes) counts.set(n.assetId, (counts.get(n.assetId) ?? 0) + 1)

  const inGallery = catalogue.filter(e => e.gallery === gallery)
  /* Compared on FILENAME, not ID — see `Entry.file`. The tiles differ. */
  const named = new Set(inGallery.map(e => basenameOf(e.file)))

  const orphans: Entry[] = []
  for (const [pack, files] of Object.entries(disk)) {
    const belongs = gallery === 'species' ? pack === 'pets'
      : gallery === 'tiles' ? pack === 'tiles'
        : pack === 'props' || pack === 'forest'
    if (!belongs) continue
    for (const id of files) {
      if (!named.has(id)) {
        orphans.push({
          id, gallery, group: 'not named by any table', pack: pack as Entry['pack'],
          file: fileOf(id, pack as Entry['pack']), used: [],
        })
      }
    }
  }

  const q = $<HTMLInputElement>('#search').value.trim().toLowerCase()
  return [...inGallery, ...orphans]
    .map(e => ({
      ...e,
      onDisk: (disk[e.pack] ?? []).includes(basenameOf(e.file)),
      notes: counts.get(e.id) ?? 0,
    }))
    .filter(e => !q || e.id.toLowerCase().includes(q) || e.used.join(' ').toLowerCase().includes(q))
}

function drawList(): void {
  const items = shown()
  const list = $('#list')
  list.replaceChildren()

  for (const { group, items: bucket } of grouped(items)) {
    const head = document.createElement('li')
    head.className = 'group'
    head.textContent = `${group} · ${bucket.length}`
    list.append(head)

    for (const e of bucket) {
      const li = document.createElement('li')
      li.className = 'item' + (e.id === picked ? ' on' : '') + (e.onDisk ? '' : ' missing')
      li.textContent = e.id
      li.title = e.onDisk ? e.used.join(', ') : 'no file on disk for this ID'
      if (e.notes) {
        const dot = document.createElement('span')
        dot.className = 'dot'
        dot.textContent = '●'.repeat(Math.min(3, e.notes))
        li.append(dot)
      }
      li.onclick = () => void select(e.id)
      list.append(li)
    }
  }

  const missing = items.filter(e => !e.onDisk).length
  const orphaned = items.filter(e => !e.used.length).length
  $('#count').textContent =
    `${items.length} shown` + (missing ? ` · ${missing} with no file` : '')
    + (orphaned ? ` · ${orphaned} unused` : '')
}

/* -------------------------------------------------------------- selection */

async function select(id: string): Promise<void> {
  picked = id
  drawList()
  drawDetail()

  const mine = ++token
  clearStand()
  say(`loading ${id}…`)
  try {
    const object = await build(id)
    if (mine !== token) return                        // a newer click won
    clearStand()
    stand.add(object)
    frame(object)
    say('')
  } catch (err) {
    if (mine !== token) return
    /* The loader's own message. A 404 here usually means the ID is right and the file is not. */
    say(`${id}: ${(err as Error).message}`, true)
  }
}

function build(id: string): Promise<THREE.Object3D> {
  if (gallery === 'species') return loadPet(id, $<HTMLSelectElement>('#setSelect').value)
  if (gallery === 'tiles') return loadTile(id, $<HTMLSelectElement>('#seasonSelect').value as Season)
  return loadProp(id, $<HTMLInputElement>('#greyToggle').checked)
}

function drawDetail(): void {
  const entry = shown().find(e => e.id === picked)
  $('#assetId').textContent = picked || '—'
  const facts = $('#facts')
  facts.replaceChildren()
  if (!entry) return

  const put = (label: string, value: string) => {
    const dt = document.createElement('dt'); dt.textContent = label
    const dd = document.createElement('dd'); dd.textContent = value
    facts.append(dt, dd)
  }
  put('pack', entry.pack)
  put('file', entry.onDisk ? entry.file : `MISSING — no ${entry.file} on disk`)
  put('named by', entry.used.length ? entry.used.join('\n') : 'nothing — no table deals this')
  if (entry.big) put('placement', 'big: landscape, sits centred, carries the skyline')
  if (entry.grey) put('palette', 'base atlas in game, so its rock reads grey rather than tan')
  if (gallery === 'tiles') {
    const step = incrementSteps().find(s => s.draws.includes(entry.id))
    if (step) put('increment', `step ${step.index + 1}: ${step.step}`)
  }

  const ul = $('#notes')
  ul.replaceChildren()
  for (const n of notes.filter(n => n.assetId === picked)) {
    const li = document.createElement('li')
    li.append(`${n.note} (${n.at.slice(0, 10)})`)
    const del = document.createElement('button')
    del.textContent = '×'
    del.onclick = async () => { notes = (await api('/api/note/delete', { at: n.at })).notes; drawDetail(); drawList() }
    li.append(del)
    ul.append(li)
  }
}

/* ------------------------------------------------------------- grid mode */

/**
 * The whole group at once, laid out and turning.
 *
 * Because "is this one darker than the others?" is not a question a
 * one-at-a-time viewer can answer, and comparison is most of what a palette
 * pass is. Capped at the group, which is at most the 24 species.
 */
async function showGrid(): Promise<void> {
  const entry = shown().find(e => e.id === picked)
  const bucket = shown().filter(e => e.group === (entry?.group ?? '') && e.onDisk)
  if (!bucket.length) return

  const mine = ++token
  clearStand()
  say(`loading ${bucket.length}…`)

  const loaded = await Promise.all(bucket.map(e => build(e.id).catch(() => null)))
  if (mine !== token) return

  const columns = Math.ceil(Math.sqrt(bucket.length))
  const cell = new THREE.Group()
  /* Normalise each to a unit box first, or a mountain hides fourteen tufts. */
  loaded.forEach((object, i) => {
    if (!object) return
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3())
    const scale = 1 / Math.max(size.x, size.y, size.z, 0.001)
    const centre = box.getCenter(new THREE.Vector3())
    object.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z))
    const holder = new THREE.Group()
    holder.add(object)
    holder.scale.setScalar(scale)
    holder.position.set(
      ((i % columns) - (columns - 1) / 2) * 1.4,
      0,
      (Math.floor(i / columns) - (Math.ceil(bucket.length / columns) - 1) / 2) * 1.4,
    )
    cell.add(holder)
  })
  stand.add(cell)
  frame(cell, 1.25)
  say(`${loaded.filter(Boolean).length} of ${bucket.length} loaded`)
}

/* --------------------------------------------------------------- chrome */

function setGallery(next: Gallery): void {
  gallery = next
  for (const b of $('#galleries').children) b.classList.toggle('on', (b as HTMLElement).dataset.gallery === next)
  $('#setPick').hidden = next !== 'species'
  $('#seasonPick').hidden = next !== 'tiles'
  $('#greyPick').hidden = next !== 'props'
  drawList()
  const first = shown()[0]
  if (first) void select(first.id)
}

$('#galleries').onclick = e => {
  const next = (e.target as HTMLElement).dataset?.gallery as Gallery | undefined
  if (next) setGallery(next)
}
$('#search').oninput = () => drawList()
$('#spin').onclick = () => { spinning = !spinning; $('#spin').textContent = spinning ? 'pause spin' : 'resume spin' }
$('#reset').onclick = () => { const o = stand.children[0]; if (o) frame(o) }
$('#grid').onclick = () => void showGrid()
$('#setSelect').onchange = () => void select(picked)
$('#seasonSelect').onchange = () => void select(picked)
$('#greyToggle').onchange = () => void select(picked)

window.addEventListener('keydown', e => {
  if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
  const items = shown()
  const at = items.findIndex(i => i.id === picked)
  if (e.key === 'ArrowDown') { e.preventDefault(); void select(items[Math.min(items.length - 1, at + 1)]!.id) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); void select(items[Math.max(0, at - 1)]!.id) }
  else if (e.key === ' ') { e.preventDefault(); $('#spin').click() }
})

$<HTMLFormElement>('#noteForm').onsubmit = async e => {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const note = (form.elements.namedItem('note') as HTMLTextAreaElement).value
  if (!picked) return
  const out = await api('/api/note', { assetId: picked, note })
  notes = out.notes ?? notes
  form.reset()
  drawDetail()
  drawList()
  say('note saved')
}

/* ----------------------------------------------------------------- boot */

async function boot(): Promise<void> {
  const [assets, state, models] = await Promise.all([
    api('/api/assets'), api('/api/state'), modelsFor('Summer'),
  ])
  disk = assets
  notes = state.notes ?? []

  const select$ = $<HTMLSelectElement>('#setSelect')
  for (const set of SETS) {
    const option = document.createElement('option')
    option.value = set.id
    option.textContent = set.name
    select$.append(option)
  }

  catalogue = [...buildCatalogue(), ...tileEntries(Object.keys(models.geometry))]
  resize()
  setGallery('species')
}

void boot().catch((err: Error) => say(err.message, true))
