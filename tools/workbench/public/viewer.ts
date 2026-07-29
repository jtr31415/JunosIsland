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
 * ## The assembled animals, and why there is no preview pipeline
 *
 * The first gallery is a different KIND of thing and is the reason this page
 * imports the game's own TypeScript. The live 24 are authored GLBs; an assembled
 * animal is constructed at runtime by `buildAssembled()` out of geometry lifted
 * from those same 24 files, so there is no file to point a loader at. Two ways to
 * show one were available and only one of them is honest:
 *
 *   BAKE A PREVIEW — render each species to a GLB or a PNG in a tool, and serve
 *   that. Cheap, and wrong. The preview is a COPY of the assembler's output, and
 *   a copy drifts: retune a hull or a placement and every preview is a lie until
 *   someone remembers to re-bake. Joe would be approving something that is not
 *   what ships, which is worse than not showing him anything.
 *
 *   RUN THE ASSEMBLER — import `buildAssembled` and call it, here, in the
 *   browser. That is what this does. The `THREE.Group` on the turntable is the
 *   same object, from the same function, that `pets.ts` clones at the integration
 *   seam. There is nothing between the code and his eyes, so there is nothing to
 *   drift — and the pilot re-tunes the assembler between species, which is
 *   exactly when a baked picture would go quietly stale.
 *
 * It costs nothing to do it this way, which is the tell that it is right: the
 * workbench is already a Vite host that imports the game's TypeScript, which is
 * the whole reason `vite.workbench.config.ts` exists rather than the plain node
 * server. The channel gate (`tools/smoke/channel.mjs`) still holds in both
 * directions — this file imports FROM `src/`, and nothing in `src/` has ever
 * heard of it.
 *
 * The lighting is the island's here too, and for an assembled animal it matters
 * more than it does for the GLBs: its colour is a slotted palette texture rather
 * than the atlas the pack wears, so a white studio would misreport every one of
 * them — and it would misreport them BESIDE a pack animal lit the same way, which
 * is the one comparison this page exists to make.
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
  buildCatalogue, tileEntries, incrementSteps, grouped, basenameOf, fileOf, packsFor,
  type Entry, type Gallery,
} from './registry'
import {
  approverBench, progressOf, readFacts, approvePatch, reopenPatch,
  APPROVED, STRUCK, VERIFIED, APPROVE_LABEL, REOPEN_LABEL, NO_AUDIT_ROW,
  type Creature,
} from './approver'
import {
  weldedComponents, componentFacts, orderComponents, namesFor, explodeOffset, sizeLabel,
  ANATOMY_SPECIES, DEFAULT_SPECIES, SPLIT_NODE, petIdOf,
  type ComponentFacts, type PartName,
} from './anatomy'
import {
  assembledRows, filterRows, groupRows, groupHeading, countLabel, rowTitle, pairCard, flagNote,
  referenceOr, REFERENCE_ANIMALS, DEFAULT_REFERENCE, NEW_METHOD_MARK, NEW_METHOD_SHORT,
  NOTHING_YET, FLAG_HEADING, FLAG_GLYPH,
  type AssembledRow,
} from './assembled'
/*
 * The new method's own module, and the ONE import in this file that may not
 * exist yet.
 *
 * `src/island/species/parts` is written by the run that assembles a species and
 * lands one species at a time (docs/building-animals-from-parts.md, "One species
 * at a time"). It is imported here rather than through `assembled.ts` on
 * purpose: `assembled.ts` is the tested half and takes its rows as data, so the
 * gallery's arithmetic is provable whether or not a single animal has been built
 * yet, and this file — which is untested by design — is the only thing that has
 * to know where the assembler lives.
 */
import { assembledSpecies, buildAssembled } from '../../../src/island/species/parts'

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
 *
 * `radius` OVERRIDES the object's own bounding sphere, and it exists for one
 * reason: a camera distance derived from each model's own bounds is a size
 * normaliser wearing a different hat. Push the camera further for a big animal
 * and closer for a small one and the small one fills the frame again — which
 * would quietly undo the whole of `SHARED_SCALE` below. The comparison gallery
 * therefore passes a CONSTANT radius (`PAIR_FRAME_RADIUS`) so every pair is
 * framed from exactly the same place and the only thing that changes between two
 * selections is how big the animals actually are. The re-centring above stays
 * per-object because it is a TRANSLATION, and a translation cannot change a size.
 *
 * Galleries whose assets really are different KINDS of thing — a tuft against a
 * mountain — pass nothing and keep the fit.
 */
function frame(object: THREE.Object3D, pad = 1.6, radius?: number): void {
  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) return
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  const centre = box.getCenter(new THREE.Vector3())
  object.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z))

  const r = radius ?? sphere.radius
  const dist = (r * pad) / Math.sin((camera.fov * Math.PI) / 360)
  controls.target.set(0, r * 0.55, 0)
  camera.position.set(dist * 0.55, r * 1.25 + dist * 0.4, dist * 0.75)
  camera.near = Math.max(0.01, dist / 200)
  camera.far = dist * 12
  camera.updateProjectionMatrix()
  controls.update()
}

/** Whether the stand holds a GRID rather than one selection. Decides the framing. */
let showingGrid = false

/**
 * The framing the thing on the stand wants — a constant for a single pair, a fit
 * for anything else.
 *
 * A grid is fitted even on the comparison gallery, and that is not an exception to
 * the rule above: a grid is ONE object whose every cell is drawn at
 * `SHARED_SCALE`, so fitting it cannot single any animal out. Fixing its distance
 * instead would just cut the corner off a fourteen-cell collection.
 */
const frameRadius = (): number | undefined =>
  gallery === 'assembled' && !showingGrid ? PAIR_FRAME_RADIUS : undefined

let spinning = true
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta()
  lighting.update(dt)
  if (spinning) stand.rotation.y += dt * 0.5
  controls.update()
  renderer.render(scene, camera)
  /* After the render, so a label sits on where the part was actually drawn. */
  moveTags()
  movePairTags()
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

/* --------------------------------------------------- the side-by-side --- */

/**
 * THE ONE NUMBER EVERY MODEL ON THIS PAGE IS SCALED BY, and why it is one number.
 *
 * Joe, on the first fourteen assembled animals: *"the new animals look genuinely
 * really good. general criticism is size. the body/cube should always be the
 * standard size, its often bigger."*
 *
 * The geometry is innocent. All fourteen wear a hull of exactly 1.250 (1.125 on z
 * for the three on the other real shell), no node carries a non-identity scale,
 * and `Hull.stretch` is typed `never` in `assembly.ts` so an oversized hull no
 * longer compiles. **The size difference he was seeing was made here, by the
 * viewer.**
 *
 * What used to stand in this place divided every model by its OWN total height, so
 * each one arrived exactly one unit tall. That is a size NORMALISER, and a
 * normaliser is the one thing this page must never do: the viewer exists so Joe
 * can judge size, so it cannot be allowed to normalise size away. Our species'
 * total heights run 1.431 (mouse, badger, shrew) to 1.976 (squirrel), so the
 * identical 1.250 cube was drawn at 1.250/1.431 = 0.874 of a frame-unit on one and
 * 1.250/1.976 = 0.633 on the other — a 1.38x spread invented by arithmetic. Worse,
 * it was applied to the PACK half of the pair too, by that animal's own height, so
 * the one comparison this gallery exists to make was wrong in both directions at
 * once.
 *
 * So the divisor is a shared CONSTANT, stated rather than measured:
 * `PACK_HEIGHT_MEDIAN`, the median total height of the 24 originals in
 * `src/island/public/pets` — 1.611185, between `animal-monkey` at 1.6100 and
 * `animal-cow` at 1.6124. Two consequences, and both of them are the point:
 *
 *   - A 1.250 hull is 1.250 / 1.611185 = **0.776 frame-units for every animal**,
 *     ours and the pack's, in single view and in grid view. Same cube, same size.
 *   - Our animal stands beside its reference at its TRUE relative size. The 1.976
 *     squirrel really is 1.38x the 1.431 mouse, and now it looks it.
 *
 * The MEDIAN is what keeps the page from lurching. The old normaliser drew
 * everything at 1.000; this draws the same set between 0.888 (1.431/1.611) and
 * 1.247 (2.010/1.611), so the framing he already knows is roughly the framing he
 * keeps — and what moves within it is now real.
 *
 * Measured off the real files by walking every mesh node's world matrix, the same
 * chunk walk `tools/pets/parts-bank.ts` uses. A constant and not a runtime
 * measurement because a divisor computed from whatever happens to be loaded is a
 * divisor that changes when the selection does, which is the bug all over again.
 */
