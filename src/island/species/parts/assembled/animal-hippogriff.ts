/**
 * The hippogriff — eagle in front, horse behind, and it exists in this
 * collection to be TOLD APART FROM THE GRIFFIN, which is the hardest roster §4
 * problem Legendary has.
 *
 * The two share a bill (`cone-06` plus `box-24`'s hook, Raptors' two-part bend)
 * and they share nothing else. Five measured separations, and every one of them
 * is a place a six-year-old actually looks:
 *
 *   1. **THE HULL.** The griffin is on `box-41`, the tiger's, 1.350 x 1.300 x
 *      1.350 and the biggest in the bank. This is on `box-03`, the 1.250 cube
 *      fourteen of the twenty-four share. They do not read as one animal at two
 *      sizes; they read as two shells, which is `animal-horse.ts` §1's own test.
 *   2. **THE TAIL.** The griffin wears `wedge-15`, THE LION'S, tuft and all.
 *      This wears `box-38` upside down — the parrot's fan with its stalk at the
 *      top and the broad fall hanging off it, which is `animal-pony.ts`'s dock
 *      and is a HORSE'S tail.
 *   3. **THE WINGS.** The griffin wears `wedge-19`, the parrot's, folded on the
 *      flank. This wears `blade-06`, the BEE'S and the penguin's, which attaches
 *      `y +1` and therefore stands off the BACK. One bird folds and one is
 *      spread.
 *   4. **THE EARS.** A griffin has none. This has the pony's `cone-01` pair, the
 *      tallest upright ear in the bank that is not the rabbit's, because the
 *      back half of a hippogriff is a horse and a horse is its ears.
 *   5. **THE FEET.** JT-044's two-tone leg — Joe's *"just use a two tone leg for
 *      hooves"* — puts a dark horn foot under a pale shank on all four. The
 *      griffin's are a bird's yellow feet, one flat colour.
 *
 * **4/16 IS NOT A DIAL.** `animal-pony.ts:289-321` measured `box-01`'s own foot
 * bevel running 0.0625 up from the sole, so the leg reaches full width at
 * 0.204082 of its height and 4/16 is the LOWEST k/16 that clears it onto the
 * straight shank. It is a measurement off the leg and it is the same leg on
 * every species in the pack. Do not retune it.
 *
 * ## `fur` EXISTS BECAUSE `belly: 0.75` WAS REPAINTING THE EARS CREAM
 *
 * A measured fault, and the second time this project has hit it — read
 * `animal-stoat.ts`'s header, which found it first at 10/16. **A `patch` is a
 * property of the SLOT, not of the part that declared it.** `belly` splits the
 * CELL of whatever slot the hull is painted from (here `coat`), and every part
 * painted from that slot then reads the split cell. At 12/16 the ears said
 * `coat` and rendered pale instead of dun; `tests/tools/editor-own-colour.test.ts`
 * caught it by sampling the real atlas at each mesh's own baked UV rather than
 * trusting the definition.
 *
 * 12/16 is high on purpose — the pale here is an eagle's chest and not an
 * underside — so the fix is local and it is the stoat's: the ears take a slot of
 * their own, `fur`, seeded with the coat's own dun. Nothing else on this animal
 * is painted `coat`, so the hull is the only thing reading the split.
 *
 * **The general shape of it, since the next high belly line will hit it too:** a
 * species whose `belly` sits above about 8/16 must check every OTHER part it
 * paints from the coat slot, because that part has inherited a boundary nobody
 * wrote for it.
 *
 * The hook is the only thing here that is neither horse nor bird by provenance:
 * `box-24` is the HOG'S nose pad, and Raptors reached for it because it is the
 * one shape in the bank that is 0.400 wide, flat-faced and blunt — the same
 * width as the bill it continues. §3.1 exactly: a shape's identity is where it
 * is put.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125
/** `cone-01`'s own recorded x — the bee's placement, and the pony's. Recovered. */
const EAR_X = 0.2276
/** Where the flat REAR plate stops, on every one of the pack's ten hulls. */
const REAR_PLATE_TOP_Y = 1.11875
/** `box-38`'s own 0.912191 / 2 — half the parrot fan, which the z-180 keeps. */
const TAIL_HALF_HEIGHT = 0.4560955
/** SOLVED: the highest join whose whole root is on the flat rear plate. */
const TAIL_JOIN_Y = REAR_PLATE_TOP_Y - TAIL_HALF_HEIGHT

/** `cone-06` is 0.287 deep and its own 0.36 buries only 0.103 — under §3's floor. */
const BILL_SINK = 0.45

/** Forced: every wing in the bank is 0.200 thick and §3's floor is 0.125 absolute. */
const WING_SINK = 0.625

