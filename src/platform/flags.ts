/**
 * Which build this is, and what it is allowed to switch on.
 *
 * Phase 3 item 4. Two things, because they are the same thing: everything new
 * this phase lands behind a flag that is OFF in production, so half-built
 * features can be deployed and looked at without ever reaching the tablet
 * Juno plays on.
 *
 * `__CHANNEL__` is a BUILD-TIME constant, not a runtime lookup, and that is
 * the whole trick. A production bundle contains the literal string
 * `'production'`, so `__CHANNEL__ !== 'production'` folds to `false` and
 * Rollup deletes the branch — including any dynamic import inside it. That is
 * what "structurally unloadable in production" means: not guarded, absent.
 */

/** Injected by Vite. See vite.island.config.ts. */
declare const __CHANNEL__: string

export type Channel = 'production' | 'preview'

/**
 * Anything unrecognised is treated as production.
 *
 * Failing towards the safe answer. A typo in an environment variable must not
 * be the reason an unfinished feature reaches the child.
 */
export const CHANNEL: Channel =
  (typeof __CHANNEL__ === 'string' && __CHANNEL__ === 'preview') ? 'preview' : 'production'

export const isPreview = (): boolean => CHANNEL === 'preview'

/**
 * Every Phase 3 feature that is not finished, and the dev-only tooling.
 *
 * Adding a name here is how a feature becomes deployable. Removing it is how
 * a feature becomes real — a flag that is never retired is a branch nobody
 * dares delete.
 */
export const FLAGS = [
  /** `balance.dev.json`: compressed pacing, thresholds divided down. */
  'devBalance',
  /** Move the calendar by hand. */
  'devClock',
  /** Every species in every set, on turntables (item 6). */
  'petOMatic',
  /** Play any reveal or enchantment ceremony on demand (item 15). */
  'wonderGallery',
  /** Named sets and the variant engine (item 6). */
  'sets',
  /** The nursery, habitats and move-in (item 8). */
  'habitats',
  /** Pet quests (item 9). */
  'quests',
  /** The daily visitor (item 10). */
  'visitor',
  /** Stardust and the Star Pool (item 15). */
  'wonders',
] as const

export type FlagName = typeof FLAGS[number]

const isFlag = (name: string): name is FlagName =>
  (FLAGS as readonly string[]).includes(name)

export interface FlagSet {
  on(name: FlagName): boolean
  /** Everything currently on, for the dev stamp and the debug dump. */
  enabled(): FlagName[]
}

/**
 * Read the flags for this build.
 *
 * In PRODUCTION every flag is off and nothing can turn one on. Not "off by
 * default" — off, full stop: the query string is not consulted at all, so no
 * URL a child could conceivably arrive at can enable an unfinished feature.
 * A parent handing over a tablet is not going to audit a link.
 *
 * In PREVIEW they are all on by default, because that is what preview is for,
 * and `?off=sets,quests` turns individual ones back off for comparing.
 */
export function readFlags(search = '', channel: Channel = CHANNEL): FlagSet {
  if (channel === 'production') {
    return { on: () => false, enabled: () => [] }
  }

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const listed = (key: string): FlagName[] =>
    (params.get(key) ?? '').split(',').map(s => s.trim()).filter(isFlag)

  const off = new Set(listed('off'))
  /*
   * Whether `only` was GIVEN, not whether it matched anything.
   *
   * Conflating the two meant `?only=nonsens` — one dropped letter — turned
   * every flag ON rather than narrowing to nothing, which is the opposite of
   * what was asked for and the worst way to be surprised while comparing two
   * builds. A narrowing request that matches nothing narrows to nothing.
   */
  const narrowing = params.has('only')
  const only = listed('only')

  const live: FlagName[] = narrowing
    ? only.filter(f => !off.has(f))
    : FLAGS.filter(f => !off.has(f))
  const set = new Set(live)

  return {
    on: name => set.has(name),
    enabled: () => [...set],
  }
}
