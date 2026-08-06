/**
 * The megalodon — `animal-shark` on the biggest shell the pack drew, with the
 * teeth showing.
 *
 * A megalodon IS a shark, so the shark's own build is taken rather than argued
 * with: `wedge-19` spun 90 to stand as a dorsal (Ocean's finding, and the first
 * time nine birds' folded wing was made to stand), `box-43` — the pack's own
 * FISH fin — as the pectorals, and `wedge-15` unspun at its donor burial as a
 * vertical caudal. Three things separate it, and all three are measured:
 *
 *   - **`box-41` against the shark's `box-20`.** The only shell bigger than the
 *     cube on all three axes, 2.3693 of volume against 1.9531 — 1.21x, which is
 *     the whole size vocabulary the pack gave us, because the hull is never
 *     scaled. It is not enough and the flag says so.
 *   - **THE TEETH.** Three pairs of `wedge-08`, the caterpillar's own tooth and
 *     the cheapest solid in the bank at 16 triangles, set along the mouth line.
 *     `animal-shark` has none; a megalodon is known to a child ONLY by its
 *     teeth, so this is where the collection's one genuinely new placement went.
 *   - **`plate-09`, WHICH NO SPECIES HAD EVER SPENT.** A radial 0.400 card,
 *     bit-for-bit the twin of the `plate-08` five birds wear, and unused by all
 *     200-odd built species until now. A shark's eye is a round black hole and
 *     this is the only unspent card in the bank that is one.
 *
 * `legs: false`, and the hull's own bottom is what the model grounds on — so
 * this animal measures from `box-41`'s underside rather than from a foot.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s own faces: the flat crown, the flank plate and the front. */
const CROWN_Y = 1.48125
const FLANK_X = 0.675

/** The mouth plane — `EYE_CARD_Z`'s own 0.635, which is inside this hull's face. */
const MOUTH_Z = 0.635

export const MEGALODON_ASSEMBLY = defineCreature('animal-megalodon', {
  palette: {
    coat: 0x5c6773,    // UNREVIEWED: slate grey — a shade darker than animal-shark's
    belly: 0xeceeed,   // UNREVIEWED: the white underside, and the sclera
    fin: 0x49525c,     // UNREVIEWED: the dorsal, the pectorals and the caudal
    mouth: 0x241f22,   // UNREVIEWED: the gape
    tooth: 0xfbf7ee,   // UNREVIEWED: the six teeth, and the only bright thing here
    eye: 0x15161a,     // UNREVIEWED: a black bead, read against grey
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only shell bigger than the cube on all three axes — 1.21x the shark's
   * own `box-20` by volume, and that is the entire size vocabulary available. */
  hull: { part: 'box-41' },
  belly: 0.5,
  legs: false,

  /* THE UNSPENT CARD. Radial, 0.400 square, and no species had ever reached for
   * it — `plate-08`'s bit-identical twin, five birds deep in use. */
  eyes: { part: 'plate-09', paint: 'eye', x: 0.30, y: 1.06 },

  /* The lion's tail, unspun at its own donor burial: a vertical caudal fin.
   * `animal-shark.ts`'s reading of the same shape, kept deliberately. */
  tail: { part: 'wedge-15', paint: 'fin', sink: 0.25 },

  extras: [
    /* THE DORSAL: the chick's and parrot's real wing, turned to face UP off the
     * crown. Placed on the flat band, which `animal-bear.ts` measured as
     * |z| <= 0.0833 on this shell — the pads either side of it are 0.05 higher
     * and a part joined there would sit proud. */
    {
      name: 'dorsal',
      part: 'wedge-19',
      paint: 'fin',
      spin: [{ axis: 'z', deg: 90 }],
      sink: 0.25,
      at: [0, CROWN_Y - 0.05, 0],
    },

    /* THE PECTORALS: the pack's own fish fin at its own donor burial. */
    {
      name: 'pectoral',
      part: 'box-43',
      paint: 'fin',
      kind: 'pair',
      sink: 0.4,
      at: [FLANK_X, 0.5625, 0.1875],
    },

    /* THE GAPE, low and wide — a shark's mouth is under the snout, not on it. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [2.6, 1.2, 1], at: [0, 0.66, MOUTH_Z] },

    /* THE TEETH. Three pairs of the caterpillar's own tooth along the gape, at
     * 16 triangles each — the cheapest solid in the bank, which is what makes
     * six of them affordable at all. */
    { name: 'tooth', part: 'wedge-08', paint: 'tooth', kind: 'pair', stretch: [1, 1.4, 1], at: [0.09, 0.635, 0.70] },
    { name: 'tooth-2', part: 'wedge-08', paint: 'tooth', kind: 'pair', stretch: [1, 1.4, 1], at: [0.24, 0.645, 0.68] },
    { name: 'tooth-3', part: 'wedge-08', paint: 'tooth', kind: 'pair', stretch: [1, 1.4, 1], at: [0.38, 0.665, 0.63] },
  ],

  flag: 'THE SEPARATION FROM animal-shark IS ONE SHELL AND SIX TEETH, and the shell half is '
    + 'weaker than it sounds — box-41 is 2.3693 of volume against box-20\'s 1.9531, which is '
    + '1.21x, and since the hull is NEVER SCALED (your ruling of 2 August, HullDef.stretch is '
    + '`never`) that 1.21x is the whole size vocabulary the pack contains. A megalodon is three '
    + 'times a great white and this one is a fifth bigger. collections/endangered.ts records '
    + 'the identical wall for animal-blue-whale and calls it a RULING rather than a commission, '
    + 'and that is what it is here too. WHAT CARRIES THE ANIMAL INSTEAD IS THE TEETH: three '
    + 'pairs of wedge-08, the caterpillar\'s own tooth at 16 triangles a copy, set along the '
    + 'gape — animal-shark has none, and a megalodon is a thing a child knows by its teeth and '
    + 'nothing else. ALSO WORTH KNOWING: the eye is plate-09, a radial 0.400 card that NO '
    + 'species in this project had ever spent, bit-identical to the plate-08 five birds wear. '
    + 'It was sitting unused in the bank; a shape nobody has reached for is worth searching for '
    + 'rather than assuming away. NEW PALETTE, UNREVIEWED.',
})
