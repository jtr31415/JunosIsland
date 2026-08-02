/**
 * Every asset the game can name, taken from the tables the game deals from.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * The spec's requirement is that every ID here is "canonical by construction",
 * and this file is what that means in practice: nothing below is a typed list
 * of names. `SPECIES`, `FEATURES`, `COVER`, `MOUNTAIN_HEXES`, `LEAFY_TREES`,
 * `BARE_TREES`, `WATER_PIECES`, `PALETTE` and `INCREMENTS` are imported from
 * the modules that deal them, so an asset added to the game appears here on
 * the next reload and one deleted disappears. A hand-kept copy would be wrong
 * within a week and confidently wrong forever after.
 *
 * The `used` list is the reverse index that falls out of building it this way,
 * and it is most of the value: "this rock is in COVER.rocky and PALETTE.grass"
 * tells Joe where a change would land before he asks for one.
 */
import { SPECIES } from '../../../src/island/pets'
import { movesFor } from '../../../src/island/species/moves'
import {
  FEATURES, COVER, MOUNTAIN_HEXES, LEAFY_TREES, BARE_TREES, WATER_PIECES,
} from '../../../src/island/world/props'
import { INCREMENTS, PALETTE } from '../../../src/island/world/increments'
import { TILE_URL } from '../../../src/island/world/tiles'

/**
 * Every gallery the viewer's chrome can switch to, and the LIST IS THE UNION.
 *
 * Written this way round — `Gallery` derived from `GALLERIES` rather than a
 * hand-typed union beside a hand-typed array — because the two were about to
 * drift for the second time. `gallery-source.test.ts` held its own
 * copy — back then `['built','species','tiles','props']`, from before the
 * scrapped `built` gallery was folded away — so the very test written to stop
 * a gallery inheriting another's source could not see a fifth gallery at all.
 * One `as const` array is now the only place the set exists: a gallery added
 * here appears in the test that iterates it, and cannot compile until
 * `packsFor` below has written its arm.
 *
 * `assembled` sits FIRST because it is the whole job now: one animal assembled
 * at runtime under `docs/building-animals-from-parts.md`, standing beside a real
 * Kenney GLB, with Joe's one approval over its name, its fact and its model.
 * Neither half of the pair is this gallery's to list — the right half has no
 * file at all, and the left half is borrowed from the pets pack, which `species`
 * owns.
 *
 * Two galleries were removed on 29 July 2026 and the removal is the point rather
 * than a tidy-up. `built` benched the seventy-two the kits built, and Joe:
 * *"everything built already in terms of animals is scrap."* A scrapped model he
 * can still put on a turntable is a scrapped model he can approve by accident, so
 * the gallery is gone rather than relabelled. `primitives` benched the decisions
 * those kits were tuned against, and with the kits scrapped there is nothing left
 * for that sign-off to unblock. `primitives.ts` and `joe/primitives-audit.json`
 * stay on disk — the reasoning in them is worth keeping — but no tab reaches them.
 */
export const GALLERIES = ['assembled', 'anatomy', 'species', 'tiles', 'props'] as const
export type Gallery = typeof GALLERIES[number]
export type Pack = 'pets' | 'props' | 'forest' | 'tiles'

export interface Entry {
  /** The exact string the code passes to a loader. Nothing else is an ID. */
  id: string
  gallery: Gallery
  group: string
  pack: Pack
  /**
   * The file it resolves to, relative to the asset root.
   *
   * Separate from the ID because for tiles they are NOT the same string: the
   * code says `grass` and the disk says `hex_grass.gltf`. Holding only one of
   * them made the viewer report all six tiles missing and all six files
   * unused, which is a confident lie in both directions.
   */
  file: string
  /** Every place in the code that names it. */
  used: string[]
  /** Landscape rather than an object: sits centred and carries the skyline. */
  big?: boolean
  /** Drawn with the BASE atlas in game, so its rock reads grey rather than tan. */
  grey?: boolean
}

/**
 * Which pack a name comes out of.
 *
 * The game's own rule, copied from `PropField.load`: a leading capital means
 * the Forest Nature pack and its own texture, anything else is the hexagon
 * pack and the medieval atlas. Copied rather than imported because it lives
 * inside a closure — if it ever moves, this is the line that must follow it.
 */
export const packOf = (id: string): Pack => (/^[A-Z]/.test(id) ? 'forest' : 'props')

/**
 * Which packs on disk a gallery may list, and the reason this is a named
 * function rather than three lines inside `shown()`.
 *
 * It WAS three lines inside `shown()`: species → pets, tiles → tiles, and an
 * ELSE that meant props and forest. Three arms for four galleries. When the
 * since-deleted `built` gallery joined the union it fell out of that else and
 * inherited the props, so a gallery of animals listed every prop file on disk —
 * which is precisely what Joe reported on 29 July. Nothing caught it: the else
 * compiles, and no test named the join between a gallery and its source. That is
 * why every arm below is written out even when the answer is nothing.
 *
 * `anatomy` gets an empty list, and it is the case that tests the rule
 * hardest: it puts REAL pack GLBs on the turntable, `pets/animal-fox.glb` and
 * the other 23, so claiming `pets` would look reasonable. It is still wrong.
 * The species gallery owns that pack and is where a missing or unused pet file
 * should be reported; a second gallery claiming it would report every one of
 * them twice and would trip the cross-gallery guard in
 * `gallery-source.test.ts`. Anatomy borrows those files to take apart —
 * it is a view OF the pets, not a listing of them.
 *
 * `assembled` gets an empty list, and it is the harder of the two to get
 * right because BOTH its halves look claimable. The right half is an animal
 * assembled at runtime out of lifted parts and has no file anywhere, so there is
 * no directory listing it could be measured against. The left half is a real
 * `pets/animal-fox.glb` — so claiming
 * `pets` would look not merely reasonable but obviously correct. It is still
 * wrong, for the reason spelled out for `anatomy` above: the species gallery owns
 * that pack and is where a missing pet file must be reported once. A second
 * claim reports all 24 twice and trips the cross-gallery guard in
 * `gallery-source.test.ts`. This gallery borrows the fox to stand something
 * next to; it is not a listing of foxes.
 *
 * The switch has no default and the return type is not optional, so a gallery
 * added to `GALLERIES` without an arm here does not compile. That, plus the
 * test that iterates `GALLERIES`, is the whole guard.
 */
