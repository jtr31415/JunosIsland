/**
 * The dragon — and §3.1 WROTE THIS ANIMAL, in Joe's own words, on 29 July.
 *
 * > the hog ears could potentially double up as dragon or croc back ridges as
 * > well as hedgehog spikes (if added sunk into the torso, say 6 on each side.
 *
 * That is the only species in the whole method document that is named as an
 * example before anybody tried to build it, and it turns out to be right: the
 * back ridge here is `cone-04`, THE HOG'S OWN EAR, four of them in one row along
 * the spine, and the animal needed nothing invented for it. Its `roles` entry
 * says `ear` and its shape says a stubby cone with `taper: 0.250`; which of the
 * two it is depends entirely on where it is put, which is §3.1 entire.
 *
 * **THE ROW IS `top` ONLY, AND THAT IS RULE 9 AND NOT TASTE.** `cone-04` is 62
 * triangles, and §8's full idiom is five rows — top, two chamfers, two sides —
 * which at four a row is twenty copies and **1,240 triangles on its own**,
 * against a ceiling of 951 for the whole animal. A dragon's spines run along its
 * spine and nowhere else, so one row is also the right answer; it is worth
 * writing down that the cheap answer and the correct one agree here, because on
 * the hedgehog they did not.
 *
 * The row reaches z +/-0.46875, which is PAST the flat top's own 0.3125 and out
 * over the front and rear chamfers. It stays embedded and the arithmetic is §8
 * step 4's: the spike is buried its own 0.71 x 0.296 = **0.210** below the crown
 * at 1.43125, so its base sits at 1.221, and the shell's real surface at
 * z = 0.46875 ray-casts at **1.327** (`animal-horse.ts:230`). 0.106 of margin at
 * the worst station.
 *
 * **THE WINGS ARE THE BEE'S, AND THEY FLAP WITHOUT BEING ASKED.** `blade-06` and
 * `blade-07` carry `bee:wing-left` as their FIRST provenance entry — the donor
 * that gave the geometry — which is the correction `collections/critters.ts`
 * made to §14 and the reason a membranous wing was never missing. They are the
 * biggest wing in the bank at 0.693 of reach, they attach `y +1` so they stand
 * off the BACK rather than folding on a flank, and `creature.ts:543`'s
 * `withDefaultFlap` moves them because the bank knows what a wing is. A dragon
 * whose wings are still is a statue.
 *
 * Every wing shape in the bank is 0.200 thick and §3's burial floor is an
 * absolute 0.125, so `sink: 0.625` is FORCED rather than chosen — Critters
 * derived that and it is the same number here.
 *
 * The horns sweep BACK, which is what separates a dragon's head from the
 * unicorn's in this collection: the same `cone-01`, one pair instead of one
 * single, raked -30 instead of +30, and painted horn-dark instead of gold.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125
/** The rear plate's own centre — every one of the pack's ten hulls shares it. */
const REAR_PLATE_Y = 0.80625
/** `cone-01`'s own recorded x. Recovered, not chosen. */
const HORN_X = 0.2276

/**
 * 0.625, and it is FORCED. All six wing shapes in the bank are 0.200 thick and
 * §3's measured burial floor is an ABSOLUTE 0.125, so 0.125 / 0.200 is the
 * shallowest a wing can sit and still meet the pack's own minimum. Critters
 * derived this over seven species; nothing about a dragon changes it.
 */
const WING_SINK = 0.625

/**
 * The snout's burial. `cone-06`'s own recorded 0.36 puts only 0.103 of its
 * 0.287 inside the hull, which is under §3's 0.125 floor and prints THIN.
 */
const SNOUT_SINK = 0.45

