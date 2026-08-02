/**
 * The glow-worm — Night Time's second insect, and the species in this whole
 * collection with the cleanest answer to the question the collection is built
 * around.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## THE BANK HAS NO WING, AND THIS ANIMAL HAS NO WINGS TO BE MISSING
 *
 * `wing` is declared in `PartRole` and occurs **zero times in all 94 records**.
 * That absence blocks the bat and the sugar glider, and `animal-firefly.ts`
 * carries the argument for why a firefly survives it. **This species does not
 * need the argument at all**, and the reason is the animal rather than the kit:
 *
 * > **The glowing British glow-worm is the FEMALE, and she is wingless.** She has
 * > no flight at all — she climbs a grass stem at dusk and glows from it. The
 * > male flies and does not glow. The animal a child is shown glowing is an
 * > animal that has no wings.
 *
 * So this is not a species built around a gap: it is a species for which the gap
 * is not there. **`Lampyris noctiluca` is a beetle whose adult female is
 * larviform** — she keeps the grub's soft segmented body all her life and never
 * grows wing cases — which is exactly the shape below and exactly why it is not
 * the firefly's shape. (Worth one clause so nobody later "corrects" it: the New
 * Zealand glow-worm, *Arachnocampa luminosa*, is not this animal at all. It is a
 * fungus gnat LARVA — a fly, not a beetle. This species is the British one.)
 *
 * The flag therefore does NOT claim a missing wing. It says what actually cannot
 * be said here, which is the segment marking; see below.
 *
 * ## WHAT SEPARATES THIS ANIMAL FROM THE FIREFLY, WHICH IS THE SAME INSECT
 *
 * They are one species at two life stages and they must not be one model. The two
 * files share the leg row and nothing else — **not one feature part in common**:
 *
 *   | | glow-worm | firefly |
 *   |---|---|---|
 *   | body | **five `box-11` segments**, a long ridged grub | one smooth shell, no segmentation |
 *   | hull | `box-03`, the CATERPILLAR'S own cube | `box-36`, the PANDA'S |
 *   | light | the last two segments, painted | `box-35` ring + `box-18` tip |
 *   | eyes | `plate-06`, the pack's SMALLEST | `plate-14`, the pack's BIGGEST |
 *   | antennae | none — a larviform female's are vestigial | `cone-01`, long |
 *
 * That is not decoration, it is the two lineages: **this animal is built out of
 * the caterpillar's kit and the firefly out of the panda's.** `box-11` is the
 * caterpillar's body segment, `plate-06` is the caterpillar's eye, `plate-03` is
 * the caterpillar's face card and `box-03` is the caterpillar's hull — so every
 * donor transfer below is a recovery of an arrangement Kenney actually built,
 * rather than a transfer across donors. `assembly-glow-worm.test.ts` asserts the
 * separation both ways round so neither species can drift into the other.
 *
 * ## Every number, and where it came from
 *
 *   - **THE HULL IS `box-03`**, the pack's default 1.250 cube and the shape the
 *     bee, the caterpillar and thirteen other donors wore. It is not mentioned in
 *     the definition, because it is what `defineCreature` gives a definition that
 *     says nothing.
 *
 *   - **THE SEGMENTS ARE `box-11`, THE CATERPILLAR'S OWN BODY SEGMENT, AND
 *     NOTHING HAD SPENT IT.** Five copies down the back, and they are the whole
 *     animal. Measured off its raw positions it is a HOOP and not a slab — no
 *     vertex comes nearer its own axis than 0.4594, the outer radius is 0.7910 —
 *     so worn concentric it is a raised ring around the body and its middle is
 *     open. Its attachment is `y +1` sunk 0.910269, which is the ONE condition
 *     under which a donor's burial transfers to a radial mount (the trap that cost
 *     the corn snake a rebuild), so joined at this hull's top face y = 1.43125 its
 *     centre lands on **y = 1.071493 — the bank's own recorded offset for the
 *     shape, to six decimals, arrived at without using it** — and 0.0786 of each
 *     ring stands proud of the back.
 *
 *   - **NO STRETCH, ON ANYTHING, AND THAT IS WORTH SAYING.** `box-11`'s bounding
 *     box is 1.4445 x 0.8769 x 0.4458 = 0.5647 against the hull's 1.9531, a ratio
 *     of **3.46** — clear of the 3 `assertAssembly` demands with nothing done to
 *     it. It is the only band in the bank that is. `box-04` is 2.40 (which is why
 *     the slow worm shrinks it), `box-35` is 2.18 (which is why the firefly thins
 *     it), `box-19` is 1.91 and `box-29` is 1.43. So this animal carries no
 *     stretch of any kind, uniform or otherwise — every part is Kenney's geometry
 *     at Kenney's size, which is the purest form of what rule 1 asks for.
 *
 *   - **FIVE SEGMENTS AT 0.250 SPACING, AND BOTH NUMBERS ARE SOLVED.** The
 *     stations are z = +0.500, +0.250, 0.000, -0.250 and -0.500 — the pack's own
 *     1/16 grid, four notches apart, symmetric about the body's own centre, which
 *     is where `box-11`'s donor wears its single copy.
 *
 *     The spacing is what makes this read as SEGMENTATION rather than as one
 *     smooth tube, and it is measured: the ring's flat top face runs z = -0.1159
 *     to +0.1159, so at 0.250 apart the five flat crests stand clear of one
 *     another by 0.018 while their chamfers interleave. Closer and they weld into
 *     a smooth back; further and they stop touching. The whole row reaches
 *     z = +/-0.7229, which overhangs a 1.250 hull by 0.098 at each end — a grub is
 *     longer than its own thorax, and this is that, honestly, without a stretch.
 *
 *   - **THE LIGHT IS THE LAST TWO SEGMENTS, PAINTED, AND THAT IS ANATOMY.**
 *     `Lampyris noctiluca`'s female carries her light organs on the underside of
 *     the last two abdominal segments and nowhere else. The two rearmost rings —
 *     z = -0.250 and z = -0.500 — take the `glow` slot and the front three take
 *     `segment`. This is `animal-mole.ts`'s own idiom: five copies placed as
 *     `extras` rather than as a `ridge`, for exactly the reason the mole does it,
 *     which is that a `ridge` paints every copy the same and this animal's whole
 *     point is that two of them are different.
 *
 *     **The `glow` colour is the firefly's own hex, deliberately.** Same insect,
 *     same lamp; a child should recognise the light across the two.
 *
 *   - **THE EYES ARE `plate-06`/`plate-07`, THE CATERPILLAR'S — THE SMALLEST IN
 *     THE PACK.** 0.330 x 0.276 against the default oval's 0.400 x 0.320 and the
 *     firefly's `plate-14` at 0.435 x 0.443. A larva's eyes are simple ocelli, a
 *     few dark points either side of the head, and it lives under leaf litter
 *     hunting snails by scent. Rule 5 makes the size absolute and unstretched, so
 *     "smallest in the pack" is a real claim rather than a scale: at the card's
 *     own recorded (0.227390, 0.939252) on the absolute `EYE_CARD_Z` = 0.6350.
 *
 *   - **The mouth is `plate-03`**, the caterpillar's own face card — the same
 *     shape the firefly wears, and the one part the two insects DO share, because
 *     it is the pack's only insect mouth and both donors wore it.
 *
 *   - **No antennae, no snout, no nose, no tail, and each absence is the animal.**
 *     A larviform female's antennae are vestigial stubs; her head retracts into the
 *     prothorax when she is disturbed; and a grub has no tail to speak of. The
 *     firefly's `cone-01` antennae are the loudest single thing separating the two
 *     silhouettes, and leaving them off here is what makes that separation real
 *     rather than stated.
 *
 *   - **The legs are never mentioned below**, because four `box-01` sunk 0.408163
 *     on the row at y = 0.18125 is what `defineCreature` gives a definition that
 *     says nothing. **Four and not six, and that is the pack's own answer for an
 *     insect**: Kenney drew a bee and a caterpillar and gave each of them four.
 *     A glow-worm larva does have six thoracic legs, all clustered at the front,
 *     and the kit's leg row is a single mirrored pair of stations — so six would
 *     be a placement nothing in the pack demonstrates, and it is not invented here.
 *
 *   - **The belly line is 6/16.** §7 measured the pack's mammal boundary wandering
 *     across 0.4808-0.5481; a larva's pale part is the venter only, so 0.375 is the
 *     nearest notch on the pack's own 1/16 grid below that zone.
 *
 * ## WHAT WAS CONSIDERED AND REFUSED
 *
 *   - **`legs: false`.** A grub reads as legless at 0.16 scale and the slow worm
 *     and the corn snake both show the kit can say it. Refused on rule 9's FLOOR,
 *     which is where a legless species dies: four `box-01` are 176 triangles and
 *     **128 built vertices**, and taking them out puts this animal at 356 against
 *     `MODEL_VERTS_MIN` 405. The segments could not pay it back without becoming
 *     a second mass. It is also wrong: a larviform female walks, which is the
 *     whole difference between her and a maggot.
 *   - **`box-35` as the lamp**, the panda's rear band. It is the firefly's, and if
 *     both animals wore it the collection would have one insect twice. The paint
 *     does the job here anyway, which is the better answer: a glow-worm's light is
 *     not a separate organ hanging off her, it is two of her own segments lit.
 *   - **`box-18` as a glowing tail tip.** Same reason — it is the firefly's second
 *     lamp part, and a grub has no protruding tail.
 *   - **A `ridge` instead of five `extras`.** A ridge would have been one line and
 *     would have mirrored copies onto the chamfers and flanks as well, which is
 *     §8's idiom for making a cubic back read ROUND. Refused because it paints
 *     every copy from one slot, and the two lit segments are the species.
 *
 * **FLAGGED**, for the segment marking and for the new palette — see below.
 * Nothing was strained. Measured on the built model: **718 triangles and 452
 * vertices** inside 422-951 and 405-1626 (body 324 inside 236-1114); height
 * **1.5099** inside 1.43-2.02, which is the pack's own floor plus the 0.0786 a
 * segment stands proud; feet on y = 0 exactly; widest 1.444 by 1.446, so keep-out
 * **0.723**, the smallest in this collection, against the fox's 1.15; fingerprint
 * `ba579cc94d23eee3`. Every part
 * at its own measured burial, on a station on the pack's own grid, at Kenney's own
 * size — **no stretch anywhere on this animal** — one mass, and nothing authored.
 */
