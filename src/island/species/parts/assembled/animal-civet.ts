/**
 * The civet's assembly, as a definition — and Night Time's first FLAGGED species.
 *
 * ONE SPECIES, ONE FILE. `index.ts` says why one appended line is the whole of
 * the wiring, and it says why the line never precedes the file.
 *
 * ## What this animal is, and the half of it that cannot be said
 *
 * A civet is a cat-shaped viverrid and four things make it one: a long low body,
 * a pointed muzzle, **a masked face** and **a blotched coat with a ringed tail**.
 * Two of those four are markings, and `animal-badger.ts` is the worked precedent
 * for a species whose marking IS the animal. Its finding holds here word for word
 * and it is worth being exact about which mechanism falls short of what:
 *
 *   - **The mask is unsayable.** `Paint.patch` is §4's way 2 and it takes one
 *     number, `at`, which is a HEIGHT: it paints one level boundary across a
 *     whole part and has no z term at all, so "the front of this hull is dark"
 *     is a statement the mechanism cannot make. `byBand` is §4's way 1 and can
 *     only cut where Kenney already cut, and `box-03` has exactly one band. And
 *     there is no head to paint separately, because rule 3 is one mass.
 *   - **The rings are unsayable.** A ringed tail is a repeating boundary along a
 *     part's length and nothing in the kit expresses one. What IS available is
 *     Kenney's own single cut, and this file spends it — see the tail.
 *   - **THE BLOTCHES ARE REACHABLE, and they are not approximated.** The bank's
 *     flat marking cards `plate-10` and `plate-11` are real geometry with zero
 *     thickness, and `animal-salamander.ts` already ships four placements of them
 *     as body markings. This species spends six placements — ten cards, since
 *     four of them are mirrored pairs — and every station below is the card's own
 *     recorded offset or a reflection of it.
 *
 * So the coat is built, the mask is flagged, and nothing is authored to fake
 * either. §2's escape clause is the route and the `flag` says exactly what is
 * missing, where Joe reads it.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is the cube and the eyes are the eye plane**, neither mentioned
 *     below because both are what `defineCreature` gives a definition that says
 *     nothing: `box-03` at its own recorded `[0, 0.80625, 0]`, two `plate-01` at
 *     the card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350. The
 *     eye is deliberately NOT this animal's problem — the pack's default card is
 *     worn and the separation is spent entirely on the markings, which is where
 *     a civet's is.
 *
 *     **`box-31` was considered and REFUSED as the hull.** It is the lion's, it
 *     is the cheapest shell in the bank at 50 triangles, and a long low viverrid
 *     is exactly what it sounds like it should carry. It is refused on the
 *     measurement: `box-31` is 1.125 deep against the cube's 1.250, so it makes
 *     the body 0.125 SHORTER front to back, which is the wrong direction for a
 *     long-bodied animal. Its front face also sits at 0.500 rather than 0.625
 *     (`HULL_FRONT_Z`), which would pull the muzzle 0.125 back into a face whose
 *     eye cards do NOT move with it — the lion floats its cards 0.135 proud, and
 *     a civet's muzzle should reach past its eyes, not behind them.
 *
 *   - **The long low body is expressed by the LEGS, never by the shell.** The
 *     hull is never scaled (Joe's ruling, twice) and `pets.ts` charges the
 *     obstacle keep-out from `max(width, depth) / 2`, so stretching a body for
 *     length would be paid for in trees the animal cannot walk between. The
 *     wheelbase goes to **z = 0.3125 = 5/16** instead of the builder's default
 *     0.25: `box-01` is 0.375 deep, so at that station its outer face lands on
 *     0.500 — a full chamfer's width, 0.125, inside the hull's own 0.625, which
 *     is as long a stance as the pack's inside-the-footprint axiom allows without
 *     touching the edge. It costs no keep-out at all, because the legs stay
 *     inside the body's own box.
 *
 *   - **The ears are `wedge-06`, the cat's own pointed ear, and a civet's ear is
 *     a cat's ear.** §3.1 says a part's identity is its placement rather than
 *     Kenney's label, and this is the rarer case where the label is simply right.
 *     The cat is its only donor, so its recorded offset (0.336, 1.404599,
 *     0.320549) is unambiguous: joined at this cube's top face y = 1.43125 and
 *     sunk the cat's own 0.573575, the centre lands on **1.404572 against the
 *     recorded 1.404599** — one part in a million, which is the evidence the cat
 *     wears this ear on this cube at this height (§8).
 *
 *     **`animal-squirrel.ts` and `animal-crocodile.ts` also spend it**, and the
 *     overlap is deliberate: reuse is house style. What makes this one neither of
 *     those is the paint. The squirrel wears it from the coat with the cat's own
 *     band 1 as a pale inner; this wears the SHELL dark and the inner tawny,
 *     which puts the ear on the mask rather than on the coat. It is the only part
 *     of a civet's mask this kit can actually place.
 *
 *   - **The snout is `tube-06`, the fox's muzzle, with Kenney's own upper band
 *     dark.** It is placed entirely by the donor transfer — joined at the cube's
 *     front face z = 0.625, sunk its own measured 0.000, so its centre recovers
 *     the fox's recorded z = 0.740710 and its height is the fox's own 0.757432.
 *     Band 7 is 14 triangles running the muzzle's **upper half** (local y -0.009
 *     to 0.150), and painted `mark` that is a dark bridge on a tawny muzzle for
 *     no geometry at all. `animal-badger.ts` found that cut and this species is
 *     the second to spend it; on a badger it is the front end of a face stripe,
 *     here it is the front end of a mask.
 *
 *   - **The nose is `box-10`, the cat's own nose-tip**, anchored with
 *     `on: 'snout'` so the builder puts it on the muzzle's placed front plane
 *     measured off the built vertices, rather than on an arithmetic this file
 *     would carry a stale copy of. Sunk its own measured 0.147004 — the mean over
 *     its two donors, the cat at 0.000 and the polar bear at 0.294 — so it beds
 *     into the muzzle rather than sitting on it.
 *
 *   - **THE TAIL IS `wedge-18` ON THE DONOR TRANSFER ALONE, AND ITS DARK TIP IS
 *     KENNEY'S OWN CUT.** Joined at this cube's rear face z = -0.625 and sunk its
 *     own measured 0.137977, its centre lands on **z = -0.826000, the bank's
 *     recorded offset for the shape** — solved for, then checked against a number
 *     that was not used in solving it. No spin, no stretch, no chosen coordinate
 *     anywhere in it.
 *
 *     The tiger's whip is the one thin rope in the bank that arrives PRE-SPLIT:
 *     band 3 is 64 of its 212 triangles and they occupy local y 0.266 to 0.523,
 *     which is **the third of its length furthest from the join** — the tip. Its
 *     root leaves the rump low at local y -0.523, so high local y is far from the
 *     body. Painted `mark`, that is a dark-tipped tail, which is the nearest this
 *     bank gets to a ringed one and it costs nothing.
 *
 *     **The overlap, said out loud.** `wedge-07` and `wedge-18` are the bank's
 *     only two thin ropes, identical to six decimals in every dimension and
 *     different only in mesh (306 raw vertices against 396) and in banding.
 *     `animal-salamander.ts` wears this one and `animal-mouse.ts`,
 *     `animal-newt.ts` and `animal-opossum.ts` wear its twin. What makes ours not
 *     the salamander's: the salamander paints it in one flat slot, because
 *     `wedge-07`'s single band 13 is all it has to give — this one is the shape
 *     chosen FOR its second band, and the tip is the reason it is here rather
 *     than the other.
 *
 *   - **THE BLOTCHES ARE FIVE PLACEMENTS OF `plate-10`, AND EVERY STATION IS THE
 *     CARD'S OWN RECORDED OFFSET OR A REFLECTION OF IT.** The cow's, dog's and
 *     giraffe's flank-patch card is 0.244 x 0.253 with `size[0]` exactly zero: a
 *     marking sheet, and it is given no stretch, no sink and one flat slot.
 *
 *     They sit on the pack's own flat-card shell, **0.635 from the hull's
 *     centre** — the bank's recorded x for the card, which is also `EYE_CARD_Z`
 *     on the other axis, and on this cube it is the same 0.010 of daylight the
 *     eye card gets. The bare donor transfer would join them AT 0.625, coplanar
 *     with the face and z-fighting it.
 *
 *     **The four flank spots are the four CORNERS of the flat face, exactly.**
 *     `box-03` cuts every edge and every corner, so each flat face is 0.625
 *     square: y 0.49375 to 1.11875, z -0.3125 to 0.3125. The card's own recorded
 *     station is (0.99675, -0.18606), and 0.99675 + 0.122 = 1.11875 and
 *     -0.18606 - 0.126440 = -0.31250 — Kenney sized this card to a 1.250 cube's
 *     flat face and put it in the corner. Its reflection in z is +0.18606; its
 *     reflection in y about the face's own centre 0.80625 is
 *     0.80625 - 0.19050 = **0.61575**, and 0.61575 - 0.122 = 0.49375, the face's
 *     own bottom edge. So all four cards land edge-on on all four corners and
 *     every one of the eight bounds is the face's own, to the four decimals the
 *     bank stores a position in. §3's "nothing floats" is not close here, it is
 *     exact.
 *
 *   - **The fifth placement is a DORSAL LINE, not more spots**, and it is the one
 *     that earns its keep, because **the island's camera looks DOWN at these
 *     animals** and a flank card is edge-on from up there. Most civets carry a
 *     dark crest along the spine; two cards on the MIDLINE, on the same flat-card
 *     shell at y = 0.80625 + 0.635 = 1.44125, at the card's own recorded z of
 *     0.18606 and its mirror, are as much of that line as the kit can lay down
 *     without two coplanar cards overlapping — at 0.372 apart and 0.253 across
 *     they clear each other by 0.119.
 *
 *     They are the same card turned onto the back, `{ axis: 'z', deg: 90 }`,
 *     which takes an `x +1` part to `y +1`: rule 4 as amended, baked into the
 *     copy's vertices, never a node transform. They are `single` rather than
 *     `pair` because a dorsal line is on the midline and a mirrored pair is not.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way — no second shape and no
 *     split triangle. The tiger's own mammal line made exact: §7 measured the
 *     pack's boundary wandering across 0.4808-0.5481 and 8/16 is the only point
 *     on the pack's 1/16 grid inside that zone, as well as this hull's own
 *     equator.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * There is no `collections/night-time.ts` record carrying colours for this
 * species, so the five below are the first ever proposed for it and every one is
 * marked UNREVIEWED. **Joe should look at them**, and particularly at how much
 * work `mark` is doing: the blotches, the dorsal line, the ears, the muzzle's
 * bridge, the nose and the tail's tip are all one slot, because on a civet they
 * are all one marking.
 *
 * **FLAGGED, and only for the marking.** Nothing else strained: nothing is
 * stretched, two features are spun and they say so, no part is authored, the hull
 * is the shell at its own size, and every join point is a recovered donor offset
 * or a reflection of one. Measured on the built model: **height 1.7100** inside
 * the pack's 1.43-2.02, feet on y = 0; **783 triangles** inside 422-951; **610
 * vertices** inside 405-1626 and 482 in the body inside 236-1114; **keep-out
 * 1.027** against the fox's own 1.15, spent almost entirely front to back (1.270
 * wide against 2.053 deep) because the tail trails and the muzzle reaches.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The pack's own flat-card shell: the bank's recorded x for `plate-10`. */
