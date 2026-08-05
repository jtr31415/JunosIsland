/**
 * The lemur — the panda's own band cut worn as a coat, and a tail carried up.
 *
 * **`box-36` ARRIVES PRE-SPLIT AND THIS IS THE ANIMAL IT FITS.**
 * `animal-kinkajou.ts` wears the panda's cube and REFUSES its band cut, on the
 * grounds that it is a black-and-white bear's cut and a kinkajou is one uniform
 * gold. A ring-tailed lemur is grey above and cream below with a hard edge
 * between them, which is exactly what band 3 over band 15 is — so this species
 * takes the cut instead of a painted line, and it costs no geometry at all
 * (§4's first way, where every other mammal here uses the second).
 *
 * **THE TAIL IS CARRIED UP AND THE RINGS ARE NOT THERE.** `wedge-15`, the lion's
 * — 0.280 across against the cat's rope at 0.200, the thicker of the two long
 * tails — with `chamfer: true`, which solves this shell's own +y/-z chamfer
 * midpoint (0.46875, -0.46875) and the 45-degree turn onto its outward normal
 * together. A ring-tailed lemur holds its tail vertically and that is the one
 * thing everybody knows about it. Its band 5 is Kenney's own end cut, so the tip
 * is pale: ONE ring where the animal has thirteen, and the flag says so.
 *
 * The face is the fox's muzzle and nose-tip painted black on a grey head, and
 * the eyes are `plate-14`, the pack's biggest, amber to the rim.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const LEMUR_ASSEMBLY = defineCreature('animal-lemur', {
  palette: {
    coat: 0x9a9a94,    // UNREVIEWED: the grey back — Kenney's band 3
    pale: 0xeae4d6,    // UNREVIEWED: the cream front (band 15), sclera, tail tip
    face: 0x231f1c,    // UNREVIEWED: the black muzzle and nose
    limb: 0x82827c,    // UNREVIEWED: the legs, a shade under the coat
    eye: 0xc98a24,     // UNREVIEWED: amber, to the rim
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE PANDA'S CUBE, WITH THE PANDA'S OWN CUT. Band 3 is the upper shell (28
   * triangles) and band 15 the lower (44); painting the second pale gives a hard
   * grey-over-cream boundary with no `belly` line anywhere on the animal. */
  hull: { part: 'box-36', paint: { base: 'coat', byBand: { 15: 'pale' } } },

  /* Named because there is no `belly` slot: `under` feeds the sclera. */
  under: 'pale',

  /* The panda's own eye card, the biggest in the pack, and there is nothing
   * above it — rule 5 makes stretching one unsayable. */
  eyes: { part: 'plate-14', paint: 'eye' },

  /* The beaver's and the polar bear's round ear at its own recorded station.
   * A lemur's ears are round, held wide and only half out of the fur. */
  ears: { part: 'box-02', paint: 'pale' },

  /* The fox's own muzzle — 0.532 long, the pointed end of the family — painted
   * black, which is the whole of a lemur's face. */
  snout: { part: 'tube-06', paint: 'face' },

  /* The fox's nose-tip on the muzzle's placed front plane. */
  nose: { part: 'box-22', paint: 'face' },

  /* CARRIED UP, and the tip is Kenney's own end band. See the header. */
  tail: {
    part: 'wedge-15',
    paint: { base: 'coat', byBand: { 5: 'pale' } },
    chamfer: true,
  },

  flag: 'THE RINGS ARE NOT THERE AND A RING-TAILED LEMUR IS NAMED FOR THEM. Colour is a '
    + 'texture LOOKUP with no positional information: `Paint.patch` takes one HEIGHT, and '
    + '`byBand` can only recolour where Kenney already cut — wedge-15 carries exactly two '
    + 'bands, so the tail gets ONE pale tip where the animal has thirteen alternating rings. '
    + 'animal-stoat.ts uses that same end band for a black tip and animal-cheetah.ts for a '
    + 'white one; this is the third animal to spend it and the first for which one band is '
    + 'visibly not enough. THE BLACK-AND-WHITE FACE IS ALSO ABSENT for the same reason — '
    + 'box-36 carries two bands and they run top-to-bottom, not around the eyes — so the face '
    + 'is a black muzzle on a grey head and no more. WHAT IS RIGHT: the coat boundary is '
    + 'Kenney\'s own cut rather than a painted line, which is the one animal in the project '
    + 'that fits, and the tail is carried vertically, which is the pose everybody draws. NEW '
    + 'PALETTE, UNREVIEWED.',
})