import { defineCreature } from '../creature'
import { EYE_CARD_Z } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and the same point seven other pack hulls use. */
const HULL_MID_Y = 0.80625

/**
 * The hull's top face, which is the plane `box-11`'s `y +1` attachment names.
 *
 * The cube's own centre plus its own half-height. It is also `HEIGHT_FLOOR`
 * exactly, and that is not a coincidence — a bare cube on the standard leg row
 * measures 1.43125 because its bottom sits at `HULL_BOTTOM_Y` — but the two mean
 * different things and this file wants the face, not the floor.
 */
const HULL_TOP_Y = HULL_MID_Y + 0.625

/**
 * The five segment stations, front to back: +/-0.500, +/-0.250 and 0.000.
 *
 * Four notches apart on the pack's own 1/16 grid, symmetric about z = 0, which is
 * where `box-11`'s donor wears its single copy. The spacing is solved rather than
 * chosen: the ring's flat top face runs -0.1159 to +0.1159, so at 0.250 apart the
 * five crests clear one another by 0.018 while their chamfers interleave — closer
 * and the back welds smooth, further and the rings stop touching.
 */
const SEGMENT_Z = [0.5, 0.25, 0, -0.25, -0.5] as const

/** The two rearmost. `Lampyris noctiluca`'s light organs, and only those. */
const LIT = new Set([-0.25, -0.5])

