/**
 * The Galápagos penguin — the pack's OWN penguin flipper, on the one penguin the
 * pack did not draw.
 *
 * `animal-puffin.ts` spends a whole header keeping off the FROZEN
 * `animal-penguin`: *"a small upright black-and-white seabird is a penguin unless
 * something says otherwise"*, and it refuses `box-39`, `tube-02` and the pack's
 * flipper on those grounds. **This bird is a penguin, so it takes the flipper.**
 * `blade-06`'s first provenance entry is `bee:wing-left` and its second is
 * `penguin:wing-left` — the geometry a penguin already wears — and refusing it
 * to look different from a penguin would be the mistake `animal-dingo.ts` names.
 *
 * What it does NOT take is the frozen bird's shell or its beak, and both
 * refusals are measurements:
 *
 *   - **`box-36` rather than `box-39`.** The panda's cube is the same 1.250 shell
 *     cut FRONT-TO-BACK — `animal-raccoon.ts`'s finding — so one `byBand` entry
 *     paints the whole front plane white. That is a penguin's own bib, said in
 *     Kenney's own cut, and it keeps this bird off the frozen bird's shell. The
 *     known price is that the rear face goes white with the front.
 *   - **`tube-06` rather than `tube-02`.** The frozen penguin's beak is a blunt
 *     bar standing 0.100 proud. **A Galápagos penguin has the longest bill of any
 *     penguin relative to its head**, and `tube-06` stands 0.2314 proud — the
 *     furthest any real nose in the bank reaches, 2.3x the pack penguin's. Its
 *     band 3 is Kenney's own lower-mandible cut, painted pale, which is the
 *     pinkish underside of the real bird's bill for one entry.
 *
 * The flipper hangs rather than sticks out: `{ z, -90 }` turns `blade-06`'s
 * `y +1` onto `x +1`, which sends its 0.693 of length DOWN the flank, and it
 * stands only 0.118 clear at its own 0.412 burial.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre and the flat side — every 1.250 shell's. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625
const FLANK_X = 0.625

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

export const GALAPAGOS_PENGUIN_ASSEMBLY = defineCreature('animal-galapagos-penguin', {
  palette: {
    coat: 0x2f3338,    // UNREVIEWED: the sooty black-brown of a small tropical penguin
    belly: 0xf5f3ec,   // UNREVIEWED: the white front — Kenney's band 3 — and the sclera
    bill: 0x25211d,    // UNREVIEWED: the dark upper mandible
    pale: 0xe0a58c,    // UNREVIEWED: the pinkish lower mandible and bare face skin
    limb: 0x1f1c19,    // UNREVIEWED: the legs
    foot: 0x3a3430,    // UNREVIEWED: JT-044's second tone on the foot
    eye: 0x171310,     // UNREVIEWED: a dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cut of the shared cube, for its band 3 — Kenney's own
   * front-and-rear cut, which animal-raccoon.ts found and animal-puffin.ts
   * spends as a white breast. Deliberately NOT box-39, the frozen penguin's. */
  hull: { part: 'box-36', paint: { base: 'coat', byBand: { 3: 'belly' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE BILL. The longest reach of any real nose in the bank — 0.2314 proud at a
   * recorded burial of zero, 2.3x the frozen penguin's blunt tube-02 — because a
   * Galápagos penguin's bill is the longest of any penguin's for its head.
   * Kenney's band 3 is the lower 20 triangles, painted the bare pink. */
  snout: { part: 'tube-06', paint: { base: 'bill', byBand: { 3: 'pale' } } },

  /* The bank's one stub, off the rear plate's own centre. A penguin's tail is a
   * short stiff wedge it props itself on and nothing more. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at animal-chicken.ts's biped station, with
     * JT-044's two-tone foot at 4/16. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair' as const,
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0] as [number, number, number],
    },

    /* THE FLIPPER, and it is the pack's own penguin wing. `{ z, -90 }` turns its
     * `y +1` onto `x +1`, which puts its 0.693 of length DOWN the flank rather
     * than out from it; at its own 0.412 burial it stands 0.118 clear, so the
     * keep-out is 0.743 against Woodland's ceiling of 1.6. */
    {
      name: 'wing',
      part: 'blade-06',
      paint: 'coat',
      kind: 'pair' as const,
      spin: [{ axis: 'z' as const, deg: -90 }],
      at: [FLANK_X, 0.85, 0.05] as [number, number, number],
    },
  ],

  flag: 'THE WHITE HORSESHOE IS NOT THERE and it is the field mark of this species — a thin '
    + 'white line from behind the eye down around the cheek and back to the throat. Colour is '
    + 'a texture LOOKUP with no positional information: Paint.patch takes one HEIGHT and '
    + 'byBand can only recolour where Kenney already cut, so a curve drawn round a face is '
    + 'unsayable. box-36\'s band 3 is a FRONT-AND-REAR cut and it is already spent on the '
    + 'white breast, which is the more important half of the bird. WHAT THIS ANIMAL DOES THAT '
    + 'animal-puffin DELIBERATELY DOES NOT: it takes the pack\'s own penguin flipper, '
    + 'blade-06, whose provenance is literally penguin:wing-left. That file refuses it to keep '
    + 'off the FROZEN animal-penguin; this bird IS a penguin, and refusing the part would be '
    + 'the mistake animal-dingo.ts warns about. The separations from the frozen bird are '
    + 'measured instead: box-36 rather than its box-39, and tube-06 at 0.2314 proud rather '
    + 'than its blunt tube-02 at 0.100 — a Galápagos penguin genuinely has the longest bill of '
    + 'any penguin for its head, so the longest real nose in the bank is the honest choice. '
    + 'THE KNOWN PRICE of box-36 is that the REAR face goes white with the front, because '
    + 'Kenney\'s cut is symmetric — it was a panda\'s white head and white rump. THE FLIPPERS '
    + 'FLAP by default, because the bank knows blade-06 is a wing; a swimming penguin\'s do '
    + 'move, but if it reads wrong here it is one `motion` line to change. NEW PALETTE, '
    + 'UNREVIEWED.',
})
