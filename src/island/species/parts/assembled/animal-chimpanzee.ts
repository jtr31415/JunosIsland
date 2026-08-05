/**
 * The chimpanzee — the first primate in the project with EARS, and they are the
 * elephant's.
 *
 * Six apes and monkeys already stand in the tree and every one is separated on a
 * different axis: the FROZEN `animal-monkey` is Kenney's own cube;
 * `animal-baboon` is that cube with a dog's muzzle; `animal-gorilla` takes
 * `box-41`, the biggest shell, and wears a silver back; `animal-gibbon` takes
 * `box-21`, the tallest; `animal-howler-monkey` its throat and its rope;
 * `animal-lemur` the panda cube's own cut. **Not one of them has an ear part** —
 * `animal-gibbon.ts` says outright that no ears and no tail is what holds it
 * apart from the lemur.
 *
 * A chimpanzee's ears are the thing a child draws. So this is the ape that gets
 * them, and the shape is **`tube-04`, the elephant's outer ear**: 0.359 x 0.619
 * x 0.277, attaching `x +1`. It is lifted from its donor's mid-body station to
 * 1.15, which is head height on this shell, and **sunk 0.40 rather than the
 * elephant's own 0.126** for a reason §3 states: nothing floats, and every eared
 * species in the pack buries its ear by at least 0.125. At the donor's burial
 * only 0.045 would be inside the head. At 0.40 it is 0.144 in and **0.216 clear
 * of the flank** — a big flat ear held out sideways, which is a chimpanzee and
 * is nothing any other primate here does.
 *
 * Everything else is subtraction: **no tail** (an ape has none, the gorilla's
 * and the gibbon's separation taken a third time), no belly line (a chimpanzee
 * is one dark tone from chin to foot), and the pale is spent entirely on the
 * FACE — `tube-03`, the deer's uncut muzzle, which no primate here wears and
 * which arrives as one tone rather than the fox's two.
 *
 * The brow ridge is one `plate-13` stretched 3.5x: 12 triangles, and the only
 * thing on this animal that strains a rule. See the flag.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import { EYE_CARD_Z } from '../hulls'

/** `box-03`'s own flat side, where an `x +1` ear joins. */
const FLANK_X = 0.625
/** Head height on this shell — above the eye plane, below the crown. */
const EAR_Y = 1.15
/** Clear of the eye card's own top at 1.0936, so the two cards never overlap. */
const BROW_Y = 1.16

export const CHIMPANZEE_ASSEMBLY = defineCreature('animal-chimpanzee', {
  palette: {
    coat: 0x2a2521,    // UNREVIEWED: the near-black coat
    face: 0xc9a882,    // UNREVIEWED: the pale tan face and ears of a young chimp
    limb: 0x1e1a17,    // UNREVIEWED: the arms and legs, darker still
    mark: 0x141110,    // UNREVIEWED: the brow ridge and the nose
    sclera: 0xe8e0d2,  // UNREVIEWED: named because there is no `belly` slot
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* No `belly` line at all: a chimpanzee is one tone from chin to foot, and the
   * pale is spent on the face instead. `under` therefore has to be named or the
   * sclera falls back to the coat and the eye inverts (animal-ferret.ts). */
  under: 'sclera',

  /* The pack's smallest card. A chimpanzee's eye is a small dark bead set in a
   * big pale face, which is the opposite of the gorilla's arrangement. */
  eyes: { part: 'plate-06', paint: 'sclera' },

  /* Wide and short: an ape carries its weight forward on its knuckles, and the
   * wheelbase is the only thing this kit has to say that with — the leg row is
   * four copies of one shape at one height. animal-gorilla.ts's own reading. */
  legs: { x: 0.33, z: 0.29, paint: 'limb' },

  /* THE EARS, and the first on any primate here. The elephant's outer ear,
   * lifted from its donor's mid-body station to head height and sunk 0.40 where
   * the elephant's own burial is 0.126 — §3's nothing-floats floor is 0.125 of
   * burial and the donor's would give 0.045. It stands 0.216 clear. */
  ears: { part: 'tube-04', paint: 'face', sink: 0.40, at: [FLANK_X, EAR_Y, 0.18] },

  /* The deer's uncut muzzle — 0.532 long, 0.2314 proud, and the one muzzle in
   * the family Kenney did NOT split, so a chimpanzee's face is one pale tone
   * rather than the fox's pale lip under a dark bridge. */
  snout: { part: 'tube-03', paint: 'face' },

  /* The dog's and the MONKEY's own nose-tip, the smallest solid nose in the
   * bank, on the muzzle's own placed front plane. */
  nose: { part: 'wedge-10', paint: 'mark' },

  extras: [
    /* THE BROW RIDGE. `plate-13` is the crab's, dog's, lion's and tiger's face
     * plate — 0.219 x 0.100, 12 triangles — stretched to 0.767 across so it runs
     * the width of the face as one bar. At 1.16 it clears the eye card's own top
     * at 1.0936, so the two cards are never coplanar and never z-fight. */
    {
      name: 'brow',
      part: 'plate-13',
      paint: 'mark',
      stretch: [3.5, 1, 1] as [number, number, number],
      at: [0, BROW_Y, EYE_CARD_Z] as [number, number, number],
    },
  ],

  flag: 'THE ARMS ARE MISSING AND THEY ARE HALF THE ANIMAL — the same gap animal-gorilla.ts '
    + 'and animal-gibbon.ts both record. The leg row is four copies of ONE shape at ONE '
    + 'height, so the front pair cannot be longer than the back and there is no arm feature to '
    + 'add; a wide short wheelbase is as far as the mechanism goes. WHAT IS NEW: this is the '
    + 'FIRST PRIMATE IN THE PROJECT WITH EARS. Six are already built and not one of them has '
    + 'an ear part — animal-gibbon.ts says no ears and no tail is what holds it apart from the '
    + 'lemur — and a chimpanzee\'s ears are the thing a child draws. The shape is tube-04, the '
    + 'elephant\'s outer ear, lifted from the elephant\'s mid-body station to 1.15 and sunk '
    + '0.40 rather than its donor\'s own 0.126, because at the donor\'s burial only 0.045 '
    + 'would be inside the head and §3 is that nothing floats. THE ONE STRAINED RULE is the BROW '
    + 'RIDGE: plate-13 stretched 3.5x along its own length. §3 sanctions a stretch on an EAR '
    + 'or a SNOUT and measured the pack\'s own varying 2.90x; a face card is neither, and '
    + 'animal-zebra.ts took the same strain for its stripes. Drop the extra and the brow goes '
    + 'with it — it is one line. NEW PALETTE, UNREVIEWED, and the pale TAN face is the '
    + 'judgement in it: an old chimpanzee\'s face goes black, which is the bonobo\'s colour '
    + 'here, so these two animals are told apart partly by a decision about age.',
})
