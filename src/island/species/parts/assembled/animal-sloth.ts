/**
 * The sloth — the flat round face is the animal, and it is the one hull in the
 * pack that can carry it.
 *
 * `blade-05` is the LION's muzzle plate: a 1.000-square flat face MASK whose
 * band 5 is a free mouth line across its whole width. `animal-frog.ts` measured
 * why it only fits `box-31` — that shell's front face is 0.500, the mask is
 * 0.125 thick, so its face lands on 0.625 and the eye card at the absolute
 * 0.6350 clears it by exactly the 0.010 the pack gives a card. On any of the
 * seven usual hulls the mask stands at 0.750 and swallows the eyes. **The frog
 * no longer wears it** — Joe replaced it in the editor — so the plate is unspent
 * and this is the animal it was waiting for: a sloth's face is a pale disc with
 * a fixed smile in it and nothing else.
 *
 * The eyes are `plate-14`, the pack's biggest, solved to the mask's own upper
 * corners rather than placed: the card is 0.4355 x 0.4426, the mask runs +/-0.5
 * about the hull centre, so x 0.28 and y 1.0625 are as wide and as high as a
 * card can sit and stay on it.
 *
 * **NO TAIL AND NO EARS**, and both are the animal rather than a saving — a
 * sloth's ears are buried in its coat and its tail is a stub you cannot see.
 * That is also the whole separation from the four primates in this collection.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s flat front face — the lion's own, and the one under 0.625. */
const FACE_Z = 0.5

export const SLOTH_ASSEMBLY = defineCreature('animal-sloth', {
  palette: {
    coat: 0x8d7f6b,    // UNREVIEWED: the shaggy grey-brown, algae-tinged
    face: 0xd8c9a8,    // UNREVIEWED: the pale face disc, and the sclera
    mark: 0x4a3d2c,    // UNREVIEWED: the mouth line, the nose and the hooks
    limb: 0x77694f,    // UNREVIEWED: the long limbs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallower shell, and it is chosen by the mask's arithmetic
   * above rather than by anything about sloths. */
  hull: { part: 'box-31' },

  /* No belly line: a sloth is one colour all over. The pale slot is the FACE. */
  under: 'face',

  /* THE MASK. A pure donor transfer — joined at this hull's front face, sunk its
   * own measured 0.000, its centre recovers `blade-05`'s recorded 0.5625 to the
   * digit, because the lion wears this plate on this same shell. Band 5 is
   * Kenney's own bottom strip, so the mouth is one `byBand` entry and no
   * geometry at all (§4's first way). */
  snout: { part: 'blade-05', paint: { base: 'face', byBand: { 5: 'mark' } } },

  /* The pack's biggest card, in the mask's own upper corners. Rule 5 makes
   * stretching one unsayable, so this is as big as a sloth's eye may get. */
  eyes: { part: 'plate-14', paint: 'face', x: 0.28, y: 1.0625 },

  /* The dog's and the MONKEY's own nose-tip, unspent until now — the smallest
   * solid nose in the bank at 0.120 x 0.108. Anchored on the mask's placed front
   * plane automatically, because a snout exists. */
  nose: { part: 'wedge-10', paint: 'mark' },

  extras: [
    /* THE HOOKS. A sloth's arms and its two long claws are what a child draws,
     * and the leg row is four copies of one shape at one height, so the arms
     * cannot be longer than the legs. What CAN be said is the hook: two hog
     * tusks driven forward out of the lower chest at the shape's own 0.390
     * burial, reaching 0.250 clear of the face. It is the nearest honest thing
     * and the flag says so. */
    {
      name: 'hook',
      part: 'wedge-13',
      kind: 'pair' as const,
      paint: 'mark',
      at: [0.3125, 0.45, FACE_Z] as [number, number, number],
    },
  ],

  flag: 'THE FACE IS blade-05, THE LION\'S MUZZLE PLATE, AND IT ONLY FITS THIS HULL — '
    + 'animal-frog.ts measured that: box-31\'s front face is 0.500, the mask is 0.125 thick, '
    + 'so its face lands on 0.625 and the eye card at the absolute 0.6350 clears it by the '
    + '0.010 of daylight the pack gives a card. On any usual 0.625 hull the mask stands at '
    + '0.750 and swallows both eyes. The frog no longer wears it after your own edit, so it '
    + 'was unspent. Band 5 is Kenney\'s own bottom strip and it is the mouth, free. WHAT IS '
    + 'MISSING IS THE ARMS AND THE CLAWS: the leg row is one shape at one height so the front '
    + 'pair cannot be longer, and the `claw` role has never been baked into the bank at all — '
    + 'the two hog tusks driven forward out of the chest are a stand-in for the hooks and '
    + 'nothing more. NO EARS AND NO TAIL, both deliberate, and both are what hold this animal '
    + 'apart from the gibbon, the lemur and the howler monkey. NEW PALETTE, UNREVIEWED.',
})
