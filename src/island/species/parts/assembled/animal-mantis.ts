/**
 * The mantis — the only upright animal in this collection, and the only one that
 * holds something in front of it.
 *
 * **THE RAPTORIAL FORELEGS ARE `tube-04`/`tube-05`, THE ELEPHANT'S EARS.** A
 * handed pair, 0.3592 x 0.6188 x 0.2773 — a long flat blade, which is what a
 * mantis's folded forearm is. Given the base facing `y +1` and tilted 40 degrees
 * forward off the upper chest, the pair reaches out and up in front of the
 * animal, which is the pose everyone draws a mantis in. §3.1 again: the shape
 * was filed by its geometry rather than by Kenney's label, and four species in
 * this repo wear it as an ear.
 *
 * **THE HULL IS `box-21`, THE FOX'S — the TALLEST shell the pack drew** at 1.250
 * x 1.5051 x 1.250, and it is the whole of what makes this animal read as
 * standing up rather than lying along the ground. Every other critter here is on
 * a 1.250 cube or flatter.
 *
 * It is separated from `animal-grasshopper` — the other green insect — on all
 * three of those: an upright hull against a cubic one, forelegs raised in front
 * against femora folded behind, and a deeper green.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own top face: its recorded centre 0.9338 plus its own half 0.75255. */
const TOP_Y = 1.68635
const LEG_Y = 0.18125

/** §3's 0.125 floor over a 0.200-thick wing. See `animal-butterfly.ts`. */
const WING_SINK = 0.625

export const MANTIS_ASSEMBLY = defineCreature('animal-mantis', {
  /* NEW AND UNREVIEWED — the first mantis ever built here. Brief §19 is
   * "bright, never scary", and this is the species where that matters most in
   * the collection: no jaws, no teeth, a leaf green. */
  palette: {
    coat: 0x3f7d3a,   // UNREVIEWED: a deep leaf green — the DARKER of the two here
    belly: 0xd7e7bb,  // UNREVIEWED: the pale underside, and the sclera
    limb: 0x2f6029,   // UNREVIEWED: the walking legs and the raised forelegs
    wing: 0x64974a,   // UNREVIEWED: the folded tegmina, a shade over the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE TALLEST SHELL THE PACK DREW. A mantis stands; nothing else here does. */
  hull: 'box-21',

  belly: 0.4375,

  legs: { x: 0.27, z: 0.3125 },

  /* The round card five donors share, set high and wide — a mantis's eyes are
   * on the corners of a triangular head and they are what it looks at you
   * with. */
  eyes: { part: 'plate-08', x: 0.30, y: 1.15 },

  /* The bee's and the caterpillar's own antenna, long and fine, by donor
   * transfer onto this hull's own top face. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE RAPTORIAL FORELEGS. The elephant's own ear given a `y +1` base facing
     * and tilted 40 degrees forward off the upper chest. A diagonal facing has
     * no hull face to solve against, so the join point is stated. */
    {
      name: 'foreleg',
      part: 'tube-04',
      paint: 'limb',
      kind: 'pair',
      axis: 'y',
      dir: 1,
      spin: [{ axis: 'x', deg: 40 }],
      sink: 0.126,
      at: [0.26, 1.02, 0.56],
    },
    /* THE FOLDED TEGMINA, flat along the back. Already 0.200 thin in y, so the
     * facing is re-pointed rather than the geometry turned on edge. */
    { name: 'wing', part: 'wedge-19', paint: 'wing', kind: 'pair', axis: 'y', dir: 1, sink: WING_SINK, at: [0.26, TOP_Y, -0.1875] },
    /* The bee's and the caterpillar's own face card, at the bank's own height. */
    { name: 'mouth', part: 'plate-03', paint: 'limb', at: [0, 0.686849, 0.635] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, LEG_Y, 0] },
  ],

  flag: 'THE FORELEG DOES NOT FOLD, and on a mantis the fold IS the animal — a femur '
    + 'raised and a tibia snapped back against it, held like praying hands. The bank has '
    + 'no bent shape and rule 4 as amended turns a copy rather than bending one, so what is '
    + 'here is ONE straight blade at 40 degrees. It is the third species in this collection '
    + 'stopped by the same missing part — `animal-spider` wants a knee and '
    + '`animal-grasshopper` wants a tibia — so ONE commissioned hinged limb would finish '
    + 'all three, and that is the strongest single commission this collection produces. '
    + 'ALSO: THE TRIANGULAR HEAD, which is the other thing everyone draws, cannot be said: '
    + 'rule 3 allows one mass and a head is not a separate shape on any of the pack\'s 24. '
    + 'The tall `box-21` hull is standing in for a body held upright. ALSO: SIX LEGS, see '
    + 'the collection header. ALSO: NEW PALETTE, UNREVIEWED, and deliberately the DARKER of '
    + 'this collection\'s two greens so it cannot be read as the grasshopper.',
})