const PACK_HEIGHT_MEDIAN = 1.611185
/** The width and depth medians of the same 24, for `PAIR_FRAME_RADIUS` only. */
const PACK_WIDTH_MEDIAN = 1.491992
const PACK_DEPTH_MEDIAN = 1.477575
/** One model unit, in frame units. Every mesh on this page. Never per-animal. */
const SHARED_SCALE = 1 / PACK_HEIGHT_MEDIAN
/** The clear air between the two halves of a pair, in frame units. */
const PAIR_GAP = 0.25
/**
 * The camera distance for the comparison gallery, as a constant.
 *
 * The half-diagonal of a NOMINAL pair: two animals of median pack size, shared-
 * scaled and stood `PAIR_GAP` apart — a 2.102 x 1.000 x 0.917 box, so 1.251. Every
 * pair is framed from this one distance, so a squirrel is drawn bigger than a mouse
 * instead of being pushed further away until it is not. It is generous enough that
 * the widest pair the gallery can show (the 2.336 bunny beside the 1.943 mouse,
 * 2.905 across once scaled) sits comfortably inside the frame: at pad 1.6 the
 * visible half-span is 2.001 and the content needs 1.453.
 */
const PAIR_FRAME_RADIUS = 0.5 * Math.hypot(
  2 * PACK_WIDTH_MEDIAN * SHARED_SCALE + PAIR_GAP,
  PACK_HEIGHT_MEDIAN * SHARED_SCALE,
  PACK_DEPTH_MEDIAN * SHARED_SCALE,
)

/**
 * Scale a thing by the SHARED divisor, feet on y = 0, centred on x and z.
 *
 * Nothing in here reads how big the object is, and that absence is the entire
 * fix. The only thing measured is where the model's feet and its middle are, and
 * acting on that is a TRANSLATION — a translation cannot make one animal look
 * bigger than another.
 *
 * What it deliberately does NOT do any more is match HEIGHTS. Matched height was a
 * defensible answer to a different question (every eye and leg number on this page
 * is a ratio against the animal's own height), and it is the answer that produced
 * the complaint: two animals drawn the same height are two animals whose real
 * difference in size has been deleted from the picture. The ratios are still
 * printed as ratios; the models are drawn at their true size.
 */
function toSharedScale(object: THREE.Object3D): THREE.Group {
  const holder = new THREE.Group()
  holder.add(object)
  object.scale.multiplyScalar(SHARED_SCALE)
  object.position.multiplyScalar(SHARED_SCALE)

  holder.updateMatrixWorld(true)
  const after = new THREE.Box3().setFromObject(object)
  if (after.isEmpty()) return holder
  const centre = after.getCenter(new THREE.Vector3())
  object.position.sub(new THREE.Vector3(centre.x, after.min.y, centre.z))
  return holder
}

/** A loaded model's true total height, in MODEL units — what the tags print. */
const heightOf = (object: THREE.Object3D): number => {
  const box = new THREE.Box3().setFromObject(object)
  return box.isEmpty() ? 0 : box.max.y - box.min.y
}

/**
 * Two already-normalised things, grounded, centred and pushed apart by their own
 * half-widths, so neither sits inside the other whatever their proportions are.
 *
 * LEFT is the pack and RIGHT is ours, always and in that order — the card beside
 * the canvas and the two tags over it say so in those words, and all three must
 * not disagree. Named rather than left inline because the sentence is the whole
 * point of the pairing: the moment the arithmetic and the labels come apart, Joe
 * is judging Kenney's animal as ours with nothing on screen looking wrong.
 */
function standSideBySide(left: THREE.Object3D, right: THREE.Object3D): THREE.Group {
  const pair = new THREE.Group()
  const gap = PAIR_GAP
  ;[left, right].forEach((side, i) => {
    const box = new THREE.Box3().setFromObject(side)
    const centre = box.getCenter(new THREE.Vector3())
    side.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z))
    side.position.x += (i === 0 ? -1 : 1) * ((box.max.x - box.min.x) / 2 + gap / 2)
    pair.add(side)
  })
  return pair
}

/* --------------------------------------------- the assembled side-by-side */

/**
 * One animal built under the NEW method, standing beside a real Kenney original.
 *
 * There is no single-model mode on this gallery and that is the design. The
 * method is judged by one sentence — whether a new animal *sits next to the fox
 * without looking like a guest* — and that is a question about a pair, so the
 * pair is what `build()` returns. Which original it stands beside is his to
 * choose from the `Beside` dropdown; it opens on `animal-fox` because the fox is
 * the animal the sentence names.
 *
 * Neither half is baked, for the reason the header of this file argues at length
 * about the built animals and which applies harder here: the assembler is being
 * piloted one species at a time and will be re-tuned between them, so a baked
 * preview would be a picture of what the method used to do. The left is the
 * species gallery's own loader; the right is `buildAssembled` called for real.
 *
 * Each side is scaled by the SHARED divisor before they are stood together — see
 * `SHARED_SCALE`. Both halves therefore arrive at their true size relative to one
 * another, which is what Joe's note about size was asking for, and each half's
 * true height in model units goes onto its own label so the number and the
 * picture say the same thing.
 */
async function loadAssembled(id: string): Promise<THREE.Object3D> {
  const row = assembled.find(r => r.id === id)
  if (!row) throw new Error(`${id} is not on the assembled bench`)
  const reference = referenceOr($<HTMLSelectElement>('#besideSelect').value)

  const pack = await loadPet(reference, '')
  /* Synchronous, like `buildSpecies` — awaited only so a throw arrives as a
   * rejection that `select()` already knows how to print into the status line. */
  const mine = await Promise.resolve(buildAssembled(row.id))

  /* Measured BEFORE the shared scale, so it is the height the .glb and the
   * assembler actually hold rather than the height of the drawing. */
  const packHeight = heightOf(pack)
  const mineHeight = heightOf(mine)

  const left = toSharedScale(pack)
  const right = toSharedScale(mine)
  const pair = standSideBySide(left, right)
  /* Held for the two labels over the canvas. Rebuilt on every selection, so a
   * stale anchor cannot outlive the model it was pointing at. */
  pairSides = { left, right, row, reference, leftHeight: packHeight, rightHeight: mineHeight }
  return pair
}

/* --------------------------------------------------------------- anatomy */

/**
 * One animal, in pieces, each piece knowing what it is called and by whom.
 *
 * Joe: *"i need one example of an original animal, ripped apart in the viewer
 * with a label against each part."* He has been reasoning about the art from
 * screenshots of finished animals, and two of the things he has said about it —
 * head = body, and all eyes are flat — are claims about ANATOMY that a
 * screenshot cannot settle either way. This gallery settles them by taking the
 * real GLB apart in front of him, live, every time.
 *
 * NOTHING IS BAKED, for the reason argued at the top of this file about the
 * built animals and for one more that is specific here: a pre-exported
 * decomposition would be a claim about the pack rather than a reading of it, and
 * the entire value of the surface is that what he is looking at came out of
 * `animal-fox.glb` a second ago.
 */