const CARD_SHELL = 0.635

/** `box-03`'s own centre — its recorded `offset[1]`. */
const HULL_MID_Y = 0.80625

/**
 * The card's own recorded station, and its reflection in y about the flat face's
 * own centre. Together with +/-`CARD_Z` they are the four corners of the 0.625
 * square face, each landing edge-on on the face's own edges.
 */
const CARD_HI_Y = 0.99675
const CARD_LO_Y = 2 * HULL_MID_Y - CARD_HI_Y   // 0.61575
const CARD_Z = 0.18606

/** The same shell on the other axis: 0.010 of daylight above the top face. */
const BACK_Y = HULL_MID_Y + CARD_SHELL

export const CIVET_ASSEMBLY = defineCreature('animal-civet', {
  /* NEW AND UNREVIEWED. Night Time has no collection record carrying colours for
   * this species, so these five are the first ever proposed for it. */
  palette: {
    coat: 0xb9a684,    // UNREVIEWED: tawny grey, the ground the blotches sit on
    belly: 0xece3d0,   // UNREVIEWED: the pale underside, and the sclera
    mark: 0x3b3630,    // UNREVIEWED: EVERY marking — blotches, dorsal line, ears,
                       // the muzzle's bridge, the nose and the tail's tip
    limb: 0x6d5f4c,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The tiger's mammal line made exact — the only 1/16 point inside the pack's
   * own measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* THE LONG LOW BODY, expressed the only honest way: by the wheelbase. 5/16
   * puts each leg's outer face on 0.500, a full chamfer's width inside the
   * hull's own 0.625, and it costs no keep-out because the legs stay inside the
   * body's own box. The shell is never scaled for length. */
  legs: { z: 0.3125 },

  /* The cat's own pointed ear, on the cat's own numbers — the transfer recovers
   * 1.404572 against the bank's recorded 1.404599. Painted onto the MASK rather
   * than the coat, with the cat's own band-1 inner disc left tawny. */
  ears: { part: 'wedge-06', paint: { base: 'mark', byBand: { 1: 'coat' } } },

  /* The fox's muzzle on the donor transfer, with Kenney's own upper band dark:
   * the front end of the mask, in one part and no geometry. */
  snout: { part: 'tube-06', paint: { base: 'coat', byBand: { 7: 'mark' } } },

  /* The cat's own nose-tip, on the muzzle's placed front plane. */
  nose: { part: 'box-10', paint: 'mark', on: 'snout' },

  /* THE TAIL. The tiger's whip on the donor transfer alone — joined at
   * z = -0.625, sunk its own 0.137977, centre recovered onto the bank's recorded
   * -0.826000 — and chosen over its identical twin `wedge-07` for its SECOND
   * BAND: band 3 is the third of its length furthest from the join, so painting
   * it dark is a dark-tipped tail at Kenney's own cut. */
  tail: { part: 'wedge-18', paint: { base: 'coat', byBand: { 3: 'mark' } } },

  /* THE COAT. Four flank spots on the four corners of the cube's own 0.625
   * square flat face, every station the card's recorded offset or a reflection
   * of it, every card landing edge-on on the face's own edge. Then two more on
   * the MIDLINE of the back, turned onto the top face, because the island's
   * camera looks down and a flank card is edge-on from up there. */
  extras: [
    { name: 'spot-fore-high', part: 'plate-10', paint: 'mark', kind: 'pair',
      at: [CARD_SHELL, CARD_HI_Y, CARD_Z] },
    { name: 'spot-aft-high', part: 'plate-10', paint: 'mark', kind: 'pair',
      at: [CARD_SHELL, CARD_HI_Y, -CARD_Z] },
    { name: 'spot-fore-low', part: 'plate-10', paint: 'mark', kind: 'pair',
      at: [CARD_SHELL, CARD_LO_Y, CARD_Z] },
    { name: 'spot-aft-low', part: 'plate-10', paint: 'mark', kind: 'pair',
      at: [CARD_SHELL, CARD_LO_Y, -CARD_Z] },
    { name: 'crest-fore', part: 'plate-10', paint: 'mark', kind: 'single',
      spin: [{ axis: 'z', deg: 90 }], at: [0, BACK_Y, CARD_Z] },
    { name: 'crest-aft', part: 'plate-10', paint: 'mark', kind: 'single',
      spin: [{ axis: 'z', deg: 90 }], at: [0, BACK_Y, -CARD_Z] },
  ],

  flag: 'THE MASKED FACE CANNOT BE EXPRESSED, and on a civet it is half the '
    + 'animal: a dark band across the eyes on a pale face. `Paint.patch` takes one '
    + 'number and that number is a HEIGHT — it paints ONE LEVEL BOUNDARY across a '
    + 'part and has no z term, so it cannot even say "the front is dark"; `byBand` '
    + 'can only cut where Kenney already cut and `box-03` has one band; and rule 3 '
    + 'is one mass, so there is no head to paint on its own. This is the badger\'s '
    + 'flag again, on a second animal, which is worth your eye as a pattern rather '
    + 'than as one species. THE RINGED TAIL is missing for the same reason — a ring '
    + 'is a repeating boundary along a part and nothing says one — but Kenney\'s own '
    + 'cut on the tiger\'s whip gives a DARK TIP, and that is what is here. WHAT DID '
    + 'LAND is the blotched coat: ten real marking cards from six placements, four '
    + 'pairs on the four corners of the cube\'s own flat flank and two down the '
    + 'spine where the island\'s camera can see them, every station the card\'s '
    + 'own recorded offset or a reflection of it. And the PALETTE IS UNREVIEWED — '
    + 'Night Time has no '
    + 'record that ever carried colours for this species. Nothing was authored to '
    + 'fake any of it.',
})
