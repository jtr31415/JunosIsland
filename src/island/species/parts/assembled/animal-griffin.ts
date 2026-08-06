/**
 * The griffin — an eagle's head and wings on a lion's body, and the two halves
 * are the pack's own eagle and the pack's own lion, part for part.
 *
 * The tail is `wedge-15`, **THE LION'S OWN TAIL**, at its own donor transfer:
 * the tuft at the end of it is what a child names a lion by after the mane, and
 * there is exactly one of them in the bank. The head is
 * `animal-golden-eagle.ts`'s hooked bill entire — `cone-06` forward, `box-24`
 * hung on its own built tip and spun 55 degrees down — which is the two-part
 * bend Raptors measured and sixteen birds now wear.
 *
 * ## THE HULL IS THE TIGER'S, AND THE LION'S OWN SHELL IS REFUSED — MEASURED
 *
 * `box-31` is the obvious reach for a lion-bodied animal and it cannot be taken,
 * for a reason worth writing down once because two species in this collection
 * hit it. **It has no front face at all.** Measured off its own 28 welded
 * points: its maximum z is 0.500, **zero triangles lie in that plane**, and the
 * points there form a ring spanning x -0.500 to 0.500 and y 0.306 to 1.306.
 * That is a 1.000 x 1.000 HOLE in the front of the head, and it is there because
 * the lion's `box-29` mane ring is what covers it. (`animal-goose.ts:70` records
 * the same finding as PB-075 and refuses the shell on it.)
 *
 * A griffin's face is most of its read, so an open one is not survivable. The
 * mane ring would plug it — and it is a RING, 1.650 x 1.650 with a hole in the
 * middle, so it plugs nothing; it would also have to be thinned to 0.35 of its
 * own depth to get past the harness's requirement that the hull be three times
 * the next biggest mesh (`box-29` is 1.3612 of volume against `box-31`'s 1.7578,
 * a ratio of 1.29).
 *
 * So the hull is `box-41`, the tiger's — the pack's biggest shell, a big cat's,
 * and the one that arrives with a **muzzle boss already cut**. `cone-06` is
 * 0.400 wide and that boss is a 0.400 x 0.400 face standing 0.100 proud at
 * z = 0.725, so the beak beds onto it exactly, at the y `animal-gorilla.ts`
 * solved for the same boss: 0.694 puts the bill's 0.401 of height on 0.494 to
 * 0.894, which is the boss and nothing else.
 *
 * **Nothing on this animal is solved off `box-41`'s bounding box**, which lies
 * on three of its six faces (`animal-goose.ts` §2). The wings take the flat
 * flank at 0.625 and that plate's own centre at 0.80625, both measured; the tail
 * takes the rear at -0.625, which is `box-03`'s own; the eyes take the goose's
 * solved 0.994319, the station at which a `plate-08` disc is exactly tangent to
 * the boss's corner and none of it is hidden behind it.
 *
 * **NO TALONS, AND IT IS RULE 9.** `wedge-11` at the front feet is the Raptors
 * idiom and it costs 76 triangles the budget has not got: this animal is 918 of
 * 951 with the tiger's 262-triangle shell and the lion's 212-triangle tail
 * already in it. The `claw` role has never been baked either — see
 * `collections/legendary.ts`, which adds this species to that tally.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT flank — not the 0.675 its bounding box claims (the goose §2). */
const FLANK_X = 0.625
/** That flat plate's own centre. `box-41`'s recorded centre is 0.83125. */
const FLANK_CENTRE_Y = 0.80625
/** The tiger's muzzle boss, standing 0.100 proud of the 0.625 front plate. */
const BOSS_Z = 0.725
/** The boss runs y 0.494-0.894 and `cone-06` is 0.401 tall: the only height that fits. */
const BILL_Y = 0.694
/** `cone-06` is 0.287 deep and its own 0.36 buries only 0.103 — under §3's floor. */
const BILL_SINK = 0.45

/**
 * Where a `plate-08` disc clears the muzzle boss entirely — `animal-goose.ts`'s
 * solve, on the same shell: the boss's nearest silhouette vertex to the card's
 * own x is (0.1414, 0.83515), and this is the station at which the disc of
 * radius 0.200 is exactly tangent to it.
 */
const EYE_X = 0.2625
const EYE_Y = 0.994319

/** The wing, buried past `wedge-19`'s own 0.17 (which is 0.097) to clear §3's floor. */
const WING_SINK = 0.25

