/**
 * The salamander's assembly, as a definition. The fire salamander.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * ## What this animal has to do, and how it does it
 *
 * `garden.ts`'s own header names **newt/salamander** as a confusable pair, and it
 * is right to. Both are small long-bodied amphibians with a thin tail and no
 * ears, and **the tail will not separate them** — a whip off the back of a 1.250
 * cube is a whip off the back of a 1.250 cube whichever shape donates it, and
 * anyone claiming otherwise is claiming a difference a child cannot see. So the
 * separation is spent where it can be, and `garden.ts` had already chosen where:
 * *"black with bright yellow, which is the loudest palette in the collection and
 * is real"*, against the newt's *"dark with an orange belly"* and its crest.
 *
 * **So the salamander is the animal with the yellow blotches and the newt is the
 * animal with the crest**, and the second half of it is the belly: dark grey
 * under here, orange under the newt. That is extras and palette, it survives at
 * 0.16 scale, and it is honest about which part of the silhouette is working.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube and the legs are the leg row**, neither mentioned
 *     below because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at the pack's own `[0, 0.80625, 0]` and four `box-01`
 *     sunk 0.408163 on the row at y = 0.18125 that never moves.
 *
 *   - **The tail is `wedge-18`, the tiger's, and it is placed by the donor
 *     transfer alone.** Joined at this cube's rear face z = −0.625 and sunk its
 *     own measured 0.137977, its centre lands on **z = −0.826000** — the bank's
 *     recorded offset for the shape, to 4.8e-6, which is as close as a solve
 *     running through `bank.generated.ts`'s four-decimal positions can get. That
 *     agreement is the evidence (§8): the number was solved for and then checked
 *     against one that was not used in solving it. The shape leaves the rump LOW
 *     (its thick
 *     end is at local y = −0.523) and sweeps up and back, which is why it is
 *     worth its 212 triangles: it costs only its 0.555 of depth rather than its
 *     1.047 of length. Laid flat it would be half again as much keep-out, and
 *     `pets.ts:652` charges that from `max(width, depth) / 2`.
 *
 *     `pets:creature` marks this tail **`sunk 0.077 THIN`**, and it is right to
 *     print it and wrong to read it as a fault: 0.125 is §3's floor for an EAR,
 *     and 0.076607 is what the tiger itself buried this tail by — one donor, one
 *     value, `sunkUnitsMin` = `Max`. The join is genuinely inside the hull (the
 *     thick end reaches z = −0.548 against a rear face at −0.625, on the part of
 *     that face that is flat), so nothing floats. Deepening it to clear a
 *     threshold would mean discarding a measurement to satisfy a warning.
 *
 *   - **The extras are `plate-10` and `plate-11`, the cow's, the dog's and the
 *     giraffe's own flank-patch cards**, and they are what makes this a fire
 *     salamander rather than a dark lizard. They are marking sheets with **zero
 *     thickness** (`size[0]` is exactly 0) and they are given none: no stretch,
 *     no sink, painted flat in the one loud slot.
 *
 *     **They sit on the pack's own flat-card shell, 0.635 from the hull's
 *     centre.** That is not a number this file chose: it is the bank's recorded x
 *     for both cards, it is `EYE_CARD_Z` on the other axis, and on this cube —
 *     centre 0.80625, faces 0.625 out — it is the same 0.010 of daylight the eye
 *     card gets. The bare donor transfer would join them AT 0.625, coplanar with
 *     the face and z-fighting it; 0.010 is the pack's own answer to that and is
 *     quoted rather than invented. The four dorsal blotches are on the same shell
 *     at y = 0.80625 + 0.635 = **1.44125**.
 *
 *     Their stations are the cards' own recorded offsets, and the result is that
 *     every card lands EDGE-ON to the hull's own flat face. `box-03` cuts every
 *     edge and every corner, so each flat face is 0.625 square — ±0.3125 about
 *     the centre — and the cards measure:
 *
 *       flank upper   y 0.87475..1.11875   z −0.31250..−0.05962
 *       flank lower   y 0.49375..0.89375   z −0.12051.. 0.31250
 *       back fore/aft x 0.06850.. 0.31250  z ∓0.31246..∓0.05966
 *
 *     Eight of those ten bounds are the face's own edge to four decimals, which
 *     is the finest the bank stores a position. §3's "nothing floats" is not
 *     close here; it is exact, and it is exact because Kenney sized these cards
 *     to a 1.250 cube's flat face in the first place.
 *
 *   - **The dorsal pair is the same card, spun onto the back**, `{ axis: 'z',
 *     deg: 90 }`, which takes an `x +1` part to `y +1` — rule 4 as amended, baked
 *     into the copy's vertices. It is §8 step 3 in miniature: same shape, same
 *     depth, same stations, only the facing differs. It is also the placement
 *     that earns its keep, because **the island's camera looks DOWN at these
 *     animals** and a flank card is edge-on from up there. A fire salamander seen
 *     from above is yellow blotches on black, and now it is.
 *
 *     Their x is 0.1905, which is the flank card's own recorded height above the
 *     hull centre (0.99675 − 0.80625) carried round by the same 90 degrees the
 *     geometry was. Their z is ±0.18606, the card's own recorded z and its
 *     reflection — the front-to-back mirror of one station, not two chosen ones.
 *
 *   - **The eyes are `plate-01`, the pack's own card, with its SCLERA painted
 *     from the coat.** The commission asked for `plate-04` on the grounds that
 *     the survey marks it a solid black eye with no sclera at all, and **the
 *     survey is right** — all 34 of its triangles are band 15, so it is one
 *     region and that region is the pupil's. It still cannot be worn here, and
 *     not for the reason the commission guarded against: it satisfies the pupil
 *     rule perfectly, band 15 going to `PACK_PUPIL` over the whole card. It fails
 *     `assembly-assert.ts`'s §7, which requires an eye card to arrive PRE-SPLIT —
 *     two texture slots for no geometry — and a one-band card reads exactly one.
 *     Measured, not argued: built with `plate-04` this animal's eye UVs are one
 *     row, `0.900000`, and with `plate-01` they are two. Weakening a shared
 *     assertion to fit one species is not on the table, so the standard card is
 *     worn and the black bead is made in the PALETTE instead: 17 sclera triangles
 *     take `coat` (0x2c2c32) and 10 pupil triangles take `PACK_PUPIL`, giving a
 *     black bead with a grey glint. Same picture, nothing bent.
 *
 *   - **The belly is PAINTED at 4/16**, §4's second way — no second shape, no
 *     split triangle. 0.25 is not taste: it puts the line at world y = 0.49375,
 *     which is **the hull's own lower chamfer edge** (0.80625 − 0.3125) and
 *     therefore the exact bottom edge of the lower flank card. The dark grey
 *     underside is the chamfer and everything below it; the black coat and the
 *     yellow blotches are the flat flank above it. One number, landing on a line
 *     the geometry already had.
 *
 *   - **No ears.** An amphibian has none, and `garden.ts` says so for this
 *     species in as many words: `ears: 'none'`.
 *
 *   - **The palette is `garden.ts`'s own signed-off four** plus the measured
 *     pupil. `detail` is the loud yellow and is spent on the blotches; `accent`
 *     is the deeper yellow and paints the limbs, which is `garden.ts`'s own
 *     reading of the animal — *"black with bright yellow limbs"*. Nothing here is
 *     a new colour.
 *
 * **No flag.** Nothing was strained. Height 1.7100 inside the pack's 1.43–2.02,
 * keep-out 0.869 against the fox's 1.15, 582 triangles inside 422–951, 432
 * vertices inside 405–1626 and 304 in the body inside 236–1114. Every part is
 * joined at a face its donor joined its own to, and every sink is the pack's own
 * measured value.
 *
 * One number is worth naming as tight rather than comfortable: **the whole-model
 * vertex FLOOR**. Cards weld to twelve vertices each and this animal is mostly
 * cards, so before the dorsal pairs it measured 384 against a floor of 405 —
 * under it, and `budget()` has no escape clause on that side, correctly. The
 * blotches on the back are the fix and they are also the right animal; that they
 * are both is luck, and it is recorded here so the next reader does not have to
 * rediscover which one came first.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const SALAMANDER_ASSEMBLY = defineCreature('animal-salamander', {
  palette: {
    coat: 0x2c2c32,
    belly: 0x53535d,
    mark: 0xf5c518,
    limb: 0xdba90f,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
    'plate-03': 0xf5c518,
  },

  belly: 0.25,
  eyes: { paint: 'coat' },
  tail: 'wedge-18',
  extras: [
    {
      name: 'blotch-upper',
      part: 'plate-10',
      paint: 'mark',
      kind: 'pair',
      at: [0.635, 0.99675, -0.18606],
    },
    {
      name: 'blotch-lower',
      part: 'plate-11',
      paint: 'mark',
      kind: 'pair',
      at: [0.635, 0.69375, 0.095994],
    },
    {
      name: 'blotch-back-fore',
      part: 'plate-10',
      paint: 'mark',
      kind: 'pair',
      spin: [{ axis: 'z', deg: 90 }],
      at: [0.1905, 1.44125, 0.18606],
    },
    {
      name: 'blotch-back-aft',
      part: 'plate-10',
      paint: 'mark',
      kind: 'pair',
      spin: [{ axis: 'z', deg: 90 }],
      at: [0.1905, 1.44125, -0.18606],
    },
    { part: 'plate-03', name: 'plate-03', paint: 'plate-03' },
  ],
})
