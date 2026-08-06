/**
 * The unicorn — a horse with one horn, which is the whole of what a unicorn is.
 *
 * This is the collection's exemplar and the argument for the whole of it.
 * `docs/how-the-animals-are-made.md` §14 calls Legendary a "near-total failure";
 * this animal is a `animal-horse` minus its colour plus ONE stretched `cone-01`,
 * and every part on it is the pack's own. A six-year-old reads a unicorn off the
 * horn and nothing else, so the horn is the only thing that had to be solved.
 *
 * **THE HORN IS §8'S CHAMFER IDIOM WITH THE RAKE MEASURED RATHER THAN
 * INHERITED.** It joins the front-top chamfer's chord midpoint — `(1.275,
 * 0.46875)` off the cube's own centre, `animal-horse.ts:222-235`'s number — which
 * is exactly where a horse's FORELOCK goes, because a unicorn's horn is a
 * forelock that grew: out of the brow, not off the crown. `cone-01` is the bank's
 * only shape with `taper: 0.000` — it comes to a POINT — and it is an `ear`,
 * which is one of the two kinds §3 measured as safe to stretch (2.97x natural
 * spread). At `[2.2, 2.6, 1.1]` it is 0.352 x 1.040 x 0.362, a near-round section
 * and the longest thing on the animal.
 *
 * **THE 45 DEGREES §8 GIVES FOR THAT CHAMFER IS WRONG FOR A HORN, AND THE
 * MEASUREMENT SAYS SO.** Built at 45 — the chamfer's own normal, which is what
 * the idiom prescribes and what the forelock uses — the whole animal measures
 * **1.7129**, against ear tips at **1.707**. The horn was **six thousandths**
 * taller than the ears it stood between, because at 45 degrees more than two
 * thirds of its length is spent going FORWARD (the tip reached z 0.957 and the
 * animal was 2.098 deep). A unicorn whose horn does not clear its own ears is not
 * one. At 30 degrees the tip stands at **1.8605** — 0.153 above the ears and
 * 0.429 above the crown — and the animal is 0.021 shallower into the bargain.
 * **The idiom's 45 is a rule about where a part JOINS, not about where it
 * points**, and an explicit `at`
 * buys the freedom to differ (`creature.ts:709` only refuses a diagonal facing
 * when the join is being solved).
 *
 * The root is buried its own 0.31 of 1.040 = 0.322 along the facing, and the
 * shell's real surface stands 0.0368 proud of the chord along the 45 normal
 * (`animal-horse.ts:230`), so nothing here is near §3's floor of 0.125.
 *
 * **NOT `bespoke-*` AND NOT A SPIRAL.** The twist is the one thing about a real
 * unicorn horn this bank cannot say — all 100 shapes are straight or tapered
 * along a single axis and there is no helix — and it is not worth a commission,
 * because the silhouette of a horn is a spike whether or not it is grooved.
 *
 * Everything else is `animal-horse.ts`, deliberately, part for part: the pony's
 * ear, the fox's muzzle, the parrot's fan upside down as a dock-and-fall, one
 * `bespoke-square-01` as a crest, and JT-044's two-tone leg as a hoof. The
 * separation from the horse and the pony is the horn, and after that the colour:
 * both of those are chestnut and bay, this is white with a silver mane.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125
/** `cone-01`'s own recorded x — the bee's placement, and the pony's. Recovered. */
const EAR_X = 0.2276
/** Where the flat REAR plate stops, on every one of the pack's ten hulls. */
const REAR_PLATE_TOP_Y = 1.11875
/** `box-38`'s own 0.912191 / 2 — half the parrot fan, which the z-180 keeps. */
const TAIL_HALF_HEIGHT = 0.4560955
/** SOLVED: the highest join whose whole root is on the flat rear plate. */
const TAIL_JOIN_Y = REAR_PLATE_TOP_Y - TAIL_HALF_HEIGHT

/**
 * The brow chamfer's chord midpoint — `animal-horse.ts`'s, and `box-03`'s own.
 * The real surface ray-casts 0.052083 above it, which is 0.036828 along the
 * 45-degree normal, so a part joined here is embedded by construction.
 */
const BROW_Y = 1.275
const BROW_Z = 0.46875

