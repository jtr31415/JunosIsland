/**
 * The moon rabbit — the rabbit people see in the dark patches of the moon, and
 * the fourth rabbit this project has had to hold apart from the other three.
 *
 * `animal-bunny` is FROZEN, `animal-hare` is on `box-31`, `animal-arctic-hare`
 * is on `box-36` in winter white with black tips, and `animal-jackalope` is in
 * this collection on the cube with a rack. A fifth long-eared thing is only
 * worth having if it is separated on something a child sees first, and it is:
 *
 * **IT SITS UP, AND IT IS THE ONLY ANIMAL IN THE PROJECT THAT DOES.** In every
 * telling of this story — Chinese, Japanese, Korean — the rabbit is on its
 * haunches with its forepaws raised, pounding a pestle. So the leg row is
 * refused and replaced by two pairs at two heights: a hind pair on the midline
 * at `LEG_ROW.y`, and a FOREPAW pair up on the chest at y = 0.45. Nothing else
 * built stands like that; every other rabbit here is on the four-leg row.
 *
 * **THE PAWS MUST NOT REACH THE FLOOR.** `buildAssembly` grounds on the LOWEST
 * point, so a forepaw hanging past the feet lifts the whole animal and the hind
 * legs stop touching the ground — which the suite fails as a builder fault
 * rather than as a design choice. Measured: `box-01` is 0.30625 tall and at the
 * leg's own 0.408 burial its centre lands at 0.422, so the paw's underside is at
 * **0.269** with the feet on zero.
 *
 * **THE PESTLE AND THE MORTAR ARE NOT SAYABLE AND ARE NOT A COMMISSION.** They
 * are props rather than anatomy: a held object needs a hand, a grip and a second
 * mass, and rule 3 is one mass with features attached to it. Nothing in the
 * roster wants a prop and this species should not be the reason one exists. The
 * raised paws are the part of the story this kit can tell.
 *
 * The rest is `animal-hare.ts`'s rabbit, deliberately: `box-06` unstretched (the
 * tallest ear in the bank, and no `byBand` because it arrives as ONE band and a
 * paint into it would be a silent no-op), `tube-01`, `box-09`, and `box-18` spun
 * 180 at the rear plate's own centre as a scut. The hull is `box-39`, the
 * penguin's — a full cube nothing else in this collection wears.
 *
 * The palette is the other half of the separation: this is the only SILVER
 * animal in the project. The Arctic hare is a warm winter white with black ear
 * tips; this is a cool grey-blue with none, because the moon has no black on it.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-39`'s flat crown, +/-0.3125 in x and z — the cube's own. */
const CROWN_Y = 1.43125

/**
 * The rear plate's own centre. `box-18`'s recorded y is 0.482, which is 0.0115
 * below it, so a stub at pure donor transfer meets a chamfer that has already
 * fallen away — `animal-badger.ts`'s measurement, and every stub since.
 */
const REAR_PLATE_Y = 0.80625

/**
 * Where a raised forepaw joins. At `box-01`'s own burial its centre lands at
 * 0.422 and its underside at 0.269, which is what keeps the hind feet on the
 * floor — see the header before moving this.
 */
const PAW_Y = 0.45

export const MOON_RABBIT_ASSEMBLY = defineCreature('animal-moon-rabbit', {
  palette: {
    coat: 0xc3c9d6,    // UNREVIEWED: moon silver with a cool blue in it
    belly: 0xeff2f7,   // UNREVIEWED: the pale underside, almost white
    inner: 0xb9a7c4,   // UNREVIEWED: the nose, a dusty lilac
    limb: 0xaab1c0,    // UNREVIEWED: legs and paws, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The penguin's shell — a full cube, and the one nothing else in this
   * collection wears. The separation from the other three rabbits is the POSE
   * first and the palette second; the hull only has to not collide. */
  hull: 'box-39',
  belly: 0.5,

  eyes: { part: 'plate-01' },

  /* The bunny's own ear, unstretched, which is `animal-hare.ts`'s whole argument
   * for what a long-eared animal IS. No inner ear: `box-06` arrives as one band
   * (5, all 60 triangles) so a `byBand` would be a silent no-op. */
  ears: { part: 'box-06', paint: 'coat', at: [0.28, CROWN_Y, 0.15] },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'inner' },

  /* The scut, at `animal-badger.ts`'s solved station. */
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  legs: false,
  extras: [
    /* THE HIND PAIR, on the midline and on the pack's own row — an animal
     * sitting on its haunches has its feet under its middle. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, -0.1],
    },

    /* THE FOREPAWS, raised on the chest. This is the whole separation from every
     * other rabbit in the project, and the y is bounded by the floor rather than
     * chosen: see the header. */
    {
      name: 'paw',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.2, PAW_Y, 0.35],
    },
  ],

  flag: 'THIS IS THE FOURTH RABBIT IN THE PROJECT — bunny (frozen), hare, arctic hare and '
    + 'the jackalope in this same collection — so the whole job was separation, and it is '
    + 'THE POSE. It SITS UP, and it is the only animal in the project that does: the leg '
    + 'row is refused and replaced by two box-01 pairs at two heights, a hind pair on the '
    + 'midline at LEG_ROW.y and a FOREPAW pair on the chest at y 0.45. In every telling of '
    + 'this story — Chinese, Japanese, Korean — the rabbit is on its haunches with its '
    + 'paws raised. WATCH THE PAW HEIGHT IF YOU MOVE IT: buildAssembly grounds on the '
    + 'LOWEST point, so a paw hanging past the feet lifts the whole animal and the hind '
    + 'legs stop touching the floor, which the suite fails as a builder fault. box-01 is '
    + '0.30625 tall and at its own 0.408 burial the paw\'s underside sits at 0.269 with '
    + 'the feet on zero. THE PESTLE AND MORTAR ARE NOT SAYABLE AND ARE NOT COUNTED AS A '
    + 'COMMISSION: a held object needs a hand, a grip and a second mass, and rule 3 is ONE '
    + 'mass with features on it. Nothing else in the roster wants a prop and this species '
    + 'should not be the reason props exist. THE REST IS animal-hare.ts\'s rabbit — box-06 '
    + 'unstretched, tube-01, box-09, box-18 spun 180 as a scut — on box-39, the penguin\'s '
    + 'shell, which nothing else in this collection wears. NEW PALETTE, UNREVIEWED, and it '
    + 'is the second half of the separation: this is the only SILVER animal in the '
    + 'project. The Arctic hare is a warm winter white with black ear tips; this is cool '
    + 'grey-blue with NONE, because the moon has no black on it.',
})
