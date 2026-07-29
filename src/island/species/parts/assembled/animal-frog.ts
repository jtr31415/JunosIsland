/**
 * The frog's assembly, as a definition. Garden's frog, and the first species on
 * the LION's hull rather than the beaver's cube.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and how it does it
 *
 * `garden.ts`'s own header names **frog and toad** as the pair that "will read as
 * duplicates unless size, palette and marking are deliberately separated", and it
 * adds the hard part: neither has ears and neither has a tail, because a frog
 * with either would be a lie. **So every one of the four usual separators is
 * unavailable and all of the separation has to come from elsewhere.** It comes
 * from four places here, in the order a child reads them:
 *
 *   1. **The mouth.** `blade-05` is the lion's muzzle plate: a 1.000-square flat
 *      face MASK whose band 5 is a free mouth line across its whole width. One
 *      part, no arithmetic, and the frog's wide grin arrives with it.
 *   2. **The eyes, high and wide**, with a rounded bulge on the head above each —
 *      a frog's eyes sit on TOP of its head, at the corners, and the toad's do
 *      not.
 *   3. **The hull.** `box-31` is 1.125 deep against the toad's 1.250 cube: a
 *      shallower, wider-looking animal from every angle but head-on.
 *   4. **The palette** — `garden.ts`'s own signed-off green against the toad's
 *      signed-off drab brown.
 *
 * ## Why `blade-05` only works on THIS hull, which is the measurement of the file
 *
 * The face is three layers deep and they are 0.010 apart, so the order they stack
 * in is decided by the hull and by nothing else:
 *
 * | | z | |
 * |---|---|---|
 * | `box-31`'s front face | **0.500** | the lion's, and the one hull under 0.625 |
 * | `blade-05`'s raised centre | **0.625** | joined at 0.500, its own 0.125 thick |
 * | the eye card | **0.6350** | absolute, on every hull, rule 5 |
 *
 * The card clears the mask by **0.010** — which is exactly the daylight the pack
 * gives an eye card over an ordinary 0.625 front face. **On any of the seven
 * usual hulls the same stack puts the mask's face at 0.750 and the eye card
 * 0.115 BEHIND it, swallowed.** `blade-05` is not a face plate that happens to
 * suit the lion; it is a face plate that only fits a hull 0.125 shallower than
 * the pack's usual, and there is exactly one of those.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-31` and that is not a stretch** (`hulls.ts`, and it is
 *     the one every builder gets wrong). The pack drew ten hulls; using the
 *     shallow one is adaptation of the purest kind rule 1 asks for. Its bottom is
 *     `HULL_BOTTOM_Y` like nine of the ten, so the leg row is unchanged, and the
 *     animal is 1.4312 tall before anything is added — the pack's own FLOOR,
 *     checked first.
 *
 *   - **The mask is a pure donor transfer, and it recovers the lion's own
 *     offset.** Joined at this hull's front face z = 0.500, sunk its own measured
 *     0.000, its centre lands on 0.5625 — the bank's recorded offset for
 *     `blade-05`, to the digit. The lion wears this plate on this same hull, so
 *     the transfer is exact rather than an inference. Band 5 is its bottom strip
 *     and Kenney already painted it separately: the mouth is one `byBand` entry
 *     and no geometry at all (§4's first way).
 *
 *   - **The eyes are as high and as wide as the mask allows, and both numbers are
 *     SOLVED rather than chosen.** The card is 0.400 x 0.320208 and rule 5 fixes
 *     its size and its z; what is left is where on the face it goes. The mask is
 *     1.000 square about the hull centre, so the widest the card can sit and stay
 *     on it is `0.500 - 0.200` = **x 0.300**, and the highest is
 *     `1.30625 - 0.160104` = **y 1.146146**. The two cards therefore land exactly
 *     in the mask's upper corners, which is a frog's face and is nothing like the
 *     0.2625/0.9336 the pack puts an eye at by default.
 *
 *   - **The eye bulges are `box-34`, the pack's rounded stub, placed as EYES and
 *     not as ears** — §3.1, a part's identity is its placement and not Kenney's
 *     label. It is the rounder of the pack's two identical 0.315 stubs (116
 *     triangles against `box-02`'s 92 for the same box), and roundness is the
 *     whole point of it here. Joined at this hull's top face y = 1.43125 and sunk
 *     its own measured 0.777778, its centre lands on **1.34375, the panda's own
 *     recorded offset to the digit** — `box-31`'s top face is `box-03`'s, so that
 *     transfer is exact too. The two coordinates the join does not move are this
 *     species' own and are what make it an eye rather than an ear: **x 0.300, the
 *     eye card's own**, so the bulge sits directly over the eye and not out at
 *     the panda's 0.4475 corner; and **z 0.3125, this hull's flat top face's own
 *     front edge** (0.375 local), as far forward as a part can join and still be
 *     on flat geometry. It shows 0.070 above the head and buries 0.245, nearly
 *     twice §3's 0.125 floor.
 *
 *   - **The eardrums are `plate-10`, the pack's flank-patch card, on the cheek.**
 *     A common frog's tympanum is a flat disc behind the eye, which is what a
 *     flat marking card IS — §3.1 again. All three coordinates are measured:
 *     **x 0.635** is the card's own recorded offset, floating it 0.010 proud of
 *     the 0.625 side face exactly as the eye card floats over the front one (and
 *     a card laid flat ON a face would z-fight); **y 0.99675** is the card's own
 *     recorded offset AND the highest a 0.244-tall card can sit on this hull's
 *     flat side face, which puts it just below the eye; **z +0.18606** is the same
 *     distance from the flat face's edge the donors used, taken at the FRONT edge
 *     instead of the rear one, because a frog's eardrum is behind its eye and not
 *     out on its flank.
 *
 *   - **The belly is PAINTED at 8/16** — §4's second way, no second shape and no
 *     split triangle. 0.5 is the tiger's own belly line made exact: the only
 *     point on the pack's 1/16 grid inside the zone its split triangles wander
 *     across, and also the hull's own equator.
 *
 *   - **The legs stand at x 0.3125, the flat underside's own half-width**, rather
 *     than the 0.27 the builder derives from hull width. `garden.ts` separates
 *     this pair on LEG POWER above all else — frog 1.15 against toad 0.40 — and
 *     the assembly kit cannot lengthen a leg without straining rule 1, so the
 *     frog spends that difference on STANCE: it stands as wide as the hull's flat
 *     bottom face allows, which is the crouch of an animal about to jump. Every
 *     other leg number is `LEG_ROW`'s and never moves.
 *
 *   - **The palette is `garden.ts`'s own signed-off four** for this species, plus
 *     the measured pupil. Nothing here is a new colour. `mark` is the dark
 *     accent, and it is spent on the two things a field guide would draw: the
 *     mouth line and the eardrums.
 *
 * **No flag.** Nothing was strained: 550 triangles against the pack's 422-951,
 * 430 vertices against 405-1626, height 1.5012 inside 1.43-2.02, keep-out 0.63
 * against the fox's 1.15, every part joined at a face its donor joined its own
 * to, and every sink the pack's own measured value.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const FROG_ASSEMBLY = defineCreature('animal-frog', {
  palette: {
    coat: 0x5fae33,    // signed-off coat: frog green
    belly: 0xf0f2cf,   // signed-off belly: the painted underside and the sclera
    limb: 0x3f7c1f,    // signed-off detail: the legs
    mark: 0x2c5b16,    // signed-off accent: the mouth line and the eardrums
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's hull: 1.125 deep, front face 0.500. A different authored hull is
   * NOT a stretch (hulls.ts), and it is the only one `blade-05` stacks on. */
  hull: 'box-31',

  /* The tiger's belly line, made exact. One number, no geometry. */
  belly: 0.5,

  /* As wide as the flat underside goes: a frog squats with its legs out. The
   * pair's own separator in `garden.ts` is leg power, and stance is the only
   * part of it this kit can say. */
  legs: { x: 0.3125 },

  /* On the mask and as far into its upper corners as the card fits: 0.5 - 0.2
   * across, 1.30625 - 0.160104 up. Rule 5 fixes the rest. */
  eyes: { x: 0.3, y: 1.146146 },

  extras: [
    /* THE ANIMAL. The lion's face plate, joined at this hull's 0.500 front face,
     * with Kenney's own band 5 — its bottom strip — repainted as the mouth. */
    { name: 'mouth', part: 'blade-05', paint: { base: 'coat', byBand: { 5: 'mark' } } },

    /* A frog's eyes sit on top of its head. The panda's stub, on the top face
     * directly above each eye card and at the flat face's front edge. Named
     * `bulge` and not `eye-bulge` on purpose: the harness collects a feature's
     * meshes by NAME PREFIX, so anything called `eye-*` is checked as an eye
     * card and this one would fail rule 5 for not being on the eye plane. */
    { name: 'bulge', part: 'box-34', kind: 'pair', at: [0.3, 1.43125, 0.3125] },

    /* The tympanum: a flat disc behind the eye, which is a flank-patch card
     * placed on a cheek. Its own recorded x and y, and the flat side face's own
     * forward limit. */
    {
      name: 'eardrum', part: 'plate-10', kind: 'pair', paint: 'mark',
      at: [0.635, 0.99675, 0.18606],
    },
  ],
})