export const GLOW_WORM_ASSEMBLY = defineCreature('animal-glow-worm', {
  /* NEW AND UNREVIEWED — nothing has ever carried a record for this species, so
   * these are the first colours ever proposed for it. The female is a soft warm
   * brown grub; brief §19 is "bright, never scary", so the lamp is the loudest
   * thing on her and the body is quiet under it. */
  palette: {
    coat: 0x8a7358,    // UNREVIEWED: the grub's soft warm brown
    belly: 0xefe0c2,   // UNREVIEWED: the pale underside, and the sclera
    segment: 0x6d5940, // UNREVIEWED: the three unlit body rings, a shade under the coat
    glow: 0xdcf37a,    // UNREVIEWED: THE LAMP — the firefly's own hex, on purpose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* A larva's pale part is the venter only. 6/16 is the nearest notch on the
   * pack's 1/16 grid below the 0.4808-0.5481 zone §7 measured for its mammals. */
  belly: 0.375,

  /* THE CATERPILLAR'S OWN EYE, and the smallest card in the pack: 0.330 x 0.276
   * against the firefly's `plate-14` at 0.435 x 0.443. A larva's eyes are simple
   * ocelli, and rule 5 makes the size absolute so this is a real claim rather
   * than a scale. At the card's own recorded height. */
  eyes: { part: 'plate-06' },

  /* THE ANIMAL. Five copies of the caterpillar's own body segment down the back,
   * each a hoop 1.4445 across standing 0.0786 proud of a 1.250 hull — which is
   * segmentation, and is the one thing the firefly must not have. Placed as
   * `extras` rather than as a `ridge` for `animal-mole.ts`'s reason: a ridge
   * paints every copy the same slot, and the two REAR rings are lit and the front
   * three are not. Nothing here is stretched, spun or sunk to a chosen number:
   * each is joined at the top face `box-11`'s own `y +1` attachment names, at its
   * own measured 0.910269 burial, on a station on the pack's 1/16 grid. */
  extras: [
    ...SEGMENT_Z.map((z, i) => ({
      name: `segment-${i}`,
      part: 'box-11',
      paint: LIT.has(z) ? 'glow' : 'segment',
      at: [0, HULL_TOP_Y, z] as [number, number, number],
    })),
    /* THE MOUTH. The caterpillar's own face card — the one part these two insects
     * share, because it is the pack's only insect mouth and both donors wore it.
     * At the height the bank recorded it and on the absolute eye-card plane. */
    {
      name: 'mouth',
      part: 'plate-03',
      paint: 'pupil',
      at: [0, 0.686849, EYE_CARD_Z] as [number, number, number],
    },
  ],

  flag: 'THE SEGMENT MARKING CANNOT BE EXPRESSED, and on a glow-worm it is the only '
    + 'pattern the animal has: each body ring carries a small pinkish-orange triangle at '
    + 'its two REAR CORNERS, so it reads as a brown grub with a double row of warm '
    + 'spots down its flanks. Measured, not assumed — `Paint.patch` takes one number and '
    + 'that number is a HEIGHT, so it paints one level boundary across a part and has no '
    + 'z or x term at all; `byBand` can only cut where Kenney already cut, and `box-11` '
    + 'has exactly ONE band across all 84 of its triangles, so there is no corner to send '
    + 'anywhere; and the bank has no card that could carry a spot at that size — its only '
    + 'marking cards are the cow\'s flank blotches, `plate-10` (0.244 x 0.253) and '
    + '`plate-11` (0.400 x 0.433), which are a third of a ring wide. So the spots are not '
    + 'awkward here, they are unsayable, and no geometry was invented to fake them. What '
    + 'IS here is the light, which matters more. NOTE that this species is NOT blocked on '
    + 'the missing `wing` the way the bat and the sugar glider are: the glowing British '
    + 'glow-worm is the FEMALE, and the female is genuinely WINGLESS — larviform for life, '
    + 'glowing from a grass stem, never flying — so there is no wing absent from this '
    + 'model. ALSO: NEW PALETTE, UNREVIEWED — the first glow-worm ever built and the first '
    + 'colours ever proposed for it, and the `glow` hex is deliberately the firefly\'s own, '
    + 'because it is the same insect and the same lamp. Whether it reads as LIGHT rather '
    + 'than as paint at tablet distance is a look, and Joe\'s.',
})
