/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually. if there is no entry at all,
 * i cant do that."* This is that entry, and what is missing is the SIZE.
 *
 * ## What is missing, measured, and it is three things
 *
 * **1. THE LENGTH, AND IT IS THE WHOLE ANIMAL.** A blue whale is about 4.5 times
 * longer than it is deep. `HullDef.stretch` is `never` — Joe's own ruling of 2
 * August, *"the body/cube should always be the standard size"* — so the only way
 * to change a body proportion is to name a different real shell, and the ten the
 * pack drew run from 1.125 to 1.539 on their longest axis against 1.125 to 1.505
 * on their shortest. **Every one of them is within 25% of a cube.** `box-41`,
 * used here, is 1.350 x 1.300 x 1.350 — the biggest, and cubic. The longest
 * animal that has ever lived is being built as a box. `animal-whale.ts` records
 * the same wall in Ocean and `animal-stick-insect.ts` records it in Critters,
 * where `collections/critters.ts` calls it a RULING rather than a commission.
 *
 * **2. THE THROAT PLEATS.** Sixty to ninety parallel grooves running from the
 * chin to the navel. `RidgeDef.rows` is `top | chamfer | side` — there is no
 * belly row — and the grooves run along the body's LENGTH where a ridge's
 * stations run along z as a line of separate parts. It is also a pattern, which
 * is the project's oldest wall.
 *
 * **3. THE MOTTLING.** A blue whale is named for a blue-grey dapple. Colour here
 * is a lookup with no positional information, so a pattern cannot be painted —
 * five files in Jungle say so and this is the sixth.
 *
 * ## What is standing in, and one thing in it is new
 *
 * `box-41`, the biggest shell the pack drew, legless. The **flippers are
 * `box-43`, the FISH's own pectoral fin** — and it is **UNSPENT by every one of
 * the 190 species built so far**, which is worth knowing on its own:
 * `docs/how-the-animals-are-made.md` §14 said for a week that the pack had no
 * fin, `collections/ocean.ts` corrected it for `blade-06`, and this is the other
 * half of that correction finally being used. It is cut long and thin, 1.7 x 0.7
 * x 0.75, because a blue whale's flipper is the slenderest of any whale's.
 *
 * The **flukes are a `wedge-19` PAIR laid flat on the tail stock**, rather than
 * `animal-whale.ts`'s single `box-38` spun a quarter turn. A fluke is two lobes,
 * and two lobes is what this is. The **blowholes are a `plate-12` PAIR** — a
 * rorqual genuinely has two, where `animal-whale.ts` has one — sitting 0.010
 * proud of the crown, which is the pack's own card daylight.
 *
 * **If you are doing this by hand:** the pleats are the cheapest of the three to
 * try, and `RidgeDef.place` is the door — a `side` row overridden to
 * `[0.60, 0.35, 0.10]` puts stations low on the flank rather than at the hull's
 * own equator, which is as near a belly row as the builder gets today. The
 * length is not a dial at all: it is Joe's ruling, and reopening it is his call
 * and nobody else's.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s own stations: its flat crown, its flat front plate, its rear. */
const CROWN_Y = 1.43125
const BOSS_Z = 0.725
const REAR_Z = -0.625
const HULL_MID_Y = 0.83125
const FLANK_X = 0.675

/** The pack's own card daylight, measured at sd 0.0000 over all 48 eye cards. */
const CARD_AIR = 0.01

