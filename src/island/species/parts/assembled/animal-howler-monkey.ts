/**
 * The howler monkey — the throat is the animal, and the tail is the monkey's own
 * rope carried up instead of trailed.
 *
 * `box-33` is the FROZEN `animal-monkey`'s hull and this species takes it
 * deliberately, on `animal-baboon.ts`'s argument, which is `animal-chicken.ts`'s
 * about the frozen chick: a howler IS a monkey, and giving it a different body to
 * look different would be inventing. What holds it apart from the monkey, from
 * the baboon and from the gibbon is three things:
 *
 *   - **THE THROAT.** A howler's hyoid is a resonating box under its jaw and it
 *     is the whole reason the animal is famous. `box-24`, the hog's nose disc, at
 *     1.5 across and 0.8 tall — 0.600 wide, 0.320 deep — hung at y 0.66, which is
 *     the lowest a 0.320-tall part can sit and stay on this hull's flat front
 *     face (0.49375 to 1.11875). Nothing else in the project wears anything under
 *     its chin.
 *   - **THE PREHENSILE TAIL.** `wedge-07`, the cat's and the MONKEY's own rope,
 *     with `chamfer: true`. `animal-kinkajou.ts` established that placement and
 *     measured it: this shell's own +y/-z chamfer midpoint at (0.46875, -0.46875)
 *     and a 45-degree turn onto its outward normal, solved together. Five other
 *     species wear one of the bank's two thin ropes and every one of them TRAILS
 *     it; this and the kinkajou are the only two that carry it.
 *   - **NO EARS AND NO MUZZLE.** A howler's ears are buried in its beard and its
 *     face is flat — against the baboon's long `box-18` muzzle and the `wedge-04`
 *     ears both it and the gorilla wear.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-33`'s flat front plate — the cube's own +0.625. */
const FRONT_PLATE_Z = 0.625

/**
 * 1.5 across and 0.8 tall on the hog's 0.400-square disc: 0.600 x 0.320.
 *
 * The height is solved rather than picked. The flat front face runs 0.49375 to
 * 1.11875, so a 0.320-tall part cannot be centred below 0.654 without hanging
 * off the chamfer, where §3's "nothing floats" says it must not be. 0.66 is that
 * bound, and it is as low under the face as a throat can honestly sit.
 */
const THROAT_STRETCH: [number, number, number] = [1.5, 0.8, 1.4]
const THROAT_Y = 0.66

export const HOWLER_MONKEY_ASSEMBLY = defineCreature('animal-howler-monkey', {
  palette: {
    coat: 0x8a3f22,    // UNREVIEWED: the rust-red of a red howler
    pale: 0xdcbb92,    // UNREVIEWED: the sclera, and the paler flank
    face: 0x2a201a,    // UNREVIEWED: the bare black face and the nose
    throat: 0x1f1713,  // UNREVIEWED: the beard and the throat box
    limb: 0x6d3019,    // UNREVIEWED: the long arms and legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE FROZEN MONKEY'S OWN SHELL. See the header for why that is the design. */
  hull: { part: 'box-33' },

  /* No belly line: a red howler is one colour and the throat is a part rather
   * than a painted boundary. */
  under: 'pale',

  eyes: { paint: 'pale' },

  /* The dog's and the MONKEY's own nose-tip — 0.120 x 0.108, the smallest solid
   * nose in the bank — straight onto the hull's front face at the height a
   * flat-faced primate's nostrils sit. No snout at all: that is the separation
   * from animal-baboon, whose whole read is a long muzzle. */
  nose: { part: 'wedge-10', paint: 'face', at: [0, 0.88, FRONT_PLATE_Z] },

  /* CARRIED UP. `chamfer: true` solves the midpoint and the turn together and
   * refuses either given by hand without the other. */
  tail: { part: 'wedge-07', paint: 'coat', chamfer: true },

  extras: [
    /* THE THROAT BOX. See THROAT_STRETCH and THROAT_Y — both are solved. */
    {
      name: 'throat',
      part: 'box-24',
      paint: 'throat',
      stretch: THROAT_STRETCH,
      at: [0, THROAT_Y, FRONT_PLATE_Z] as [number, number, number],
    },
  ],

  flag: 'THE HOWL IS THE ANIMAL AND NOTHING HERE CAN MAKE A SOUND. What stands in for it is '
    + 'the SHAPE of the thing that makes it: box-24, the hog\'s nose disc, cut to 0.600 x '
    + '0.320 and hung under the jaw as the resonating throat, at the lowest height that keeps '
    + 'the whole of it on this hull\'s flat front face. Nothing else in the project wears '
    + 'anything under its chin. THE ARMS ARE MISSING, as they are on animal-gorilla and '
    + 'animal-gibbon and for the same mechanical reason: the leg row is four copies of one '
    + 'shape at one height. THE SHELL IS THE FROZEN MONKEY\'S ON PURPOSE — a howler is a '
    + 'monkey — so the separation is the throat, the carried tail and the absence of a '
    + 'muzzle, not the body. NEW PALETTE, UNREVIEWED.',
})
