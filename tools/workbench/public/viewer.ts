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
  buildCatalogue, tileEntries, incrementSteps, grouped, basenameOf, fileOf, packsFor,
  type Entry, type Gallery,
} from './registry'
import {
  builtBench, progressOf, readFacts, SIGNED_OFF, STRUCK, VERIFIED,
  type Creature,
} from './built'
import {
  primitivesBench, primitivesProgress, signedOff, struck,
  type Comparison, type Primitive,
} from './primitives'
import {
  weldedComponents, componentFacts, orderComponents, namesFor, explodeOffset, sizeLabel,
  ANATOMY_SPECIES, DEFAULT_SPECIES, SPLIT_NODE, petIdOf,
  type ComponentFacts, type PartName,
} from './anatomy'

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
  /* After the render, so a label sits on where the part was actually drawn. */
  moveTags()
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

/* --------------------------------------------------- the side-by-side --- */

/**
 * Scale a thing so it is exactly one unit tall, feet on y = 0, centred on x
 * and z.
 *
 * THE MATCH, and the one judgement in the whole render. The pack's models and
 * the kits' output are not the same size and never were, so "matched scale" has
 * to mean something specific: it means MATCHED HEIGHT. That is not an arbitrary
 * pick — every number on the eye rows is already a ratio against the animal's
 * height (the pack holds 0.19–0.29, the kits run 0.0597–0.1603), and Joe's
 * complaint about legs and feet is a claim about their size relative to the
 * animal they are attached to. Normalising by height makes the picture say
 * exactly what the numbers say.
 *
 * What it deliberately does NOT preserve is absolute model units. Nobody can see
 * those, and a fox at 1.66 beside a hyena at 1.05 would show a size difference
 * that has nothing to do with the question being asked.
 */
function toUnitHeight(object: THREE.Object3D): THREE.Group {
  const holder = new THREE.Group()
  holder.add(object)
  holder.updateMatrixWorld(true)

  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) return holder
  const scale = 1 / Math.max(1e-6, box.max.y - box.min.y)
  object.scale.multiplyScalar(scale)
  object.position.multiplyScalar(scale)

  holder.updateMatrixWorld(true)
  const after = new THREE.Box3().setFromObject(object)
  const centre = after.getCenter(new THREE.Vector3())
  object.position.sub(new THREE.Vector3(centre.x, after.min.y, centre.z))
  return holder
}

/** A thing whose name a comparison can ask for. */
class NoSuchPart extends Error {}

/**
 * Lift named meshes out of a model, keeping the size and pose they had in it.
 *
 * The pack ships nine node names across 133 mesh nodes, and `leg-front-left` is
 * one of them — the kits happen to name their own leg the same string, which is
 * what makes the Limbs comparison the same part from both sides rather than an
 * approximation invented here. Each mesh is copied with its WORLD matrix frozen
 * onto it, so a part is lifted exactly as it sat: the pack's transforms are
 * translations almost everywhere (only `cow/Group` carries a scale anywhere in
 * the pack) but "almost" is not a thing to build on.
 *
 * A name that matches nothing THROWS, by name. An empty group on a turntable is
 * the worst possible answer — it looks like a part that renders as nothing —
 * which is the same reasoning `kit.ts` gives for `UnbuiltKitError`.
 */
function lift(root: THREE.Object3D, names: readonly string[]): THREE.Object3D {
  if (!names.length) return root
  root.updateMatrixWorld(true)

  const out = new THREE.Group()
  root.traverse(node => {
    const mesh = node as THREE.Mesh
    if (!mesh.isMesh || !names.includes(node.name)) return
    const copy = mesh.clone()
    copy.matrixAutoUpdate = false
    copy.matrix.copy(mesh.matrixWorld)
    out.add(copy)
  })
  if (!out.children.length) {
    throw new NoSuchPart(`no mesh named ${names.join(' or ')} in it — the model has `
      + `${[...new Set(meshNames(root))].join(', ') || 'no named meshes'}`)
  }
  return out
}

const meshNames = (root: THREE.Object3D): string[] => {
  const found: string[] = []
  root.traverse(n => { if ((n as THREE.Mesh).isMesh && n.name) found.push(n.name) })
  return found
}

