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
 *
 * ## The built animals, and why there is no preview pipeline
 *
 * The fourth gallery is new and is a different KIND of thing. The live 24 are
 * authored GLBs; the fifty new animals are constructed at runtime from records
 * in `src/island/species/` by `buildSpecies()`, so there is no file to point a
 * loader at. Two ways to show them were available and only one of them is
 * honest:
 *
 *   BAKE A PREVIEW — render each species to a GLB or a PNG in a tool, and serve
 *   that. Cheap, and wrong. The preview is a COPY of the kit's output, and a
 *   copy drifts: retune the quadruped kit's leg length and every preview is a
 *   lie until someone remembers to re-bake. Joe would be signing off something
 *   that is not what ships, which is worse than not showing him anything.
 *
 *   RUN THE KIT — import `buildSpecies` and call it, here, in the browser. That
 *   is what this does. The `THREE.Group` on the turntable is the same object,
 *   from the same function, that `pets.ts` will clone at the integration seam
 *   (`kit.ts`, bottom). There is nothing between the code and his eyes, so there
 *   is nothing to drift.
 *
 * It costs nothing to do it this way, which is the tell that it is right: the
 * workbench is already a Vite host that imports the game's TypeScript, which is
 * the whole reason `vite.workbench.config.ts` exists rather than the plain node
 * server. The channel gate (`tools/smoke/channel.mjs`) still holds in both
 * directions — this file imports FROM `src/`, and nothing in `src/` has ever
 * heard of it.
 *
 * The lighting is the island's here too, and for the built animals it matters
 * more than it does for the GLBs: a built creature's colour is per-part material
 * colour (`kit.ts paletteFor`), not a recoloured atlas, so a white studio would
 * misreport every palette in the fifty.
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
import { speciesRecord } from '../../../src/island/species/registry'
import { buildSpecies } from '../../../src/island/species/kit'
import {
  buildCatalogue, tileEntries, incrementSteps, grouped, basenameOf, fileOf,
  type Entry, type Gallery,
} from './registry'
import {
  builtBench, progressOf, readFacts, SIGNED_OFF, STRUCK, VERIFIED,
  type Creature,
} from './built'

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

/**
 * A built animal: the real kit, called for real.
 *
 * `buildSpecies` is synchronous — the kits make boxes and spheres, there is
 * nothing to fetch — but this returns a promise so it slots into `build()`
 * beside the three loaders without the call sites growing a special case, and
 * so a throw arrives as a rejection that `select()` already knows how to print.
 *
 * It DOES throw, deliberately and by name: a species whose kit is declared but
 * unbuilt raises `UnbuiltKitError` rather than yielding an empty group
 * (`kit.ts`), and an empty group on a turntable is the worst possible answer —
 * it looks like a creature that renders as nothing, which is the exact failure
 * the loud error exists to prevent. So the message lands in the status line.
 */
async function loadBuilt(speciesId: string): Promise<THREE.Object3D> {
  const record = speciesRecord(speciesId)
  if (!record) throw new Error(`${speciesId} is not in the shipped registry`)
  if (!record.build) {
    throw new Error(`${speciesId} carries kit '${record.kit}' and no build — it is an authored GLB, not a kit build`)
  }
  return buildSpecies(record.build)
}

/* ------------------------------------------------------------ the catalogue */

interface Shown extends Entry { onDisk: boolean; notes: number }

let gallery: Gallery = 'built'
let catalogue: Entry[] = []
let disk: Record<string, string[]> = {}
let notes: Array<{ assetId: string; note: string; at: string }> = []
/**
 * The fifty, joined to his verdicts and to their facts. Rebuilt from
 * `/api/state` on boot and never sorted after: see `built.ts` on why the order
 * is the file's order and must stay it.
 */
let bench: Creature[] = []
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

/* -------------------------------------------------------------- the bench */

/**
 * The creatures on screen. Filtered by the search box and by NOTHING ELSE.
 *
 * In particular a signed-off animal is not hidden. `app.js` learned this the
 * expensive way on the name audit: he is working down a list, and a row that
 * vanishes from under the cursor the moment he ticks it takes his place with it.
 * A tick shows as a tick and the row stays exactly where it was; the bar above
 * moves immediately, so the save is never in doubt.
 */
