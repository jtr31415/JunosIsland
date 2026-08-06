/**
 * The phoenix — the bird that burns, and the one species in this collection
 * whose whole design problem is COLOUR rather than shape.
 *
 * Underneath it is a plain bird: the cube, two legs, the parrot's beak, the
 * parrot's wing, the parrot's fan tail. Every one of those is a shape nine other
 * birds in this project already wear, and that is deliberate — a phoenix IS a
 * bird, and reaching for something exotic would have made it read as a species
 * nobody can name rather than as the one everybody can.
 *
 * **WHAT MAKES IT A PHOENIX IS THE CREST AND THE FIRE PALETTE.** Three `cone-01`
 * along the crown, standing straight up off the flat top plate, painted the same
 * crimson as the wings and the tail. That is §8's repeat-and-sink at its
 * smallest — one row, three copies — and it is the only thing on the animal that
 * is not simply a bird.
 *
 * **THERE IS NO FLAME AND THERE CANNOT BE.** Nothing in this kit emits, glows or
 * fades: `texture.ts` paints flat palette slots and `assembly.ts` places solid
 * meshes. Fire is not a shape the bank is missing — it is not a shape at all —
 * so this is not a commission and is not counted as one. What the kit CAN say is
 * a hot palette and a raised crest, and that is what is spent.
 *
 * ## Where it stands against the eight birds already built on this cube
 *
 * The four cage birds, the five passerines and the six Farm birds are all small
 * and drab or barred. This is the only saturated red-orange bird in the project,
 * the only one with a crest, and it stands with `box-38` fully upright behind
 * it — the parrot's fan at its own donor placement, which no other bird here
 * takes (the goose refuses it as the turkey's, and the turkey wears it because
 * of that). Beside `animal-rooster` it is a foot taller and has no comb; beside
 * `animal-parrot`, which is FROZEN, it has a crest and no hook.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * The parrot's beak, sunk past its own recorded 0.36.
 *
 * `cone-06` is 0.287 deep, so the donor's own burial puts only 0.103 inside the
 * hull, which is under §3's absolute 0.125 floor and prints THIN. 0.45 buries
 * 0.129 and leaves 0.158 of bill standing.
 */
const BILL_SINK = 0.45

export const PHOENIX_ASSEMBLY = defineCreature('animal-phoenix', {
  palette: {
    coat: 0xd8531f,    // UNREVIEWED: hot orange — the body, and most of the bird
    belly: 0xf0b429,   // UNREVIEWED: the gold underside, the pale slot
    flight: 0xa3211c,  // UNREVIEWED: crimson — wings, tail and crest, one tract
    limb: 0xe8a33c,    // UNREVIEWED: the legs and the bill, the same amber
    eye: 0xfbe6a8,     // UNREVIEWED: a pale hot eye, so the pupil reads against it
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: 'box-03',
  /* 8/16 — the hull's own equator, and the tiger's measured belly boundary made
   * exact (§7). The gold runs the whole underside of the bird. */
  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The parrot's beak, unspun, at the cube's front face and buried past the
   * donor's own record so it clears §3's floor. No hook: that is the raptor
   * idiom and it belongs to `animal-griffin` and `animal-thunderbird` in this
   * collection, which is where the three big birds are held apart. */
  snout: { part: 'cone-06', paint: 'limb', sink: BILL_SINK },

  /* The parrot's FAN at its own donor placement — upright behind the bird,
   * which is the pose the shape was drawn in. `animal-horse.ts` and the
   * unicorn turn it upside down to make a dock; here it is left alone. */
  tail: { part: 'box-38', paint: 'flight' },

  /* THE CREST. Three of the bee's antennae straight up off the flat top plate:
   * §8's repeat-and-sink at its smallest, and the only thing on this animal
   * that is not a plain bird. */
  ridge: {
    part: 'cone-01',
    paint: 'flight',
    name: 'crest',
    count: 3,
    rows: ['top'],
  },

  legs: false,
  extras: [
    /* TWO legs on the midline, which is the only station a biped's can take.
     * `animal-goose.ts:476` is the same block and the same reasoning; the
     * feature is named `leg` and not `leg-front`, because a bird has legs. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The chick's and the parrot's real wing, folded on the flank at pure donor
     * transfer — `animal-golden-eagle.ts:68`'s block, and it flaps without a
     * motion line because the bank knows `wedge-19` is a wing. */
    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
      /* Sunk past `wedge-19`'s own recorded 0.17, which buries only 0.097 of its
       * 0.573 and prints THIN against §3's absolute 0.125 floor. 0.25 buries
       * 0.143. `animal-golden-eagle.ts` leaves the donor's number and reports
       * THIN; this is the same shape one grid step deeper. */
      sink: 0.25,
    },
  ],

  flag: 'THE PROBLEM WITH A PHOENIX IS COLOUR, NOT SHAPE, AND THAT IS THE THING TO LOOK '
    + 'AT. Underneath it is a plain bird — the cube, two legs, the parrot\'s beak, the '
    + 'parrot\'s wing, the parrot\'s fan — and that is deliberate: a phoenix IS a bird, '
    + 'and reaching for something exotic would make it read as a species nobody can name '
    + 'instead of the one everybody can. What makes it the phoenix is the CREST (three '
    + 'cone-01 straight up off the flat top plate, §8\'s repeat-and-sink at its smallest) '
    + 'and the fire palette: hot orange over gold with crimson wings, tail and crest as '
    + 'one feather tract. It is the only saturated red bird in this project and the only '
    + 'one with a crest. THERE IS NO FLAME AND THERE CANNOT BE — nothing in this kit '
    + 'emits, glows or fades; texture.ts paints flat palette slots and assembly.ts places '
    + 'solid meshes. Fire is not a shape the bank is missing, it is not a shape at all, so '
    + 'it is NOT counted as a commission. NEW PALETTE, UNREVIEWED, and it is the whole '
    + 'animal: if the colours do not read as burning, nothing about the geometry will save '
    + 'it and the dial is the palette rather than the parts. The tail is box-38 THE RIGHT '
    + 'WAY UP, at its own donor placement — animal-horse.ts and animal-unicorn turn the '
    + 'same shape upside down to make a horse\'s dock, so this is the one place in the '
    + 'project it stands as the fan Kenney drew.',
})
