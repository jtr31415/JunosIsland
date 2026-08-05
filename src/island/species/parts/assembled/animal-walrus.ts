/**
 * The walrus — the tusks and the whisker pad, and nothing else needs saying.
 *
 * `box-41`, the tiger's, is the only shell bigger on all three axes and a walrus
 * is the biggest animal in this collection that still has a face. It brings its
 * own muzzle BOSS at z = 0.725, 0.100 proud of the flat front plate
 * (`animal-horse.ts` §1 is the survey), and a walrus's whisker pad is exactly a
 * blunt boss standing out of the face — so the pad here is `box-24`, the hog's
 * nose disc, stretched across geometry the shell already carries.
 *
 * **THE TUSKS ARE `wedge-11`, THE ELEPHANT'S, TURNED TO HANG.** `{ x, 105 }`
 * takes its own `z +1` facing to (0, -0.966, -0.259) — down and a little back,
 * which is where a walrus's tusks go — and they are stretched 1.9x along their
 * own length, because the elephant's is 0.445 of reach and a walrus's is the
 * longest tooth on any animal here. That stretch is the one strained thing on
 * this animal and it is in the flag.
 *
 * The eyes are `plate-06`, the SMALLEST card in the bank, set high and wide: a
 * walrus has tiny eyes in an enormous face, and high is also what keeps them
 * clear of the boss, which stands in front of the absolute eye plane.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s muzzle boss — its bounding front, 0.100 proud of the flat plate. */
const BOSS_Z = 0.725
/** The boss's own vertical centre: the hull centre 0.83125 less 0.1375. */
const BOSS_MID_Y = 0.69375
/** `box-41`'s FLAT flank plate, which is `box-03`'s at the same world x. */
const FLANK_X = 0.625

export const WALRUS_ASSEMBLY = defineCreature('animal-walrus', {
  palette: {
    coat: 0xa5786c,    // UNREVIEWED: ruddy hide, sunburnt brown-pink
    belly: 0xd6b4a6,   // UNREVIEWED: the paler underside and the sclera
    whisker: 0xc9a294, // UNREVIEWED: the whisker pad, a shade off the hide
    tusk: 0xefe6d2,    // UNREVIEWED: old ivory
    flipper: 0x86605a, // UNREVIEWED: darker than the hide
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-41' },
  belly: 0.4375,
  legs: false,

  /* The smallest card in the bank, set high — a walrus's eye is tiny and it is
   * also what keeps it clear of the boss, which stands 0.090 in front of the
   * absolute eye plane at 0.635. */
  eyes: { part: 'plate-06', x: 0.30, y: 1.05 },

  /* THE WHISKER PAD, on the boss this shell already carries. The hog's nose
   * disc widened and dropped: a walrus's face below the eyes is one pad. */
  snout: { part: 'box-24', paint: 'whisker', stretch: [1.7, 1.2, 1], at: [0, BOSS_MID_Y, BOSS_Z] },

  extras: [
    /* THE NOSTRILS — the pig's flat card, the smallest shape in the bank, on
     * the pad's own front. Two of them and no geometry worth the name. */
    { name: 'nostril', part: 'plate-16', paint: 'tusk', kind: 'pair', at: [0.09, 0.80, 0.845] },

    /* THE TUSKS. `{ x, 105 }` takes wedge-11's `z +1` to (0, -0.966, -0.259):
     * down, and a little back. Stretched 1.9x along their own length, which is
     * the strained thing here — see the flag. */
    {
      name: 'tusk',
      part: 'wedge-11',
      paint: 'tusk',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 105 }],
      stretch: [1, 1, 1.9],
      sink: 0.3,
      at: [0.15, 0.60, 0.68],
    },

    /* The fore flippers, out of the flat flank plate — the seal's placement on
     * a bigger shell. A walrus hauls out on these. */
    {
      name: 'flipper-fore',
      part: 'blade-06',
      paint: 'flipper',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -30 }],
      sink: 0.55,
      at: [FLANK_X, 0.5, 0.1875],
    },

    /* And the hind pair trailing off the rear plate, as on the seal. */
    {
      name: 'flipper-hind',
      part: 'blade-06',
      paint: 'flipper',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -90 }],
      sink: 0.35,
      at: [0.1875, 0.45, -0.625],
    },
  ],

  flag: 'THE TUSKS ARE STRETCHED 1.9x AND THAT IS THE ONE STRAINED THING HERE. wedge-11 is the '
    + 'elephant\'s tusk, which animal-ox, animal-water-buffalo and animal-elk already wear as '
    + 'horns and antlers, and at its own 0.445 of reach it is a peg rather than a walrus\'s '
    + 'tooth. Rule 1 says a stretch is measured-safe for EARS and SNOUTS and to think twice '
    + 'elsewhere, so this is thought twice and named: 1.9x on the shape\'s own long axis only, '
    + 'no cross-section change. The turn is { x, 105 }, which takes its z +1 facing to '
    + '(0, -0.966, -0.259) — down and slightly back. THE WHISKER PAD IS ON GEOMETRY THE SHELL '
    + 'ALREADY HAS: box-41 carries a muzzle boss 0.100 proud at z = 0.725, and box-24 (the '
    + 'hog\'s nose disc) is widened onto it rather than floated in front of the face. THE EYES '
    + 'ARE THE BANK\'S SMALLEST CARD, plate-06, set high — partly because a walrus\'s eye is '
    + 'tiny and partly because that boss stands 0.090 in front of the absolute eye plane and a '
    + 'low card on this shell is buried. NEW PALETTE, UNREVIEWED.',
})