function benchShown(): Creature[] {
  const q = $<HTMLInputElement>('#search').value.trim().toLowerCase()
  if (!q) return bench
  return bench.filter(c =>
    `${c.speciesId} ${c.species} ${c.given} ${c.collectionName}`.toLowerCase().includes(q))
}

/** Every id currently listed, in list order — what the arrow keys page through. */
const listedIds = (): string[] =>
  gallery === 'built' ? benchShown().map(c => c.speciesId) : shown().map(e => e.id)

function drawBenchList(): void {
  const list = $('#list')
  list.replaceChildren()
  const items = benchShown()

  let group = ''
  for (const c of items) {
    if (c.collectionName !== group) {
      group = c.collectionName
      const head = document.createElement('li')
      head.className = 'group'
      const inGroup = items.filter(x => x.collectionName === group)
      head.textContent = `${group} · ${inGroup.filter(x => x.signoff === SIGNED_OFF).length} of ${inGroup.length}`
      list.append(head)
    }

    const li = document.createElement('li')
    li.className = 'item creature'
      + (c.speciesId === picked ? ' on' : '')
      + (c.signoff === SIGNED_OFF ? ' done' : '')
      + (c.onBench ? '' : ' missing')

    const tick = document.createElement('span')
    tick.className = 'tick'
    tick.textContent = c.signoff === SIGNED_OFF ? '✓' : '·'
    li.append(tick, `${c.given} `)

    const who = document.createElement('span')
    who.className = 'meta'
    who.textContent = c.species
    li.append(who)

    li.title = c.onBench
      ? `${c.speciesId} · ${c.collectionName} · ${c.kit}`
      : `${c.speciesId} has no row in joe/names-audit.json, so it cannot be signed off yet`
    li.onclick = () => void select(c.speciesId)
    list.append(li)
  }

  const p = progressOf(bench)
  $('#count').textContent = `${items.length} shown · ${p.left} to go`
}

/**
 * Where he has got to, over the WHOLE bench.
 *
 * The counts never describe the filtered view, for the same reason the name
 * panel's bar does not: a number that shrinks when he types in the search box
 * cannot tell him how much of the job is left.
 */
function drawProgress(): void {
  const p = progressOf(bench)
  const bar = $<HTMLProgressElement>('#benchBar')
  bar.max = Math.max(1, p.total)
  bar.value = p.done
  $('#benchDone').textContent = p.label

  const bits: string[] = [`${p.left} to go`]
  if (p.withoutFact) bits.push(`${p.withoutFact} with no fact yet`)
  if (p.unverified) bits.push(`${p.unverified} unverified`)
  /* His ruling makes the fact part of the sign-off, so a tick that landed
   * before one existed is worth saying out loud rather than burying. */
  if (p.signedWithoutFact) bits.push(`${p.signedWithoutFact} signed off before a fact existed`)
  if (p.unsignable) bits.push(`${p.unsignable} not in the audit file`)
  $('#benchMeta').textContent = bits.join(' · ')
}

function drawList(): void {
  if (gallery === 'built') { drawBenchList(); drawProgress(); return }
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
  if (gallery === 'built') return loadBuilt(id)
  if (gallery === 'species') return loadPet(id, $<HTMLSelectElement>('#setSelect').value)
  if (gallery === 'tiles') return loadTile(id, $<HTMLSelectElement>('#seasonSelect').value as Season)
  return loadProp(id, $<HTMLInputElement>('#greyToggle').checked)
}