export const DRAGON_ASSEMBLY = defineCreature('animal-dragon', {
  palette: {
    coat: 0x3f7a4a,    // UNREVIEWED: a deep leaf green — see the flag on the colour
    belly: 0xd8c27a,   // UNREVIEWED: an old-gold underside, the pale slot
    spine: 0xa8322f,   // UNREVIEWED: oxblood — the back ridge and the wings
    horn: 0x2a2622,    // UNREVIEWED: near-black horn, and the snout
    limb: 0x2f5c39,    // UNREVIEWED: the legs, a shade under the coat
    eye: 0xe0a52c,     // UNREVIEWED: a gold iris, the one bright thing on the head
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: 'box-03',
  /* 7/16, which is `animal-elk.ts`'s station on the cube: high enough that the
   * gold reads from the island's downward camera and still inside the pack's
   * measured mammal zone. */
  belly: 0.4375,

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The parrot's beak as a tapering snout, sunk past its own record to clear
   * §3's floor. `taper: 0.000` — it comes to a point, which no other nose in the
   * bank does — and at 0.400 x 0.401 it is the largest of them. */
  snout: { part: 'cone-06', paint: 'horn', sink: SNOUT_SINK },

  /* THE BACK RIDGE, and it is Joe's own example from §3.1. The hog's EAR, four
   * along the spine, one row only for the rule 9 arithmetic in the header. */
  ridge: {
    part: 'cone-04',
    paint: 'spine',
    name: 'spine',
    count: 4,
    rows: ['top'],
  },

  /* The elephant's stub turned to hang off the back, lengthened along its own
   * facing. All three stretch axes are off 1.0 deliberately: `animal-octopus.ts`
   * measured that an unstretched axis under a rotation makes the harness's
   * shape recovery ambiguous, and this part is both spun and stretched. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    stretch: [0.9, 0.9, 1.3],
    /* `box-18`'s own record is 0.000 — the elephant carries it flush — and at
     * 0.5525 of stretched reach 0.25 buries 0.138, over §3's absolute floor. */
    sink: 0.25,
    at: [0, REAR_PLATE_Y, -0.625],
  },

  extras: [
    /* THE WINGS: the pack's own BEE'S WING, standing off the back rather than
     * folded on a flank, at the forced 0.625 burial. Pure donor transfer
     * otherwise — the join solves to the flat crown at the shape's own x. */
    { name: 'wing', part: 'blade-06', paint: 'spine', kind: 'pair', sink: WING_SINK },

    /* THE HORNS, swept BACK — the unicorn's shape and the opposite rake, which
     * is the whole separation between the two heads in this collection. */
    {
      name: 'horn',
      part: 'cone-01',
      paint: 'horn',
      kind: 'pair',
      stretch: [1.8, 1.8, 1.1],
      spin: [{ axis: 'x', deg: -30 }],
      at: [HORN_X, CROWN_Y, -0.15],
    },
  ],

  flag: 'THIS ANIMAL WAS SPECIFIED BY YOU AND NOBODY EVER BUILT IT. §3.1 of '
    + 'building-animals-from-parts.md quotes you on 29 July: "the hog ears could '
    + 'potentially double up as dragon or croc back ridges as well as hedgehog spikes". '
    + 'The back ridge here is exactly that — cone-04, THE HOG\'S OWN EAR, four along the '
    + 'spine — and it is the only species in the method document named as an example '
    + 'before anyone tried it. THE ROW IS `top` ONLY AND THAT IS RULE 9: cone-04 is 62 '
    + 'triangles and §8\'s full five-row idiom at four a row is twenty copies and 1,240 '
    + 'triangles against a ceiling of 951 for the whole animal, so the cheap answer and '
    + 'the right one agree here (a dragon\'s spines run down its spine and nowhere else). '
    + 'The outer stations sit at z +/-0.46875, out over the chamfers rather than on the '
    + 'flat top — they stay embedded with 0.106 to spare, because the spike is buried its '
    + 'own 0.210 below the crown at 1.43125 and the shell ray-casts at 1.327 there. THE '
    + 'WINGS ARE THE BEE\'S OWN: blade-06 carries `bee:wing-left` as its FIRST provenance '
    + 'entry, so those vertices came out of animal-bee.glb, and §14\'s "no membranous '
    + 'insect wing" was already false before this collection started. They stand off the '
    + 'BACK (the shape attaches y +1) rather than folding on a flank, and they flap with '
    + 'no motion line because the bank knows what a wing is. Sink 0.625 is forced, not '
    + 'chosen: every wing in the bank is 0.200 thick and §3\'s burial floor is an absolute '
    + '0.125. THE HORNS ARE THE UNICORN\'S SHAPE RAKED THE OTHER WAY — same cone-01, -30 '
    + 'instead of +30, a pair instead of a single, dark instead of gold — which is the '
    + 'whole separation between the two heads in this collection. NEW PALETTE, UNREVIEWED: '
    + 'green over old gold with an oxblood ridge and wings. There is no fire and there '
    + 'cannot be: nothing in this kit emits, and a flame would be authored geometry with '
    + 'no shape in the bank behind it.',
})
