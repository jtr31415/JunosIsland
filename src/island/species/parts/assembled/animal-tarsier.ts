/**
 * The tarsier's assembly, as a definition. Night Time's first of three
 * big-eyed nocturnal primates, and the one whose whole character is its eyes.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## The readability problem this species shares, and its share of the answer
 *
 * A tarsier, a bushbaby and an aye-aye are three small nocturnal primates with
 * enormous eyes, big ears and a long tail. **Built from the same parts they are
 * one animal three times**, so the three are separated structurally — a
 * different eye card, a different ear and a different tail each — in the same
 * way `garden.ts` separates its four small brown rodents.
 *
 * This one's share is **the biggest eye card in the pack, set CLOSE TOGETHER and
 * high, over the smallest ears of the three and a flat face with no muzzle at
 * all**. Read the three apart at pet scale: this one is all eyes and has nothing
 * on the front of its face; the bushbaby has tall thin flaps on the sides of its
 * head; the aye-aye has two round dishes half the width of its own body.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull is `box-33`, THE MONKEY's** — the pack drew one primate and this
 *     is its body, so all three of these animals wear it. §7 classifies it (a),
 *     "cube + 34": measured, it has 66 welded points against `box-03`'s 32, and
 *     the extra are the monkey's own cheek and face geometry around the front
 *     side edges. **Every number a placement needs off it is the cube's**: half
 *     extents 0.625 on all three axes, every flat face inset 0.3125, top face
 *     y = 1.43125, front z = 0.625, and its recorded offset is the cube's own
 *     `[0, 0.80625, 0]`. So every donor transfer below lands exactly where it
 *     would land on `box-03`, and the hull is not stretched — `hulls.ts` is
 *     explicit that taking one of the pack's ten authored shells is rule 1's
 *     purest case and not a stretch at all.
 *
 *   - **THE EYE CARD IS `plate-14`, THE PANDA's, AND IT IS THE BIGGEST IN THE
 *     PACK.** 0.435472 x 0.442601 against the default oval's 0.400 x 0.320 and
 *     the caterpillar's 0.330 x 0.276 — the whole eye range is 1.44x and this is
 *     its top. Nothing has spent it. It is also the only card in the pack built
 *     the other way round: measured, its **band 15 is the OUTER 40 triangles**
 *     (x +/-0.218, y +/-0.221) and band 3 the inner 17 (x -0.124 to 0.135,
 *     y -0.071 to 0.146). On every other card band 15 is a small pupil inside a
 *     large sclera. That inversion is the panda's black eye patch with the eye
 *     sitting inside it — and painted here it is a **huge dark eye with a warm
 *     centre**, which is the best a flat card can say about a night animal's
 *     eye. It was chosen for its size and the inversion came free.
 *
 *   - **`plate-04`, the cat's, was CONSIDERED AND REFUSED.** It is the pack's
 *     third-biggest card and its shape is right, but measured it carries **one
 *     band, 15, over all 34 triangles** — so every triangle of it would be
 *     painted the pupil grey, the card would read one texture row rather than
 *     two, and `assembly-assert.ts`'s "the eye card arrives pre-split" check
 *     fails on it by construction. Recorded here so the next builder does not
 *     helpfully reach for it.
 *
 *   - **The eyes are set CLOSE, not wide — 0.25, which is 4/16 and is solved.**
 *     The card is 0.435472 across, so two of them meet at x = +/-0.217736; 0.25
 *     is the nearest station on the pack's own 1/16 grid outside that, and it
 *     puts the pair at x 0.032 to 0.468 a side — **0.935 of the hull's 1.250
 *     width, with a 0.065 gap between them.** This is the one number here worth
 *     arguing about, because "eyes fill the whole face" sounds like eyes set
 *     WIDE and the anatomy is the opposite: a tarsier's orbits meet at a
 *     paper-thin septum, and moving the cards outward only opens the gap in the
 *     middle. Note it is NARROWER than the pack's own — the panda wears this card
 *     at 0.258676 and the default oval sits at 0.2625.
 *
 *   - **The eyes are lifted to y = 1.0, and it is the only chosen number in the
 *     file.** 16/16 on the pack's grid, 0.080 above the panda's own recorded
 *     0.920023, which puts the top of the card at 1.2213 against a crown at
 *     1.43125: a shallow forehead, which is what a tarsier has. Everything else
 *     about the card is unsayable — `EYE_CARD_Z` 0.6350, `sink: 0`, no stretch,
 *     rule 5.
 *
 *   - **The ears are `box-02`, the beaver's and the polar bear's small round
 *     button**, and the transfer is exact rather than an inference: both donors
 *     wear it on `box-03`, so joining it at THIS hull's top face y = 1.43125 and
 *     sinking its own measured 0.777778 puts its centre at **1.34375, the bank's
 *     recorded offset to six decimals** — a number not used to get there. That
 *     buries 0.245 of a 0.315 button, twice §3's own 0.125 floor, and leaves
 *     0.070 standing on the crown. Band 7 is its own forward disc, ten triangles,
 *     so the inner ear is two-tone for one `byBand` entry and no geometry.
 *
 *     Small is the point. The bushbaby's flap is 0.619 tall and the aye-aye's
 *     dish is 0.743 across; this is 0.315, the smallest ear either of them could
 *     have been given, and it is what stops three big-eyed primates reading as
 *     one animal.
 *
 *   - **NO SNOUT.** One absent line, and after the eyes it is the largest thing
 *     about the animal: a tarsier's face is flat, with the eyes set straight into
 *     it and effectively no muzzle in front. The other two of the three both wear
 *     `tube-01`, so this is the third axis of separation and it costs nothing.
 *
 *   - **The nose is `box-09`, the bunny's, straight on the hull's front face.**
 *     With no snout to hang it on, the donor transfer joins it at z = 0.625 sunk
 *     its own 0.000 and takes the bunny's own recorded y = 0.778404. It is the
 *     **shallowest of the pack's small nose buttons at 0.0798 deep** — the other
 *     four run 0.108 to 0.164, and the `tube-01` muzzle both siblings wear is
 *     0.1716 before its own reach is counted — which is exactly the nose a face
 *     with no muzzle wants. Deliberately not `wedge-10`, which is the better tip
 *     and reads as a tongue; Joe ruled on that by name on the hedgehog.
 *
 *   - **The tail is `wedge-07`, the cat's and the monkey's rope**, and the monkey
 *     is the donor of this animal's own hull, so the pair belongs together. It is
 *     the thinnest tail in the bank at 0.200 across against the fox brush's
 *     0.744, and 1.047 long, tapering to 0.522 of itself — a long thin tail, which
 *     is what a tarsier trails behind it as a prop.
 *
 *   - **Its height, 0.907957, is solved and is the shrew's own derivation.**
 *     `1.43125 - 1.046587/2`: the hull's top face less the tail's own half
 *     height, so **the tip lands exactly on the line of its own back**. The cat
 *     and the monkey both carry this tail UP, at the recorded 1.186701, and at
 *     that height the animal is a monkey with big eyes. Its root then emerges at
 *     y = 0.540, inside the flat rear face (0.494 to 1.119), so §3 is satisfied on
 *     the plane the join actually uses. Sunk the shape's own measured 0.159043 —
 *     0.088 units, which the per-mesh table calls THIN and which is the pack's
 *     own number for this shape and the mouse's too.
 *
 *   - **The legs are gathered: x = 0.3125, z = 0.1875.** A tarsier's hind limbs
 *     are longer than its head and body together and a leg is never resized —
 *     `box-01` is the pack's one leg, 86 instances, and rule 5's absolute-size
 *     discipline is the same argument. So the enormous hind limb is expressed by
 *     where the feet go: **0.3125 is the exact half-width of this hull's flat
 *     underside** (measured, the 0.625 square), the widest station whose join
 *     point is still on flat geometry, and 0.1875 is 3/16, the shortest wheelbase
 *     on the pack's grid. Feet gathered under the middle and set out to the edge
 *     is a crouched vertical clinger rather than a walking quadruped, and it is
 *     as near as a fixed leg row goes.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: the pack's own mammal
 *     line made exact — the only point on the 1/16 grid inside the 0.4808-0.5481
 *     zone Kenney's split-triangle boundary wanders across, and also this hull's
 *     own equator. No geometry, no split triangle.
 *
 * ## THE PALETTE IS NEW AND NOBODY HAS SIGNED IT OFF
 *
 * Night Time has never carried a collection record with colours in it, so these
 * five are the first ever proposed for this animal and every one of them is
 * UNREVIEWED. The `inner` slot does two jobs on purpose — naked ear skin and the
 * warm centre of the eye — because both are the same bare pinkish-amber on a
 * real tarsier and it keeps the palette to the five the Garden animals use.
 *
 * **FLAGGED, and only for the eyes.** Nothing else strained: 823 triangles
 * against the pack's 422-951, 572 vertices against 405-1626 (body 444 against
 * 236-1114), height 1.5012 inside 1.43-2.02, keep-out 0.898 against the fox's
 * 1.15, every part joined at a face its donor joined its own to, one mass, no
 * stretch anywhere on the animal, and nothing authored.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * Half `plate-14`'s own width, rounded out to the pack's 1/16 grid.
 *
 * The card is 0.435472 across, so two of them touch at 0.217736. 0.25 is the
 * first grid station outside that: the closest the pack's own units allow the
 * pair to sit without overlapping, which spans 0.935 of a 1.250 face.
 */