function drawDetail(): void {
  if (gallery === 'built') return drawCreature()
  $('#creature').hidden = true
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

/* --------------------------------------------------------- the sign-off */

/** Small enough to not be a framework, big enough to keep the card readable. */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, className = '', text = '',
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

/**
 * One field of one row, onto the file as it stands THIS INSTANT.
 *
 * The same `/api/save` patch path `app.js` uses, deliberately and not by
 * accident of convenience: `joe/names-audit.json` has two authors — an agent
 * regenerates every row of it when the roster moves, Joe judges three fields of
 * each — and the server re-reads and merges inside the request so neither can
 * silently overwrite the other. A second persistence route would have to
 * re-learn all of that, and would learn it wrong.
 *
 * The card has already shown the change, so a success is silent; a refusal says
 * so in the status line and the value on screen is stale until he reloads,
 * which is the honest way round. It never redraws the LIST — see `drawBenchList`.
 */
async function patchCreature(c: Creature, fields: Record<string, string>): Promise<void> {
  if (!c.onBench) {
    say(`${c.speciesId} has no row in joe/names-audit.json — nothing to save against`, true)
    return
  }
  const out = await api('/api/save', { what: 'names', patch: { id: c.auditId, ...fields } })
  if (out?.error) say(out.error, true)
  else say(`saved ${out.saved}`)
}

/** The check the fact-checking pass recorded, as a word and a colour. */
function checkPill(c: Creature): HTMLElement {
  if (!c.fact) return el('span', 'pill pending', 'no fact yet')
  if (c.factCheck === VERIFIED) return el('span', 'pill ok', 'verified')
  if (!c.factCheck) return el('span', 'pill pending', 'not checked')
  return el('span', 'pill warn', c.factCheck)
}

/**
 * One creature's card: the name, the collection, the fact, and one gate.
 *
 * JT-031 is what shapes it. His words were *"they then become part of my final
 * sign off for each animal along with its name"* — one decision per animal,
 * covering the model turning beside it, the collection it was assigned, the
 * name it was given and the sentence written about it. So there is exactly one
 * Sign off button, and the two Strike buttons above it are not rival gates:
 * they are how he says which PART he is unhappy with, in the shape
 * `names-audit.json` already uses for a name he rejects.
 *
 * Nothing here is hidden when it is missing. A fact that has not been drafted
 * says so, a fact nobody checked says so, and a creature the audit file has
 * never heard of says that its sign-off has nowhere to land. A surface that
 * quietly showed a blank where a fact belongs would let him sign off fifty
 * animals and believe he had read fifty sentences.
 */
function drawCreature(): void {
  const c = bench.find(x => x.speciesId === picked)
  const box = $('#creature')
  box.hidden = false
  box.replaceChildren()

  $('#assetId').textContent = c ? c.given : '—'
  const dl = $('#facts')
  dl.replaceChildren()
  if (!c) { box.hidden = true; return }

  const put = (label: string, value: string) => {
    dl.append(el('dt', '', label), el('dd', '', value))
  }
  put('species', c.species)
  put('collection', `${c.collectionName} (${c.collection}) · ship ${c.ship}`)
  put('given name', c.given + (c.replacement ? `  →  ${c.replacement}` : ''))
  put('name band', c.band)
  put('built by', `${c.kit} kit · ${c.speciesId}`)

  /* The audit file was generated from a roster that has since moved. Loud,
   * because `naming.ts` is explicit that inserting a species mid-roster renames
   * the ones after it, and a name he signs off has to be the name that ships. */
  if (c.drift) {
    box.append(el('p', 'alarm',
      `joe/names-audit.json calls this one ${c.benched}; the code now generates ${c.given}. `
      + 'The audit file is stale against the roster — do not sign this off until they agree.'))
  }
  if (!c.onBench) {
    box.append(el('p', 'alarm',
      'No row in joe/names-audit.json for this species yet, so there is nowhere for a '
      + 'sign-off to land. It appears here because the registry builds it; the audit file '
      + 'catches up when the roster is regenerated.'))
  }

  /* ---- the name */
  const nameRow = el('div', 'judge')
  nameRow.append(el('h3', '', 'The name'))
  const strikeName = el('button', 'strike' + (c.verdict === STRUCK ? ' on' : ''),
    c.verdict === STRUCK ? '✗ struck' : 'strike the name')
  const better = el('input', 'replacement')
  better.value = c.replacement
  better.placeholder = 'the name you want instead'
  const why = el('input')
  why.value = c.note
  why.placeholder = 'note — what is wrong with it'

  strikeName.onclick = () => {
    c.verdict = c.verdict === STRUCK ? '' : STRUCK
    drawCreature()
    drawList()
    void patchCreature(c, { verdict: c.verdict })
  }
  better.onchange = () => { c.replacement = better.value; void patchCreature(c, { replacement: better.value }) }
  why.onchange = () => { c.note = why.value; void patchCreature(c, { note: why.value }) }

  const nameBits = el('div', 'row')
  nameBits.append(strikeName, better, why)
  nameRow.append(nameBits)
  box.append(nameRow)

  /* ---- the fact */
  const factRow = el('div', 'judge')
  const head = el('div', 'row')
  head.append(el('h3', '', 'The fact'), checkPill(c))
  factRow.append(head)

  if (c.fact) {
    factRow.append(el('p', 'factText', c.fact))
    if (c.factSource) factRow.append(el('p', 'meta', `source: ${c.factSource}`))
  } else {
    /*
     * Empty and obviously pending, never a plausible-looking sentence.
     *
     * A made-up line about a pangolin is the sort of thing that ends up printed
     * in front of a child as fact. JT-031 settles who writes these — an agent
     * drafts and fact-checks them into `joe/species-facts.json` — and until that
     * file lands this is what fifty of these say.
     */
    factRow.append(el('p', 'pending',
      'Not drafted yet. The facts are written and fact-checked by an agent into '
      + 'joe/species-facts.json (JT-031); this card shows whatever that file holds, '
      + 'and nothing is invented here.'))
  }

  const strikeFact = el('button', 'strike' + (c.factVerdict === STRUCK ? ' on' : ''),
    c.factVerdict === STRUCK ? '✗ struck' : 'strike the fact')
  const factWhy = el('input')
  factWhy.value = c.factNote
  factWhy.placeholder = 'note — what is wrong with it, or the wording you want'
  strikeFact.onclick = () => {
    c.factVerdict = c.factVerdict === STRUCK ? '' : STRUCK
    drawCreature()
    drawList()
    void patchCreature(c, { factVerdict: c.factVerdict })
  }
  factWhy.onchange = () => { c.factNote = factWhy.value; void patchCreature(c, { factNote: factWhy.value }) }

  const factBits = el('div', 'row')
  factBits.append(strikeFact, factWhy)
  factRow.append(factBits)
  box.append(factRow)

  /* ---- the one gate */
  const done = c.signoff === SIGNED_OFF
  const gate = el('button', 'signoff' + (done ? ' on' : ''),
    done ? '✓ signed off — click to re-open' : 'Sign this animal off')
  gate.disabled = !c.onBench
  gate.onclick = () => {
    /* Clicking the state it already has clears it: a mis-click is one click to
     * undo, and '' is a real state — not yet judged, not a rejection. */
    c.signoff = done ? '' : SIGNED_OFF
    drawCreature()
    drawList()
    void patchCreature(c, { signoff: c.signoff })
  }
  box.append(gate)

  if (!done && !c.fact) {
    box.append(el('p', 'meta',
      'Signing off now covers the model, the collection and the name only — there is no '
      + 'fact yet to cover. The bar counts these separately so they can be revisited.'))
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
  /* For the built animals the group is the COLLECTION, which is the comparison
   * that matters: roster §4 flags whole groups that "will read as duplicates
   * unless size, palette and marking are deliberately separated", and that is
   * not a question a one-at-a-time viewer can answer. */
  const bucket: Array<{ id: string }> = gallery === 'built'
    ? benchShown().filter(c => c.collection === bench.find(x => x.speciesId === picked)?.collection)
      .map(c => ({ id: c.speciesId }))
    : (() => {
      const entry = shown().find(e => e.id === picked)
      return shown().filter(e => e.group === (entry?.group ?? '') && e.onDisk)
    })()
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
  /* The progress bar belongs to the bench and would be a lie over the props. */
  $('#bench').hidden = next !== 'built'
  $('#noteForm').hidden = next === 'built'
  $('#notes').hidden = next === 'built'
  drawList()
  const first = listedIds()[0]
  if (first) void select(first)
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
  const items = listedIds()
  if (!items.length) return
  const at = items.indexOf(picked)
  if (e.key === 'ArrowDown') { e.preventDefault(); void select(items[Math.min(items.length - 1, at + 1)]!) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); void select(items[Math.max(0, at - 1)]!) }
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
  /*
   * The bench, joined here and nowhere else.
   *
   * `state.names` is Joe's judgement; `state.facts` is whatever the fact agent
   * has written into `joe/species-facts.json`, passed through unexamined by the
   * API (see `api.mjs`). Both may be empty — the facts file does not exist until
   * that agent lands — and the page renders that state rather than waiting for
   * it.
   */
  bench = builtBench(state.names ?? [], readFacts(state.facts))

  const select$ = $<HTMLSelectElement>('#setSelect')
  for (const set of SETS) {
    const option = document.createElement('option')
    option.value = set.id
    option.textContent = set.name
    select$.append(option)
  }

  catalogue = [...buildCatalogue(), ...tileEntries(Object.keys(models.geometry))]
  resize()
  /* The bench opens first: it is the surface he asked for, and the one with
   * work outstanding in it. */
  setGallery('built')
}

void boot().catch((err: Error) => say(err.message, true))
