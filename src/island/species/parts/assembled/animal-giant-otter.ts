/**
 * The giant otter — the beaver's paddle, taken where `animal-otter` refused it,
 * and the reason is a measurement rather than a change of mind.
 *
 * `animal-otter.ts` refuses `wedge-03` outright: *"the only tail in the bank with
 * a flattened section (0.726 across against 0.589 through) and it reads as a
 * paddle whatever it is painted"*, and a Eurasian otter's tail is a round
 * tapering rudder. **A giant otter's tail is genuinely flattened** — that is the
 * field character that separates the two species in life — so the shape that was
 * wrong there is right here, and the refusal and the taking are the same
 * argument used twice. Every other separation from that animal follows the size:
 *
 *   - **`box-41`, the biggest shell the pack drew**, against the otter's plain
 *     cube. A giant otter is nearly two metres of animal and this is the only
 *     honest way to say so, since a hull is never scaled.
 *   - **The muzzle is `box-40` worn as a MUZZLE.** `animal-otter.ts` wears the
 *     polar bear's broad pad as a NOSE; here the same shape sits on `box-41`'s
 *     own muzzle boss at z = 0.725 and is the whole broad flat face, with
 *     `box-37` as the small nose on it. §3.1 exactly: a part's identity is where
 *     it is placed.
 *   - **The ears are `box-05`, the smallest in the bank**, sunk to 0.6 so only
 *     0.093 shows. A giant otter's ears are almost invisible.
 *
 * **THE THROAT BIB IS NOT HERE AND THE REASON IS THIS HULL.** It is the field
 * mark — every giant otter's is a different shape and that is how keepers tell
 * them apart — and a flat card under the chin is the obvious way to say it.
 * There is nowhere to put one. `animal-gorilla.ts` measured `box-41`'s muzzle
 * boss as running **y 0.494 to 0.894**, standing 0.100 proud of the flat front
 * plate, and that window is the whole of this hull's front face at chest height.
 * A card at the boss's depth below the muzzle hangs off its bottom edge; a card
 * at the plate's depth is buried inside the boss. So the cream is spent on the
 * muzzle instead, and the bib is in the flag.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s own stations: flat crown, muzzle boss, rear plate, centre. */
const CROWN_Y = 1.43125
const BOSS_Z = 0.725
const REAR_Z = -0.625
const HULL_MID_Y = 0.83125

export const GIANT_OTTER_ASSEMBLY = defineCreature('animal-giant-otter', {
  palette: {
    coat: 0x4a3527,    // UNREVIEWED: the dark chocolate of a wet giant otter
    bib: 0xe7d9bd,     // UNREVIEWED: the cream throat bib, the muzzle, and the sclera
    mark: 0x241a13,    // UNREVIEWED: the small nose
    limb: 0x392a1f,    // UNREVIEWED: the short heavy legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The biggest shell there is. A giant otter is the size of a man and the hull
   * is the only place this kit can put that. */
  hull: { part: 'box-41', paint: 'coat' },

  /* No painted belly line. A giant otter is one dark tone all over apart from
   * the bib, and the bib is a card rather than a boundary — so `under` is named
   * for the sclera and nothing else reads it. */
  under: 'bib',

  /* Wide and long on the biggest hull: `box-01` is 0.375 across, so a station at
   * 0.42 puts each leg's outer face at 0.6075, one sixteenth inside this shell's
   * own side at 0.675 — animal-wolf.ts's daylight rule on a bigger body. */
  legs: { x: 0.42, z: 0.40, paint: 'limb' },

  /* The bank's smallest ear, sunk past its own recorded burial to 0.6 so only
   * 0.093 of it shows. A giant otter's ears barely break its outline at all. */
  ears: { part: 'box-05', paint: 'coat', sink: 0.6, at: [0.30, CROWN_Y, 0.28] },

  /* THE MUZZLE. animal-otter.ts's NOSE, worn as a face: the polar bear's broad
   * flat pad, sitting on this hull's own muzzle boss, painted cream.
   *
   * 0.73 is solved, not picked. `animal-gorilla.ts` measured `box-41`'s boss as
   * running y 0.494 to 0.894, and `box-40` is 0.321 tall — so a centre of 0.73
   * puts it at 0.569 to 0.890, the whole of it standing on the boss with none
   * hanging in the air over the flat plate 0.100 behind. That is the goose's §5
   * warning applied to the front face instead of the crown. */
  snout: { part: 'box-40', paint: 'bib', at: [0, 0.73, BOSS_Z] },

  /* The panda's small nose-tip on the muzzle's own placed front plane. */
  nose: { part: 'box-37', paint: 'mark' },

  /* THE PADDLE, refused by animal-otter and taken here — see the header. Its own
   * facing and its own 0.2943 burial, no spin and no stretch; only the height is
   * moved, from the beaver's high root down to the body's own centre, so it
   * continues the line of the back the way a swimming otter's does. */
  tail: { part: 'wedge-03', paint: 'coat', at: [0, HULL_MID_Y, REAR_Z] },

  flag: 'THE SEPARATION TO CHECK IS animal-otter, AND THIS ANIMAL TAKES THE PART THAT FILE '
    + 'REFUSES. Its flag says wedge-03, the beaver\'s paddle, "is the only tail in the bank '
    + 'with a flattened section (0.726 across against 0.589 through) and it reads as a paddle '
    + 'whatever it is painted" — and that is exactly why it is here, because a GIANT otter\'s '
    + 'tail genuinely is flattened and that is the field character separating the two species. '
    + 'The refusal and the taking are the same measurement read twice. THE OTHER SEPARATIONS '
    + 'ARE ALL SIZE: box-41, the biggest shell the pack drew, against the otter\'s plain cube; '
    + 'a 0.42 stance against its 0.27; and box-40 worn as a MUZZLE on this hull\'s own boss '
    + 'where that animal wears the same shape as a NOSE, which is §3.1 (a part\'s identity is '
    + 'where it is placed) paying out. WHAT IS MISSING IS THE THROAT BIB, and the reason is '
    + 'this hull rather than the bank. It is the field mark — every giant otter\'s bib is a '
    + 'different shape and that is how keepers tell them apart — and a flat card under the '
    + 'chin is the obvious way to say it. There is nowhere to put one: animal-gorilla.ts '
    + 'measured box-41\'s muzzle BOSS as running y 0.494 to 0.894 and standing 0.100 proud of '
    + 'the flat front plate, and that window is the whole of the front face at chest height, '
    + 'so a card at the boss\'s depth hangs off its bottom edge and a card at the plate\'s '
    + 'depth is buried inside the boss. The cream is spent on the muzzle instead. IF YOU WANT '
    + 'THE BIB: the cheapest route is to move this animal onto a hull with no boss and take '
    + 'the size hit, or to raise the muzzle and hang a plate-10 under it and accept the '
    + 'overhang. Nothing here is stretched. NEW PALETTE, UNREVIEWED.',
})
