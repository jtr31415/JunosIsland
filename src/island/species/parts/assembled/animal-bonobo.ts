/**
 * The bonobo — `animal-chimpanzee` built a second time, on purpose, because in
 * life that is very nearly the whole truth.
 *
 * This is the ermine-and-stoat case. `collections/ice.ts` ships `animal-ermine`
 * as `animal-stoat` in a winter coat and says so rather than inventing a shape
 * difference, and the same discipline applies here: a bonobo and a chimpanzee
 * are the same build with the same parts at the same stations. Inventing a
 * difference the animals do not have would be worse than sharing one, because a
 * child who later meets a real bonobo would have been taught something false.
 *
 * **What genuinely differs, and all three are here:**
 *
 *   - **The face is BLACK.** An adult bonobo's face is black from birth; a
 *     chimpanzee's starts pale and darkens with age. That is the biggest visible
 *     difference between the two and it costs one palette slot.
 *   - **The ears are SMALLER.** The same `tube-04` cut to 0.78 of itself, which
 *     is inside the 2.97x §3 measured the pack's own ears varying by, so it is a
 *     sanctioned stretch and not a strain.
 *   - **THE WHITE TAIL TUFT.** A bonobo keeps its infant tail tuft into
 *     adulthood and a chimpanzee loses it — it is the field mark keepers use.
 *     One `cone-01` at the rump, turned onto `z -1`, painted white. It is the
 *     one part this animal has that the chimpanzee has not, and it is 34
 *     triangles.
 *
 * The build is also slighter: a narrower wheelbase, because a bonobo is the
 * gracile one and the wheelbase is all this kit has to say that with.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import { EYE_CARD_Z } from '../hulls'

/** `box-03`'s own flat side and rear plate — `animal-chimpanzee.ts`'s stations. */
const FLANK_X = 0.625
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625
const EAR_Y = 1.14
const BROW_Y = 1.16

export const BONOBO_ASSEMBLY = defineCreature('animal-bonobo', {
  palette: {
    coat: 0x2b2622,    // UNREVIEWED: near-black, a shade warmer than the chimp's
    face: 0x17130f,    // UNREVIEWED: the BLACK face — the difference from the chimp
    limb: 0x201c19,    // UNREVIEWED: the long arms and legs
    pale: 0xf0ebdd,    // UNREVIEWED: the white tail tuft, and the sclera
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* No belly line, exactly as the chimpanzee has none, so `under` is named or
   * the sclera falls back to the coat and the eye inverts. */
  under: 'pale',

  eyes: { part: 'plate-06', paint: 'pale' },

  /* Narrower than the chimpanzee's 0.33 x 0.29: a bonobo is the slight one and
   * the wheelbase is the only dial this kit has for that. */
  legs: { x: 0.26, z: 0.27, paint: 'limb' },

  /* The chimpanzee's ear cut to 0.78 — inside the 2.97x the pack's own ears
   * vary by, so it is adaptation rather than strain. */
  ears: {
    part: 'tube-04',
    paint: 'face',
    stretch: [0.78, 0.78, 0.78],
    /* 0.45 where the chimpanzee's is 0.40, because the shape is smaller: §3's
     * floor is 0.125 of burial and 0.45 of 0.280 is 0.126. */
    sink: 0.45,
    at: [FLANK_X, EAR_Y, 0.18],
  },

  /* The deer's uncut muzzle, painted BLACK where the chimpanzee's is tan. */
  snout: { part: 'tube-03', paint: 'face' },
  nose: { part: 'wedge-10', paint: 'face' },

  extras: [
    /* The same brow bar, at the same height, painted from the black face slot. */
    {
      name: 'brow',
      part: 'plate-13',
      paint: 'face',
      stretch: [3.5, 1, 1] as [number, number, number],
      at: [0, BROW_Y, EYE_CARD_Z] as [number, number, number],
    },

    /* THE TAIL TUFT — the one part the chimpanzee has not. `cone-01` is the
     * bee's and caterpillar's ear, taper 0, 34 triangles; its own facing is
     * `y +1`, so `axis: 'z', dir: -1` turns it out of the rump instead of up
     * off the crown. Sunk at its own 0.312, it stands 0.276 clear. */
    {
      name: 'tuft',
      part: 'cone-01',
      paint: 'pale',
      axis: 'z' as const,
      dir: -1 as const,
      at: [0, REAR_PLATE_Y, REAR_PLATE_Z] as [number, number, number],
    },
  ],

  flag: 'THIS IS animal-chimpanzee BUILT TWICE, DELIBERATELY, and the file says so rather than '
    + 'inventing a shape difference. collections/ice.ts ships animal-ermine as animal-stoat in '
    + 'a winter coat on exactly this reasoning: a bonobo and a chimpanzee wear the same parts '
    + 'at the same stations because in life they do. WHAT IS ACTUALLY DIFFERENT, and all three '
    + 'are here: the FACE IS BLACK (a bonobo\'s is black from birth, a chimpanzee\'s darkens '
    + 'with age, and it is the biggest visible difference between them); the EARS ARE SMALLER, '
    + 'the same tube-04 cut to 0.78, which is inside the 2.97x the pack\'s own ears vary by; '
    + 'and THE WHITE TAIL TUFT, which a bonobo keeps into adulthood and a chimpanzee loses — '
    + 'that is the field mark keepers actually use, and it is one cone-01 turned onto z -1 at '
    + 'the rump for 34 triangles. THE ARMS ARE STILL MISSING, the same gap the gorilla, the '
    + 'gibbon and the chimpanzee all record, and the narrower wheelbase is all the kit has to '
    + 'say "the gracile one" with. IF THE TWO STILL TWIN AT ALBUM SIZE, the ear stretch and '
    + 'the face colour are the two dials and both are one number. THE BROW BAR carries the '
    + 'same stretched plate-13 as the chimpanzee and the same strain with it — see that file. '
    + 'NEW PALETTE, UNREVIEWED.',
})
