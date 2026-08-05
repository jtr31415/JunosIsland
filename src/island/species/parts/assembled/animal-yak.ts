/**
 * The yak — the second animal in the project to wear the lion's mane as a SKIRT,
 * and the file says so rather than pretending otherwise.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `animal-musk-ox.ts` established the idiom and its arithmetic is not re-derived
 * here: `box-29`, 1.650 x 1.650 x 0.500, is the only one of the bank's five
 * shell-rings that reads on a stocky hull, its centre is moved DOWN to the
 * hull's own so the hem reaches the ground, and it is cut on DEPTH ONLY because
 * `assembly-assert.ts`'s one-mass ratio is what pays for the reach. At half
 * depth the ring is 0.6806 against `box-12`'s 2.4055 — a ratio of 3.53 against a
 * required 3.
 *
 * **Two shaggy bovids wearing one shape is a roster §4 risk and it is taken
 * deliberately, because in life that hanging skirt IS what both animals have.**
 * Everything else is opposite: this one is on `box-12`, the WIDER shell, where
 * the musk ox has the biggest; its horns go out and UP where those fall 35
 * degrees; it has the fox's brush for a tail where the musk ox has NO TAIL at
 * all; and its muzzle is white, which is the one pale thing on a black animal.
 *
 * **There are no ears and none is missing.** `box-12` is the cube with two ear
 * lugs fused on — `animal-badger.ts` and `animal-ox.ts` both measured it and both
 * refused a pair — and a yak's ears are small and buried in hair anyway.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s flat front plate — `box-03`'s own, at `box-03`'s own place. */
const FRONT_PLATE_Z = 0.625

/**
 * `animal-ox.ts`'s own solved horn station on this shell: the CUBE's x/y chamfer
 * chord, not `frame.chamXY`, which this hull's ear lugs push off the real
 * surface. Not re-derived — `animal-wildebeest.ts` takes the same three numbers.
 */
const BEVEL_CHORD_X = 0.46875
const BEVEL_CHORD_Y = 1.275
const HORN_Z = 0.125

/**
 * The skirt's centre height. `box-29` is 1.650 tall, so a centre at 0.86 puts
 * the hem at 0.035 — clear of the floor, which it must be: `buildAssembly`
 * grounds the model on its lowest point, so a longer skirt lifts the feet.
 */
const SKIRT_Y = 0.86

export const YAK_ASSEMBLY = defineCreature('animal-yak', {
  palette: {
    coat: 0x33291f,    // UNREVIEWED: the saddle and shoulders, a very dark brown
    skirt: 0x1c1712,   // UNREVIEWED: near-black, the hanging guard hair
    pale: 0xe4dccc,    // UNREVIEWED: the white muzzle, and the sclera
    horn: 0xcbbfa2,    // UNREVIEWED: pale horn
    limb: 0x2a2219,    // UNREVIEWED: the short legs, under the skirt and barely seen
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cow's and the deer's WIDER shell, wearing its own ear lugs — see the
   * header. No belly line: the skirt is where every boundary on this animal is. */
  hull: { part: 'box-12' },
  under: 'pale',

  /* Short and planted. The skirt hides most of the leg, which is the point. */
  legs: { x: 0.34, z: 0.28 },

  eyes: { y: 1.0 },

  /* The hog's nose disc, cut wide, painted the one pale colour on the animal —
   * a yak's white muzzle is the field mark a child would actually pick out. */
  nose: { part: 'box-24', paint: 'pale', stretch: [1.3, 0.85, 1], at: [0, 0.70, FRONT_PLATE_Z] },

  /* THE FOX'S BRUSH, and the musk ox has no tail at all. `animal-wolf.ts` refused
   * this shape because a grey canid wearing the fox's own tail IS a fox — the
   * warning is about a travelling identity, and a black bovid three times its
   * size is not somewhere that identity travels to. A yak's tail genuinely is a
   * horse-like plume and this is the only plume in the bank. */
  tail: { part: 'box-23', paint: 'skirt' },

  extras: [
    /* THE SKIRT. `animal-musk-ox.ts`'s mechanism, cut to half depth rather than
     * its 0.52 and hung 0.01 higher, because this animal has a tail to clear. */
    {
      name: 'skirt',
      part: 'box-29',
      paint: 'skirt',
      stretch: [1, 1, 0.5],
      sink: 0.5,
      at: [0, SKIRT_Y, 0.0],
    },

    /* THE HORNS, out and UP and slightly back — the opposite pole from the musk
     * ox's 35-degree fall. `{ y, 100 }` takes `wedge-11`'s `z +1` facing to
     * (0.985, 0, -0.174), out and a shade behind; `{ z, 25 }` then lifts it to
     * (0.892, 0.416, -0.174). One segment: rule 4 bakes a rotation and cannot
     * bend a part, and a yak's horns curve — this is the straight chord of that
     * curve and nothing more. */
    {
      name: 'horn',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'horn',
      stretch: [1, 1, 1.6],
      spin: [{ axis: 'y', deg: 100 }, { axis: 'z', deg: 25 }],
      at: [BEVEL_CHORD_X, BEVEL_CHORD_Y, HORN_Z],
    },
  ],

  motion: [{ kind: 'wag', parts: ['tail'] }],

  flag: 'THE SKIRT IS THE SAME SHAPE animal-musk-ox.ts WEARS AND THAT IS DELIBERATE — box-29, '
    + 'the lion\'s mane ring, is the only one of the bank\'s five shell-rings animal-sheep.ts '
    + 'found readable on a stocky hull, and a hanging curtain of guard hair to the ground is '
    + 'genuinely what a yak and a musk ox BOTH have. Inventing a shape difference between them '
    + 'would be a lie. The four separations are all real and all measurable: this animal is on '
    + 'box-12 (the wider shell) where that one is on box-41 (the biggest); its horns go OUT AND '
    + 'UP at (0.892, 0.416, -0.174) where the musk ox\'s FALL 35 degrees; it wears the fox\'s '
    + 'brush box-23 where the musk ox has NO TAIL; and it has a white muzzle where that animal '
    + 'has a black pad. THE HORN IS A STRAIGHT CHORD OF A CURVE, which is the same gap '
    + 'collections/ice.ts and animal-buffalo.ts both priced — rule 4 as amended bakes a '
    + 'ROTATION into a copy\'s vertices and cannot BEND one, and none of the bank\'s 100 shapes '
    + 'is curved. THE BRUSH IS THE FOX\'S OWN TAIL and animal-wolf.ts refused it by name; the '
    + 'refusal was about a grey canid, and it is taken here because a yak\'s tail really is a '
    + 'horse-like plume and box-23 is the only plume in the bank. NEW PALETTE, UNREVIEWED.',
})
