/**
 * The Dilophosaurus — two crests, and `blade-05`'s fourth job in one collection.
 *
 * The lion's muzzle plate is a frill on `animal-triceratops`, four dorsal plates
 * on `animal-stegosaurus` and a whole sail on `animal-spinosaurus`. Here it is a
 * PAIR, and the pair is the animal: two thin semicircular crests standing side by
 * side on the skull roof, which is the only thing anybody knows about this
 * dinosaur.
 *
 * **`kind: 'pair'` DOES THE MIRRORING AND THE TRANSFER'S OWN SHIFT SETS THE GAP.**
 * After `{ axis: 'y', deg: 90 }` the plate faces `x +1` with 0.125 of extent along
 * that facing and a recorded burial of zero, so the join is pushed +0.0625 and the
 * mirrored copy -0.0625. Joining at x = 0.16 therefore lands the two crests at
 * ±0.2225 — 0.445 apart on a 1.250 skull, which is where a dilophosaur's are.
 * **Nothing here chose that gap; it fell out of the shift.**
 *
 * **THE JOIN IS THE CROWN ITSELF, so exactly half of each crest is inside the
 * shell** — §3's "nothing floats" met by geometry rather than by a sink dial,
 * which is `animal-stegosaurus.ts`'s argument on the same shape.
 *
 * NO TEETH and no frill: the two things this animal is famous for in film are
 * both inventions, and brief §19's *"bright, never scary"* settles it either way.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown and centre. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625

/**
 * 0.55 fore-aft and 0.45 tall, applied BEFORE the quarter turn about y that swaps
 * the plate's x and z. So the crest ends up 0.125 thick across the animal, 0.450
 * tall and 0.550 long — the low broad half-disc a dilophosaur wears, rather than
 * the tall narrow one the stegosaur's plates are.
 */
const CREST_STRETCH: readonly [number, number, number] = [0.55, 0.45, 1]

/** ±0.2225 once the transfer's own +0.0625 shift is applied. See the header. */
const CREST_X = 0.16

export const DILOPHOSAURUS_ASSEMBLY = defineCreature('animal-dilophosaurus', {
  palette: {
    coat: 0x6d7f6a,    // UNREVIEWED: a dark sage green
    belly: 0xd2d0ac,   // UNREVIEWED: the pale underside, and the sclera
    crest: 0xd9a63c,   // UNREVIEWED: the yellow crests, which are the animal
    limb: 0x5b6b58,    // UNREVIEWED: the two legs and the long narrow jaw
    hide: 0x627261,    // UNREVIEWED: the coat one step down, for the tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16, the tiger's own mammal line, and the cube's equator. It splits the
   * `coat` CELL and everything else here paints from a slot of its own. */
  belly: 0.5,

  /* The card up to 1.06, which is the only band it fits in: the jaw's crown is at
   * 0.985 and the crests' roots are at 1.206, and a `plate-01` is 0.320 tall, so
   * 1.06 puts it at 0.900-1.220 with 0.085 behind the jaw and 0.014 behind a
   * crest. Rule 5 pins the card's z and its size; height is the only dial. */
  eyes: { y: 1.06 },

  /* THE JAW. The deer's muzzle at its own zero burial — all 0.532 stands clear —
   * narrowed and lengthened, because a dilophosaur's skull is the longest and
   * thinnest of the five theropods in this collection. */
  snout: { part: 'tube-03', paint: 'limb', stretch: [0.75, 0.9, 1.45], at: [0, 0.85, 0.625] },

  /* The cat's rope laid straight back on animal-frilled-lizard.ts's idiom. */
  tail: {
    part: 'wedge-07',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.2,
    at: [0, HULL_MID_Y, -0.625],
  },

  legs: false,
  extras: [
    /* TWO legs at the chicken's and the goose's biped station. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE TWO CRESTS. One shape, mirrored, 36 triangles for the pair. */
    {
      name: 'crest',
      part: 'blade-05',
      paint: 'crest',
      kind: 'pair',
      stretch: CREST_STRETCH,
      spin: [{ axis: 'y', deg: 90 }],
      at: [CREST_X, CROWN_Y, 0.28],
    },
  ],

  flag: 'blade-05\'S FOURTH JOB IN ONE COLLECTION. The lion\'s muzzle plate is a leaned frill '
    + 'on animal-triceratops, four dorsal plates on animal-stegosaurus and a whole sail on '
    + 'animal-spinosaurus; here it is a PAIR, and the pair is the animal. THE GAP BETWEEN THE '
    + 'TWO CRESTS WAS NOT CHOSEN — it fell out of the donor transfer. After the quarter turn '
    + 'about y the plate faces x +1 with 0.125 of extent and zero recorded burial, so the join '
    + 'is shifted +0.0625 and the mirrored copy -0.0625; joining at x = 0.16 lands them at '
    + '+/-0.2225, which is 0.445 apart on a 1.250 skull. THE JOIN IS THE CROWN ITSELF so '
    + 'exactly half of each crest is inside the shell, which is section 3\'s "nothing floats" '
    + 'met by geometry rather than by a dial — animal-stegosaurus.ts\'s argument on the same '
    + 'shape. THE STRETCH PRECEDES THE SPIN: [0.55, 0.45, 1] then y-90 gives 0.125 across, '
    + '0.450 tall, 0.550 long, which is the LOW BROAD half-disc this animal wears against the '
    + 'stegosaur\'s tall narrow one. NO TEETH AND NO FRILL: the two things this animal is '
    + 'famous for in film are both inventions, and brief 19\'s "bright, never scary" settles it '
    + 'either way. IT WANTS THE LONG HIND LEG. NEW PALETTE, UNREVIEWED.',
})
