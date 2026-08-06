/**
 * The thunderbird — the biggest bird this project can build, and its whole
 * design is a separation from `animal-golden-eagle`, which is the finest bird
 * already in it.
 *
 * Raptors built sixteen birds of prey and the golden eagle is their exemplar:
 * `box-21` (the fox's, tallest), `wedge-19` wings at pure donor transfer, the
 * two-part hooked bill, `box-38` as a tail, an inverted belly patch at 14/16 to
 * make the crown gold. A thunderbird that reached for any of that would be a
 * large golden eagle. Four things are different and every one is measured:
 *
 *   1. **THE HULL IS `box-41`, THE TIGER'S — 1.350 x 1.300 x 1.350, the biggest
 *      shell in the bank**, against the eagle's 1.250 x 1.5051 x 1.250. The
 *      eagle is the TALLEST bird; this is the HEAVIEST. Since `HullDef.stretch`
 *      is `never`, a shell is the only way either sentence can be said.
 *   2. **THE WINGS ARE THE BEE'S AND THE PENGUIN'S**, `blade-06`, which is the
 *      biggest wing in the bank at 0.693 of reach and — the part that matters —
 *      attaches `y +1`, so it stands off the BACK rather than folding on a
 *      flank. Sixteen raptors wear a folded `wedge-19`; this one is the only big
 *      bird here whose wings are up.
 *   3. **IT HAS A CREST**, three `cone-01` along the crown. No raptor has one.
 *   4. **IT IS STORM-DARK WITH COPPER**, where the eagle is gold over umber.
 *
 * **NOTHING HERE IS SOLVED OFF `box-41`'s BOUNDING BOX**, which lies on three of
 * its six faces (`animal-goose.ts` §2, measured off 454 points). The crest row is
 * hand-placed on the FLAT crown at 1.43125, not on the `frame.top` of 1.48125 —
 * that extra 0.050 is two transverse pads with a hollow between them, and a row
 * joined to it floats over the saddle, which is `animal-gorilla.ts`'s warning.
 * The bill beds on the muzzle boss at z = 0.725 at `animal-gorilla.ts`'s solved
 * y of 0.694, and the eyes take `animal-goose.ts`'s 0.994319, the station at
 * which a `plate-08` disc is exactly tangent to that boss's corner.
 *
 * The talons are `wedge-11`, the elephant's TUSK, at the foot's own front face —
 * `animal-golden-eagle.ts`'s stand-in, and it is a stand-in because the `claw`
 * role has ten distinct shapes in the pack and has never been baked. That is one
 * line in `tools/pets/parts-bank.ts`, it renumbers the whole bank, and it is
 * Joe's rather than a builder's.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT crown — NOT its bounding 1.48125, which is two poll pads. */
const TOP_PLATE_Y = 1.43125
/** The tiger's muzzle boss, standing 0.100 proud of the 0.625 front plate. */
const BOSS_Z = 0.725
/** The boss runs y 0.494-0.894 and `cone-06` is 0.401 tall: the only height that fits. */
const BILL_Y = 0.694
/** `cone-06` is 0.287 deep and its own 0.36 buries only 0.103 — under §3's floor. */
const BILL_SINK = 0.45

/** `animal-goose.ts`'s solve on this shell: the disc tangent to the boss's corner. */
const EYE_X = 0.2625
const EYE_Y = 0.994319

/** `box-01`'s own half-depth: the front face of the foot, where a talon joins. */
const TALON_Z = 0.1875
/** Half `wedge-11`'s own 0.3069, so the talon's underside is the ground already there. */
const TALON_Y = 0.15345

/** Forced: every wing in the bank is 0.200 thick and §3's floor is 0.125 absolute. */
const WING_SINK = 0.625

