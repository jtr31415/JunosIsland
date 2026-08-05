/**
 * The ostrich — `animal-goose.ts`'s neck, on the widest shell, leaned less.
 *
 * `africa.ts` has said since PB-036 phase 2 that this species "wants
 * `songbird`/`bespoke`" and that it and the vulture "were never built at all,
 * deliberately". The blocker recorded there was wings, and it is gone twice
 * over: nine birds already share the `box-06` folded-flank wing this one takes,
 * and `animal-goose.ts` built a NECK on this route, which is what an ostrich
 * actually needs.
 *
 * **THE NECK IS THE ELEPHANT'S TRUNK STOOD ON END** — `box-18` with its axis
 * overridden to `y`, buried 6/16, joined at the crown's own flat square at
 * z = 3/16. Those three are the goose's and none is re-derived. **The LENGTH and
 * the LEAN are this bird's own and both were measured here:** at the goose's 1.75
 * and 45 degrees it comes out 2.0634, over the pack's 2.02, so the neck is
 * shortened to 1.5 and stands at 45 degrees — which is the only place an
 * ostrich's upright neck can be said against a goose's forced 60.
 *
 * **The eye is `plate-14`, the biggest card in the bank**, which is a real fact
 * about an ostrich and, rule 5 being what it is, the only way to have one. It
 * sits on the BODY at the neck's root, because there is no placement at which an
 * eye card lands on a head 0.8 above the eye plane — the goose's own flag.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s crown — the cube's own 1.43125, and 0.05 under `box-41`'s. */
const CROWN_Y = 1.43125

/** The goose's four neck numbers, transferred entire. See that file for each solve. */
const NECK_Z = 0.1875
const NECK_SINK = 0.375

/**
 * 1.5x, where the goose is 1.75, and 45 degrees where the goose is forced to 60.
 *
 * MEASURED ON THIS ANIMAL, not inherited. At the goose's own 1.75 and 45 degrees
 * this bird comes out **2.0634 tall, over the pack's 2.02** — the same figure the
 * goose's own table records at 45, because the height is entirely the neck, the
 * head and the bill and both birds join at the same crown. Shortening the neck to
 * 1.5 is what buys the lean back: an ostrich's neck should stand UP against a
 * goose's, and 45 degrees against 60 is the only place that difference can be
 * said.
 *
 * The burial still covers it. A leaned root rides up as it leans, so
 * `sink x L >= (0.425211 / 2) x tan(45) = 0.2126`, and 6/16 of 0.9345 is 0.3504 —
 * nearly twice what is needed.
 */
const NECK_STRETCH = 1.5
const NECK_LEAN = 45

export const OSTRICH_ASSEMBLY = defineCreature('animal-ostrich', {
  palette: {
    coat: 0x2e2a26,    // UNREVIEWED: sooty black — the cock's body plumage
    flight: 0xf2eee2,  // UNREVIEWED: the white wing and tail plumes
    skin: 0xd8a294,    // UNREVIEWED: the bare pink neck and thighs
    limb: 0xc8836a,    // UNREVIEWED: the long bare legs, a shade under the skin
    eye: 0x1a1513,     // UNREVIEWED: the dark bead in the pack's biggest card
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The widest shell in the pack. An ostrich's body is a barrel carried high and
   * this is the only hull that is wider than it is tall. */
  hull: { part: 'box-12', paint: 'coat' },

  /* THE BIGGEST CARD IN THE BANK. On the body at the neck's root, which is where
   * animal-goose.ts and animal-terrapin.ts both put a long-necked bird's eye. */
  eyes: { part: 'plate-14', paint: 'eye' },

  /* THE NECK. The goose's own four numbers; only the lean is this bird's. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'skin',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, CROWN_Y, NECK_Z],
  },

  /* THE HEAD, hung off the neck's own placed tip by `on`. The fox's muzzle, which
   * is the goose's and the terrapin's choice for the same job. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'skin' },

  /* The parrot's fan, which is what an ostrich's tail is: a short upright plume
   * rather than anything that trails. */
  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    /* TWO legs on the pack's own row, at `box-01`'s own recorded x and the hull's
     * midline — the only station a biped's legs can be at. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair' as const,
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0] as [number, number, number],
    },

    /* THE WING, HELD FOLDED. `box-06` along the flank at the nine-bird idiom —
     * `animal-chicken.ts` §3 — rather than `wedge-19`, the real one this bird's
     * sibling `animal-vulture.ts` wears. Measured, not preferred: the real wing
     * on this shell's 1.539 of width takes the animal to 2.485 across and a
     * keep-out of 1.243, worse than the fox's 1.15, which is what decides whether
     * a pet can walk between two trees. An ostrich holds its wings folded; the
     * cheaper read is also the true one. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair' as const,
      axis: 'z' as const,
      dir: -1 as const,
      spin: [{ axis: 'z' as const, deg: -90 }, { axis: 'y' as const, deg: -90 }],
      sink: 0.5,
      at: [0.7695, 0.80625, 0] as [number, number, number],
    },

    /* THE BILL, off the head's own placed plane. */
    { name: 'bill', part: 'tube-02', paint: 'limb', on: 'head' },
  ],

  /* `box-06` carries no `wing` role, so the flap is declared rather than
   * automatic — the seagull's, the hen's and the goose's own line. */
  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE LEGS ARE THE THING THIS ANIMAL CANNOT HAVE. An ostrich is legs — two thirds of '
    + 'its height — and the leg row is one shape (box-01, 0.30625 tall) at one absolute height '
    + '(0.18125, which is what puts feet on y = 0 on nine of the pack\'s ten hulls). There is '
    + 'no dial that lengthens a leg, so this bird is a tall NECK on a normal body rather than '
    + 'a body on stilts, and if that reads wrong the honest fix is a commissioned leg. THE '
    + 'NECK IS animal-goose.ts\'s, shortened: at that bird\'s own 1.75x and 45 degrees this '
    + 'one measures 2.0634 against the pack\'s 2.02 ceiling, so it is cut to 1.5x and stands '
    + 'at 45 degrees instead — which is where an ostrich\'s upright neck can be said at all, '
    + 'the goose being FORCED to 60. Stand it further up and the animal goes over the height '
    + 'band, which reports rather than fails now, so it is your call and not the suite\'s. THE '
    + 'WINGS ARE FOLDED, not spread: wedge-19, the real wing, takes this shell to 2.485 across '
    + 'and a keep-out of 1.243 — worse than the fox\'s 1.15, which is what decides whether a '
    + 'pet fits between two trees — so it wears box-06 along the flank at the nine-bird idiom. '
    + 'THE EYE IS ON THE BODY, not on the head, for the goose\'s own reason: '
    + 'EYE_CARD_Z is 0.635 and rule 5 makes it unsayable, so on any long-necked animal the '
    + 'card sits at the neck\'s root. NEW PALETTE, UNREVIEWED.',
})