/**
 * The pack's real geometry beside the kit's real geometry, on one turntable.
 *
 * Both halves already existed on this page and neither is new: the left is the
 * species gallery's loader, `wearFaceUVs` and all, so the fox arrives wearing
 * the face decal that is the whole subject of the Face rows; the right is
 * `buildSpecies` called for real, exactly as the built-animals gallery calls it.
 *
 * NOTHING IS BAKED. The header of this file argues that at length for the built
 * animals and every word of it applies harder here: a baked preview is a copy,
 * a copy drifts, and Joe would be signing off a primitive against a picture of
 * what the kits used to do. When the kits are re-tuned after he signs, the right
 * half of this picture changes on the next reload with nobody remembering to
 * make it.
 *
 * Order of operations is load-bearing: each animal is scaled to one unit tall
 * BEFORE its part is lifted, so a lifted leg carries the size it had relative to
 * its own animal. Lifting first and then normalising the two legs to the same
 * height would show the leg's shape and hide the complaint — that they are too
 * big — which is most of what the Limbs rows are about.
 */
async function loadComparison(compare: Comparison): Promise<THREE.Object3D> {
  const [packWhole, kitWhole] = await Promise.all([
    loadPet(compare.packSpecies, ''),
    loadBuilt(compare.kitSpecies),
  ])

  const sides = [
    lift(toUnitHeight(packWhole), compare.packParts),
    lift(toUnitHeight(kitWhole), compare.kitParts),
  ]

  /* Grounded and centred, then pushed apart by their own half-widths, so a leg
   * and a whole fox both land side by side without one sitting inside the other. */
  const pair = new THREE.Group()
  const gap = 0.25
  sides.forEach((side, i) => {
    const box = new THREE.Box3().setFromObject(side)
    const centre = box.getCenter(new THREE.Vector3())
    side.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z))
    /* LEFT is the pack, RIGHT is the kit, always and in that order — the card
     * beside the canvas says so in those words and they must not disagree. */
    side.position.x += (i === 0 ? -1 : 1) * ((box.max.x - box.min.x) / 2 + gap / 2)
    pair.add(side)
  })
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
  const assembled = new THREE.Box3().setFromObject(group)
  reach = assembled.getBoundingSphere(new THREE.Sphere()).radius * 0.9

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