export const THUNDERBIRD_ASSEMBLY = defineCreature('animal-thunderbird', {
  palette: {
    coat: 0x2f3846,    // UNREVIEWED: storm slate — the body
    belly: 0x8894a4,   // UNREVIEWED: the pale front, the underside of a bird overhead
    flight: 0x1f2630,  // UNREVIEWED: the wings and the tail, near-black
    crest: 0xb5601f,   // UNREVIEWED: copper — the crest, and the only warm thing
    limb: 0xd8a52c,    // UNREVIEWED: the yellow foot, and the talon
    hook: 0x17161a,    // UNREVIEWED: the down-turned bill tip
    bill: 0xc9c0a8,    // UNREVIEWED: horn-coloured base
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE BIGGEST SHELL IN THE BANK, and the separation from every raptor built.
   * Nothing on this animal is solved off its bounding box — see the header. */
  hull: 'box-41',
  /* 10/16, high: what a child sees of a bird this big is its underside, so the
   * pale runs well up the flank rather than sitting under it. */
  belly: 0.625,

  eyes: { part: 'plate-08', paint: 'bill', x: EYE_X, y: EYE_Y },

  /* The bill, bedded on the tiger's own muzzle boss at the gorilla's solved y. */
  snout: { part: 'cone-06', paint: 'bill', at: [0, BILL_Y, BOSS_Z], sink: BILL_SINK },

  /* The parrot's fan at its own donor transfer onto the rear plate this shell
   * shares with `box-03` to the last decimal. */
  tail: { part: 'box-38', paint: 'flight' },

  /* THE CREST, hand-placed on the FLAT crown. Three copies at +/-0.25 and 0,
   * all inside the plate's own +/-0.3125, so none of them rides the pads. */
  ridge: {
    part: 'cone-01',
    paint: 'crest',
    name: 'crest',
    count: 3,
    rows: ['top'],
    span: 0.25,
    place: { top: [0, TOP_PLATE_Y, 0] },
  },

  legs: false,
  extras: [
    /* Two legs on the midline — the only station a biped's can take. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The hook on the bill's own BUILT tip, spun 55 degrees down: Raptors' bend. */
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x', deg: 55 }] },

    /* THE TALON, a stand-in — the `claw` role has never been baked. At the
     * foot's own front face and half its own height, so its underside lands on
     * the ground the leg row already defines and the bird does not refloor. */
    {
      name: 'talon',
      part: 'wedge-11',
      paint: 'limb',
      kind: 'pair',
      axis: 'z',
      dir: 1,
      at: [0.25, TALON_Y, TALON_Z],
    },

    /* THE WINGS, UP: the bee's and the penguin's, the biggest in the bank, at
     * the forced 0.625 burial. Sixteen raptors wear a folded wedge-19; this is
     * the only big bird in the project whose wings stand off the back. */
    {
      name: 'wing',
      part: 'blade-06',
      paint: 'flight',
      kind: 'pair',
      sink: WING_SINK,
      /* The FLAT crown, and the shape's own recorded x and z. At pure donor
       * transfer the solve joins `frame.top` = 1.48125, which on this shell is
       * two poll pads with a hollow between them — and the wing's own z of
       * -0.022 lands in that hollow, so 0.050 of its 0.125 burial would be
       * spent crossing air. `animal-gorilla.ts` gives the same warning. */
      at: [0.297, TOP_PLATE_Y, -0.022],
    },
  ],

  flag: 'THIS BIRD EXISTS TO NOT BE animal-golden-eagle, which is the finest bird already '
    + 'in the project, and there are four separations. THE HULL is box-41, the TIGER\'S, '
    + '1.350 x 1.300 x 1.350 and the biggest shell in the bank, against the eagle\'s '
    + 'box-21: the eagle is the TALLEST bird and this is the HEAVIEST, and since '
    + 'HullDef.stretch is never, a shell is the only way either sentence can be said. THE '
    + 'WINGS ARE UP: blade-06, the bee\'s and the penguin\'s, the biggest wing in the bank '
    + 'at 0.693, and it attaches y +1 so it stands off the BACK — sixteen raptors wear a '
    + 'folded wedge-19 on the flank and this is the only big bird here that does not. IT '
    + 'HAS A CREST, three cone-01 along the crown; no raptor has one. AND IT IS STORM-DARK '
    + 'WITH COPPER where the eagle is gold over umber. NOTHING IS SOLVED OFF box-41\'S '
    + 'BOUNDING BOX, which lies on three of its six faces: the crest row is hand-placed on '
    + 'the FLAT crown at 1.43125 rather than on frame.top\'s 1.48125, because that extra '
    + '0.050 is two transverse pads with a hollow between them and a row joined to it '
    + 'floats over the saddle. The bill beds on the muzzle boss at z 0.725 and the eyes '
    + 'take the goose\'s solved 0.994319. THE TALON IS A STAND-IN, animal-golden-eagle.ts\'s '
    + 'own: the pack drew TEN distinct claws and the `claw` role has never been baked. '
    + 'That is one line in tools/pets/parts-bank.ts, it renumbers the whole bank silently, '
    + 'and it is yours rather than a builder\'s — this species is the fourth to ask. NEW '
    + 'PALETTE, UNREVIEWED.',
})