export const BLUE_WHALE_ASSEMBLY = defineCreature('animal-blue-whale', {
  palette: {
    coat: 0x5a7f9c,    // UNREVIEWED: the blue-grey a blue whale is named for
    belly: 0xcfd8d2,   // UNREVIEWED: the pale underside, and the sclera
    fin: 0x4a6b86,     // UNREVIEWED: flippers, flukes and the small dorsal
    mouth: 0x2e4457,   // UNREVIEWED: the mouth line and the blowholes
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The biggest shell the pack drew, and it is still a box. See the header. */
  hull: { part: 'box-41', paint: 'coat' },
  belly: 0.4375,
  legs: false,

  /* Small, low and set well back: a blue whale's eye is a bead behind the jaw
   * line on a head the size of a car. The pack's smallest card, at x 0.45,
   * which keeps the whole of it inside this hull's own side at 0.675. */
  eyes: { part: 'plate-06', x: 0.45, y: 0.70 },

  /* THE TAIL STOCK. The elephant's trunk turned to trail — the bank's one
   * straight tapering stub — carrying the fluke lobes below. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_MID_Y, REAR_Z],
  },

  extras: [
    /* THE FLIPPERS. box-43 is the FISH's own pectoral fin and no species built
     * so far wears it. Cut long and thin — a blue whale's flipper is the
     * slenderest of any whale's — it stands 0.538 clear at its own 0.126
     * burial, which is a keep-out of 1.213 against Woodland's ceiling of 1.6. */
    {
      name: 'flipper',
      part: 'box-43',
      paint: 'fin',
      kind: 'pair' as const,
      stretch: [1.7, 0.7, 0.75] as [number, number, number],
      at: [FLANK_X, 0.62, 0.20] as [number, number, number],
    },

    /* THE FLUKE, as TWO LOBES. animal-whale.ts spins the parrot's fan a quarter
     * turn and gets one flat blade; a fluke is a pair, so this is the chick's
     * and parrot's wing left on its own `x +1` facing and mirrored, sitting
     * inside the tail stock's own span so both lobes are embedded. */
    {
      name: 'fluke',
      part: 'wedge-19',
      paint: 'fin',
      kind: 'pair' as const,
      /* 0.30 rather than the wing's own 0.174: §3's floor is 0.125 of burial and
       * what these are buried IN is the tail stock, whose half-width is 0.1725.
       * At 0.30 each lobe reaches 0.012 past the midline and is 0.185 inside. */
      sink: 0.30,
      at: [0.16, HULL_MID_Y, -0.90] as [number, number, number],
    },

    /* The small dorsal, far back — on a blue whale it is barely a bump, and it
     * is also what lifts a legless hull off 1.30 and over the pack's 1.43
     * floor. Cut to 0.6 of its own length, which is small enough to read as a
     * bump and large enough to clear that floor. */
    {
      name: 'dorsal',
      part: 'wedge-19',
      paint: 'fin',
      spin: [{ axis: 'z', deg: 90 }],
      stretch: [0.6, 1, 1] as [number, number, number],
      /* animal-whale.ts's own dorsal burial. At the wing's recorded 0.174 only
       * 0.060 would be inside the back, under §3's 0.125 floor. */
      sink: 0.4,
      at: [0, CROWN_Y, -0.42] as [number, number, number],
    },

    /* TWO BLOWHOLES, which is what a rorqual has. The cow's and hog's nostril
     * card, turned to lie on the crown and set 0.010 proud of it — the pack's
     * own card daylight, rather than coplanar where it would z-fight. */
    {
      name: 'blowhole',
      part: 'plate-12',
      paint: 'mouth',
      kind: 'pair' as const,
      spin: [{ axis: 'x', deg: -90 }],
      stretch: [2, 1, 2] as [number, number, number],
      at: [0.09, CROWN_Y + CARD_AIR, 0.28] as [number, number, number],
    },

    /* The mouth line, run the full width of the head and set 0.010 proud of
     * this hull's muzzle boss. A blue whale is mostly mouth. */
    {
      name: 'mouth',
      part: 'plate-13',
      paint: 'mouth',
      stretch: [3.2, 1, 1] as [number, number, number],
      at: [0, 0.60, BOSS_Z + CARD_AIR] as [number, number, number],
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE MISSING '
    + 'THING IS THE SIZE, and it is your own ruling rather than a gap in the bank. A blue '
    + 'whale is about 4.5x longer than it is deep; HullDef.stretch is `never` on your ruling '
    + 'of 2 August ("the body/cube should always be the standard size"), and all ten shells '
    + 'the pack drew are within 25% of a cube. box-41 here is 1.350 x 1.300 x 1.350 — the '
    + 'biggest there is — so the longest animal that has ever lived is a box. animal-whale.ts '
    + 'says the same in Ocean and animal-stick-insect.ts in Critters, where it is recorded as '
    + 'a RULING and not a commission. TWO MORE, both measured: the THROAT PLEATS (sixty to '
    + 'ninety parallel grooves; RidgeDef.rows is top|chamfer|side with no belly row, and it is '
    + 'a pattern besides) and the MOTTLING (colour is a lookup with no positional information '
    + '— the sixth file in the project to say so). WHAT IS NEW AND IS WORTH KEEPING WHATEVER '
    + 'YOU DO WITH THE REST: the flippers are box-43, the FISH\'s own pectoral fin, and NO '
    + 'SPECIES BUILT SO FAR WEARS IT — docs/how-the-animals-are-made.md §14 declared the pack '
    + 'finless for a week, collections/ocean.ts corrected that for blade-06, and this is the '
    + 'other half of the correction being spent. The FLUKE is two wedge-19 lobes rather than '
    + 'animal-whale.ts\'s single spun fan, because a fluke is a pair; and there are TWO '
    + 'BLOWHOLES, which is what a rorqual has and what that file has only one of. THE STRAINS: '
    + 'the flipper is stretched 1.7 x 0.7 x 0.75 and the mouth and blowhole cards are '
    + 'stretched too — §3 sanctions a stretch on an EAR or a SNOUT and none of these is '
    + 'either, exactly as animal-zebra.ts flags for its stripes. WHAT TO TRY FIRST: the '
    + 'pleats, through RidgeDef.place — a `side` row overridden to [0.60, 0.35, 0.10] puts '
    + 'stations low on the flank instead of at the hull\'s equator, which is the nearest thing '
    + 'to a belly row the builder has. NEW PALETTE, UNREVIEWED.',
})