export const GRIFFIN_ASSEMBLY = defineCreature('animal-griffin', {
  palette: {
    coat: 0xb08a4a,    // UNREVIEWED: lion tawny — the body half of the animal
    pale: 0xe8dcc0,    // UNREVIEWED: the eagle half, and the sclera
    flight: 0x8a6a34,  // UNREVIEWED: the wings and the tail tuft, a shade under
    limb: 0xd9a92c,    // UNREVIEWED: the yellow eagle foot
    hook: 0x2a2420,    // UNREVIEWED: the down-turned bill tip
    eye: 0xc98a1e,     // UNREVIEWED: amber to the rim
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* There is no `belly` slot, so the pale one is named for the eye cards. */
  under: 'pale',

  /* THE TIGER'S SHELL. `box-31`, the lion's own, is refused because it has no
   * front face — measured in the header, a 1.000 x 1.000 hole where the mane
   * goes. BAND 3 is this shell's own underline AND its whole muzzle boss in one
   * entry (`animal-horse.ts` §3), which puts the pale on the eagle's front
   * without a straight line and without the `belly` patch that could not have
   * been combined with a `byBand` anyway. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'pale' } } },

  /* Solved against the boss — see EYE_Y. */
  eyes: { part: 'plate-08', paint: 'eye', x: EYE_X, y: EYE_Y },

  /* THE BILL, bedded on the tiger's own muzzle boss at the gorilla's solved y. */
  snout: { part: 'cone-06', paint: 'pale', at: [0, BILL_Y, BOSS_Z], sink: BILL_SINK },

  /* THE LION'S OWN TAIL, at its own donor join onto the rear plate this shell
   * shares with `box-03` to the last decimal. Sunk past its recorded 0.14 —
   * which buries only 0.078 of 0.555 — to clear §3's absolute 0.125 floor;
   * `animal-shark.ts` takes the same shape to the same depth. */
  tail: { part: 'wedge-15', paint: 'flight', sink: 0.25 },

  extras: [
    /* THE HOOK: `animal-golden-eagle.ts`'s second part, joined to the bill's own
     * BUILT tip and spun 55 degrees down. A bend, not a curve — the bank holds
     * no curve at all — and it is what makes cone-06 read as a raptor's bill
     * rather than as the parrot's. */
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x', deg: 55 }] },

    /* THE WINGS, on the FLAT flank at that plate's own centre — never on the
     * 0.675 the bounding box claims, which is two pads. */
    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
      sink: WING_SINK,
      at: [FLANK_X, FLANK_CENTRE_Y, 0],
    },
  ],

  flag: 'THE LION\'S OWN SHELL IS REFUSED AND THE MEASUREMENT IS WORTH HAVING: box-31 HAS '
    + 'NO FRONT FACE. Its maximum z is 0.500, ZERO triangles lie in that plane, and the '
    + 'points there form a ring spanning x -0.500..0.500 by y 0.306..1.306 — a 1.000 x '
    + '1.000 hole in the front of the head, which is there because the lion\'s box-29 mane '
    + 'ring is what covers it. A griffin\'s face is most of its read, so it is on box-41, '
    + 'the tiger\'s: still a big cat\'s shell, the biggest in the bank, and it arrives with '
    + 'a MUZZLE BOSS already cut — a 0.400 x 0.400 face standing 0.100 proud at z 0.725, '
    + 'which is exactly cone-06\'s own width, so the eagle\'s bill beds onto it rather than '
    + 'overhanging a flat plate. THE TAIL IS THE LION\'S OWN TAIL, wedge-15, at its own donor JOIN '
    + '(sunk one grid step past its recorded 0.14, which buries only 0.078 of 0.555): the tuft is what a child names a lion by after the mane and there is one '
    + 'of them in the bank. THE BILL IS RAPTORS\' TWO-PART HOOK entire — cone-06 forward, '
    + 'box-24 hung on its own built tip and spun 55 degrees down — so this bird\'s head is '
    + 'the same head sixteen raptors wear. NO TALONS, AND IT IS RULE 9: wedge-11 at the '
    + 'front feet costs 76 triangles and this animal is already 918 of 951 with a '
    + '262-triangle shell and a 212-triangle tail on it. The `claw` role has still never '
    + 'been baked, which is one line in the generator and yours rather than a builder\'s. '
    + 'NEW PALETTE, UNREVIEWED: lion tawny behind, pale eagle in front, carried by the '
    + 'hull\'s OWN band 3 rather than by a painted line — box-41 puts its underline and its '
    + 'whole muzzle boss in that one band.',
})
