/**
 * The slug — a snail with the shell taken off, and the mantle is what is left.
 *
 * The two are built to be the same animal minus one part, because that is what
 * they are. `animal-snail` two rows up wears `box-19` on its back; this one
 * wears nothing there, and the diagnostic feature it gets instead is the
 * **MANTLE** — the saddle of thicker skin over the front third that carries the
 * breathing pore. That is `box-11`, the CATERPILLAR'S own body segment, worn
 * once at z = +0.25.
 *
 * **`box-11` is the only band in the bank that needs no thinning at all.** Its
 * bounding box is 1.4445 x 0.8769 x 0.4458 = 0.5647 against the hull's 1.9531, a
 * **ratio of 3.46**, clear of the 3 `assertAssembly` demands with nothing done
 * to it — `box-04` is 2.40, `box-35` is 2.18, `box-19` is 1.91 and `box-29` is
 * 1.43. `animal-glow-worm.ts` measured that and this is the second species to
 * spend it, wearing ONE where that animal wears five.
 *
 * Four `cone-01` tentacles in two pairs, and a flat `box-04` sole — both of them
 * the snail's, on purpose, because a slug has both.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own top face — the plane `box-11`'s `y +1` attachment names. */
const TOP_Y = 1.43125

/** `box-04` laid flat and thinned to 0.35 for rule 3 — the snail's own sole. */
const FOOT_THIN = 0.35

export const SLUG_ASSEMBLY = defineCreature('animal-slug', {
  /* NEW AND UNREVIEWED — the first slug ever built here. Brief §19 is "bright,
   * never scary", and a slug is the species where a child's reaction is the
   * whole risk: a warm honey brown rather than the black or the orange, and a
   * pale cream sole. */
  palette: {
    coat: 0xa8804e,   // UNREVIEWED: a warm honey brown
    belly: 0xf0e3cb,  // UNREVIEWED: the pale sole, and the sclera
    mantle: 0x8a6335,  // UNREVIEWED: THE MANTLE — a shade under the coat
    limb: 0x9c7549,   // UNREVIEWED: the four tentacles
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.5,

  legs: false,

  /* The caterpillar's own card, the smallest in the pack — the same as the
   * snail's, because they are the same eyes on the same animal. */
  eyes: { part: 'plate-06', x: 0.18, y: 1.02 },

  /* THE UPPER TENTACLES, by pure donor transfer onto this hull's top face,
   * which recovers the bank's recorded (0.227581, 1.506428, 0.469709). */
  ears: { part: 'cone-01', name: 'tentacle-upper', paint: 'limb' },

  extras: [
    /* THE MANTLE. The caterpillar's own body segment, worn ONCE over the front
     * third, at its own measured 0.910269 burial joined to this hull's top face
     * — a donor transfer with nothing stretched, spun or chosen. */
    { name: 'mantle', part: 'box-11', paint: 'mantle', at: [0, TOP_Y, 0.25] },
    /* THE LOWER TENTACLES, on the face — a quarter turn about x takes
     * `cone-01`'s `y +1` facing to `z +1`. */
    { name: 'tentacle-lower', part: 'cone-01', paint: 'limb', kind: 'pair', spin: [{ axis: 'x', deg: 90 }], at: [0.18, 0.72, 0.625] },
    /* THE FOOT. `box-04` laid flat into the ground plane — `animal-slow-worm.ts`'s
     * own rotation, and the same sole `animal-snail.ts` wears. */
    { name: 'foot', part: 'box-04', paint: 'belly', stretch: [1, 1, FOOT_THIN], spin: [{ axis: 'x', deg: 90 }], axis: 'z', dir: 1, sink: 0.5, at: [0, 0.24, 0] },
  ],

  flag: 'A SLUG IS LONG AND LOW AND THIS ONE IS A CUBE, which is the same wall '
    + '`animal-worm.ts` and `animal-centipede.ts` report: `HullDef.stretch` is `never` and '
    + 'the pack\'s deepest shell is 1.3500. What carries the animal instead is the MANTLE '
    + 'and the four tentacles. ALSO: THE EYES ARE ON THE FACE AND NOT ON THE STALK TIPS — '
    + 'an eye card is pinned to the absolute z = 0.6350 with no `z` field at all (rule 5, '
    + 'made unsayable in `creature.ts`), so it cannot travel out to a tentacle tip. '
    + '`animal-snail.ts` reports the same thing. ALSO: AT 278 VERTICES IT IS UNDER THE '
    + 'PACK\'S 405 FLOOR, which is a norm that reports (your ruling of 3 August) and is what '
    + 'a legless animal with four features costs — `animal-goldfish` ships at 342 and the '
    + 'wren at 345. ALSO: NEW PALETTE, UNREVIEWED, and this '
    + 'is the species in the collection where brief §19 is doing the most work — a honey '
    + 'brown rather than a black slug, because a six-year-old has to want it in the album.',
})