interface Part {
  /** Kenney's node name, or ours for a shell inside `body`. */
  label: PartName
  /** The node this came out of — `body`, `tail`, `leg-front-left`, `Group`. */
  node: string
  facts: ComponentFacts
  /** Moved by the explode slider. Holds the mesh at its own baked world matrix. */
  holder: THREE.Group
  /** Centroid in the anatomy group's space, before any explode. */
  base: THREE.Vector3
}

let parts: Part[] = []
let explode = 0.55
/** The distance a part travels between assembled and fully apart. Set per model. */
let reach = 0
let anatomyRoot: THREE.Group | null = null

/**
 * A sub-mesh of `source` holding only `triangles`, at the same place in the world.
 *
 * The attributes are cloned rather than shared because five components of one
 * body means five geometries, and a body is under 500 vertices — the copy is
 * free and a shared attribute that someone later disposes is not.
 */
function subMesh(source: THREE.Mesh, triangles: readonly number[]): THREE.Mesh {
  const geometry = source.geometry.clone()
  const index = source.geometry.index
  const picked: number[] = []
  for (const t of triangles) {
    for (let k = 0; k < 3; k++) picked.push(index ? (index.array[t * 3 + k] as number) : t * 3 + k)
  }
  geometry.setIndex(picked)
  geometry.computeBoundingBox()
  const mesh = new THREE.Mesh(geometry, source.material)
  /* The source's world matrix, baked. The holder above it is what moves. */
  mesh.matrixAutoUpdate = false
  mesh.matrix.copy(source.matrixWorld)
  return mesh
}

/**
 * Take one loaded pet apart into labelled parts.
 *
 * Two levels, and they are different kinds of knowledge. Every mesh node is a
 * part and carries KENNEY'S name. The `body` node is then split again into
 * position-welded connected components — shells that touch nothing else — and
 * those have no name in the file at all, so `namesFor` supplies OURS and marks
 * them as ours. The measurements are taken in the mesh's own local space,
 * which is where the census took them and therefore where the name table's
 * numbers live.
 */
function dissect(root: THREE.Object3D, species: string): Part[] {
  root.updateMatrixWorld(true)
  const found: Part[] = []
  const bodies: Array<{ mesh: THREE.Mesh; facts: ComponentFacts; triangles: number[] }> = []

  root.traverse(node => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    const position = mesh.geometry.getAttribute('position')
    if (!position) return
    const positions = position.array as ArrayLike<number>
    const index = mesh.geometry.index ? (mesh.geometry.index.array as ArrayLike<number>) : null

    if (mesh.name === SPLIT_NODE) {
      for (const triangles of weldedComponents(positions, index)) {
        bodies.push({ mesh, triangles, facts: componentFacts(positions, index, triangles) })
      }
      return
    }

    const all = [...Array(Math.floor((index ? index.length : positions.length / 3) / 3)).keys()]
    const facts = componentFacts(positions, index, all)
    found.push({
      label: { name: mesh.name || '(unnamed node)', ours: false },
      node: mesh.name || '(unnamed node)', facts,
      holder: new THREE.Group(), base: new THREE.Vector3(),
    })
    found[found.length - 1]!.holder.add(subMesh(mesh, all))
  })

  /* The shells inside `body`, in the order the name table is written in. */
  const ordered = orderComponents(bodies)
  const ours = namesFor(species, ordered.map(o => o.facts))
  ordered.forEach((component, i) => {
    const part: Part = {
      label: ours[i]!, node: SPLIT_NODE, facts: component.facts,
      holder: new THREE.Group(), base: new THREE.Vector3(),
    }
    part.holder.add(subMesh(component.mesh, component.triangles))
    found.push(part)
  })

  /* Centroids into the anatomy group's space, once, so the explode and the
   * labels both read the same number and neither recomputes it per frame. */
  for (const part of found) {
    const source = part.holder.children[0] as THREE.Mesh
    part.base.set(part.facts.centroid[0], part.facts.centroid[1], part.facts.centroid[2])
      .applyMatrix4(source.matrix)
  }

  /* Kenney's names first, then ours, each by size. The file's own vocabulary is
   * the thing to read first; our interpretation of the nameless part is second. */
  return found.sort((a, b) =>
    Number(a.label.ours) - Number(b.label.ours) || b.facts.tris - a.facts.tris)
}

/** Push every part out from the middle, by the slider. Cheap enough per frame. */
function applyExplode(): void {
  if (!anatomyRoot) return
  const centre = new THREE.Vector3()
  for (const part of parts) centre.add(part.base)
  if (parts.length) centre.divideScalar(parts.length)
  for (const part of parts) {
    const [x, y, z] = explodeOffset(
      [part.base.x, part.base.y, part.base.z], [centre.x, centre.y, centre.z], reach, explode)
    part.holder.position.set(x, y, z)
  }
}

async function loadAnatomy(species: string): Promise<THREE.Object3D> {
  const pet = await loadPet(petIdOf(species), '')
  parts = dissect(pet, species)
  const group = new THREE.Group()
  for (const part of parts) group.add(part.holder)
  anatomyRoot = group

  /* How far apart "fully apart" is: a little under the model's own radius, so a
   * fox comes to pieces without the pieces ending up a screen away from it. */
  /* Named `assembledBox` and not `assembled`: there is now a module-level
   * `assembled` holding the new-method bench, and a local shadowing it here
   * would compile silently and read as the wrong thing. */
  const assembledBox = new THREE.Box3().setFromObject(group)
  reach = assembledBox.getBoundingSphere(new THREE.Sphere()).radius * 0.9

  /*
   * THE CAMERA IS FRAMED ON THE FULLY EXPLODED ANIMAL, ALWAYS.
   *
   * `frame()` fits whatever it is given, and what it would be given is the model
   * at whatever the slider happens to say — so dragging towards 1 walked the
   * legs off the bottom of the canvas and their labels with them, and dragging
   * back left the fox a speck in the middle. An invisible box spanning the t=1
   * bounds rides along in the group, so the framing is the same at every slider
   * position and the only thing that moves is the animal.
   */
  const was = explode
  explode = 1
  applyExplode()
  const full = new THREE.Box3().setFromObject(group)
  explode = was
  applyExplode()

  /* A sixth over the true span, which is headroom for the labels: a tag hung on
   * the topmost part is drawn ABOVE it and would otherwise sit off the canvas. */
  const span = full.getSize(new THREE.Vector3()).multiplyScalar(1.18)
  const bounds = new THREE.Mesh(new THREE.BoxGeometry(span.x, span.y, span.z))
  bounds.visible = false
  bounds.position.copy(full.getCenter(new THREE.Vector3()))
  group.add(bounds)
  return group
}

/** The labels, projected from the parts' centroids. Rebuilt on load, moved per frame. */
const tags: Array<{ part: Part; el: HTMLElement }> = []

function drawTags(): void {
  const layer = $('#labels')
  layer.replaceChildren()
  tags.length = 0
  if (gallery !== 'anatomy') return

  for (const part of parts) {
    const el = document.createElement('div')
    el.className = 'tag ' + (part.label.ours ? 'ours' : 'kenney')
    const name = document.createElement('span')
    name.className = 'name'
    if (part.label.ours) {
      const whose = document.createElement('span')
      whose.className = 'whose'
      whose.textContent = 'our name: '
      name.append(whose)
    }
    name.append(part.label.name)
    const facts = document.createElement('span')
    facts.className = 'facts'
    facts.textContent = `${sizeLabel(part.facts.size)} · ${part.facts.tris} tris`
    el.append(name, facts)
    layer.append(el)
    tags.push({ part, el })
  }
}

const projected = new THREE.Vector3()

/**
 * Move every label onto its part, and stop them sitting on top of each other.
 *
 * The projection is the easy half. The second pass is the half that decides
 * whether the picture is any use: a fox's nose and nose-tip are 0.11 units
 * apart, so at low explode their two tags land within a few pixels and the
 * lower one is hidden completely — and a label you cannot see is indistinguishable
 * from a label that is not there. Placed nearest-first (so the part you are
 * looking at keeps the spot it earned) and each later one is pushed straight
 * down until it clears everything already placed.
 *
 * Cheap because it is ten labels: the comparison is O(n²) on n ≤ 13.
 */