/** The same parts, read down the side: name, whose name it is, size, triangles. */
function drawAnatomy(): void {
  $('#creature').hidden = true
  $('#primitive').hidden = true
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
/**
 * The primitive decisions, joined to his verdicts. Rebuilt from `/api/state` on
 * boot and never sorted after: group order then the file's own order, which is
 * where his place is kept — see `primitives.ts`.
 */
let primitives: Primitive[] = []
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

/**
 * The primitives on screen. Filtered by the search box and by NOTHING ELSE.
 *
 * Same rule as `benchShown` above and learned the same expensive way: a row that
 * vanishes the moment he ticks it takes his place in the list with it. A signed
 * off primitive keeps its place and shows its tick.
 */
function primitivesShown(): Primitive[] {
  const q = $<HTMLInputElement>('#search').value.trim().toLowerCase()
  if (!q) return primitives
  return primitives.filter(p =>
    `${p.id} ${p.group} ${p.title} ${p.question}`.toLowerCase().includes(q))
}

/** Every id currently listed, in list order — what the arrow keys page through. */
const listedIds = (): string[] => {
  if (gallery === 'built') return benchShown().map(c => c.speciesId)
  if (gallery === 'primitives') return primitivesShown().map(p => p.id)
  if (gallery === 'anatomy') return anatomyShown()
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

/**
 * The primitives rail: grouped by Face / Edges / Limbs, each heading carrying
 * how far through that group he is.
 *
 * A group this build has no heading for still gets one, spelled with the string
 * the file actually used. The rows are written by agents that measure the pack
 * and they land ahead of the viewer that renders them, so an unknown group is a
 * real and temporary state; hiding those rows would make "3 of 8" a lie about
 * how much is left.
 */
function drawPrimitiveList(): void {
  const list = $('#list')
  list.replaceChildren()
  const items = primitivesShown()

  let group = ''
  for (const p of items) {
    if (p.group !== group) {
      group = p.group
      const head = document.createElement('li')
      head.className = 'group'
      const inGroup = items.filter(x => x.group === group)
      head.textContent = `${group || 'no group'} · ${inGroup.filter(signedOff).length} of ${inGroup.length}`
      list.append(head)
    }

    const li = document.createElement('li')
    li.className = 'item creature'
      + (p.id === picked ? ' on' : '')
      + (signedOff(p) ? ' done' : '')
      + (struck(p) ? ' struckrow' : '')

    const tick = document.createElement('span')
    tick.className = 'tick'
    tick.textContent = signedOff(p) ? '✓' : struck(p) ? '✗' : '·'
    li.append(tick, `${p.title || p.id} `)

    const who = document.createElement('span')
    who.className = 'meta'
    who.textContent = p.id
    li.append(who)

    li.title = p.compare
      ? `${p.id} · ${p.compare.packSpecies} beside ${p.compare.kitSpecies}`
      : `${p.id} · no side-by-side is defined for the group '${p.group}'`
    li.onclick = () => void select(p.id)
    list.append(li)
  }

  const p = primitivesProgress(primitives)
  $('#count').textContent = `${items.length} shown · ${p.left} to go`
}

/** Where he has got to across the WHOLE primitives bench, never the filtered view. */
function drawPrimitiveProgress(): void {
  const p = primitivesProgress(primitives)
  const bar = $<HTMLProgressElement>('#benchBar')
  bar.max = Math.max(1, p.total)
  bar.value = p.done
  $('#benchDone').textContent = p.label

  const bits: string[] = [`${p.left} to go`]
  /* A refusal is an answer and is counted as one. Rolling it into "to go" would
   * make the bench look unfinished forever over decisions he has already made. */
  if (p.struck) bits.push(`${p.struck} rejected`)
  if (p.odd) bits.push(`${p.odd} carrying a verdict nothing here understands`)
  if (p.ungrouped) bits.push(`${p.ungrouped} in an unknown group`)
  if (p.withoutPicture) bits.push(`${p.withoutPicture} with no side-by-side`)
  $('#benchMeta').textContent = bits.join(' · ')
}

function drawList(): void {
  if (gallery === 'built') { drawBenchList(); drawProgress(); return }
  if (gallery === 'primitives') { drawPrimitiveList(); drawPrimitiveProgress(); return }
  if (gallery === 'anatomy') { drawAnatomyList(); return }
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
    /* The parts only exist once the GLB has been taken apart, so the labels and
     * the list beside the canvas are built HERE and not in `drawDetail` above. */
    if (gallery === 'anatomy') {
      $<HTMLSelectElement>('#speciesSelect').value = id
      drawTags()
      drawAnatomy()
    }
    say('')
  } catch (err) {
    if (mine !== token) return
    /* The loader's own message. A 404 here usually means the ID is right and the file is not. */
    say(`${id}: ${(err as Error).message}`, true)
  }
}

function build(id: string): Promise<THREE.Object3D> {
  if (gallery === 'built') return loadBuilt(id)
  if (gallery === 'primitives') {
    const row = primitives.find(p => p.id === id)
    if (!row) return Promise.reject(new Error(`${id} is not on the primitives bench`))
    if (!row.compare) {
      return Promise.reject(new Error(
        `no side-by-side is defined for the group '${row.group}' — the row is still readable, `
        + 'but there is nothing to look at while deciding it'))
    }
    return loadComparison(row.compare)
  }
  if (gallery === 'anatomy') return loadAnatomy(id)
  if (gallery === 'species') return loadPet(id, $<HTMLSelectElement>('#setSelect').value)
  if (gallery === 'tiles') return loadTile(id, $<HTMLSelectElement>('#seasonSelect').value as Season)
  return loadProp(id, $<HTMLInputElement>('#greyToggle').checked)
}

function drawDetail(): void {
  if (gallery === 'built') return drawCreature()
  if (gallery === 'primitives') return drawPrimitive()
  if (gallery === 'anatomy') return drawAnatomy()
  $('#creature').hidden = true
  $('#primitive').hidden = true
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
  $('#primitive').hidden = true
  $('#anatomy').hidden = true

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

/* ------------------------------------------------- the primitive sign-off */

/**
 * One field of one primitive row, onto the file as it stands THIS INSTANT.
 *
 * The SAME `/api/save` patch path the creature card and `app.js` use, and
 * deliberately so: `joe/primitives-audit.json` has two authors — an agent
 * rewrites all eight measured fields of every row whenever it goes and measures
 * the pack again, Joe owns `signoff` and `note` — and the server re-reads and
 * merges inside the request so neither can silently overwrite the other. A
 * second persistence route would have to re-learn all of that and would learn it
 * wrong; `merge.mjs` exists because it was learned three times the expensive way.
 */
async function patchPrimitive(p: Primitive, fields: Record<string, string>): Promise<void> {
  const out = await api('/api/save', { what: 'primitives', patch: { id: p.id, ...fields } })
  if (out?.error) say(out.error, true)
  else say(`saved ${out.saved}`)
}

/**
 * One primitive's card: the question, the two measurements, the gap, the
 * proposal, the provenance, and one gate.
 *
 * Laid out in the order the argument has to be read, and nothing is hidden when
 * it is missing. What he is being asked is not "does this look nice" — the
 * models are on the turntable for that — it is whether the kits may build out of
 * this shape, and the answer stops or starts a re-tune. So `evidence` is on the
 * card rather than in a tooltip: a claim about the pack with no file:line beside
 * it is a claim he has no way to check, and this whole surface exists because
 * seventy-two animals were built on assumptions nobody wrote down.
 *
 * Two buttons, not one. 'reject' is a real answer — "the kits may NOT build out
 * of this" — and folding it into the absence of a tick would make a decision he
 * has made indistinguishable from one he has not reached.
 */
function drawPrimitive(): void {
  const p = primitives.find(x => x.id === picked)
  const box = $('#primitive')
  box.hidden = false
  box.replaceChildren()
  $('#creature').hidden = true
  $('#anatomy').hidden = true

  $('#assetId').textContent = p ? (p.title || p.id) : '—'
  const dl = $('#facts')
  dl.replaceChildren()
  if (!p) { box.hidden = true; return }

  const put = (label: string, value: string) => {
    if (!value) return
    dl.append(el('dt', '', label), el('dd', '', value))
  }
  put('group', p.group)
  put('id', p.id)

  if (!p.known) {
    box.append(el('p', 'alarm',
      `This row is in a group called '${p.group}', which this build of the viewer has no `
      + 'heading, no order and no side-by-side for. The row is still readable and still '
      + 'signable; the picture beside it is what is missing.'))
  }
  if (p.odd) {
    box.append(el('p', 'alarm',
      `Its sign-off field reads '${p.signoff}', which is none of the three this bench knows `
      + "('' not yet judged, 'ok' accepted, 'reject' refused). It is NOT being counted as a "
      + 'tick. Click one of the two buttons below to say what you meant.'))
  }

  /* ---- the question, first and largest. Everything under it is the case. */
  if (p.question) box.append(el('p', 'question', p.question))

  const section = (heading: string, text: string, className = ''): void => {
    if (!text) return
    const row = el('div', 'judge')
    row.append(el('h3', '', heading))
    row.append(el('p', 'factText' + (className ? ' ' + className : ''), text))
    box.append(row)
  }
  section('What the pack measures', p.packSays)
  section('What the kits do today', p.kitSays)
  section('The gap', p.gap)
  section('What we would change it to', p.proposal)

  /* Where the models beside this row come from, in the same words the canvas is
   * arranged in — LEFT is the pack, RIGHT is the kit, always. */
  if (p.compare) section('What you are looking at', p.compare.why, 'meta')
  else {
    section('What you are looking at', 'Nothing — no side-by-side is defined for this row, so it '
      + 'is numbers only. That is a gap in this viewer, not a statement about the primitive.', 'meta')
  }
  section('Evidence', p.evidence, 'meta')

  /* ---- his note */
  const noteRow = el('div', 'judge')
  noteRow.append(el('h3', '', 'Your note'))
  const why = el('input')
  why.value = p.note
  why.placeholder = 'note — what you want instead, or what this turns on'
  why.onchange = () => { p.note = why.value; void patchPrimitive(p, { note: why.value }) }
  noteRow.append(why)
  box.append(noteRow)

  /* ---- the one gate, in two directions */
  const gates = el('div', 'row gates')
  const yes = el('button', 'signoff' + (signedOff(p) ? ' on' : ''),
    signedOff(p) ? '✓ signed off — click to re-open' : 'Sign this primitive off')
  const no = el('button', 'refuse' + (struck(p) ? ' on' : ''),
    struck(p) ? '✗ rejected — click to re-open' : 'Reject it')

  /* Clicking the state it already has clears it: a mis-click is one click to
   * undo, and '' is a real state — not yet judged, and not a rejection. */
  const setTo = (want: string) => () => {
    p.signoff = p.signoff === want ? '' : want
    p.odd = false
    drawPrimitive()
    drawList()
    void patchPrimitive(p, { signoff: p.signoff })
  }
  yes.onclick = setTo(SIGNED_OFF)
  no.onclick = setTo(STRUCK)
  gates.append(yes, no)
  box.append(gates)

  box.append(el('p', 'meta',
    'Nothing in src/ is re-tuned until the primitive it rides on is ticked here. Signing this '
    + 'off is what unblocks the change; rejecting it is what stops it being made anyway.'))
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
  $('#anatomyPick').hidden = next !== 'anatomy'
  $('#explodePick').hidden = next !== 'anatomy'
  /* Leaving the gallery takes its labels with it, or they hang over the next
   * model pointing at parts of an animal that is no longer on the stand. */
  if (next !== 'anatomy') { $('#labels').replaceChildren(); tags.length = 0; parts = [] }
  /*
   * The progress bar belongs to the two SIGN-OFF benches and would be a lie over
   * the props, which have nothing to be finished with. Both fill the same three
   * elements, from `drawProgress` and `drawPrimitiveProgress` respectively.
   */
  const signing = next === 'built' || next === 'primitives'
  $('#bench').hidden = !signing
  /* The asset-note box is per-FILE and there is no file behind either bench: a
   * creature is built at runtime and a primitive is a decision. Both carry their
   * own note field inside the card, which is where a note about one belongs. */
  $('#noteForm').hidden = signing
  $('#notes').hidden = signing
  /* Nothing to grid: a primitive is already showing two models at once, and the
   * "group" it belongs to is Face or Limbs, which is not a thing to lay out. */
  /* Nothing to grid on the anatomy bench either: it is already showing one
   * animal in a dozen pieces, and a grid of those would be unreadable. */
  $('#grid').hidden = next === 'primitives' || next === 'anatomy'
  /*
   * THE TURNTABLE STOPS HERE, and it is not a preference.
   *
   * Every other gallery shows one object and spinning it is how you read a
   * silhouette. This one shows two, side by side, and the card beside the canvas
   * says in as many words that the LEFT is the pack and the RIGHT is the kit. A
   * turntable makes that sentence false every few seconds — the pair swings
   * right round — so he would be reading the pack's numbers against the kit's
   * geometry without a thing on screen looking wrong. Caught by screenshotting
   * the `leg-adopt` row four seconds after selecting it, by which point the
   * stand had turned about 115°.
   *
   * Stopped rather than removed: the button and the space bar still work, and
   * `clearStand()` puts the rotation back to zero on every selection, so a spin
   * he starts himself is one he knows about.
   */
  if (next === 'primitives' && spinning) $('#spin').click()
  /*
   * AND IT STOPS HERE TOO, for a sharper version of the same reason.
   *
   * Every part on this gallery carries a label projected from its centroid. On
   * a turntable those labels slide across each other twice a second and the
   * whole thing becomes unreadable within a few degrees — and worse, a label
   * that has drifted onto a neighbouring part is a wrong reading that looks
   * like a right one. That has already cost this project once, on the
   * `leg-adopt` row. Drag to orbit still works and is how you look round it.
   */
  if (next === 'anatomy' && spinning) $('#spin').click()
  drawList()
  const listed = listedIds()
  /* The fox opens, not the beaver. It is the roster's reference animal and the
   * one every measurement in the primitives bench is quoted against, so it is
   * what "one example of an original animal" means. */
  const first = next === 'anatomy' && listed.includes(DEFAULT_SPECIES) ? DEFAULT_SPECIES : listed[0]
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
  /*
   * The primitives bench, joined here and nowhere else.
   *
   * `state.primitives` is the whole of it — the measurements an agent wrote and
   * the two fields Joe owns, in one file, seeded with its rows so this surface
   * is resumable with nothing running but the workbench server. That was the
   * requirement: a review hour needs no manager.
   */
  primitives = primitivesBench(state.primitives ?? [])

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
  explode = Number($<HTMLInputElement>('#explodeRange').value)
  $('#explodeValue').textContent = explode.toFixed(2)

  catalogue = [...buildCatalogue(), ...tileEntries(Object.keys(models.geometry))]
  resize()
  /* The bench opens first: it is the surface he asked for, and the one with
   * work outstanding in it. */
  setGallery('built')
}

void boot().catch((err: Error) => say(err.message, true))
