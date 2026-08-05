/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry: it opens
 * in the workbench, it has a palette and a stance you can judge, and every part
 * of it names itself as a stand-in.
 *
 * ## What is missing, measured
 *
 * **A SEGMENTED LEG.** `docs/how-the-animals-are-made.md` §14 names it for
 * Critters and it is still true here: the bank holds exactly ONE leg shape,
 * `box-01`, a straight tapered frustum 0.375 x 0.306 x 0.375, used 86 times
 * across 23 of the pack's 24. A spider's leg bends twice and reaches further than
 * its body is wide. Eight `box-01` under the hull is the nearest honest thing and
 * it reads as a beetle rather than as a tarantula.
 *
 * **A TWO-PART BODY, WHICH RULE 3 FORBIDS OUTRIGHT.** A spider is a
 * cephalothorax and an abdomen joined at a waist — two masses. Rule 3 is one
 * mass, `CreatureDef` has no plural hull, and a feature wearing a hull shape
 * throws by name. So the abdomen here is `box-35`, the panda's rump BAND, cut
 * thin: a rim round the back of one body rather than a second body.
 *
 * **EIGHT EYES.** Rule 6 makes an eye a mirrored PAIR and rule 5 pins both cards
 * to the absolute z = 0.6350. Two is what this kit can say.
 *
 * ## What I would try first, doing it by hand
 *
 * The legs. Their stations are the only dial that costs nothing — `LEG_X` and the
 * four `LEG_Z` below — and pushing them out and apart is what turns a beetle into
 * a spider. §8 step 4 caps them: a leg buried 0.119 stays embedded to
 * z = 0.4315, and 0.42 is where they sit. Past that they float. If a splayed
 * eight still does not read, this species wants a bespoke bent leg and no
 * arrangement of the bank will finish it.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** As far out as a leg can join the flat underside and stay embedded (§8 step 4). */
const LEG_X = 0.4
/** Four pairs down the body, the outermost at the same bound. */
const LEG_Z: readonly number[] = [0.42, 0.14, -0.14, -0.42]

export const TARANTULA_ASSEMBLY = defineCreature('animal-tarantula', {
  palette: {
    coat: 0x4a3226,    // UNREVIEWED: the chocolate brown of a curly hair
    belly: 0x6b4a34,   // UNREVIEWED: barely paler — a spider has no pale venter
    abdomen: 0x2f1f18, // UNREVIEWED: the darker rear
    limb: 0x5c4030,    // UNREVIEWED: the eight legs
    fang: 0x1b1310,    // UNREVIEWED: the two chelicerae
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  /* Off, because four is the wrong number and the builder's row is four. */
  legs: false,

  /* The pack's smallest card. A tarantula has eight eyes in a cluster; this kit
   * has one mirrored pair on one plane, and that is the flag. */
  eyes: { part: 'plate-06' },

  extras: [
    /* THE EIGHT LEGS. `box-01` at the pack's own row height and its own measured
     * burial — nothing here is invented except the count and the stations. */
    ...LEG_Z.map((z, i) => ({
      name: `leg-${i}`,
      part: LEG_ROW.part,
      kind: 'pair' as const,
      paint: 'limb',
      sink: LEG_ROW.sink,
      at: [LEG_X, LEG_ROW.y, z] as [number, number, number],
    })),

    /* THE ABDOMEN, AS A BAND. See the header: two masses are rule 3's exact
     * fault, so this is the panda's rump shell at 0.45 of its depth, joined on
     * the rear at its own burial of 1.000 and showing only where it is wider
     * than the hull — 0.0465 of proud rim all the way round. */
    {
      name: 'abdomen',
      part: 'box-35',
      paint: 'abdomen',
      stretch: [1, 1, 0.45] as [number, number, number],
    },

    /* THE CHELICERAE. Two hog tusks at their own burial on the lower face. The
     * `claw` role has never been baked into the bank — the crab's own pincer is
     * in a GLB in this repo and the generator has never emitted it — so a tusk
     * is what a fang has to be. */
    {
      name: 'fang',
      part: 'wedge-13',
      kind: 'pair' as const,
      paint: 'fang',
      at: [0.1, 0.55, 0.625] as [number, number, number],
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THREE THINGS '
    + 'ARE MISSING AND ONLY ONE OF THEM IS A SHAPE. (1) A SEGMENTED LEG: the bank holds ONE '
    + 'leg, box-01, a straight tapered frustum 0.375 x 0.306 x 0.375 used 86 times in the '
    + 'pack, and a spider\'s leg bends twice and reaches past its own body — the eight here '
    + 'read as a beetle. docs/how-the-animals-are-made.md section 14 names this same gap for '
    + 'Critters. (2) A TWO-PART BODY: a spider is a cephalothorax and an abdomen at a waist, '
    + 'and RULE 3 is one mass — a head box beside a body box is the exact fault that scrapped '
    + '72 animals — so the abdomen is box-35, the panda\'s rump BAND, cut to 0.45 and showing '
    + 'as a 0.0465 rim. (3) EIGHT EYES: rule 6 makes an eye a mirrored pair and rule 5 pins '
    + 'both cards to z = 0.6350, so two is the most this kit can say. THE FANGS ARE HOG '
    + 'TUSKS because the `claw` role has never been baked. START WITH THE LEG STATIONS if you '
    + 'are finishing it: LEG_X and LEG_Z are free to 0.4315 before a leg floats. NEW PALETTE, '
    + 'UNREVIEWED.',
})
