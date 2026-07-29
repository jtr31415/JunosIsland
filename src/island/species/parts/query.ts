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
 *
 * ## What this query CANNOT do, learned the expensive way
 *
 * Joe, 29 July, on the hedgehog's nose: *"all good but the pink tongue as the
 * nose. create a bespoke sphere for that."*
 *
 * The part was `wedge-10`, and the query that found it was right on every axis
 * it has. Size: the smallest solid nose-tip in the pack. Taper: 0.707, pointed.
 * Symmetry: mirror, so one copy is whole. Attachment: `z +1`, which is what a
 * nose tip does. Colour: `#e792bd`, measured off its own texels. Its own
 * provenance even calls it `nose-tip`, in the dog and the monkey. **Every
 * measurement agreed and the thing reads as a tongue.**
 *
 * **A shape's IDENTITY is not one of its measurements.** §3.1 says a part's
 * identity is its placement, and that is true and it is the multiplier this
 * whole file exists to create — but it is not the WHOLE truth. Some shapes carry
 * a strong read that survives being moved: a tongue, a beak, a horn, a claw, an
 * eye. Repurposing those is where §3.1 stops paying and starts costing.
 *
 * **Not fixed here, and the reason is worth stating.** A "reads as" caveat would
 * be new, human-assigned data on 129 shapes, and §3.2 is explicit that the
 * `shape` block is "derived from the geometry, never assigned by opinion" — so
 * it cannot live there. The cheap version is a small hand-kept list BESIDE the
 * generated bank, of the few shapes with an identity that travels, surfaced as a
 * CAVEAT on a result rather than as a filter on it (a filter would throw away
 * the multiplier, exactly as `form` did). It is not small enough to do in the
 * margin of a species build, and doing it wrong would be worse than the gap.
 * Recorded here so the next builder knows the axis is missing rather than
 * rediscovering it on the next tongue.
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
   * SHORTEST bounding-box extent, in model units. The other half of the size
   * axis, and the one that separates a plume from a whip.
   *
   * Added for the squirrel, and it earned its place the way §3.2 asks: it
   * discriminates something `longest` and `taper` cannot. The pack's seven tails
   * split cleanly on it — the cat's, lion's and tiger's are 0.20-0.28 thin and
   * the fox's, parrot's and beaver's 0.59-0.74, with nothing in between — while
   * on `longest` the fox's brush (0.910) and the tiger's whip (1.047) sit next
   * to each other and on `taper` the fox's 0.961 is a hair from the parrot's
   * 0.839. Asking for a big tail without asking for a THICK one returns a whip.
   *
   * This is a size window and not the `aspect` axis §3.2 deleted: it is absolute
   * model units, which the pack's one authoring scale makes meaningful, rather
   * than a normalised proportion, which is what never discriminated.
   */
  minThinnest?: number
  maxThinnest?: number
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
      const thinnest = Math.min(...p.size)
      if (q.minLongest !== undefined && s.longest < q.minLongest) return false
      if (q.maxLongest !== undefined && s.longest > q.maxLongest) return false
      if (q.minThinnest !== undefined && thinnest < q.minThinnest) return false
      if (q.maxThinnest !== undefined && thinnest > q.maxThinnest) return false
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

/**
 * "Something big and thick that the pack hung off the BACK of an animal."
 *
 * The squirrel's, written down beside `SPIKE_QUERY` for the same reason: a
 * builder that has to guess the numbers will guess different ones next time, and
 * a test can pin what this returns.
 *
 * It names no species, no role and no form — only a size window, a thickness
 * window and the direction the pack joined it in — and it returns exactly three
 * shapes, all of them tails: the fox's brush, the parrot's fan and the beaver's
 * paddle. Nothing else in 129 shapes is that big, that thick and rear-facing.
 * Which of the three is a squirrel's is then a measurement and not a name; see
 * `parts/assembled/animal-squirrel.ts`.
 */
export const BRUSH_QUERY: ShapeQuery = {
  minLongest: 0.8,
  minThinnest: 0.5,
  attachAxis: 'z',
  attachDir: -1,
}

/** The hulls: the shapes the pack used as the one mass, which attach to nothing. */
export const hullShapes = (): readonly BakedPart[] =>
  PARTS_BANK.filter(p => p.roles.includes('hull'))