export const HIPPOGRIFF_ASSEMBLY = defineCreature('animal-hippogriff', {
  palette: {
    coat: 0x8f8577,    // UNREVIEWED: a cool dun — the horse half
    belly: 0xe2d9c6,   // UNREVIEWED: the pale front, the eagle half
    /* The coat's own dun, under a second name. It exists so the EARS can be
     * that colour at all: `belly` splits the CELL of the slot the hull is
     * painted from, and at 12/16 an ear that said `coat` sampled the pale half
     * and rendered cream. See the header. */
    fur: 0x8f8577,     // UNREVIEWED: the coat's own dun — the ears only
    flight: 0x6f6455,  // UNREVIEWED: the wings, a shade under the coat
    mane: 0x4a4238,    // UNREVIEWED: the tail, near the hoof colour
    limb: 0xa89b89,    // UNREVIEWED: the leg above the hoof
    hoof: 0x33302b,    // UNREVIEWED: dark horn. JT-044's two-tone leg
    hook: 0x211e1a,    // UNREVIEWED: the down-turned bill tip
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: 'box-03',
  /* 12/16, which is HIGH on purpose: on this animal the pale is the eagle's
   * front and chest rather than an underside, so the boundary sits well up the
   * flank. `animal-golden-eagle.ts` inverts the same tool at 14/16. */
  belly: 0.75,

  eyes: { part: 'plate-08' },

  /* Raptors' bill, at the cube's own front face and sunk past the donor's
   * record to clear §3's floor. */
  snout: { part: 'cone-06', paint: 'belly', sink: BILL_SINK },

  /* THE PONY'S EAR — the horse half's signature, and the griffin has none. */
  ears: { part: 'cone-01', stretch: [2, 1, 1], at: [EAR_X, CROWN_Y, 0.25], paint: 'fur' },

  /* THE HORSE'S TAIL: the parrot's fan turned upside down so the stalk is at the
   * top and the fall hangs off it. The griffin's is the lion's. */
  tail: {
    part: 'box-38',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, TAIL_JOIN_Y, -0.625],
    paint: 'mane',
  },

  /* JT-044, verbatim. 4/16 is a measurement off `box-01`'s own bevel and not a
   * taste about this animal — see the header. */
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },

  extras: [
    /* The hook on the bill's own BUILT tip, spun 55 degrees down. */
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x', deg: 55 }] },

    /* THE BEE'S AND THE PENGUIN'S WING, standing off the back at the forced
     * 0.625 burial — spread, where the griffin's parrot wing is folded. */
    { name: 'wing', part: 'blade-06', paint: 'flight', kind: 'pair', sink: WING_SINK },
  ],

  flag: 'THIS ANIMAL EXISTS TO BE TOLD APART FROM THE GRIFFIN and that is the only thing '
    + 'worth judging on it. They share the bill — cone-06 plus box-24\'s hook, Raptors\' '
    + 'two-part bend — and nothing else. FIVE SEPARATIONS, all measured: the HULL '
    + '(box-03\'s 1.250 cube against the griffin\'s box-41, the biggest shell in the bank, '
    + 'so they read as two shells rather than one animal at two sizes); the TAIL (box-38 '
    + 'upside down, the parrot\'s fan as a horse\'s dock-and-fall, against the griffin\'s '
    + 'wedge-15, which is the LION\'S own tail); the WINGS (blade-06, the BEE\'S and the '
    + 'penguin\'s, which attaches y +1 and stands off the BACK, against the griffin\'s '
    + 'wedge-19 folded on the flank — one spread, one folded); the EARS (the pony\'s '
    + 'cone-01 pair, because the back half of a hippogriff is a horse and a horse is its '
    + 'ears — a griffin has none); and the FEET (JT-044\'s two-tone leg giving four dark '
    + 'hooves under pale shanks, against a bird\'s flat yellow foot). The 4/16 hoof line is '
    + 'animal-pony.ts\'s measurement off box-01\'s own bevel and is not a dial. The belly '
    + 'line is HIGH at 12/16 on purpose: the pale here is an eagle\'s chest and not an '
    + 'underside — and it cost a bug worth knowing about, which animal-stoat.ts hit first: '
    + 'A PATCH IS A PROPERTY OF THE SLOT, not of the part that declared it, so `belly` '
    + 'splits the coat CELL and every part painted from `coat` reads the split. At 12/16 '
    + 'the ears rendered cream. They have a slot of their own now, `fur`, seeded with the '
    + 'coat\'s own dun. NEW PALETTE, UNREVIEWED — a cool dun over a pale front, chosen '
    + 'away from the griffin\'s lion tawny so the two are not one colour at two sizes '
    + 'either.',
})