const EYE_X = 0.25

/** The hull's top face less the tail's own half height: the tip on its own back. */
const TAIL_Y = 1.43125 - 1.046587 / 2

export const TARSIER_ASSEMBLY = defineCreature('animal-tarsier', {
  palette: {
    coat: 0x9c8b74,    // UNREVIEWED: a grey-buff coat, the colour of bark at night
    belly: 0xe6dac4,   // UNREVIEWED: the pale underside and the incisor-free chin
    inner: 0xe0a45c,   // UNREVIEWED: naked ear skin, and the warm centre of the eye
    limb: 0x5b4b3b,    // UNREVIEWED: legs, the rope tail and the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The pack's ONE primate body. Its faces, chamfers and recorded offset are the
   * 1.250 cube's to the millimetre, so every transfer below is the cube's. */
  hull: 'box-33',

  /* The pack's own mammal belly line, made exact. One number, no geometry. */
  belly: 0.5,

  /* THE ENORMOUS HIND LIMB, said with the leg stations because a leg is never
   * resized. 0.3125 is the flat underside's own half width; 0.1875 is 3/16, the
   * shortest wheelbase on the pack's grid. A crouched clinger, not a walker. */
  legs: { x: 0.3125, z: 0.1875 },

  /* THE ANIMAL. The panda's card, the biggest in the pack and the only one whose
   * DARK band is the outer one — a huge dark eye with a warm centre. Set close
   * rather than wide (a tarsier's orbits meet), and lifted to 16/16, which is the
   * single chosen number in this file. */
  eyes: { part: 'plate-14', paint: 'inner', x: EYE_X, y: 1.0 },

  /* The smallest ear of the three, and the smallest either of the other two could
   * have had: the beaver's button, at the beaver's own recorded 1.34375 recovered
   * from this hull's top face, with its own forward disc painted for free. */
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'inner' } } },

  /* The cat's and the monkey's rope — the thinnest tail in the bank — carried at
   * the height that puts its tip on the line of its own back. */
  tail: { part: 'wedge-07', paint: 'limb', at: [0, TAIL_Y, -0.625] },

  /* NO SNOUT. A tarsier's face is flat and the other two of the three both wear
   * `tube-01`; this absent line is the third axis of separation. */

  /* The bank's shallowest volumetric nose, 0.0798 deep, straight on the face.
   * Not `wedge-10`: that one reads as a tongue. */
  nose: { part: 'box-09', paint: 'limb' },

  flag: 'THE EYES ARE AS BIG AS THIS PACK CAN SAY AND THEY ARE STILL TOO SMALL. A '
    + 'tarsier\'s eye is about as big as its own brain — an independent fact-check on '
    + '2 Aug refuted the commoner "bigger than its brain" as a repeated factoid, and '
    + '`joe/species-facts.json` carries this species FLAGGED for it — and each '
    + 'orbit is roughly half the width of its skull. The biggest eye card in the pack '
    + 'is `plate-14`, the panda\'s, at 0.435472 across — 34.8% of this hull\'s 1.250 '
    + 'width — and the pack\'s whole eye range is only 1.44x, from the caterpillar\'s '
    + '0.330 to that. There is nothing bigger, and rule 5 forbids stretching an eye '
    + 'card (the measurement agrees from the other side: 48 cards across 24 species '
    + 'vary 1.44x and sit at z = 0.6350 with standard deviation 0.0000). So they are '
    + 'set as CLOSE as the pack\'s own 1/16 grid allows instead — 0.25, against the '
    + 'panda\'s own 0.258676 — which spans 0.935 of the face with a 0.065 gap, and '
    + 'lifted to 16/16 for the low forehead. That is roughly three quarters of the '
    + 'animal rather than all of it, and closing the last quarter needs a bigger card '
    + 'than the pack drew. Nothing was stretched to fake it.',
})
