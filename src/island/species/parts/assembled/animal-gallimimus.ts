/**
 * The Gallimimus — the ostrich-mimic, built against the ostrich.
 *
 * `animal-ostrich.ts` is already in the tree and it is `animal-goose.ts`'s neck
 * on the widest shell, leaned less. This animal is named for looking like that
 * one, so the separation had to be made deliberately rather than hoped for, and
 * it is made three times:
 *
 *   - **NO WINGS.** The ostrich wears `box-06`, the bunny's ear, as a folded
 *     flank wing — the idiom nine built birds share. This has none at all, which
 *     is the single clearest thing a child can see.
 *   - **A LONG STIFF TAIL.** The ostrich has a short one; every ornithomimid is
 *     half tail, and here it is `wedge-18`, the tiger's whip — the bank's
 *     thinnest long shape at 0.200 across and 1.047 of reach — laid straight back
 *     as a counterweight rather than carried.
 *   - **THE CUBE, NOT `box-12`.** The ostrich takes the widest shell; this takes
 *     the 1.250 cube, which is 120 triangles cheaper and reads as the lighter,
 *     narrower animal it was.
 *
 * The NECK is the ostrich's own four numbers, unaltered: `box-18` stood on end
 * with `axis: 'y', dir: 1`, stretched 1.5x, sunk 6/16 and leaned 45 degrees, on
 * the goose's crown station at 3/16 forward. **Nothing about it is re-derived,
 * because on this hull it is the same solve** — `box-12`'s crown and `box-03`'s
 * crown are both 1.43125 and both flat over |z| <= 0.3125.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s crown — the same 1.43125 the ostrich joins its neck to on box-12. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625

/** The goose's crown station and the ostrich's three neck numbers, transferred. */
const NECK_Z = 0.1875
const NECK_STRETCH = 1.5
const NECK_SINK = 0.375
const NECK_LEAN = 45

export const GALLIMIMUS_ASSEMBLY = defineCreature('animal-gallimimus', {
  palette: {
    coat: 0xb09263,    // UNREVIEWED: a pale sandy buff
    belly: 0xece0c2,   // UNREVIEWED: the pale underside, and the sclera
    limb: 0x8f7346,    // UNREVIEWED: the two long legs
    hide: 0x9d8155,    // UNREVIEWED: the coat one step down — neck, head, tail
    beak: 0x5d4a2e,    // UNREVIEWED: the small dark toothless beak
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The 1.250 cube against the ostrich's box-12: 120 triangles cheaper and the
   * lighter, narrower animal. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16, the cube's own equator. It splits the `coat` CELL, so the neck, head
   * and tail all read `hide` — animal-stoat.ts's landmine, and on this animal it
   * would have bleached the neck, which is most of the silhouette. */
  belly: 0.5,

  /* THE NECK, the ostrich's own numbers unaltered. box-03's crown and box-12's
   * are both 1.43125 and both flat over |z| <= 0.3125, so the solve transfers. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'hide',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, CROWN_Y, NECK_Z],
  },

  /* The fox's muzzle on the neck's own built tip — a pure donor transfer. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'hide' },

  /* THE TAIL, and half the separation from the ostrich: the tiger's whip, the
   * thinnest long shape in the bank, laid straight back as a counterweight. */
  tail: {
    part: 'wedge-18',
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

    /* A small toothless beak on the head's own outer face — the chick's and the
     * penguin's, blunt and straight, at its own 0.5 burial. */
    { name: 'beak', part: 'tube-02', paint: 'beak', on: 'head' },
  ],

  flag: 'BUILT AGAINST animal-ostrich, WHICH IS ALREADY IN THE TREE, because this animal is '
    + 'literally named for looking like it. The separation is made three times and none of it '
    + 'is colour. NO WINGS: the ostrich wears box-06, the bunny\'s ear, as the folded flank '
    + 'wing nine built birds share, and this has none, which is the clearest thing a child can '
    + 'see. A LONG STIFF TAIL: wedge-18, the tiger\'s whip, the bank\'s thinnest long shape at '
    + '0.200 across and 1.047 of reach, laid straight back — every ornithomimid is half tail '
    + 'and an ostrich is not. AND THE CUBE, NOT box-12: 120 triangles cheaper and the lighter '
    + 'narrower animal. THE NECK IS THE OSTRICH\'S OWN FOUR NUMBERS UNALTERED — box-18 stood on '
    + 'end, stretched 1.5x, sunk 6/16, leaned 45 — and nothing is re-derived because box-03\'s '
    + 'crown and box-12\'s are both 1.43125 and both flat over |z| <= 0.3125, so the solve '
    + 'transfers exactly. THE EYE IS ON THE BODY and not on the head, which is the goose\'s and '
    + 'the terrapin\'s compromise and rule 5\'s doing. IT WANTS THE LONG HIND LEG more than any '
    + 'other member here — an ornithomimid IS its legs. NEW PALETTE, UNREVIEWED.',
})
