/**
 * The ray — and the species that puts the CRAB'S HULL to work at last.
 *
 * `box-13` is the one shell in the bank that is not a cube: 1.333 x 0.4506 x
 * 1.3474, a flat plate. Both `animal-tortoise` and `animal-terrapin` reached for
 * it and both were refused by the same arithmetic — 0.4506 tall plus a 0.30625
 * leg is 0.7568 against a floor of 1.43, and at the time that floor FAILED.
 *
 * The finished animal measures **0.8670 tall and 1.477 of keep-out** — the
 * flattest and by some way the widest thing this project has built, because a
 * ray is mostly wingspan. Woodland's header holds keep-out at 1.6, so it fits,
 * but it is the first species to spend most of that allowance.
 *
 * **It does not fail any more.** Joe ruled the pack's height band a norm that
 * reports on 3 August, because the band is a measurement of Kenney's twenty-four
 * and he is designing rather than matching. So the flat hull is available for
 * the first time, and the animal it was waiting for is this one: a ray is
 * supposed to be half the height of everything around it, and every other
 * candidate for `box-13` was not.
 *
 * The wings are `blade-06`, the bee's and the penguin's, stretched 1.8x along
 * the span. `box-13`'s volume is 0.8092, so rule 3's margin leaves 0.2697 for
 * the biggest feature and the stretched wing measures 0.2095.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const RAY_ASSEMBLY = defineCreature('animal-ray', {
  palette: {
    coat: 0x8a7c5a,
    belly: 0xf2ece0,
    fin: 0x796a52,
    mouth: 0x33291d,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-13',
  belly: 0.5,
  legs: false,
  eyes: { part: 'plate-01', x: 0.2625, y: 0.68 },

  /* The tiger's whip, laid flat and TRAILING. Spun a quarter turn about x its
   * 1.047 of length swings from vertical into the z axis, and the facing is then
   * overridden to `z -1` so it joins off the back — the tortoise's own idiom of
   * spinning a part and re-declaring where it attaches. Unspun this shape hangs,
   * which on a flat animal reads as a leg. */
  tail: {
    part: 'wedge-18', paint: 'fin',
    spin: [{ axis: 'x', deg: 90 }], axis: 'z', dir: -1, sink: 0.25,
  },

  extras: [
    /* The wings, and the placement here is the whole animal.
     *
     * `blade-06` is ALREADY a flat plate — 0.693 x 0.200 x 0.600, thin on y —
     * so it needs no turning to lie flat, only a different place to attach. It
     * is joined by OVERRIDING its facing to `x +1` with no spin at all, which
     * keeps the plate in the horizontal plane and sends it out sideways.
     *
     * Spinning it instead was the first attempt and it is worth recording why
     * it failed: `{ axis: 'z', deg: -90 }` turns the facing to x correctly, but
     * it turns the GEOMETRY with it, so the 0.693 span stands up on y and the
     * animal measured 1.2654 tall with two fins where its wings should be. The
     * override moves where a part joins; a spin moves the part. */
    {
      name: 'wing',
      part: 'blade-06',
      paint: 'coat',
      kind: 'pair',
      axis: 'x',
      dir: 1,
      stretch: [1.8, 1, 1.4],
      sink: 0.35,
      at: [0.6665, 0.54625, 0],
    },
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [1.5, 1, 1], at: [0, 0.45, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first ray ever built and the first colours ever '
    + 'proposed for it. IT IS 0.8670 TALL AGAINST THE PACK\'S 1.43 FLOOR and that is '
    + 'deliberate, not an oversight: box-13 is the crab\'s flat shell, the only '
    + 'non-cubic hull the pack owns, and it was unusable until you made the height band '
    + 'report instead of fail on 3 August. A ray is a flat animal and this is the first '
    + 'species that wanted the flat hull. If it reads as too small beside the fox '
    + 'rather than as correctly flat, nothing here can raise it — a hull is worn at its '
    + 'own size — and the honest alternative is to build the ray on a cube and accept '
    + 'that it is not flat.',
})
