/**
 * Asking the bank for a SHAPE, without knowing a single name.
 *
 * `docs/building-animals-from-parts.md` §3.2 sets the acceptance test, and it is
 * a query rather than a taxonomy: *small tapering spikes, many, sunk* must
 * return the hog's tusk AND the hog's ear as candidates. Everything below exists
 * to answer that and nothing else.
 *
 * ## Which axes are here, and which were thrown away
 *
 * The census measured all six axes of `PartShape` against the pack and reported
 * back. This module is that report, in code:
 *
 *   - **taper** — kept, and load-bearing. It is the only axis that separates a
 *     shape that comes to a point from a shape that does not, and that is the
 *     whole question when you are looking for a spike.
 *   - **size** (`minLongest`/`maxLongest`) — kept. Absolute model units, because
 *     the pack is authored at one scale and rule 5 already knows absolute size
 *     matters. A repeated row wants the small end of a range.
 *   - **attachment** (`minSunkFraction`, `attachAxis`, `attachDir`) — kept, and
 *     it decided the hedgehog. Twelve copies of a shape whose measured
 *     attachment is `z +1` lie flat pointing forward; twelve copies of one that
 *     attaches `y +1` stand up. Same taper, same size, opposite animal.
 *   - **symmetry** — kept, narrowly. It discriminates in exactly one way that
 *     matters: `handed` says a left copy is not a right copy, so a builder that
 *     mirrors must mirror the geometry rather than reuse it. It never separated
 *     two shapes a builder would otherwise confuse.
 *   - **aspect** — DELETED. It never discriminated. Every pair of parts a
 *     builder might confuse was already separated by taper and size, and
 *     normalised bbox proportions added a third number that only ever agreed
 *     with them. §3.2 asks for that deletion to be recorded; this is the record.
 *   - **form** — DELETED AS A FILTER, kept as a LABEL on the record. This is the
 *     expensive one and it is why `findParts` in the generated bank is not the
 *     query a builder should use. The hog's tusk is a `wedge` at taper 0.586 and
 *     the hog's ear is a `cone` at taper 0.249. They do the same job. Any filter
 *     on `form` that catches the ear loses the tusk, and §3.2's acceptance test
 *     fails on the exact pair it names. A bucket boundary is not a measurement.
 *
 * So this file is deliberately smaller than the classification it queries.
 */
import { PARTS_BANK, type BakedPart, type PartShape } from './bank.generated'

/**
 * What a builder asks for. Every field is a MEASURED window, never a category.
 *
 * All windows are inclusive and all are optional; an empty query is the whole
 * bank, smallest first.
 */
export interface ShapeQuery {
  /** Longest bounding-box extent, in model units. */
  minLongest?: number
  maxLongest?: number
  /**
   * Cross-section at the narrow end over the wide end: 0 is a point, 1 a bar.
   * `maxTaper: 0.65` is "must narrow to at most two thirds" — wide enough to
   * hold both hog parts, which is the point.
   */
  minTaper?: number
  maxTaper?: number
  /** One value or a set. `handed` shapes need a mirrored copy, not a reused one. */
  symmetry?: PartShape['symmetry'] | readonly PartShape['symmetry'][]
  /**
   * Only shapes the pack demonstrably buried at least this deep, as a share of
   * the shape's own extent. A floor on the EVIDENCE, not on the placement —
   * §3.1 is explicit that depth is a dial a builder chooses.
   */
  minSunkFraction?: number
  /** The face the pack joined it to. `y` stands up; `z` points forward. */
  attachAxis?: 'x' | 'y' | 'z'
  attachDir?: 1 | -1
}

/**
 * Shapes matching every stated window, SMALLEST FIRST.
 *
 * Smallest first because the motivating case is a repeated row — twelve spikes,
 * six a side — and a row of twelve wants the small end of whatever it finds.
 */
export function findShapes(q: ShapeQuery): readonly BakedPart[] {
  const syms = q.symmetry === undefined ? null
    : (Array.isArray(q.symmetry) ? q.symmetry : [q.symmetry]) as readonly PartShape['symmetry'][]
  return PARTS_BANK
    .filter((p) => {
      const s = p.shape
      const a = p.attachment
      if (q.minLongest !== undefined && s.longest < q.minLongest) return false
      if (q.maxLongest !== undefined && s.longest > q.maxLongest) return false
      if (q.minTaper !== undefined && s.taper < q.minTaper) return false
      if (q.maxTaper !== undefined && s.taper > q.maxTaper) return false
      if (syms !== null && !syms.includes(s.symmetry)) return false
      if (q.minSunkFraction !== undefined
        && (a === null || a.sunkFractionMax < q.minSunkFraction)) return false
      if (q.attachAxis !== undefined && (a === null || a.axis !== q.attachAxis)) return false
      if (q.attachDir !== undefined && (a === null || a.dir !== q.attachDir)) return false
      return true
    })
    .slice()
    .sort((x, y) => x.shape.longest - y.shape.longest || (x.id < y.id ? -1 : 1))
}

/**
 * The one query the whole method turns on, written down once so it can be
 * pinned by a test and reused by a builder.
 *
 * "Small tapering things the pack itself buried" — §3.2's acceptance test. It
 * returns the hog's ear and the hog's tusk, among others, and it does so
 * WITHOUT naming a species, a role or a form.
 */
export const SPIKE_QUERY: ShapeQuery = {
  maxLongest: 0.5,
  maxTaper: 0.65,
  minSunkFraction: 0.2,
}

/** The hulls: the shapes the pack used as the one mass, which attach to nothing. */
export const hullShapes = (): readonly BakedPart[] =>
  PARTS_BANK.filter(p => p.roles.includes('hull'))