export const packsFor = (gallery: Gallery): readonly Pack[] => {
  switch (gallery) {
    case 'species': return ['pets']
    case 'tiles': return ['tiles']
    case 'props': return ['props', 'forest']
    case 'anatomy': return []
    case 'assembled': return []
  }
}

/** Where a scenery or pet ID resolves to, at the same base URL the game uses. */
export const fileOf = (id: string, pack: Pack): string =>
  pack === 'pets' ? `pets/${id}.glb` : `${pack}/${id}.gltf`

/** The disk name, for comparing a registry entry against what is actually there. */
export const basenameOf = (file: string): string =>
  file.slice(file.lastIndexOf('/') + 1).replace(/\.(gltf|glb)$/, '')

/** Merge into the catalogue, accumulating usages rather than overwriting. */
function add(
  into: Map<string, Entry>, id: string, gallery: Gallery, group: string,
  used: string, pack: Pack = packOf(id), extra: Partial<Entry> = {},
): void {
  if (!id) return                                    // FEATURES' open-ground rests
  const found = into.get(id)
  if (found) {
    if (!found.used.includes(used)) found.used.push(used)
    /* A name that is grey ANYWHERE is worth flagging everywhere it appears. */
    if (extra.grey) found.grey = true
    if (extra.big) found.big = true
    return
  }
  into.set(id, { id, gallery, group, pack, file: fileOf(id, pack), used: [used], ...extra })
}

/**
 * The tile render kinds, read off the loaded models rather than listed.
 *
 * `RenderKind` is a type and types do not exist at runtime, but
 * `TileModels.geometry` is keyed by exactly the same union — so the object the
 * game just loaded IS the canonical list, coast variants and all.
 */
export const tileEntries = (kinds: string[]): Entry[] => kinds.map(id => ({
  id, gallery: 'tiles' as const, pack: 'tiles' as const,
  group: id.startsWith('coast') ? 'coast variants' : 'hex models',
  file: TILE_URL[id as keyof typeof TILE_URL] ?? `tiles/${id}.gltf`,
  used: [`TILE_URL.${id}`],
}))

export function buildCatalogue(): Entry[] {
  const m = new Map<string, Entry>()

  for (const id of SPECIES) {
    m.set(id, {
      id, gallery: 'species', group: 'creatures', pack: 'pets',
      file: fileOf(id, 'pets'),
      // The actual locomotion word, not a yes/no: `moves.ts` now holds a
      // four-way judgement rather than a two-entry flying/not-flying set.
      used: ['SPECIES', `moves.ts: ${movesFor(id)}`],
    })
  }

  for (const [character, list] of Object.entries(FEATURES)) {
    for (const f of list) {
      add(m, f.name, 'props', 'tile features', `FEATURES.${character}`, undefined, { big: f.big })
    }
  }
  for (const h of MOUNTAIN_HEXES) {
    /* A mountain HEX binds the base palette — the difference Joe asked for twice. */
    add(m, h.name, 'props', 'mountain hexes', 'MOUNTAIN_HEXES', undefined, { grey: true })
  }
  for (const [character, list] of Object.entries(COVER)) {
    for (const id of list) add(m, id, 'props', 'ground cover', `COVER.${character}`)
  }
  for (const id of LEAFY_TREES) add(m, id, 'props', 'leafy trees', 'LEAFY_TREES')
  for (const id of BARE_TREES) add(m, id, 'props', 'bare trees', 'BARE_TREES')
  for (const id of WATER_PIECES) add(m, id, 'props', 'water pieces', 'WATER_PIECES')

  for (const [type, list] of Object.entries(PALETTE)) {
    list.forEach((id, i) => {
      /* The SECOND placement path — what a tile a child BUILT grows, step by step. */
      add(m, id, 'props', 'tile features', `PALETTE.${type}[${i}] · ${INCREMENTS[(i % 8) + 1]}`)
    })
  }

  return [...m.values()]
}

/**
 * The ten build steps, which are not models.
 *
 * Listed anyway, because "the plot increments" is a gallery the spec asks for
 * and because the interesting fact about a step is which palette it draws
 * from. Selecting one shows what it can put down; each of those is a real
 * entry in the props gallery.
 */
export const incrementSteps = (): Array<{ step: string; index: number; draws: string[] }> =>
  INCREMENTS.map((step, index) => ({
    step,
    index,
    draws: index === 0 || index === INCREMENTS.length - 1
      ? []
      : [PALETTE.grass[index - 1] ?? '', PALETTE.water[index - 1] ?? ''].filter(Boolean),
  }))

/**
 * Group an ordered catalogue into the nav tree, preserving first-seen order.
 *
 * Generic over the entry, so the viewer's decorated rows — the ones carrying
 * whether a file exists and how many notes it has — come back out still
 * carrying them.
 */
export function grouped<T extends { group: string }>(entries: T[]): Array<{ group: string; items: T[] }> {
  const out: Array<{ group: string; items: T[] }> = []
  for (const e of entries) {
    let bucket = out.find(g => g.group === e.group)
    if (!bucket) out.push(bucket = { group: e.group, items: [] })
    bucket.items.push(e)
  }
  return out
}
