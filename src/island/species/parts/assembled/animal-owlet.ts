/**
 * The owlet — the eyes are the animal, and they are the one card nothing else
 * on this page wears.
 *
 * **Read `animal-robin.ts` first.** The passerine idiom is settled there and
 * this bird takes the hull, the legs, the bill and the wing from it unchanged.
 * Two things are its own and both are what a child draws when you say owl:
 *
 *   - **`plate-14`, the panda's card — the BIGGEST eye in the pack** at 0.435 x
 *     0.443 against `plate-08`'s 0.400 round and the default's 0.400 x 0.320.
 *     Rule 5 forbids scaling an eye and the measurement agrees with it (cards
 *     vary only 1.44x across all 24), so "huge eyes" is a part CHOICE and the
 *     only one available. Painted amber-gold to the rim.
 *   - **Two `cone-01` tufts standing on the flat crown**, which is the shape a
 *     tufted owlet has and nothing else in Birds does. They are the hedgehog's
 *     spine and the squirrel's ear tuft doing a third job — §3.1 — and they
 *     stand UNSPUN, because `cone-01`'s own attachment is `y +1` and an owl's
 *     tufts go straight up.
 *
 * Band 3 goes PALE rather than coloured: an owl is streaked cream underneath and
 * dark above, which is the same band the robin paints red used for the plainest
 * possible thing.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — see `animal-robin.ts`. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/**
 * The flat crown of the shared 1.250 cube, and the tufts' station on it.
 *
 * `cone-01` is 0.328570 across at its base, so a copy at x = 0.20 sits inside
 * the flat top face's own 0.3125 reach with 0.112 to spare on the outer side —
 * the same margin `animal-quail.ts` spends on its topknot, taken here twice.
 */
const CROWN_Y = 1.43125
const TUFT_X = 0.2

export const OWLET_ASSEMBLY = defineCreature('animal-owlet', {
  palette: {
    coat: 0x6f5a41,
    belly: 0xe8dcc2,
    flight: 0x574632,
    tuft: 0x4a3b2a,
    limb: 0xb9a488,
    eye: 0xd8a72c,
    pupil: PACK_PUPIL,
  },

  /* Band 3 goes PALE rather than coloured — see the header. An owl is streaked
   * cream underneath and dark above, so the band the robin paints red is spent
   * here on the plainest thing it can carry. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'belly' } } },

  /* THE BIGGEST EYE IN THE PACK, and the only way to have one: rule 5 forbids
   * scaling a card and the measurement agrees (cards vary 1.44x across all 24),
   * so a huge eye is a part choice. Amber-gold to the rim. */
  eyes: { part: 'plate-14', paint: 'eye' },

  /* The parrot's point, small and dark — most of an owl's bill is hidden in
   * the feathers of its face, so a big one would be wrong as well as absent. */
  snout: { part: 'cone-06', paint: 'limb' },

  /* The bank's only stub, at the rear plate's own centre. An owl's tail is short
   * and square and does nothing a child would name it by. */
  tail: { part: 'box-18', paint: 'flight', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },

    /* THE TUFTS. Unspun, because cone-01's own attachment is y +1 and an owl's
     * tufts go straight up — the one placement on this animal that needed no
     * derivation at all. Two of them, on the flat crown, inside its own 0.3125
     * reach with 0.112 to spare on the outer side. */
    {
      name: 'tuft',
      part: 'cone-01',
      paint: 'tuft',
      kind: 'pair',
      at: [TUFT_X, CROWN_Y, 0],
    },
  ],

  flag: 'THE EYES ARE THE ANIMAL AND THEY ARE A PART CHOICE, because rule 5 makes them nothing '
    + 'else: an eye card may not be scaled and the pack itself only varies them 1.44x across all '
    + '24, so "huge eyes" means picking the biggest card there is. That is plate-14, the '
    + 'panda\'s, at 0.435 x 0.443 against plate-08\'s 0.400 round — painted amber-gold to the '
    + 'rim, which is the second thing an owl is. THE TUFTS are two cone-01 standing UNSPUN on '
    + 'the flat crown: the shape\'s own attachment is y +1, so an owl\'s tufts are the one '
    + 'placement in this collection that needed no derivation. They are also the same shape the '
    + 'hedgehog wears as spines and the squirrel as ear tufts, which is §3.1 paying out a third '
    + 'time. NOT EVERY OWL HAS THEM and that is worth your eye — a tawny owlet has none and a '
    + 'long-eared owlet does; without them this bird is a round brown bird with big eyes and '
    + 'nothing else, which is why they are here. THE FACIAL DISC IS NOT and cannot be: it is a '
    + 'flat pale ring around the front of the head, Paint.patch takes a HEIGHT with no z term, '
    + 'and box-39\'s band 3 is already spent on the pale underside. NEW PALETTE, UNREVIEWED.',
})
