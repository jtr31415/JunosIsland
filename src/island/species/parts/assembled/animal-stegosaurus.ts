/**
 * The Stegosaurus — and the animal that retires "the pack has no plate".
 *
 * §14's third word is `plate`, and `blade-05` answers that one too. Stood on the
 * frill's edge it is a shield; turned a quarter about y it is a **sagittal plate
 * 0.125 thick, 1.100 tall and 0.300 long**, and four of them down the spine cost
 * **72 triangles between them**. Nothing else in the bank is remotely this cheap
 * per unit of silhouette: the koala's dish is 92 triangles for ONE, and the
 * penguin's wing 92 for one.
 *
 * **THE STRETCH IS APPLIED BEFORE THE SPIN, AND THAT IS THE WHOLE TRICK.**
 * `builtPoints` scales the copy on its own axes and then turns it, so
 * `stretch: [0.30, 1.10, 1]` on a `z +1` part followed by `{ axis: 'y', deg: 90 }`
 * lands a plate whose 0.30 is FORE-AFT, whose 1.10 is UP, and whose 0.125 of
 * thickness is the only thing left across the animal. Written the other way round
 * it is a fan lying flat on the rump.
 *
 * **WHY THE JOIN IS AT x = -0.0625 AND NOT AT ZERO.** After the turn the plate
 * faces `x +1` with 0.125 of extent along that facing and a recorded burial of
 * zero, so the transfer shifts it +0.0625. Joining at -0.0625 lands its centre on
 * the midline, which is where a dorsal plate belongs. The join y is the crown
 * itself, so exactly half of each plate is inside the shell — §3's "nothing
 * floats" satisfied by geometry rather than by a sink dial.
 *
 * The head is `tube-01`, the beaver's muzzle and the SMALLEST solid snout in the
 * bank at 0.312, because the one fact every child knows about this animal after
 * the plates is that its head is far too small for it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown, and the plane every plate is centred on. */
const CROWN_Y = 1.43125

/** The centre-landing join: `blade-05` shifts +0.0625 along its spun `x +1` facing. */
const PLATE_X = -0.0625

/**
 * 0.30 fore-aft and 1.10 tall, applied to the lion's plate BEFORE the quarter
 * turn about y that swaps its x and z. 1.10 centred on the crown stands 0.550
 * proud and buries 0.550, which puts this animal at 1.98 against the pack's 2.02.
 */
const PLATE_STRETCH: readonly [number, number, number] = [0.3, 1.1, 1]

/** Four stations over 0.90 of a 1.250 back, on the pack's own 1/16 grid. */
const PLATE_Z = [0.45, 0.15, -0.15, -0.45] as const

export const STEGOSAURUS_ASSEMBLY = defineCreature('animal-stegosaurus', {
  palette: {
    coat: 0x6f7a55,    // UNREVIEWED: a mossy olive body
    belly: 0xd3cba6,   // UNREVIEWED: the pale underside, and the sclera
    plate: 0xc2703a,   // UNREVIEWED: the warm rust plates, which are the animal
    spike: 0xe6dcc2,   // UNREVIEWED: pale bone, for the two tail spikes
    limb: 0x5e6849,    // UNREVIEWED: the legs and the little head
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The 1.250 cube, which fourteen of the pack's own twenty-four wear. This
   * animal spends its whole budget above the back, so the shell is the cheap one
   * at 60 triangles. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 7/16, below the pack's own mammal zone. It splits the `coat` CELL and
   * nothing else here is painted from `coat` — animal-stoat.ts's landmine. */
  belly: 0.4375,

  /* Wide and long: 7/16 puts each leg's outer face exactly on the cube's own
   * side at 0.625, the crocodile's station, which is the pack's
   * inside-the-footprint axiom at its exact limit. */
  legs: { x: 0.4375, z: 0.375, paint: 'limb' },

  /* THE SMALLEST SOLID SNOUT IN THE BANK, 0.312 of the beaver's muzzle, because
   * the head being far too small is the second thing anyone knows about this
   * animal. */
  snout: { part: 'tube-01', paint: 'limb' },

  /* The tiger's whip — the bank's THINNEST long tail at 0.200 across and 1.047
   * of reach — laid back on animal-frilled-lizard.ts's idiom rather than carried.
   * The spikes hang off its far end. */
  tail: {
    part: 'wedge-18',
    paint: 'coat',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.18,
    at: [0, 0.80625, -0.625],
  },

  extras: [
    /* THE FOUR PLATES. One shape, four copies, 18 triangles each. See the header
     * for why the stretch precedes the spin and why the join is off the midline. */
    ...PLATE_Z.map((z, i) => ({
      name: `plate-${i + 1}`,
      part: 'blade-05',
      paint: 'plate',
      stretch: PLATE_STRETCH,
      spin: [{ axis: 'y' as const, deg: 90 }],
      at: [PLATE_X, CROWN_Y, z] as [number, number, number],
    })),

    /* THE TWO TAIL SPIKES, hung on the whip's own built tip by `on:` rather than
     * by a chosen coordinate, and spun to point BACK — cone-01 is `y +1`, and a
     * -90 turn about x sends (0,1,0) to (0,0,-1). */
    {
      name: 'spike',
      part: 'cone-01',
      paint: 'spike',
      kind: 'pair',
      on: 'tail',
      spin: [{ axis: 'x', deg: -90 }],
      sink: 0.3,
    },
  ],

  flag: 'THIS ANIMAL RETIRES THE SECOND OF SECTION 14\'S THREE WORDS. "No plate" is wrong: '
    + 'blade-05, the lion\'s muzzle, is a 1.000 x 1.000 x 0.125 slab of 18 triangles, and '
    + 'turned a quarter about y it is a sagittal plate 0.125 thick, 1.100 tall and 0.300 long. '
    + 'FOUR OF THEM COST 72 TRIANGLES — the koala\'s dish is 92 for one and the penguin\'s wing '
    + '92 for one, so this is by far the cheapest silhouette in the bank. THE STRETCH IS '
    + 'APPLIED BEFORE THE SPIN and that is the whole trick: builtPoints scales on the part\'s '
    + 'own axes and then turns it, so [0.30, 1.10, 1] then a y-90 lands 0.30 fore-aft, 1.10 up '
    + 'and 0.125 across. Written the other way round it is a fan lying flat on the rump. THE '
    + 'JOIN IS AT x = -0.0625, NOT ZERO, because after the turn the plate faces x +1 with 0.125 '
    + 'of extent and zero recorded burial, so the transfer shifts it +0.0625 onto the midline. '
    + 'Joining at the crown itself buries exactly half of every plate, which is section 3\'s '
    + '"nothing floats" met by geometry rather than by a dial. YOUR CHEAPEST DIALS: the y of '
    + 'PLATE_STRETCH (every 0.1 is 0.05 more plate above the back, and 1.10 already puts this '
    + 'animal at 1.98 against the pack\'s 2.02) and the four PLATE_Z stations, which are on the '
    + 'pack\'s 1/16 grid and could alternate off the midline if you want the two staggered rows '
    + 'the real animal has. NEW PALETTE, UNREVIEWED.',
})
