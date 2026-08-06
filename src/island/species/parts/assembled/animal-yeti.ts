/**
 * The yeti — an ape that stands up, in white, and the design problem is that
 * this project already has five apes.
 *
 * `animal-gorilla`, `animal-chimpanzee`, `animal-bonobo`,
 * `animal-sumatran-orangutan` and the FROZEN `animal-monkey` are all built, and
 * a sixth one would be a sixth brown quadruped unless it is separated on
 * purpose. Four measured separations, and the first is the one that matters:
 *
 *   1. **IT STANDS ON TWO LEGS AND HAS ARMS.** Every other ape here is on the
 *      four-leg row. This is `legs: false` plus one mirrored `box-01` pair on the
 *      midline, and the arms are `box-18` — the elephant's trunk, re-axised to
 *      `y -1` so it HANGS, which is `animal-octopus.ts`'s own substitution used
 *      for the thing a trunk most obviously is. Nothing else in the project has
 *      arms.
 *   2. **THE HULL IS THE MONKEY'S OWN**, `box-33`, which nothing has worn since
 *      the pack. The gorilla is on `box-41` and this is not, so the two are
 *      different shells rather than one animal in two colours.
 *   3. **IT IS WHITE.** The only white ape there will ever be.
 *   4. **NO EARS, NO CREST, NO TAIL.** The gorilla's `wedge-04` ears and its
 *      `wedge-06` sagittal crest are deliberately not copied; on this animal
 *      they are buried in fur, which is also what the reference pictures show.
 *
 * **THE ARM MUST NOT REACH THE FLOOR, AND THAT IS A REAL TRAP.**
 * `buildAssembly` grounds a species on its LOWEST point, so a hanging part that
 * passes below the feet lifts the whole animal and the legs stop touching the
 * ground — which `assembly-assert.ts:765` fails as a builder fault. Measured
 * here: the arm is 0.9345 long stretched, joined at y = 1.05 and buried its own
 * 0.2 (0.187), so its centre lands at 0.770 and its knuckle at **0.303**. The
 * feet are on zero and stay there, with 0.303 of daylight.
 *
 * The face is two of JT-041's three sanctioned base shapes and one lifted card:
 * a heavy BROW slab spun 45 onto the front-top chamfer (`animal-horse.ts`'s
 * forelock placement, doing the opposite job), the lion's radial nose `blade-04`
 * as a flat dark muzzle — `animal-gorilla.ts`'s own choice for an ape's face —
 * and a shaggy crown slab that also buys the animal its height, since a bare
 * `box-33` on the leg row measures 1.43125, which is `HEIGHT_FLOOR` to the digit.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-33`'s flat crown, +/-0.3125 in x and z — the cube's own. */
const CROWN_Y = 1.43125
/** The front-top chamfer's chord midpoint, `box-03`'s and every cube's. */
const BROW_Y = 1.275
const BROW_Z = 0.46875

/**
 * Where an arm hangs from: just below the flank plate's top, half outboard of
 * the flank at 0.625 so the shoulder straddles the surface rather than floating
 * beside it. The knuckle lands at 0.303 — see the header for why that number is
 * the one to check before changing anything here.
 */
const SHOULDER_X = 0.56
const SHOULDER_Y = 1.05

