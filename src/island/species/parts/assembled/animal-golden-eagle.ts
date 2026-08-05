/**
 * The golden eagle — the collection's exemplar, and the bird the three raptor
 * idioms were measured on. `collections/raptors.ts` carries the survey; this
 * file carries the numbers.
 *
 * **THE HOOK IS TWO PARTS, and that is the answer to §14.** `cone-06`, the
 * parrot's beak, reaches 0.1833 and is a straight point; `box-24`, the hog's
 * nose pad, is joined `on: 'snout'` — to the beak's own built tip, solved off
 * its vertices — and spun 55 degrees about x so it points down and forward. The
 * pair spans z 0.682 to 1.073 and y 0.822 down to 0.455 against a bill whose own
 * tip is z 0.808: the second part continues 0.265 past the first and drops below
 * its base. A bend, not a curve, and 0.400 wide on a 0.400 bill so it reads as
 * one mass rather than two.
 *
 * **THE TALON IS `wedge-11`, THE ELEPHANT'S TUSK**, at the foot's own front face
 * z = 0.1875 and at half its own height, so its underside lands on the ground
 * the leg row already defines and the bird does not refloor. The `claw` role has
 * never been baked — see the collection file, where that is a commission.
 *
 * The GOLD is the inverted belly: coat gold, `belly` dark at 14/16, so the pale
 * slot is the BODY and the coat is the crown. That is what makes this eagle
 * golden without a nape card.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-01`'s own half-depth: the front face of the foot, where a talon joins. */
const TALON_Z = 0.1875
/** Half `wedge-11`'s own 0.3069 height, so the talon's underside is the ground. */
const TALON_Y = 0.15345

export const GOLDEN_EAGLE_ASSEMBLY = defineCreature('animal-golden-eagle', {
  palette: {
    coat: 0xa2803f,    // UNREVIEWED: the golden crown and nape — see the header
    belly: 0x40331f,   // UNREVIEWED: dark umber, and it is the BODY, not the belly
    flight: 0x352a19,  // UNREVIEWED: wings and tail, darker still
    limb: 0xe3b93a,    // UNREVIEWED: the yellow foot, and the talon
    bill: 0xd8c48a,    // UNREVIEWED: horn-coloured base
    hook: 0x241f1a,    // UNREVIEWED: the down-turned tip
    eye: 0xa9762a,     // UNREVIEWED: amber to the rim
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fox's shell, the TALLEST in the bank at 1.5051, which is how the two
   * big eagles stand over everything else here: 1.6863 against the hawks' 1.4312. */
  hull: { part: 'box-21' },
  /* INVERTED. Below 14/16 is `belly` — so the dark is the body and the coat is
   * the crown. The pack's painted line has no z term, so a nape is unsayable and
   * a CAP is not. */
  belly: 0.875,

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The bill, and then the hook on its own built tip. See the header. */
  snout: { part: 'cone-06', paint: 'bill' },

  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    { name: 'talon', part: 'wedge-11', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* The chick's and the parrot's real wing at pure donor transfer: 0.473 clear
     * of the flank each side, 2.1960 across, keep-out 1.0980 under the fox's own
     * 1.15. §14 said this pack has no spread wing. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const },
  ],

  flag: 'THE HOOKED BILL IS TWO STRAIGHT PARTS MEETING AT AN ANGLE and that is the thing to '
    + 'judge on this bird, because fifteen others copy it. cone-06 (the parrot\'s beak, the '
    + 'bank\'s longest at 0.1833 of reach) points forward; box-24 (the hog\'s nose pad, 0.400 x '
    + '0.400 x 0.200) is joined ON ITS OWN BUILT TIP and spun 55 degrees down, reaching z 1.073 '
    + 'against the bill\'s 0.808 and dropping to y 0.455 against its 0.517. It is a BEND, not a '
    + 'curve — the bank holds no curve at all — and if the elbow reads wrong the dial is the '
    + 'angle. animal-vulture.ts solved the same problem with one part and a dark band; this is '
    + 'the better answer and that bird can take it. THE TALON IS A STAND-IN: the pack drew ten '
    + 'claws and the `claw` role has never been baked, so this is wedge-11, the elephant\'s '
    + 'TUSK, at the foot\'s front face. Baking claw is one line in the generator and it is '
    + 'yours, not a builder\'s — it renumbers the bank. THE GOLD IS AN INVERTED BELLY PATCH: '
    + 'coat gold, belly dark at 14/16, so the pale slot is the body. NEW PALETTE, UNREVIEWED.',
})
