/**
 * The ptarmigan — a white grouse, built on the galliform idiom, and separated
 * from five siblings by two small red cards and a black tail.
 *
 * **Read `animal-chicken.ts` first.** That file is the exemplar every galliform
 * in this project is cut from and this bird takes three things from it
 * unchanged: the `box-06` folded-flank wing, the `tube-02` bill and the biped
 * pair of `box-01` on the pack's own leg row. `animal-quail.ts` is the nearest
 * sibling — small, round, no comb — and the two are held apart by:
 *
 *   - **THE BROW COMBS.** A rock ptarmigan in winter is entirely white except
 *     for a scarlet wattle over each eye, and that is the only colour on the
 *     animal. Two `plate-13` — the flat face card the crab, dog, lion and tiger
 *     share, 14 triangles — set above the eye cards on the absolute eye plane.
 *     The quail's flourish is a topknot; this bird's is two red slashes.
 *   - **THE BLACK TAIL.** A rock ptarmigan keeps black tail feathers all winter,
 *     which is the one way to tell it from a snow bunting at a distance, and it
 *     is one palette entry on the same `box-18` stub the chicken and the quail
 *     wear.
 *   - **THE FEATHERED FOOT.** No JT-044 two-tone leg here, and the absence is
 *     the point: every other galliform in the project splits its leg to put a
 *     scaly foot under a shank, and a ptarmigan's leg is feathered to the claw.
 *     That is what its name means. One colour, all the way down.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and its side and rear faces. */
const HULL_CENTRE_Y = 0.80625
const HULL_SIDE_X = 0.625
const HULL_REAR_Z = -0.625
/** The absolute eye plane. Every flat sheet on a face sits on it. */
const CARD_Z = 0.635

/**
 * The cage birds' and galliforms' shared wing burial, 8/16.
 * `animal-chicken.ts` §3 derives it and nine birds now share the number.
 */
const WING_SINK = 0.5

export const PTARMIGAN_ASSEMBLY = defineCreature('animal-ptarmigan', {
  palette: {
    coat: 0xfafcfd,    // UNREVIEWED: winter white
    flight: 0xeef2f5,  // UNREVIEWED: the wing, a shade off the body so it reads at all
    comb: 0xc23440,    // UNREVIEWED: the scarlet brow wattle — the only colour on the bird
    bill: 0x1c1a18,    // UNREVIEWED: near-black, small
    mark: 0x201d1a,    // UNREVIEWED: the black tail a rock ptarmigan keeps in winter
    limb: 0xf4f6f8,    // UNREVIEWED: feathered to the claw, one colour — see the header
    pale: 0xffffff,    // UNREVIEWED: the sclera
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  under: 'pale',

  /* The galliform round eye, dark. */
  eyes: { part: 'plate-08', paint: 'bill' },

  /* The established bird bill — `animal-quail.ts` §5 records why `tube-01` is
   * refused for one: fourteen mammals wear it as a furred muzzle and no bird in
   * the pack has ever worn it as a beak. */
  snout: { part: 'tube-02', paint: 'bill' },

  /* THE BLACK TAIL, on the chicken's own stub at the chicken's own station. */
  tail: {
    part: 'box-18',
    paint: 'mark',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_CENTRE_Y, HULL_REAR_Z],
  },

  legs: false,
  extras: [
    /* Two legs, ONE colour. Every other galliform here splits its leg at 4/16
     * to put a scaly foot under a shank; a ptarmigan is feathered to the claw
     * and the absence of that split is the marking. */
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The galliform folded flank wing, at the family's own 8/16. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, HULL_CENTRE_Y, 0],
    },

    /* THE BROW COMBS — the only colour on the animal. */
    { name: 'comb', part: 'plate-13', paint: 'comb', kind: 'pair', stretch: [1.2, 1, 1], at: [0.2625, 1.10, CARD_Z] },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE ONLY COLOUR ON THIS BIRD IS TWO RED CARDS AND THAT IS THE WHOLE SEPARATION FROM '
    + 'animal-quail. A rock ptarmigan in winter is entirely white except for a scarlet wattle '
    + 'over each eye, so the flourish here is two plate-13 (the flat face card, 14 triangles) '
    + 'on the absolute eye plane above the cards, where the quail\'s is a cone-01 topknot. THE '
    + 'BLACK TAIL is real and is one palette entry: a rock ptarmigan keeps black tail feathers '
    + 'all winter and it is how you tell it from everything else white on a hill. THE FEATHERED '
    + 'FOOT IS AN ABSENCE: every other galliform in the project splits its leg at 4/16 under '
    + 'JT-044 to put a scaly foot below a shank, and this one does not, because a ptarmigan is '
    + 'feathered to the claw — which is what its name means. Everything else — the box-06 '
    + 'folded flank wing at the family\'s 8/16, the tube-02 bill, the biped box-01 pair on the '
    + 'pack\'s own row — is animal-chicken.ts\'s idiom taken unchanged. IT IS MARKED `land`, '
    + 'not `air`, on the game birds\' own reading: a ptarmigan flies in bursts and lives on the '
    + 'ground, and `air` means hovering at TREE_HEIGHT. NEW PALETTE, UNREVIEWED.',
})
