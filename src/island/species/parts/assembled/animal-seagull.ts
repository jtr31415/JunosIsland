/**
 * The seagull — the biggest bird in the collection, and its grey mantle is a
 * hull band.
 *
 * This is the one member of Birds that is NOT the passerine idiom, and both
 * departures are the same fact: a gull is a big heavy bird.
 *
 *   - **`box-41`, the tiger's shell** — the pack's only hull bigger on all three
 *     axes — where the five small birds share `box-39`. And its **band 15** is
 *     168 triangles covering the back and shoulders, which painted grey on a
 *     white bird is a gull's mantle exactly. `animal-wolverine.ts` reads the
 *     same band as a dark back and `animal-bear.ts` as a silvered one; this is
 *     the third reading and the only one where the band IS the field mark.
 *   - **`box-06`, the nine-bird solid-flank wing**, at the numbers
 *     `animal-chicken.ts` §3 derived and `animal-turkey.ts` §2 re-derived for
 *     this exact shell: x 0.625, y 0.80625, sink 8/16. The passerines' `wedge-19`
 *     is the chick's wing and is small; a gull's folded wing is most of its
 *     side. It carries no `wing` role, so the flap is declared.
 *
 * `tube-02` for the bill rather than `cone-06`: a gull's is a heavy blunt hook,
 * not a point, and `tube-02` is the pack's own heavy bill.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s flat plates, which are `box-03`'s at `box-03`'s coordinates and
 * NOT this hull's own recorded (0, 0.83125, 0.05). `animal-turkey.ts` §2. */
const FLANK_PLATE_X = 0.625
const FLANK_PLATE_MID_Y = 0.80625
const REAR_PLATE_Z = -0.625

/** The cage birds', the hen's and the turkey's shared wing burial. */
const WING_SINK = 0.5

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

export const SEAGULL_ASSEMBLY = defineCreature('animal-seagull', {
  palette: {
    coat: 0xf4f2ec,
    mantle: 0x9aa4ac,
    bill: 0xe0b038,
    limb: 0xe8bfa8,
    foot: 0xc99880,
    eye: 0xf0e6c8,
    pupil: PACK_PUPIL,
  },

  /* THE MANTLE. Band 15 is the back and shoulders — 168 triangles — painted
   * grey on a white bird, which is the whole of a herring gull\'s pattern. Band
   * 3, the bare-skin mask the turkey paints red, is left white here because a
   * gull\'s face is white to the bill. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 15: 'mantle' } } },

  /* Pale to the rim, which is what a gull\'s eye is and what makes it look
   * unnervingly like it is staring at you. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* The chick\'s and the penguin\'s heavy bill, by pure donor transfer — on this
   * shell the solve lands it on `frame.front` = 0.725 and recovers the bank\'s
   * recorded y = 0.72775, exactly as the hen\'s and the turkey\'s do. */
  snout: { part: 'tube-02', paint: 'bill' },

  /* The bank\'s only stub, at the rear plate\'s own centre. A gull\'s tail is
   * short, square and white. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, FLANK_PLATE_MID_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The nine-bird wing, at the turkey\'s own re-derivation of it for this
     * shell. Painted the mantle grey, because on a gull the folded wing and the
     * back are one field mark. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'mantle',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [FLANK_PLATE_X, FLANK_PLATE_MID_Y, 0],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE GREY MANTLE IS A HULL BAND AND IT COSTS NOTHING. box-41\'s band 15 is 168 triangles '
    + 'covering the back and shoulders, painted grey on a white bird, which is the whole of a '
    + 'herring gull\'s pattern — and it is the THIRD reading of that band in the project: '
    + 'animal-bear.ts pales it for a grizzle, animal-wolverine.ts darkens it over a blond flank, '
    + 'and here it is the field mark itself. The wing takes the same grey, because on a gull the '
    + 'folded wing and the back are one marking. THIS IS THE ONE BIRD HERE THAT IS NOT THE '
    + 'PASSERINE IDIOM, and both departures are the same fact — a gull is big. It takes box-41, '
    + 'the pack\'s only shell bigger on all three axes, where the five small birds share box-39; '
    + 'and it takes box-06, the nine-bird solid-flank wing, at animal-turkey.ts\'s own '
    + 're-derivation of it for this shell (x 0.625, y 0.80625, sink 8/16 — NOT the hull\'s '
    + 'recorded 0.83125, which is the trap that file names). box-06 carries no wing role, so the '
    + 'flap is declared rather than automatic. THE RED SPOT ON THE BILL IS NOT HERE: tube-02 '
    + 'carries exactly one band (7, all 32 triangles), so there is nothing to cut, and it is too '
    + 'small for a card. That spot is the thing a herring gull chick pecks at, so it is a real '
    + 'absence and not a cosmetic one. THE BLACK WINGTIPS are missing for the same reason — one '
    + 'part takes one hue. NEW PALETTE, UNREVIEWED.',
})
