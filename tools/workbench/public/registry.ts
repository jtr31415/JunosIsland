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
import { SPECIES, FLYERS } from '../../../src/island/pets'
import {
  FEATURES, COVER, MOUNTAIN_HEXES, LEAFY_TREES, BARE_TREES, WATER_PIECES,
} from '../../../src/island/world/props'
import { INCREMENTS, PALETTE } from '../../../src/island/world/increments'
import { TILE_URL } from '../../../src/island/world/tiles'

/**
 * `built` is the odd one and is NOT in this file's catalogue.
 *
 * The other three are things on disk that a loader opens. A built animal has no
 * file at all — it is constructed at runtime by `buildSpecies`, from a record in
 * `src/island/species/` — so nothing about it can be crossed against a directory
 * listing, and it has its own bench in `built.ts`. It is named in the union
 * because the viewer's chrome switches on it.
 */
export type Gallery = 'built' | 'species' | 'tiles' | 'props'
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
      used: FLYERS.has(id) ? ['SPECIES', 'FLYERS'] : ['SPECIES'],
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
      /* The SECOND placement path — what a tile she BUILT grows, step by step. */
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