export const YETI_ASSEMBLY = defineCreature('animal-yeti', {
  palette: {
    coat: 0xf1f2f0,    // UNREVIEWED: a cold white with no blue in it
    belly: 0xdfe2e4,   // UNREVIEWED: the underside, a shade grey
    face: 0x4a4038,    // UNREVIEWED: the bare skin — brow, muzzle, and nothing else
    limb: 0xe4e6e6,    // UNREVIEWED: arms and legs, between the coat and the belly
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The MONKEY'S own shell, which nothing has worn since the pack, and which is
   * a complete cube — unlike `box-31`, the lion's, whose front face does not
   * exist at all (`animal-griffin.ts` measures the hole). */
  hull: 'box-33',
  /* 7/16, low: a shaggy white animal has almost no counter-shading and this is
   * only enough to stop the silhouette going flat from the island's camera. */
  belly: 0.4375,

  eyes: { part: 'plate-01' },

  legs: false,
  extras: [
    /* TWO legs on the midline. It walks upright; that is the first separation
     * from every other ape in this project, all of which are on the four-row. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.3, LEG_ROW.y, 0],
    },

    /* THE ARMS: the elephant's trunk re-axised to hang, which is
     * `animal-octopus.ts`'s substitution put to the job a trunk most obviously
     * does. All three stretch axes are off 1.0 — the octopus measured that an
     * unstretched axis under a re-axis makes the harness's recovery ambiguous.
     * The knuckle stops at y 0.303: see the header, and do not lengthen this
     * without re-checking it, because an arm through the floor lifts the whole
     * animal off its feet and the failure looks like a builder bug. */
    {
      name: 'arm',
      part: 'box-18',
      paint: 'limb',
      kind: 'pair',
      axis: 'y',
      dir: -1,
      stretch: [0.9, 1.5, 0.9],
      sink: 0.2,
      at: [SHOULDER_X, SHOULDER_Y, 0.05],
    },

    /* THE MUZZLE: the lion's own radial nose, flat on the front face, which is
     * `animal-gorilla.ts`'s answer for an ape's bare face and costs 28
     * triangles. It is 0.100 deep, so it cannot reach §3's 0.125 burial floor
     * at any sink and sits as a card — which is what it is. */
    { name: 'muzzle', part: 'blade-04', paint: 'face', at: [0, 0.75, 0.625] },

    /* THE BROW, one of JT-041's three base shapes on the front-top chamfer at
     * `animal-horse.ts`'s own forelock station — the same placement doing the
     * opposite job. A heavy brow is most of what makes a face read as an ape's
     * rather than a bear's. */
    {
      name: 'brow',
      part: 'bespoke-square-01',
      paint: 'face',
      stretch: [0.42, 0.22, 0.12],
      spin: [{ axis: 'x', deg: 45 }],
      at: [0, BROW_Y, BROW_Z],
    },

    /* THE CROWN. It is fur, and it is also the height: a bare `box-33` on the
     * leg row measures 1.43125, which is `HEIGHT_FLOOR` to the digit and leaves
     * 0.00125 of margin. This puts the animal at 1.5687 and gives it a head. */
    {
      name: 'crown',
      part: 'bespoke-square-01',
      paint: 'coat',
      stretch: [0.45, 0.22, 0.45],
      at: [0, CROWN_Y, 0],
    },
  ],

  flag: 'THIS PROJECT ALREADY HAS FIVE APES — gorilla, chimpanzee, bonobo, Sumatran '
    + 'orangutan and the frozen monkey — so the whole job here was separation, and there '
    + 'are four. IT STANDS ON TWO LEGS AND HAS ARMS: every other ape is on the four-leg '
    + 'row, and this is legs:false plus one box-01 pair on the midline, with box-18 (the '
    + 'elephant\'s TRUNK) re-axised to y -1 as a hanging arm. Nothing else in the project '
    + 'has arms. THE HULL IS THE MONKEY\'S OWN box-33, which nothing has worn since the '
    + 'pack, against the gorilla\'s box-41 — two shells, not one animal in two colours. IT '
    + 'IS WHITE. AND IT HAS NO EARS, NO CREST AND NO TAIL, where the gorilla has wedge-04 '
    + 'ears and a wedge-06 sagittal crest; on this animal they are under the fur. WATCH THE '
    + 'ARM LENGTH IF YOU CHANGE IT: buildAssembly grounds on the LOWEST point, so an arm '
    + 'that passes below the feet lifts the whole animal and the legs stop touching the '
    + 'floor, which the suite fails as a builder fault. The knuckle is at y 0.303 today, '
    + 'measured, with the feet on zero. THE HEIGHT COMES FROM THE CROWN SLAB: a bare '
    + 'box-33 on the leg row is 1.43125, which is HEIGHT_FLOOR to the digit, so the shaggy '
    + 'top is doing two jobs. Two of JT-041\'s three sanctioned base shapes are used (brow '
    + 'and crown) and need no rule 1 flag. NEW PALETTE, UNREVIEWED: cold white over a grey '
    + 'underside with bare dark skin at the brow and muzzle, which is the only contrast on '
    + 'the animal.',
})
