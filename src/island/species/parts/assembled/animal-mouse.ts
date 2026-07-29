/**
 * The mouse's assembly, as a definition. Garden's third, and the first species
 * built from a definition rather than from a hand-typed `AssemblyBuild`.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and how it does it
 *
 * The mouse is one of Garden's **four small brown ground creatures** — mouse,
 * shrew, dormouse, vole — and the standing risk with them is that palette will
 * never separate four brown rodents at 0.16 scale. So the separation is
 * structural, in the order the brief demands (ears, then tail, then an extra,
 * then proportion), and no two of the four share an ears+tail pair. The mouse's
 * share of that matrix is **the biggest ears in the bank**: `box-25`, the koala's
 * 0.743 dish, against the shrew's none at all. That is the largest silhouette
 * difference the bank has to offer between two animals that both wear a whip.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube, the legs are the leg row, the eyes are the eye
 *     plane.** None of them is mentioned below, because all three are what
 *     `defineCreature` gives a definition that says nothing: `box-03` at the
 *     pack's own `[0, 0.80625, 0]`, four `box-01` sunk 0.408163 on the row at
 *     y = 0.18125 that never moves, and two `plate-01` at the card's own recorded
 *     (0.2625, 0.933646) on the absolute z = 0.6350. Rule 5 is not obeyed here;
 *     it is unsayable here.
 *
 *   - **The ears are `box-25`, and the placement is the koala's own.** This is
 *     the only shape in the bank that mounts on the head's SIDE — its measured
 *     attachment is `x +1`, not `y +1` — so the donor transfer joins it at THIS
 *     hull's side face, x = 0.625, and takes the two coordinates the join does
 *     not move from the bank's recorded offset: y = 1.056956, z = 0.126002. **The
 *     koala wears this ear on this same 1.250 cube**, so the transfer is exact
 *     rather than an inference. Sunk its own measured 0.533662. Band 1 is its
 *     inner disc, which gives a two-tone ear for one `byBand` entry and no
 *     geometry — §4's first way, Kenney's own.
 *
 *   - **The tail is `wedge-07`, the cat's and the monkey's whip, and it is the
 *     one number this species chooses.** Sunk 0.159043, the shapes's own measured
 *     mean over its two donors. Its recorded offset puts it at y = 1.186701, and
 *     the donor transfer would leave it there — **but a mouse does not carry its
 *     tail up like a cat.** At the cat's own height the animal measures 1.71 and
 *     reads as a cat with big ears. Dropped to **y = 0.90**, roughly the hull's
 *     own lower third, it trails, and the animal measures 1.4312 — the bare cube
 *     on standard legs, because nothing the mouse wears is taller than its own
 *     back. That is the only hand-placed number in the file and it is here with
 *     its reason, which is the deal.
 *
 *   - **The snout is `tube-01`, the beaver's**, and the beaver is the pack's one
 *     rodent — a rounded barrel muzzle, taper 1.000, which is a mouse's blunt
 *     face. `snout: 'tube-01'` is the whole of it: the donor transfer joins it at
 *     the cube's front face z = 0.625 and takes y = 0.815078, the beaver's own,
 *     which transfers with certainty because `box-03`'s recorded offset IS the
 *     beaver's hull centre.
 *
 *   - **The nose is `box-09`, on the snout's own front face** — a blunt dark
 *     button from the pack's nose-BUTTON family, deliberately not `wedge-10`,
 *     which is measurably a nose tip and reads as a tongue (the hedgehog's
 *     lesson, and Joe's ruling on it). It is anchored with `on: 'snout'` rather
 *     than by an arithmetic this file would otherwise carry a copy of: the
 *     builder puts it on the snout's placed front plane, z = 0.796603, and a
 *     nose that floats or buries is then a thing that cannot happen quietly.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no
 *     split triangle, no geometry at all. 0.5 is the tiger's own mammal belly
 *     line made exact — the only point on the pack's 1/16 grid inside the
 *     0.4808-0.5481 zone Kenney's split-triangle boundary wanders across — and it
 *     is also the hull's own equator.
 *
 *   - **The palette is `garden.ts`'s own signed-off four** for this species, plus
 *     the measured pupil. Nothing here is a new colour.
 *
 * **No flag.** Nothing was strained: 734 triangles against the pack's 422-951,
 * height 1.4312 inside 1.43-2.02, keep-out 0.86 against the fox's 1.15, every
 * part joined at a face its donor joined its own to, and every sink the pack's
 * own measured value but one.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const MOUSE_ASSEMBLY = defineCreature('animal-mouse', {
  palette: {
    coat: 0xa08a76,    // signed-off coat: mouse brown
    belly: 0xf7ede0,   // signed-off belly: the painted patch and the sclera
    inner: 0xe0a49c,   // signed-off detail: the ears' inner discs and the nose
    limb: 0x54453a,    // signed-off accent: legs, muzzle and tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The tiger's belly line, made exact. One number, no geometry. */
  belly: 0.5,

  /* THE ANIMAL. The koala's dish ear — the bank's only side-mounted one — at the
   * koala's own recorded height and depth on this same cube, with its own inner
   * disc painted for free. */
  ears: { part: 'box-25', paint: { base: 'coat', byBand: { 1: 'inner' } } },

  /* The cat's whip, carried LOW: a mouse's tail trails, and at the cat's own
   * 1.1867 the animal reads as a cat with big ears. The only chosen number here. */
  tail: { part: 'wedge-07', paint: 'limb', at: [0, 0.9, -0.625] },

  /* The beaver's muzzle — the pack's one rodent's — and a blunt dark button on
   * its front face. Not `wedge-10`: that one reads as a tongue. */
  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'inner' },
})