function moveTags(): void {
  if (!tags.length || !anatomyRoot) return
  const width = canvas.clientWidth, height = canvas.clientHeight

  const placed: Array<{ x: number; y: number; w: number; h: number }> = []
  const laid = tags.map(({ part, el }) => {
    projected.copy(part.base).add(part.holder.position)
    anatomyRoot!.localToWorld(projected)
    projected.project(camera)
    return { el, depth: projected.z, x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height }
  })
  laid.sort((a, b) => a.depth - b.depth)

  /* Which way each label steps off its part: away from the middle of the
   * picture, so a tag never covers the animal it is describing. */
  const middle = laid.reduce((n, t) => n + t.x, 0) / Math.max(1, laid.length)

  for (const tag of laid) {
    const behind = tag.depth > 1
    tag.el.style.display = behind ? 'none' : ''
    if (behind) continue
    const w = tag.el.offsetWidth, h = tag.el.offsetHeight
    tag.x += (tag.x < middle ? -1 : 1) * (w / 2 + 18)
    /* Kept inside the canvas: the layer clips, and half a name is worse than a
     * name in the wrong place — `torso+head fused hull (torso, neck, head, ...`
     * read as a complete label on the deer until this line existed. */
    tag.x = Math.min(Math.max(tag.x, w / 2 + 4), Math.max(w / 2 + 4, width - w / 2 - 4))
    let y = tag.y
    /* Straight down until nothing overlaps. Bounded, so a pathological stack
     * cannot spin here. */
    for (let guard = 0; guard < 40; guard++) {
      const clash = placed.find(p =>
        Math.abs(p.x - tag.x) < (p.w + w) / 2 && Math.abs(p.y - y) < (p.h + h) / 2)
      if (!clash) break
      y = clash.y + (clash.h + h) / 2 + 2
    }
    placed.push({ x: tag.x, y, w, h })
    tag.el.style.left = `${tag.x}px`
    tag.el.style.top = `${y}px`
    /* Nearer labels over further ones, so a leg's tag is not hidden by the far
     * side of the animal. */
    tag.el.style.zIndex = String(Math.round((1 - tag.depth) * 1000))
  }
}

/* ------------------------------------------- the labels over the ASSEMBLED pair */

/**
 * The two halves currently on the turntable, and what they are.
 *
 * Kept as a whole rather than as two loose objects so the labels can never be
 * built from one selection's models and another's names — which is the exact
 * shape of "a gallery listing the wrong thing", and this gallery exists to stop
 * him confusing two kinds of animal.
 */
let pairSides: {
  left: THREE.Object3D; right: THREE.Object3D; row: AssembledRow; reference: string
  /** Total heights in MODEL units, before `SHARED_SCALE`. Printed on the tags. */
  leftHeight: number; rightHeight: number
} | null = null
const pairTags: Array<{ object: THREE.Object3D; el: HTMLElement }> = []

/**
 * A name over each half, and the whole labelling requirement lives in here.
 *
 * *"Animals built under this method are labelled distinctly and unmistakably
 * from the scrapped kit builds, in the list and on the model."* This is the ON
 * THE MODEL half, and it follows the convention the anatomy view already
 * established rather than inventing a second one: **Kenney's own name plain, ours
 * marked as ours and visibly different.** So the left tag says `animal-fox` in
 * the same ink as every other measurement on this page, and the right tag is
 * amber, prefixed `OURS — `, and carries the method's name under it. The classes
 * are `kenney` and `ours`, which are the anatomy gallery's own, so the two
 * surfaces cannot drift apart in styling either.
 *
 * A flag rides on the right-hand tag as well as in the card, because the model is
 * where he is looking.
 *
 * EACH TAG ALSO CARRIES ITS HALF'S TRUE TOTAL HEIGHT IN MODEL UNITS, and that is
 * not decoration either. Both halves are now drawn at one shared scale
 * (`SHARED_SCALE`) so a size difference on the canvas is a real size difference —
 * and the moment that is true, the useful question becomes "how much bigger?",
 * which an eye cannot answer off two silhouettes. The number answers it, and it is
 * measured off the loaded model rather than quoted from a table, so it cannot go
 * stale against the geometry the way a baked preview would.
 */
function drawPairTags(): void {
  const layer = $('#labels')
  layer.replaceChildren()
  pairTags.length = 0
  if (gallery !== 'assembled' || !pairSides) return

  const card = pairCard(pairSides.row, pairSides.reference)
  const make = (object: THREE.Object3D, name: string, meta: string, ours: boolean): void => {
    const el = document.createElement('div')
    el.className = 'tag ' + (ours ? 'ours' : 'kenney')
    const title = document.createElement('span')
    title.className = 'name'
    title.textContent = name
    const facts = document.createElement('span')
    facts.className = 'facts'
    facts.textContent = meta
    el.append(title, facts)
    layer.append(el)
    pairTags.push({ object, el })
  }
  const tall = (h: number): string => `${h.toFixed(3)} units tall`
  make(pairSides.left, card.left, `${card.leftMeta} · ${tall(pairSides.leftHeight)}`, false)
  make(pairSides.right, card.right, `${card.rightMeta} · ${tall(pairSides.rightHeight)}`, true)
}

const pairAt = new THREE.Vector3()

/**
 * Hold each of the two labels over the top of the half it names.
 *
 * Much simpler than `moveTags` and deliberately not sharing its code: there are
 * exactly two of these, they are yards apart, and the whole de-overlapping pass
 * that the anatomy gallery needs would be machinery with nothing to do. Anchored
 * to the top-centre of each half's bounding box so the label sits above the
 * animal rather than across its face.
 */