export const UNICORN_ASSEMBLY = defineCreature('animal-unicorn', {
  palette: {
    coat: 0xf6f3ee,    // UNREVIEWED: a warm white, not a blue one — see the flag
    pale: 0xffffff,    // UNREVIEWED: true white — the sclera and nothing else
    mane: 0xd8d2e6,    // UNREVIEWED: silver with a lilac cast, mane and tail
    horn: 0xe8d59a,    // UNREVIEWED: pale gold, the only warm thing on the animal
    limb: 0xe6e0d8,    // UNREVIEWED: the leg, a shade under the coat
    hoof: 0x8c7fa0,    // UNREVIEWED: dusk violet horn. JT-044's two-tone leg
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No `belly` slot, so the pale one is named: it paints the eye cards' sclera.
   * A white animal has no underside to draw, so there is no `belly` line here
   * at all — `animal-goose.ts` declines it for the same reason. */
  under: 'pale',

  hull: 'box-03',

  /* JT-044, verbatim from `animal-horse.ts:392`. 4/16 is the LOWEST k/16 that
   * clears `box-01`'s own foot bevel; it is a measurement off the leg and not a
   * taste about this animal. DO NOT RETUNE. */
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },

  /* The pony's ear: the tallest upright ear that is not the rabbit's, the only
   * one of its size that comes to a point, widened 2x in x alone. Joined on the
   * flat crown, forward of the mane and clear of the horn. */
  ears: { part: 'cone-01', stretch: [2, 1, 1], at: [EAR_X, CROWN_Y, 0.25], paint: 'coat' },

  /* The fox's muzzle, which is the one of the bank's three 0.532 barrels that
   * FITS the cube's 0.625-square front face — `animal-horse.ts:277` records that
   * the giraffe's is for the tiger's boss and this one is for `box-03`. */
  snout: { part: 'tube-06', paint: 'coat' },

  /* The deer's nose — the pack's ungulate one, and small. Hung off the muzzle's
   * own built front plane automatically. Not `wedge-10`, which Joe rejected by
   * name on the hedgehog as reading like a tongue. */
  nose: { part: 'box-14', paint: 'hoof' },

  /* The parrot's fan upside down: the stalk goes to the top and the broad fall
   * hangs off it, which is a dock with hair off it. The y is solved off the flat
   * rear plate's top less the fan's own half height. */
  tail: {
    part: 'box-38',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, TAIL_JOIN_Y, -0.625],
    paint: 'mane',
  },

  extras: [
    /* THE HORN. §8's chamfer idiom at the brow — the horse's own FORELOCK join,
     * with a spike in it — but raked 30 rather than the chamfer's 45. At 45 the
     * animal measured 1.7129 against ear tips at 1.707: the horn cleared its own
     * ears by six thousandths and spent its length going forwards. See the
     * header for the whole measurement, and for why it is not a spiral. */
    {
      name: 'horn',
      part: 'cone-01',
      paint: 'horn',
      stretch: [2.2, 2.6, 1.1],
      spin: [{ axis: 'x', deg: 30 }],
      at: [0, BROW_Y, BROW_Z],
    },

    /* THE CREST, one of JT-041's three sanctioned base shapes, run the length of
     * the flat top plate so both ends stop where the plate stops and each is
     * buried its whole depth rather than riding a chamfer that has begun to
     * fall. `animal-horse.ts:453` is the same slab at the same station. */
    {
      name: 'mane',
      part: 'bespoke-square-01',
      stretch: [0.15, 0.4, 0.5],
      at: [0, CROWN_Y, 0],
      paint: 'mane',
    },
  ],

  /* A horse standing still swishes and flicks; both name features it has. */
  motion: [
    { kind: 'wag', parts: ['tail'] },
    { kind: 'twitch', parts: ['ear'] },
  ],

  flag: 'THE HORN IS THE ONLY THING TO JUDGE HERE, because everything else on this '
    + 'animal is animal-horse.ts part for part and you have already seen it. It is '
    + 'cone-01 — the bee\'s antenna, the bank\'s ONLY shape with taper 0.000, so the one '
    + 'that comes to a point — stretched to 0.352 x 1.040 x 0.362 and joined at the '
    + 'BROW CHAMFER\'S chord midpoint (1.275, 0.46875), which is exactly where a horse\'s '
    + 'forelock goes: a unicorn\'s horn is this pack\'s forelock grown long, out of the '
    + 'brow rather than off the crown. THE RAKE IS 30 DEGREES AND NOT THE CHAMFER\'S OWN '
    + '45, and that is measured rather than preferred: built at 45 the whole animal was '
    + '1.7129 tall against EAR TIPS AT 1.707, so the horn cleared its own ears by six '
    + 'thousandths and spent two thirds of its length going forwards (tip at z 0.957, '
    + 'animal 2.098 deep). At 30 the tip stands at 1.8605, which is 0.153 over the ears '
    + 'and 0.429 over the crown. The dials are that angle and the length. THE HORN DOES NOT '
    + 'SPIRAL and cannot: all 100 shapes '
    + 'in the bank are straight or tapered along one axis and there is no helix anywhere '
    + 'in the pack, so the twist is the single thing about a real unicorn horn this can '
    + 'not say. It is not worth a commission — a horn reads as a spike in silhouette '
    + 'whether or not it is grooved — but if you want the groove, say so and it is an '
    + 'authored shape. NEW PALETTE, UNREVIEWED: white with a silver-lilac mane and a pale '
    + 'gold horn, chosen to be the opposite of animal-pony (red bay) and animal-horse '
    + '(golden chestnut, flaxen) at the two places a child looks. Nothing is authored but '
    + 'one of JT-041\'s three base shapes as the crest, the hull is unscaled, and the '
    + 'only stretches are on an ear, which §3 measures as safe.',
})