function movePairTags(): void {
  if (!pairTags.length) return
  const width = canvas.clientWidth, height = canvas.clientHeight
  for (const { object, el } of pairTags) {
    const box = new THREE.Box3().setFromObject(object)
    if (box.isEmpty()) continue
    pairAt.set((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2)
    pairAt.project(camera)
    const behind = pairAt.z > 1
    el.style.display = behind ? 'none' : ''
    if (behind) continue
    el.style.left = `${(pairAt.x * 0.5 + 0.5) * width}px`
    el.style.top = `${Math.max(el.offsetHeight / 2 + 4, (-pairAt.y * 0.5 + 0.5) * height - 22)}px`
  }
}

/** The same parts, read down the side: name, whose name it is, size, triangles. */
function drawAnatomy(): void {
  $('#creature').hidden = true
  $('#anatomy').hidden = false
  $('#assetId').textContent = picked || '—'
  $('#facts').replaceChildren()
  $('#notes').replaceChildren()

  const box = $('#anatomy')
  box.replaceChildren()

  const key = document.createElement('p')
  key.className = 'key'
  key.append('Plain names are ')
  const strong = document.createElement('strong')
  strong.textContent = "Kenney's"
  key.append(strong, ' — the node names in the .glb. Amber ones are ')
  const mine = document.createElement('b')
  mine.textContent = 'ours'
  key.append(mine, ': the ')
  const em = document.createElement('em')
  em.textContent = 'body'
  key.append(em, ' mesh has ONE name in the file and comes apart into shells the '
    + 'file never names, so every name against a shell is our interpretation. '
    + 'Sizes are in model units; a 0.000 means the part is flat.')
  box.append(key)

  let heading = ''
  for (const part of parts) {
    const want = part.label.ours ? `inside ${SPLIT_NODE} · our names` : 'nodes in the file · Kenney'
    if (want !== heading) {
      heading = want
      const h = document.createElement('p')
      h.className = 'head'
      h.textContent = heading
      box.append(h)
    }
    const row = document.createElement('div')
    row.className = 'part' + (part.label.ours ? ' ours' : '')
    const name = document.createElement('span')
    name.className = 'name'
    name.textContent = (part.label.ours ? 'our name: ' : '') + part.label.name
    const facts = document.createElement('span')
    facts.className = 'facts'
    facts.textContent = ` — ${sizeLabel(part.facts.size)} · ${part.facts.tris} tris · ${part.facts.verts} verts`
    row.append(name, facts)
    box.append(row)
  }

  const flat = parts.filter(p => Math.min(...p.facts.size) === 0).length
  $('#count').textContent = `${parts.length} parts`
    + (flat ? ` · ${flat} of them flat (zero thickness)` : '')
}

/* ------------------------------------------------------------ the catalogue */

interface Shown extends Entry { onDisk: boolean; notes: number }

let gallery: Gallery = 'assembled'
let catalogue: Entry[] = []
let disk: Record<string, string[]> = {}
let notes: Array<{ assetId: string; note: string; at: string }> = []
/**
 * THE BENCH: every assembled animal, joined to its name, its fact and whatever
 * Joe has already said about it.
 *
 * One entry per row of `assembled` below and in the same order, because
 * `approverBench` promises exactly that — see the exhaustiveness note at the top
 * of `approver.ts`. Rebuilt from `/api/state` on boot and never sorted after: he
 * works down a list, and a row that moves under the cursor takes his place with
 * it.
 */
let bench: Creature[] = []
/**
 * The same animals as GEOMETRY: what the assembler can build, joined to the
 * roster's collection titles. Read once at boot off `assembledSpecies()` and
 * never sorted after: the assembler's order is the pilot's order and is where his
 * place is kept.
 *
 * Held beside `bench` rather than folded into it because the two are read by
 * different halves of the page — `bench` is what the card judges, `assembled` is
 * what the canvas and the pair labels are built from, and `groupRows` takes these
 * rows.
 *
 * Empty is a NORMAL state here and is not an error — the pilot lands one species
 * at a time, so before the hedgehog arrives there is genuinely nothing to show.
 * `NOTHING_YET` is what the rail says in that case.
 */
let assembled: AssembledRow[] = []
/**
 * Why the assembled bench is empty, when the reason is a throw rather than a
 * pilot that has not started.
 *
 * `assembledSpecies()` raises by name on a build filed against a species the
 * roster does not have, which is right — a silent skip would hide a real
 * mistake. But it is called during `boot()`, and an unhandled throw there takes
 * the tiles, the props and the species galleries down with it over a fault in
 * one animal. So it is caught, kept, and printed on the bench it belongs to.
 */
let assembledFault = ''
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

  /*
   * Which packs this gallery is allowed to list — `registry.ts packsFor`, and
   * deliberately not an inline ternary. The inline version had an unwritten
   * else, and `built` fell into it and listed the props.
   */
  const packs = packsFor(gallery)
  const orphans: Entry[] = []
  for (const [pack, files] of Object.entries(disk)) {
    if (!packs.includes(pack as Entry['pack'])) continue
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
 * The animals on screen. Filtered by the search box and by NOTHING ELSE.
 *
 * In particular an APPROVED animal is not hidden. `app.js` learned this the
 * expensive way on the name audit: he is working down a list, and a row that
 * vanishes from under the cursor the moment he ticks it takes his place with it.
 * A tick shows as a tick and the row stays exactly where it was; the bar above
 * moves immediately, so the save is never in doubt.
 */
const assembledShown = (): AssembledRow[] =>
  filterRows(assembled, $<HTMLInputElement>('#search').value)

/** The creature behind a rail row. Always present — `approverBench` emits one per row. */
const creatureOf = (id: string): Creature | undefined => bench.find(c => c.speciesId === id)

/** Every id currently listed, in list order — what the arrow keys page through. */
const listedIds = (): string[] => {
  if (gallery === 'anatomy') return anatomyShown()
  if (gallery === 'assembled') return assembledShown().map(r => r.id)
  return shown().map(e => e.id)
}

/** The pack animals on screen, filtered by the search box and nothing else. */
function anatomyShown(): string[] {
  const q = $<HTMLInputElement>('#search').value.trim().toLowerCase()
  return ANATOMY_SPECIES.filter(s => !q || s.includes(q))
}

function drawAnatomyList(): void {
  const list = $('#list')
  list.replaceChildren()
  const items = anatomyShown()

  const head = document.createElement('li')
  head.className = 'group'
  head.textContent = `pack animals · ${items.length}`
  list.append(head)

  for (const id of items) {
    const li = document.createElement('li')
    li.className = 'item' + (id === picked ? ' on' : '')
    li.textContent = id
    li.title = `pets/${petIdOf(id)}.glb`
    li.onclick = () => void select(id)
    list.append(li)
  }
}

/**
 * The approver's rail: one row per animal, grouped by collection, each carrying
 * how far he has got with it.
 *
 * The row is named by the GIVEN name and not by the species, because the given
 * name is what a child sees and what the album prints; the species follows in the
 * meta so the row can still be found by what it is. A creature the audit file has
 * never heard of has no given name to print, so it prints its species and wears
 * the `missing` styling — the same styling a registry entry with no file on disk
 * wears, and for the same reason: something real is named here that the files
 * have not caught up with.
 *
 * Every row wears `ASSEMBLED` and every group heading wears it too. The gallery
 * it distinguished them from is gone, but the mark is not decoration now either —
 * it is the answer to "is this the new geometry or the junk", which he asked once
 * and would have to trust the tab for otherwise.
 *
 * A flagged build carries `⚑` in its own colour — a note's colour, not the
 * warning colour the missing rows use — because a flag is the escape clause
 * working rather than a fault.
 */
function drawAssembledList(): void {
  const list = $('#list')
  list.replaceChildren()
  const items = assembledShown()

  if (!assembled.length) {
    const empty = document.createElement('li')
    empty.className = 'group'
    empty.textContent = assembledFault ? 'the assembler threw' : 'nothing assembled yet'
    list.append(empty)
    const why = document.createElement('li')
    /* A throw is a fault and wears the warning colour; an empty pilot is not and
     * does not. Telling them apart is the difference between "the first animal
     * has not landed" and "one of them is broken", and he cannot act on either
     * if the page says the same thing for both. */
    why.className = 'railnote' + (assembledFault ? ' scrapped' : '')
    why.textContent = assembledFault
      ? `src/island/species/parts refused to list what it can build: ${assembledFault}`
      : NOTHING_YET
    list.append(why)
    $('#count').textContent = '0 assembled'
    return
  }

  for (const group of groupRows(items)) {
    const head = document.createElement('li')
    head.className = 'group'
    head.textContent = groupHeading(group)
    list.append(head)

    for (const row of group.items) {
      const c = creatureOf(row.id)
      const approved = c?.signoff === APPROVED

      const li = document.createElement('li')
      li.className = 'item creature assembledrow'
        + (row.id === picked ? ' on' : '')
        + (approved ? ' done' : '')
        + (c?.onBench ? '' : ' missing')

      const tick = document.createElement('span')
      tick.className = 'tick'
      tick.textContent = approved ? '✓' : '·'

      const chip = document.createElement('span')
      chip.className = 'chip ours'
      chip.textContent = NEW_METHOD_SHORT
      li.append(tick, chip, `${c?.given || row.name} `)

      if (row.flagged) {
        const flag = document.createElement('span')
        flag.className = 'flagmark'
        flag.textContent = FLAG_GLYPH
        li.append(flag)
      }

      const who = document.createElement('span')
      who.className = 'meta'
      who.textContent = row.name
      li.append(who)

      li.title = rowTitle(row)
        + (c && !c.onBench ? `\n${row.id} ${NO_AUDIT_ROW}` : '')
      li.onclick = () => void select(row.id)
      list.append(li)
    }
  }

  $('#count').textContent = countLabel(assembled, items)
}

/**
 * Where he has got to, over the WHOLE bench.
 *
 * The counts never describe the filtered view, for the same reason the name
 * panel's bar does not: a number that shrinks when he types in the search box
 * cannot tell him how much of the job is left. Every clause under the bar is
 * `progressOf`'s, in its fixed order, so a number he has learned the position of
 * does not move when another one goes to zero.
 */
function drawProgress(): void {
  const p = progressOf(bench)
  const bar = $<HTMLProgressElement>('#benchBar')
  bar.max = Math.max(1, p.total)
  bar.value = p.approved
  $('#benchDone').textContent = p.label
  $('#benchMeta').textContent = p.meta.join(' · ')
}

function drawList(): void {
  if (gallery === 'anatomy') { drawAnatomyList(); return }
  if (gallery === 'assembled') { drawAssembledList(); drawProgress(); return }
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
  showingGrid = false
  say(`loading ${id}…`)
  try {
    const object = await build(id)
    if (mine !== token) return                        // a newer click won
    clearStand()
    stand.add(object)
    frame(object, 1.6, frameRadius())
    /* The parts only exist once the GLB has been taken apart, so the labels and
     * the list beside the canvas are built HERE and not in `drawDetail` above. */
    if (gallery === 'anatomy') {
      $<HTMLSelectElement>('#speciesSelect').value = id
      drawTags()
      drawAnatomy()
    }
    /* The two labels only exist once both halves are on the stand, so they are
     * hung HERE rather than in `drawDetail` — same reasoning as the anatomy tags
     * one line up. */
    if (gallery === 'assembled') drawPairTags()
    say('')
  } catch (err) {
    if (mine !== token) return
    /* The loader's own message. A 404 here usually means the ID is right and the file is not. */
    say(`${id}: ${(err as Error).message}`, true)
  }
}

function build(id: string): Promise<THREE.Object3D> {
  if (gallery === 'anatomy') return loadAnatomy(id)
  /* Always the pair, never the animal alone — see `loadAssembled`. Grid mode
   * therefore lays out a grid of PAIRS, which is the right answer for the
   * question this gallery asks: a collection is judged one comparison at a time
   * and then all at once, against the same original each time. */
  if (gallery === 'assembled') return loadAssembled(id)
  if (gallery === 'species') return loadPet(id, $<HTMLSelectElement>('#setSelect').value)
  if (gallery === 'tiles') return loadTile(id, $<HTMLSelectElement>('#seasonSelect').value as Season)
  return loadProp(id, $<HTMLInputElement>('#greyToggle').checked)
}

function drawDetail(): void {
  if (gallery === 'assembled') return drawCreature()
  if (gallery === 'anatomy') return drawAnatomy()
  $('#creature').hidden = true
  $('#anatomy').hidden = true
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

  drawNotes()
}

/**
 * The notes he has left against whatever is selected.
 *
 * Named rather than inlined at the bottom of `drawDetail` because the approver
 * wants them too. The card's own two note fields are about the NAME and the FACT
 * specifically — they land in `joe/names-audit.json` beside the verdicts they
 * qualify — and there is nowhere in that file for "the spikes are too big". The
 * per-asset note box keys on the species id and already persists, so it is the
 * honest place for a remark about the MODEL.
 */
function drawNotes(): void {
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
 * which is the honest way round.
 *
 * It returns WHETHER IT SAVED, and that is not decoration. The strike buttons
 * change one field and can afford to show the change first and let a refusal
 * shout; the one approval writes three fields at once, and a card that ticked
 * itself over a save that never happened would tell him an animal was approved
 * when the file says nothing of the kind. So the gate waits for this answer
 * before it moves.
 */
async function patchCreature(c: Creature, fields: Record<string, string>): Promise<boolean> {
  if (!c.onBench) {
    say(`${c.speciesId} ${NO_AUDIT_ROW}`, true)
    return false
  }
  const out = await api('/api/save', { what: 'names', patch: { id: c.auditId, ...fields } })
  if (out?.error) { say(out.error, true); return false }
  say(`saved ${out.saved}`)
  return true
}

/** The check the fact-checking pass recorded, as a word and a colour. */
function checkPill(c: Creature): HTMLElement {
  if (!c.fact) return el('span', 'pill pending', 'no fact yet')
  if (c.factCheck === VERIFIED) return el('span', 'pill ok', 'verified')
  if (!c.factCheck) return el('span', 'pill pending', 'not checked')
  return el('span', 'pill warn', c.factCheck)
}

/**
 * THE CARD. One animal, everything he needs to judge it, and one button.
 *
 * Joe, 29 July 2026: *"ultimately i want to approve name, fact and 3D model in
 * one go."* So the pane reads top to bottom as a single judgement and is ordered
 * for that read rather than by what is easiest to build:
 *
 *   1. HOW IT WAS MADE, first and unmissable, so nothing below is read against
 *      the wrong kind of animal.
 *   2. Any alarm — a stale audit row, a collection the roster has never heard
 *      of, no row to save into at all.
 *   3. The build's flag, if it raised one. A note, not an alarm: the escape
 *      clause is the method working.
 *   4. WHICH HALF OF THE PAIR IS OURS, in `pairCard`'s own words, because the
 *      model is half of what he is approving and the two animals on the canvas
 *      look equally real.
 *   5. The name, the fact, and then the one button that covers all three.
 *
 * The two Strike buttons above the button are not rival gates: they are how he
 * approves the ANIMAL while saying the name is wrong, or the sentence is. An
 * existing strike survives the approval — see the long note in `approver.ts` —
 * so the strike is a considered judgement rather than a blocker.
 *
 * Nothing here is hidden when it is missing. A fact that has not been drafted
 * says so, a fact nobody checked says so in the pill AND in the body, and a
 * creature the audit file has never heard of says that its approval has nowhere
 * to land. A surface that quietly showed a blank where a fact belongs would let
 * him approve a dozen animals and believe he had read a dozen sentences.
 */
function drawCreature(): void {
  const box = $('#creature')
  box.hidden = false
  box.replaceChildren()
  $('#anatomy').hidden = true

  const c = creatureOf(picked)
  const row = assembled.find(r => r.id === picked)
  const dl = $('#facts')
  dl.replaceChildren()
  $('#assetId').textContent = c ? (c.given || c.species) : '—'

  /* Nothing selected is a NORMAL state here and is not a blank card: the pilot
   * lands one species at a time, so before the first one arrives there is
   * genuinely nothing to approve. A throw out of the assembler is a different
   * thing entirely and wears the alarm. */
  if (!c || !row) {
    if (assembledFault) {
      box.append(el('p', 'alarm',
        `src/island/species/parts refused to list what it can build: ${assembledFault}`))
    } else {
      box.append(el('p', 'pending', NOTHING_YET))
    }
    drawNotes()
    return
  }

  /* ---- 1. which method built it, first and unmissable */
  box.append(el('p', 'methodmark', NEW_METHOD_MARK))

  const put = (label: string, value: string) => {
    dl.append(el('dt', '', label), el('dd', '', value))
  }
  put('species', c.species)
  put('collection', `${c.collectionName} (${c.collection})`
    + (c.unknownCollection ? '  — not a collection the roster knows' : ''))
  put('given name', (c.given || 'none yet') + (c.replacement ? `  →  ${c.replacement}` : ''))
  put('name band', c.band || 'unknown')
  put('built by', `src/island/species/parts — assembled from lifted pack geometry · ${c.speciesId}`)

  /* ---- 2. the alarms */
  /* The audit file was generated from a roster that has since moved. Loud,
   * because `naming.ts` is explicit that inserting a species mid-roster renames
   * the ones after it, and a name he approves has to be the name that ships. */
  if (c.drift) {
    box.append(el('p', 'alarm',
      `joe/names-audit.json calls this one ${c.benched}; the roster now calls it ${c.species}. `
      + 'The audit file is stale against the roster — do not approve this until they agree.'))
  }
  if (!c.onBench) {
    box.append(el('p', 'alarm',
      'No row in joe/names-audit.json for this species yet, so there is nowhere for an '
      + 'approval to land. It appears here because the assembler can build it; the audit '
      + 'file catches up when the roster is regenerated.'))
  }
  if (c.unknownCollection) {
    box.append(el('p', 'alarm',
      `This build is filed under '${c.collection}', which is in no collection the roster has. `
      + 'The animal still shows; what is wrong is where it says it belongs.'))
  }

  /* ---- 3. the flag, as a NOTE rather than an alarm */
  if (c.flagged) {
    const note = el('div', 'flagnote')
    const flagHead = el('div', 'row')
    flagHead.append(el('span', 'flagmark big', FLAG_GLYPH), el('h3', '', FLAG_HEADING))
    note.append(flagHead, el('p', 'factText', flagNote(row)))
    box.append(note)
  }

  /* ---- 4. what is on the turntable, in the same words the labels over it use */
  const pairing = el('div', 'judge')
  pairing.append(el('h3', '', 'What you are looking at'))
  pairing.append(el('p', 'factText meta',
    pairCard(row, referenceOr($<HTMLSelectElement>('#besideSelect').value)).why))
  box.append(pairing)

  /* ---- 5a. the name */
  const nameRow = el('div', 'judge')
  nameRow.append(el('h3', '', 'The name'))
  /*
   * The word itself, inside the section that judges it.
   *
   * It was only in the `#facts` list above the card, which meant the one
   * section headed "The name" showed a strike button and two empty boxes and no
   * name — so the thing being struck was several inches away from the button
   * striking it. The fact sits next to its own strike button; the name now does
   * too, and both read the same way.
   */
  nameRow.append(el('p', 'factText', c.given === '' ? `${c.speciesId} ${NO_AUDIT_ROW}` : c.given))
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

  /* ---- 5b. the fact */
  const factRow = el('div', 'judge')
  const head = el('div', 'row')
  head.append(el('h3', '', 'The fact'), checkPill(c))
  factRow.append(head)

  if (c.fact) {
    factRow.append(el('p', 'factText', c.fact))
    if (c.factSource) factRow.append(el('p', 'meta', `source: ${c.factSource}`))
    /* What the source SAYS, beside the sentence it is meant to back. A bare URL
     * is not evidence to a man reading a dozen of these in a sitting. */
    if (c.sourceNote) factRow.append(el('p', 'meta', `the source says: ${c.sourceNote}`))

    /*
     * AN UNCHECKED OR FLAGGED FACT IS NEVER PRESENTED AS FINE.
     *
     * The pill says `verified` or it does not, and a pill is a glance. Twelve of
     * the sentences in `joe/species-facts.json` came back `flagged`, and the
     * whole reason JT-031 puts the fact inside the approval is that a wrong one
     * ends up printed in front of a child as true. So the state is spelled out in
     * the body as well, and the checker's own preferred wording is put in front
     * of him when it had one — offered, never applied. Only his verdict is
     * written; taking the rewrite is a thing he does by hand.
     */
    if (c.factCheck !== VERIFIED) {
      factRow.append(el('p', 'pending', c.factCheck
        ? `The fact-checking pass returned '${c.factCheck}' for this sentence rather than `
          + 'verified. Read it against the source before approving it, or strike it.'
        : 'Nothing has checked this sentence. It is a draft standing where a fact belongs '
          + 'until the checking pass reaches it.'))
      if (c.proposedRewrite) {
        factRow.append(el('h3', '', 'The wording the checker would rather have'))
        factRow.append(el('p', 'factText', c.proposedRewrite))
        factRow.append(el('p', 'meta',
          'A suggestion from the drafting side, applied by nothing here. Put it in the note '
          + 'below if you want it taken.'))
      }
    }
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

  /*
   * ---- 5c. THE ONE BUTTON. One click, one save, three fields.
   *
   * `approvePatch` returns all three verdicts as one object and it goes to the
   * server in ONE request, because three requests are three chances for the
   * second to fail after the first has landed — and an animal whose name is
   * approved and whose model is not is a state nothing on this page can show him.
   * The local copy is then updated from THAT SAME OBJECT rather than from three
   * lines written out again here, so the card and the file cannot disagree about
   * what he just did.
   *
   * Clicking it again re-opens: a mis-click is one click to undo, and '' is a
   * real state — not yet judged, and not a rejection. What re-opening does NOT do
   * is clear a strike; see the note in `approver.ts`.
   */
  const done = c.signoff === APPROVED
  const gate = el('button', 'signoff' + (done ? ' on' : ''), done ? REOPEN_LABEL : APPROVE_LABEL)
  gate.disabled = !c.onBench
  gate.onclick = async () => {
    const patch = done ? reopenPatch(c) : approvePatch(c)
    if (!await patchCreature(c, patch)) return
    c.signoff = patch['signoff'] ?? ''
    c.verdict = patch['verdict'] ?? ''
    c.factVerdict = patch['factVerdict'] ?? ''
    drawList()
    drawProgress()
    drawCreature()
  }
  box.append(gate)

  if (!done && !c.fact) {
    box.append(el('p', 'meta',
      'Approving now covers the model, the collection and the name only — there is no fact '
      + 'yet to cover. The bar counts those separately so they can be revisited.'))
  }

  /* The per-asset notes, under the card rather than inside it: a remark about the
   * MODEL has nowhere in `joe/names-audit.json` to live — see `drawNotes`. */
  drawNotes()
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
  /* For the ASSEMBLED animals the group is the COLLECTION, which is the
   * comparison that matters: roster §4 flags whole groups that "will read as
   * duplicates unless size, palette and marking are deliberately separated", and
   * the pilot works a collection at a time — so "do these fourteen read as one
   * set" is the question that follows "does this one sit beside the fox". Each
   * cell is a PAIR, so the reference animal repeats down the grid, which is the
   * point rather than a waste: it is the constant every one is judged against. */
  const bucket: Array<{ id: string }> = gallery === 'assembled'
    ? assembledShown().filter(r => r.collection === assembled.find(x => x.id === picked)?.collection)
      .map(r => ({ id: r.id }))
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
  /*
   * ONE SCALE FOR THE WHOLE GRID, and it is the same one single view uses.
   *
   * What was here divided each cell by its OWN largest dimension — a third
   * per-model normaliser, and a different one again from the two in the pair path,
   * so a 1.250 cube could be drawn at three different sizes on the same page
   * depending on which tab and which mode Joe happened to be in. That is precisely
   * the confusion his note about size came out of, so the grid takes
   * `SHARED_SCALE` like everything else and a cube is the same cube everywhere.
   *
   * The pairs come out of `loadAssembled` ALREADY shared-scaled, so scaling them
   * again here would halve them; only the raw single models — pets, tiles, props —
   * need the multiply. Both paths end up at exactly one model unit = SHARED_SCALE.
   */
  const scale = gallery === 'assembled' ? 1 : SHARED_SCALE
  const holders: THREE.Group[] = []
  let widest = 0
  loaded.forEach(object => {
    if (!object) { holders.push(new THREE.Group()); return }
    const box = new THREE.Box3().setFromObject(object)
    const centre = box.getCenter(new THREE.Vector3())
    object.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z))
    const holder = new THREE.Group()
    holder.add(object)
    holder.scale.setScalar(scale)
    const size = box.getSize(new THREE.Vector3()).multiplyScalar(scale)
    widest = Math.max(widest, size.x, size.z)
    holders.push(holder)
  })
  /*
   * The pitch comes off the WIDEST cell rather than being the old fixed 1.4, and
   * that is forced by the line above: cells are no longer all one unit across, so a
   * constant pitch would either overlap the biggest (a shared-scaled pair is 2.9
   * across) or strand the smallest in white space. One pitch for every cell, so the
   * grid still says nothing about size that the cells do not say themselves.
   */
  const pitch = Math.max(1.4, widest * 1.15)
  holders.forEach((holder, i) => {
    holder.position.set(
      ((i % columns) - (columns - 1) / 2) * pitch,
      0,
      (Math.floor(i / columns) - (Math.ceil(bucket.length / columns) - 1) / 2) * pitch,
    )
    cell.add(holder)
  })
  stand.add(cell)
  showingGrid = true
  /* Fitted to the GRID, which is right: the grid is one object and every cell in
   * it is drawn at the shared scale, so the fit cannot single any animal out. */
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
  $('#anatomyPick').hidden = next !== 'anatomy'
  $('#explodePick').hidden = next !== 'anatomy'
  /* Which original the new animal stands beside. Only this gallery pairs an
   * assembly with a pack model, so only this gallery gets the picker. */
  $('#besidePick').hidden = next !== 'assembled'
  /* Leaving the gallery takes its labels with it, or they hang over the next
   * model pointing at parts of an animal that is no longer on the stand. Both
   * label sets are cleared, because both draw into the one `#labels` layer. */
  if (next !== 'anatomy') { tags.length = 0; parts = [] }
  if (next !== 'assembled') { pairTags.length = 0; pairSides = null }
  if (next !== 'anatomy' && next !== 'assembled') $('#labels').replaceChildren()
  /*
   * The progress bar belongs to the APPROVER and would be a lie over the props,
   * which have nothing to be finished with. It is filled by `drawProgress` from
   * `progressOf(bench)` — the whole bench, never the filtered view.
   */
  $('#bench').hidden = next !== 'assembled'
  /* The asset-note box stays on every gallery now, the approver included. The
   * card's own note fields are about the NAME and the FACT and land beside the
   * verdicts they qualify; a remark about the MODEL — "the spikes are too big" —
   * has nowhere in `joe/names-audit.json` to live, so it goes here, keyed on the
   * species id like every other asset note. */
  /* Nothing to grid on the anatomy bench: it is already showing one animal in a
   * dozen pieces, and a grid of those would be unreadable. The approver DOES
   * grid, even though it pairs: its group is a whole collection and "do these
   * fourteen read as one set" is a real question the pilot has to answer. */
  $('#grid').hidden = next === 'anatomy'
  /*
   * THE TURNTABLE STOPS ON THE ANATOMY BENCH, and it is not a preference.
   *
   * Every part on that gallery carries a label projected from its centroid. On
   * a turntable those labels slide across each other twice a second and the
   * whole thing becomes unreadable within a few degrees — and worse, a label
   * that has drifted onto a neighbouring part is a wrong reading that looks
   * like a right one. That has already cost this project once, on the
   * `leg-adopt` row. Drag to orbit still works and is how you look round it.
   */
  if (next === 'anatomy' && spinning) $('#spin').click()
  /*
   * AND IT STOPS ON THE APPROVER, for a sharper version of the same reason.
   *
   * This gallery shows two animals side by side and both the card and the two
   * labels over the canvas say in as many words which is the pack's and which is
   * ours. A turntable swings the pair right round every few seconds and makes
   * that sentence false with nothing on screen looking wrong — and here the
   * sentence being false means he judges Kenney's animal as ours, or ours as
   * Kenney's, and then approves the result. Drag to orbit still works and is how
   * you look round it; the button and the space bar still start it deliberately.
   */
  if (next === 'assembled' && spinning) $('#spin').click()
  drawList()
  const listed = listedIds()
  /* The fox opens, not the beaver. It is the roster's reference animal and the
   * one every measurement in the primitives bench is quoted against, so it is
   * what "one example of an original animal" means. */
  const first = next === 'anatomy' && listed.includes(DEFAULT_SPECIES) ? DEFAULT_SPECIES : listed[0]
  if (first) void select(first)
  /* Nothing to select is a real state on the approver before the first species
   * lands, and the card has to say so rather than keep the last gallery's detail
   * pane on screen. */
  else if (next === 'assembled') { picked = ''; clearStand(); pairSides = null; drawPairTags(); drawDetail() }
}

$('#galleries').onclick = e => {
  const next = (e.target as HTMLElement).dataset?.gallery as Gallery | undefined
  if (next) setGallery(next)
}
$('#search').oninput = () => drawList()
$('#spin').onclick = () => { spinning = !spinning; $('#spin').textContent = spinning ? 'pause spin' : 'resume spin' }
$('#reset').onclick = () => { const o = stand.children[0]; if (o) frame(o, 1.6, frameRadius()) }
$('#grid').onclick = () => void showGrid()
$('#speciesSelect').onchange = () => void select($<HTMLSelectElement>('#speciesSelect').value)
/*
 * The slider, and the whole of the interaction it belongs to.
 *
 * `applyExplode` only writes a position onto each holder — no geometry is
 * rebuilt, nothing reloads — so dragging it is as cheap as moving the camera
 * and it can be dragged continuously without stuttering on a twelve-part hog.
 */
$('#explodeRange').oninput = () => {
  explode = Number($<HTMLInputElement>('#explodeRange').value)
  $('#explodeValue').textContent = explode.toFixed(2)
  applyExplode()
}
/* Changing the reference reloads the pair, exactly as changing the set reloads a
 * pet. Both halves are rebuilt, so the new original arrives at matched height
 * rather than inheriting the last one's scale. */
$('#besideSelect').onchange = () => void select(picked)
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

  const select$ = $<HTMLSelectElement>('#setSelect')
  for (const set of SETS) {
    const option = document.createElement('option')
    option.value = set.id
    option.textContent = set.name
    select$.append(option)
  }

  /* The 24 pack animals, off `ANATOMY_SPECIES` rather than typed into the HTML,
   * so the dropdown cannot fall behind what is on disk. */
  const animals = $<HTMLSelectElement>('#speciesSelect')
  for (const species of ANATOMY_SPECIES) {
    const option = document.createElement('option')
    option.value = species
    option.textContent = species
    option.selected = species === DEFAULT_SPECIES
    animals.append(option)
  }

  /* The 24 originals a new animal may be stood beside, off `REFERENCE_ANIMALS`
   * — which is `ANATOMY_SPECIES` through the loader's own prefix, so this list
   * cannot fall behind what is on disk either. The fox is selected, because the
   * sentence the method is judged against names the fox. */
  const beside = $<HTMLSelectElement>('#besideSelect')
  for (const id of REFERENCE_ANIMALS) {
    const option = document.createElement('option')
    option.value = id
    option.textContent = id
    option.selected = id === DEFAULT_REFERENCE
    beside.append(option)
  }

  /*
   * THE BENCH, read once and joined here and nowhere else.
   *
   * The geometry comes first because it is what decides who is on the bench at
   * all: `assembledSpecies()` is the assembler's own list of what it can actually
   * build — not a roster, not a plan — so an animal appears the moment its
   * assembly lands and never before. That is the pilot's delivery rule made
   * visible: one species at a time, each approvable as soon as it exists.
   *
   * Then the join. `state.names` is Joe's judgement so far; `state.facts` is
   * whatever the fact agent has written into `joe/species-facts.json`, passed
   * through unexamined by the API (see `api.mjs`). Either may be empty, and an
   * animal neither has heard of is still benched, marked and counted rather than
   * skipped — see the exhaustiveness note at the top of `approver.ts`.
   */
  try {
    assembled = assembledRows(assembledSpecies())
  } catch (err) {
    assembledFault = (err as Error).message
  }
  bench = approverBench(assembled, state.names ?? [], readFacts(state.facts))

  explode = Number($<HTMLInputElement>('#explodeRange').value)
  $('#explodeValue').textContent = explode.toFixed(2)

  catalogue = [...buildCatalogue(), ...tileEntries(Object.keys(models.geometry))]
  resize()
  /* The approver opens first: it is the surface he asked for, and the only one
   * with work outstanding in it. */
  setGallery('assembled')
}

void boot().catch((err: Error) => say(err.message, true))
